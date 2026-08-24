/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** Validates Platform-owned routing, internal authentication, human delegation, and fixed baseline identity. */
const assert = require('assert');
class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }
global.CLASSES = { NodicsError: NodicsError };
global.CONFIG = { get: key => key === 'axis' ? { initialization: { baselineCode: 'axis', target: {
    moduleName: 'cms', connectionName: 'wcmsStaged', connectionType: 'abstract', timeoutMs: 1000, maxAttempts: 2
} } } : undefined };
global.NODICS = { getInternalAuthToken: tenant => tenant === 'default' ? 'internal-token' : undefined };
let descriptor;
global.SERVICE = { DefaultModuleService: {
    invokeModule: async value => {
        descriptor = value;
        return value.responseSelector({ data: { readiness: value.methodName === 'POST' ? 'PUBLICATION_PENDING' : 'NOT_IMPORTED' } });
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
    await assert.rejects(async () => service.status(Object.assign({}, request, { authData: { principalId: 'service', tokenType: 'service' } })),
        error => error.code === 'AXIS_INITIALIZATION_HUMAN_REQUIRED');
    console.log('Axis initialization service validated');
})().catch(error => { console.error(error); process.exit(1); });
