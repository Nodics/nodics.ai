/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module checkoutCore/test/checkoutCouponForwardRecovery @description Composes common Checkout recovery with actual Digital, Promotion and Waste owners over isolated generated persistence; no runtime or provider acceptance. @owner checkoutCore @layer test */
const test = require('node:test'), assert = require('node:assert/strict');
const { isDeepStrictEqual: same } = require('node:util');
const { setup, realWaste } = require('../../../../digitalCommerce/modules/digitalCore/test/helpers/couponCheckoutFixture');
const recovery = require('../src/service/defaultCheckoutBundleRecoveryService');
const ports = require('../src/service/defaultCheckoutPlacementPortsService');
const controller = require('../src/controller/defaultCheckoutCustomerController');
const notifications = require('../../../../digitalCommerce/modules/digitalCore/src/service/defaultDigitalCommerceNotificationService');
const acquisition = require('../../../../digitalCommerce/modules/digitalCore/src/service/defaultDigitalCommerceCouponAcquisitionService');
const reminders = require('../../../../digitalCommerce/modules/digitalCore/src/service/defaultDigitalCommerceCouponReminderService');
const clone = value => structuredClone(value);

/** Retains real owner services and replaces only generated repositories, Payment dispatch and transport. */
async function fixture(t, type = 'CERTIFICATES', enterprise = false) {
  const f = setup(t, type, enterprise, enterprise ? 'buyer-enterprise' : 'issuer');
  const prior = CONFIG.get;
  CONFIG.get = name => name === 'checkoutCore' ? require('../config/properties').checkoutCore : prior(name);
  f.r.actorRef = (await FACADE.DefaultCartCustomerFacade.resolveContext({ ...f.r, enterpriseCode: f.r.participantEnterpriseCode }, 'commerce.checkout.place')).actorRef;
  f.r.merchantScope = clone(f.db.DefaultCartService[0].merchantScope);
  Object.assign(SERVICE, {
    DefaultCheckoutBundleRecoveryService: recovery,
    DefaultCheckoutCompensationRecoveryService: require('../src/service/defaultCheckoutCompensationRecoveryService'),
    DefaultCheckoutPlacementPortsService: ports,
    DefaultCheckoutOperationService: require('../src/service/defaultCheckoutOperationService'),
    DefaultCheckoutMerchantScopeService: require('../src/service/defaultCheckoutMerchantScopeService'),
    DefaultOrderPlacementService: require('../src/service/defaultOrderPlacementService'),
    DefaultExactAmountService: require('../../../../baseCommerce/modules/pricing/src/service/defaultExactAmountService'),
    DefaultPaymentExecutionService: { execute: async () => assert.fail('Original recovery must not execute Payment') },
    DefaultCartOperationService: { cartSnapshot: async () => assert.fail('Original recovery must not reprice Cart') },
  });
  SERVICE.DefaultLoggerService.assertSensitiveRequest = () => {};
  FACADE.DefaultCheckoutCustomerFacade = require('../src/facade/defaultCheckoutCustomerFacade');
  f.db.DefaultConsignmentService = [];
  for (const [name, rows] of Object.entries(f.db)) {
    rows.forEach(row => { row.revision ??= 0; });
    const matches = (row, query) => Object.entries(query).every(([key, value]) => same(key.split('.').reduce((v, k) => v?.[k], row), value));
    SERVICE[name] ??= {
      get: async r => { const result = rows.filter(row => matches(row, r.query)); return { code: 'SUC_READ', count: result.length, result: clone(result) }; },
      save: async r => { assert.equal(rows.some(row => row.code === r.model.code), false); rows.push(clone(r.model)); return { code: 'SUC_SAVE' }; },
    };
    SERVICE[name].update = async r => {
      if (name === 'DefaultCheckoutCheckpointService' && r.model.status === 'COMPLETED' && f.state.failTerminal) {
        f.state.failTerminal = false; throw Error('terminal checkpoint unavailable');
      }
      const row = rows.find(row => matches(row, r.query));
      if (row) Object.assign(row, clone(r.model.$set || r.model));
      return { code: 'SUC_UPDATE', result: { matchedCount: row ? 1 : 0 } };
    };
  }
  const order = f.db.DefaultCommerceOrderService[0];
  order.idempotencyKey = f.r.idempotencyKey;
  Object.assign(order.evidence, { actorRef: f.r.actorRef, merchantScope: f.r.merchantScope, reservationCodes: [],
    ...(type === 'CERTIFICATES' ? { considerationType: type } : {}) });
  f.db.DefaultPaymentTransactionEntryService.forEach(p => { p.idempotencyKey = 'checkout:payment:capture'; });
  f.campaign.couponOffer.requirements.certificates.quantity = 2;
  f.campaign.couponOffer.expiry = { mode: 'FIXED', at: new Date(Date.now() + 3600000).toISOString() };
  f.entry.availability.purchaseRequirements = clone(f.campaign.couponOffer.requirements);
  f.r.payload.couponSelections.entry[0] = ['certificate', 'certificate2'];
  const waste = realWaste(f);
  waste.rows.wasteAsset.set('certificate2', { ...clone(waste.original), code: 'certificate2' });
  const digital = SERVICE.DefaultDigitalCommerceCheckoutService;
  const units = await digital.reserveForCheckout(f.r, { entries: [f.entry] });
  order.evidence.digitalReservationCodes = units.map(unit => unit.code);
  const checkpoint = { ...f.r, completed: ['VALIDATED', 'CALCULATED', 'RESERVED', 'DIGITAL_RESERVED',
    ...(type === 'CERTIFICATES' ? [] : ['AUTHORIZED']), 'ORDERED', ...(type === 'CERTIFICATES' ? [] : ['PAYMENT_CAPTURED'])],
    results: { digitalReservation: units, reservation: [], order, capture: f.db.DefaultPaymentTransactionEntryService[0] } };
  f.state.failConsumeCode = 'certificate2';
  await assert.rejects(digital.confirmSale(f.r, order, units), /second certificate/);
  assert.equal(waste.rows.wasteAsset.get('certificate').assetStatus, 'REDEEMED');
  await ports.create().compensate(checkpoint, Error('partial consumption'), f.r);
  const request = (body, params) => ({ ...f.r, enterpriseCode: f.r.participantEnterpriseCode, payload: body, httpRequest: { body, params, headers: {} } });
  return { ...f, waste, order, units, request,
    status: async () => (await controller.commandStatus(request(undefined, { commandCode: 'checkout' }))).data,
    resume: async () => (await controller.resumeBundle(request({ confirmed: true }, { commandCode: 'checkout' }))).data };
}

