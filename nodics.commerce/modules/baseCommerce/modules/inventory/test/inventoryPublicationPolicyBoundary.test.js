/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module inventory/test/inventoryPublicationPolicyBoundary @description Tests policy-only capture and pre-write rejection of unqualified publication transport. @layer test @owner inventory */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const service = require('../src/service/defaultInventoryPublicationService');
const request = { tenant: 'tenant-a', enterpriseCode: 'enterprise-a' };
const source = () => ({ code: 'policy-a', tenant: request.tenant, enterpriseCode: request.enterpriseCode,
    versionId: 0, revision: 2, stock: '100', reserved: '2', allocated: '3',
    coupons: ['live'], consumed: '90.00' });

test('capture retains exact version zero without mutating or including operational data', () => {
    const record = source();
    const before = structuredClone(record);
    const captured = service.capturePolicy('warehouse', record, request);
    assert.equal(captured.versionId, 0);
    assert.equal(captured.revision, 2);
    for (const field of ['stock', 'reserved', 'allocated', 'coupons', 'consumed', 'approval', 'analytics']) {
        assert.equal(Object.hasOwn(captured, field), false);
    }
    assert.deepEqual(record, before);
});

test('capture rejects missing versions, wrong scope and operational schema identities', () => {
    for (const versionId of [undefined, null, '0', -1, 1.5, Number.MAX_SAFE_INTEGER + 1]) {
        assert.throws(() => service.capturePolicy('warehouse', { ...source(), versionId }, request), /exact version/);
    }
    assert.throws(() => service.capturePolicy('warehouse', { ...source(), tenant: 'other' }, request), /scope/);
    assert.throws(() => service.capturePolicy('warehouse', { ...source(), enterpriseCode: 'other' }, request), /enterprise boundary/);
    assert.throws(() => service.capturePolicy('inventoryBalance', source(), request), /exact version/);
    assert.throws(() => service.capturePolicy('coupon', source(), request), /exact version/);
});

test('unqualified restoration rejects before any service access even with caller bypass flags', async () => {
    global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
    global.SERVICE = new Proxy({}, { get() { assert.fail('No target reads or writes are permitted'); } });
    for (const input of [{}, { prepared: true, migrationQualified: true }, { inventoryBalances: [source()], coupons: [source()] }]) {
        await assert.rejects(service.restoreOperational(request, input),
            error => error.code === 'ERR_PUB_00006' && /qualified immutable migration/.test(error.message));
    }
});

test('later domain extension can add policy fields while retaining exclusions', () => {
    const extended = { ...service, policyFields() {
        const fields = service.policyFields();
        fields.warehouse.push('customerPolicy');
        return fields;
    } };
    const captured = extended.capturePolicy('warehouse', { ...source(), customerPolicy: { channel: 'web' } }, request);
    assert.deepEqual(captured.customerPolicy, { channel: 'web' });
    assert.equal(captured.stock, undefined);
    assert.equal(service.policyFields().warehouse.includes('customerPolicy'), false);
});
