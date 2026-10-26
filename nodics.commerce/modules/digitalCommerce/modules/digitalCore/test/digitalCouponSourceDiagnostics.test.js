/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const { setup } = require('./helpers/couponCheckoutFixture');
const errors = require('./helpers/authorizationErrorFixture');
const acquisition = require('../src/service/defaultDigitalCommerceCouponAcquisitionService');
const checkout = require('../src/service/defaultDigitalCommerceCheckoutService');
const controller = require('../src/controller/defaultDigitalCouponAcquisitionController');

/** Composes real acquisition/allocation readers with a private callback; faults stay in memory. */
async function prepared(t) {
  const f = setup(t, 'CERTIFICATES', true, 'buyer-enterprise');
  errors(t);
  const units = await checkout.reserveForCheckout(f.r, { entries: [f.entry] });
  const command = await acquisition.commandForCoupon(f.r, units[0]);
  const body = { contractVersion: 1, phase: 'reserve', enterpriseCode: 'issuer', ownerRef: f.ownerRef,
    ownerId: f.r.ownerId, orderCode: 'order', entryCode: 'entry', productCode: 'product', promotionCode: 'offer',
    operationKey: command.idempotencyKey, idempotencyKey: command.idempotencyKey,
    certificateCodes: ['certificate'], requirements: structuredClone(f.campaign.couponOffer.requirements) };
  f.sourceRequest.payload = body;
  return { ...f, body };
}
const secret = 'PRIVATE_PAYLOAD_TOKEN_MUST_NOT_ESCAPE';
const fail = () => { throw Object.assign(Error(secret), { code: 'ERR_FOREIGN', stage: 'READBACK', metadata: { token: secret } }); };
for (const [stage, inject] of [
  ['GATES', f => { f.config.couponAcquisition.sourceProof.enabled = false; }],
  ['AUTH', () => { SERVICE.DefaultServiceTokenService.requireRuntimePrincipal = fail; }],
  ['ALLOCATION', () => { SERVICE.DefaultCouponAcquisitionPersistenceService.acquisitionByCommand = fail; }],
  ['GRANT', f => { f.config.couponAcquisition.sourceProof.callers[0].enterpriseCode = 'foreign'; }],
  ['COUPON', () => { SERVICE.DefaultPromotionOperationService.readLifecycleCoupon = fail; }],
  ['ALLOCATION_BINDING', () => { SERVICE.DefaultCouponAcquisitionPersistenceService.read = fail; }],
  ['COMMAND', f => { f.body.certificateCodes = ['foreign']; }],
  ['PHASE', f => { [...f.tables.get('couponAcquisitionReservation').values()][0].evidence.inputDisposition = 'RELEASE'; }],
  ['CONSIDERATION', f => { f.body.phase = 'consume'; [...f.tables.get('couponAcquisitionReservation').values()][0].evidence.inputDisposition = 'COMMIT';
    SERVICE.DefaultCommerceOrderService.get = fail; }],
  ['FAILURE_PROOF', f => { f.body.phase = 'release'; }],
  ['READBACK', () => { const owner = SERVICE.DefaultCouponAcquisitionPersistenceService, read = owner.read.bind(owner); let calls = 0;
    owner.read = async (...args) => ++calls === 2 ? fail() : read(...args); }],
]) test('private source callback isolates ' + stage + ' without dependency disclosure or writes', async t => {
  const f = await prepared(t);
  for (const name of ["DefaultCouponAcquisitionPersistenceService", "DefaultPromotionOperationService"])
    SERVICE[name] = { ...SERVICE[name] };
  inject(f);
  const before = structuredClone(f.tables), effects = structuredClone(f.state);
  await assert.rejects(controller.sourceProof(f.sourceRequest), error => {
    assert.ok(error instanceof CLASSES.NodicsError);
    assert.equal(error.code, 'ERR_DIGITAL_COUPON_SOURCE_' + stage);
    assert.equal(JSON.stringify(error).includes(secret), false);
    assert.equal(error.message.includes(secret), false);
    assert.equal(error.cause, undefined);
    assert.equal(error.causes?.length || 0, 0);
    return true;
  });
  assert.deepEqual(f.tables, before);
  assert.deepEqual(f.state, effects);
});

test('certificate-only private reserve and RELEASE proof preserve exact success and no Payment effects', async t => {
  const f = await prepared(t);
  const proof = await acquisition.sourceProof(f.sourceRequest, f.body);
  assert.equal(proof.allowed, true);
  f.body.phase = 'release';
  [...f.tables.get('couponAcquisitionReservation').values()][0].evidence.inputDisposition = 'RELEASE';
  f.db.DefaultCheckoutCheckpointService.push({ tenant: 't', enterpriseCode: 'issuer', code: 'checkout',
    idempotencyKey: 'checkout', ownerId: f.r.ownerId, status: 'COMPENSATION_REQUIRED', evidence: {
      participantEnterpriseCode: 'buyer-enterprise', ownerRef: f.r.ownerRef,
      actorRef: { loginId: 'actor' }, completed: [], compensation: [],
      couponAcquisitionRecovery: { paymentAttemptUnconfirmed: false } } });
  const before = structuredClone(f.tables);
  assert.equal((await controller.sourceProof(f.sourceRequest)).data.allowed, true);
  assert.deepEqual(f.tables, before);
  assert.deepEqual(f.db.DefaultPaymentTransactionEntryService, []);
});
