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
const { isDeepStrictEqual: same } = require('node:util');
const recovery = require('../src/service/defaultCheckoutCompensationRecoveryService');
const payment = require('../../../../payment/modules/paymentCore/src/service/defaultPaymentExecutionService');
const provider = require('../../../../payment/modules/paymentProviders/modules/loyaltyRewardProvider/src/service/defaultLoyaltyRewardPaymentProviderService');
const acquisition = require('../../../../digitalCommerce/modules/digitalCore/src/service/defaultDigitalCommerceCouponAcquisitionService');
const clone = structuredClone;

function fixture() {
  const ownerRef = { module: 'profile', schema: 'enterprise', code: 'buyer-enterprise' };
  const actorRef = { principalType: 'human', code: 'employee', loginId: 'employee', enterpriseCode: 'buyer-enterprise' };
  const request = { tenant: 't', enterpriseCode: 'merchant', participantEnterpriseCode: 'buyer-enterprise',
    ownerId: 'buyer-enterprise', ownerRef, actorRef, commandCode: 'original', payload: {},
    authData: { tenant: 't', principalType: 'human', enterpriseCode: 'buyer-enterprise' } };
  const unit = { code: 'coupon', offerAllocationCode: 'allocation', idempotencyKey: 'original:digital:entry:0' };
  const db = { CheckoutCheckpoint: [{ code: 'original', idempotencyKey: 'original', tenant: 't', enterpriseCode: 'merchant',
    ownerId: request.ownerId, cartCode: 'cart', orderCode: 'order', status: 'COMPENSATION_REQUIRED', revision: 0,
    evidence: { ownerRef, actorRef, participantEnterpriseCode: request.participantEnterpriseCode, orderCode: 'order',
      completed: ['VALIDATED', 'CALCULATED', 'SPENDING_ADMITTED', 'RESERVED', 'DIGITAL_RESERVED'],
      compensation: [{ type: 'DIGITAL_COUPON_RELEASE', code: 'coupon', status: 'FAILED' }],
      errorCode: 'ERR_LOYALTY_BALANCE_NEGATIVE', inventoryReservationRecoveryRequired: false,
      digitalReservationRecoveryRequired: false,
      couponAcquisitionRecovery: { status: 'READY', orderCode: 'order', cartCode: 'cart',
        paymentAttemptUnconfirmed: true, reservations: [unit] } } }], PaymentTransactionEntry: [], CommerceOrder: [] };
  const state = { calls: [], releases: 0, decision: undefined, decisionStatus: 'DENIED', failCancel: false, loseCancel: false, badReceipt: false,
    badRead: false, loseCAS: false, commitInputs: false };
  global.CONFIG = { get: key => key === 'loyaltyRewardProvider'
    ? require('../../../../payment/modules/paymentProviders/modules/loyaltyRewardProvider/config/properties').loyaltyRewardProvider : undefined };
  global.SERVICE = { DefaultCheckoutCompensationRecoveryService: recovery,
    DefaultCheckoutPlacementPortsService: { serviceAuthData: r => ({ tenant: r.tenant, enterpriseCode: r.enterpriseCode }) },
    DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ isSystem: true }) },
    DefaultPaymentExecutionService: payment, DefaultLoyaltyRewardPaymentProviderService: provider,
    DefaultModuleService: { invokeModule: async command => {
      state.calls.push(command.apiName); assert.equal(command.maxAttempts, 1);
      assert.equal(command.requestBody.idempotencyKey, 'original:payment');
      assert.equal(command.requestBody.sourceCode, 'order');
      assert.equal(command.requestBody.amount, undefined); assert.equal(command.requestBody.walletCode, undefined);
      if (command.operationName === 'cancel') {
        if (state.failCancel) throw Error('owner refused');
        state.decision ||= { contract: 'LOYALTY_RESERVATION_DECISION_V1', tenant: 't', code: 'canonical-reservation',
          idempotencyKey: 'original:payment', sourceType: 'PAYMENT', sourceCode: 'order', targetType: 'ORDER', targetCode: 'order',
          status: state.decisionStatus, noEffects: state.decisionStatus === 'DENIED' };
        if (state.loseCancel) { state.loseCancel = false; throw Error('lost cancellation response'); }
      }
      if (!state.decision) throw Error('no decision');
      return { code: 'SUC_OWNER', result: { ...clone(state.decision), ...(state.badReceipt ? { idempotencyKey: 'foreign' } : {}) } };
    } },
    DefaultDigitalCommerceCheckoutService: { maximumCouponUnits: () => 10,
      couponCompensationDisposition: async () => ({ disposition: state.commitInputs ? 'FORWARD_REQUIRED' : 'RELEASE_ALLOWED',
        outcomes: [{ code: 'coupon', disposition: 'RELEASE_ALLOWED' }] }),
      releaseReservations: async scope => {
        await acquisition.failureCheckpoint({ ...scope, idempotencyKey: unit.idempotencyKey }, {
          identity: { entryCode: 'entry' }, row: { evidence: { status: 'RESERVED', inputDisposition: 'RELEASE' } }, coupon: { status: 'RESERVED' }
        });
        state.releases++;
        return [{ type: 'DIGITAL_COUPON_RELEASE', code: 'coupon', status: 'COMPLETED' }];
      } }
  };
  for (const table of Object.keys(db)) SERVICE['Default' + table + 'Service'] = {
    get: async r => {
      const result = clone(db[table].filter(row => Object.entries(r.query).every(([k,v]) => same(row[k], v))));
      return { code: 'SUC_READ', count: state.badRead ? undefined : result.length, result };
    },
    update: async r => {
      const row = db[table].find(row => Object.entries(r.query).every(([k,v]) => same(row[k], v)));
      if (row) Object.assign(row, clone(r.model));
      if (state.loseCAS) { state.loseCAS = false; throw Error('lost checkpoint response'); }
      return { code: 'SUC_UPDATE', result: { matchedCount: row ? 1 : 0 } };
    }
  };
  return { request, db, state, get row() { return db.CheckoutCheckpoint[0]; } };
}

