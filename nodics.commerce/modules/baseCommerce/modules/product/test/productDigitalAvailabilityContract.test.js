/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module product/test/productDigitalAvailabilityContract @description Regresses live discovery/PDP coupon availability through retained Product and Promotion owners without runtime or stock writes. @layer test @owner product */
const test = require('node:test');
const assert = require('node:assert/strict');
const enrichment = require('../src/service/defaultProductSearchEnrichmentService');
const discovery = require('../src/service/defaultProductDiscoveryService');
const promotion = require('../../promotion/src/service/defaultPromotionOperationService');
const digital = require('../../../../digitalCommerce/modules/digitalCore/src/service/defaultDigitalCommerceCheckoutService');
const ownership = require('../../../../digitalCommerce/modules/digitalCore/src/service/defaultDigitalCommerceOwnershipService');

/** Installs actual read-only owner orchestration with bounded in-memory persistence doubles. */
function fixture() {
    const request = { tenant: 't', storeCode: 's', locale: 'en', query: {} };
    const row = { code: 'offer-projection', tenant: 't', enterpriseCode: 'e', storeCode: 's', locale: 'en',
        productCode: 'offer', publicationVersion: 'a'.repeat(64), sourceHash: 'hash', status: 'STALE',
        payload: { name: 'Capsule coupon', variantCodes: ['variant'], variantSkuMap: { variant: 'SKU' },
            localizedAttributes: { productType: 'DIGITAL', digitalDeliveryType: 'COUPON_CODE', inventoryStrategy: 'COUPON_CODE_POOL' },
            availability: { available: false, status: 'OUT_OF_STOCK' } } };
    const rows = [row], coupons = [{ code: 'unit', tenant: 't', enterpriseCode: 'e', batchCode: 'batch', promotionCode: 'rule', status: 'ACTIVE' }];
    const calls = { retained: [], inventory: [], pool: [], batches: [], prices: [] };
    const config = { product: { discovery: { activationService: 'ActiveReader' }, publication: { searchEnrichment: {} } },
        digitalCore: { maximumCouponUnitsPerCheckout: 20 } };
    global.CONFIG = { get: key => config[key] };
    const reader = { ...discovery, publicationSelections: new WeakMap(), searchSelected: async (input, query) => {
        assert.equal(query.status, 'STALE');
        assert.deepEqual(query.publicationVersion, ['a'.repeat(64)]);
        return rows.filter(item => !input.productCode || item.productCode === input.productCode).map(item => {
            const { enterpriseCode, payload, ...indexed } = item;
            return { ...indexed, payload: { availability: { available: false, status: 'OUT_OF_STOCK' } } };
        });
    } };
    global.SERVICE = {
        ActiveReader: { activeVersions: async () => ['a'.repeat(64)] },
        DefaultProductDiscoveryService: reader,
        DefaultProductSearchEnrichmentService: enrichment,
        DefaultProductSearchProjectionService: { get: async input => {
            calls.retained.push(input);
            return { code: 'SUC_GET', result: [...new Map(rows.map(item => [item.code, item])).values()]
                .filter(item => input.query.code.$in.includes(item.code)) };
        } },
        DefaultDigitalCommerceCheckoutService: digital,
        DefaultStoreService: { get: async () => ({ result: [{ tenant: 't', code: 's', enterpriseRef: { code: 'e' }, status: 'ACTIVE', defaultCurrency: 'AED' }] }) },
        DefaultCustomerPriceSummaryService: { summarize: async input => { calls.prices.push(input); return {}; } },
        DefaultCustomerAvailabilitySummaryService: { summarize: async input => {
            calls.inventory.push(input);
            return Object.fromEntries(input.products.map(item => [item.productCode, { available: false, status: 'OUT_OF_STOCK' }]));
        } },
        DefaultPromotionOperationService: { ...promotion, promotions: async input => {
            assert.equal(input.storeCode, 's'); assert.equal(input.enterpriseCode, 'e');
            return [{ code: 'rule', status: 'ACTIVE', conditions: { sourceProductCode: 'offer' } }];
        } },
        DefaultCouponBatchService: { get: async input => {
            calls.batches.push(input);
            assert.deepEqual(input.query, { tenant: 't', enterpriseCode: 'e', promotionCode: 'rule', status: 'GENERATED' });
            return { code: 'SUC_GET', result: [{ tenant: 't', enterpriseCode: 'e', code: 'batch', promotionCode: 'rule', status: 'GENERATED' }] };
        } },
        DefaultCouponService: { get: async input => { calls.pool.push(input); return { code: 'SUC_GET', result: coupons }; } },
        DefaultInventoryBalanceService: { get: async () => assert.fail('Coupon summaries must not read warehouse stock') },
        DefaultCouponSecureRevealService: { reveal: async () => assert.fail('Availability must not reveal secrets') }
    };
    return { request, row, rows, coupons, calls, config, reader };
}

