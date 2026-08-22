/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module backoffice/test/backofficeApplicationInitializationContract @description Protects profile qualification, human initiation, projection, and fixed Staged routing. */
const assert = require('node:assert/strict');
const service = require('../src/service/defaultBackofficeApplicationInitializationService');
const routes = require('../src/router/routers').backoffice.applicationInitialization;

class NodicsError extends Error { constructor(code, message) { super(message); this.code = code; } }
global.CLASSES = { NodicsError };
global.CONFIG = { get: key => key === 'backofficeApplicationInitialization' ? { profiles: { nexus: {
    code: 'nexus', type: 'WEBSITE_BUNDLE', owner: 'nexusData', applicationCode: 'nexus', siteCode: 'nexusCorporateSite',
    baselineCode: 'nexus', target: { moduleName: 'cms', connectionName: 'wcmsStaged', connectionType: 'abstract' }
}, frameworkdocs: {
    code: 'frameworkdocs', type: 'DOCUMENTATION_BUNDLE', owner: 'nodics.docs', applicationCode: 'axis',
    siteCode: 'nodicsDocumentationSite', baselineCode: 'frameworkdocs', contentPackCode: 'nodicsDocumentation',
    target: { moduleName: 'cms', connectionName: 'wcmsStaged', connectionType: 'abstract' }
} } } : undefined };
global.NODICS = { getInternalAuthToken: () => 'service-token' };
global.SERVICE = { DefaultModuleService: {
    buildRequest: request => request,
    fetch: async request => ({ data: { readiness: 'IMPORTED', releaseCode: 'nexusData:nexusCorporateSite',
        releaseVersion: '0.0.0', releaseStatus: 'CURRENT' }, request })
} };

(async () => {
    let status = await service.status('nexus', { tenant: 'default', authData: { principalId: 'admin' } });
    assert.strictEqual(status.owner, 'nexusData');
    assert.strictEqual(status.siteCode, 'nexusCorporateSite');
    assert.deepStrictEqual(status.allowedActions, ['INITIALIZE']);
    assert.throws(() => service.initiate('nexus', { tenant: 'default', authData: { principalId: 'svc', tokenType: 'service' } }),
        error => error.code === 'ERR_BOF_00082');
    assert.throws(() => service.status('../unsafe', { tenant: 'default', authData: {} }), error => error.code === 'ERR_BOF_00080');
    assert.strictEqual(routes.applicationInitializationStatus.permission, 'backoffice.application.initialization.view');
    assert.strictEqual(routes.initiateApplicationInitialization.permission, 'backoffice.application.initialization.initiate');
    let contentPackRequest;
    SERVICE.DefaultModuleService.fetch = async request => {
        contentPackRequest = request;
        return { data: { code: 'nodicsDocumentation', state: 'NOT_INSTALLED' } };
    };
    assert.strictEqual((await service.contentPackStatus('frameworkdocs', { tenant: 'default', authData: { principalId: 'admin' } })).state,
        'NOT_INSTALLED');
    assert.strictEqual(contentPackRequest.connectionName, 'wcmsStaged');
    assert.strictEqual(contentPackRequest.moduleName, 'system');
    assert.strictEqual(contentPackRequest.apiName, '/internal/content-packs/nodicsDocumentation');
    await service.installContentPack('frameworkdocs', { tenant: 'default', requestId: 'request-1', authData: { principalId: 'admin' } });
    assert.strictEqual(contentPackRequest.methodName, 'POST');
    assert.strictEqual(contentPackRequest.apiName, '/internal/content-packs/nodicsDocumentation/imports');
    assert.throws(() => service.installContentPack('frameworkdocs', { tenant: 'default', authData: { principalId: 'svc', tokenType: 'service' } }),
        error => error.code === 'ERR_BOF_00082');
    assert.strictEqual(routes.applicationContentPackStatus.permission, 'backoffice.application.initialization.view');
    assert.strictEqual(routes.installApplicationContentPack.permission, 'backoffice.application.initialization.initiate');
    SERVICE.DefaultModuleService.fetch = async () => ({ data: { readiness: 'ROLLED_BACK', releaseCode: 'nexusData:nexusCorporateSite',
        releaseVersion: '0.0.0', releaseStatus: 'CURRENT' } });
    assert.deepStrictEqual((await service.status('nexus', { tenant: 'default', authData: { principalId: 'admin' } })).allowedActions,
        ['INITIALIZE'], 'A rolled-back release must advertise its governed resubmission path');
    SERVICE.DefaultModuleService.fetch = async () => ({ data: { readiness: 'RETIRED', releaseCode: 'nexusData:nexusCorporateSite',
        releaseVersion: '0.0.0', releaseStatus: 'CURRENT' } });
    assert.deepStrictEqual((await service.status('nexus', { tenant: 'default', authData: { principalId: 'admin' } })).allowedActions,
        ['INITIALIZE'], 'A retired release must advertise its governed re-publication path');
    SERVICE.DefaultModuleService.fetch = async () => ({ data: { readiness: 'READY', releaseCode: 'nexusData:nexusCorporateSite',
        releaseVersion: '0.0.0', releaseStatus: 'UPDATE_AVAILABLE', publication: { state: 'ONLINE', previousOnlineVersion: 'v0' } } });
    assert.deepStrictEqual((await service.status('nexus', { tenant: 'default', authData: { principalId: 'admin' } })).allowedActions,
        ['INITIALIZE', 'ROLLBACK', 'RETIRE'], 'An Online baseline with changed source must expose governed refresh without hiding recovery actions');
    console.log('BackOffice application initialization contract validated');
})().catch(error => { console.error(error); process.exit(1); });
