/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

/**
 * @module cart/test/cartCustomerApiContract
 * @description Verifies customer Cart lifecycle route and service contracts.
 * @layer test
 * @owner cart
 */

const properties = require('../config/properties');
const routers = require('../src/router/routers');
const pipelines = require('../src/pipelines/pipelines');
const controller = require('../src/controller/defaultCartCustomerController');
const facade = require('../src/facade/defaultCartCustomerFacade');
const service = require('../src/service/defaultCartOperationService');
const calculationPipelineService = require('../src/service/pipelines/defaultCartCalculationPipelineService');
const calculationPorts = require('../src/service/defaultCommerceCalculationPortsService');
const exact = require('../../../../baseCommerce/modules/pricing/src/service/defaultExactAmountService');
const pricingDecision = require('../../../../baseCommerce/modules/pricing/src/service/defaultPricingDecisionService');
const priceSelection = require('../../../../baseCommerce/modules/pricing/src/service/defaultPriceSelectionService');
const inventorySourcing = require('../../../../baseCommerce/modules/inventory/src/service/defaultInventorySourcingService');
const promotionDecision = require('../../../../baseCommerce/modules/promotion/src/service/defaultPromotionDecisionService');
const taxDecision = require('../../../../baseCommerce/modules/tax/src/service/defaultTaxDecisionEngineService');

let carts;
let entries;
let productVariantLookups;
let productProjectionLookups;

function installGlobals() {
    carts = [];
    entries = [];
    productVariantLookups = [];
    productProjectionLookups = [];
    delete global.CLASSES;
    global.CONFIG = { get: key => key === 'cart' ? properties.cart : undefined };
    global.SERVICE = {
        DefaultCartOperationService: service,
        DefaultCartService: {
            save: async request => {
                let existing = carts.find(item => item.code === request.model.code);
                if (existing) Object.assign(existing, request.model);
                else carts.push(Object.assign({}, request.model));
                return { result: Object.assign({}, request.model) };
            },
            get: async request => ({ result: carts.filter(item => item.tenant === request.query.tenant && item.ownerId === request.query.ownerId && (!request.query.code || item.code === request.query.code)) })
        },
        DefaultCartEntryService: {
            save: async request => {
                let existing = entries.find(item => item.code === request.model.code);
                if (existing) Object.assign(existing, request.model);
                else entries.push(Object.assign({}, request.model));
                return { result: Object.assign({}, request.model) };
            },
            update: async request => {
                let existing = entries.find(item => item.code === request.query.code && item.ownerId === request.query.ownerId);
                if (existing) Object.assign(existing, request.model);
                return { result: Object.assign({}, existing) };
            },
            get: async request => ({ result: entries.filter(item => item.tenant === request.query.tenant && item.ownerId === request.query.ownerId && item.cartCode === request.query.cartCode && (!request.query.status || item.status === request.query.status)) })
        },
        DefaultProductVariantService: {
            get: async request => {
                productVariantLookups.push(request);
                return {
                    result: request.query.code === 'agoraLinenWrapDressNaturalS' && request.query.productCode === 'agoraLinenWrapDress'
                        ? [{ code: 'agoraLinenWrapDressNaturalS', tenant: request.tenant, productCode: 'agoraLinenWrapDress', sku: 'AGORA-DRESS-LINEN-NAT-S', status: 'ACTIVE' }]
                        : []
                };
            }
        },
        DefaultProductSearchProjectionService: {
            get: async request => {
                productProjectionLookups.push(request);
                return {
                    result: request.query.productCode === 'agoraLeatherTote'
                        ? [{
                            code: 'agoraLeatherTote|agoraMainStore|en',
                            tenant: request.tenant,
                            productCode: 'agoraLeatherTote',
                            storeCode: 'agoraMainStore',
                            locale: 'en',
                            status: 'CURRENT',
                            payload: { variantSkuMap: { agoraLeatherToteTanOne: 'AGORA-ACC-TOTE-TAN-ONE' } }
                        }]
                        : []
                };
            }
        },
        DefaultCommerceCalculationPortsService: calculationPorts
    };
    global.FACADE = { DefaultCartCustomerFacade: facade };
}

test.beforeEach(installGlobals);