test('search cards and PDP replace indexed Not available with live Promotion coupon supply', async () => {
    const f = fixture(), before = structuredClone(f.rows);
    const rows = await f.reader.search(f.request, f.reader.query(f.request), {});
    assert.deepEqual(f.reader.card(rows[0]).availability, { available: true, status: 'IN_STOCK' });
    const detail = await f.reader.detail({ ...f.request, productCode: 'offer' });
    assert.deepEqual(detail.product.availability, { available: true, status: 'IN_STOCK' });
    assert.equal(f.calls.inventory.length, 0);
    assert.equal(f.calls.retained.length, 2, 'One retained batch per request; no recursive enrichment or pinned lookup');
    assert.equal(f.calls.pool.length, 2);
    assert.deepEqual(f.rows, before);
    assert.equal(f.coupons[0].status, 'ACTIVE');
});

test('mixed results retain one physical Inventory batch and one pool read per distinct coupon Product', async () => {
    const f = fixture();
    f.rows.push(f.row, { ...structuredClone(f.row), code: 'physical-projection', productCode: 'physical',
        payload: { variantSkuMap: { a: 'PHYSICAL', b: 'PHYSICAL' } } });
    await f.reader.search(f.request, f.reader.query(f.request), {});
    assert.equal(f.calls.retained.length, 1);
    assert.equal(f.calls.inventory.length, 1);
    assert.deepEqual(f.calls.inventory[0].products, [{ productCode: 'physical', skus: ['PHYSICAL'] }]);
    assert.equal(f.calls.pool.length, 1);
    assert.equal(f.calls.batches.length, 1);
    assert.equal(f.calls.prices.length, 1);
    assert.deepEqual(f.calls.prices[0].productCodes, ['offer', 'physical']);
});

test('sold or reserved pools replace stale available snapshots with unavailable summaries', async () => {
    for (const field of ['soldTo', 'reservedFor']) {
        const f = fixture(); f.coupons[0][field] = 'buyer';
        f.row.payload.availability = { available: true, status: 'IN_STOCK' };
        const result = await enrichment.consumerSummaries(f.request, f.rows);
        assert.deepEqual(result.availability.offer, { available: false, status: 'OUT_OF_STOCK' });
        assert.equal(f.calls.inventory.length, 0);
    }
});

test('digital owner faults reject delivery without indexed or physical-stock fallback', async () => {
    for (const fault of ['digital', 'promotion', 'pool', 'binding', 'malformed']) {
        const f = fixture(); f.row.payload.availability = { available: true, status: 'IN_STOCK' };
        if (fault === 'digital') delete SERVICE.DefaultDigitalCommerceCheckoutService;
        if (fault === 'promotion') delete SERVICE.DefaultPromotionOperationService;
        if (fault === 'pool') SERVICE.DefaultCouponService.get = async () => ({ code: 'ERR_READ', result: f.coupons });
        if (fault === 'binding') SERVICE.DefaultPromotionOperationService.promotions = async () => [];
        if (fault === 'malformed') SERVICE.DefaultPromotionOperationService.couponPoolAvailability = async () => ({ code: 'ERR_READ', available: true });
        await assert.rejects(f.reader.search(f.request, f.reader.query(f.request), {}));
        assert.equal(f.calls.inventory.length, 0);
    }
});

