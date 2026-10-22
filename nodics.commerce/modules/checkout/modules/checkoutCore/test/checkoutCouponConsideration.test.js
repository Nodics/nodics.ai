/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module checkoutCore/test/checkoutCouponConsideration @description Exercises actual Checkout and Digital acquisition consideration with isolated owner storage and certificate transport. @layer test @owner checkoutCore */
const test = require('node:test'), assert = require('node:assert/strict');
const portsOwner = require('../src/service/defaultCheckoutPlacementPortsService');
const placement = require('../src/service/defaultOrderPlacementService');
const recovery = require('../src/service/defaultCheckoutCompensationRecoveryService');
const digital = require('../../../../digitalCommerce/modules/digitalCore/src/service/defaultDigitalCommerceCheckoutService');
const acquisition = require('../../../../digitalCommerce/modules/digitalCore/src/service/defaultDigitalCommerceCouponAcquisitionService');
const exact = require('../../../../baseCommerce/modules/pricing/src/service/defaultExactAmountService');
const clone = value => structuredClone(value);

function fixture(t, type = 'CERTIFICATES', enterpriseBuyer = false) {
  const names = ['CONFIG', 'SERVICE', 'FACADE', 'CLASSES'], old = names.map(name => [name, global[name]]);
  t.after(() => old.forEach(([name, value]) => value === undefined ? delete global[name] : global[name] = value));
  const ownerRef = { module: 'profile', schema: enterpriseBuyer ? 'enterprise' : 'customer', code: 'buyer' };
  const typed = { type: enterpriseBuyer ? 'ENTERPRISE' : 'CUSTOMER', code: 'buyer' };
  const participantEnterpriseCode = enterpriseBuyer ? 'buyer' : 'shop', principalType = enterpriseBuyer ? 'human' : 'customer';
  const request = { tenant: 't', enterpriseCode: 'shop', participantEnterpriseCode, ownerId: 'buyer', ownerRef,
    actorRef: { principalType, code: 'buyer', loginId: 'buyer', enterpriseCode: participantEnterpriseCode },
    authData: { tenant: 't', enterpriseCode: participantEnterpriseCode, tokenType: 'access', principalType, loginId: 'buyer' },
    authorization: 'Bearer original', idempotencyKey: 'checkout', payload: { cartCode: 'cart', orderCode: 'order',
      couponSelections: { entry: [['certificate']] } } };
  const scope = { tenant: 't', enterpriseCode: 'shop', ownerId: 'buyer', active: true, revision: 0 };
  const entry = { ...scope, code: 'entry', cartCode: 'cart', ownerRef, status: 'ACTIVE', productCode: 'product', sku: 'sku', quantity: '1' };
  const calculation = { ...scope, code: 'calculation', cartCode: 'cart', currency: 'POINTS', subtotal: '0', totalAmount: type === 'CERTIFICATES' ? '0' : '10',
    entries: [{ ...entry, priceDecision: { tenant: 't', productCode: 'product', storeCode: 'store', currency: 'POINTS', priceRowCode: 'price' },
      availability: { inventoryStrategy: 'COUPON_CODE_POOL', digitalDeliveryType: 'COUPON_CODE', promotionCode: 'offer' } }] };
  const coupon = { ...scope, code: 'coupon', status: 'RESERVED', offerAllocationCode: 'allocation', idempotencyKey: 'checkout:digital:entry:0',
    entryCode: 'entry', productCode: 'product', sku: 'sku', cartCode: 'cart', orderCode: 'order' };
  const allocation = { code: 'allocation', tenant: 't', enterpriseCode: 'shop', revision: 0, evidence: { status: 'RESERVED', couponCode: 'coupon', identity: {
    tenant: 't', ownerId: 'buyer', ownerRef: typed, orderCode: 'order', entryCode: 'entry', productCode: 'product',
    promotionCode: 'offer', idempotencyKey: coupon.idempotencyKey, certificateCodes: ['certificate'] },
    campaign: { code: 'offer', issuerEnterpriseRef: { code: 'shop' }, couponOffer: { requirements: { type, ...(type === 'CERTIFICATES' ? {} : { priceRef: 'price' }) } } } } };
  const db = {}, events = [], state = { held: false, consumed: false, failOrder: false, paymentCalls: 0 };
  global.CONFIG = { get: key => key === 'digitalCore' ? require('../../../../digitalCommerce/modules/digitalCore/config/properties').digitalCore :
    key === 'checkoutCore' ? require('../config/properties').checkoutCore : key === 'runtimeRole' ? { code: 'COMMERCE', publication: 'ONLINE' } : undefined };
  global.CLASSES = { NodicsError: class extends Error {} };
  global.FACADE = { DefaultCartCustomerFacade: { resolveContext: async r => ({ ...r, ownerRef, ownerId: 'buyer' }) } };
  global.SERVICE = { DefaultCheckoutPlacementPortsService: portsOwner, DefaultCheckoutCompensationRecoveryService: recovery,
    DefaultCartMerchantScopeService: { retained: async r => {
      assert.equal(r.enterpriseCode, participantEnterpriseCode);
      return { ...r, enterpriseCode: 'shop' };
    } },
    DefaultCheckoutBundleRecoveryService: require('../src/service/defaultCheckoutBundleRecoveryService'),
    DefaultCouponOfferAllocationService: require('../../../../baseCommerce/modules/promotion/src/service/defaultCouponOfferAllocationService'),
    DefaultCouponSecureIssuanceService: { persistence: async () => {} },
    DefaultDigitalCommerceCheckoutService: digital, DefaultDigitalCommerceCouponAcquisitionService: acquisition,
    DefaultExactAmountService: exact, DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ isSystem: true }) },
    DefaultCouponOfferService: { validate: value => clone(value), identifier: value => acquisition.identifier(value) },
    DefaultCouponAcquisitionPersistenceService: { read: async () => clone(allocation),
      transaction: async (r, _schemas, action) => action(r),
      write: async (_schema, _r, current, next) => { assert.deepEqual(current, allocation); Object.assign(allocation, clone(next)); } },
    DefaultPromotionOperationService: {
      ...require('../../../../baseCommerce/modules/promotion/src/service/defaultPromotionOperationService'),
      readLifecycleCoupon: async () => clone(coupon), reserveCouponCodeForCheckout: async () => clone(coupon),
      confirmCouponCodeSale: async command => { await acquisition.completion(command); events.push('sale'); return clone(coupon); },
      deliverCouponCodeSale: async () => { events.push('delivery'); return clone(coupon); },
      releaseCouponCodeReservation: async command => { await acquisition.failed(command); events.push('coupon-release'); return { code: 'coupon', status: 'AVAILABLE' }; },
    },
    DefaultDigitalCommerceEntitlementService: { createFromCouponSales: async () => [{ code: 'entitlement', providerCode: 'coupon' }], recordDeliveries: async () => {} },
    DefaultDigitalCommerceOwnershipService: { remote: async (r, phase, command) => {
      events.push(phase);
      if (phase === 'coupon-reserve') { state.held = true; if (state.lostReserve) { state.lostReserve = false; throw Error('reserve acknowledgement lost'); } }
      if (phase === 'coupon-consume') { assert.equal(state.held, true); state.consumed = true; }
      if (phase === 'coupon-release') { assert.equal(state.consumed, false); state.held = false; }
      return { contractVersion: 1, tenant: 't', enterpriseCode: 'shop', ownerRef: typed, orderCode: 'order', operationKey: command.operationKey,
        certificates: [{ code: 'certificate', ownerRef: typed, valid: true, available: !state.held && !state.consumed, consumed: state.consumed,
          categoryCode: 'electronics', milestoneCodes: [], ...(state.held && !state.consumed ? { reservationCode: command.operationKey } : {}),
          ...(state.consumed ? { consumedBy: command.operationKey, consumedOrderCode: 'order' } : {}) }] };
    } },
    DefaultPaymentExecutionService: { execute: async () => { state.paymentCalls++; throw Error('Payment must not execute'); } },
  };
  for (const name of ['Cart', 'CartEntry', 'CartCalculation', 'CommerceOrder', 'CommerceOrderEntry', 'CheckoutCheckpoint', 'PaymentTransactionEntry', 'Consignment']) {
    db[name] = [];
    const match = (row, query) => Object.entries(query).every(([key, value]) => require('node:util').isDeepStrictEqual(row[key], value));
    SERVICE['Default' + name + 'Service'] = {
      get: async r => { const result = clone(db[name].filter(row => match(row, r.query))); return { code: 'SUC_READ', count: result.length, result }; },
      save: async r => { if (name === 'CommerceOrder' && state.failOrder) throw Error('order unavailable');
        db[name].push(clone(r.model)); return { code: 'SUC_SAVE', result: clone(r.model) }; },
      update: async r => { const row = db[name].find(value => match(value, r.query)); if (row) Object.assign(row, clone(r.model.$set || r.model));
        return { code: 'SUC_UPDATE', result: { matchedCount: row ? 1 : 0 } }; }
    };
  }
  db.Cart.push({ ...scope, code: 'cart', ownerRef, participantEnterpriseCode, status: 'ACTIVE', storeCode: 'store',
    channelCode: 'channel', locale: 'en' }); db.CartEntry.push(entry); db.CartCalculation.push(calculation);
  SERVICE.DefaultCartOperationService = { cartSnapshot: async () => ({ ...db.Cart[0], entries: db.CartEntry }) };
  const ports = { ...portsOwner.create(), validateCart: async () => ({ status: 'VALID' }), calculateCart: async () => clone(calculation) };
  return { request, ports, db, state, events, coupon, allocation, calculation, ownerRef };
}

