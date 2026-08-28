/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module backoffice/test/backofficeApplicationInitializationContract @description Protects profile qualification, human initiation, projection, and fixed Staged routing. */
const assert = require('node:assert/strict');
const controller = require('../src/controller/defaultBackofficeApplicationInitializationController');
const service = require('../src/service/defaultBackofficeApplicationInitializationService');
const routes = require('../src/router/routers').backoffice.applicationInitialization;

class NodicsError extends Error {
    constructor(code, message) {
        if (code && typeof code === 'object') {
            super(code.message);
            this.code = code.code;
            this.metadata = code.metadata;
            this.causes = code.causes;
        } else {
            super(message);
            this.code = code;
        }
    }
}
global.CLASSES = { NodicsError };
global.CONFIG = { get: key => key === 'backofficeApplicationInitialization' ? { projectCode: 'example.project', profiles: { nexus: {
    code: 'nexus', type: 'WEBSITE_BUNDLE', owner: 'nexus.web', applicationCode: 'nexus', siteCode: 'nexusCorporateSite',
    baselineCode: 'nexus', target: { moduleName: 'cms', connectionName: 'wcmsStaged', connectionType: 'abstract' }
}, frameworkdocs: {
    code: 'frameworkdocs', type: 'DOCUMENTATION_BUNDLE', owner: 'nodics.docs', applicationCode: 'axis',
    siteCode: 'nodicsDocumentationSite', baselineCode: 'frameworkdocs', contentPackCode: 'nodicsDocumentation',
    target: { moduleName: 'cms', connectionName: 'wcmsStaged', connectionType: 'abstract' }
}, nexusneedssetup: {
    code: 'nexusneedssetup', type: 'WEBSITE_BUNDLE', owner: 'nexus.web', applicationCode: 'nexus',
    siteCode: 'nexusCorporateSite', baselineCode: 'nexus',
    dataPackages: [
        { code: 'nexus.web:nexusCorporateMediaReferences', kind: 'Corporate media references', required: true,
            trigger: 'ACTIVATION', dataType: 'core', targetServer: 'wcmsStaged', targetRuntimeRole: 'WCMS_STAGED' }
    ],
    target: { moduleName: 'cms', connectionName: 'wcmsStaged', connectionType: 'abstract' }
}, agoraapparel: {
    code: 'agoraapparel', type: 'STOREFRONT_DOMAIN_BUNDLE', owner: 'agora.apparel',
    applicationCode: 'agora', siteCode: 'agoraApparelSite', baselineCode: 'agoraapparel',
    presentation: { requiredFunctionalModules: [
        { code: 'nodics.commerce', label: 'Commerce capability' }
    ] },
    dataPackages: [
        { code: 'agora.apparel:agoraApparelContentCatalog', kind: 'Storefront content', required: true,
            trigger: 'USER', dataType: 'sample', targetServer: 'wcmsStaged', targetRuntimeRole: 'WCMS_STAGED' },
        { code: 'agora.apparel:agoraApparelMediaAssets', type: 'MEDIA_ASSET_MANIFEST', kind: 'Storefront media files',
            required: true, trigger: 'USER', targetServer: 'wcmsStaged', targetRuntimeRole: 'WCMS_STAGED',
            manifestPath: 'nodics.platform/modules/backoffice/test/fixtures/applicationMediaAssets/assetManifest.js' },
        { code: 'agora.apparel:agoraApparelCommerceCatalog', kind: 'Commerce catalog', required: true,
            trigger: 'USER', dataType: 'sample', targetServer: 'commerceStaged', targetRuntimeRole: 'COMMERCE_STAGED' }
    ],
    target: { moduleName: 'cms', connectionName: 'wcmsStaged', connectionType: 'abstract' }
	} } } : key === 'servers' ? { wcmsStaged: { abstractEndpoint: { httpHost: '127.0.0.1', httpPort: 4312 } } } : undefined };
global.NODICS = { getInternalAuthToken: () => 'service-token' };
let moduleInvocationHandler = async request => ({ data: { readiness: 'IMPORTED', releaseCode: 'nexus.web:nexusCorporateSite',
    releaseVersion: '0.0.0', releaseStatus: 'CURRENT' }, request });