test('retained classification and scope are required before any live coupon summary', async () => {
    for (const fault of ['failed', 'missing', 'changed', 'enterprise', 'locale', 'CURRENT', 'sku']) {
        const f = fixture();
        let indexed = structuredClone(f.row);
        if (fault === 'failed') SERVICE.DefaultProductSearchProjectionService.get = async () => ({ code: 'ERR_GET', result: f.rows });
        if (fault === 'missing') SERVICE.DefaultProductSearchProjectionService.get = async () => ({ result: [] });
        if (fault === 'changed') indexed.sourceHash = 'forged';
        if (fault === 'enterprise') f.request.authData = { enterpriseCode: 'foreign' };
        if (fault === 'locale') f.request.locale = 'ar';
        if (fault === 'CURRENT') { f.row.status = 'CURRENT'; indexed.status = 'CURRENT'; }
        if (fault === 'sku') f.row.payload.variantSkuMap = {};
        await assert.rejects(enrichment.consumerSummaries(f.request, [indexed]));
        assert.equal(f.calls.pool.length, 0);
    }
});

test('unsupported per-item metadata is unavailable without hiding valid coupons or weakening direct Cart classification', async () => {
    const f = fixture();
    const asset = { ...structuredClone(f.row), code: 'asset-projection', productCode: 'asset', payload: {
        name: 'Malformed ownership offer', variantCodes: ['asset-variant'], variantSkuMap: { 'asset-variant': 'ASSET-SKU' },
        localizedAttributes: { productType: 'DIGITAL', fulfillmentStrategy: 'DIGITAL_COMMERCE', saleMode: 'DIGITAL_OWNERSHIP', kind: 'ASSET' },
        availability: { available: true, status: 'IN_STOCK', protectedTokenCiphertext: 'must-not-escape' }
    } };
    f.rows.unshift(asset);
    const original = structuredClone(f.rows);
    SERVICE.DefaultDigitalCommerceOwnershipService = { availability: async () => assert.fail('saleMode must not dispatch ownership') };
    const rows = await f.reader.search(f.request, f.reader.query(f.request), {});
    assert.equal(rows.length, 2);
    assert.deepEqual(f.reader.card(rows.find(r => r.productCode === 'asset')).availability, { available: false, status: 'OUT_OF_STOCK' });
    assert.deepEqual(f.reader.card(rows.find(r => r.productCode === 'offer')).availability, { available: true, status: 'IN_STOCK' });
    const detail = await f.reader.detail({ ...f.request, productCode: 'asset' });
    assert.deepEqual(detail.product.availability, { available: false, status: 'OUT_OF_STOCK' });
    assert.equal(f.calls.pool.length, 1);
    assert.equal(f.calls.inventory.length, 0);
    assert.deepEqual(f.rows, original);
    await assert.rejects(digital.availabilityFromProjection({ tenant: 't', enterpriseCode: 'e', storeCode: 's',
        locale: 'en', productCode: 'asset', variantCode: 'asset-variant', sku: 'ASSET-SKU', quantity: '1' }, asset),
        { code: 'ERR_DIGITAL_AVAILABILITY_METADATA' });
});

test('unknown or inconsistent Digital metadata produces only a false listing summary, never allocation evidence', async () => {
    for (const attributes of [
        { productType: 'DIGITAL', digitalDeliveryType: 'DOWNLOAD', inventoryStrategy: 'COUPON_CODE_POOL' },
        { productType: 'DIGITAL', digitalDeliveryType: 'DIGITAL_OWNERSHIP', inventoryStrategy: 'COUPON_CODE_POOL' },
        { productType: 'DIGITAL', digitalDeliveryType: 'COUPON_CODE' },
    ]) {
        const f = fixture(); f.row.payload.localizedAttributes = attributes;
        const result = await enrichment.consumerSummaries(f.request, f.rows);
        assert.deepEqual(result.availability.offer, { available: false, status: 'OUT_OF_STOCK' });
        assert.equal(f.calls.pool.length, 0);
        assert.equal(f.calls.inventory.length, 0);
    }
});

test('missing ownership, unqualified ownership and same-message owner failures are not swallowed as metadata', async () => {
    for (const fault of ['missing-owner', 'unqualified', 'same-message', 'scope']) {
        const f = fixture();
        f.row.payload.localizedAttributes = { productType: 'DIGITAL', digitalDeliveryType: 'DIGITAL_OWNERSHIP', inventoryStrategy: 'DIGITAL_COMMERCE' };
        if (fault !== 'missing-owner') SERVICE.DefaultDigitalCommerceOwnershipService = { availability: async () => {
            throw new Error(fault === 'unqualified' ? 'Digital ownership owner is not qualified' :
                fault === 'same-message' ? 'Unsupported digital availability' : 'OWNER_SCOPE_DENIED');
        } };
        await assert.rejects(enrichment.consumerSummaries(f.request, f.rows));
        assert.equal(f.calls.pool.length, 0);
        assert.equal(f.calls.inventory.length, 0);
    }
});

