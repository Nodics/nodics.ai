/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @module profile/test/enterpriseWorkbenchSetupContract
 * @description Verifies Profile-owned Workbench setup, reference preservation and activation retry.
 * @layer test
 * @owner profile
 */
const assert = require('node:assert/strict');
const test = require('node:test');
const service = require('../src/service/enterprise/defaultEnterpriseManagementService');
const properties = require('../config/properties');
global.CONFIG = { get: name => name === 'enterpriseManagement' ? properties.enterpriseManagement : name === 'defaultTenant' || name === 'defaultEnterprise' ? 'default' : undefined };
global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
const authData = { tokenType: 'access', loginId: 'owner', entCode: 'default', userGroups: ['adminGroup'] };

test('an activation failure retries the same persisted enterprise without a second save', async () => {
    let stored;
    let saves = 0;
    let activations = 0;
    global.SERVICE = { DefaultEnterpriseService: {
        get: async request => ({ result: stored && request.query.code === stored.code ? [stored] : [] }),
        save: async request => { saves++; stored = { ...request.model }; return { result: stored }; },
    } };
    const owner = Object.assign({}, service, {
        ensureTenant: async () => {},
        activateEnterpriseRuntime: async () => { if (++activations === 1) throw new Error('Runtime temporarily unavailable'); },
    });
    const request = { authData, body: { code: 'example', name: 'Example', tenantCode: 'example', idempotencyKey: 'setup-1' } };
    await assert.rejects(owner.create(request, { addresses: ['office-1'] }), /temporarily unavailable/);
    const result = await owner.create(request, { addresses: ['office-1'] });
    assert.equal(result.code, 'example');
    assert.equal(saves, 1);
    assert.equal(activations, 2);
    assert.deepEqual(stored.addresses, ['office-1']);
    await assert.rejects(owner.create({ ...request, body: { ...request.body, name: 'Changed' } }, { addresses: ['office-1'] }), /request has changed/);
    await assert.rejects(owner.create({ ...request, authData: { ...authData, loginId: 'other' } }), /already exists/);
});

test('Profile setup uses the shared metadata owner without Workbench and keeps later-layer business fields', async () => {
    const fields = ['code', 'name', 'addresses', 'customerNumber'].map(name => ({ name, readOnly: false }));
    let received;
    global.NODICS = { getModule: () => ({}) };
    global.SERVICE = {
        DefaultSchemaUtilityService: { buildDescriptor: () => ({ fields, operations: ['create'] }),
            getIdempotencyKey: require('../../../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultSchemaUtilityService').getIdempotencyKey },
        DefaultEnterpriseService: { get: async () => ({ result: [{ code: 'example', name: 'Example', addresses: ['office'], setupRequestKey: 'private' }] }) },
    };
    const owner = Object.assign({}, service, { create: async (request, additional) => { received = { request, additional }; } });
    const result = await owner.createFromModel({ authData, idempotencyKey: 'request-1', payload: { model: { code: 'example', name: 'Example', addresses: ['office'], customerNumber: '123' } } });
    assert.equal(received.request.body.tenantCode, 'example');
    assert.deepEqual(received.additional, { addresses: ['office'], customerNumber: '123' });
    assert.equal(result.setupRequestKey, undefined);
    await assert.rejects(owner.createFromModel({ authData, payload: { model: { code: 'example', name: 'Example', tenant: 'another' } } }), /managed or unavailable/);
    await assert.rejects(owner.createFromModel({ authData: { ...authData, entCode: 'customer' }, payload: { model: { code: 'example', name: 'Example' } } }), /Platform Owner/);
    received = undefined;
    SERVICE.DefaultSchemaUtilityService.buildDescriptor = () => undefined;
    await assert.rejects(owner.createFromModel({ authData, payload: { model: { code: 'example', name: 'Example' } } }), /input is invalid/);
    assert.equal(received, undefined, 'Unavailable metadata must not reach enterprise creation');
    delete SERVICE.DefaultSchemaUtilityService;
    await assert.rejects(owner.createFromModel({ authData, payload: { model: { code: 'example', name: 'Example' } } }), /metadata is unavailable/);
    assert.equal(received, undefined, 'Missing owner must not reach enterprise creation');
});


test('canonical enterprise create preserves trusted scope and requires the transport idempotency key', async () => {
    const controller = require('../src/controller/enterprise/defaultEnterpriseManagementController');
    const facade = require('../src/facade/enterprise/defaultEnterpriseManagementFacade');
    const utility = require('../../../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultSchemaUtilityService');
    let saves = 0, captured;
    global.NODICS = { getModule: () => ({}) };
    const owner = Object.assign({}, service, { create: async request => { saves++; captured = request; } });
    global.SERVICE = {
        DefaultSchemaUtilityService: { getIdempotencyKey: utility.getIdempotencyKey,
            buildDescriptor: () => ({ fields: ['code', 'name'].map(name => ({ name })), operations: ['create'] }) },
        DefaultEnterpriseManagementService: owner,
        DefaultEnterpriseService: { get: async () => ({ result: [{ code: 'example', name: 'Example' }] }) },
    };
    global.FACADE = { DefaultEnterpriseManagementFacade: facade };
    const model = { code: 'example', name: 'Example' };
    const request = { authData, tenant: 'trusted', httpRequest: { headers: { 'idempotency-key': 'setup-http-0001' }, body: { model, tenant: 'forged' } } };
    assert.deepEqual((await controller.create(request)).data, model);
    assert.strictEqual(captured.authData, authData);
    assert.equal(captured.tenant, 'trusted');
    assert.equal(captured.body.tenantCode, 'example');
    assert.equal(captured.body.idempotencyKey, 'setup-http-0001');
    await assert.rejects(controller.create({ authData, httpRequest: { body: { model, idempotencyKey: 'body-key-0001' } } }), /Idempotency-Key/);
    await new Promise(resolve => controller.create({ authData, httpRequest: { body: { model }, headers: { 'idempotency-key': {} } } }, error => {
        assert.match(error.message, /Idempotency-Key/); resolve();
    }));
    assert.equal(saves, 1);
});