let operationSequence = [];
let functionalModuleRecords = {
    'nodics.commerce': { functionalModule: 'nodics.commerce', displayName: 'Commerce',
        registeredVersion: '0.0.0', registrationState: 'REGISTERED', enabled: true, runtimeState: 'ACTIVE' }
};
global.SERVICE = { DefaultModuleService: {
    invokeModule: request => moduleInvocationHandler(request)
}, DefaultFunctionalModuleCatalogueService: {
    getRecord: async (_project, functionalModule) => functionalModuleRecords[functionalModule]
} };
global.fetch = async () => {
    operationSequence.push('media:upload');
    return { ok: true, text: async () => '{}' };
};

(async () => {
    let status = await service.status('nexus', { tenant: 'default', authData: { principalId: 'admin' } });
    assert.strictEqual(status.owner, 'nexus.web');
    assert.strictEqual(status.siteCode, 'nexusCorporateSite');
    assert.deepStrictEqual(status.allowedActions, ['INITIALIZE']);
    await assert.rejects(service.initiate('nexus', { tenant: 'default', authData: { principalId: 'svc', tokenType: 'service' } }),
        error => error.code === 'ERR_BOF_00082');
    await assert.rejects(service.status('../unsafe', { tenant: 'default', authData: {} }), error => error.code === 'ERR_BOF_00080');
    assert.strictEqual(routes.applicationInitializationStatus.permission, 'backoffice.application.initialization.view');
    assert.strictEqual(routes.initiateApplicationInitialization.permission, 'backoffice.application.initialization.initiate');
    let prepared = controller.prepare({ requestId: 'request-controller', httpRequest: {
        params: { profileCode: 'nexus' },
        body: { forceRefresh: true, reason: 'Replay current development baseline', correlationId: 'corr-1' }
    } });
    assert.strictEqual(prepared.applicationInitialization.forceRefresh, true);
    assert.strictEqual(prepared.correlationId, 'corr-1');
    let initiateRequest;
    moduleInvocationHandler = async request => {
        initiateRequest = request;
        return { data: { readiness: 'PUBLICATION_PENDING', releaseCode: 'nexus.web:nexusCorporateSite',
            releaseVersion: '0.0.0', releaseStatus: 'CURRENT', publication: { state: 'PENDING_APPROVAL' } } };
    };
    await service.initiate('nexus', { tenant: 'default', requestId: 'request-initiate',
        applicationInitialization: { forceRefresh: true, reason: 'Replay current development baseline' },
        authData: { principalId: 'admin' } });
    assert.deepStrictEqual(initiateRequest.targetAuthority, { runtimeRole: 'WCMS_STAGED' });
    assert.strictEqual(initiateRequest.requestBody.forceRefresh, true);
    let preparationCalls = [];
    operationSequence = [];
    moduleInvocationHandler = async request => {
        preparationCalls.push(request);
        operationSequence.push(request.moduleName + ':' + request.apiName);
        if (request.moduleName === 'import') {
            return { data: { releases: request.requestBody.releaseCodes.map(code => ({
                releaseCode: code, version: '0.0.0',
                status: request.apiName.endsWith('/install') ? 'CURRENT' : 'NOT_INSTALLED'
            })) } };
        }
        return { data: { readiness: 'PUBLICATION_PENDING', releaseCode: 'agora.apparel:agoraApparelContentCatalog',
            releaseVersion: '0.0.2', releaseStatus: 'CURRENT', publication: { state: 'PENDING_APPROVAL' } } };
    };
    await service.initiate('agoraapparel', { tenant: 'default', requestId: 'request-agora',
        applicationInitialization: { reason: 'Initialize complete Agora Apparel application bundle' },
        authData: { principalId: 'admin' } });
    assert.deepStrictEqual(preparationCalls.map(call => call.apiName), [
        '/sample/validate',
        '/sample/validate',
        '/sample/install',
        '/sample/install',
        '/sample/validate',
        '/sample/validate',
        '/publication/baselines/agoraapparel/initiate'
    ]);
    assert.deepStrictEqual(preparationCalls.filter(call => call.moduleName === 'import').map(call => call.connectionName).sort(), [
        'commerceStaged', 'commerceStaged', 'commerceStaged', 'wcmsStaged', 'wcmsStaged', 'wcmsStaged'
    ]);
    assert.strictEqual(preparationCalls.at(-1).requestBody.forceRefresh, true,
        'A changed setup dependency must force a fresh baseline publication request');
    assert.deepStrictEqual(preparationCalls.at(-1).requestBody.mediaCodes, ['sample-product-media'],
        'Application-owned media assets must travel with the governed baseline publication request');
    assert(operationSequence.indexOf('media:upload') < operationSequence.indexOf('import:/sample/install'),
        'Application media must be uploaded before WCMS content imports bind media references');
    moduleInvocationHandler = async request => {
        if (request.moduleName === 'import') {
            return { data: { releases: request.requestBody.releaseCodes.map(code => ({
                releaseCode: code, version: '0.0.0', status: 'CURRENT'
            })) } };
        }
        return { data: { readiness: 'READY', releaseCode: 'agora.apparel:agoraApparelContentCatalog',
            releaseVersion: '0.0.2', releaseStatus: 'CURRENT', publication: { state: 'ONLINE' } } };
    };
    functionalModuleRecords = {
        'nodics.commerce': { functionalModule: 'nodics.commerce', displayName: 'Commerce',
            registeredVersion: '0.0.0', registrationState: 'AVAILABLE', enabled: false, runtimeState: 'ACTIVE' }
    };
    let blockedAgora = await service.status('agoraapparel', { tenant: 'default', requestId: 'request-agora-blocked',
        authData: { principalId: 'admin' } });
    assert.strictEqual(blockedAgora.readiness, 'BLOCKED',
        'An Online WCMS baseline must not make Agora ready while required Commerce capability is not registered');
    assert.deepStrictEqual(blockedAgora.allowedActions, [],
        'Blocked application setup must not advertise initialize, retire, or rollback actions as if the app is complete');
    assert.strictEqual(blockedAgora.preparation.status, 'BLOCKED');
    assert(blockedAgora.preparation.steps.some(step =>
        step.type === 'FUNCTIONAL_MODULE' && step.code === 'nodics.commerce' && step.status === 'NOT_REGISTERED'));
    functionalModuleRecords = {
        'nodics.commerce': { functionalModule: 'nodics.commerce', displayName: 'Commerce',
            registeredVersion: '0.0.0', registrationState: 'REGISTERED', enabled: true, runtimeState: 'ACTIVE' }
    };
    let unavailableReleaseCalls = [];
    moduleInvocationHandler = async request => {
        unavailableReleaseCalls.push(request);
        if (request.moduleName === 'import') {
            let error = new Error('Requested data release is unavailable');
            error.code = 'ERR_IMP_00004';
            throw error;
        }
        throw new Error('CMS publication target should not be called when application setup data is unavailable');
    };
    let blockedBySetupData = await service.status('agoraapparel', { tenant: 'default', requestId: 'request-agora-release-blocked',
        authData: { principalId: 'admin' } });
    assert.strictEqual(blockedBySetupData.readiness, 'BLOCKED');
    assert.strictEqual(blockedBySetupData.releaseCode, 'agora.apparel:agoraApparelContentCatalog');
    assert.strictEqual(blockedBySetupData.releaseVersion, 'pending setup');
    assert.strictEqual(blockedBySetupData.releaseStatus, 'PREPARATION_BLOCKED');
    assert.deepStrictEqual(blockedBySetupData.allowedActions, []);
    assert(unavailableReleaseCalls.every(call => call.moduleName === 'import'),
        'CMS publication target must not be called when required setup data is unavailable');
    assert(!/ERR_|internal error/i.test(blockedBySetupData.message),
        'Business setup projection must not expose low-level target error codes');
    assert(blockedBySetupData.preparation.steps.some(step =>
        step.type === 'DATA_RELEASE' && step.status === 'UNAVAILABLE' &&
        /Ask a developer to repair data release agora\.apparel:agoraApparelContentCatalog/.test(step.message) &&
        !/ERR_|internal error/i.test(step.message)));
    unavailableReleaseCalls = [];
    let blockedInitiateBySetupData = await service.initiate('agoraapparel', { tenant: 'default',
        requestId: 'request-agora-release-blocked-initiate',
        applicationInitialization: { reason: 'Initialize complete Agora Apparel application bundle' },
        authData: { principalId: 'admin' } });
    assert.strictEqual(blockedInitiateBySetupData.readiness, 'BLOCKED');
    assert(unavailableReleaseCalls.every(call => call.moduleName === 'import'),
        'Initiation must stop at preparation when required setup data is unavailable');
    assert.strictEqual(routes.initiateApplicationInitialization.requestBody.content['application/json'].schema.properties.forceRefresh.type, 'boolean');
    let contentPackRequest;
    moduleInvocationHandler = async request => {
        contentPackRequest = request;
        return request.responseSelector({ data: { code: 'nodicsDocumentation', state: 'NOT_INSTALLED' } });
    };
    assert.strictEqual((await service.contentPackStatus('frameworkdocs', { tenant: 'default', authData: { principalId: 'admin' } })).state,
        'NOT_INSTALLED');
    assert.strictEqual(contentPackRequest.connectionName, 'wcmsStaged');
    assert.deepStrictEqual(contentPackRequest.targetAuthority, { runtimeRole: 'WCMS_STAGED' });
    assert.strictEqual(contentPackRequest.moduleName, 'system');
    assert.strictEqual(contentPackRequest.apiName, '/internal/content-packs/nodicsDocumentation');
    await service.installContentPack('frameworkdocs', { tenant: 'default', requestId: 'request-1', authData: { principalId: 'admin' } });
    assert.strictEqual(contentPackRequest.methodName, 'POST');
    assert.strictEqual(contentPackRequest.apiName, '/internal/content-packs/nodicsDocumentation/imports');
    assert.throws(() => service.installContentPack('frameworkdocs', { tenant: 'default', authData: { principalId: 'svc', tokenType: 'service' } }),
        error => error.code === 'ERR_BOF_00082');
    assert.strictEqual(routes.applicationContentPackStatus.permission, 'backoffice.application.initialization.view');
    assert.strictEqual(routes.installApplicationContentPack.permission, 'backoffice.application.initialization.initiate');
    moduleInvocationHandler = async () => ({ data: { readiness: 'ROLLED_BACK', releaseCode: 'nexus.web:nexusCorporateSite',
        releaseVersion: '0.0.0', releaseStatus: 'CURRENT' } });
    assert.deepStrictEqual((await service.status('nexus', { tenant: 'default', authData: { principalId: 'admin' } })).allowedActions,
        ['INITIALIZE'], 'A rolled-back release must advertise its governed resubmission path');
    moduleInvocationHandler = async () => ({ data: { readiness: 'RETIRED', releaseCode: 'nexus.web:nexusCorporateSite',
        releaseVersion: '0.0.0', releaseStatus: 'CURRENT' } });
    assert.deepStrictEqual((await service.status('nexus', { tenant: 'default', authData: { principalId: 'admin' } })).allowedActions,
        ['INITIALIZE'], 'A retired release must advertise its governed re-publication path');
    moduleInvocationHandler = async () => ({ data: { readiness: 'PUBLICATION_PENDING', releaseCode: 'contentPack:nodicsDocumentation',
        releaseVersion: '0.16.5', releaseStatus: 'CURRENT', publication: { state: 'PENDING_APPROVAL' } } });
    assert.deepStrictEqual((await service.status('frameworkdocs', { tenant: 'default', authData: { principalId: 'admin' } })).allowedActions,
        [], 'A pending publication must not advertise a duplicate initialize action');
    moduleInvocationHandler = async () => ({ data: { readiness: 'READY', releaseCode: 'nexus.web:nexusCorporateSite',
        releaseVersion: '0.0.0', releaseStatus: 'UPDATE_AVAILABLE', publication: { state: 'ONLINE', previousOnlineVersion: 'v0' } } });
    assert.deepStrictEqual((await service.status('nexus', { tenant: 'default', authData: { principalId: 'admin' } })).allowedActions,
        ['INITIALIZE', 'ROLLBACK', 'RETIRE'], 'An Online baseline with changed source must expose governed refresh without hiding recovery actions');
    moduleInvocationHandler = async () => ({ data: { readiness: 'NOT_IMPORTED', releaseCode: 'contentPack:nodicsDocumentation',
        releaseVersion: '0.16.5', releaseStatus: 'INVALID_RELEASE' } });
    assert.deepStrictEqual((await service.status('frameworkdocs', { tenant: 'default', authData: { principalId: 'admin' } })).allowedActions,
        [], 'A same-version content-pack checksum conflict must not advertise initialize');
    let readyCalls = [];
    moduleInvocationHandler = async request => {
        readyCalls.push(request);
        if (request.moduleName === 'import') {
            return { data: { releases: [{ releaseCode: 'nexus.web:nexusCorporateMediaReferences',
                version: '0.0.0', status: 'NOT_INSTALLED' }] } };
        }
        return { data: { readiness: 'READY', releaseCode: 'nexus.web:nexusCorporateSite',
            releaseVersion: '0.0.7', releaseStatus: 'CURRENT', publication: { state: 'ONLINE' } } };
    };
    let readyButMissingSetup = await service.status('nexusneedssetup', { tenant: 'default', authData: { principalId: 'admin' } });
    assert.deepStrictEqual(readyButMissingSetup.allowedActions, ['INITIALIZE', 'RETIRE'],
        'An Online baseline with missing required setup data must still expose governed setup repair');
    assert.strictEqual(readyButMissingSetup.preparation.status, 'ACTION_REQUIRED');
    assert(readyCalls.some(call => call.moduleName === 'import' && call.apiName === '/core/validate'));
    moduleInvocationHandler = async () => {
        let error = new Error('CMS baseline release qualification failed');
        error.code = 'CMS_BASELINE_RELEASE_INVALID';
        error.responseCode = '409';
        throw error;
    };
    await assert.rejects(service.initiate('nexus', { tenant: 'default', requestId: 'request-2',
        authData: { principalId: 'admin' } }), error => {
        assert.strictEqual(error.code, 'ERR_BOF_00085');
        assert.strictEqual(error.metadata.targetCode, 'CMS_BASELINE_RELEASE_INVALID');
        assert.strictEqual(error.metadata.targetMessage, 'CMS baseline release qualification failed');
        assert.strictEqual(error.metadata.targetResponseCode, '409');
        assert.strictEqual(error.message,
            'Application setup data is invalid or unavailable. Ask a developer to repair the configured baseline release before retrying.');
        return true;
    });
    moduleInvocationHandler = async () => {
        let error = new Error('Failed due to some internal error');
        error.code = 'ERR_SYS_00000';
        error.responseCode = '500';
        error.remoteMessage = 'Content-pack import is already running';
        error.remoteResponse = { code: 'ERR_IMP_00003', message: 'Content-pack import is already running' };
        throw error;
    };
    await assert.rejects(service.initiate('nexus', { tenant: 'default', requestId: 'request-running',
        authData: { principalId: 'admin' } }), error => {
        assert.strictEqual(error.code, 'ERR_BOF_00085');
        assert.strictEqual(error.metadata.targetMessage, 'Content-pack import is already running');
        assert.strictEqual(error.message, 'Content-pack import is already running');
        assert.deepStrictEqual(error.causes, [
            { code: 'ERR_IMP_00003', message: 'Content-pack import is already running' }
        ]);
        return true;
    });
    moduleInvocationHandler = async () => {
        throw new Error('Transport target returned an invalid release');
    };
    await assert.rejects(service.initiate('nexus', { tenant: 'default', requestId: 'request-3',
        authData: { principalId: 'admin' } }), error => {
        assert.strictEqual(error.code, 'ERR_BOF_00085');
        assert.strictEqual(error.message,
            'Application setup data is invalid or unavailable. Ask a developer to repair the configured baseline release before retrying.');
        assert.strictEqual(error.metadata.targetMessage, 'Transport target returned an invalid release');
        return true;
    });
    console.log('BackOffice application initialization contract validated');
})().catch(error => { console.error(error); process.exit(1); });
