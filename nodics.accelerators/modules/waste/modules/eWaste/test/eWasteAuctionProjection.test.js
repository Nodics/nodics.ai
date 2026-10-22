/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module eWaste/test/eWasteAuctionProjection @description Verifies public bundle auction coordinates without leaking participant evidence or using legacy negotiations. @layer test @owner eWaste */
const test = require('node:test'), assert = require('node:assert/strict');
const marketplace = require('../src/service/defaultEWasteMarketplaceService');
function fixture() {
  const product = { productCode: 'bundle', name: 'Bundle', version: 1, variantCodes: ['unit'],
    price: { unitAmount: '10', currency: 'POINTS' }, availability: { available: true },
    localizedAttributes: { kind: 'BUNDLE', saleMode: 'AUCTION', bundleRef: { module: 'digitalCore', schema: 'digitalBundleManifest', code: 'original' },
      ownerRef: { module: 'profile', schema: 'enterprise', code: 'seller' }, listingWindow: { startsAt: null, endsAt: null },
      commerceBidding: { enabled: true, mode: 'AUCTION', publicationCode: 'publication' } } };
  let proof = { productCode: 'bundle', publicationCode: 'publication', storeCode: 'store', roundCode: 'AUCTION_' + 'a'.repeat(64) };
  const calls = [];
  const service = { ...marketplace, settings: () => ({ storeCode: 'store', currency: 'POINTS', programCode: 'program', rewardTypeCode: 'points', jurisdiction: 'AE', locale: 'en' }),
    experience: () => ({ remote: async (...args) => { calls.push(args); return proof; } }) };
  return { service, product, calls, setProof: value => { proof = value; } };
}
test('catalogue and marketplace preserve BUNDLE auction coordinates from original Bidding evidence', async () => {
  const f = fixture(), request = { tenant: 'tenant' };
  for (const method of ['offer', 'marketplaceOffer']) {
    const result = await f.service[method](request, f.product);
    assert.equal(result.biddingMode, 'AUCTION'); assert.equal(result.kind, 'ASSET');
    assert.deepEqual(result.auction, { roundCode: 'AUCTION_' + 'a'.repeat(64), storeCode: 'store' });
    assert.equal(result.biddingAvailable, true); assert.equal(result.ownerRef.schema, 'enterprise');
    assert.equal(result.commerce.variantCode, 'unit'); assert.equal(result.bundleRef.code, 'original');
    assert.equal(result.bids, undefined); assert.equal(result.selection, undefined);
  }
  assert.deepEqual(f.calls[0], [request, 'bidding', 'commerce', '/internal/auctions/publication', 'POST',
    { productCode: 'bundle', storeCode: 'store', publicationCode: 'publication' }]);
});
test('not-yet-open auctions stay auctions and never become fixed-price or negotiation offers', async () => {
  const f = fixture(); f.setProof({ productCode: 'bundle', publicationCode: 'publication', storeCode: 'store', roundCode: null });
  const result = await f.service.offer({ tenant: 'tenant' }, f.product);
  assert.equal(result.biddingMode, 'AUCTION'); assert.equal(result.auction, undefined);
});
test('unconfirmed or foreign source evidence refuses; fixed bundle does not query Bidding', async () => {
  const f = fixture(); f.setProof({ productCode: 'foreign', publicationCode: 'publication', storeCode: 'store', roundCode: null });
  await assert.rejects(f.service.offer({ tenant: 'tenant' }, f.product), /unconfirmed/);
  delete f.product.localizedAttributes.commerceBidding; f.product.localizedAttributes.saleMode = 'FIXED';
  const count = f.calls.length, result = await f.service.offer({ tenant: 'tenant' }, f.product);
  assert.equal(result.biddingMode, undefined); assert.equal(f.calls.length, count);
});
