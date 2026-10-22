/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module digitalCore/test/digitalEnterpriseParticipation @description Composes actual Profile admission, private participation CAS and coupon/gift consumers with isolated repositories. No runtime activation. @layer test @owner digitalCore */
const test = require('node:test'), assert = require('node:assert/strict');
const { setup } = require('./helpers/couponCheckoutFixture');
const participation = require('../src/service/defaultDigitalParticipationService');
const checkout = require('../src/service/defaultDigitalCommerceCheckoutService');
const authority = require('../src/service/defaultDigitalBundleAuthorityService');
const controller = require('../src/controller/defaultDigitalCommerceCustomerController');
const facade = require('../src/facade/defaultDigitalCommerceCustomerFacade');
const clone = v => structuredClone(v);
function fixture(t) {
  const f = setup(t, 'CERTIFICATES', true, 'buyer-enterprise');
  f.permissions.push('commerce.digital.bundle.configure', 'commerce.digital.bundle.manage');
  const request = { ...f.r, enterpriseCode: 'buyer-enterprise' };
  const command = (patch = {}) => ({ giftingEnabled: true, receivingEnabled: true, couponPurchasingEnabled: true,
    expectedRevision: null, idempotencyKey: 'selection-one', reason: 'Approved Enterprise choice', ...patch });
  return { ...f, request, command };
}
test('read derives signed Enterprise and framework defaults without materializing records or private evidence', async t => {
  const f = fixture(t), read = await participation.current(f.request);
  assert.deepEqual(read.effective, { giftingEnabled: true, receivingEnabled: true, couponPurchasingEnabled: true });
  assert.equal(read.revision, null); assert.equal(read.ownerRef.code, 'buyer-enterprise');
  assert.equal(f.participation.rows.digitalBundleOwnerPolicy.length, 0);
  assert.equal(Object.hasOwn(read, 'evidence'), false);
  f.config.enterpriseParticipation.couponPurchasingEnabled = false;
  assert.equal((await participation.current(f.request)).effective.couponPurchasingEnabled, false);
});
test('independent audited settings retain explicit disables, exact idempotency and current revision', async t => {
  const f = fixture(t), command = f.command({ giftingEnabled: false });
  const first = await participation.configure(f.request, command);
  assert.equal(first.effective.giftingEnabled, false); assert.equal(first.effective.receivingEnabled, true);
  assert.equal(first.effective.couponPurchasingEnabled, true);
  assert.deepEqual(await participation.configure(f.request, command), first);
  assert.equal(f.participation.rows.digitalParticipationCommand.length, 1);
  const evidence = f.participation.rows.digitalParticipationCommand[0].evidence;
  assert.equal(evidence.reason, command.reason); assert.equal(evidence.actorRef.schema, 'employee');
  assert.equal(evidence.ownerRef.code, 'buyer-enterprise'); assert.notEqual(evidence.ownerRef.code, evidence.actorRef.code);
  f.config.bundles.enterpriseGiftingEnabled = true;
  assert.equal((await participation.current(f.request)).effective.giftingEnabled, false);
  await assert.rejects(participation.configure(f.request, { ...command, receivingEnabled: false }));
  await assert.rejects(participation.configure(f.request, f.command({ idempotencyKey: 'stale' })));
});
test('lost commit acknowledgement resolves only original current-actor status without reapplying settings', async t => {
  const f = fixture(t), command = f.command({ couponPurchasingEnabled: false });
  f.participation.loseAcknowledgement();
  await assert.rejects(participation.configure(f.request, command), /acknowledgement/);
  const status = await participation.status(f.request, { idempotencyKey: command.idempotencyKey });
  assert.equal(status.status, 'APPLIED'); assert.equal(status.receipt.effective.couponPurchasingEnabled, false);
  const next = f.command({ idempotencyKey: 'new-selection', expectedRevision: status.receipt.revision });
  await participation.configure(f.request, next);
  await participation.configure(f.request, command);
  assert.equal((await participation.current(f.request)).effective.couponPurchasingEnabled, true);
  assert.equal((await participation.status(f.request, { idempotencyKey: 'unknown' })).status, 'UNCONFIRMED');
});
test('actual permission, Profile deny, customer/service identities and foreign owner selectors cannot configure', async t => {
  const f = fixture(t);
  f.permissions.splice(f.permissions.indexOf('commerce.digital.bundle.configure'), 1);
  await assert.rejects(participation.current(f.request), /permission/);
  f.permissions.push('commerce.digital.bundle.configure'); f.state.denied = true;
  await assert.rejects(participation.configure(f.request, f.command()), /denied/);
  f.state.denied = false;
  for (const principalType of ['customer', 'service']) await assert.rejects(participation.current({ ...f.request,
    authData: { ...f.request.authData, principalType } }));
  await assert.rejects(participation.current({ ...f.request, enterpriseCode: 'issuer' }));
  await assert.rejects(participation.configure(f.request, { ...f.command(), ownerRef: { module: 'profile', schema: 'enterprise', code: 'issuer' } }));
  await assert.rejects(participation.configure(f.request, f.command({ reason: '' })));
  assert.equal(f.participation.rows.digitalBundleOwnerPolicy.length, 0);
});
test('failed, malformed and missing installed evidence fail closed; generic reads/writes cannot expose policy', async t => {
  const f = fixture(t);
  await assert.rejects(SERVICE.DefaultDigitalBundleOwnerPolicyService.get({ tenant: 't', query: {} }));
  assert.throws(() => participation.protect({ transactionContext: {} }));
  const get = SERVICE.DefaultDigitalBundleOwnerPolicyService.get;
  SERVICE.DefaultDigitalBundleOwnerPolicyService.get = async () => ({ code: 'ERR_READ', result: [], count: 0 });
  await assert.rejects(participation.current(f.request));
  SERVICE.DefaultDigitalBundleOwnerPolicyService.get = get;
  await participation.configure(f.request, f.command());
  delete f.participation.rows.digitalBundleOwnerPolicy[0].couponPurchasingEnabled;
  await assert.rejects(participation.current(f.request));
  f.config.enterpriseParticipation.maximumReasonLength = 10001;
  assert.throws(() => participation.settings());
});
test('disabled new coupon purchase stops before coupon/certificate holds, without changing bundle gift selections', async t => {
  const f = fixture(t);
  await participation.configure(f.request, f.command({ couponPurchasingEnabled: false }));
  await assert.rejects(checkout.reserveForCheckout(f.r, { entries: [f.entry] }), /disabled/);
  assert.equal(f.tables.get('couponAcquisitionReservation').size, 0); assert.deepEqual(f.state.phases, []);
  const policy = await participation.current(f.request);
  assert.equal(policy.effective.giftingEnabled, true); assert.equal(policy.effective.receivingEnabled, true);
});
test('original pending coupon recovery and purchased reveal continue after disabling; replacement starts do not', async t => {
  const f = fixture(t);
  f.state.failReserve = true;
  await assert.rejects(checkout.reserveForCheckout(f.r, { entries: [f.entry] }), /acknowledgement/);
  const original = [...f.tables.get('couponAcquisitionReservation').values()][0];
  const revision = (await participation.current(f.request)).revision;
  await participation.configure(f.request, f.command({ expectedRevision: revision, couponPurchasingEnabled: false }));
  f.state.failReserve = false;
  const completed = await f.finish();
  assert.equal(completed.entitlement.status, 'ACTIVE');
  assert.equal(f.tables.get('couponAcquisitionReservation').size, 1);
  assert.equal([...f.tables.get('couponAcquisitionReservation').values()][0].code, original.code);
  await assert.rejects(checkout.reserveForCheckout({ ...f.r, idempotencyKey: 'replacement' }, { entries: [f.entry] }), /disabled/);
  const revealRequest = { ...f.r, enterpriseCode: 'buyer-enterprise',
    payload: { ...f.r.payload, entitlementCode: completed.entitlement.code } };
  f.privateRequests.add(revealRequest);
  SERVICE.DefaultCouponSecureRevealService = { reveal: async input => ({ status: 'REVEALED', entitlementCode: input.entitlementCode }) };
  const result = await SERVICE.DefaultDigitalCommerceEntitlementService.reveal(revealRequest);
  assert.deepEqual(result, { status: 'REVEALED', entitlementCode: completed.entitlement.code });
});
test('lower-level Enterprise allocation cannot bypass durable Digital start proof', async t => {
  const f = fixture(t), unit = checkout.couponUnits({ entries: [f.entry] })[0];
  const command = await SERVICE.DefaultDigitalCommerceCouponAcquisitionService.prepare(f.r, unit);
  await assert.rejects(f.operation.reserveCouponCodeForCheckout(command));
  assert.equal(f.tables.get('couponAcquisitionReservation').size, 0);
});
test('configuration vs new coupon start serializes on the policy revision; original admission survives disable', async t => {
  const f = fixture(t), ownerRef = { module: 'profile', schema: 'enterprise', code: 'buyer-enterprise' };
  const start = { kind: 'COUPON', key: 'start', ownerRef, identity: { cartCode: 'cart', orderCode: 'order' } };
  await participation.admit(f.r, start);
  await assert.rejects(participation.configure(f.request, f.command({ couponPurchasingEnabled: false })), /unconfirmed/);
  const revision = (await participation.current(f.request)).revision;
  await participation.configure(f.request, f.command({ expectedRevision: revision, couponPurchasingEnabled: false }));
  await participation.admit(f.r, start);
  await assert.rejects(participation.admit(f.r, { ...start, key: 'new-start' }), /disabled/);
  await assert.rejects(participation.admit(f.r, { ...start, identity: { cartCode: 'another' } }));
});
test('gift outgoing and receiving switches fence only new starts independently', async t => {
  const f = fixture(t), ownerRef = { module: 'profile', schema: 'enterprise', code: 'buyer-enterprise' };
  const start = { kind: 'GIFT', key: 'gift-original', ownerRef, recipientRef: { module: 'profile', schema: 'customer', code: 'recipient' },
    identity: { commandDigest: 'original-manifest' } };
  await participation.admit(f.request, start);
  await participation.configure(f.request, f.command({ expectedRevision: 0, giftingEnabled: false }));
  await participation.admit(f.request, start);
  await assert.rejects(participation.admit(f.request, { ...start, key: 'new-gift' }), /disabled/);
  assert.equal((await participation.current(f.request)).effective.receivingEnabled, true);
});
test('settings routes use original current authority, no-store, and allowlisted facade projections', async t => {
  const f = fixture(t), routes = require('../src/router/routers').digitalCore.customer, headers = [];
  FACADE.DefaultDigitalCommerceCustomerFacade = facade;
  for (const key of ['configureGifts', 'readParticipation', 'participationStatus']) {
    assert.equal(routes[key].permission, 'commerce.digital.bundle.configure');
    assert.deepEqual(routes[key].accessGroups, ['employeeUserGroup']); assert.equal(routes[key].cache.enabled, false);
  }
  const r = { ...f.request, httpRequest: { body: {} }, httpResponse: { setHeader: (...args) => headers.push(args) } };
  assert.equal((await controller.readParticipation(r)).data.ownerRef.code, 'buyer-enterprise');
  assert.deepEqual(headers, [['Cache-Control', 'no-store']]);
  assert.equal(SERVICE.DefaultDigitalBundleAuthorityService, authority);
});
