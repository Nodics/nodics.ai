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
let releaseRoot = path.join(root, 'data', 'core-v001');
fs.mkdirSync(path.join(releaseRoot, 'headers'), { recursive: true });
fs.mkdirSync(path.join(releaseRoot, 'records'), { recursive: true });
fs.writeFileSync(path.join(releaseRoot, 'headers', 'header.js'), 'module.exports = {};\n');
fs.writeFileSync(path.join(releaseRoot, 'records', 'data.js'), 'module.exports = [];\n');
let files = {};
['records/data.js', 'headers/header.js'].forEach(file => {
    files[file] = crypto.createHash('sha256').update(fs.readFileSync(path.join(releaseRoot, file))).digest('hex');
});
fs.writeFileSync(path.join(root, 'data', 'manifest.json'), JSON.stringify({
    contractVersion: 2, module: 'testModule', sections: { 'core-v001': {
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
        sourceRoot: 'core-v001',
        files: Object.fromEntries(Object.entries(files).map(([name, hash]) => ['core-v001/' + name, hash]))
    } }
}));

global.CONFIG = { get: key => key === 'data' ? {
    dataReleases: {
        allowedContractVersions: [1, 2], maximumFilesPerRelease: 10, maximumModulesPerRun: 5,
        allowDowngrade: false, destinationEnforced: true, environmentClass: 'LOCAL',
        allowedDestinationRoles: ['WCMS_STAGED'],
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
        name: 'testModule', path: root, index: '60.99', parent: 'testGroup', canonicalIdentity: 'testGroup/testModule',
        metaData: { nodics: { displayName: 'Test Module' } }
    }),
    getSelectedEnvironmentName: () => 'testEnvironment'
};
let installations = [];
let importAttempts = 0;
let failNextImport = false;
let importedReleasePlans = [];
global.SERVICE = {
    DefaultDataInstallationService: {
        get: request => {
            let matched = installations.filter(item =>
                (!request.tenant || item.tenant === request.tenant) &&
                (!request.query.code || item.code === request.query.code));
            let pageSize = request.searchOptions && request.searchOptions.pageSize || 10;
            let pageNumber = request.searchOptions && request.searchOptions.pageNumber || 1;
            let skip = pageSize * (pageNumber - 1);
            return Promise.resolve({ result: matched.slice(skip, skip + pageSize) });
        },
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
            importedReleasePlans.push((request.dataReleasePlan || []).map(release => release.releaseCode));
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
    assert.strictEqual(catalogue.data[0].moduleIndex, '60.99');
    assert.strictEqual(catalogue.data[0].initialPublicationPolicy, 'ADMIN_INITIATED');
    assert.strictEqual(catalogue.data[0].publicationReview.entities[0].added, 2);
    assert.strictEqual(catalogue.data[0].publicationReview.postPublicationCapabilities[0].title, 'Open workspace');
    assert.strictEqual(catalogue.data[0].status, 'NOT_INSTALLED');
    assert.strictEqual(service.isDestinationCompatible(catalogue.data[0]), true);
    assert.strictEqual(service.isDestinationCompatible(Object.assign({}, catalogue.data[0], {
        destinationRole: 'PROCESS'
    })), false);

    let profiles = await service.getInitializationProfiles({ tenant: 'default' });
    assert.strictEqual(profiles.data.length, 1);
    assert.strictEqual(profiles.data[0].profileCode, 'testFoundation');
    assert.strictEqual(profiles.data[0].moduleIndex, '60.99');
    assert.strictEqual(profiles.data[0].destinationRole, 'WCMS_STAGED');
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

    installations.unshift(...Array.from({ length: 12 }, (item, index) => ({
        code: 'testEnvironment:default:noise' + index + ':core',
        releaseCode: 'noise' + index + ':core',
        dataType: 'core',
        version: '0.0.0',
        checksum: 'noise',
        status: 'CURRENT'
    })));
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

    const mixedSectionPlan = {
        releases: [
            { moduleName: 'multiSectionModule', releaseCode: 'multiSectionModule:current' },
            { moduleName: 'multiSectionModule', releaseCode: 'multiSectionModule:next' }
        ]
    };
    const executableSectionPlan = service.executablePlan(mixedSectionPlan, [
        { moduleName: 'multiSectionModule', releaseCode: 'multiSectionModule:current', status: 'CURRENT' },
        { moduleName: 'multiSectionModule', releaseCode: 'multiSectionModule:next', status: 'NOT_INSTALLED' }
    ]);
    assert.deepStrictEqual(executableSectionPlan.releases.map(release => release.releaseCode), ['multiSectionModule:next']);

    let batchRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-data-release-batch-'));
    let originalGetActiveModulesForBatch = global.NODICS.getActiveModules;
    let originalGetRawModuleForBatch = global.NODICS.getRawModule;
    try {
        ['core-v001', 'core-v002'].forEach(rootName => {
            fs.mkdirSync(path.join(batchRoot, 'data', rootName, 'headers'), { recursive: true });
            fs.mkdirSync(path.join(batchRoot, 'data', rootName, 'records'), { recursive: true });
            fs.writeFileSync(path.join(batchRoot, 'data', rootName, 'headers', rootName + 'Header.js'), 'module.exports = {};\n');
            fs.writeFileSync(path.join(batchRoot, 'data', rootName, 'records', rootName + 'Data.js'), 'module.exports = [];\n');
        });
        let section = rootName => {
            let sectionFiles = ['headers/' + rootName + 'Header.js', 'records/' + rootName + 'Data.js'].reduce((result, file) => {
                let releaseFile = rootName + '/' + file;
                result[releaseFile] = crypto.createHash('sha256')
                    .update(fs.readFileSync(path.join(batchRoot, 'data', releaseFile))).digest('hex');
                return result;
            }, {});
            return {
                kind: 'DATA_RELEASE', dataType: 'core', version: '0.0.0',
                description: rootName + ' batch release',
                owningDomain: 'batch.module', lifecycle: 'PUBLISHABLE',
                destinationRole: 'WCMS_STAGED', environmentScope: ['LOCAL'], sensitivity: 'PUBLIC',
                versioningPolicy: 'IMMUTABLE', publicationPolicy: 'REQUIRED',
                initialPublicationPolicy: 'ADMIN_INITIATED', removalPolicy: 'UNPUBLISH_OR_RETIRE',
                sourceRoot: rootName,
                files: sectionFiles
            };
        };
        fs.writeFileSync(path.join(batchRoot, 'data', 'manifest.json'), JSON.stringify({
            contractVersion: 2, module: 'batchModule', sections: {
                'core-v001': section('core-v001'),
                'core-v002': section('core-v002')
            }
        }));
        global.NODICS.getActiveModules = () => ['batchModule'];
        global.NODICS.getRawModule = moduleName => moduleName === 'batchModule' ?
            { name: 'batchModule', path: batchRoot, index: '61.1',
                metaData: { nodics: { displayName: 'Batch Module' } } } :
            originalGetRawModuleForBatch(moduleName);
        importedReleasePlans = [];
        let batchExecution = await service.execute({
            tenant: 'batch',
            releaseRequest: {
                dataType: 'core',
                releaseCodes: ['batchModule:core-v001', 'batchModule:core-v002'],
                expectedReleases: {
                    'batchModule:core-v001': '0.0.0',
                    'batchModule:core-v002': '0.0.0'
                }
            }
        });
        assert.deepStrictEqual(importedReleasePlans, [['batchModule:core-v001'], ['batchModule:core-v002']]);
        assert.strictEqual(batchExecution.data.releases.length, 2);
        assert.strictEqual(batchExecution.data.importRuns.length, 2);
        assert.strictEqual(installations.filter(item => item.tenant === 'batch' && item.status === 'CURRENT').length, 2);
    } finally {
        global.NODICS.getActiveModules = originalGetActiveModulesForBatch;
        global.NODICS.getRawModule = originalGetRawModuleForBatch;
        fs.rmSync(batchRoot, { recursive: true, force: true });
    }

    let orderedRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-data-release-order-'));
    let originalGetActiveModules = global.NODICS.getActiveModules;
    let originalGetRawModule = global.NODICS.getRawModule;
    try {
        fs.mkdirSync(path.join(orderedRoot, 'data', 'sample-v001', 'content', 'headers'), { recursive: true });
        fs.mkdirSync(path.join(orderedRoot, 'data', 'sample-v001', 'content', 'records'), { recursive: true });
        fs.writeFileSync(path.join(orderedRoot, 'data', 'sample-v001', 'content', 'headers', 'mediaHeader.js'), 'module.exports = {};\n');
        fs.writeFileSync(path.join(orderedRoot, 'data', 'sample-v001', 'content', 'records', 'mediaData.js'), 'module.exports = [];\n');
        fs.writeFileSync(path.join(orderedRoot, 'data', 'sample-v001', 'content', 'headers', 'componentHeader.js'), 'module.exports = {};\n');
        fs.writeFileSync(path.join(orderedRoot, 'data', 'sample-v001', 'content', 'records', 'componentData.js'), 'module.exports = [];\n');
        let orderedFiles = ['sample-v001/content/headers/mediaHeader.js', 'sample-v001/content/records/mediaData.js',
            'sample-v001/content/headers/componentHeader.js', 'sample-v001/content/records/componentData.js'].reduce((result, file) => {
            result[file] = crypto.createHash('sha256').update(fs.readFileSync(path.join(orderedRoot, 'data', file))).digest('hex');
            return result;
        }, {});
        let orderedSection = (description, files) => ({
            kind: 'DATA_RELEASE', dataType: 'sample', version: '0.0.0',
            description: description, owningDomain: 'ordered.domain', lifecycle: 'PUBLISHABLE',
            destinationRole: 'WCMS_STAGED', environmentScope: ['LOCAL'], sensitivity: 'PUBLIC',
            versioningPolicy: 'IMMUTABLE', publicationPolicy: 'REQUIRED',
            initialPublicationPolicy: 'ADMIN_INITIATED', removalPolicy: 'UNPUBLISH_OR_RETIRE',
            sourceRoot: 'sample-v001', files: files
        });
        fs.writeFileSync(path.join(orderedRoot, 'data', 'manifest.json'), JSON.stringify({
            contractVersion: 2, module: 'orderedModule', sections: {
                zMediaReference: orderedSection('Media references required before dependent components.', {
                    'sample-v001/content/headers/mediaHeader.js': orderedFiles['sample-v001/content/headers/mediaHeader.js'],
                    'sample-v001/content/records/mediaData.js': orderedFiles['sample-v001/content/records/mediaData.js']
                }),
                aComponentMedia: orderedSection('Component media depends on media references.', {
                    'sample-v001/content/headers/componentHeader.js': orderedFiles['sample-v001/content/headers/componentHeader.js'],
                    'sample-v001/content/records/componentData.js': orderedFiles['sample-v001/content/records/componentData.js']
                })
            }
        }));
        global.NODICS.getActiveModules = () => ['orderedModule'];
        global.NODICS.getRawModule = moduleName => moduleName === 'orderedModule' ?
            { name: 'orderedModule', path: orderedRoot, parent: 'orderedGroup',
                canonicalIdentity: 'orderedGroup/orderedModule' } :
            originalGetRawModule(moduleName);
        let orderedReleases = service.discoverReleases('sample');
        assert.deepStrictEqual(orderedReleases.map(release => release.sectionCode), ['zMediaReference', 'aComponentMedia']);
    } finally {
        global.NODICS.getActiveModules = originalGetActiveModules;
        global.NODICS.getRawModule = originalGetRawModule;
        fs.rmSync(orderedRoot, { recursive: true, force: true });
    }

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

    let headerDrivenRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-data-release-header-driven-'));
    let originalGetActiveModulesForHeader = global.NODICS.getActiveModules;
    let originalGetRawModuleForHeader = global.NODICS.getRawModule;
    try {
        fs.mkdirSync(path.join(headerDrivenRoot, 'data', 'sample-v001', 'headers'), { recursive: true });
        fs.mkdirSync(path.join(headerDrivenRoot, 'data', 'sample-v001', 'records'), { recursive: true });
        fs.writeFileSync(path.join(headerDrivenRoot, 'data', 'sample-v001', 'headers', 'sampleHeader.js'),
            "module.exports = { headerDrivenModule: { sampleItems: { options: { enabled: true, schemaName: 'item', operation: 'saveAll', dataFilePrefix: 'sampleItemData' }, query: { code: '$code' } } } };\n");
        fs.writeFileSync(path.join(headerDrivenRoot, 'data', 'sample-v001', 'records', 'sampleItemData.js'),
            "module.exports = { first: { code: 'sample-item' } };\n");
        let headerHash = crypto.createHash('sha256')
            .update(fs.readFileSync(path.join(headerDrivenRoot, 'data', 'sample-v001', 'headers', 'sampleHeader.js'))).digest('hex');
        fs.writeFileSync(path.join(headerDrivenRoot, 'data', 'manifest.json'), JSON.stringify({
            contractVersion: 2, module: 'headerDrivenModule', sections: { 'sample-v001': {
                kind: 'DATA_RELEASE', dataType: 'sample', version: '0.0.0',
                description: 'Header-driven sample release',
                owningDomain: 'header.driven', lifecycle: 'PUBLISHABLE',
                destinationRole: 'WCMS_STAGED', environmentScope: ['LOCAL'], sensitivity: 'PUBLIC',
                versioningPolicy: 'IMMUTABLE', publicationPolicy: 'REQUIRED',
                initialPublicationPolicy: 'ADMIN_INITIATED', removalPolicy: 'UNPUBLISH_OR_RETIRE',
                sourceRoot: 'sample-v001',
                files: { 'sample-v001/headers/sampleHeader.js': headerHash }
            } }
        }));
        global.NODICS.getActiveModules = () => ['headerDrivenModule'];
        global.NODICS.getRawModule = moduleName => moduleName === 'headerDrivenModule' ?
            { name: 'headerDrivenModule', path: headerDrivenRoot, index: '70.2' } :
            originalGetRawModuleForHeader(moduleName);
        let headerDrivenReleases = service.discoverReleases('sample');
        assert.strictEqual(headerDrivenReleases.length, 1);
        assert.deepStrictEqual(headerDrivenReleases[0].declaredFiles.sort(), [
            'sample-v001/headers/sampleHeader.js',
            'sample-v001/records/sampleItemData.js'
        ]);
    } finally {
        global.NODICS.getActiveModules = originalGetActiveModulesForHeader;
        global.NODICS.getRawModule = originalGetRawModuleForHeader;
        fs.rmSync(headerDrivenRoot, { recursive: true, force: true });
    }

    let declaredRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-data-release-declared-'));
    let originalGetActiveModulesForDeclared = global.NODICS.getActiveModules;
    let originalGetRawModuleForDeclared = global.NODICS.getRawModule;
    try {
        fs.mkdirSync(path.join(declaredRoot, 'data', 'init-v001', 'headers'), { recursive: true });
        fs.mkdirSync(path.join(declaredRoot, 'data', 'init-v001', 'records'), { recursive: true });
        fs.writeFileSync(path.join(declaredRoot, 'data', 'init-v001', 'headers', 'declaredHeader.js'),
            'module.exports = {};\n');
        fs.writeFileSync(path.join(declaredRoot, 'data', 'init-v001', 'records', 'runtimeEnumData.js'),
            "module.exports = [{ code: 'enum-backed', type: ENUMS.WorkflowActionType.MANUAL.key }];\n");
        let declaredFiles = ['init-v001/headers/declaredHeader.js', 'init-v001/records/runtimeEnumData.js']
            .reduce((result, file) => {
                result[file] = crypto.createHash('sha256')
                    .update(fs.readFileSync(path.join(declaredRoot, 'data', file))).digest('hex');
                return result;
            }, {});
        fs.writeFileSync(path.join(declaredRoot, 'data', 'manifest.json'), JSON.stringify({
            contractVersion: 2, module: 'declaredModule', sections: { 'init-v001': {
                kind: 'DATA_RELEASE', dataType: 'init', version: '0.0.0',
                description: 'Fully declared release with runtime-backed records',
                owningDomain: 'declaredModule', lifecycle: 'REFERENCE',
                destinationRole: 'WCMS_STAGED', environmentScope: ['ALL'], sensitivity: 'INTERNAL',
                versioningPolicy: 'NONE', publicationPolicy: 'NONE',
                initialPublicationPolicy: 'NONE', removalPolicy: 'RETAIN',
                sourceRoot: 'init-v001',
                files: declaredFiles
            } }
        }));
        global.NODICS.getActiveModules = () => ['declaredModule'];
        global.NODICS.getRawModule = moduleName => moduleName === 'declaredModule' ?
            { name: 'declaredModule', path: declaredRoot, index: '50.3',
                metaData: { nodics: { displayName: 'Declared Module' } } } :
            originalGetRawModuleForDeclared(moduleName);
        let declaredReleases = service.discoverReleases('init');
        assert.strictEqual(declaredReleases.length, 1);
        assert.strictEqual(declaredReleases[0].invalidManifest, undefined);
        assert.deepStrictEqual(declaredReleases[0].declaredFiles.sort(), Object.keys(declaredFiles).sort());
    } finally {
        global.NODICS.getActiveModules = originalGetActiveModulesForDeclared;
        global.NODICS.getRawModule = originalGetRawModuleForDeclared;
        fs.rmSync(declaredRoot, { recursive: true, force: true });
    }

    let folderOnlyRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-data-release-folder-only-'));
    let originalGetActiveModulesForFolder = global.NODICS.getActiveModules;
    let originalGetRawModuleForFolder = global.NODICS.getRawModule;
    try {
        fs.mkdirSync(path.join(folderOnlyRoot, 'data', 'core-v001', 'headers'), { recursive: true });
        fs.mkdirSync(path.join(folderOnlyRoot, 'data', 'core-v001', 'records'), { recursive: true });
        fs.writeFileSync(path.join(folderOnlyRoot, 'data', 'core-v001', 'headers', 'folderHeader.js'), 'module.exports = {};\n');
        fs.writeFileSync(path.join(folderOnlyRoot, 'data', 'core-v001', 'records', 'folderData.js'), 'module.exports = [];\n');
        global.NODICS.getActiveModules = () => ['folderOnlyModule'];
        global.NODICS.getRawModule = moduleName => moduleName === 'folderOnlyModule' ?
            { name: 'folderOnlyModule', path: folderOnlyRoot, index: '70.1',
                metaData: { nodics: { displayName: 'Folder Only Module' } } } :
            originalGetRawModuleForFolder(moduleName);
        let folderOnlyReleases = service.discoverReleases('core');
        assert.strictEqual(folderOnlyReleases.length, 1);
        assert.strictEqual(folderOnlyReleases[0].releaseCode, 'folderOnlyModule:core-v001');
        assert.strictEqual(folderOnlyReleases[0].version, '0.0.0');
        assert.strictEqual(folderOnlyReleases[0].destinationRole, 'WCMS_STAGED');
        assert.deepStrictEqual(folderOnlyReleases[0].declaredFiles.sort(), [
            'core-v001/headers/folderHeader.js',
            'core-v001/records/folderData.js'
        ]);
    } finally {
        global.NODICS.getActiveModules = originalGetActiveModulesForFolder;
        global.NODICS.getRawModule = originalGetRawModuleForFolder;
        fs.rmSync(folderOnlyRoot, { recursive: true, force: true });
    }

    fs.writeFileSync(path.join(releaseRoot, 'records', 'data.js'), 'module.exports = [1];\n');
    let updatedReleases = service.discoverReleases('core');
    assert.strictEqual(updatedReleases.length, 1);
    assert.strictEqual(updatedReleases[0].invalidManifest, undefined);
    assert.notStrictEqual(updatedReleases[0].checksum, installations.find(item => item.releaseCode === 'testModule:core-v001').checksum);
    catalogue = await service.getCatalogue({ tenant: 'default', dataType: 'core' });
    assert.strictEqual(catalogue.data[0].status, 'INVALID_RELEASE');
    assert.strictEqual(catalogue.data[0].invalidReason, undefined);
    await assert.rejects(() => service.preflight({
        tenant: 'default',
        releaseRequest: { dataType: 'core', modules: ['testModule'], expectedReleases: { testModule: '1.1.0' } }
    }), /content changed without a version change/);
    fs.rmSync(root, { recursive: true, force: true });
    console.log('Data release service contracts validated');
})().catch(error => {
    fs.rmSync(root, { recursive: true, force: true });
    console.error(error);
    process.exit(1);
});