test('unselected ownership leaves mixed discovery and PDP available without binding reads or changes to buyer auth', async () => {
    const Enum = require('../../../../../../nodics.foundation/modules/nConfig/bin/enum');
    const previous = global.ENUMS;
    const reasons = require('../../../../digitalCommerce/modules/digitalCore/src/utils/enums').DigitalOwnershipAvailabilityReason;
    global.ENUMS = { DigitalOwnershipAvailabilityReason: new Enum(reasons.definition) };
    try {
        for (const policy of [undefined, { enabled: false, qualified: true }, { enabled: true, qualified: false }]) {
            const f = fixture(); f.config.digitalCore.digitalOwnership = policy;
            f.request.authData = { tenant: 't', enterpriseCode: 'e', tokenType: 'access', principalType: 'customer', principalId: 'buyer' };
            const asset = { ...structuredClone(f.row), code: 'asset-projection', productCode: 'asset', payload: {
                variantCodes: ['asset-variant'], variantSkuMap: { 'asset-variant': 'ASSET-SKU' }, localizedAttributes: {
                    productType: 'DIGITAL', digitalDeliveryType: 'DIGITAL_OWNERSHIP', inventoryStrategy: 'DIGITAL_COMMERCE' } } };
            f.rows.unshift(asset);
            f.rows.push({ ...structuredClone(f.row), code: 'physical-projection', productCode: 'physical',
                payload: { variantSkuMap: { a: 'PHYSICAL' } } });
            const original = structuredClone({ request: f.request, rows: f.rows, coupons: f.coupons, config: f.config });
            SERVICE.DefaultDigitalCommerceOwnershipService = ownership;
            SERVICE.DefaultDigitalCommerceEntitlementService = { readRecords: () => assert.fail('Unselected ownership must not read bindings') };
            SERVICE.DefaultModuleService = { invokeModule: () => assert.fail('Unselected ownership must not call owner transport') };
            const rows = await f.reader.search(f.request, f.reader.query(f.request), {});
            assert.equal(rows.length, 3);
            assert.deepEqual(f.reader.card(rows.find(row => row.productCode === 'asset')).availability, { available: false, status: 'OUT_OF_STOCK' });
            assert.deepEqual(f.reader.card(rows.find(row => row.productCode === 'offer')).availability, { available: true, status: 'IN_STOCK' });
            assert.deepEqual(f.reader.card(rows.find(row => row.productCode === 'physical')).availability, { available: false, status: 'OUT_OF_STOCK' });
            assert.equal(f.calls.pool.length, 1); assert.equal(f.calls.inventory.length, 1);
            const detail = await f.reader.detail({ ...f.request, productCode: 'asset' });
            assert.deepEqual(detail.product.availability, { available: false, status: 'OUT_OF_STOCK' });
            assert.deepEqual({ request: f.request, rows: f.rows, coupons: f.coupons, config: f.config }, original);
        }
    } finally { global.ENUMS = previous; }
});

test('Product fixes quantity at one, ignores caller selectors, and redacts all owner evidence', async () => {
    const f = fixture();
    Object.assign(f.request, { enterpriseCode: 'forged', quantity: '99', batchCode: 'forged', couponBatchCode: 'forged', promotionCode: 'forged',
        payload: { batchCode: 'forged' }, query: { quantity: '99', promotionCode: 'forged' } });
    const before = structuredClone(f.request);
    const owner = SERVICE.DefaultPromotionOperationService.couponPoolAvailability;
    SERVICE.DefaultPromotionOperationService.couponPoolAvailability = async function (input) {
        assert.equal(input.quantity, '1'); assert.equal(input.enterpriseCode, 'e');
        for (const key of ['batchCode', 'couponBatchCode', 'promotionCode', 'payload', 'query']) assert.equal(input[key], undefined);
        return { ...await owner.call(this, input), protectedTokenCiphertext: 'must-not-escape' };
    };
    const result = await enrichment.consumerSummaries(f.request, f.rows);
    assert.deepEqual(result.availability.offer, { available: true, status: 'IN_STOCK' });
    assert.deepEqual(f.request, before);
});

