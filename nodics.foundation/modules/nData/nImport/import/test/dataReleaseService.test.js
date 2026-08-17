/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

/**
 * @module import/test/dataReleaseService
 * @description Validates discovery, preflight, installation projection, immutable version selection, disabled types, and fail-safe checksum projection.
 * @layer test
 * @owner import
 */
let root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-data-release-'));
let releaseRoot = path.join(root, 'data', 'core');
fs.mkdirSync(path.join(releaseRoot, 'headers'), { recursive: true });
fs.mkdirSync(path.join(releaseRoot, 'data'), { recursive: true });
fs.writeFileSync(path.join(releaseRoot, 'headers', 'header.js'), 'module.exports = {};\n');
fs.writeFileSync(path.join(releaseRoot, 'data', 'data.js'), 'module.exports = [];\n');
let files = {};
['data/data.js', 'headers/header.js'].forEach(file => {
    files[file] = crypto.createHash('sha256').update(fs.readFileSync(path.join(releaseRoot, file))).digest('hex');
});
fs.writeFileSync(path.join(root, 'data', 'manifest.json'), JSON.stringify({
    contractVersion: 2, module: 'testModule', sections: { core: {
        kind: 'DATA_RELEASE', dataType: 'core', version: '1.1.0',
        displayName: 'Test Core Release',
        description: 'Test core release',
        owningDomain: 'test.domain', lifecycle: 'PUBLISHABLE', destinationRole: 'WCMS_STAGED',
        environmentScope: ['LOCAL'], sensitivity: 'PUBLIC', versioningPolicy: 'IMMUTABLE',
        publicationPolicy: 'REQUIRED', initialPublicationPolicy: 'ADMIN_INITIATED',
        removalPolicy: 'UNPUBLISH_OR_RETIRE',
        publicationReview: {
            title: 'Publish test release', summary: 'Review the immutable test release before publication.',
            sourceRole: 'WCMS_STAGED', targetRole: 'WCMS_ONLINE', siteCode: 'testSite', catalogCode: 'testCatalog',
            impactMessage: 'The test experience becomes available Online after approval.',
            rollbackMessage: 'A previous Online release can be restored when one exists.',
            entities: [{ type: 'page', label: 'Pages', total: 2, added: 2, updated: 0, unchanged: 0, removed: 0 }],
            postPublicationCapabilities: [{ title: 'Open workspace', description: 'Use the published test workspace.' }]
        },
        files: Object.fromEntries(Object.entries(files).map(([name, hash]) => ['core/' + name, hash]))
    } }
}));

global.CONFIG = { get: key => key === 'data' ? {
    dataReleases: {
        allowedContractVersions: [1, 2], maximumFilesPerRelease: 10, maximumModulesPerRun: 5,
        allowDowngrade: false,
        initializationProfiles: { testFoundation: { enabled: true, label: 'Test foundation',
            description: 'Install the test foundation.', completionMessage: 'The test foundation is ready.',
            steps: [{ dataType: 'init' }, { dataType: 'core' }] } },
        types: { init: { enabled: true, operatorExecution: true }, core: { enabled: true, operatorExecution: true }, sample: { enabled: false } }
    }
} : key === 'defaultTenant' ? 'default' : key === 'runtimeRole' ?
    { code: 'WCMS_STAGED', publication: 'STAGED' } : undefined };
global.NODICS = {
    getActiveModules: () => ['testModule'],
    getRawModule: () => ({
        name: 'testModule', path: root, parent: 'testGroup', canonicalIdentity: 'testGroup/testModule',
        metaData: { nodics: { displayName: 'Test Module' } }
    }),
    getSelectedEnvironmentName: () => 'testEnvironment'
};
let installations = [];
let importAttempts = 0;
let failNextImport = false;
global.SERVICE = {
    DefaultDataInstallationService: {
        get: request => Promise.resolve({ result: installations.filter(item => !request.query.code || item.code === request.query.code) }),
        save: request => { installations.push(request.model); return Promise.resolve(request.model); },
        update: request => {
            let index = installations.findIndex(item => item.code === request.query.code);
            installations[index] = request.model;
            return Promise.resolve(request.model);
        }
    },
    DefaultImportService: {
        importCoreData: request => {
            importAttempts++;
            if (failNextImport) {
                failNextImport = false;
                return Promise.reject(new Error('controlled import failure'));
            }
            request.importRun = { runId: request.options.validateOnly ? 'validate-run' : 'install-run' };
            return Promise.resolve({ validationOnly: request.options.validateOnly });
        }
    }
};

