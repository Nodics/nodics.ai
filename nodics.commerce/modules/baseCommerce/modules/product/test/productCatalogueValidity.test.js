/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module product/test/productCatalogueValidity @description Exercises owner validity filtering/sorting without runtime or persistence. @layer test @owner product */
const test = require('node:test');
const assert = require('node:assert/strict');
const catalogue = require('../src/service/defaultProductCatalogueQueryService');
const offer = require('../../promotion/src/service/defaultCouponOfferService');
const defaults = require('../config/properties').product;

test('catalogue validity filtering and sorting use owner expiry, distinguish NONE/unknown and preserve non-coupon listing windows', async () => {
    global.CLASSES = { NodicsError: class extends Error {} };
    const card = (productCode, expiry) => ({ productCode, localizedAttributes: {
        kind: 'COUPON', expiresAt: '2099-01-01T00:00:00.000Z',
        listingWindow: { startsAt: null, endsAt: '2099-01-01T00:00:00.000Z' }
    }, availability: { available: true, expiry } });
    const products = [card('late', { mode: 'FIXED', at: '2026-11-08T19:59:59.999Z' }),
        card('early', { mode: 'FIXED', at: '2026-11-01T00:00:00.000Z' }),
        card('none', { mode: 'NONE' }), card('unknown', null)];
    global.CONFIG = { get: key => key === 'product' ? defaults : undefined };
    global.SERVICE = { DefaultCouponOfferService: offer, DefaultProductDiscoveryService: {
        policy: () => defaults.discovery, rank: async (_, rows) => rows,
        discoveryMetadata: () => ({})
    } };
    let calls = 0;
    const service = { ...catalogue, candidates: async () => structuredClone(products),
        expiry(product) { calls++; return catalogue.expiry.call(this, product); } };
    const before = structuredClone(products);
    const filtered = await service.list({ query: { filters: { validThrough: '2026-11-08' }, sortCode: 'expiry-asc' } });
    assert.deepEqual(filtered.products.map(p => p.productCode), ['late', 'none']);
    const sorted = await service.list({ query: { sortCode: 'expiry-asc' } });
    assert.deepEqual(sorted.products.map(p => p.productCode), ['early', 'late', 'none', 'unknown']);
    assert.ok(calls > 0);
    assert.deepEqual(products, before);
    assert.equal(service.expiry({ localizedAttributes: { kind: 'BUNDLE',
        listingWindow: { endsAt: '2026-12-01T00:00:00.000Z' } } }), '2026-12-01T00:00:00.000Z');
    products[0].availability.expiry = { mode: 'FIXED', at: 'not-a-date' };
    await assert.rejects(service.list({ query: { sortCode: 'expiry-asc' } }));
});
