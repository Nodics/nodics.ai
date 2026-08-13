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
} } } : undefined };
global.NODICS = { getInternalAuthToken: () => 'service-token' };
global.SERVICE = { DefaultModuleService: {
    buildRequest: request => request,
    fetch: async request => ({ data: { readiness: 'IMPORTED', releaseCode: 'nexusData:nexusCorporateSite',
        releaseVersion: '1.0.0', releaseStatus: 'CURRENT' }, request })
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
    console.log('BackOffice application initialization contract validated');
})().catch(error => { console.error(error); process.exit(1); });