test('Cart customer routes expose create read entry mutation and calculation through secured customer permission', () => {
    assert.equal(routers.cart.customer.create.key, '/customer/carts');
    assert.equal(routers.cart.customer.read.key, '/customer/carts/:cartCode');
    assert.equal(routers.cart.customer.addEntry.key, '/customer/carts/:cartCode/entries');
    assert.equal(routers.cart.customer.updateEntry.method, 'PATCH');
    assert.equal(routers.cart.customer.removeEntry.method, 'DELETE');
    assert.equal(routers.cart.customer.calculate.permission, 'commerce.cart.own');
});

test('Cart calculation pipeline preserves framework error terminal to avoid recursive error handling', () => {
    assert.equal(pipelines.commerceCartCalculationPipeline.handleError, 'handleError');
    assert.equal(pipelines.commerceCartCalculationPipeline.nodes.handleError, undefined);
    assert.equal(pipelines.commerceCartCalculationPipeline.nodes.successEnd, undefined);
});

test('Cart calculation pipeline writes framework success payload for downstream checkout', async () => {
    const response = {};
    const expected = { code: 'calc-1', entries: [] };
    global.SERVICE.DefaultCartOperationService = { calculateDirect: async () => expected };
    await new Promise((resolve, reject) => {
        calculationPipelineService.calculate({}, response, {
            nextSuccess: () => {
                try {
                    assert.equal(response.success, expected);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            },
            error: (request, output, error) => reject(error)
        });
    });
});

test('Cart calculation API redacts backend-only evidence unless called internally', async () => {
    const raw = {
        code: 'calc-1',
        entries: [{
            productCode: 'agoraLinenWrapDress',
            priceDecision: { unitAmount: '129.00', priceRowCode: 'internal-row' },
            availability: { available: true, candidates: [{ warehouseCode: 'internal-warehouse' }] }
        }]
    };
    global.SERVICE.DefaultPipelineService = { start: async () => raw };
    const customer = await service.calculate({});
    assert.equal(JSON.stringify(customer).includes('priceRowCode'), false);
    assert.equal(JSON.stringify(customer).includes('warehouseCode'), false);
    const internal = await service.calculate({ internalUse: true });
    assert.equal(internal, raw);
});

test('Cart customer facade uses customer-owned direct calculation snapshots', async () => {
    let called;
    global.SERVICE.DefaultCartOperationService = {
        calculateDirect: async request => {
            called = request;
            return { code: 'calc-cart1', status: 'CURRENT' };
        },
        calculate: async () => {
            throw new Error('generic calculation pipeline must not handle customer cart calculation route');
        }
    };
    const response = await facade.calculate({
        authData: { tenant: 'default', principalId: 'customer-1' },
        cartCode: 'cart1',
        payload: { calculationCode: 'calc-cart1' }
    });
    assert.equal(response.code, 'calc-cart1');
    assert.equal(called.ownerId, 'customer-1');
    assert.equal(called.tenant, 'default');
});

test('Cart customer calculation creates stable snapshot code when browser payload omits calculationCode', async () => {
    global.SERVICE.DefaultCartCalculationEngineService = {
        calculate: async cart => ({
            tenant: cart.tenant,
            cartCode: cart.code,
            entries: [{
                productCode: 'agoraLinenWrapDress',
                priceDecision: { unitAmount: '129.00', priceRowCode: 'internal-row' },
                availability: { available: true, candidates: [{ warehouseCode: 'internal-warehouse' }] }
            }]
        })
    };
    global.SERVICE.DefaultCartCalculationService = {
        save: async request => ({ result: request.model })
    };
    carts.push({ code: 'cartPreview', tenant: 'default', ownerId: 'customer-1', revision: 2, currency: 'USD' });
    const calculated = await service.calculateDirect({
        tenant: 'default',
        ownerId: 'customer-1',
        cartCode: 'cartPreview',
        authData: { tenant: 'default', principalId: 'customer-1' },
        payload: { expectedRevision: 2 }
    });
    assert.equal(calculated.code, 'calc-cartPreview-2');
    assert.equal(calculated.cartRevision, 2);
    assert.equal(JSON.stringify(calculated).includes('priceRowCode'), false);
    assert.equal(JSON.stringify(calculated).includes('warehouseCode'), false);
    const internal = await service.calculateDirect({
        tenant: 'default',
        ownerId: 'customer-1',
        cartCode: 'cartPreview',
        authData: { tenant: 'default', principalId: 'customer-1' },
        payload: { expectedRevision: 2 },
        internalUse: true
    });
    assert.equal(JSON.stringify(internal).includes('priceRowCode'), true);
    assert.equal(JSON.stringify(internal).includes('warehouseCode'), true);
});

test('Cart customer API creates a cart and manages active entries for the authenticated owner', async () => {
    let authData = { tenant: 'default', principalId: 'customer-1' };
    let created = await controller.create({ authData, httpRequest: { body: { cartCode: 'cart1', storeCode: 'agoraMainStore' } } });
    assert.equal(created.data.cart.code, 'cart1');
    assert.equal(created.data.cart.ownerId, 'customer-1');
    assert.equal(created.data.cart.active, true);

    let added = await controller.addEntry({ authData, httpRequest: { params: { cartCode: 'cart1' }, body: { productCode: 'agoraLinenWrapDress', sku: 'AGORA-DRESS-S', quantity: '2' } } });
    assert.equal(added.data.entries.length, 1);
    assert.equal(added.data.entries[0].status, 'ACTIVE');
    assert.equal(added.data.entries[0].active, true);

    let updated = await controller.updateEntry({ authData, httpRequest: { params: { cartCode: 'cart1', entryCode: 'cart1|agoraLinenWrapDress|AGORA-DRESS-S' }, body: { quantity: '3' } } });
    assert.equal(updated.data.entries[0].quantity, '3');

    let removed = await controller.removeEntry({ authData, httpRequest: { params: { cartCode: 'cart1', entryCode: 'cart1|agoraLinenWrapDress|AGORA-DRESS-S' } } });
    assert.equal(removed.data.entries.length, 0);
});

test('Cart customer API accepts Product variant identity and resolves internal SKU server-side', async () => {
    let authData = { tenant: 'default', principalId: 'customer-1' };
    await controller.create({ authData, httpRequest: { body: { cartCode: 'cartVariant', storeCode: 'agoraMainStore' } } });

    let added = await controller.addEntry({
        authData,
        httpRequest: {
            params: { cartCode: 'cartVariant' },
            body: { productCode: 'agoraLinenWrapDress', variantCode: 'agoraLinenWrapDressNaturalS', quantity: '1' }
        }
    });

    assert.equal(added.data.entries.length, 1);
    assert.equal(added.data.entries[0].variantCode, 'agoraLinenWrapDressNaturalS');
    assert.equal(added.data.entries[0].sku, 'AGORA-DRESS-LINEN-NAT-S');
    assert.equal(added.data.entries[0].active, true);
    assert.equal(added.data.entries[0].code, 'cartVariant|agoraLinenWrapDress|AGORA-DRESS-LINEN-NAT-S');
    assert.equal(productVariantLookups[0].authData.principalType, 'service');
    assert.deepEqual(productVariantLookups[0].authData.userGroups, ['serviceAccountUserGroup']);
    assert.deepEqual(productVariantLookups[0].authData.groups, ['serviceAccountUserGroup']);
});

test('Cart customer API resolves SKU from internal Product search projection when raw variants are unavailable online', async () => {
    let authData = { tenant: 'default', principalId: 'customer-1' };
    await controller.create({ authData, httpRequest: { body: { cartCode: 'cartProjection', storeCode: 'agoraMainStore', locale: 'en' } } });

    let added = await controller.addEntry({
        authData,
        httpRequest: {
            params: { cartCode: 'cartProjection' },
            body: { productCode: 'agoraLeatherTote', variantCode: 'agoraLeatherToteTanOne', quantity: '1' }
        }
    });

    assert.equal(added.data.entries.length, 1);
    assert.equal(added.data.entries[0].sku, 'AGORA-ACC-TOTE-TAN-ONE');
    assert.equal(productProjectionLookups[0].query.storeCode, 'agoraMainStore');
    assert.equal(productProjectionLookups[0].query.locale, 'en');
    assert.equal(productProjectionLookups[0].authData.principalType, 'service');
    assert.deepEqual(productProjectionLookups[0].authData.userGroups, ['serviceAccountUserGroup']);
});

test('Cart calculation ports read owner services with internal service groups', async () => {
    let ownerRequests = [];
    global.SERVICE.DefaultExactAmountService = exact;
    global.SERVICE.DefaultPricingDecisionService = pricingDecision;
    global.SERVICE.DefaultPriceSelectionService = priceSelection;
    global.SERVICE.DefaultPriceBookService = {
        get: async request => {
            ownerRequests.push({ service: 'priceBook', request });
            return { result: [{ tenant: 'default', code: 'retailUsd', currency: 'USD', status: 'ACTIVE' }] };
        }
    };
    global.SERVICE.DefaultInventorySourcingService = inventorySourcing;
    global.SERVICE.DefaultPromotionDecisionService = promotionDecision;
    global.SERVICE.DefaultTaxDecisionEngineService = taxDecision;
    global.SERVICE.DefaultPriceRowService = {
        get: async request => {
            ownerRequests.push({ service: 'price', request });
            return {
                result: [
                    { tenant: 'default', code: 'stale-price', productCode: 'agoraDress', unitAmount: '59.99', currency: 'USD', minQuantity: '1' },
                    { tenant: 'default', code: 'active-price', priceBookCode: 'retailUsd', productCode: 'agoraDress', unitAmount: '129.00', currency: 'USD', minQuantity: '1', status: 'ACTIVE' }
                ]
            };
        }
    };
    global.SERVICE.DefaultInventoryBalanceService = {
        get: async request => {
            ownerRequests.push({ service: 'inventory', request });
            return { result: [{ tenant: 'default', warehouseCode: 'main', sku: 'AGORA-DRESS-S', available: '5', priority: 1, revision: 3 }] };
        }
    };
    global.SERVICE.DefaultPromotionService = {
        get: async request => {
            ownerRequests.push({ service: 'promotion', request });
            return { result: [{ tenant: 'default', code: 'welcome10', status: 'ACTIVE', actions: { discountAmount: '10.00' }, conditions: { minimumSubtotal: '100.00' }, revision: 1 }] };
        }
    };
    global.SERVICE.DefaultTaxPolicyService = {
        get: async request => {
            ownerRequests.push({ service: 'tax', request });
            return { result: [{ tenant: 'default', taxCode: 'vat', jurisdiction: 'AE', status: 'ACTIVE', rate: '0.05', revision: 1 }] };
        }
    };

    let ports = calculationPorts.create({ tenant: 'default', code: 'cart1', jurisdiction: 'AE', correlationId: 'corr-1' });
    await ports.inventory({ tenant: 'default', sku: 'AGORA-DRESS-S', quantity: '1' });
    let price = await ports.pricing({ tenant: 'default', storeCode: 'agoraMainStore', productCode: 'agoraDress', quantity: '1', currency: 'USD' });
    await ports.promotion({ tenant: 'default', cartCode: 'cart1', subtotal: '129.00', currency: 'USD' });
    await ports.tax({ tenant: 'default', taxableAmount: '119.00', currency: 'USD' });

    assert.equal(price.priceRowCode, 'active-price');
    assert.equal(price.unitAmount, '129');
    assert.deepEqual(ownerRequests.map(item => item.service).sort(), ['inventory', 'price', 'priceBook', 'promotion', 'tax']);
    for (const item of ownerRequests) {
        assert.equal(item.request.authData.principalType, 'service');
        assert.deepEqual(item.request.authData.userGroups, ['serviceAccountUserGroup']);
        assert.deepEqual(item.request.authData.groups, ['serviceAccountUserGroup']);
    }
});

test('Cart customer API rejects unauthenticated ownership context', async () => {
    await assert.rejects(() => controller.create({ httpRequest: { body: { cartCode: 'cart1' } } }), /Authenticated tenant and customer are required/);
});

test('Cart customer API maps non-owned cart reads to access denied when Nodics errors are available', async () => {
    global.CLASSES = {
        NodicsError: class NodicsError extends Error {
            constructor(code, message) {
                super(message);
                this.code = code;
            }
        }
    };
    await controller.create({ authData: { tenant: 'default', principalId: 'customer-1' }, httpRequest: { body: { cartCode: 'cart1' } } });

    await assert.rejects(
        () => controller.read({ authData: { tenant: 'default', principalId: 'customer-2' }, httpRequest: { params: { cartCode: 'cart1' } } }),
        error => error.code === 'ERR_AUTH_00003'
    );
});
