/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module digitalCore/test/digitalBundlePaymentDecisionRecovery @description Actual Checkout, Payment receipt adapter and Digital original bundle cancellation with synthetic terminal Loyalty evidence; no live effects. @owner digitalCore @layer test */
const test = require('node:test'), assert = require('node:assert/strict');
const fixture = require('./bundleSettlementFixture.cjs');
const settlement = require('../src/service/defaultDigitalBundleSettlementService');
const recovery = require('../../../../checkout/modules/checkoutCore/src/service/defaultCheckoutCompensationRecoveryService');
const payment = require('../../../../payment/modules/paymentCore/src/service/defaultPaymentExecutionService');
const provider = require('../../../../payment/modules/paymentProviders/modules/loyaltyRewardProvider/src/service/defaultLoyaltyRewardPaymentProviderService');
const clone = structuredClone;

async function setup(t, cancelled = true) {
  const f = await fixture(t, true, { enterpriseBuyer: true });
  Object.assign(f.r, { participantEnterpriseCode: 'buyer', actorRef: {
    principalType: 'human', code: 'employee', loginId: 'employee', enterpriseCode: 'buyer' } });
  const unit = await f.reserve();
  const request = { ...f.r, commandCode: 'checkout', payload: {} };
  const row = { tenant: 'T', enterpriseCode: 'market', ownerId: 'buyer', code: 'checkout', idempotencyKey: 'checkout',
    cartCode: 'cart', orderCode: 'order', status: 'COMPENSATION_REQUIRED', revision: 0, active: true,
    evidence: { ownerRef: f.r.ownerRef, actorRef: f.r.actorRef, participantEnterpriseCode: 'buyer', orderCode: 'order',
      completed: ['VALIDATED','CALCULATED','SPENDING_ADMITTED','RESERVED','DIGITAL_RESERVED'],
      inventoryReservationRecoveryRequired: false, digitalReservationRecoveryRequired: false,
      errorCode: 'ERR_LOYALTY_RESERVATION_DECISION', compensation: [{ type: 'DIGITAL_OWNERSHIP_RELEASE', code: unit.code,
        status: 'FAILED', errorCode: 'DIGITAL_RELEASE_PENDING_PAYMENT_EVIDENCE' }],
      couponAcquisitionRecovery: { status: 'READY', orderCode: 'order', cartCode: 'cart', paymentMethod: 'LOYALTY_REWARD',
        paymentAttemptUnconfirmed: true, reservations: [{ code: unit.code, idempotencyKey: unit.idempotencyKey,
          digitalDeliveryType: 'DIGITAL_OWNERSHIP' }] } } };
  f.rows.CheckoutCheckpoint.push(row);
  const state = { calls: [], receipt: { contract: cancelled ? 'LOYALTY_RESERVATION_RECONCILIATION_V1' : 'LOYALTY_RESERVATION_DECISION_V1',
    tenant: 'T', code: 'original-decision', idempotencyKey: 'checkout:payment', sourceType: 'PAYMENT', sourceCode: 'order',
    targetType: 'ORDER', targetCode: 'order', status: cancelled ? 'CANCELLED' : 'DENIED', noEffects: true,
    ...(cancelled ? { intent: { walletCode: 'original-wallet', programCode: 'selected-program', rewardTypeCode: 'selected-reward', amount: '12.50' },
      proof: { contractVersion: 1, method: 'ATOMIC_LEDGER_RECONCILIATION', balanceCode: 'original-balance', balanceRevision: 1,
        ledgerCount: 1, ledgerDigest: 'a'.repeat(64), reconciledAt: '2026-10-25T10:00:00.000Z',
        totals: { available: '48', reserved: '0', earned: '48', spent: '0', expired: '0', reversed: '0' } } } : {}) } };
  if (cancelled) row.evidence.originalAuthorization = clone(state.receipt.intent);
  const get = CONFIG.get;
  CONFIG.get = k => k === 'loyaltyRewardProvider' ? require('../../../../payment/modules/paymentProviders/modules/loyaltyRewardProvider/config/properties').loyaltyRewardProvider : get(k);
  SERVICE.DefaultCheckoutCompensationRecoveryService = recovery;
  SERVICE.DefaultCheckoutPlacementPortsService = { serviceAuthData: r => r.authData };
  SERVICE.DefaultPaymentExecutionService = { ...payment, execute: async () => { throw Error('No financial execution allowed'); } };
  SERVICE.DefaultLoyaltyRewardPaymentProviderService = provider;
  SERVICE.DefaultModuleService.invokeModule = async command => {
    state.calls.push(command.operationName);
    assert.ok(['cancel','inspect','reconcile'].includes(command.operationName)); assert.equal(command.maxAttempts, 1);
    assert.deepEqual(command.requestBody, { idempotencyKey: 'checkout:payment', sourceType: 'PAYMENT', sourceCode: 'order',
      targetType: 'ORDER', targetCode: 'order',
      ...(command.operationName === 'reconcile' ? { reservationDecisionContract: 'LOYALTY_RESERVATION_DECISION_V1', ...row.evidence.originalAuthorization } : {}) });
    assert.notEqual(f.rows.DigitalBundleOperation.find(r => r.code === unit.code).status, 'RESERVED', 'Digital cancellation fence precedes owner decision');
    if (state.drift && state.calls.length > 1) return { code: 'SUC_READ', result: { ...clone(state.receipt), code: 'changed-decision' } };
    return { code: 'SUC_READ', result: clone(state.receipt) };
  };
  const effects = clone(f.effects), holds = [...f.holds];
  return { ...f, unit, request, row, state, effectsBefore: effects, holdsBefore: holds,
    purchase: () => f.rows.DigitalBundleOperation.find(r => r.code === unit.code),
    listingRow: () => f.rows.DigitalBundleOperation.find(r => r.purpose === 'LISTING') };
}

