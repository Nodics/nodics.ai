/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** Validates bounded internally authenticated Process-to-domain publication decision transport. */
const assert = require('assert');
class NodicsError extends Error { constructor(code, message) { super(message); this.code = code; } }
global.CLASSES = { NodicsError: NodicsError };
global.CONFIG = { get: key => key === 'process' ? { publicationDecisionCallback: { target: {
    moduleName: 'cms', connectionName: 'cmsStaged', connectionType: 'abstract', timeoutMs: 1000, maxAttempts: 2
} } } : undefined };
global.NODICS = { getInternalAuthToken: tenant => tenant === 'default' ? 'service-token' : undefined };
let descriptor;
global.SERVICE = { DefaultModuleService: {
    buildRequest: input => { descriptor = input; return input; },
    fetch: async () => ({ code: 'SUC_CMS_00000' })
} };
const service = require('../src/service/operation/defaultProcessPublicationDecisionCallbackService');

(async () => {
    let result = await service.applyPublicationDecision({ tenant: 'default' }, { context: {
        publicationCode: 'home-v2', publicationRevision: 4, correlationId: 'correlation-1'
    }, decision: { approved: true, reason: 'Ready' }, instance: {
        code: 'instance-1', definitionCode: 'cmsPublicationApproval', version: 1
    } });
    assert.strictEqual(result.status, 'COMPLETED');
    assert.strictEqual(descriptor.connectionName, 'cmsStaged');
    assert.strictEqual(descriptor.apiName, '/publication/process/decision');
    assert.strictEqual(descriptor.header.Authorization, 'Bearer service-token');
    assert.deepStrictEqual(Object.keys(descriptor.requestBody).sort(), ['approved', 'correlationId', 'expectedRevision',
        'processDefinitionCode', 'processInstanceCode', 'processVersion', 'publicationCode', 'reason'].sort());
    assert.throws(() => service.applyPublicationDecision({ tenant: 'default' }, { context: {}, decision: { approved: true } }),
        /context is invalid/);
    console.log('Process publication decision callback validated');
})().catch(error => { console.error(error); process.exit(1); });