for (const type of ['CERTIFICATES', 'BOTH']) for (const enterprise of [false, true])
  test(`${type} ${enterprise ? 'Enterprise' : 'Customer'}: common confirmed recovery completes partial real certificate consumption once`, async t => {
    const f = await fixture(t, type, enterprise), payment = clone(f.db.DefaultPaymentTransactionEntryService);
    const beforeStatus = clone(f.waste.rows), status = await f.status();
    assert.equal(status.recoveryAction, 'RESUME_COUPON_PURCHASE'); assert.equal(status.scopeQualified, true);
    assert.equal(status.cartCode, 'cart'); assert.equal(status.orderCode, 'order');
    assert.deepEqual(f.waste.rows, beforeStatus);
    assert.equal(f.waste.rows.wasteAsset.get('certificate2').assetStatus, 'REDEMPTION_PENDING');
    f.state.failConsumeCode = undefined;
    assert.deepEqual(await f.resume(), { commandCode: 'checkout', cartCode: 'cart', orderCode: 'order', status: 'COMPLETED', revision: 2 });
    assert.equal(f.db.DefaultCheckoutCheckpointService.length, 1);
    assert.equal(f.db.DefaultCheckoutCheckpointService[0].code, 'checkout');
    assert.equal(f.db.DefaultCartService[0].active, false);
    assert.equal(f.db.DefaultCartEntryService[0].status, 'REMOVED');
    assert.deepEqual(f.db.DefaultPaymentTransactionEntryService, payment);
    assert.equal(f.waste.rows.wasteAssetOwnershipEvent.size, 2);
    assert.equal(f.state.phases.includes('coupon-release'), false);
    assert.equal([...f.tables.get('couponOwnerAllowance').values()][0].evidence.completed, 1);
    assert.equal(f.db.DefaultDigitalEntitlementService.length, 1); assert.equal(f.db.DefaultDigitalDeliveryService.length, 1);
    assert.equal((await f.status()).recoveryAction, undefined);
    assert.equal((await f.resume()).status, 'COMPLETED');
    assert.equal(f.waste.rows.wasteAssetOwnershipEvent.size, 2);
    assert.equal((await controller.status(f.request(undefined, { orderCode: 'order' }))).data.code, 'order');
    assert.equal((await notifications.evidence({ ...f.r, orderCode: 'order' }, 'PURCHASED')).items.length, 1);
    await notifications.provePurchasedInspection({ ...f.r, orderCode: 'order' }, f.order, f.db.DefaultDigitalEntitlementService);
    assert.equal((await acquisition.reportSource({ ...f.r, channelCode: 'channel' }, new Date().toISOString())).length, 1);
    assert.equal((await reminders.candidates(f.r, Date.now(), reminders.settings())).length, 1);
    if (type === 'CERTIFICATES') {
      assert.deepEqual(payment, []);
      assert.equal(f.db.DefaultCheckoutCheckpointService[0].evidence.completed.includes('PAYMENT_CAPTURED'), false);
    }
  });

