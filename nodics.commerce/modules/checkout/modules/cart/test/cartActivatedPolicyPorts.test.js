/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module cart/test/cartActivatedPolicyPorts @description Tests ordinary Cart ports against real domain activated readers with retained receipt fixtures; no runtime/database effects. @layer test @owner cart */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const base = path.resolve(__dirname, '../../../../baseCommerce/modules');
const portsService = require('../src/service/defaultCommerceCalculationPortsService');
const owner = (domain, name) => require(path.join(base, domain, 'src/service', name));
const cart = { tenant: 'tenant-a', enterpriseCode: 'enterprise-a', jurisdiction: 'AE', code: 'cart-a', ownerId: 'customer-a', correlationId: 'cart-correlation' };
const input = { tenant: cart.tenant, enterpriseCode: cart.enterpriseCode, productCode: 'product-a', sku: 'sku-a', quantity: '2', currency: 'USD', taxableAmount: '100', storeCode: 'store-a' };

test('Store-scoped rollout uses persisted Cart store and leaves unrelated stores on legacy policies', async () => {
    const f = setup();
    for (const domain of ['pricing', 'inventory', 'tax']) f.settings[domain].publication.delivery.storeCodes = ['qualified-store'];
    const qualified = portsService.create({ ...cart, storeCode: 'qualified-store' });
    assert.equal((await qualified.pricing({ ...input, storeCode: 'spoofed-store' })).unitAmount, '12');
    assert.equal((await qualified.tax(input)).taxAmount, '5');
    assert.deepEqual((await qualified.inventory(input)).candidates.map(row => row.warehouseCode), ['warehouse-a']);
    const legacy = portsService.create({ ...cart, storeCode: 'real-store' });
    let legacyReads = 0;
    global.SERVICE.DefaultPriceBookService = { get: async () => { legacyReads++; return { result: [] }; } };
    global.SERVICE.DefaultPriceRowService = { get: async () => { legacyReads++; return { result: [] }; } };
    await assert.rejects(legacy.pricing({ ...input, storeCode: 'qualified-store' }), /No eligible price/);
    assert.equal(legacyReads, 2);
    global.SERVICE.DefaultTaxPolicyService = { get: async () => ({ result: [{
        tenant: cart.tenant, taxCode: 'LEGACY', jurisdiction: 'AE', status: 'ACTIVE', rate: '0.07', revision: 4
    }] }) };
    assert.equal((await legacy.tax({ ...input, storeCode: 'qualified-store' })).taxAmount, '7');
    assert((await legacy.inventory(input)).candidates.some(row => row.warehouseCode === 'unpublished'));
});

/** Installs read-only retained policies and receipts, using the actual owner readers and decision engines. */
function setup() {
    const settings = {}, evidence = {}, balances = [
        { ...cart, warehouseCode: 'warehouse-a', sku: 'sku-a', available: '3', revision: 1 },
        { ...cart, warehouseCode: 'unpublished', sku: 'sku-a', available: '999', revision: 1 }
    ];
    global.CONFIG = { get: domain => settings[domain] || {} };
    const forbidden = { get: async () => { assert.fail('Activated Cart must not read mutable source policies'); } };
    global.SERVICE = {
        DefaultPriceBookService: forbidden, DefaultPriceRowService: forbidden,
        DefaultTaxPolicyService: forbidden, DefaultPromotionService: forbidden,
        DefaultExactAmountService: owner('pricing', 'defaultExactAmountService'),
        DefaultPriceSelectionService: owner('pricing', 'defaultPriceSelectionService'),
        DefaultPricingDecisionService: owner('pricing', 'defaultPricingDecisionService'),
        DefaultInventorySourcingService: owner('inventory', 'defaultInventorySourcingService'),
        DefaultTaxDecisionEngineService: owner('tax', 'defaultTaxDecisionEngineService'),
        DefaultInventoryBalanceService: { get: async () => ({ result: structuredClone(balances) }) }
    };
    const scope = { tenant: cart.tenant, enterpriseCode: cart.enterpriseCode };
    const definitions = {
        pricing: { rootType: 'priceBook', rootCode: 'book-a', records: [
            { schema: 'priceBook', policy: { ...scope, code: 'book-a', versionId: 0, revision: 1, currency: 'USD', status: 'ACTIVE' } },
            { schema: 'priceRow', policy: { ...scope, code: 'row-a', versionId: 2, revision: 7, priceBookCode: 'book-a', productCode: 'product-a', unitAmount: '12.00', minQuantity: '1', currency: 'USD' } }
        ] },
        inventory: { rootType: 'warehouse', rootCode: 'warehouse-a', records: [
            { schema: 'warehouse', policy: { ...scope, code: 'warehouse-a', versionId: 0, revision: 1, status: 'ACTIVE', priority: 9 } }
        ] },
        tax: { rootType: 'taxPolicy', rootCode: 'tax-a', records: [
            { schema: 'taxPolicy', policy: { ...scope, code: 'tax-a', versionId: 2, revision: 99, status: 'ACTIVE', taxCode: 'VAT', jurisdiction: 'AE', rate: '0.05' } }
        ] }
    };
    for (const [domain, definition] of Object.entries(definitions)) {
        const cap = domain[0].toUpperCase() + domain.slice(1);
        settings[domain] = { publication: { runtimeRole: 'ONLINE', delivery: { enabled: true, rootCodes: [definition.rootCode] } } };
        const provider = { ...owner(domain, 'default' + cap + 'PublicationService') };
        const payload = { ...scope, ...definition }, code = provider.fingerprint(payload);
        const release = { ...scope, code, rootType: definition.rootType, rootCode: definition.rootCode, payload, fingerprint: code };
        const pointer = { ...scope, code: provider.pointerCode(definition, cart), version: code, revision: 2, receiptCode: 'receipt-' + domain };
        const receipt = { ...scope, code: pointer.receiptCode, pointerCode: pointer.code, targetVersion: code, expectedRevision: 1, fingerprint: code, applied: true };
        const rows = { release: [release], pointer: [pointer], receipt: [receipt] };
        provider.targetServices = () => Object.fromEntries(Object.entries(rows).map(([key, records]) => [key, {
            get: async ({ query }) => ({ result: records.filter(record => Object.entries(query).every(([field, value]) => record[field] === value)).map(record => structuredClone(record)) })
        }]));
        global.SERVICE['Default' + cap + 'PublicationService'] = provider;
        evidence[domain] = rows;
    }
    settings.promotion = { publication: { delivery: { enabled: true } } };
    return { ports: portsService.create(cart), settings, evidence, balances };
}

