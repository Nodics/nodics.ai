/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** Validates bounded, authenticated, idempotent Staged-to-Process approval submission. */
const assert = require('assert');
class NodicsError extends Error { constructor(code, message) { super(message); this.code = code; } }
global.CLASSES = { NodicsError: NodicsError };
let role = 'STAGED';
global.CONFIG = { get: key => key === 'cms' ? { publication: { runtimeRole: role, workflow: { target: {
    moduleName: 'flowApi', connectionName: 'process', connectionType: 'abstract', timeoutMs: 1000, maxAttempts: 2
} } } } : undefined };
global.NODICS = { getInternalAuthToken: () => 'service-token' };
let descriptor;
global.SERVICE = { DefaultModuleService: { buildRequest: input => { descriptor = input; return input; },
    fetch: async () => ({ result: { instance: { code: 'approval-1' } } }) } };
const service = require('../src/service/publication/defaultCmsPublicationWorkflowService');
const request = { tenant: 'default', correlationId: 'correlation-1' };
const publication = { code: 'home-v2', revision: 4, sourceVersion: '0', siteCode: 'site', catalogCode: 'catalog' };
service.requestApproval(publication, request).then(result => {
    assert.strictEqual(result.instance.code, 'approval-1');
    assert.strictEqual(descriptor.connectionName, 'process');
    assert.strictEqual(descriptor.apiName, '/instances/publication-approval');
    assert.strictEqual(descriptor.idempotencyKey, 'home-v2:4');
    assert.strictEqual(descriptor.header.Authorization, 'Bearer service-token');
    role = 'ONLINE';
    assert.throws(() => service.requestApproval(publication, request), /only from CMS Staged/);
    console.log('CMS publication workflow submission validated');
}).catch(error => { console.error(error); process.exit(1); });
