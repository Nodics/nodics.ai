/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module order/test/orderParticipantFinalSale @description Actual participant route/controller/facade, Profile resolver, owned Order reads and Digital finality; generated persistence and Profile transport are read-only fixtures. @owner order */
const test = require('node:test'), assert = require('node:assert/strict');
const routes = require('../src/router/routers').order.customer;
const controller = require('../src/controller/defaultOrderLifecycleController');
const facade = require('../src/facade/defaultOrderLifecycleFacade');
const operation = require('../src/service/defaultOrderLifecycleOperationService');
const orders = require('../src/service/defaultOrderOperationService');
const cart = require('../../cart/src/facade/defaultCartCustomerFacade');
const digital = require('../../../../digitalCommerce/modules/digitalCore/src/service/defaultDigitalCommerceEntitlementService');
const ownership = require('../../../../digitalCommerce/modules/digitalCore/src/service/defaultDigitalCommerceOwnershipService');
const security = require('../../../../../../nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService');
function fixture(t, customer = false) {
  const keys = ['SERVICE', 'FACADE', 'CONFIG', 'CLASSES'];
  const old = Object.fromEntries(keys.map(k => [k, global[k]]));
  t.after(() => { for (const k of keys) if (old[k] === undefined) delete global[k]; else global[k] = old[k]; });
  global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
  global.CONFIG = { get: key => key === 'cart' ? require('../../cart/config/properties').cart : undefined };
  const ownerRef = { module: 'profile', schema: customer ? 'customer' : 'enterprise', code: 'buyer' };
  const order = { code: 'original-order', tenant: 'default', enterpriseCode: 'merchant', ownerId: 'buyer', status: 'COMPLETED', evidence: { ownerRef } };
  const entry = { code: 'original-order:entry', tenant: 'default', enterpriseCode: 'merchant', ownerId: 'buyer', orderCode: order.code, productCode: 'bundle', quantity: 1, evidence: { ownerRef } };
  const entitlement = { code: 'entitlement', tenant: 'default', enterpriseCode: 'merchant', ownerId: 'buyer', orderCode: order.code,
    providerOwner: 'digitalCore', digitalDeliveryType: 'DIGITAL_OWNERSHIP', status: 'ACTIVE', evidence: { finalSale: true } };
  const authData = { tenant: 'default', entCode: 'buyer', enterpriseCode: 'buyer', principalId: 'actor', loginId: 'actor',
    principalType: customer ? 'customer' : 'human', tokenType: 'access', userGroups: [customer ? 'customerUserGroup' : 'employeeUserGroup'],
    permissions: ['commerce.lifecycle.own.create', 'commerce.order.own.read'] };
  let reads = 0, policies = 0, writes = 0;
  const failWrite = () => { writes++; assert.fail('No persistence or financial effect'); };
  const generated = rows => ({ get: async () => { reads++; return { code: 'SUC_GET', result: structuredClone(rows) }; }, save: failWrite, update: failWrite });
  const proof = customer ? { contractVersion: 1, tenant: 'default', enterpriseCode: 'buyer', customer: { code: 'buyer', loginId: 'actor' } }
    : { principalCode: 'actor', scopes: [{ scopeType: 'ENTERPRISE', scopeCode: 'buyer', tenantCode: 'default', effect: 'ALLOW' }], deniedScopes: [] };
  global.SERVICE = {
    DefaultSecuredRequestPipelineService: security,
    DefaultModuleService: { invokeModule: async () => structuredClone(proof) },
    DefaultOrderLifecycleOperationService: operation, DefaultOrderOperationService: orders,
    DefaultCommerceOrderService: generated([order]), DefaultCommerceOrderEntryService: generated([entry]),
    DefaultOrderLifecycleRequestService: generated([]), DefaultDigitalEntitlementService: generated([entitlement]),
    DefaultDigitalCommerceEntitlementService: digital,
    DefaultDigitalCommerceOwnershipService: { ...ownership, refund: async (...args) => { policies++; return ownership.refund(...args); } },
    DefaultOrderLifecycleRepositoryService: { list: failWrite, save: failWrite },
    DefaultPaymentService: { save: failWrite },
  };
  global.FACADE = { DefaultOrderLifecycleFacade: facade, DefaultCartCustomerFacade: cart };
  const request = type => ({ tenant: 'default', authData, httpRequest: { params: { orderCode: order.code },
    headers: { authorization: 'Bearer source-fixture', 'idempotency-key': 'original-key' }, body: { requestType: type } } });
  const call = (method, type) => {
    const r = request(type); r.router = routes[method]; r.moduleName = 'order';
    return new Promise((resolve, reject) => security.checkAccess(r, {}, { error: (_r, _s, e) => reject(e),
      nextSuccess: () => controller[method](r).then(resolve, reject) }));
  };
  return { call, authData, order, entry, entitlement, proof, counts: () => ({ reads, policies, writes }) };
}
for (const customer of [false, true]) test(`${customer ? 'Customer' : 'Enterprise'} preview reaches canonical bundle finality; create cannot persist reverse intent`, async t => {
  const f = fixture(t, customer), original = structuredClone(f.authData);
  for (const type of ['REFUND', 'RETURN', 'CANCELLATION', 'EXCHANGE', 'REPLACEMENT']) {
    const result = (await f.call('preview', type)).data;
    assert.equal(result.eligible, false); assert.equal(result.reasonCode, 'COMPLETED_BUNDLE_FINAL_SALE');
    assert.equal(result.enterpriseCode, 'merchant'); assert.equal(result.ownerId, 'buyer');
    await assert.rejects(f.call('create', type), { code: 'ERR_ORDER_LIFECYCLE_INELIGIBLE' });
  }
  assert.equal(f.counts().policies, 10); assert.equal(f.counts().writes, 0); assert.deepEqual(f.authData, original);
});
test('missing permission and denied current Profile scope never reach finality or storage', async t => {
  const f = fixture(t); f.authData.permissions = [];
  await assert.rejects(f.call('preview', 'REFUND')); assert.equal(f.counts().reads, 0);
  f.authData.permissions = ['commerce.lifecycle.own.create']; f.proof.deniedScopes = structuredClone(f.proof.scopes);
  await assert.rejects(f.call('preview', 'REFUND')); assert.equal(f.counts().reads, 0);
});
test('foreign or same-text different typed owner and foreign entitlement refuse before policy', async t => {
  const f = fixture(t);
  f.order.evidence.ownerRef = { module: 'profile', schema: 'customer', code: 'buyer' };
  await assert.rejects(f.call('preview', 'REFUND')); assert.equal(f.counts().policies, 0);
  f.order.evidence.ownerRef = { module: 'profile', schema: 'enterprise', code: 'buyer' };
  f.entitlement.ownerId = 'foreign';
  await assert.rejects(f.call('preview', 'REFUND')); assert.equal(f.counts().policies, 0); assert.equal(f.counts().writes, 0);
});
test('caller-provided finality and ownership do not replace retained Digital policy', async t => {
  const f = fixture(t); delete f.entitlement.evidence.finalSale;
  assert.equal((await f.call('preview', 'REFUND')).data.reasonCode, 'COMPLETED_BUNDLE_FINAL_SALE');
  assert.equal(f.counts().writes, 0);
});

