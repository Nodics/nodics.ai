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

test('Workbench delegates setup, derives tenancy and keeps later-layer business fields', async () => {
    const fields = ['code', 'name', 'addresses', 'customerNumber'].map(name => ({ name, readOnly: false }));
    let received;
    global.NODICS = { getModule: () => ({}) };
    global.SERVICE = {
        DefaultSchemaWorkbenchService: { buildDescriptor: () => ({ fields, operations: ['create'] }) },
        DefaultEnterpriseService: { get: async () => ({ result: [{ code: 'example', name: 'Example', addresses: ['office'], setupRequestKey: 'private' }] }) },
    };
    const owner = Object.assign({}, service, { create: async (request, additional) => { received = { request, additional }; } });
    const result = await owner.createFromWorkbench({ authData, idempotencyKey: 'request-1', payload: { model: { code: 'example', name: 'Example', addresses: ['office'], customerNumber: '123' } } });
    assert.equal(received.request.body.tenantCode, 'example');
    assert.deepEqual(received.additional, { addresses: ['office'], customerNumber: '123' });
    assert.equal(result.setupRequestKey, undefined);
    await assert.rejects(owner.createFromWorkbench({ authData, payload: { model: { code: 'example', name: 'Example', tenant: 'another' } } }), /managed or unavailable/);
    await assert.rejects(owner.createFromWorkbench({ authData: { ...authData, entCode: 'customer' }, payload: { model: { code: 'example', name: 'Example' } } }), /Platform Owner/);
});
