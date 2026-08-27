/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module import/test/contentPackService
 * @description Verifies disabled defaults, manifest and checksum validation,
 * source-safe staging, tenant-scoped import state, update detection, immutable
 * same-version releases, and downgrade rejection.
 */

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const serviceDefinition = require('../src/service/contentPack/defaultContentPackService');

function digest(value) {
    return crypto.createHash('sha256').update(value).digest('hex');
}

function createFixture() {
    let workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-content-pack-'));
    let nodicsHome = path.join(workspace, 'nodics');
    let repository = path.join(workspace, 'nodics.docs');
    let serverPath = path.join(nodicsHome, 'server');
    let generatedFile = path.join(repository, 'data/core/headers/contentHeader.js');
    fs.mkdirSync(path.dirname(generatedFile), { recursive: true });
    fs.mkdirSync(path.join(repository, 'data/core/data'), { recursive: true });
    fs.writeFileSync(generatedFile, 'module.exports = {};\n');
    fs.writeFileSync(
        path.join(repository, 'package.json'),
        JSON.stringify({ name: 'nodics.docs', version: '0.0.0' })
    );
    let relativeFile = 'core/headers/contentHeader.js';
    let manifest = {
        kind: 'CONTENT_PACK',
        contentPath: 'core',
        pack: 'nodics.docs',
        version: '1.0.0',
        generatedHashes: {
            [relativeFile]: digest(fs.readFileSync(generatedFile))
        }
    };
    fs.writeFileSync(
        path.join(repository, 'data/manifest.json'),
        JSON.stringify({ contractVersion: 2, module: 'nodics.docs', sections: { documentation: manifest } })
    );
    return {
        workspace,
        nodicsHome,
        repository,
        serverPath,
        generatedFile,
        manifest
    };
}

function createHarness(fixture, enabled) {
    let records = [];
    let config = {
        defaultTenant: 'default',
        data: {
            dataDirName: 'temp',
            contentPacks: {
                enabled: enabled,
                allowedContractVersions: [1, 2],
                cleanupStaging: true,
                stagingDirectory: 'import/content-packs',
                packs: {
                    nodicsDocumentation: {
                        enabled: true,
                        manifestPack: 'nodics.docs',
                        source: {
                            type: 'LOCAL_SIBLING',
                            repositoryName: 'nodics.docs',
                            contentPath: 'data/core',
                            manifestPath: 'data/manifest.json',
                            manifestSection: 'documentation'
                        },
                        updatePolicy: {
                            allowDowngrade: false,
                            sameVersionContentChange: 'REJECT'
                        },
                        presentation: {
                            title: 'Nodics documentation',
                            unavailableMessage: 'Unavailable',
                            disabledMessage: 'Disabled',
                            importAction: 'Import',
                            updateAction: 'Update',
                            retryAction: 'Retry'
                        }
                    },
                    customerProjectDocumentation: {
                        enabled: true,
                        source: {
                            type: 'LOCAL_PROJECT',
                            contentPath: 'data/core',
                            manifestPath: 'data/manifest.json',
                            manifestSection: 'documentation'
                        },
                        updatePolicy: {
                            allowDowngrade: false,
                            sameVersionContentChange: 'REJECT'
                        },
                        presentation: {
                            title: 'Customer project documentation',
                            unavailableMessage: 'Unavailable',
                            disabledMessage: 'Disabled',
                            importAction: 'Import',
                            updateAction: 'Update',
                            retryAction: 'Retry'
                        }
                    }
                }
            }
        }
    };
    global.CONFIG = {
        get: property => config[property]
    };
    global.NODICS = {
        getNodicsHome: () => fixture.nodicsHome,
        getServerPath: () => fixture.serverPath,
        getNodicsEnv: () => fixture.repository
    };
    global.CLASSES = {
        DataImportError: class DataImportError extends Error {
            constructor(code, message) {
                super(message);
                this.code = code;
            }
        }
    };
    global.SERVICE = {
        DefaultImportRunHistoryService: {
            getImportRunService: () => ({
                get: request => {
                    let matches = records.filter(record =>
                        record.tenant === request.tenant &&
                        Object.entries(request.query || {}).every(([key, value]) => record[key] === value)
                    );
                    return Promise.resolve({ result: matches });
                }
            })
        },
        DefaultImportService: {
            importLocalData: request => {
                assert.notStrictEqual(request.inputPath.rootPath, path.join(fixture.repository, 'data/core'));
                assert(fs.existsSync(path.join(request.inputPath.rootPath, 'headers/contentHeader.js')));
                records.push(Object.assign({ tenant: request.tenant }, request.importRun, {
                    status: 'COMPLETED'
                }));
                return Promise.resolve({ imported: true });
            }
        }
    };
    return {
        service: Object.assign({}, serviceDefinition, {
            activeImports: new Map(),
            recentCompletions: new Map()
        }),
        config,
        records
    };
}

