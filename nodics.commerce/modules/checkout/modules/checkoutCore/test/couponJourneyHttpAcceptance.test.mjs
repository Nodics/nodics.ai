/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import * as acceptance from '../src/service/acceptance/defaultCouponJourneyHttpAcceptanceService.mjs';

const require = createRequire(import.meta.url);
const properties = require('../config/properties');

function response(value, status = 200, noStore = false) {
  return new Response(JSON.stringify({ data: value }), { status,
    headers: noStore ? { 'Cache-Control': 'no-store' } : {} });
}

function acquisitionHarness(change = {}) {
  const cases = [
    { caseCode: 'rewards', considerationType: 'REWARDS', productCode: 'coupon-rewards', sku: 'coupon-rewards-sku',
      promotionCode: 'offer-rewards', expectedTotal: '10', certificateCodes: [] },
    { caseCode: 'certificates', considerationType: 'CERTIFICATES', productCode: 'coupon-certificates', sku: 'coupon-certificates-sku',
      promotionCode: 'offer-certificates', expectedTotal: '0', certificateCodes: ['certificate-1'] },
    { caseCode: 'both', considerationType: 'BOTH', productCode: 'coupon-both', sku: 'coupon-both-sku',
      promotionCode: 'offer-both', expectedTotal: '5', certificateCodes: ['certificate-2'] },
  ];
  const selection = { contractVersion: 2, approvalReference: 'reviewed-local', localDemo: true, tenant: 'default', runCode: 'coupon-acceptance',
    customer: { ownerId: 'buyer', enterpriseCode: 'buyer-enterprise' },
    policyReview: { enterpriseCode: 'buyer-enterprise', comment: 'Verify final purchased coupon policy' },
    cart: { storeCode: 'shop', channelCode: 'web', locale: 'en', jurisdiction: 'AE', currency: 'POINTS' },
    payment: { paymentMethod: 'LOYALTY_REWARD', walletCode: 'wallet', programCode: 'circa', rewardTypeCode: 'points', rewardCurrency: 'POINTS' },
    cases };
  const sessions = { customer: { authorization: 'Bearer PRIVATE_CUSTOMER', enterpriseCode: 'buyer-enterprise' },
    reviewer: { authorization: 'Bearer PRIVATE_REVIEWER', enterpriseCode: 'buyer-enterprise' } };
  const carts = new Map(), orders = new Map(), entitlements = new Map(), reviews = new Map(), calls = [], snapshots = [];
  let checkpoint, placements = 0;
  const ids = value => { const root = selection.runCode + ':' + value.caseCode; return { cart: root + ':cart', entry: root + ':entry',
    calculation: root + ':calculation', order: root + ':order', purchase: root + ':purchase', dispute: root + ':refund-policy' }; };
  const selected = text => cases.find(value => text.includes(':' + value.caseCode + ':'));
  const fetch = async (url, input) => {
    const route = decodeURIComponent(url.pathname), body = input.body ? JSON.parse(input.body) : {}, key = input.headers['Idempotency-Key'];
    calls.push({ route, method: input.method, body, key, authorization: input.headers.Authorization });
    if (change.privateFailure) throw new Error('PRIVATE_RUNTIME_DETAIL');
    const value = selected(route + ' ' + JSON.stringify(body));
    if (route === '/nodics/cart/v0/carts') {
      const id = ids(value), cart = { code: id.cart, ownerId: 'buyer', enterpriseCode: 'buyer-enterprise', revision: 0,
        storeCode: 'shop', currency: 'POINTS' }; carts.set(id.cart, { cart, entries: [] }); return response({ cart, entries: [] });
    }
    if (route.startsWith('/nodics/cart/v0/carts/')) {
      const cartCode = route.split('/')[5], current = carts.get(cartCode);
      if (!current) return response({}, 404);
      if (route.endsWith('/entries')) current.entries.push({ code: body.entryCode, productCode: body.productCode, sku: body.sku, quantity: body.quantity });
      if (route.endsWith('/calculations')) return response({ cartCode, currency: 'POINTS', totalAmount: value.expectedTotal,
        entries: current.entries.map(entry => ({ ...entry })) });
      return response({ cart: current.cart, entries: current.entries });
    }
    if (route === '/nodics/checkoutCore/v0/checkouts/place') {
      const id = ids(value); assert.equal(key, id.purchase); placements++;
      if (value.considerationType === 'CERTIFICATES') {
        assert.equal(body.paymentMethod, undefined); assert.equal(body.walletCode, undefined);
      } else assert.equal(body.paymentMethod, 'LOYALTY_REWARD');
      assert.deepEqual(body.couponSelections, value.certificateCodes.length ? { [id.entry]: [value.certificateCodes] } : undefined);
      const payment = value.considerationType === 'CERTIFICATES' ? {} : { paymentReference: 'payment-' + value.caseCode };
      orders.set(id.order, { code: id.order, cartCode: id.cart, ownerId: 'buyer', enterpriseCode: 'buyer-enterprise',
        status: 'COMPLETED', totalAmount: value.expectedTotal, evidence: { storeCode: 'shop', ...payment,
          ...(value.considerationType === 'CERTIFICATES' ? { considerationType: 'CERTIFICATES' } : {}) } });
      entitlements.set(id.order, { code: 'entitlement-' + value.caseCode, providerCode: 'coupon-' + value.caseCode,
        orderCode: id.order, cartCode: id.cart, orderEntryCode: id.entry, productCode: value.productCode, sku: value.sku,
        enterpriseCode: 'buyer-enterprise', ownerId: 'buyer', providerOwner: 'promotion', digitalDeliveryType: 'COUPON_CODE',
        status: 'ACTIVE', claimStatus: 'UNCLAIMED', evidence: { promotionCode: value.promotionCode } });
      return response({ status: 'COMPLETED' });
    }
    if (route.startsWith('/nodics/checkoutCore/v0/checkouts/')) {
      const orderCode = route.split('/').at(-1), order = orders.get(orderCode), selectedCase = selected(orderCode);
      if (!order) return response({ status: 'NOT_COMPLETED' });
      const completed = ['DIGITAL_SOLD', 'DIGITAL_DELIVERED', ...(selectedCase.considerationType === 'CERTIFICATES' ? [] : ['AUTHORIZED', 'PAYMENT_CAPTURED'])];
      return response({ code: orderCode, status: 'COMPLETED', evidence: { orderCode, completed } });
    }
    if (route === '/nodics/digitalCore/v0/entitlements') return response({ entitlements: [entitlements.get(url.searchParams.get('orderCode'))] });
    if (route.endsWith('/reveal')) {
      const item = [...entitlements.values()].find(entry => entry.code === route.split('/')[5]);
      return response({ status: 'REVEALED', couponCode: item.providerCode, tokenSource: 'AUTHENTICATED_RETENTION', token: 'PRIVATE_' + item.code }, 200, true);
    }
    if (route.endsWith('/disputes') && route.includes('/orders/')) {
      const orderCode = route.split('/')[5];
      if (input.method === 'GET') return response({ cases: [...reviews.values()].filter(item => item.orderCode === orderCode) });
      const review = { code: 'review-' + selected(orderCode).caseCode, orderCode, requestedResolution: body.requestedResolution,
        comment: body.comment, idempotencyKey: key, revision: 0 };
      reviews.set(review.code, review); return response(review);
    }
    if (route.endsWith('/refund-preview')) {
      assert.equal(input.headers.Authorization, sessions.reviewer.authorization);
      return response(change.refundable ? { eligible: true, previewToken: 'PRIVATE_REFUND' } :
        { eligible: false, reason: 'PURCHASE_REFUND_POLICY_REQUIRES_REVIEW' });
    }
    if (route.startsWith('/nodics/order/v0/orders/')) return response({ order: orders.get(route.split('/').at(-1)) });
    throw new Error('Unexpected route ' + route);
  };
  const options = { execute: true, baseUrl: 'http://localhost:19999', selection, sessions, fetch,
    saveCheckpoint: async value => { checkpoint = structuredClone(value); snapshots.push(value); } };
  return { options, calls, snapshots, get checkpoint() { return checkpoint; }, get placements() { return placements; } };
}