test('actual certificate-only placement consumes original inputs, persists Order and completes without any Payment phase', async t => {
  const f = fixture(t);
  const result = await placement.place(f.request, f.ports);
  assert.equal(result.status, 'COMPLETED'); assert.equal(f.state.paymentCalls, 0); assert.deepEqual(f.db.PaymentTransactionEntry, []);
  assert.equal(f.state.consumed, true); assert.equal(f.db.CommerceOrder[0].evidence.considerationType, 'CERTIFICATES');
  assert.equal(Object.hasOwn(f.db.CommerceOrder[0].evidence, 'paymentReference'), false);
  assert.equal(result.evidence.completed.includes('AUTHORIZED'), false); assert.equal(result.evidence.completed.includes('PAYMENT_CAPTURED'), false);
  assert.ok(f.events.indexOf('coupon-consume') < f.events.indexOf('sale'));
  assert.equal(f.db.CartCalculation[0].entries[0].priceDecision.priceRowCode, 'price');
  assert.equal(require('../../cart/src/schemas/schemas').cart.cartCalculation.definition.entries.type, 'array');
});

test('zero total alone is not certificate consideration and incomplete or mismatched allocation refuses', async t => {
  const f = fixture(t);
  assert.equal(await portsOwner.certificateOnly(f.request, f.calculation, []), false);
  f.calculation.totalAmount = '0.01';
  await assert.rejects(portsOwner.certificateOnly(f.request, f.calculation, [f.coupon]), /exact zero/);
  f.calculation.totalAmount = '0'; f.calculation.entries[0].quantity = '2';
  await assert.rejects(portsOwner.certificateOnly(f.request, f.calculation, [f.coupon]), /complete allocations/);
  f.calculation.entries[0].quantity = '1'; f.allocation.evidence.identity.productCode = 'foreign';
  await assert.rejects(portsOwner.certificateOnly(f.request, f.calculation, [f.coupon]));
  assert.equal(f.state.paymentCalls, 0);
});