(async () => {
    let fixture = createFixture();
    try {
        let disabled = createHarness(fixture, false);
        let disabledStatus = await disabled.service.getStatus({ packCode: 'nodicsDocumentation' });
        assert.strictEqual(disabledStatus.data.state, 'DISABLED');
        assert.deepStrictEqual(disabledStatus.data.allowedOperations, []);

        let harness = createHarness(fixture, true);
        await assert.rejects(
            harness.service.getStatus({ packCode: 'unknownPack' }),
            error => error.code === 'ERR_IMP_00004'
        );
        let initial = await harness.service.getStatus({
            packCode: 'nodicsDocumentation',
            tenant: 'tenant-a'
        });
        assert.strictEqual(initial.data.state, 'NOT_INSTALLED');
        assert.deepStrictEqual(initial.data.allowedOperations, ['IMPORT']);
        assert.strictEqual(
            harness.service.resolveRepositoryPath({ type: 'LOCAL_PROJECT' }),
            fixture.repository,
            'project-owned content packs must resolve from the active customer project'
        );
        assert.strictEqual(
            harness.service.resolveExpectedManifestPack(
                harness.service.resolvePackContext('customerProjectDocumentation'),
                fixture.repository
            ),
            'nodics.docs',
            'project-owned content packs must derive manifest identity from package.json'
        );

        let customerProjectStatus = await harness.service.getStatus({
            packCode: 'customerProjectDocumentation',
            tenant: 'tenant-a'
        });
        assert.strictEqual(customerProjectStatus.data.state, 'NOT_INSTALLED');

        let imported = await harness.service.importPack({
            packCode: 'nodicsDocumentation',
            tenant: 'tenant-a'
        });
        assert.strictEqual(imported.data.state, 'CURRENT');
        assert.strictEqual(imported.data.installedVersion, '1.0.0');
        assert.strictEqual(fs.readFileSync(fixture.generatedFile, 'utf8'), 'module.exports = {};\n');

        let current = await harness.service.getStatus({
            packCode: 'nodicsDocumentation',
            tenant: 'tenant-a'
        });
        assert.strictEqual(current.data.state, 'CURRENT');
        assert.deepStrictEqual(current.data.allowedOperations, []);

        harness.records.unshift({
            tenant: 'tenant-a',
            contentPackCode: 'nodicsDocumentation',
            contentPackVersion: '0.8.0',
            contentPackChecksum: 'older-release',
            status: 'COMPLETED',
            finishedAt: '2025-01-01T00:00:00.000Z'
        });
        current = await harness.service.getStatus({
            packCode: 'nodicsDocumentation',
            tenant: 'tenant-a'
        });
        assert.strictEqual(current.data.state, 'CURRENT');
        assert.strictEqual(current.data.installedVersion, '1.0.0');

        let selectedByCreated = harness.service.selectLatestInstalledRelease([
            {
                contentPackVersion: '1.0.0',
                finishedAt: '2026-01-01T00:00:00.000Z'
            },
            {
                contentPackVersion: '1.1.0',
                created: '2026-02-01T00:00:00.000Z'
            }
        ]);
        assert.strictEqual(selectedByCreated.contentPackVersion, '1.1.0');

        fs.writeFileSync(fixture.generatedFile, 'module.exports = { changed: true };\n');
        fixture.manifest.generatedHashes['core/headers/contentHeader.js'] =
            digest(fs.readFileSync(fixture.generatedFile));
        fs.writeFileSync(
            path.join(fixture.repository, 'data/manifest.json'),
            JSON.stringify({ contractVersion: 2, module: 'nodics.docs', sections: { documentation: fixture.manifest } })
        );
        await assert.rejects(
            harness.service.importPack({
                packCode: 'nodicsDocumentation',
                tenant: 'tenant-a'
            }),
            error => error.code === 'ERR_IMP_00003' && /without a version change/.test(error.message)
        );
        let invalidSameVersion = await harness.service.getStatus({
            packCode: 'nodicsDocumentation',
            tenant: 'tenant-a'
        });
        assert.strictEqual(invalidSameVersion.data.state, 'INVALID_RELEASE');
        assert.deepStrictEqual(invalidSameVersion.data.allowedOperations, []);

        fixture.manifest.version = '1.1.0';
        fs.writeFileSync(
            path.join(fixture.repository, 'data/manifest.json'),
            JSON.stringify({ contractVersion: 2, module: 'nodics.docs', sections: { documentation: fixture.manifest } })
        );
        let update = await harness.service.getStatus({
            packCode: 'nodicsDocumentation',
            tenant: 'tenant-a'
        });
        assert.strictEqual(update.data.state, 'UPDATE_AVAILABLE');
        assert.deepStrictEqual(update.data.allowedOperations, ['UPDATE']);

        harness.service.activeImports.set('tenant-a:nodicsDocumentation', {
            runId: 'running'
        });
        await assert.rejects(
            harness.service.importPack({
                packCode: 'nodicsDocumentation',
                tenant: 'tenant-a'
            }),
            error => error.code === 'ERR_IMP_00003' && /already running/.test(error.message)
        );
        harness.service.activeImports.delete('tenant-a:nodicsDocumentation');

        fixture.manifest.version = '0.9.0';
        fs.writeFileSync(
            path.join(fixture.repository, 'data/manifest.json'),
            JSON.stringify({ contractVersion: 2, module: 'nodics.docs', sections: { documentation: fixture.manifest } })
        );
        await assert.rejects(
            harness.service.importPack({
                packCode: 'nodicsDocumentation',
                tenant: 'tenant-a'
            }),
            error => error.code === 'ERR_IMP_00003' && /downgrade/.test(error.message)
        );

        let cleanupFixture = createFixture();
        let cleanupFailureHarness = createHarness(cleanupFixture, true);
        let originalRemove = require('fs-extra').remove;
        require('fs-extra').remove = () => Promise.reject(new Error('cleanup failed'));
        cleanupFailureHarness.service.LOG = { error: () => undefined };
        try {
            let cleanupResult = await cleanupFailureHarness.service.importPack({
                packCode: 'nodicsDocumentation',
                tenant: 'tenant-cleanup'
            });
            assert.strictEqual(cleanupResult.data.state, 'CURRENT');
        } finally {
            require('fs-extra').remove = originalRemove;
            fs.rmSync(cleanupFixture.workspace, { recursive: true, force: true });
        }

        console.log('Content-pack import and update contract validated');
    } finally {
        fs.rmSync(fixture.workspace, { recursive: true, force: true });
    }
})().catch(error => {
    console.error(error);
    process.exit(1);
});
