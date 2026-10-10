/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module digitalCore/test/digitalCouponReservationRecoveryContract @description Exact original Cart scope and uncertain coupon cleanup admission. @layer test @owner digitalCore */
const test = require('node:test');
const assert = require('node:assert/strict');
const service = require('../src/service/defaultDigitalCommerceCheckoutService');
const request = { tenant: 't', enterpriseCode: 'e', ownerId: 'buyer', commandCode: 'checkout', authData: { code: 'buyer' } };
const key = 'checkout:digital:entry:0';
function fixture() {
    const entry = { tenant: 't', enterpriseCode: 'e', ownerId: 'buyer', code: 'entry', cartCode: 'cart', status: 'ACTIVE',
        quantity: '1', productCode: 'product', sku: 'sku' };
    const cart = { tenant: 't', enterpriseCode: 'e', ownerId: 'buyer', code: 'cart', status: 'ACTIVE', storeCode: 'store' };
    const state = { entry, cart, calls: [], mutation: response => response };
    const get = row => async r => {
        assert.equal(r.options.skipItemCache, true);
        assert.deepEqual(r.searchOptions, { pageSize: 2, pageNumber: 1 });
        return state.mutation({ code: 'SUC_GET', count: 1, result: [structuredClone(row)] }, r);
    };
    global.SERVICE = { DefaultCheckoutPlacementPortsService: { serviceAuthData: () => ({ code: 'owner' }) },
        DefaultCartEntryService: { get: get(entry) }, DefaultCartService: { get: get(cart) },
        DefaultPromotionOperationService: { recoverCouponCodeReservation: async r => {
            state.calls.push(r); return { status: 'COMPLETED', reservationKey: r.idempotencyKey };
        } } };
    return state;
}
test('uncertain coupon recovery derives persisted single active Cart scope without caller selectors', async () => {
    const state = fixture(), before = structuredClone(request);
    assert.deepEqual(await service.recoverUncertainCouponReservation(request, { uncertainKey: key }), {
        type: 'DIGITAL_COUPON_RELEASE', status: 'COMPLETED', reservationKey: key,
        cartCode: 'cart', entryCode: 'entry', enterpriseCode: 'e' });
    assert.equal(state.calls.length, 1);
    assert.equal(state.calls[0].authData, request.authData);
    assert.deepEqual(request, before);
});
for (const [name, change] of Object.entries({
    'foreign enterprise': s => { s.entry.enterpriseCode = 'foreign'; },
    'foreign buyer': s => { s.entry.ownerId = 'foreign'; },
    'inactive Cart': s => { s.cart.status = 'COMPLETED'; },
    'multiple units': s => { s.entry.quantity = '2'; },
    'missing count': s => { s.mutation = r => { delete r.count; return r; }; },
    'truncated count': s => { s.mutation = r => ({ ...r, count: 2 }); },
    'failed envelope': s => { s.mutation = r => ({ ...r, code: 'ERR_READ' }); },
    'negative acknowledgement': s => { s.mutation = r => ({ ...r, acknowledged: false }); },
    'extra active entry': s => { s.mutation = r => ({ ...r, count: 2, result: [...r.result, r.result[0]] }); },
})) test('uncertain coupon recovery refuses ' + name + ' before Promotion effects', async () => {
    const state = fixture(); change(state);
    await assert.rejects(service.recoverUncertainCouponReservation(request, { uncertainKey: key }));
    assert.equal(state.calls.length, 0);
});
for (const uncertainKey of ['other:digital:entry:0', 'checkout:digital:entry:1', 'checkout:digital::0', key + ':extra'])
    test('uncertain coupon recovery rejects altered original unit key ' + uncertainKey, async () => {
        const state = fixture();
        await assert.rejects(service.recoverUncertainCouponReservation(request, { uncertainKey }));
        assert.equal(state.calls.length, 0);
    });