test('later DigitalCore member overrides serve both customer summaries and Cart identity reads', async () => {
    const f = fixture(); let calls = 0;
    const base = digital.availabilityFromProjection;
    SERVICE.DefaultDigitalCommerceCheckoutService = { ...digital, availabilityFromProjection: async function (request, projection) {
        calls++; return base.call(this, request, projection);
    } };
    await enrichment.consumerSummaries(f.request, f.rows);
    const result = await SERVICE.DefaultDigitalCommerceCheckoutService.availability({ ...f.request, enterpriseCode: 'e',
        productCode: 'offer', variantCode: 'variant', sku: 'SKU', quantity: '1' });
    assert.equal(result.available, true);
    assert.equal(calls, 2);
});

test('Cart still requires an exact SKU even though Product summaries do not select a variant', async () => {
    const f = fixture();
    await assert.rejects(digital.availability({ ...f.request, enterpriseCode: 'e', productCode: 'offer', quantity: '1' }));
    assert.equal(f.calls.pool.length, 0);
});

test('coupon-only delivery requires no physical owner; physical activation failures remain errors', async () => {
    const f = fixture(); f.config.inventory = { publication: { delivery: { enabled: true } } };
    delete SERVICE.DefaultCustomerAvailabilitySummaryService;
    assert.equal((await enrichment.consumerSummaries(f.request, f.rows)).availability.offer.available, true);
    f.row.payload.localizedAttributes = { productType: 'PHYSICAL' };
    await assert.rejects(enrichment.consumerSummaries(f.request, f.rows), /owner is unavailable/);
});

test('conflicting physical/digital projections cannot downgrade an offer to Inventory', async () => {
    const f = fixture();
    f.rows.push({ ...structuredClone(f.row), code: 'other-projection', payload: { localizedAttributes: { productType: 'PHYSICAL' } } });
    await assert.rejects(enrichment.consumerSummaries(f.request, f.rows), /classification/);
    assert.equal(f.calls.inventory.length, 0);
    assert.equal(f.calls.pool.length, 0);
});

test('later Product enrichment member overrides are called through the effective service', async () => {
    const f = fixture(); let calls = 0;
    const layered = { ...enrichment, consumerAvailability: async function (request, rows) {
        calls++; return enrichment.consumerAvailability.call(this, request, rows);
    } };
    assert.equal((await layered.consumerSummaries(f.request, f.rows)).availability.offer.available, true);
    assert.equal(calls, 1);
});

test('digital handoff preserves original signed scope without service impersonation or catalogue-derived authority', async () => {
    for (const authData of [
        { tenant: 't', enterpriseCode: 'e', tokenType: 'access', principalType: 'customer', principalId: 'buyer' },
        { tenant: 't', entCode: 'e', tokenType: 'access', principalType: 'human', principalId: 'operator' },
        { tenant: 't', tokenType: 'access', principalType: 'customer', principalId: 'unscoped' },
        { tenant: 't', enterpriseCode: 'e', tokenType: 'service', principalType: 'service', principalId: 'original-service' },
        undefined,
    ]) {
        const f = fixture(); f.request.authData = authData;
        const original = structuredClone(f.request), handoffs = [];
        const availability = digital.availabilityFromProjection;
        SERVICE.DefaultDigitalCommerceCheckoutService = { ...digital, availabilityFromProjection: async function (input, projection) {
            handoffs.push(input);
            assert.deepEqual(input.authData, authData || {});
            assert.equal(input.enterpriseCode, 'e');
            return availability.call(this, input, projection);
        } };
        await enrichment.consumerSummaries(f.request, f.rows);
        assert.equal(handoffs.length, 1);
        assert.deepEqual(f.request, original);
    }
});

test('physical-only and empty results work without DigitalCore; legacy CURRENT reads remain snapshots', async () => {
    const f = fixture(); f.row.payload.localizedAttributes = { productType: 'PHYSICAL' };
    delete SERVICE.DefaultDigitalCommerceCheckoutService;
    assert.equal((await enrichment.consumerSummaries(f.request, f.rows)).availability.offer.available, false);
    assert.deepEqual(await enrichment.consumerSummaries(f.request, []), { prices: {}, availability: {} });
    const legacy = { ...f.reader, activeSelection: async () => undefined, searchSelected: async () => [{ ...f.row, status: 'CURRENT' }] };
    assert.equal((await legacy.search(f.request, {}, {}))[0].status, 'CURRENT');
    assert.equal(f.calls.inventory.length, 1);
});
