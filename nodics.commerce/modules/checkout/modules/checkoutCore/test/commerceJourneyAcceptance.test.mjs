/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { runCommerceJourneyAcceptance } from '../src/service/acceptance/defaultCommerceJourneyAcceptanceService.mjs';

const routes = ['product/v0/products/discovery', 'product/v0/products/{productCode}', 'cart/v0/carts', 'cart/v0/carts/{cartCode}',
  'cart/v0/carts/{cartCode}/entries', 'cart/v0/carts/{cartCode}/entries/{entryCode}', 'cart/v0/carts/{cartCode}/calculations',
  'checkoutCore/v0/checkouts/place', 'fulfillmentCore/v0/shipping/methods', 'fulfillmentCore/v0/returns/methods',
  'order/v0/orders/{orderCode}', 'order/v0/orders', 'order/v0/orders/{orderCode}/lifecycle/preview', 'order/v0/orders/{orderCode}/lifecycle',
  'shoppingList/v0/lists/{listType}', 'shoppingList/v0/lists/{listType}/entries', 'shoppingList/v0/lists/{listType}/entries/{entryCode}',
  'promotion/v0/promotions/preview', 'promotion/v0/promotions/apply'];
const fixture = {
  productCode: 'partnerLamp', variantCode: 'partnerLampGreen', secondaryProductCode: 'partnerDesk', secondaryVariantCode: 'partnerDeskOak',
  categoryCode: 'lighting', storeCode: 'partnerHome', locale: 'fr', channelCode: 'web', jurisdiction: 'FR', currency: 'EUR',
  promotionCode: 'partnerAcceptance', providerToken: 'sandbox-token', shippingAddress: { line1: 'Test address', country: 'FR' },
  shippingMethod: 'STANDARD', paymentMethod: 'CARD',
};
const configuration = { topology: { groups: { backends: ['PLATFORM', 'COMMERCE'].map((role, i) => ({ role, server: 'partner' + i, host: 'localhost', port: 18000 + i })) } } };

