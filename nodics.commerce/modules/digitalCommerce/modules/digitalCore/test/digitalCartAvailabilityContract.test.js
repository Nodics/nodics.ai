/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module digitalCore/test/digitalCartAvailabilityContract @description Exercises read-only Cart/Digital/Promotion availability without warehouse coupon balances, reservation or runtime effects. @layer test @owner digitalCore */
const test = require('node:test');
const assert = require('node:assert/strict');
const digital = require('../src/service/defaultDigitalCommerceCheckoutService');
const base = '../../../../baseCommerce/modules/';
const promotion = require(base + 'promotion/src/service/defaultPromotionOperationService');
const ports = require('../../../../checkout/modules/cart/src/service/defaultCommerceCalculationPortsService');
const projections = require(base + 'product/src/service/defaultProductSearchEnrichmentService');

/** Installs bounded owner doubles around the actual availability orchestration. */
function fixture() {
    const request = { tenant: 't', enterpriseCode: 'e', storeCode: 's', locale: 'en', productCode: 'offer',
        variantCode: 'variant', sku: 'SKU', quantity: '1', ownerId: 'buyer' };
    const row = { code: 'projection', status: 'STALE', sourceHash: 'source', publicationVersion: 'version', tenant: 't', enterpriseCode: 'e', storeCode: 's', locale: 'en', productCode: 'offer', payload: {
        variantCodes: ['variant'], variantSkuMap: { variant: 'SKU' },
        localizedAttributes: { productType: 'DIGITAL', digitalDeliveryType: 'COUPON_CODE', inventoryStrategy: 'COUPON_CODE_POOL' }
    } };
    const batches = [{ tenant: 't', enterpriseCode: 'e', code: 'batch', promotionCode: 'rule', status: 'GENERATED' }];
    const coupons = [{ tenant: 't', enterpriseCode: 'e', code: 'unit', batchCode: 'batch', promotionCode: 'rule', status: 'ACTIVE' }];
    global.CONFIG = { get: () => ({ maximumCouponUnitsPerCheckout: 20 }) };
    global.SERVICE = {
        DefaultProductDiscoveryService: {
            query: input => ({ productCode: input.productCode }),
            searchPinned: async input => { assert.equal(input.storeCode, 's'); assert.equal(input.locale, 'en');
                const { enterpriseCode, payload, ...indexed } = row; return [indexed]; }
        },
        DefaultProductSearchEnrichmentService: projections,
        DefaultProductSearchProjectionService: { get: async () => ({ code: 'SUC_GET', result: [row] }) },
        DefaultDigitalCommerceCheckoutService: digital,
        DefaultPromotionOperationService: { ...promotion, promotions: async () => [{ code: 'rule', status: 'ACTIVE', conditions: { sourceProductCode: 'offer' } }] },
        DefaultCouponBatchService: { get: async input => {
            assert.deepEqual(input.query, { tenant: 't', enterpriseCode: 'e', promotionCode: 'rule', status: 'GENERATED' });
            return { code: 'SUC_GET', result: batches };
        } },
        DefaultCouponService: { get: async () => ({ code: 'SUC_GET', result: coupons }) },
        DefaultInventoryBalanceService: { get: async () => assert.fail('Digital availability must not read warehouse balances') },
        DefaultInventorySourcingService: { source: () => assert.fail('Digital availability must not source physical stock') },
    };
    return { request, row, batches, coupons, port: ports.create(request).inventory };
}

test('digital Cart reads the Promotion pool through pinned Product identity without physical stock', async () => {
    const f = fixture();
    const result = await f.port(f.request);
    assert.equal(result.available, true);
    assert.equal(result.couponBatchCode, 'batch');
    assert.equal(result.promotionCode, 'rule');
    assert.equal(result.guaranteed, false);
    assert.equal(result.reservableAt, 'CHECKOUT_BEFORE_PAYMENT');
    assert.equal(f.coupons[0].status, 'ACTIVE');
});

test('exhausted or sold digital pools stay unavailable without warehouse fallback', async () => {
    const f = fixture();
    f.coupons[0].soldTo = 'other';
    assert.equal((await f.port(f.request)).available, false);
});

test('foreign Product scope, mismatched SKU and duplicate pool bindings fail closed', async () => {
    for (const field of ['tenant', 'enterpriseCode', 'storeCode', 'locale', 'productCode']) {
        const f = fixture(); f.row[field] = 'foreign';
        await assert.rejects(f.port(f.request));
    }
    const f = fixture(); f.row.payload.variantSkuMap.variant = 'OTHER';
    await assert.rejects(f.port(f.request));
    const g = fixture(); g.batches.push({ ...g.batches[0], code: 'other-batch' });
    await assert.rejects(g.port(g.request));
});

test('missing Promotion owners and failed batch reads are faults, not available stock', async () => {
    const f = fixture(); delete SERVICE.DefaultPromotionOperationService;
    await assert.rejects(f.port(f.request));
    const g = fixture(); SERVICE.DefaultCouponBatchService.get = async () => ({ code: 'ERR_GET', result: g.batches });
    await assert.rejects(g.port(g.request));
});

test('digital classification cannot reserve units, accept fractional quantity or trust caller pool selectors', async () => {
    const f = fixture();
    await assert.rejects(f.port({ ...f.request, quantity: '1.5' }));
    const result = await f.port({ ...f.request, couponBatchCode: 'forged', promotionCode: 'forged', payload: { batchCode: 'forged' } });
    assert.equal(result.couponBatchCode, 'batch');
    assert.equal(result.promotionCode, 'rule');
});

test('foreign, duplicate, oversized and failed coupon reads reject rather than reporting availability', async () => {
    for (const kind of ['foreign', 'duplicate', 'oversized', 'failed']) {
        const f = fixture();
        if (kind === 'foreign') f.coupons[0].enterpriseCode = 'other';
        if (kind === 'duplicate') f.coupons.push({ ...f.coupons[0] });
        if (kind === 'oversized') f.coupons.push(...Array.from({ length: 1000 }, (_, i) => ({ ...f.coupons[0], code: 'unit-' + i })));
        if (kind === 'failed') SERVICE.DefaultCouponService.get = async () => ({ code: 'ERR_READ', result: [] });
        await assert.rejects(f.port(f.request));
    }
});

test('missing, foreign or changed retained Product identity cannot supply digital availability', async () => {
    for (const kind of ['missing', 'duplicate', 'changed', 'foreign', 'failed']) {
        const f = fixture();
        SERVICE.DefaultProductSearchProjectionService.get = async () => ({ code: kind === 'failed' ? 'ERR_GET' : 'SUC_GET', result:
            kind === 'missing' ? [] : kind === 'duplicate' ? [f.row, f.row] :
                [{ ...f.row, ...(kind === 'changed' ? { sourceHash: 'changed' } : { enterpriseCode: 'foreign' }) }] });
        await assert.rejects(f.port(f.request));
    }
});

test('retained physical catalogue records return to the existing Inventory port', async () => {
    const f = fixture(); f.row.status = 'CURRENT'; f.row.payload.localizedAttributes = { productType: 'PHYSICAL' };
    SERVICE.DefaultInventoryBalanceService.get = async () => ({ result: [] });
    SERVICE.DefaultInventorySourcingService.source = () => [];
    assert.equal((await f.port(f.request)).inventoryStrategy, 'PHYSICAL_STOCK');
});
