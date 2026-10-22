/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module eWaste/test/eWasteCommonCommerceMigration @description Verifies new command delegation, protected historical state and absence of eWaste financial writers. @owner eWaste @layer test */
const test = require("node:test"), assert = require("node:assert/strict");
const sale = require("../src/service/defaultEWasteDigitalSaleService");
const listing = require("../src/service/defaultEWasteListingService");
const gifts = require("../src/service/defaultEWasteAssetOperationService");
const fs = require("node:fs"), path = require("node:path");

function fixture(t) {
  const before = global.SERVICE; t.after(() => { global.SERVICE = before; });
  const calls = [], owner = { module: 'profile', schema: 'customer', code: 'original-customer' };
  const asset = { code: 'certificate', revision: 7, active: true, ownerRef: owner, assetStatus: 'OWNED', metadata: {} };
  global.SERVICE = {
    DefaultEWasteExperienceService: { store: () => ({ customer: () => owner, one: async () => asset,
      owned: (row, expected) => { assert.deepEqual(row.ownerRef, expected); return row; } }) },
    DefaultEWasteMarketplaceService: { customerRemote: async (request, module, api, method, body) => {
      assert.equal(module, 'digitalCore'); assert.equal(method, 'POST'); calls.push({ request, api, body });
      if (api === '/bundles') return { code: 'retained-manifest', revision: 0 };
      return { code: 'original-operation', status: api === '/gifts' ? 'PENDING' : 'PUBLISHED' };
    } },
  };
  const request = { tenant: 'T', code: 'certificate', expectedRevision: 7, confirmed: true, idempotencyKey: 'original-key',
    authData: { tenant: 'T' }, payload: { name: 'Certificate', amount: '2.25', saleMode: 'FIXED', startsAt: null, endsAt: null,
      storeCode: 'store', currency: 'POINTS', priceBookCode: 'book', categoryCodes: ['recovered'],
      reward: { programCode: 'selected', rewardTypeCode: 'points', scale: 2 },
      recipientRef: { module: 'profile', schema: 'enterprise', code: 'recipient' } } };
  return { calls, asset, request, owner };
}

test('new eWaste listing delegates exact single-certificate manifest and decimal terms without local mutation', async t => {
  const f = fixture(t), before = structuredClone(f.asset);
  f.request.payload.listingContextRef = { code: 'reviewed-context', revision: 4 };
  assert.equal((await listing.list(f.request)).status, 'PUBLISHED');
  assert.deepEqual(f.asset, before);
  assert.deepEqual(f.calls.map(c => c.api), ['/bundles', '/bundles/listings']);
  assert.deepEqual(f.calls[0].body.ownerRef, f.owner);
  assert.equal(f.calls[0].body.components[0].expectedRevision, 7);
  assert.equal(f.calls[1].body.amount, '2.25'); assert.deepEqual(f.calls[1].body.reward, f.request.payload.reward);
  assert.equal(f.calls[1].body.manifestCode, 'retained-manifest');
  assert.deepEqual(f.calls[1].body.listingContextRef, f.request.payload.listingContextRef);
  assert.ok(f.calls.every(c => c.request === f.request));
});

test('historical listing intents and reconciliation holds never become fabricated common listings', async t => {
  const f = fixture(t);
  for (const metadata of [{ listingIntent: { contractVersion: 2 } }, { listingReconciliation: { status: 'HELD' } }]) {
    f.asset.metadata = metadata; await assert.rejects(listing.list(f.request), /Historical listing/);
  }
  assert.equal(f.calls.length, 0);
});

test('legacy gift route now produces pending acceptance and does not move reward-labelled carbon', async t => {
  const f = fixture(t);
  assert.equal((await gifts.gift(f.request)).status, 'PENDING');
  assert.deepEqual(f.calls.map(c => c.api), ['/bundles', '/gifts']);
  assert.deepEqual(f.calls[1].body.recipientRef, f.request.payload.recipientRef);
  await assert.rejects(gifts.gift({ ...f.request, payload: { recipientEmail: 'not-authority@example.test' } }), /canonical/);
  assert.equal(gifts.settle, undefined); assert.equal(gifts.reserveSale, undefined); assert.equal(gifts.completeSale, undefined);
});

test('old sale admission and incomplete seller credit are closed while explicit history remains inspectable', async t => {
  fixture(t);
  const instance = { ...sale, context: r => r, binding: async () => ({ ref: { assetCode: 'asset' } }),
    event: async () => ({ transferStatus: 'RESERVED' }), capture: async () => ({ amount: '1' }) };
  assert.equal((await instance.invoke({}, 'availability')).available, false);
  await assert.rejects(instance.invoke({}, 'reserve'), /legacy sale admission is closed/);
  await assert.rejects(instance.invoke({}, 'confirm'), /no eWaste seller credit/);
  assert.equal((await instance.invoke({}, 'refund-preview')).eligible, false);
  for (const phase of ['refund-prepare', 'refund-settle', 'refund-complete'])
    await assert.rejects(instance.invoke({}, phase), /final sales/);
  for (const file of ['defaultEWasteAssetOperationService.js', 'defaultEWasteDigitalSaleService.js']) {
    const source = fs.readFileSync(path.join(__dirname, '../src/service', file), 'utf8');
    assert.doesNotMatch(source, /["']\/reward-(earnings|transfers)["']/);
  }
});

test('retired eWaste reversal adapter cannot be loaded or registered', () => {
  for (const file of ['service/defaultEWasteOrderReversalService.js', 'controller/defaultEWasteOrderReversalController.js'])
    assert.equal(fs.existsSync(path.join(__dirname, '../src', file)), false);
  const routes = require('../src/router/routers').eWaste;
  assert.equal(routes.internalOrderReversal, undefined);
  const marketplace = require('../config/properties').eWaste.marketplace;
  for (const key of ['rewardScale', 'carbonScale', 'refundsEnabled'])
    assert.equal(Object.hasOwn(marketplace, key), false);
});