function harness({ reject, rejectStatus = 403, rejectMessage = 'Denied', missingStep, leak, invalidContract, allowNonOwner = false, coupon = false,
  previewSelection, decisionCampaign = fixture.promotionCode, decisionVersion = '2', decisionVersionId,
  checkoutCampaign = fixture.promotionCode, missingCommit = false, checkoutStatus = 'COMPLETED', checkoutRedemptionCode = 'checkout-redemption',
  checkoutCouponCode = coupon ? 'purchased-coupon-row' : undefined,
  orderCampaign = fixture.promotionCode, orderCartCode, orderCouponCode = coupon ? 'purchased-coupon-row' : undefined,
  cartStore = fixture.storeCode, invalidCalculation = false } = {}) {
  const calls = [];
  let cart;
  let orderCode;
  let primary;
  const lists = new Map();
  const entries = [];
  const campaign = { code: fixture.promotionCode, revision: 2, versionId: 0, ...(coupon ? {
    conditions: { couponRequired: true, customerOwnsCouponCode: true, sourceProductCode: 'purchasedDigitalProduct', sourceDigitalDeliveryType: 'COUPON_CODE' },
  } : {}) };
  const selection = previewSelection ?? [campaign];
  const decision = () => ({ promotionCode: decisionCampaign, targetType: 'CART', targetCode: cart.code, ruleVersion: decisionVersion,
    ...(decisionVersionId !== undefined ? { versionId: decisionVersionId } : {}), discountAmount: '12.90' });
  const response = (value, status = 200) => new Response(JSON.stringify(value), { status });
  const fetch = async (url, options) => {
    const path = new URL(url).pathname;
    const body = options.body ? JSON.parse(options.body) : {};
    calls.push({ path, body, options });
    if (reject && path.includes(reject)) return response({ message: rejectMessage }, rejectStatus);
    if (path.endsWith('/contract/openapi')) return response({ paths: Object.fromEntries(routes.map(route => ['/nodics/' + route, invalidContract ? {} : { get: {}, post: {}, put: {}, patch: {}, delete: {} }])) });
    if (path.endsWith('/customer/signup')) return response({ code: body.code });
    if (path.endsWith('/customer/authenticate')) { primary ||= body.loginId; return response({ authToken: body.loginId }); }
    if (path.endsWith('/products/discovery')) return response({ products: [{ productCode: fixture.productCode, ...(leak ? { supplierCost: '9' } : {}) }], discovery: { source: 'SEARCH_INDEX' } });
    if (path.includes('/products/')) return response({ product: { productCode: fixture.productCode } });
    if (path.endsWith('/shipping/methods') || path.endsWith('/returns/methods')) return response([]);
    if (path.includes('/promotion/')) {
      assert(cart, 'promotion operations require an already persisted cart');
      assert.equal(options.headers.Authorization, 'Bearer ' + primary);
      assert.equal(body.cartCode, cart.code);
      assert.equal(body.storeCode, cart.storeCode);
      assert.equal(body.currency, cart.currency);
      assert.equal(body.subtotal, '129.00');
      assert.deepEqual(body.productCodes, entries.map(entry => entry.productCode));
      assert.equal(body.couponCode, coupon ? 'legitimately-purchased-token' : undefined);
      if (path.endsWith('/promotions/preview')) return response({ cartCode: body.cartCode, selected: selection, redemptionStateMutation: 'NONE' });
      throw new Error('Standalone promotion apply, authoring or coupon issuance is forbidden: ' + path);
    }
    if (path.includes('/lists/')) {
      const listType = path.split('/')[5];
      if (options.method === 'POST') lists.set(listType, { code: listType, productCode: body.productCode, variantCode: body.variantCode });
      return response({ entries: [lists.get(listType)] });
    }
    if (path.endsWith('/carts') && options.method === 'POST') { cart = { code: body.cartCode, storeCode: cartStore, currency: body.currency, revision: 1 }; return response({ cart }); }
    if (path.includes('/cart/')) {
      if (options.headers.Authorization !== 'Bearer ' + primary && !allowNonOwner) return response({}, 403);
      if (path.endsWith('/entries') && options.method === 'POST') entries.push({ code: body.productCode, productCode: body.productCode });
      if (options.method === 'DELETE') entries.splice(entries.findIndex(entry => path.endsWith('/' + entry.code)), 1);
      if (path.endsWith('/calculations')) {
        assert.equal(body.couponCode, coupon ? 'legitimately-purchased-token' : undefined);
        return response({ code: body.calculationCode, cartCode: invalidCalculation ? 'foreign-cart' : cart.code, cartRevision: cart.revision,
          currency: cart.currency, subtotal: '129.00', entries, decisions: { discount: decision() } });
      }
      return response({ cart, entries });
    }
    if (path.endsWith('/checkouts/place')) {
      orderCode = body.orderCode;
      assert.equal(body.couponCode, coupon ? 'legitimately-purchased-token' : undefined);
      return response({ code: orderCode, status: checkoutStatus, evidence: {
        orderCode, completed: missingCommit ? [] : ['PROMOTION_COMMITTED'],
        promotionCode: checkoutCampaign, promotionRedemptionCode: checkoutRedemptionCode, couponCode: checkoutCouponCode,
      } });
    }
    if (path.endsWith('/lifecycle/preview')) {
      const automationPlan = [ ['reservation-release', 'inventory'], ['return-logistics', 'fulfillment'], ['inspection-disposition', 'fulfillment+inventory'],
        ['refund-reconciliation', 'payment'], ['replacement-reservation', 'inventory'], ['exchange-shipment', 'fulfillment'], ['appeal-sla-review', 'workflow+order'] ]
        .filter(([step]) => step !== missingStep).map(([step, owner]) => ({ step, owner }));
      return response({ automationPlan, returnMethods: [], refundMethods: [] });
    }
    if (path.endsWith('/lifecycle')) return response({ status: 'SUBMITTED' });
    if (path.includes('/orders/')) {
      if (options.headers.Authorization !== 'Bearer ' + primary && !allowNonOwner) return response({}, 404);
      return response({ order: { code: orderCode, cartCode: orderCartCode === undefined ? cart.code : orderCartCode,
        promotionCode: orderCampaign, couponCode: orderCouponCode } });
    }
    throw new Error('Unexpected request: ' + path);
  };
  return { calls, options: { execute: true, configuration, acceptance: { ...fixture, ...(coupon ? { couponCode: 'legitimately-purchased-token' } : {}) },
    environment: { AXIS_AUTH_TOKEN: 'operator', NODICS_ACCEPTANCE_ORIGIN: 'http://partner.test', ...(coupon ? {
      NODICS_STOREFRONT_CUSTOMER_LOGIN_ID: 'purchasing-customer@example.com', NODICS_STOREFRONT_CUSTOMER_PASSWORD: 'existing-password',
    } : {}) }, fetch } };
}

