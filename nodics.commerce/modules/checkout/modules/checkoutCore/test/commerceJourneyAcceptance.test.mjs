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
  'promotion/v0/promotions/preview', 'promotion/v0/promotions/apply', 'promotion/v0/promotions/drafts'];
const fixture = {
  productCode: 'partnerLamp', variantCode: 'partnerLampGreen', secondaryProductCode: 'partnerDesk', secondaryVariantCode: 'partnerDeskOak',
  categoryCode: 'lighting', storeCode: 'partnerHome', locale: 'fr', channelCode: 'web', jurisdiction: 'FR', currency: 'EUR',
  promotionCode: 'partnerAcceptance', providerToken: 'sandbox-token', shippingAddress: { line1: 'Test address', country: 'FR' },
  shippingMethod: 'STANDARD', paymentMethod: 'CARD',
};
const configuration = { topology: { groups: { backends: ['PLATFORM', 'COMMERCE'].map((role, i) => ({ role, server: 'partner' + i, host: 'localhost', port: 18000 + i })) } } };

function harness({ reject, missingStep, leak, invalidContract, allowNonOwner = false } = {}) {
  const calls = [];
  let cart;
  let orderCode;
  let primary;
  const lists = new Map();
  const entries = [];
  const response = (value, status = 200) => new Response(JSON.stringify(value), { status });
  const fetch = async (url, options) => {
    const path = new URL(url).pathname;
    const body = options.body ? JSON.parse(options.body) : {};
    calls.push({ path, body, options });
    if (reject && path.includes(reject)) return response({ message: 'Denied' }, 403);
    if (path.endsWith('/contract/openapi')) return response({ paths: Object.fromEntries(routes.map(route => ['/nodics/' + route, invalidContract ? {} : { get: {}, post: {}, put: {}, patch: {}, delete: {} }])) });
    if (path.endsWith('/customer/signup')) return response({ code: body.code });
    if (path.endsWith('/customer/authenticate')) { primary ||= body.loginId; return response({ authToken: body.loginId }); }
    if (path.endsWith('/products/discovery')) return response({ products: [{ productCode: fixture.productCode, ...(leak ? { supplierCost: '9' } : {}) }], discovery: { source: 'SEARCH_INDEX' } });
    if (path.includes('/products/')) return response({ product: { productCode: fixture.productCode } });
    if (path.endsWith('/shipping/methods') || path.endsWith('/returns/methods')) return response([]);
    if (path.endsWith('/promotions/drafts')) return response({ promotion: { code: body.code, status: 'ACTIVE' } });
    if (path.endsWith('/promotions/preview')) return response({ selected: [{ code: fixture.promotionCode }], redemptionStateMutation: 'NONE' });
    if (path.endsWith('/promotions/apply')) return response({ applied: true, redemptionStateMutation: 'COMMITTED', redemption: { code: 'redemption' } });
    if (path.includes('/lists/')) {
      const listType = path.split('/')[5];
      if (options.method === 'POST') lists.set(listType, { code: listType, productCode: body.productCode, variantCode: body.variantCode });
      return response({ entries: [lists.get(listType)] });
    }
    if (path.endsWith('/carts') && options.method === 'POST') { cart = { code: body.cartCode, revision: 1 }; return response({ cart }); }
    if (path.includes('/cart/')) {
      if (options.headers.Authorization !== 'Bearer ' + primary && !allowNonOwner) return response({}, 403);
      if (path.endsWith('/entries') && options.method === 'POST') entries.push({ code: body.productCode, productCode: body.productCode });
      return response({ cart, entries });
    }
    if (path.endsWith('/checkouts/place')) { orderCode = body.orderCode; return response({ orderCode }); }
    if (path.endsWith('/lifecycle/preview')) {
      const automationPlan = [ ['reservation-release', 'inventory'], ['return-logistics', 'fulfillment'], ['inspection-disposition', 'fulfillment+inventory'],
        ['refund-reconciliation', 'payment'], ['replacement-reservation', 'inventory'], ['exchange-shipment', 'fulfillment'], ['appeal-sla-review', 'workflow+order'] ]
        .filter(([step]) => step !== missingStep).map(([step, owner]) => ({ step, owner }));
      return response({ automationPlan, returnMethods: [], refundMethods: [] });
    }
    if (path.endsWith('/lifecycle')) return response({ status: 'SUBMITTED' });
    if (path.includes('/orders/')) {
      if (options.headers.Authorization !== 'Bearer ' + primary && !allowNonOwner) return response({}, 404);
      return response({ order: { code: orderCode } });
    }
    throw new Error('Unexpected request: ' + path);
  };
  return { calls, options: { execute: true, configuration, acceptance: fixture, environment: { AXIS_AUTH_TOKEN: 'operator', NODICS_ACCEPTANCE_ORIGIN: 'http://partner.test' }, fetch } };
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