function redemptionHarness(change = {}) {
  const selected = { caseCode: 'item', orderCode: 'order-item', cartCode: 'cart-item', entryCode: 'entry-item',
    productCode: 'coupon-item', sku: 'coupon-item-sku', promotionCode: 'offer-item', issuerEnterpriseCode: 'issuer',
    outletStoreCode: 'outlet', merchantReceiptReference: 'POS:receipt:1',
    benefit: { type: 'ITEM', sourceStage: 'SIMULATED_ITEMS', items: [{ sku: 'benefit-item', quantity: 1, unit: 'EACH' }] } };
  const selection = { contractVersion: 2, approvalReference: 'reviewed-redemption', localDemo: true, tenant: 'default',
    runCode: 'coupon-redemption', customer: { ownerId: 'buyer', enterpriseCode: 'buyer-enterprise' },
    staff: { enterpriseCode: 'issuer' }, cases: [selected] };
  const sessions = { customer: { authorization: 'Bearer PRIVATE_CUSTOMER', enterpriseCode: 'buyer-enterprise' },
    staff: { authorization: 'Bearer PRIVATE_STAFF', enterpriseCode: 'issuer' } };
  const item = { code: 'entitlement-item', providerCode: 'coupon-item-code', orderCode: selected.orderCode, cartCode: selected.cartCode,
    orderEntryCode: selected.entryCode, productCode: selected.productCode, sku: selected.sku, ownerId: 'buyer',
    enterpriseCode: 'buyer-enterprise', providerOwner: 'promotion', digitalDeliveryType: 'COUPON_CODE', status: 'ACTIVE',
    claimStatus: 'UNCLAIMED', revision: 0, evidence: { promotionCode: selected.promotionCode } };
  const calls = [], snapshots = []; let checkpoint, confirmations = 0;
  const fetch = async (url, input) => {
    const route = decodeURIComponent(url.pathname), body = input.body ? JSON.parse(input.body) : {}, key = input.headers['Idempotency-Key'];
    calls.push({ route, method: input.method, body, key });
    if (change.privateFailure) throw new Error('PRIVATE_STAFF_DETAIL');
    if (route === '/nodics/system/v0/contract/openapi') return response({ paths: {
      '/nodics/digitalCore/v0/merchant/redemptions/validate': { post: {} },
      '/nodics/digitalCore/v0/merchant/redemptions/{code}/confirm': { post: {} },
      '/nodics/digitalCore/v0/merchant/redemptions/{code}/receipt/query': { post: {} },
    } });
    if (route === '/nodics/digitalCore/v0/merchant/redemptions/workspace') return response({ storeRequired: true,
      stores: change.foreignOutlet ? [{ code: 'other' }] : [{ code: 'outlet', name: 'Outlet' }] });
    if (route === '/nodics/digitalCore/v0/entitlements') return response({ entitlements: [structuredClone(item)] });
    if (route.endsWith('/reveal')) return response({ status: 'REVEALED', token: 'PRIVATE_COUPON_TOKEN' }, 200, true);
    if (route === '/nodics/digitalCore/v0/merchant/redemptions/validate') {
      if (item.claimStatus === 'REDEEMED') return response({ eligible: false, reason: 'ALREADY_REDEEMED' }, 200, true);
      return response({ eligible: true, entitlementCode: item.code, productCode: item.productCode, merchantCode: 'issuer', storeCode: 'outlet',
        storeRevision: 1, revision: item.revision, validationCode: 'PRIVATE_VALIDATION',
        validationExpiresAt: new Date(Date.now() + 120000).toISOString(), conditions: { benefit: { benefitType: 'ITEM',
          sourceStage: 'SIMULATED_ITEMS', sourceReference: selected.merchantReceiptReference, storeCode: 'outlet', storeRevision: 1,
          simulated: true, verified: false, items: selected.benefit.items } } }, 200, true);
    }
    if (route.endsWith('/confirm')) {
      confirmations++;
      if (!item.evidence.merchantRedemption) {
        assert.equal(body.expectedRevision, 0); assert.equal(body.validationCode, 'PRIVATE_VALIDATION');
        item.evidence.merchantRedemption = { confirmationKey: key, merchantReceiptReference: selected.merchantReceiptReference,
          storeRef: { code: 'outlet' } };
        item.status = 'REDEEMED'; item.claimStatus = 'REDEEMED'; item.revision++;
      }
      return response({ claimStatus: 'REDEEMED' }, 200, true);
    }
    if (route.endsWith('/receipt/query')) return response({ state: 'COMPLETED', entitlementCode: item.code, confirmationKey: key,
      merchantReceiptReference: selected.merchantReceiptReference, merchantCode: 'issuer', storeCode: 'outlet', storeRevision: 1,
      receiptCode: 'receipt-item' }, 200, true);
    throw new Error('Unexpected route ' + route);
  };
  const options = { execute: true, baseUrl: 'http://localhost:19999', selection, sessions, fetch,
    saveCheckpoint: async value => { checkpoint = structuredClone(value); snapshots.push(value); } };
  return { options, calls, snapshots, get checkpoint() { return checkpoint; }, get confirmations() { return confirmations; } };
}