test('certificate compensation persists failure before actual Digital input release and cannot repeat completed recovery', async t => {
  const f = fixture(t); f.state.failOrder = true;
  await assert.rejects(placement.place(f.request, f.ports), /order unavailable/);
  assert.equal(f.state.held, false); assert.equal(f.state.consumed, false); assert.equal(f.state.paymentCalls, 0);
  const row = f.db.CheckoutCheckpoint[0];
  assert.equal(row.status, 'COMPENSATED'); assert.equal(row.evidence.couponAcquisitionRecovery.status, 'COMPLETED');
  assert.ok(f.events.includes('coupon-release')); assert.equal(row.evidence.completed.includes('AUTHORIZED'), false);
  const before = clone(f.events);
  assert.equal((await recovery.recover({ ...f.request, commandCode: 'checkout', payload: {} })).recoveryStatus, 'COMPLETED');
  assert.deepEqual(f.events, before);
});

for (const enterpriseBuyer of [false, true]) test(`BOTH compensation records real Payment reversal before input release (${enterpriseBuyer ? 'distinct Enterprise buyer' : 'customer'})`, async t => {
  const f = fixture(t, 'BOTH', enterpriseBuyer), participantEnterpriseCode = f.request.participantEnterpriseCode;
  const command = await acquisition.commandForCoupon(f.request, f.coupon); await acquisition.reserveInputs(command);
  const capture = { tenant: 't', enterpriseCode: participantEnterpriseCode, ownerId: 'buyer', code: 'capture', orderCode: 'order', cartCode: 'cart',
    idempotencyKey: 'checkout:payment:capture', methodCode: 'LOYALTY_REWARD', providerCode: 'loyalty-reward-points',
    providerReference: 'redemption', amount: '10', totalAmount: '10', currency: 'POINTS', status: 'CAPTURED',
    evidence: { operation: 'CAPTURE', participant: { ownerRef: f.ownerRef, actorRef: f.request.actorRef, participantEnterpriseCode } } };
  f.db.PaymentTransactionEntry.push(capture);
  SERVICE.DefaultPaymentExecutionService = require('../../../../payment/modules/paymentCore/src/service/defaultPaymentExecutionService');
  SERVICE.DefaultLoyaltyRewardPaymentProviderService = { code: 'loyalty-reward-points', execute: async request => {
    assert.equal(request.authorization, 'Bearer original'); assert.deepEqual(request.ownerRef, f.ownerRef);
    assert.equal(request.authData.principalType, enterpriseBuyer ? 'human' : 'customer'); assert.equal(request.operation, 'REFUND');
    assert.equal(request.enterpriseCode, participantEnterpriseCode);
    assert.equal(f.events.includes('coupon-release'), false); f.events.push('payment-refund');
    return { status: 'REFUNDED', reference: 'reversal' };
  } };
  let releaseError;
  SERVICE.DefaultDigitalCommerceCouponAcquisitionService = { ...acquisition, releaseInputs: async r => {
    try { return await acquisition.releaseInputs(r); } catch (error) { releaseError = error; throw error; }
  } };
  const result = await f.ports.compensate({ ...f.request, completed: ['VALIDATED', 'CALCULATED', 'RESERVED', 'DIGITAL_RESERVED', 'AUTHORIZED', 'ORDERED', 'PAYMENT_CAPTURED'],
    results: { authorization: capture, capture, paymentAttempted: true, digitalReservation: [f.coupon] } }, Error('sale unavailable'), f.request);
  if (releaseError) throw releaseError;
  assert.equal(result.status, 'COMPENSATED');
  assert.ok(f.events.indexOf('payment-refund') < f.events.indexOf('coupon-release'));
  assert.equal(f.db.PaymentTransactionEntry.length, 2);
  const proof = f.db.CheckoutCheckpoint[0].evidence.compensation.find(value => value.type === 'PAYMENT_REFUND');
  assert.equal(proof.status, 'COMPLETED'); assert.equal(proof.providerReference, 'reversal');
  assert.equal(f.db.PaymentTransactionEntry[1].enterpriseCode, participantEnterpriseCode);
  if (enterpriseBuyer) {
    const allocated = await acquisition.allocation(command), checkpoint = f.db.CheckoutCheckpoint[0];
    const payment = f.db.PaymentTransactionEntry[1], originalCheckpoint = clone(checkpoint), originalPayment = clone(payment);
    for (const mutate of [
      () => { payment.enterpriseCode = 'shop'; },
      () => { payment.evidence.participant.ownerRef.code = 'foreign'; },
      () => { checkpoint.evidence.actorRef.loginId = 'foreign'; },
      () => { checkpoint.evidence.paymentCompensationIntent.participantEnterpriseCode = 'foreign'; },
    ]) {
      mutate();
      await assert.rejects(acquisition.failureCheckpoint(command, allocated), /unconfirmed/);
      Object.assign(checkpoint, clone(originalCheckpoint)); Object.assign(payment, clone(originalPayment));
    }
    assert.equal(f.events.filter(event => event === 'payment-refund').length, 1);
  }
});