test('missing retained Digital evidence fails closed without creating reverse intent', async t => {
  const f = fixture(t); f.entry.evidence.digitalReservationCodes = ['original-reservation'];
  SERVICE.DefaultDigitalEntitlementService.get = async () => ({ code: 'SUC_GET', result: [] });
  await assert.rejects(f.call('preview', 'REFUND'), /Digital lifecycle evidence is unavailable/);
  await assert.rejects(f.call('create', 'REFUND'), /Digital lifecycle evidence is unavailable/);
  assert.equal(f.counts().writes, 0);
});
test('ordinary non-digital preview remains available without a Digital module', async t => {
  const f = fixture(t); delete SERVICE.DefaultDigitalCommerceEntitlementService;
  assert.equal((await f.call('preview', 'RETURN')).data.eligible, true);
  assert.equal(f.counts().policies, 0); assert.equal(f.counts().writes, 0);
});

test('appeal review preview is not promoted into a financial reversal or blocked by final-sale policy', async t => {
  const f = fixture(t);
  assert.equal((await f.call('preview', 'APPEAL')).data.requestType, 'APPEAL');
  assert.equal(f.counts().policies, 0); assert.equal(f.counts().writes, 0);
  assert.deepEqual(routes.listOwn.accessGroups, ['customerUserGroup']);
});


for (const customer of [false, true]) for (const consideration of ['CERTIFICATES', 'BOTH'])
  test(`${customer ? 'Customer' : 'Enterprise'} ${consideration} coupon finality blocks preview and create through canonical policy`, async t => {
    const f = fixture(t, customer), original = structuredClone(f.authData);
    Object.assign(f.entitlement, { providerOwner: 'promotion', digitalDeliveryType: 'COUPON_CODE',
      purchasePolicy: { version: 2, acquisitionRequirements: { type: consideration } } });
    for (const state of ['ACTIVE', 'REDEEMED', 'EXPIRED']) {
      f.entitlement.status = state;
      for (const type of ['REFUND', 'RETURN', 'CANCELLATION', 'EXCHANGE', 'REPLACEMENT']) {
        const result = (await f.call('preview', type)).data;
        assert.equal(result.eligible, false);
        assert.equal(result.reasonCode, 'DIGITAL_COUPON_PURCHASE_FINAL');
        assert.deepEqual(result.refundMethods, []); assert.deepEqual(result.returnMethods, []);
        assert.equal(result.refundPreview, null); assert.deepEqual(result.automationPlan, []);
        assert.equal(result.enterpriseCode, 'merchant'); assert.equal(result.ownerId, 'buyer');
        await assert.rejects(f.call('create', type), { code: 'ERR_ORDER_LIFECYCLE_INELIGIBLE' });
      }
    }
    assert.equal(f.counts().writes, 0); assert.equal(f.counts().policies, 0);
    assert.deepEqual(f.authData, original);
  });

test('coupon lifecycle refuses unavailable or malformed canonical revocation policy', async t => {
  const f = fixture(t);
  Object.assign(f.entitlement, { providerOwner: 'promotion', digitalDeliveryType: 'COUPON_CODE', purchasePolicy: { version: 2 } });
  for (const revocationPolicy of [undefined, () => ({ refundable: true, policyDecision: 'UNKNOWN' }),
    () => ({ refundable: 'false', policyDecision: 'BLOCKED' })]) {
    SERVICE.DefaultDigitalCommerceEntitlementService = { ...digital, revocationPolicy };
    await assert.rejects(f.call('preview', 'REFUND'), /Digital lifecycle policy is unavailable/);
    await assert.rejects(f.call('create', 'REFUND'), /Digital lifecycle policy is unavailable/);
  }
  assert.equal(f.counts().writes, 0);
});