for (const cancelled of [true, false]) test(`original bundle accepts canonical ${cancelled ? 'CANCELLED reconciliation' : 'DENIED'} proof and releases only its purchase claim`, async t => {
  const f = await setup(t, cancelled), originalEvidence = clone(f.row.evidence);
  const result = await recovery.recover(f.request);
  assert.equal(result.status, 'COMPENSATED'); assert.equal(result.revision, 3);
  assert.equal(f.row.evidence.paymentDenialDecision.status, cancelled ? 'CANCELLED' : 'DENIED');
  if (cancelled) assert.equal(f.row.evidence.paymentDenialDecision.contract, 'LOYALTY_RESERVATION_RECONCILIATION_V1');
  assert.equal(f.row.evidence.couponAcquisitionRecovery.paymentAttemptUnconfirmed, false);
  assert.equal(f.purchase().status, 'CANCELLED'); assert.equal(f.listingRow().evidence.purchaseClaim, null);
  assert.deepEqual(f.effects, f.effectsBefore); assert.deepEqual([...f.holds], f.holdsBefore);
  assert.equal(f.rows.PaymentTransactionEntry.length, 0); assert.equal(f.rows.CommerceOrder.length, 0);
  assert.equal(f.row.evidence.errorCode, originalEvidence.errorCode);
  const rows = JSON.stringify(f.rows);
  assert.deepEqual(await recovery.recover(f.request), result); assert.equal(JSON.stringify(f.rows), rows);
  assert.equal(f.state.calls.filter(c => c === 'cancel').length, cancelled ? 0 : 1);
});

for (const [name, mutate] of Object.entries({
  'unproved cancellation': f => { f.state.receipt.noEffects = false; },
  'cancelled decision masquerading as denial': f => { f.state.receipt.contract = 'LOYALTY_RESERVATION_DECISION_V1'; },
  'missing proof': f => { delete f.state.receipt.proof; },
  'wrong binding': f => { f.state.receipt.idempotencyKey = 'other:payment'; },
  'mismatched accounting revision': f => { f.state.receipt.proof.ledgerCount = 2; },
  'missing intent': f => { delete f.state.receipt.intent; },
  'malformed proof time': f => { f.state.receipt.proof.reconciledAt = 'not-a-date'; },
})) test(`${name} never clears uncertainty or releases the original claim`, async t => {
  const f = await setup(t); mutate(f);
  await assert.rejects(recovery.recover(f.request));
  assert.equal(f.row.revision, 0); assert.equal(f.row.evidence.couponAcquisitionRecovery.paymentAttemptUnconfirmed, true);
  assert.ok(f.listingRow().evidence.purchaseClaim); assert.equal(f.purchase().status, 'CANCELLING');
  assert.deepEqual([...f.holds], f.holdsBefore);
});

for (const [name, mutate] of Object.entries({
  'foreign buyer': f => { f.purchase().recipientRef.code = 'foreign'; },
  'changed actor': f => { f.request.actorRef = { ...f.request.actorRef, code: 'foreign' }; },
  'conflicting claim': f => { f.listingRow().evidence.purchaseClaim.code = 'foreign'; },
  'capture evidence': f => { f.purchase().evidence.capture = { code: 'capture' }; },
  'transferred ownership': f => { f.purchase().evidence.transfer = { code: 'transfer' }; },
  'existing Order': f => { f.rows.CommerceOrder.push({ tenant: 'T', enterpriseCode: 'market', code: 'order', ownerId: 'buyer', active: true }); },
  'mixed reservation set': f => { f.row.evidence.couponAcquisitionRecovery.reservations.push({ code: 'coupon', offerAllocationCode: 'allocation' }); },
  'changed original key': f => { f.row.evidence.couponAcquisitionRecovery.reservations[0].idempotencyKey = 'other'; },
})) test(`${name} refuses before Loyalty cancellation`, async t => {
  const f = await setup(t); mutate(f); const rows = JSON.stringify(f.rows);
  await assert.rejects(recovery.recover(f.request)); assert.equal(f.state.calls.length, 0); assert.equal(JSON.stringify(f.rows), rows);
});

