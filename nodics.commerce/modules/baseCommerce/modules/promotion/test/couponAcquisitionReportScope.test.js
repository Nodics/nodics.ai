/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module promotion/test/couponAcquisitionReportScope @description Verifies report dimensions derive only from signed identity and canonical Profile/Store owners. @owner promotion @layer test */
const test = require('node:test');
const assert = require('node:assert/strict');
const owner = require('../src/service/defaultCouponAcquisitionReportScopeService');
const resolve = owner.resolve.bind(owner);

function setup(t) {
    const previous = { CONFIG: global.CONFIG, SERVICE: global.SERVICE, CLASSES: global.CLASSES };
    global.CONFIG = { get: key => key === 'promotion' ? { acquisitionReportQuery: { maximumScopeMembers: 4 } } : undefined };
    global.CLASSES = { NodicsError: class NodicsError extends Error { constructor(code) { super(code); this.code = code; } } };
    const state = { enterprises: ['issuer', 'child'], store: { code: 'outlet', tenant: 'tenant', status: 'ACTIVE', revision: 1,
        enterpriseRef: { moduleName: 'profile', schemaName: 'enterprise', code: 'child' } } };
    global.SERVICE = {
        DefaultCouponAcquisitionReportingService: { fail: () => { throw new CLASSES.NodicsError('ERR_PROMOTION_COUPON_REPORT_UNCONFIRMED'); } },
        DefaultEnterpriseAdministrationConsentService: { visibleEnterpriseCodes: async request => {
            assert.equal(request.authData.entCode, 'issuer');
            return [...state.enterprises];
        } },
        DefaultStoreService: { get: async request => {
            assert.deepEqual(request.query, { tenant: 'tenant', code: 'outlet', status: 'ACTIVE' });
            return { code: 'SUC_FIND', count: 1, result: [{ ...state.store }] };
        } },
    };
    const request = { tenant: 'tenant', authData: { tenant: 'tenant', entCode: 'issuer', principalType: 'human', tokenType: 'access' }, payload: {} };
    t.after(() => { global.CONFIG = previous.CONFIG; global.SERVICE = previous.SERVICE; global.CLASSES = previous.CLASSES; });
    return { request, state };
}

test('enterprise scope is bound only to signed Enterprise authority', async t => {
    const { request } = setup(t);
    assert.deepEqual(await resolve(request, { type: 'ENTERPRISE', code: 'issuer' }),
        { basis: 'SIGNED_ENTERPRISE', enterpriseCodes: ['issuer'] });
    await assert.rejects(resolve(request, { type: 'ENTERPRISE', code: 'child' }));
});

test('group scope uses only Profile-authorized targets and rejects caller-selected groups', async t => {
    const { request } = setup(t);
    assert.deepEqual(await resolve(request, { type: 'GROUP', code: 'issuer' }),
        { basis: 'PROFILE_AUTHORIZED_ENTERPRISES', enterpriseCodes: ['issuer', 'child'] });
    await assert.rejects(resolve(request, { type: 'GROUP', code: 'child' }));
    request.authData.principalType = 'service';
    await assert.rejects(resolve(request, { type: 'GROUP', code: 'issuer' }));
});

test('outlet scope returns only the canonical active Store Enterprise within current Profile authority', async t => {
    const { request } = setup(t);
    assert.deepEqual(await resolve(request, { type: 'OUTLET', code: 'outlet' }),
        { basis: 'CANONICAL_OUTLET', enterpriseCodes: ['child'] });
    const pending = resolve(request, { type: 'OUTLET', code: 'outlet' });
    request.payload.scopeCode = 'other';
    await assert.rejects(pending);
});

test('rejects foreign, malformed, unbounded or changing scope evidence', async t => {
    const { request, state } = setup(t);
    state.store.enterpriseRef.code = 'foreign';
    await assert.rejects(resolve(request, { type: 'OUTLET', code: 'outlet' }));
    state.store.enterpriseRef.code = 'child';
    state.enterprises = ['issuer', 'one', 'two', 'three', 'four'];
    await assert.rejects(resolve(request, { type: 'GROUP', code: 'issuer' }));
    state.enterprises = ['issuer', 'child'];
    SERVICE.DefaultEnterpriseAdministrationConsentService.visibleEnterpriseCodes = async () => {
        request.authData.entCode = 'foreign';
        return ['issuer', 'child'];
    };
    await assert.rejects(resolve(request, { type: 'GROUP', code: 'issuer' }));
});
