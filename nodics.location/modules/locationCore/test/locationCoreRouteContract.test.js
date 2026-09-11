/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('node:assert/strict');

const routes = require('../src/router/routers').locationCore.internal;
const controller = require('../src/controller/defaultLocationCoreController');

[
    ['createLocation', 'POST', '/locations', 'location.location.create'],
    ['updateLocation', 'PATCH', '/locations/:locationCode', 'location.location.update'],
    ['getLocation', 'GET', '/locations/:locationCode', 'location.location.read'],
    ['searchLocations', 'POST', '/locations/search', 'location.location.search']
].forEach(([name, method, key, permission]) => {
    assert(routes[name], `${name} route must exist`);
    assert.strictEqual(routes[name].method, method);
    assert.strictEqual(routes[name].key, key);
    assert.strictEqual(routes[name].permission, permission);
    assert.strictEqual(routes[name].apiExposure, 'locationInternal');
    assert.strictEqual(routes[name].controller, 'DefaultLocationCoreController');
    assert.strictEqual(routes[name].operation, name);
    assert.deepStrictEqual(routes[name].authTokenTypes, ['access', 'service']);
});

let captured;
global.FACADE = {
    DefaultLocationCoreFacade: {
        createLocation: request => { captured = request; return Promise.resolve({ ok: true }); }
    }
};

(async function run() {
    let response = await controller.createLocation({
        authData: { tenant: 'runtimeTenant', principalId: 'admin' },
        httpRequest: {
            params: { locationCode: 'loc-001' },
            query: { categoryCode: 'STORE' },
            body: { code: 'loc-001' },
            headers: { 'Idempotency-Key': 'idem-1', 'X-Correlation-Id': 'corr-1' }
        }
    });
    assert.deepStrictEqual(response, { data: { ok: true } });
    assert.strictEqual(captured.tenant, 'runtimeTenant');
    assert.deepStrictEqual(captured.params, { locationCode: 'loc-001' });
    assert.deepStrictEqual(captured.query, { categoryCode: 'STORE' });
    assert.deepStrictEqual(captured.payload, { code: 'loc-001' });
    assert.strictEqual(captured.idempotencyKey, 'idem-1');
    assert.strictEqual(captured.correlationId, 'corr-1');

    console.log('location core route contract passed');
}()).catch(error => {
    console.error(error);
    process.exitCode = 1;
});