for (const enterprise of [false, true]) test(`${enterprise ? 'Enterprise' : 'Customer'} closed Cart after failed final checkpoint resumes original COMMIT without re-opening intake`, async t => {
  const f = await fixture(t, 'CERTIFICATES', enterprise); f.state.failConsumeCode = undefined; f.state.failTerminal = true;
  await assert.rejects(f.resume(), /COMPENSATION_UNCONFIRMED/);
  assert.equal(f.db.DefaultCartService[0].active, false);
  assert.equal(f.db.DefaultCartEntryService[0].active, false);
  assert.equal((await f.status()).recoveryAction, 'RESUME_COUPON_PURCHASE');
  const before = clone(f.waste.rows), command = await acquisition.commandForCoupon(f.r, f.units[0]);
  await assert.rejects(acquisition.prepare({ ...f.r, idempotencyKey: 'new-command' },
    { entryCode: 'entry', productCode: 'product', sku: 'sku', unitIndex: 0, promotionCode: 'offer' }));
  const allocation = [...f.tables.get('couponAcquisitionReservation').values()][0];
  allocation.evidence.inputDisposition = 'RELEASE';
  await assert.rejects(acquisition.authorize(command)); allocation.evidence.inputDisposition = 'COMMIT';
  const actor = f.order.evidence.actorRef; f.order.evidence.actorRef = { ...actor, code: 'another' };
  await assert.rejects(acquisition.authorize(command)); f.order.evidence.actorRef = actor;
  const key = f.order.idempotencyKey; f.order.idempotencyKey = 'another';
  await assert.rejects(acquisition.authorize(command)); f.order.idempotencyKey = key;
  const owner = f.order.evidence.ownerRef; f.order.evidence.ownerRef = { ...owner, code: 'another' };
  await assert.rejects(acquisition.authorize(command)); f.order.evidence.ownerRef = owner;
  assert.deepEqual(f.waste.rows, before);
  assert.equal((await f.resume()).status, 'COMPLETED');
  assert.equal(f.waste.rows.wasteAssetOwnershipEvent.size, 2);
  assert.equal(f.db.DefaultConsignmentService.length, 1);
});

test('failed common recovery retains original inputs and current revoked Enterprise scope never grants continuation', async t => {
  const f = await fixture(t, 'BOTH', true), payment = clone(f.db.DefaultPaymentTransactionEntryService);
  await assert.rejects(f.resume(), /COMPENSATION_UNCONFIRMED/);
  assert.equal((await f.status()).recoveryAction, 'RESUME_COUPON_PURCHASE');
  assert.deepEqual(f.db.DefaultPaymentTransactionEntryService, payment);
  assert.equal(f.state.phases.includes('coupon-release'), false);
  f.state.denied = true;
  await assert.rejects(f.status()); await assert.rejects(f.resume());
  f.state.denied = false; f.state.failConsumeCode = undefined;
  assert.equal((await f.resume()).status, 'COMPLETED');
  assert.equal(f.waste.rows.wasteAssetOwnershipEvent.size, 2);
});

test('failed and ambiguous retained completion cannot authorize notification, reporting or reminder reads', async t => {
  const f = await fixture(t); f.state.failConsumeCode = undefined; await f.resume();
  const row = f.db.DefaultCheckoutCheckpointService[0];
  for (const corrupt of [() => { row.orderCode = 'foreign'; }, () => { row.status = 'COMPENSATION_REQUIRED'; },
    () => { f.db.DefaultCheckoutCheckpointService.push({ ...clone(row), code: 'duplicate' }); }]) {
    const original = clone(row); corrupt();
    await assert.rejects(notifications.evidence({ ...f.r, orderCode: 'order' }, 'PURCHASED'));
    await assert.rejects(acquisition.reportSource({ ...f.r, channelCode: 'channel' }, new Date().toISOString()));
    await assert.rejects(reminders.candidates(f.r, Date.now(), reminders.settings()));
    f.db.DefaultCheckoutCheckpointService.splice(1); Object.assign(row, original);
  }
});