test('unknown authorization retains coupon and certificate holds without claiming zero-payment failure', async t => {
  const f = fixture(t, 'BOTH');
  await acquisition.reserveInputs(await acquisition.commandForCoupon(f.request, f.coupon));
  const result = await f.ports.compensate({ ...f.request, completed: ['VALIDATED', 'CALCULATED', 'RESERVED', 'DIGITAL_RESERVED'],
    results: { paymentAttempted: true, digitalReservation: [f.coupon] } }, Error('authorization unknown'), f.request);
  assert.equal(result.status, 'COMPENSATION_REQUIRED'); assert.equal(f.state.held, true);
  assert.equal(f.events.includes('coupon-release'), false);
  await assert.rejects(recovery.recover({ ...f.request, commandCode: 'checkout', payload: {} }), /UNCONFIRMED/);
});

test('a lost certificate reserve acknowledgement is resolved only through the retained original unit release', async t => {
  const f = fixture(t); f.state.lostReserve = true;
  await assert.rejects(placement.place(f.request, f.ports), /reserve acknowledgement lost/);
  assert.equal(f.db.CheckoutCheckpoint[0].status, 'COMPENSATED');
  assert.equal(f.db.CheckoutCheckpoint[0].evidence.digitalReservationRecoveryRequired, false);
  assert.equal(f.state.held, false); assert.equal(f.state.paymentCalls, 0);
});
