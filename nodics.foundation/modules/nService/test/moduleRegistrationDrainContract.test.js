/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nService/test/moduleRegistrationDrainContract @description Verifies drain waits for an in-flight registration and prevents heartbeat resurrection. @layer test @owner nService */
const assert = require('node:assert/strict');
const test = require('node:test');
const definition = require('../src/service/module/defaultModuleRegistrationAgentService');
test('shutdown waits for registration before deregistration and prevents a late heartbeat', async () => {
    let finish;
    let entered;
    const gate = new Promise(resolve => { finish = resolve; });
    const started = new Promise(resolve => { entered = resolve; });
    const events = [];
    const service = { ...definition, _registered: [],
        getConfiguration: () => ({ enabled: true, heartbeatIntervalMs: 1, retryIntervalMs: 1 }),
        performRegistration: async () => {
            events.push('register-start'); entered(); await gate;
            events.push('register-finish'); service._registered = ['jobs']; return true;
        },
        deregister: async () => { assert.deepEqual(service._registered, ['jobs']); events.push('deregister'); }
    };
    service.start();
    // Keep the test alive while the production timer remains unref'ed.
    const keepAlive = setTimeout(() => {}, 1000);
    try {
        await started;
        assert.equal(service.start(), false);
        assert.equal(await service.runRegistration(), false);
        let drained = false;
        const stopping = service.stop(true).then(() => { drained = true; });
        await Promise.resolve();
        assert.equal(drained, false);
        finish();
        await stopping;
        await new Promise(resolve => setTimeout(resolve, 15));
        assert.deepEqual(events, ['register-start', 'register-finish', 'deregister']);
        assert.equal(service._timer, null);
        assert.equal(service._registrationPromise, null);
    } finally { clearTimeout(keepAlive); await service.stop(false); }
});
