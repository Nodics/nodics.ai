/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nService/test/RuntimeRegistryResolverContract */
const assert = require('assert');
const resolver = require('../src/service/module/defaultRuntimeRegistryResolverService');

let selected = resolver.resolveFromOwners({
    moduleName: 'system',
    connectionName: 'wcmsStaged',
    targetAuthority: {
        server: 'wcmsStagedServer',
        runtimeRole: { code: 'WCMS_STAGED', publication: 'STAGED' }
    }
}, [
    { moduleName: 'system', instanceId: 'process-1', environment: 'kickoffLocal', server: 'processServer',
        runtimeRole: { code: 'PROCESS', publication: 'OPERATIONAL' }, endpoint: 'http://localhost:4330/nodics/system',
        clientCallable: true, state: 'UP', lastSeenAt: '2026-08-24T13:43:28.000Z' },
    { moduleName: 'system', instanceId: 'wcms-staged-1', environment: 'kickoffLocal', server: 'wcmsStagedServer',
        runtimeRole: { code: 'WCMS_STAGED', publication: 'STAGED' }, endpoint: 'http://localhost:4312/nodics/system',
        clientCallable: true, state: 'UP', lastSeenAt: '2026-08-24T13:43:20.000Z' }
]);

assert.strictEqual(selected.instanceId, 'wcms-staged-1');
assert.strictEqual(selected.server, 'wcmsStagedServer');
assert.strictEqual(selected.endpoint, 'http://localhost:4312/nodics/system');

console.log('Runtime registry resolver contract validated');