test('Checkout registers canonical acquisition and redemption commands with owner defaults', () => {
  const commands = properties.tooling.commands;
  assert.deepEqual(commands['acceptance:coupon-acquisition'].arguments, ['--journey=ACQUISITION']);
  assert.deepEqual(commands['acceptance:coupon-redemption'].arguments, ['--journey=REDEMPTION']);
  for (const code of ['acceptance:coupon-acquisition', 'acceptance:coupon-redemption']) {
    assert.equal(commands[code].acceptanceContract, true);
    assert.equal(commands[code].projectHome, true);
    assert.equal(commands[code].script, 'src/service/acceptance/defaultCouponJourneyHttpAcceptanceService.mjs');
  }
  assert.deepEqual(properties.checkoutCore.couponAcceptance, { requestTimeoutMs: 30000, maximumCases: 12,
    checkpointDirectory: '.nodics/acceptance/checkout-coupon' });
  assert.equal('runCouponJourneyHttpAcceptance' in acceptance, false);
});

test('acquisition proves all three consideration modes, final issuance and non-refundable policy', async () => {
  const h = acquisitionHarness(), result = await acceptance.runCouponAcquisitionAcceptance(h.options);
  assert.equal(result.state, 'PASSED', JSON.stringify(result));
  assert.deepEqual(result.considerationTypes, ['BOTH', 'CERTIFICATES', 'REWARDS']);
  assert.equal(result.issuedCoupons, 3); assert.equal(result.purchasedCouponsRefundable, false);
  assert.equal(result.refundOrReversalExecuted, false); assert.equal(h.placements, 3);
  assert.equal(h.calls.some(call => call.route.endsWith('/refund')), false);
  assert.equal(JSON.stringify([result.checkpoint, h.snapshots]).includes('PRIVATE_'), false);
  const replay = await acceptance.runCouponAcquisitionAcceptance({ ...h.options, checkpoint: h.checkpoint });
  assert.equal(replay.state, 'PASSED'); assert.equal(h.placements, 3);
});