test('direct Digital release refuses an unconfirmed attempted Payment even with zero Payment records', async t => {
  const f = await setup(t); await settlement.fenceCompensation(f.r, f.unit);
  const rows = JSON.stringify(f.rows);
  await assert.rejects(settlement.release({ ...f.r, commandCode: 'checkout' }, f.unit));
  assert.equal(JSON.stringify(f.rows), rows); assert.equal(f.state.calls.length, 0);
});

test('changed canonical terminal receipt after checkpoint proof leaves claim held', async t => {
  const f = await setup(t); f.state.drift = true;
  await assert.rejects(recovery.recover(f.request));
  assert.equal(f.row.revision, 1); assert.ok(f.listingRow().evidence.purchaseClaim);
  assert.equal(f.purchase().status, 'CANCELLING');
});

test('completed replay rechecks owner proof and rejects reintroduced original claim without writes', async t => {
  const f = await setup(t); await recovery.recover(f.request);
  f.listingRow().evidence.purchaseClaim = { code: f.unit.code, digest: f.purchase().commandDigest, command: clone(f.purchase().evidence.command) };
  const rows = JSON.stringify(f.rows); await assert.rejects(recovery.recover(f.request)); assert.equal(JSON.stringify(f.rows), rows);
});

for (const field of ['walletCode', 'programCode', 'rewardTypeCode', 'amount']) test(`reconciliation refuses changed original ${field}`, async t => {
  const f = await setup(t); f.state.receipt.intent[field] = field === 'amount' ? '13.50' : 'foreign';
  await assert.rejects(recovery.recover(f.request));
  assert.equal(f.row.revision, 0); assert.ok(f.listingRow().evidence.purchaseClaim);
});
test('historical checkpoint without retained authorization cannot adopt cancellation proof or caller replacement terms', async t => {
  const f = await setup(t); delete f.row.evidence.originalAuthorization;
  f.request.originalAuthorization = clone(f.state.receipt.intent);
  f.request.payload = { ...f.state.receipt.intent };
  f.state.receipt = { ...f.state.receipt, contract: 'LOYALTY_RESERVATION_DECISION_V1', noEffects: false };
  await assert.rejects(recovery.recover(f.request));
  assert.deepEqual(f.state.calls, []); assert.equal(f.row.revision, 0); assert.ok(f.listingRow().evidence.purchaseClaim);
});

test('historical checkpoint with absent original intent stays conservative after canonical cancel', async t => {
  const f = await setup(t); delete f.row.evidence.originalAuthorization;
  f.state.receipt = { ...f.state.receipt, contract: 'LOYALTY_RESERVATION_DECISION_V1', noEffects: false };
  await assert.rejects(recovery.recover(f.request));
  assert.deepEqual(f.state.calls, ['cancel']); assert.equal(f.row.revision, 0); assert.ok(f.listingRow().evidence.purchaseClaim);
});

test('crashed durable dispatch journal reconciles its retained original intent through existing bundle recovery', async t => {
  const f = await setup(t), original = clone(f.row);
  f.rows.CheckoutCheckpoint.length = 0;
  const ports = require('../../../../checkout/modules/checkoutCore/src/service/defaultCheckoutPlacementPortsService');
  const owner = { ...ports, paymentJournalPersistence: async () => {} };
  SERVICE.DefaultCheckoutPlacementPortsService = owner;
  const request = { ...f.r, idempotencyKey: 'checkout', payload: { orderCode: 'order', cartCode: 'cart', paymentMethod: 'LOYALTY_REWARD' } };
  const checkpoint = { ...request, completed: clone(original.evidence.completed), results: { reservation: [], digitalReservation: [f.unit], paymentAttempted: true } };
  const method = { ...request, idempotencyKey: 'checkout:payment', methodCode: 'LOYALTY_REWARD',
    orderCode: 'order', cartCode: 'cart', currency: 'POINTS', ...clone(original.evidence.originalAuthorization) };
  await owner.claimPaymentDispatch(request, checkpoint, method, [f.unit]);
  const claimId = f.rows.CheckoutCheckpoint[0].evidence.originalPaymentDispatch.claimId;
  checkpoint.results = {}; // Simulated process loss: recovery uses only the durable owner record.
  const result = await recovery.recover(f.request);
  assert.equal(result.status, 'COMPENSATED'); assert.equal(result.revision, 3);
  assert.equal(f.rows.CheckoutCheckpoint.length, 1);
  assert.equal(f.rows.CheckoutCheckpoint[0].evidence.originalPaymentDispatch.claimId, claimId);
  assert.equal(f.rows.CheckoutCheckpoint[0].evidence.paymentDenialDecision.status, 'CANCELLED');
  assert.equal(f.purchase().status, 'CANCELLED'); assert.equal(f.listingRow().evidence.purchaseClaim, null);
  assert.deepEqual([...f.holds], f.holdsBefore); assert.ok(f.state.calls.every(v => v === 'reconcile'));
});