test('independent partner fixture completes every customer journey and both ownership denials', async () => {
  const h = harness();
  assert.equal((await runCommerceJourneyAcceptance(h.options)).state, 'PASSED');
  const checkout = h.calls.find(call => call.path.endsWith('/checkouts/place'));
  assert.equal(checkout.body.providerToken, fixture.providerToken);
  assert.deepEqual(checkout.body.shippingAddress, fixture.shippingAddress);
  for (const type of ['CANCELLATION', 'RETURN', 'REFUND', 'EXCHANGE', 'APPEAL']) assert(h.calls.some(call => call.body.requestType === type));
  assert.equal(h.calls.filter(call => call.path.endsWith('/customer/signup')).length, 2);
  assert(h.calls.some(call => call.options.method === 'DELETE'));
  assert(h.calls.some(call => call.options.method === 'PATCH'));
  assert.deepEqual(h.calls.filter(call => call.path.includes('/promotion/')).map(call => call.path), [
    '/nodics/promotion/v0/promotions/preview',
  ]);
  assert.equal(h.calls.filter(call => call.path.endsWith('/checkouts/place')).length, 1);
  assert(!h.calls.some(call => call.options.method === 'PUT'));
});
test('purchased coupon is quoted and placed by its existing customer without pre-consuming or issuing it', async () => {
  const h = harness({ coupon: true });
  const result = await runCommerceJourneyAcceptance(h.options);
  assert.equal(result.state, 'PASSED');
  const promotionCalls = h.calls.filter(call => call.path.includes('/promotion/'));
  assert.deepEqual(promotionCalls.map(call => call.path), ['/nodics/promotion/v0/promotions/preview']);
  assert.equal(promotionCalls[0].body.cartCode, result.cartCode);
  assert.equal(promotionCalls[0].body.storeCode, fixture.storeCode);
  assert.equal(promotionCalls[0].options.headers.Authorization, 'Bearer purchasing-customer@example.com');
  assert(!h.calls.some(call => call.path.endsWith('/customer/signup') && call.body.loginId === 'purchasing-customer@example.com'));
  assert(h.calls.some(call => call.path.endsWith('/checkouts/place') && call.body.couponCode === h.options.acceptance.couponCode));
});
test('coupon fixture requires its existing purchasing customer before network', async () => {
  const h = harness({ coupon: true });
  delete h.options.environment.NODICS_STOREFRONT_CUSTOMER_LOGIN_ID;
  await assert.rejects(runCommerceJourneyAcceptance(h.options), /requires existing primary customer/);
  assert.equal(h.calls.length, 0);
});
test('empty or invalid coupon fixtures fail before network', async () => {
  for (const couponCode of ['', ' ', 1, null]) {
    const h = harness();
    await assert.rejects(runCommerceJourneyAcceptance({ ...h.options, acceptance: { ...fixture, couponCode } }), /couponCode must/);
    assert.equal(h.calls.length, 0);
  }
});
test('absent or mismatched preview campaign fails before apply or checkout', async () => {
  for (const previewSelection of [[], [{ code: 'other-campaign' }]]) {
    const h = harness({ previewSelection });
    await assert.rejects(runCommerceJourneyAcceptance(h.options), /preview did not select configured campaign/);
    assert(!h.calls.some(call => call.path.endsWith('/promotions/apply') || call.path.endsWith('/checkouts/place')));
  }
});
test('all campaigns require checkout commit, redemption and order campaign/cart evidence', async () => {
  for (const coupon of [false, true]) {
    for (const changes of [{ checkoutCampaign: null }, { checkoutCampaign: 'other-campaign' }, { missingCommit: true },
      { checkoutStatus: 'PENDING' }, { checkoutRedemptionCode: null }, { orderCampaign: null },
      { orderCampaign: 'other-campaign' }, { orderCartCode: 'foreign-cart' }]) {
      const h = harness({ coupon, ...changes });
      await assert.rejects(runCommerceJourneyAcceptance(h.options), /Checkout promotion apply|Customer order did not retain/);
      assert(!h.calls.some(call => call.path.endsWith('/promotions/apply')));
    }
  }
});
test('exposed immutable identity and decision rule version must agree', async () => {
  for (const changes of [
    { previewSelection: [{ code: fixture.promotionCode, revision: 2, versionId: '' }] },
    { previewSelection: [{ code: fixture.promotionCode, revision: 2, versionId: null }] },
    { previewSelection: [{ code: fixture.promotionCode, revision: 2, versionId: -1 }] },
    { previewSelection: [{ code: fixture.promotionCode, revision: 2, versionId: 0.5 }] },
    { previewSelection: [{ code: fixture.promotionCode, revision: 2, versionId: '0' }] },
    { previewSelection: [{ code: fixture.promotionCode, revision: 2, versionId: Number.MAX_SAFE_INTEGER + 1 }] },
    { decisionVersionId: 'different-version' },
    { decisionVersion: '3' },
  ]) await assert.rejects(runCommerceJourneyAcceptance(harness(changes).options), /version/);
  assert.equal((await runCommerceJourneyAcceptance(harness({ decisionVersionId: 0 }).options)).state, 'PASSED');
  assert.equal((await runCommerceJourneyAcceptance(harness({ previewSelection: [{ code: fixture.promotionCode, revision: 2, versionId: 3 }], decisionVersionId: 3 }).options)).state, 'PASSED');
});
test('owner responses without immutable version identity retain campaign and cart assertions', async () => {
  const h = harness({ previewSelection: [{ code: fixture.promotionCode, revision: 2 }] });
  assert.equal((await runCommerceJourneyAcceptance(h.options)).state, 'PASSED');
});
test('foreign persisted Store or calculation cannot supply promotion context', async () => {
  for (const changes of [{ cartStore: 'foreign-store' }, { invalidCalculation: true }]) {
    const h = harness(changes);
    await assert.rejects(runCommerceJourneyAcceptance(h.options), /cart creation|cart pricing context/);
    assert(!h.calls.some(call => call.path.includes('/promotion/')));
  }
});
test('cart quote must bind the configured campaign before promotion application', async () => {
  await assert.rejects(runCommerceJourneyAcceptance(harness({ decisionCampaign: 'other-campaign' }).options), /Cart promotion quote/);
});
test('purchased coupon additionally requires checkpoint and matching order coupon record evidence', async () => {
  for (const changes of [{ checkoutCouponCode: null }, { orderCouponCode: null }, { orderCouponCode: 'other-coupon-row' }]) {
    const h = harness({ coupon: true, ...changes });
    await assert.rejects(runCommerceJourneyAcceptance(h.options), /Checkout promotion apply|Customer order did not retain/);
  }
});
test('unavailable Profile membership propagates without customer provisioning or qualification bypass', async () => {
  const h = harness({ reject: '/customer/signup', rejectStatus: 503, rejectMessage: 'ERR_PROFILE_MEMBERSHIP_UNAVAILABLE' });
  await assert.rejects(runCommerceJourneyAcceptance(h.options), /HTTP 503.*ERR_PROFILE_MEMBERSHIP_UNAVAILABLE/);
  assert.equal(h.calls.filter(call => call.path.endsWith('/customer/signup')).length, 1);
  assert(!h.calls.some(call => call.path.endsWith('/customer/authenticate') || call.path.includes('/cart/') || call.path.includes('/promotion/')));
});
test('explicit intent and complete fixture required before network', async () => {
  await assert.rejects(runCommerceJourneyAcceptance(), /--execute/);
  const h = harness();
  await assert.rejects(runCommerceJourneyAcceptance({ ...h.options, acceptance: {} }), /requires fixture/);
  assert.equal(h.calls.length, 0);
});
test('permission denial is not treated as an existing customer', async () => {
  const h = harness({ reject: '/customer/signup' });
  await assert.rejects(runCommerceJourneyAcceptance(h.options), /HTTP 403/);
  assert(!h.calls.some(call => call.path.endsWith('/checkouts/place')));
});
test('Cart and Promotion owner denials propagate without authoring repair or checkout', async () => {
  for (const reject of ['/calculations', '/promotions/preview', '/checkouts/place']) {
    const h = harness({ reject });
    await assert.rejects(runCommerceJourneyAcceptance(h.options), /HTTP 403/);
    if (reject !== '/checkouts/place') assert(!h.calls.some(call => call.path.endsWith('/checkouts/place')));
    assert(!h.calls.some(call => call.path.includes('/promotion/') && call.path !== '/nodics/promotion/v0/promotions/preview'));
  }
});
test('customer field leakage fails acceptance', async () => {
  await assert.rejects(runCommerceJourneyAcceptance(harness({ leak: true }).options), /leaked backend-only field/);
});
test('empty route declarations do not establish effective API operations', async () => {
  const h = harness({ invalidContract: true });
  await assert.rejects(runCommerceJourneyAcceptance(h.options), /contract is missing/);
  assert.equal(h.calls.length, 1);
});
test('missing reverse-lifecycle automation fails acceptance', async () => {
  await assert.rejects(runCommerceJourneyAcceptance(harness({ missingStep: 'refund-reconciliation' }).options), /automation step/);
});
test('non-owner access succeeds only by causing acceptance failure', async () => {
  await assert.rejects(runCommerceJourneyAcceptance(harness({ allowNonOwner: true }).options), /unexpectedly allowed non-owner/);
});
test('help remains inert without project configuration', () => {
  const result = spawnSync(process.execPath, [new URL('../src/service/acceptance/defaultCommerceJourneyAcceptanceService.mjs', import.meta.url).pathname, '--help'], { cwd: '/', encoding: 'utf8', env: { PATH: process.env.PATH } });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /--execute/);
});
test('import remains inert without project configuration or network', () => {
  const moduleUrl = new URL('../src/service/acceptance/defaultCommerceJourneyAcceptanceService.mjs', import.meta.url).href;
  const source = `globalThis.fetch = () => { throw new Error('Unexpected network'); }; const module = await import(${JSON.stringify(moduleUrl)}); if (typeof module.runCommerceJourneyAcceptance !== 'function') throw new Error('Missing export');`;
  const result = spawnSync(process.execPath, ['--input-type=module', '--eval', source], { cwd: '/', encoding: 'utf8', env: { PATH: process.env.PATH } });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, '');
});
