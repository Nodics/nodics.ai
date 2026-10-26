/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module checkoutCore/test/checkoutOwnerBoundarySerialization @description Actual owner-built Payment HTTP payload and Order schema/BSON boundaries; transport authentication and storage are isolated, no live funds. @owner checkoutCore @layer test */
const test = require('node:test'), assert = require('node:assert/strict');
const { BSON } = require('mongodb');
const path = require('node:path');
const root = path.resolve(__dirname, '../../../../../..');
const load = file => require(path.join(root, file));
const ports = require('../src/service/defaultCheckoutPlacementPortsService');
const paymentBase = 'nodics.commerce/modules/payment/modules/';
const methodRoot = paymentBase + 'paymentMethods/modules/loyaltyRewardPayment/';
const providerRoot = paymentBase + 'paymentProviders/modules/loyaltyRewardProvider/';
const provider = load(providerRoot + 'src/service/defaultLoyaltyRewardPaymentProviderService');
const loyalty = load('nodics.loyalty/modules/loyaltyWallet/src/service/defaultLoyaltyRewardOperationService');

function setup(t, schema) {
  const keys = ['SERVICE', 'FACADE', 'CONFIG', 'UTILS'], old = keys.map(key => [key, global[key]]);
  t.after(() => old.forEach(([key, value]) => { if (value === undefined) delete global[key]; else global[key] = value; }));
  global.CONFIG = { get: key => ({
    loyaltyRewardPayment: load(methodRoot + 'config/properties').loyaltyRewardPayment,
    loyaltyRewardProvider: load(providerRoot + 'config/properties').loyaltyRewardProvider,
    loyalty: load('nodics.loyalty/modules/loyaltyCore/config/properties').loyalty,
  })[key] };
  global.UTILS = { normalizeString: value => typeof value === 'string' ? value.trim() : '' };
  global.SERVICE = {
    DefaultExactAmountService: load('nodics.commerce/modules/baseCommerce/modules/pricing/src/service/defaultExactAmountService'),
    DefaultLoyaltyAmountService: load('nodics.loyalty/modules/loyaltyCore/src/service/defaultLoyaltyAmountService'),
    DefaultLoyaltyRewardPaymentMethodService: load(methodRoot + 'src/service/defaultLoyaltyRewardPaymentMethodService'),
  };
  const ownerRef = { module: 'profile', schema, code: 'canonical-owner' };
  return { tenant: 'tenant', enterpriseCode: 'merchant', participantEnterpriseCode: 'participant',
    ownerId: ownerRef.code, ownerRef, actorRef: { code: 'signed-actor' },
    authData: { tenant: 'tenant', enterpriseCode: 'participant', tokenType: 'access',
      principalType: schema === 'customer' ? 'customer' : 'human', principalId: 'signed-actor', loginId: 'login' },
    authorization: 'Bearer isolated-original', idempotencyKey: 'original-command', correlationId: 'correlation',
    payload: { cartCode: 'cart', orderCode: 'order', paymentMethod: 'LOYALTY_REWARD', walletCode: 'wallet',
      programCode: 'circa', rewardTypeCode: 'points' } };
}

