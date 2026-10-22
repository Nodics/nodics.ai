/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import properties from '../config/properties.js';
import { runCouponCatalogueAvailabilityAcceptance, selectCouponCatalogueAvailabilityAcceptance } from
  '../src/service/acceptance/defaultCouponCatalogueAvailabilityAcceptanceService.mjs';

const selection = { contractVersion: 1, approvalReference: 'e08-catalogue-review', tenant: 'default', storeCode: 'main', locale: 'en',
  availableProductCodes: ['coupon-available'], soldOutProductCodes: ['coupon-sold-out'] };

function harness(fault = {}) {
  const calls = [];
  const fetch = async url => {
    const parsed = new URL(url); calls.push(parsed);
    if (parsed.pathname.endsWith('/coupon-sold-out')) return new Response(JSON.stringify({ data: { product: {
      productCode: 'coupon-sold-out', availability: { available: false, status: 'OUT_OF_STOCK' } } } }), { status: 200 });
    const products = [{ productCode: 'coupon-available', availability: { available: true, status: 'IN_STOCK' } },
      ...(fault.leakSoldOut ? [{ productCode: 'coupon-sold-out', availability: { available: true, status: 'IN_STOCK' } }] : [])];
    return new Response(JSON.stringify({ result: { products, total: fault.incomplete ? products.length + 1 : products.length,
      pagination: { hasNextPage: fault.incomplete === true } } }), { status: 200 });
  };
  return { calls, options: { execute: true, baseUrl: 'http://localhost:4350', selection, fetch } };
}

test('Product acceptance proves sold-out omission using Product APIs only', async () => {
  const h = harness(), result = await runCouponCatalogueAvailabilityAcceptance(h.options);
  assert.equal(result.state, 'PASSED');
  assert.deepEqual(result.omittedSoldOutProductCodes, ['coupon-sold-out']);
  assert.equal(result.purchasedRightsEvidence, 'NOT_READ_BY_PRODUCT');
  assert.equal(h.calls.length, 2);
  assert(h.calls.every(url => url.pathname.startsWith('/nodics/product/v0/')));
  assert(!h.calls.some(url => /entitlement|digital|checkout/i.test(url.pathname)));
  assert.equal(h.calls[1].searchParams.get('view'), 'AVAILABLE_SHOP');
});

test('sold-out Product appearing in AVAILABLE_SHOP fails acceptance', async () => {
  await assert.rejects(runCouponCatalogueAvailabilityAcceptance(harness({ leakSoldOut: true }).options),
    /SOLD_OUT_COUPON_REMAINS_IN_AVAILABLE_SHOP/);
});

test('a short nonterminal catalogue page fails instead of qualifying partial omission', async () => {
  await assert.rejects(runCouponCatalogueAvailabilityAcceptance(harness({ incomplete: true }).options),
    /AVAILABLE_SHOP_PAGINATION_INCOMPLETE/);
});

test('framework defaults, registration and exact profile reject entitlement ownership fields', async () => {
  assert.deepEqual(properties.product.acceptance.couponCatalogueAvailability,
    { requestTimeoutMs: 30000, pageSize: 50, maximumPages: 20 });
  assert.equal(properties.tooling.commands['acceptance:coupon-catalogue-availability'].script,
    'src/service/acceptance/defaultCouponCatalogueAvailabilityAcceptanceService.mjs');
  assert.equal(selectCouponCatalogueAvailabilityAcceptance({ couponCatalogueAvailability: selection }), selection);
  await assert.rejects(runCouponCatalogueAvailabilityAcceptance({ ...harness().options,
    selection: { ...selection, entitlementCodes: ['outside-product'] } }), /REVIEWED_COUPON_CATALOGUE_SELECTION/);
  const script = new URL('../src/service/acceptance/defaultCouponCatalogueAvailabilityAcceptanceService.mjs', import.meta.url).pathname;
  const result = spawnSync(process.execPath, [script, '--help'], { cwd: '/', encoding: 'utf8', env: { PATH: process.env.PATH } });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /outside Product/);
});
