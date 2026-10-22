/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module digitalCore/test/digitalFixedBundleSaleAcceptance @description Tests the explicit installed fixed-price whole-bundle sale acceptance runner. @owner digitalCore @layer test */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import properties from '../config/properties.js';
import {
  digitalFixedBundleSaleAcceptanceArgument,
  digitalFixedBundleSaleSelection,
  runDigitalFixedBundleSaleAcceptance,
  selectDigitalFixedBundleSaleAcceptance,
} from '../src/service/acceptance/defaultDigitalFixedBundleSaleAcceptanceService.mjs';

const owner = code => ({ module: 'profile', schema: 'customer', code });
const selection = {
  contractVersion: 1, approvalReference: 'review-1', localDemo: true, isolatedPartition: true,
  tenant: 'tenant', runCode: 'bundle-sale-run',
  buyer: { ownerRef: owner('buyer'), ownerId: 'buyer', enterpriseCode: 'market' },
  seller: { ownerRef: owner('seller'), enterpriseCode: 'market' },
  cart: { code: 'sale-cart', calculationCode: 'sale-calculation', orderCode: 'sale-order',
    checkoutCommandCode: 'sale-checkout', channelCode: 'WEB', locale: 'en', jurisdiction: 'AE' },
  listing: { publicationCode: 'bundle-publication', manifestCode: 'bundle-manifest', productCode: 'bundle-product',
    sku: 'bundle-sku', storeCode: 'market-store', currency: 'POINTS', amount: '12.50' },
  payment: { paymentMethod: 'LOYALTY_REWARD', walletCode: 'buyer-wallet', programCode: 'circa',
    rewardTypeCode: 'reward-points', rewardCurrency: 'POINTS' },
};
const sessions = {
  buyer: { authorization: 'Bearer buyer-token', enterpriseCode: 'market' },
  seller: { authorization: 'Bearer seller-token', enterpriseCode: 'market' },
};
const purchaseCode = 'bundle-operation:' + createHash('sha256').update('purchase').digest('hex');

function reply(value, status = 200) {
  return new Response(JSON.stringify({ data: value }), { status, headers: { 'content-type': 'application/json' } });
}

function harness(options = {}) {
  const calls = [];
  let completed = options.completed === true;
  const checkout = () => completed ? { code: selection.cart.orderCode, status: 'COMPLETED', evidence: {
    completed: ['VALIDATED', 'CALCULATED', 'RESERVED', 'DIGITAL_RESERVED', 'AUTHORIZED', 'ORDERED',
      'PAYMENT_CAPTURED', 'DIGITAL_SOLD', 'RELEASED', 'DIGITAL_DELIVERED'],
    digitalReservationCodes: [purchaseCode], digitalSaleCodes: [purchaseCode], digitalDeliveryCodes: [purchaseCode],
  } } : { status: 'NOT_COMPLETED' };
  const sale = { contractVersion: 1, purchaseCode, orderCode: selection.cart.orderCode,
    publicationCode: selection.listing.publicationCode, manifestCode: selection.listing.manifestCode,
    status: 'COMPLETED', finalSale: true, sellerRef: selection.seller.ownerRef, buyerRef: selection.buyer.ownerRef,
    proceeds: { gross: '12.50', fee: '0', net: '12.50', currency: 'POINTS', programCode: 'circa',
      rewardTypeCode: 'reward-points', status: 'AVAILABLE_IN_LOYALTY', spendableHere: false,
      ledgerRef: { module: 'loyalty', schema: 'rewardLedgerEntry', code: 'seller-credit' } },
    paymentConfirmed: true, wholeTransferConfirmed: true };
  const fetch = async (url, request) => {
    const parsed = new URL(url), path = parsed.pathname, method = request.method;
    const body = request.body ? JSON.parse(request.body) : undefined;
    calls.push({ path, method, body, headers: Object.fromEntries(Object.entries(request.headers).map(([key, value]) => [key.toLowerCase(), value])) });
    if (options.deny === path) return reply({ code: 'ERR_DENIED' }, 403);
    if (path === '/nodics/checkoutCore/v0/checkouts/' + selection.cart.orderCode) return reply(checkout());
    if (path === '/nodics/cart/v0/carts/' + selection.cart.code && method === 'GET') return reply({ cart: {
      code: selection.cart.code, ownerId: 'buyer', enterpriseCode: 'market', storeCode: 'market-store', channelCode: 'WEB',
      locale: 'en', jurisdiction: 'AE', currency: 'POINTS', revision: 7 },
      entries: [{ code: 'entry', productCode: 'bundle-product', sku: 'bundle-sku', quantity: '1' }] });
    if (path.endsWith('/calculations')) return reply({ cartCode: 'sale-cart', currency: 'POINTS', totalAmount: '12.50',
      entries: [{ code: 'entry', productCode: 'bundle-product', sku: 'bundle-sku', quantity: '1' }] });
    if (path === '/nodics/checkoutCore/v0/checkouts/place') {
      if (options.incomplete) return reply({ status: 'PENDING' });
      completed = true; return reply(checkout());
    }
    if (path === '/nodics/digitalCore/v0/bundle-purchases/query') return reply(options.changedSeller && body.ownerRef.code === 'seller'
      ? { ...sale, proceeds: { ...sale.proceeds, net: '11.50' } } : sale);
    if (path === '/nodics/digitalCore/v0/entitlements') return reply({ entitlements: [{ code: 'entitlement', ownerId: 'buyer',
      orderCode: 'sale-order', productCode: 'bundle-product', sku: 'bundle-sku', status: 'ACTIVE',
      digitalDeliveryType: 'DIGITAL_OWNERSHIP', providerOwner: 'digitalCore', providerCode: purchaseCode,
      evidence: { finalSale: true, physicalCustodyTransferred: false } }] });
    throw new Error('Unexpected route ' + method + ' ' + path);
  };
  return { calls, fetch };
}

