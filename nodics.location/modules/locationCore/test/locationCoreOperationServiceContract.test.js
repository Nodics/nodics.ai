/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('node:assert/strict');

const service = require('../src/service/defaultLocationOperationService');

function validLocation(overrides) {
    return Object.assign({
        code: 'loc-001',
        name: { en: 'Main Store' },
        categoryCode: 'STORE',
        typeCode: 'RETAIL_STORE',
        latitude: 25.2048,
        longitude: 55.2708,
        addressRef: { moduleName: 'profile', schemaName: 'address', code: 'address-001' },
        sourceRef: { moduleName: 'store', schemaName: 'store', code: 'store-001' }
    }, overrides || {});
}

let calls = [];
global.CLASSES = { NodicsError: class NodicsError extends Error { constructor(code, message) { super(message); this.code = code; } } };
global.SERVICE = {
    DefaultLocationService: {
        save: request => { calls.push({ operation: 'save', request: request }); return Promise.resolve({ result: request.model }); },
        update: request => { calls.push({ operation: 'update', request: request }); return Promise.resolve({ affected: 1, request: request }); },
        get: request => { calls.push({ operation: 'get', request: request }); return Promise.resolve({ result: [] }); }
    }
};

let model = service.model(validLocation({ latitude: '12.34', longitude: '56.78' }));
assert.strictEqual(model.latitude, 12.34);
assert.strictEqual(model.longitude, 56.78);
assert.deepStrictEqual(model.visibility, { audiences: ['BACKOFFICE'] });
assert.strictEqual(model.status, 'DRAFT');
assert.strictEqual(model.revision, 0);

assert.throws(() => service.model(validLocation({ latitude: 91 })), /latitude must be a number/);
assert.throws(() => service.model(validLocation({ longitude: 181 })), /longitude must be a number/);
assert.throws(() => service.model(validLocation({ coordinates: [55.2708, 25.2048] })), /coordinates must be separate latitude and longitude/);
assert.throws(() => service.model(validLocation({ tenant: 'default' })), /Tenant is runtime context/);
assert.throws(() => service.model(validLocation({ postalCode: '560001' })), /Profile address/);
assert.throws(() => service.model(validLocation({ addressRef: undefined })), /addressRef reference is required/);
assert.throws(() => service.model(validLocation({ sourceRef: { moduleName: 'store', schemaName: 'store', code: 'store-001', tenant: 'default' } })), /sourceRef must not encode tenant/);

(async function run() {
    calls = [];
    await service.create({ tenant: 'runtimeTenant', authData: { principalId: 'admin' }, payload: validLocation() });
    assert.strictEqual(calls[0].operation, 'save');
    assert.strictEqual(calls[0].request.tenant, 'runtimeTenant');
    assert.strictEqual(calls[0].request.model.latitude, 25.2048);
    assert.strictEqual(calls[0].request.model.longitude, 55.2708);
    assert.strictEqual(calls[0].request.model.tenant, undefined);

    calls = [];
    await service.update({ tenant: 'runtimeTenant', params: { locationCode: 'loc-001' }, payload: validLocation({ code: 'ignored' }) });
    assert.strictEqual(calls[0].operation, 'update');
    assert.deepStrictEqual(calls[0].request.query, { code: 'loc-001' });

    calls = [];
    await service.search({ tenant: 'runtimeTenant', query: { tenant: 'bad', categoryCode: 'STORE', unknown: 'ignored', limit: 500 } });
    assert.strictEqual(calls[0].operation, 'get');
    assert.deepStrictEqual(calls[0].request.query, { categoryCode: 'STORE' });
    assert.deepStrictEqual(calls[0].request.searchOptions, { limit: 100 });

    console.log('location core operation service contract passed');
}()).catch(error => {
    console.error(error);
    process.exitCode = 1;
});