test('rev0 original with canonical atomic denial passes actual Digital cleanup guard; replay has no effects', async () => {
  const f = fixture();
  const result = await recovery.recover(f.request);
  assert.equal(result.status, 'COMPENSATED'); assert.equal(result.revision, 3);
  assert.equal(f.state.releases, 1); assert.equal(f.row.evidence.paymentDenialDecision.status, 'DENIED');
  assert.equal(f.row.evidence.couponAcquisitionRecovery.paymentAttemptUnconfirmed, false);
  assert.deepEqual(f.db.PaymentTransactionEntry, []); assert.deepEqual(f.db.CommerceOrder, []);
  const calls = clone(f.state.calls);
  assert.deepEqual(await recovery.recover(f.request), result);
  assert.deepEqual(f.state.calls, calls); assert.equal(f.state.releases, 1);
});
test('historical absent decision can be fenced but never clears unconfirmed or releases original inputs', async () => {
  const f = fixture(); f.state.decisionStatus = 'CANCELLED';
  await assert.rejects(recovery.recover(f.request));
  assert.equal(f.state.decision.status, 'CANCELLED'); assert.equal(f.state.decision.noEffects, false);
  assert.equal(f.row.revision, 0); assert.equal(f.row.evidence.couponAcquisitionRecovery.paymentAttemptUnconfirmed, true);
  assert.equal(f.state.releases, 0);
  await assert.rejects(recovery.recover(f.request)); assert.equal(f.state.releases, 0);
});
test('a failed or lost owner response never flips the unconfirmed guard; only same-key reconciliation proceeds', async () => {
  const f = fixture(); f.state.loseCancel = true;
  await assert.rejects(recovery.recover(f.request));
  assert.equal(f.row.revision, 0); assert.equal(f.row.evidence.couponAcquisitionRecovery.paymentAttemptUnconfirmed, true);
  assert.equal(f.state.releases, 0);
  assert.equal((await recovery.recover(f.request)).status, 'COMPENSATED');
  assert.equal(f.state.releases, 1);
});
test('lost checkpoint acknowledgement retains the durable fence for safe original recovery', async () => {
  const f = fixture(); f.state.loseCAS = true;
  await assert.rejects(recovery.recover(f.request)); assert.equal(f.state.releases, 0);
  assert.equal(f.row.revision, 1);
  assert.equal((await recovery.recover(f.request)).status, 'COMPENSATED');
  assert.equal(f.state.calls.filter(p => p.endsWith('/cancel')).length, 1);
});
test('completed, foreign, non-Loyalty, partial-read, COMMIT and existing Order evidence refuse before cancellation', async () => {
  for (const change of [f => { f.row.status = 'COMPLETED'; }, f => { f.request.ownerRef = { ...f.request.ownerRef, code: 'foreign' }; },
    f => { f.request.actorRef = { ...f.request.actorRef, code: 'other' }; },
    f => { f.row.evidence.couponAcquisitionRecovery.paymentMethod = 'CARD'; },
    f => { f.row.evidence.errorCode = 'UNKNOWN'; }, f => { f.state.badRead = true; }, f => { f.state.commitInputs = true; },
    f => { f.db.CommerceOrder.push({ tenant: 't', code: 'order' }); }]) {
    const f = fixture(); change(f); await assert.rejects(recovery.recover(f.request));
    assert.deepEqual(f.state.calls, []); assert.equal(f.state.releases, 0);
  }
});
test('existing capture or malformed terminal receipt cannot authorize input release', async () => {
  let f = fixture(); f.db.PaymentTransactionEntry.push({ tenant: 't', orderCode: 'order', status: 'CAPTURED' });
  await assert.rejects(recovery.recover(f.request)); assert.equal(f.state.releases, 0); assert.deepEqual(f.state.calls, []);
  f = fixture(); f.state.badReceipt = true;
  await assert.rejects(recovery.recover(f.request)); assert.equal(f.state.releases, 0); assert.equal(f.row.revision, 0);
});
test('Digital independently refuses a copied checkpoint receipt without canonical terminal proof', async () => {
  const f = fixture();
  f.row.evidence.paymentDenialDecision = { fabricated: true };
  f.row.evidence.couponAcquisitionRecovery.paymentAttemptUnconfirmed = false;
  await assert.rejects(acquisition.failureCheckpoint({ ...f.request, idempotencyKey: 'original:digital:entry:0',
    payload: { orderCode: 'order', cartCode: 'cart' } }, {
    identity: { entryCode: 'entry' }, row: { evidence: { status: 'RESERVED' } }, coupon: { status: 'RESERVED' }
  }));
  assert.equal(f.state.releases, 0);
});
test('prospective persisted Payment denial is reconciled without creating another Payment transaction', async () => {
  const f = fixture(); f.row.evidence.couponAcquisitionRecovery.paymentMethod = 'LOYALTY_REWARD';
  const receipt = await payment.authorizationDecision({ ...f.request, orderCode: 'order' }, 'cancel');
  f.state.decision.status = 'DENIED'; receipt.status = 'DENIED';
  f.db.PaymentTransactionEntry.push({ tenant: 't', enterpriseCode: 'buyer-enterprise', ownerId: f.request.ownerId,
    orderCode: 'order', cartCode: 'cart', idempotencyKey: 'original:payment', status: 'DECLINED',
    evidence: { operation: 'AUTHORIZE', methodCode: 'LOYALTY_REWARD', reservationDecision: receipt,
      participant: { ownerRef: f.request.ownerRef, actorRef: f.request.actorRef } } });
  assert.equal((await recovery.recover(f.request)).status, 'COMPENSATED');
  assert.equal(f.db.PaymentTransactionEntry.length, 1); assert.equal(f.state.releases, 1);
});