test('runner uses the reviewed Cart and common Checkout, then proves exact whole transfer, finality and seller proceeds', async () => {
  const h = harness();
  const result = await runDigitalFixedBundleSaleAcceptance({ execute: true, baseUrl: 'http://localhost:4350',
    selection, sessions, fetch: h.fetch });
  assert.equal(result.state, 'PASSED');
  assert.equal(result.purchaseCode, purchaseCode);
  assert.equal(result.sellerProceeds, 'AVAILABLE_IN_LOYALTY');
  assert.equal(h.calls.filter(call => call.path.endsWith('/checkouts/place')).length, 1);
  const placed = h.calls.find(call => call.path.endsWith('/checkouts/place'));
  assert.equal(placed.headers['idempotency-key'], selection.cart.checkoutCommandCode);
  assert.deepEqual(placed.body, { cartCode: 'sale-cart', orderCode: 'sale-order', expectedCartRevision: 7,
    calculationCode: 'sale-calculation', ...selection.payment, rewardAmount: '12.50' });
  assert.equal(h.calls.filter(call => call.path.endsWith('/bundle-purchases/query')).length, 2);
  assert(h.calls.every(call => call.headers.authorization && call.headers.tenant === selection.tenant));
  assert(!h.calls.some(call => /signup|authenticate|import|seed|bundle-listings|settings/.test(call.path)));
});

test('completed replay is read-only and never performs another Checkout placement', async () => {
  const h = harness({ completed: true });
  const result = await runDigitalFixedBundleSaleAcceptance({ execute: true, baseUrl: 'http://127.0.0.1:4350',
    selection, sessions, fetch: h.fetch });
  assert.equal(result.state, 'PASSED');
  assert.equal(h.calls.filter(call => call.method !== 'GET' && !call.path.endsWith('/bundle-purchases/query')).length, 0);
});

test('uncertain or contradictory owner evidence remains recovery and is never repaired by the runner', async () => {
  let h = harness({ incomplete: true });
  let result = await runDigitalFixedBundleSaleAcceptance({ execute: true, baseUrl: 'http://localhost:4350',
    selection, sessions, fetch: h.fetch });
  assert.equal(result.state, 'RECOVERY_REQUIRED');
  assert.equal(result.reasonCode, 'BUNDLE_SALE_CHECKOUT_RECOVERY_REQUIRED');
  assert.equal(h.calls.filter(call => call.path.endsWith('/checkouts/place')).length, 1);
  h = harness({ completed: true, changedSeller: true });
  result = await runDigitalFixedBundleSaleAcceptance({ execute: true, baseUrl: 'http://localhost:4350',
    selection, sessions, fetch: h.fetch });
  assert.equal(result.state, 'RECOVERY_REQUIRED');
  assert.equal(result.reasonCode, 'EXACT_FINAL_BUNDLE_SALE_REQUIRED');
});

test('selection is explicit, local, isolated, exact and bound to original sessions before network I/O', () => {
  const options = { execute: true, baseUrl: 'http://localhost:4350', selection, sessions };
  assert.equal(digitalFixedBundleSaleSelection(options).selection.runCode, selection.runCode);
  assert.throws(() => digitalFixedBundleSaleSelection({ ...options, execute: false }), /EXPLICIT_BUNDLE_SALE/);
  assert.throws(() => digitalFixedBundleSaleSelection({ ...options, baseUrl: 'https://example.com' }), /LOCAL_BUNDLE_SALE/);
  assert.throws(() => digitalFixedBundleSaleSelection({ ...options, selection: { ...selection, isolatedPartition: false } }), /REVIEWED_LOCAL/);
  assert.throws(() => digitalFixedBundleSaleSelection({ ...options, selection: { ...selection,
    seller: { ...selection.seller, ownerRef: selection.buyer.ownerRef } } }), /PARTITION/);
  assert.throws(() => digitalFixedBundleSaleSelection({ ...options, sessions: { ...sessions,
    seller: { ...sessions.seller, enterpriseCode: 'foreign' } } }), /ORIGINAL_BUNDLE_SALE_SESSION/);
});

test('Digital owns the command, defaults and named-profile selection without compatibility aliases', () => {
  assert.deepEqual(properties.tooling.commands['acceptance:digital-fixed-bundle-sale'], {
    acceptanceContract: true, projectHome: true, handler: '@nTooling/node-script',
    script: 'src/service/acceptance/defaultDigitalFixedBundleSaleAcceptanceService.mjs',
  });
  assert.deepEqual(properties.digitalCore.bundleSettlement.acceptance, { requestTimeoutMs: 30000 });
  const profiles = { digitalFixedBundleSale: selection, anotherSale: { ...selection, runCode: 'another-sale' } };
  assert.equal(selectDigitalFixedBundleSaleAcceptance(profiles), selection);
  assert.equal(digitalFixedBundleSaleAcceptanceArgument(['--acceptance=anotherSale']), 'anotherSale');
  assert.throws(() => selectDigitalFixedBundleSaleAcceptance(Object.create({ inherited: selection }), 'inherited'), /UNAVAILABLE/);
  assert.throws(() => digitalFixedBundleSaleAcceptanceArgument(['--acceptance']), /SELECTION_INVALID/);
  const script = new URL('../src/service/acceptance/defaultDigitalFixedBundleSaleAcceptanceService.mjs', import.meta.url).pathname;
  const result = spawnSync(process.execPath, [script, '--help'], { cwd: '/', encoding: 'utf8', env: { PATH: process.env.PATH } });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /acceptance:digital-fixed-bundle-sale --execute/);
  assert.equal(result.stderr, '');
});