for (const schema of ['customer', 'enterprise']) for (const operation of ['AUTHORIZE', 'CAPTURE', 'VOID', 'REFUND'])
test(schema + ' ' + operation + ' payload survives JSON HTTP controller/facade and Loyalty owner normalization', async t => {
  const request = setup(t, schema), before = structuredClone(request);
  const method = ports.preparePaymentMethod(request, { totalAmount: '50', currency: 'POINTS' });
  assert.equal(method.ownerId, request.ownerRef.code);
  assert.deepEqual(method.ownerRef, request.ownerRef);
  assert.equal(method.enterpriseCode, 'participant');
  assert.equal(method.authData.principalId, 'signed-actor');
  const payment = { ...method, providerReference: 'original-reference' };
  const payload = provider.loyaltyPayload(payment, operation);
  const controller = load('nodics.loyalty/modules/loyaltyApi/src/controller/defaultLoyaltyInternalController');
  const routes = load('nodics.loyalty/modules/loyaltyApi/src/router/routers');
  const routeName = { AUTHORIZE: 'reserveRewards', CAPTURE: 'captureReservation', VOID: 'releaseReservation', REFUND: 'reverseLedgerEntry' }[operation];
  const route = routes.loyaltyApi.internal[routeName];
  assert(route); assert.deepEqual(route.authTokenTypes, ['service']);
  global.FACADE = { DefaultLoyaltyInternalFacade: load('nodics.loyalty/modules/loyaltyApi/src/facade/defaultLoyaltyInternalFacade') };
  const runtimeAuth = { tenant: 'tenant', principalType: 'service', tokenType: 'service', principalId: 'runtime' };
  let normalized;
  SERVICE.DefaultLoyaltyRewardOperationService = { [provider.operationName(operation)]: async r => {
    normalized = loyalty.operationRequest(r, operation);
    assert.deepEqual(normalized.authData, runtimeAuth, 'body authData never replaces verified HTTP authority');
    return { accepted: true };
  } };
  SERVICE.DefaultModuleService = { invokeModule: async options => {
    const params = operation === 'AUTHORIZE' ? {} : operation === 'REFUND'
      ? { entryCode: 'original-reference' } : { reservationCode: 'original-reference' };
    const expectedPath = Object.entries(params).reduce((value, [key, code]) => value.replace(':' + key, encodeURIComponent(code)), route.key);
    assert.equal(options.apiName, expectedPath); assert.equal(options.methodName, route.method);
    return controller[route.operation]({ tenant: 'tenant', authData: runtimeAuth,
      httpRequest: { params, body: JSON.parse(JSON.stringify(options.requestBody)), headers: { 'Idempotency-Key': options.idempotencyKey } } });
  } };
  await provider.invokeLoyalty(payment, operation, payload);
  if (operation === 'REFUND') assert.equal(normalized.reversalOfEntryCode, 'original-reference');
  else if (operation !== 'AUTHORIZE') assert.equal(normalized.reservationCode, 'original-reference');
  assert.equal(normalized.walletCode, 'wallet'); assert.equal(normalized.programCode, 'circa');
  assert.equal(normalized.rewardTypeCode, 'points'); assert.equal(normalized.amount, '50.00');
  assert.equal(normalized.targetCode, 'order'); assert.equal(normalized.targetType, 'ORDER');
  assert.equal(normalized.sourceType, 'PAYMENT'); assert.equal(normalized.idempotencyKey, 'original-command:payment');
  assert.deepEqual(request, before);
});

test('actual Order and entry writes preserve canonical ownership through BSON and owning schema declarations', async t => {
  const request = setup(t, 'customer'), writes = [];
  const schemas = require('../../order/src/schemas/schemas').order;
  SERVICE.DefaultCartOperationService = { cartSnapshot: async () => ({ tenant: request.tenant,
    enterpriseCode: 'merchant', ownerId: request.ownerId, code: 'cart', storeCode: 'store' }) };
  for (const [service, schema] of [['DefaultCommerceOrderService', 'commerceOrder'], ['DefaultCommerceOrderEntryService', 'commerceOrderEntry']]) {
    SERVICE[service] = { save: async r => {
      const persisted = BSON.deserialize(BSON.serialize(r.model));
      for (const [field, definition] of Object.entries(schemas[schema].definition)) {
        const value = persisted[field];
        if (definition.required) assert.notEqual(value, undefined, schema + '.' + field);
        if (value === undefined) continue;
        if (definition.type === 'int') assert(Number.isSafeInteger(value), field);
        else if (definition.type === 'date') assert(value instanceof Date, field);
        else assert.equal(typeof value, definition.type, field);
      }
      assert.equal(persisted.ownerId, 'canonical-owner');
      assert.deepEqual(persisted.evidence.ownerRef, request.ownerRef);
      assert.deepEqual(persisted.evidence.actorRef, request.actorRef);
      assert.equal(persisted.enterpriseCode, 'merchant');
      assert.equal(persisted.evidence.participantEnterpriseCode, 'participant');
      writes.push(persisted); return { code: 'SUC_SAVE', result: persisted };
    } };
  }
  await ports.create().createOrder(request, { code: 'calculation', currency: 'POINTS', subtotal: '50', taxAmount: '0', totalAmount: '50',
    entries: [{ code: 'entry', productCode: 'product', sku: 'sku', quantity: '1', priceDecision: { unitAmount: '50', totalAmount: '50' } }] },
  [], { providerReference: 'hold', methodCode: 'LOYALTY_REWARD', providerCode: 'loyalty-reward-points' }, [{ code: 'coupon', entryCode: 'entry' }]);
  assert.equal(writes.length, 2);
  assert.deepEqual(writes[0].evidence.digitalReservationCodes, ['coupon']);
});