test('ordinary Cart Pricing and async Tax use retained receipts without source pre-reads', async () => {
    const { ports } = setup();
    const price = await ports.pricing(input);
    assert.equal(price.unitAmount, '12');
    assert.equal(price.totalAmount, '24');
    const tax = await ports.tax(input);
    assert.equal(tax.taxAmount, '5');
    assert.equal(tax.policyVersion, '2');
    assert.equal(tax.jurisdiction, 'AE');
});

test('ordinary Cart Inventory uses active warehouse policy while balances and coupon pools remain live', async () => {
    const { ports, balances } = setup();
    assert.deepEqual((await ports.inventory(input)).candidates.map(item => item.warehouseCode), ['warehouse-a']);
    balances[0].available = '1';
    assert.equal((await ports.inventory(input)).available, false);
    balances.splice(0, balances.length, { ...cart, sku: 'sku-a', available: '8', revision: 9, inventoryStrategy: 'COUPON_CODE_POOL', couponBatchCode: 'batch-a' });
    const coupon = await ports.inventory(input);
    assert.equal(coupon.strategy, 'COUPON_CODE_POOL');
    assert.equal(coupon.couponBatchCode, 'batch-a');
    assert.equal(coupon.availableQuantity, '8');
});

test('missing active receipts and conflicting Cart scope reject without source fallback', async () => {
    const { ports, evidence } = setup();
    for (const domain of ['pricing', 'inventory', 'tax']) {
        evidence[domain].receipt.length = 0;
        await assert.rejects(ports[domain](input), /receipt mismatch/);
        await assert.rejects(ports[domain]({ ...input, enterpriseCode: 'other' }), /scope mismatch/);
    }
    await assert.rejects(ports.promotion(input), /Activated Promotion owner/);
});

test('Promotion delegates the existing quote owner and negotiated Pricing retains its private authority', async () => {
    const { ports } = setup();
    global.SERVICE.DefaultPromotionOperationService = { quote: async request => {
        assert.equal(request.enterpriseCode, cart.enterpriseCode);
        assert.equal(request.authData.tenant, cart.tenant);
        return { discountAmount: '4' };
    } };
    assert.equal((await ports.promotion(input)).discountAmount, '4');
    global.SERVICE.DefaultNegotiatedPriceService = { decide: async request => ({ quote: request.priceQuoteCode }) };
    assert.equal((await ports.pricing({ ...input, priceQuoteCode: 'private-quote' })).quote, 'private-quote');
});

test('disabled delivery retains legacy reads and synchronous Tax compatibility', async () => {
    const { ports, settings } = setup();
    settings.pricing.publication.delivery.enabled = false;
    settings.tax.publication.delivery.enabled = false;
    let reads = 0;
    global.SERVICE.DefaultPriceBookService = { get: async () => { reads++; return { result: [{ ...cart, code: 'b', currency: 'USD', status: 'ACTIVE' }] }; } };
    global.SERVICE.DefaultPriceRowService = { get: async () => { reads++; return { result: [{ ...cart, code: 'r', productCode: 'product-a', priceBookCode: 'b', currency: 'USD', unitAmount: '2', minQuantity: '1' }] }; } };
    global.SERVICE.DefaultTaxPolicyService = { get: async () => { reads++; return { result: [{ ...cart, taxCode: 'VAT', status: 'ACTIVE', rate: '0.02', revision: 1 }] }; } };
    assert.equal((await ports.pricing(input)).unitAmount, '2');
    assert.equal((await ports.tax(input)).taxAmount, '2');
    assert.equal(reads, 3);
});
