/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** Validates Platform-owned routing, internal authentication, human delegation, and fixed baseline identity. */
const assert = require('assert');
class NodicsError extends Error {
    constructor(code, message) {
        if (code && typeof code === 'object') {
            super(code.message);
            this.code = code.code;
            this.metadata = code.metadata;
            this.causes = code.causes;
        } else {
            super(message || code);
            this.code = code;
        }
    }
}
global.CLASSES = { NodicsError: NodicsError };
global.CONFIG = { get: key => key === 'axis' ? { initialization: { baselineCode: 'axis', target: {
    moduleName: 'cms', connectionName: 'wcmsStaged', connectionType: 'abstract', timeoutMs: 1000, maxAttempts: 2
} } } : undefined };
global.NODICS = { getInternalAuthToken: tenant => tenant === 'default' ? 'internal-token' : undefined };
let descriptor;
let moduleInvocationHandler = async value => value.responseSelector({ data: {
    readiness: value.methodName === 'POST' ? 'PUBLICATION_PENDING' : 'NOT_IMPORTED'
} });
global.SERVICE = { DefaultModuleService: {
    classifyTransportFailure: require('../../../../nodics.foundation/modules/nService/src/service/module/defaultModuleService').classifyTransportFailure,
    invokeModule: async value => {
        descriptor = value;
        return moduleInvocationHandler(value);
    }
} };
const service = require('../src/service/defaultAxisInitializationService');
const request = { tenant: 'default', authData: { principalId: 'admin', tokenType: 'access' },
    correlationId: 'correlation-1', initialization: { reason: 'Initialize Axis' } };
(async () => {
    assert.strictEqual((await service.status(request)).readiness, 'NOT_IMPORTED');
    assert.deepStrictEqual(descriptor.targetAuthority, { runtimeRole: 'WCMS_STAGED' });
    assert.strictEqual(descriptor.connectionName, 'wcmsStaged');
    assert.strictEqual(descriptor.apiName, '/publication/baselines/axis');
    assert.strictEqual(descriptor.header.Authorization, 'Bearer internal-token');
    assert.strictEqual((await service.initiate(request)).readiness, 'PUBLICATION_PENDING');
    assert.strictEqual(descriptor.methodName, 'POST');
    assert.strictEqual(descriptor.apiName, '/publication/baselines/axis/initiate');
    assert.strictEqual(descriptor.requestBody.requestedBy, 'admin');
    assert.strictEqual(descriptor.requestBody.reason, 'Initialize Axis');
    const configured = CONFIG.get;
    const tokenReader = NODICS.getInternalAuthToken;
    const tokenReads = [];
    const refreshes = [];
    const employee = Object.freeze({ tenant: 'new-enterprise',
        authData: Object.freeze({ principalId: 'enterprise-admin', tokenType: 'access' }),
        query: Object.freeze({ tenant: 'forged', authorityTenant: 'forged' }) });
    CONFIG.get = key => key === 'defaultTenant' ? 'project-authority' : configured(key);
    NODICS.getInternalAuthToken = tenant => {
        tokenReads.push(tenant);
        return tenant === 'project-authority' ? 'project-token' : 'employee-tenant-token';
    };
    SERVICE.DefaultInternalAuthenticationProviderService = {
        refreshInternalAuthTokens: async tenant => { refreshes.push(tenant); }
    };
    assert.strictEqual((await service.status(employee)).readiness, 'NOT_IMPORTED');
    assert.strictEqual(descriptor.header.Authorization, 'Bearer project-token');
    assert.strictEqual(descriptor.methodName, 'GET');
    assert.strictEqual(descriptor.requestBody, undefined);
    assert.deepStrictEqual(tokenReads, ['project-authority']);
    assert.deepStrictEqual(refreshes, ['project-authority']);
    assert.strictEqual((await service.initiate(employee)).readiness, 'PUBLICATION_PENDING');
    assert.strictEqual(descriptor.header.Authorization, 'Bearer employee-tenant-token');
    assert.strictEqual(descriptor.requestBody.requestedBy, 'enterprise-admin');
    assert.deepStrictEqual(tokenReads, ['project-authority', 'new-enterprise']);
    assert.deepStrictEqual(refreshes, ['project-authority', 'new-enterprise']);
    assert.strictEqual(employee.tenant, 'new-enterprise');
    NODICS.getInternalAuthToken = tenant => tenant === 'new-enterprise' ? 'employee-tenant-token' : undefined;
    await assert.rejects(service.status(employee), error => error.code === 'AXIS_INITIALIZATION_INTERNAL_AUTH_UNAVAILABLE');
    delete SERVICE.DefaultInternalAuthenticationProviderService;
    CONFIG.get = configured;
    NODICS.getInternalAuthToken = tokenReader;
    moduleInvocationHandler = async () => {
        let error = new Error('A data release import is already running');
        error.code = 'ERR_IMP_00003';
        error.status = 400;
        error.remoteResponse = { code: 'ERR_IMP_00003', message: 'A data release import is already running' };
        throw error;
    };
    await assert.rejects(async () => service.initiate(request), error => {
        assert.strictEqual(error.code, 'ERR_BOF_00085');
        assert.strictEqual(error.metadata.targetMessage, 'A data release import is already running');
        assert.deepStrictEqual(error.causes, [
            { code: 'ERR_IMP_00003', message: 'A data release import is already running' }
        ]);
        return true;
    });
    await assert.rejects(async () => service.status(Object.assign({}, request, { authData: { principalId: 'service', tokenType: 'service' } })),
        error => error.code === 'AXIS_INITIALIZATION_HUMAN_REQUIRED');
    for (const transportFailure of [{ code: 'EOPENBREAKER' }, { code: 'ECONNREFUSED' }, { code: 'REMOTE_HTTP_503', httpStatus: 503 }]) {
        moduleInvocationHandler = async () => {
            const error = new Error('Opaque provider diagnostic');
            error.code = 'ERR_SYS_00000';
            error.metadata = { transportFailure };
            throw error;
        };
        await assert.rejects(service.status(request), error => {
            assert.strictEqual(error.code, 'ERR_BOF_00083');
            assert.strictEqual(error.metadata.targetCode, transportFailure.code);
            assert.strictEqual(error.message, 'Axis initialization target is temporarily unavailable.');
            assert.strictEqual(error.causes, undefined);
            return true;
        });
    }
    for (const status of [400, 401, 403, 409, 500]) {
        moduleInvocationHandler = async () => {
            const error = new Error('Remote service circuit is open');
            error.code = 'ERR_AUTH_00001';
            error.status = status;
            throw error;
        };
        await assert.rejects(service.status(request), error => error.code === 'ERR_BOF_00085');
    }
    console.log('Axis initialization service validated');
})().catch(error => { console.error(error); process.exit(1); });
