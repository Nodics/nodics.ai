/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module promotion/test/promotionCouponReservationRecoveryContract @description Original unused reservation cleanup, count and lifecycle boundaries. @layer test @owner promotion */
const test = require('node:test');
const assert = require('node:assert/strict');
const operation = require('../src/service/defaultPromotionOperationService');
const request = { tenant: 't', enterpriseCode: 'e', ownerId: 'buyer', idempotencyKey: 'checkout:digital:entry:0',
  cartCode: 'cart', entryCode: 'entry', productCode: 'product', sku: 'sku', authData: { code: 'buyer' } };
function fixture(empty = false) {
  const state = { rows: empty ? [] : [{ ...request, code: 'coupon', status: 'RESERVED', saleStatus: 'RESERVED',
    benefitStatus: 'UNCLAIMED', reservedFor: 'buyer', orderCode: 'order', revision: 2 }], releases: 0,
    envelope: response => response };
  global.SERVICE = { DefaultCouponService: { get: async r => {
    assert.deepEqual(r.query, { tenant: 't', idempotencyKey: request.idempotencyKey });
    assert.equal(r.options.skipItemCache, true);
    return state.envelope({ code: 'SUC_GET', count: state.rows.length, result: structuredClone(state.rows) });
  } } };
  const service = { ...operation, requireOperationalRuntime() {}, releaseCouponCodeReservation: async r => {
    state.releases++; assert.equal(r.idempotencyKey, request.idempotencyKey);
    assert.equal(r.payload.couponCode, 'coupon');
    const saved = { ...state.rows[0], status: 'ACTIVE', saleStatus: 'AVAILABLE', revision: 3 };
    for (const k of ['reservedFor', 'reservedAt', 'reservedUntil', 'idempotencyKey', 'orderCode', 'cartCode', 'entryCode', 'productCode', 'sku', 'benefitStatus']) delete saved[k];
    state.rows = []; return saved;
  } };
  return { state, service };
}
test('reservation recovery releases only exact original reserved coupon and confirms original-key absence', async () => {
  const { state, service } = fixture();
  assert.deepEqual(await service.recoverCouponCodeReservation(request), { status: 'COMPLETED', reservationKey: request.idempotencyKey });
  assert.equal(state.releases, 1);
});
test('acknowledged original-key absence has no release effect', async () => {
  const { state, service } = fixture(true);
  await service.recoverCouponCodeReservation(request); assert.equal(state.releases, 0);
});
for (const [name, change] of Object.entries({
  'foreign enterprise': s => { s.rows[0].enterpriseCode = 'other'; },
  'foreign buyer': s => { s.rows[0].reservedFor = 'other'; },
  'different entry': s => { s.rows[0].entryCode = 'other'; },
  'SOLD coupon': s => { s.rows[0].status = 'SOLD'; },
  'claimed coupon': s => { s.rows[0].claimedAt = new Date(); },
  'duplicate key': s => { s.rows.push(structuredClone(s.rows[0])); },
  'missing count': s => { s.envelope = r => { delete r.count; return r; }; },
  'truncated count': s => { s.envelope = r => ({ ...r, count: 2 }); },
  'failed read': s => { s.envelope = r => ({ ...r, code: 'ERR_READ' }); },
  'negative acknowledgement': s => { s.envelope = r => ({ ...r, acknowledged: false }); },
})) test('reservation recovery refuses ' + name + ' before release', async () => {
  const { state, service } = fixture(); change(state);
  await assert.rejects(service.recoverCouponCodeReservation(request)); assert.equal(state.releases, 0);
});
test('unconfirmed release remains failed, never a successful cleanup receipt', async () => {
  const { service } = fixture(); service.releaseCouponCodeReservation = async () => ({ status: 'ACTIVE' });
  await assert.rejects(service.recoverCouponCodeReservation(request));
});