test('acquisition refuses missing consideration coverage and refundable preview without leaking private evidence', async () => {
  const incomplete = acquisitionHarness(); incomplete.options.selection.cases.pop();
  await assert.rejects(acceptance.runCouponAcquisitionAcceptance(incomplete.options), /ALL_COUPON_CONSIDERATION_TYPES_REQUIRED/);
  const h = acquisitionHarness({ refundable: true });
  const result = await acceptance.runCouponAcquisitionAcceptance(h.options);
  assert.equal(result.state, 'RECOVERY_REQUIRED'); assert.equal(result.reasonCode, 'PURCHASED_COUPON_NON_REFUNDABLE_POLICY_REQUIRED');
  assert.equal(JSON.stringify(result).includes('PRIVATE_'), false);
});

test('staff redemption proves workspace outlet, validate-confirm-receipt-replay and final whole use', async () => {
  const h = redemptionHarness(), result = await acceptance.runStaffCouponRedemptionAcceptance(h.options);
  assert.equal(result.state, 'PASSED', JSON.stringify(result));
  assert.equal(result.redemptions, 1); assert.equal(result.partialRedemptionSupported, false);
  assert.equal(result.completedRedemptionReversalSupported, false); assert.equal(result.receiptReplayStable, true);
  assert.equal(h.confirmations, 2);
  assert.equal(h.calls.filter(call => call.route.endsWith('/validate')).length, 2);
  assert.equal(h.calls.some(call => /partial|reverse|reversal/i.test(call.route)), false);
  const replay = await acceptance.runStaffCouponRedemptionAcceptance({ ...h.options, checkpoint: h.checkpoint });
  assert.equal(replay.state, 'PASSED'); assert.equal(h.confirmations, 2);
});