const service = require('../src/service/release/defaultDataReleaseService');
const routers = require('../src/router/routers');

(async function () {
    const releaseRoutes = routers.import.dataReleases;
    ['preflightInit', 'preflightCore', 'preflightSample', 'executeInit', 'executeCore', 'executeSample'].forEach(code => {
        const schema = releaseRoutes[code].requestBody.content['application/json'].schema;
        assert(schema.properties.releaseCodes, code + ' must publish the explicit releaseCodes selector');
        assert(schema.properties.expectedReleases, code + ' must publish immutable expected-release qualification');
    });
    let discovered = service.discoverReleases();
    assert.strictEqual(discovered.length, 1);
    assert.strictEqual(discovered[0].dataType, 'core');
    assert.strictEqual(discovered[0].lifecycle, 'PUBLISHABLE');
    assert.strictEqual(discovered[0].destinationRole, 'WCMS_STAGED');

    let catalogue = await service.getCatalogue({ tenant: 'default', dataType: 'core' });
    assert.strictEqual(catalogue.data.length, 1);
    assert.strictEqual(catalogue.data[0].displayName, 'Test Core Release');
    assert.strictEqual(catalogue.data[0].initialPublicationPolicy, 'ADMIN_INITIATED');
    assert.strictEqual(catalogue.data[0].publicationReview.entities[0].added, 2);
    assert.strictEqual(catalogue.data[0].publicationReview.postPublicationCapabilities[0].title, 'Open workspace');
    assert.strictEqual(catalogue.data[0].status, 'NOT_INSTALLED');

    let profiles = await service.getInitializationProfiles({ tenant: 'default' });
    assert.strictEqual(profiles.data.length, 1);
    assert.strictEqual(profiles.data[0].profileCode, 'testFoundation');
    assert.strictEqual(profiles.data[0].destinationRole, 'STAGED');
    assert.deepStrictEqual(profiles.data[0].steps.map(step => step.dataType), ['init', 'core']);
    assert.strictEqual(profiles.data[0].steps[1].releases[0].status, 'NOT_INSTALLED');
    let profileValidation = await service.runInitializationProfile({ tenant: 'default',
        httpRequest: { params: { profileCode: 'testFoundation' } } }, false);
    assert.strictEqual(profileValidation.data.mode, 'VALIDATE');
    assert.strictEqual(profileValidation.data.results[0].skipped, true);
    assert.strictEqual(profileValidation.data.results[1].validation.importExecuted, false);
    await assert.rejects(() => service.runInitializationProfile({ tenant: 'default', authData: { permissions: [] },
        httpRequest: { params: { profileCode: 'testFoundation' } } }, true), /permission is missing/);

    failNextImport = true;
    await assert.rejects(() => service.runInitializationProfile({ tenant: 'default',
        authData: { permissions: ['import.core.run'] },
        httpRequest: { params: { profileCode: 'testFoundation' } } }, true), /controlled import failure/);
    catalogue = await service.getCatalogue({ tenant: 'default', dataType: 'core' });
    assert.strictEqual(catalogue.data[0].status, 'FAILED');

    let preflight = await service.preflight({
        tenant: 'default',
        releaseRequest: { dataType: 'core', modules: ['testModule'], expectedReleases: { testModule: '1.1.0' } }
    });
    assert.strictEqual(preflight.data.validation.validationOnly, true);
    assert.strictEqual(preflight.data.validation.importExecuted, false);
    assert.strictEqual(preflight.data.validation.skipped, false);
    assert.strictEqual(preflight.data.releases[0].status, 'FAILED');
    assert.strictEqual(installations.length, 1);
    assert.strictEqual(importAttempts, 1);

    let execution = await service.execute({
        tenant: 'default',
        releaseRequest: { dataType: 'core', modules: ['testModule'], expectedReleases: { testModule: '1.1.0' } }
    });
    assert.strictEqual(execution.data.importRun.runId, 'install-run');
    assert.strictEqual(execution.data.releases[0].status, 'CURRENT');
    assert.strictEqual(execution.data.releases[0].installedVersion, '1.1.0');
    assert.strictEqual(installations.length, 1);

    let profile = await service.getInitializationProfile({ tenant: 'default',
        httpRequest: { params: { profileCode: 'testFoundation' } } });
    assert.strictEqual(profile.data.status, 'CURRENT');
    let profileExecution = await service.runInitializationProfile({ tenant: 'default',
        authData: { permissions: ['import.core.run'] },
        httpRequest: { params: { profileCode: 'testFoundation' } } }, true);
    assert(profileExecution.data.results.every(result => result.skipped === true));

    catalogue = await service.getCatalogue({ tenant: 'default', dataType: 'core' });
    assert.strictEqual(catalogue.data[0].status, 'CURRENT');
    assert.strictEqual(catalogue.data[0].installedVersion, '1.1.0');

    preflight = await service.preflight({
        tenant: 'default',
        releaseRequest: { dataType: 'core', modules: ['testModule'], expectedReleases: { testModule: '1.1.0' } }
    });
    assert.strictEqual(preflight.data.releases[0].status, 'CURRENT');
    assert.strictEqual(preflight.data.validation.skipped, true);
    assert.strictEqual(preflight.data.validation.importExecuted, false);
    assert.strictEqual(importAttempts, 2);

    await assert.rejects(() => service.execute({
        tenant: 'default',
        releaseRequest: { dataType: 'core', modules: ['testModule'], expectedReleases: { testModule: '1.1.0' } }
    }), /already current/);

    await assert.rejects(() => service.preflight({
        tenant: 'default',
        releaseRequest: { dataType: 'core', modules: ['testModule'], expectedReleases: { testModule: '1.0.0' } }
    }), /changed after selection/);
    await assert.rejects(() => service.preflight({
        tenant: 'default', releaseRequest: { dataType: 'sample', modules: ['testModule'] }
    }), /disabled/);

    assert.throws(() => service.validateLifecycleMetadata({ owningDomain: 'test.domain' }, 'testModule', 'core'),
        /metadata is incomplete/);
    assert.throws(() => service.validateLifecycleMetadata({
        owningDomain: 'test.domain', lifecycle: 'PUBLISHABLE', destinationRole: 'ONLINE',
        environmentScope: ['LOCAL'], sensitivity: 'PUBLIC', versioningPolicy: 'IMMUTABLE',
        publicationPolicy: 'REQUIRED', initialPublicationPolicy: 'ADMIN_INITIATED',
        removalPolicy: 'UNPUBLISH_OR_RETIRE'
    }, 'testModule', 'core'), /must target a Staged runtime/);
    assert.throws(() => service.validatePublicationReview({ title: '<script>', entities: [] }, 'testModule', 'core'),
        /metadata is invalid|text is invalid/);

    fs.writeFileSync(path.join(releaseRoot, 'data', 'data.js'), 'module.exports = [1];\n');
    let invalidReleases = service.discoverReleases('core');
    assert.strictEqual(invalidReleases.length, 1);
    assert.strictEqual(invalidReleases[0].invalidManifest, true);
    catalogue = await service.getCatalogue({ tenant: 'default', dataType: 'core' });
    assert.strictEqual(catalogue.data[0].status, 'INVALID_RELEASE');
    assert.match(catalogue.data[0].invalidReason, /checksum validation failed/);
    assert.match(catalogue.data[0].invalidReason, /testModule\/core\/data\/data.js/);
    assert.match(catalogue.data[0].invalidReason, /expected .+\.\.\., actual .+\.\.\./);
    await assert.rejects(() => service.preflight({
        tenant: 'default',
        releaseRequest: { dataType: 'core', modules: ['testModule'], expectedReleases: { testModule: '1.1.0' } }
    }), /manifest is invalid/);
    fs.rmSync(root, { recursive: true, force: true });
    console.log('Data release service contracts validated');
})().catch(error => {
    fs.rmSync(root, { recursive: true, force: true });
    console.error(error);
    process.exit(1);
});