test('coupon recovery retains only allowlisted source diagnostic and status reads never retry release', async () => {
  for (const errorCode of ['ERR_EWASTE_SALE_DIAGNOSTIC_041', 'ERR_EWASTE_SALE_DIAGNOSTIC_043', 'ERR_EWASTE_SALE_DIAGNOSTIC_049',
    'ERR_DIGITAL_COUPON_SOURCE_GRANT:PRIVATE', 'PRIVATE_FAILURE']) {
    const f = fixture();
    f.row.evidence.couponAcquisitionRecovery.paymentAttemptUnconfirmed = false;
    SERVICE.DefaultDigitalCommerceCheckoutService.releaseReservations = async () => {
      f.state.releases++;
      return [{ type: 'DIGITAL_COUPON_RELEASE', code: 'coupon', status: 'FAILED', errorCode,
        message: 'PRIVATE_MESSAGE', cause: { data: 'PRIVATE_PAYLOAD' } }];
    };
    SERVICE.DefaultDigitalCommerceCouponAcquisitionService = { inspectRecovery: async () => ({
      allocationStatus: 'RESERVED', inputDisposition: 'RELEASE', couponStatus: 'RESERVED',
      stage: 'EVIDENCE_CONFIRMED', condition: 'NONE' }) };
    const result = await recovery.recoverAcquisitions(f.request, clone(f.row));
    assert.equal(result.status, 'COMPENSATION_REQUIRED');
    assert.equal(result.recoveryStatus, 'UNCONFIRMED');
    const allowed = ['ERR_EWASTE_SALE_DIAGNOSTIC_041', 'ERR_EWASTE_SALE_DIAGNOSTIC_043', 'ERR_EWASTE_SALE_DIAGNOSTIC_049'].includes(errorCode);
    assert.deepEqual(f.row.evidence.compensation, [{ type: 'DIGITAL_COUPON_RELEASE', code: 'coupon', status: 'FAILED',
      errorCode: allowed ? errorCode : 'DIGITAL_RELEASE_UNCONFIRMED' }]);
    const before = clone(f.row);
    for (let read = 0; read < 2; read++) {
      const status = await recovery.commandStatus(f.request);
      assert.deepEqual(status.compensationOutcomes, [{ type: 'DIGITAL_COUPON_RELEASE', status: 'FAILED',
        ...(allowed ? { errorCode } : {}) }]);
      assert.equal(JSON.stringify(status).includes('PRIVATE'), false);
    }
    assert.deepEqual(f.row, before); assert.equal(f.state.releases, 1);
    assert.deepEqual(f.db.PaymentTransactionEntry, []); assert.deepEqual(f.db.CommerceOrder, []);
  }
});
