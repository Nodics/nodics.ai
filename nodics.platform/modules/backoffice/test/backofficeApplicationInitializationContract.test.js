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
global.CONFIG = { get: key => key === 'backofficeApplicationInitialization' ? { profiles: { nexus: {
    code: 'nexus', type: 'WEBSITE_BUNDLE', owner: 'nexusData', applicationCode: 'nexus', siteCode: 'nexusCorporateSite',
    baselineCode: 'nexus', target: { moduleName: 'cms', connectionName: 'wcmsStaged', connectionType: 'abstract' }
}, frameworkdocs: {
    code: 'frameworkdocs', type: 'DOCUMENTATION_BUNDLE', owner: 'nodics.docs', applicationCode: 'axis',
    siteCode: 'nodicsDocumentationSite', baselineCode: 'frameworkdocs', contentPackCode: 'nodicsDocumentation',
    target: { moduleName: 'cms', connectionName: 'wcmsStaged', connectionType: 'abstract' }
	} } } : undefined };
global.NODICS = { getInternalAuthToken: () => 'service-token' };
let moduleInvocationHandler = async request => ({ data: { readiness: 'IMPORTED', releaseCode: 'nexusData:nexusCorporateSite',
    releaseVersion: '0.0.0', releaseStatus: 'CURRENT' }, request });
global.SERVICE = { DefaultModuleService: {
    invokeModule: request => moduleInvocationHandler(request)
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
    let prepared = controller.prepare({ requestId: 'request-controller', httpRequest: {
        params: { profileCode: 'nexus' },
        body: { forceRefresh: true, reason: 'Replay current development baseline', correlationId: 'corr-1' }
    } });
    assert.strictEqual(prepared.applicationInitialization.forceRefresh, true);
    assert.strictEqual(prepared.correlationId, 'corr-1');
    let initiateRequest;
    moduleInvocationHandler = async request => {
        initiateRequest = request;
        return { data: { readiness: 'PUBLICATION_PENDING', releaseCode: 'nexusData:nexusCorporateSite',
            releaseVersion: '0.0.0', releaseStatus: 'CURRENT', publication: { state: 'PENDING_APPROVAL' } } };
    };
    await service.initiate('nexus', { tenant: 'default', requestId: 'request-initiate',
        applicationInitialization: { forceRefresh: true, reason: 'Replay current development baseline' },
        authData: { principalId: 'admin' } });
    assert.deepStrictEqual(initiateRequest.targetAuthority, { runtimeRole: 'WCMS_STAGED' });
    assert.strictEqual(initiateRequest.requestBody.forceRefresh, true);
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
    moduleInvocationHandler = async () => ({ data: { readiness: 'ROLLED_BACK', releaseCode: 'nexusData:nexusCorporateSite',
        releaseVersion: '0.0.0', releaseStatus: 'CURRENT' } });
    assert.deepStrictEqual((await service.status('nexus', { tenant: 'default', authData: { principalId: 'admin' } })).allowedActions,
        ['INITIALIZE'], 'A rolled-back release must advertise its governed resubmission path');
    moduleInvocationHandler = async () => ({ data: { readiness: 'RETIRED', releaseCode: 'nexusData:nexusCorporateSite',
        releaseVersion: '0.0.0', releaseStatus: 'CURRENT' } });
    assert.deepStrictEqual((await service.status('nexus', { tenant: 'default', authData: { principalId: 'admin' } })).allowedActions,
        ['INITIALIZE'], 'A retired release must advertise its governed re-publication path');
    moduleInvocationHandler = async () => ({ data: { readiness: 'READY', releaseCode: 'nexusData:nexusCorporateSite',
        releaseVersion: '0.0.0', releaseStatus: 'UPDATE_AVAILABLE', publication: { state: 'ONLINE', previousOnlineVersion: 'v0' } } });
    assert.deepStrictEqual((await service.status('nexus', { tenant: 'default', authData: { principalId: 'admin' } })).allowedActions,
        ['INITIALIZE', 'ROLLBACK', 'RETIRE'], 'An Online baseline with changed source must expose governed refresh without hiding recovery actions');
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
        assert.match(error.message, /nexus baseline nexus/);
        return true;
    });
    moduleInvocationHandler = async () => {
        throw new Error('Transport target returned an invalid release');
    };
    await assert.rejects(service.initiate('nexus', { tenant: 'default', requestId: 'request-3',
        authData: { principalId: 'admin' } }), error => {
        assert.strictEqual(error.code, 'ERR_BOF_00085');
        assert.match(error.message, /Transport target returned an invalid release/);
        return true;
    });
    console.log('BackOffice application initialization contract validated');
})().catch(error => { console.error(error); process.exit(1); });