test('staff redemption refuses foreign outlet and redacts transport failures', async () => {
  const foreign = redemptionHarness({ foreignOutlet: true });
  const denied = await acceptance.runStaffCouponRedemptionAcceptance(foreign.options);
  assert.equal(denied.state, 'RECOVERY_REQUIRED'); assert.equal(denied.reasonCode, 'EXACT_OUTLET_ADMISSION_REQUIRED');
  const failed = redemptionHarness({ privateFailure: true });
  const result = await acceptance.runStaffCouponRedemptionAcceptance(failed.options);
  assert.equal(result.state, 'RECOVERY_REQUIRED'); assert.equal(result.reasonCode, 'HTTP_OUTCOME_UNCONFIRMED');
  assert.equal(JSON.stringify(result).includes('PRIVATE_'), false);
});

test('owner route declarations retain secured access sessions and no partial or reversal operation', () => {
  const checkout = require('../src/router/routers').checkoutCore.customer;
  const digital = require('../../../../digitalCommerce/modules/digitalCore/src/router/routers').digitalCore;
  const digitalEntitlements = require('../../../../digitalCommerce/modules/digitalCore/src/service/defaultDigitalCommerceEntitlementService');
  const order = require('../../order/src/router/routers').order.disputes;
  const routes = [checkout.place, checkout.status, digital.customer.listEntitlements, digital.customer.revealEntitlement,
    digital.merchant.merchantWorkspace, digital.merchant.validate, digital.merchant.confirm, digital.merchant.inspectReceipt,
    order.listOwnDisputes, order.createDispute, order.refundPreview];
  for (const route of routes) { assert.equal(route.secured, true); assert.deepEqual(route.authTokenTypes, ['access']); }
  assert.equal(Object.keys(digital.merchant).some(key => /partial|reverse|reversal/i.test(key)), false);
  assert.deepEqual(digitalEntitlements.revocationPolicy({ purchasePolicy: { version: 2 } }, 'REFUND'),
    { policyDecision: 'BLOCKED', refundable: false, reasonCode: 'DIGITAL_COUPON_PURCHASE_FINAL' });
});

test('bounded envelope parsing accepts one owner value and rejects contradictory or failed envelopes', () => {
  assert.deepEqual(acceptance.couponJourneyData({ result: { data: { state: 'OK' } } }), { state: 'OK' });
  for (const value of [{ data: {}, result: {} }, { success: false, data: {} }, { data: { code: 'ERR_PRIVATE' } }])
    assert.throws(() => acceptance.couponJourneyData(value));
});
