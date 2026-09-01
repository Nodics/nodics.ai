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
 * @module product/test/productDiscoveryApiContract
 * @description Verifies customer-safe Product discovery/PDP APIs and persisted Product publication orchestration.
 * @layer test
 * @owner product
 */

const properties = require('../config/properties');
const routers = require('../src/router/routers');
const discoveryController = require('../src/controller/defaultProductDiscoveryController');
const publicationController = require('../src/controller/defaultProductPublicationController');
const discoveryFacade = require('../src/facade/defaultProductDiscoveryFacade');
const publicationFacade = require('../src/facade/defaultProductPublicationFacade');
const discovery = require('../src/service/defaultProductDiscoveryService');
const orchestration = require('../src/service/defaultProductCatalogPublicationOrchestrationService');
const localization = require('../src/service/defaultProductLocalizationPolicyService');
const publicationPolicy = require('../src/service/defaultProductPublicationPolicyService');
const projectionBuilder = require('../src/service/defaultProductLocalizedProjectionBuilderService');
const searchPublication = require('../src/service/defaultProductSearchPublicationService');
const searchEnrichment = require('../src/service/defaultProductSearchEnrichmentService');

const products = [
    { code: 'agoraLinenWrapDress', tenant: 'default', name: 'Linen Wrap Dress', status: 'ACTIVE', catalogVersion: 'agoraStaged', revision: 1 },
    { code: 'agoraOxfordShirt', tenant: 'default', name: 'Oxford Shirt', status: 'ACTIVE', catalogVersion: 'agoraStaged', revision: 1 }
];
const localizations = [
    { code: 'agoraLinenWrapDress-en', tenant: 'default', productCode: 'agoraLinenWrapDress', locale: 'en', name: 'Linen Wrap Dress', description: 'Linen dress', slug: 'linen-wrap-dress', seo: { title: 'Linen' }, classificationValues: { categoryCodes: ['agoraWomen'], domain: 'apparel' }, status: 'READY', revision: 1 },
    { code: 'agoraLinenWrapDress-ar', tenant: 'default', productCode: 'agoraLinenWrapDress', locale: 'ar', name: 'فستان كتان', description: 'فستان كتان', slug: 'linen-wrap-dress', seo: { title: 'فستان' }, classificationValues: { categoryCodes: ['agoraWomen'], domain: 'apparel' }, status: 'READY', revision: 1 },
    { code: 'agoraOxfordShirt-en', tenant: 'default', productCode: 'agoraOxfordShirt', locale: 'en', name: 'Oxford Shirt', description: 'Oxford shirt', slug: 'oxford-shirt', seo: { title: 'Oxford' }, classificationValues: { categoryCodes: ['agoraMen'], domain: 'apparel' }, status: 'READY', revision: 1 },
    { code: 'agoraOxfordShirt-ar', tenant: 'default', productCode: 'agoraOxfordShirt', locale: 'ar', name: 'قميص أكسفورد', description: 'قميص أكسفورد', slug: 'oxford-shirt', seo: { title: 'أكسفورد' }, classificationValues: { categoryCodes: ['agoraMen'], domain: 'apparel' }, status: 'READY', revision: 1 }
];
const variants = [
    { code: 'agoraLinenWrapDressNaturalS', tenant: 'default', productCode: 'agoraLinenWrapDress', sku: 'AGORA-DRESS-S', status: 'ACTIVE', attributes: {}, revision: 1 },
    { code: 'agoraOxfordShirtBlueM', tenant: 'default', productCode: 'agoraOxfordShirt', sku: 'AGORA-SHIRT-M', status: 'ACTIVE', attributes: {}, revision: 1 }
];
const projections = [
    { code: 'agoraLinenWrapDress|agoraMainStore|en', tenant: 'default', productCode: 'agoraLinenWrapDress', storeCode: 'agoraMainStore', locale: 'en', status: 'CURRENT',
        payload: { code: 'agoraLinenWrapDress', name: 'Linen Wrap Dress', description: 'Linen dress', slug: 'linen-wrap-dress', seo: { title: 'Linen' },
            localizedAttributes: { material: 'linen' }, classificationValues: { domain: 'apparel' }, categoryCodes: ['agoraWomen'], variantCodes: ['agoraLinenWrapDressNaturalS'],
            media: { primaryImage: 'agora-owned-product-linen-wrap-dress-primary', primaryAlt: 'Linen wrap dress' },
            variantSkuMap: { agoraLinenWrapDressNaturalS: 'AGORA-DRESS-S' },
            price: { currency: 'USD', unitAmount: '129.00', priceRowCode: 'internalPriceRow' },
            availability: { available: true, status: 'IN_STOCK', warehouseCode: 'internalWarehouse' }, inventory: { available: 12 }, sku: 'AGORA-DRESS-S' } },
    { code: 'agoraOxfordShirt|agoraMainStore|en', tenant: 'default', productCode: 'agoraOxfordShirt', storeCode: 'agoraMainStore', locale: 'en', status: 'CURRENT',
        payload: { code: 'agoraOxfordShirt', name: 'Oxford Shirt', description: 'Oxford shirt', slug: 'oxford-shirt', seo: { title: 'Oxford' },
            localizedAttributes: { material: 'cotton' }, classificationValues: { domain: 'apparel' }, categoryCodes: ['agoraMen'], variantCodes: ['agoraOxfordShirtBlueM'] } },
    { code: 'agoraStylePass5Coupon|agoraMainStore|en', tenant: 'default', productCode: 'agoraStylePass5Coupon', storeCode: 'agoraMainStore', locale: 'en', status: 'CURRENT',
        payload: { code: 'agoraStylePass5Coupon', name: 'Agora Style Pass 5 Percent Coupon', description: 'A digital coupon product for buying one future-use 5 percent Agora Apparel discount code.', slug: 'agora-style-pass-5-percent-coupon', seo: { title: 'Agora coupon' },
            localizedAttributes: { material: 'Digital coupon code' }, classificationValues: { domain: 'apparel', productType: 'DIGITAL', digitalDeliveryType: 'COUPON_CODE', inventoryStrategy: 'COUPON_CODE_POOL', couponBenefit: '5 percent discount' },
            categoryCodes: ['agoraDigitalCoupons'], collectionCodes: ['agoraCouponMarketplace'], variantCodes: ['agoraStylePass5CouponDigital'],
            price: { currency: 'USD', unitAmount: '5.00' },
            availability: { available: true, status: 'IN_STOCK', inventoryStrategy: 'COUPON_CODE_POOL' } } }
];

let searchRequests;
let savedProjections;
let indexedProjections;
let productReadRequests;
let localizationReadRequests;
let variantReadRequests;
let rankingRequests;
let configurationRequests;

function installGlobals() {
    searchRequests = [];
    savedProjections = [];
    indexedProjections = [];
    productReadRequests = [];
    localizationReadRequests = [];
    variantReadRequests = [];
    rankingRequests = [];
    configurationRequests = [];
    global.CONFIG = { get: key => key === 'product' ? properties.product : key === 'defaultTenant' ? 'default' : undefined };
    global.SERVICE = {
        DefaultProductDiscoveryService: discovery,
        DefaultProductCatalogPublicationOrchestrationService: orchestration,
        DefaultProductLocalizationPolicyService: localization,
        DefaultProductPublicationPolicyService: publicationPolicy,
        DefaultProductLocalizedProjectionBuilderService: projectionBuilder,
        DefaultProductSearchPublicationService: searchPublication,
        DefaultProductSearchEnrichmentService: searchEnrichment,
        DefaultCustomerPriceSummaryService: {
            summarize: async request => Object.fromEntries(request.productCodes.map(productCode => [productCode, { currency: request.currency, unitAmount: productCode === 'agoraLinenWrapDress' ? '129.00' : '79.00' }]))
        },
        DefaultCustomerAvailabilitySummaryService: {
            summarize: async request => Object.fromEntries(request.products.map(product => [product.productCode, { available: true, status: 'IN_STOCK' }]))
        },
        DefaultCommerceSearchRankingService: {
            rank: async (request, products) => {
                rankingRequests.push({ request, products });
                return products.slice().sort((left, right) => String(right.productCode).localeCompare(String(left.productCode)));
            }
        },
        DefaultDiscoveryConfigurationResolverService: {
            resolveIndexConfiguration: async request => {
                configurationRequests.push(request);
                return {
                    code: request.indexCode || 'agoraProductDiscoveryIndex',
                    indexName: 'productLocalized',
                    sourceMixCode: 'agoraProductDiscoverySourceMix',
                    fieldMappingCode: 'agoraProductDiscoveryFieldMapping',
                    queryProfileCode: 'agoraProductListingQuery',
                    facetProfileCode: 'agoraProductListingFacets',
                    rankingProfileCode: 'agoraProductRankingProfile'
                };
            }
        },
        DefaultProductSearchProjectionService: {
            doSearch: async request => {
                searchRequests.push(request);
                let rows = projections.filter(item => item.tenant === request.query.tenant &&
                item.storeCode === request.query.storeCode && item.locale === request.query.locale &&
                    item.status === request.query.status);
            if (request.query.productCode) rows = rows.filter(item => item.productCode === request.query.productCode);
            if (request.query['payload.categoryCodes']) rows = rows.filter(item => item.payload.categoryCodes.includes(request.query['payload.categoryCodes']));
            if (request.query['payload.classificationValues.domain']) rows = rows.filter(item => item.payload.classificationValues && item.payload.classificationValues.domain === request.query['payload.classificationValues.domain']);
            if (request.query.text) rows = rows.filter(item => discovery.textMatches(item, request.query.text));
                return { result: rows };
            },
            save: async request => savedProjections.push(request),
            doSave: async request => indexedProjections.push(request),
            update: async () => true,
            doRemoveByQuery: async () => true
        },
        DefaultProductService: {
            get: async request => {
                productReadRequests.push(request);
                return { result: products.filter(item => item.tenant === request.query.tenant &&
                    item.status === request.query.status && (!request.query.catalogVersion || item.catalogVersion === request.query.catalogVersion)) };
            }
        },
        DefaultProductLocalizationService: {
            get: async request => {
                localizationReadRequests.push(request);
                return { result: localizations.filter(item => item.tenant === request.query.tenant &&
                    item.status === request.query.status && request.query.productCode.$in.includes(item.productCode)) };
            }
        },
        DefaultProductVariantService: {
            get: async request => {
                variantReadRequests.push(request);
                return { result: variants.filter(item => item.tenant === request.query.tenant &&
                    item.status === request.query.status && request.query.productCode.$in.includes(item.productCode)) };
            }
        }
    };
    global.NODICS = {
        getModels: () => ({
            ProductSearchProjectionModel: {
                find: query => {
                    let rows = projections.filter(item => Object.keys(query).every(key => {
                        let actual = key.split('.').reduce((value, segment) => value && value[segment], item);
                        if (Array.isArray(actual)) return actual.includes(query[key]);
                        return actual === query[key];
                    }));
                    return {
                        sort: function () { return this; },
                        skip: function (count) { rows = rows.slice(count); return this; },
                        limit: function (count) { rows = rows.slice(0, count); return this; },
                        lean: function () { return this; },
                        exec: async function () { return rows; }
                    };
                }
            }
        })
    };
    global.FACADE = {
        DefaultProductDiscoveryFacade: discoveryFacade,
        DefaultProductPublicationFacade: publicationFacade
    };
}

test.beforeEach(installGlobals);

test('Product exposes customer discovery/PDP routes and operator publication route with safe metadata', () => {
    assert.equal(routers.product.customer.list.secured, false);
    assert.equal(routers.product.customer.list.publicAccess, true);
    assert.equal(routers.product.customer.list.apiExposure, 'commerceCustomer');
    assert.equal(routers.product.customer.detail.key, '/products/:productCode');
    assert.equal(routers.product.operator.publishSearch.secured, true);
    assert.equal(routers.product.operator.publishSearch.permission, 'commerce.product.publish');
    assert.equal(routers.product.operator.publishSearch.apiExposure, 'commerceManagement');
    assert.equal(routers.product.operator.restoreSearch.secured, true);
    assert.equal(routers.product.operator.restoreSearch.permission, 'commerce.product.publish');
    assert.equal(routers.product.operator.restoreSearch.apiExposure, 'commercePublicationIngestion');
    assert.equal(routers.product.operator.restoreSearch.key, '/internal/products/publication/search/restore');
});

test('customer discovery lists Product cards with safe price and availability but no raw inventory or SKU leakage', async () => {
    let response = await discoveryController.list({
        tenant: 'default',
        entCode: 'default',
        httpRequest: { query: { storeCode: 'agoraMainStore', locale: 'en', categoryCode: 'agoraWomen', domainCode: 'apparel', pageSize: '12' } }
    });

    assert.equal(response.data.products.length, 1);
    assert.equal(response.data.products[0].productCode, 'agoraLinenWrapDress');
    assert.equal(response.data.products[0].name, 'Linen Wrap Dress');
    assert.deepEqual(response.data.products[0].price, { currency: 'USD', unitAmount: '129.00' });
    assert.deepEqual(response.data.products[0].availability, { available: true, status: 'IN_STOCK' });
    assert.equal(response.data.products[0].media.primary.mediaCode, 'agora-owned-product-linen-wrap-dress-primary');
    assert.equal(response.data.products[0].media.primary.deliveryUrl, '/nodics/media/v0/content/agora-owned-product-linen-wrap-dress-primary');
    assert.equal(response.data.products[0].media.primary.altText, 'Linen wrap dress');
    assert.equal(response.data.products[0].image, undefined);
    assert.equal(response.data.products[0].price.priceRowCode, undefined);
    assert.equal(response.data.products[0].availability.warehouseCode, undefined);
    assert.equal(response.data.products[0].inventory, undefined);
    assert.equal(response.data.products[0].sku, undefined);
    assert.equal(response.data.products[0].variantSkuMap, undefined);
    assert.equal(searchRequests[0].indexName, 'productLocalized');
    assert.equal(configurationRequests[0].ownerType, 'PRODUCT');
    assert.equal(configurationRequests[0].authData.entCode, 'default');
    assert.equal(configurationRequests[0].authData.principalType, 'service');
    assert.equal(configurationRequests[0].authData.loginId, 'productDiscovery');
    assert.deepEqual(configurationRequests[0].authData.groups, ['serviceAccountUserGroup']);
    assert.equal(response.data.discovery.source, 'SEARCH_INDEX');
    assert.deepEqual(response.data.discovery.flow, ['DATA_FOLDER', 'COMMERCE_STAGED', 'COMMERCE_ONLINE', 'SEARCH_INDEX', 'STOREFRONT_API']);
    assert.equal(response.data.discovery.indexConfigurationCode, 'agoraProductDiscoveryIndex');
    assert.equal(response.data.discovery.sourceMixCode, 'agoraProductDiscoverySourceMix');
    assert.equal(response.data.discovery.fieldMappingCode, 'agoraProductDiscoveryFieldMapping');
    assert.equal(response.data.discovery.rankingProfileCode, 'agoraProductRankingProfile');
    assert.deepEqual(searchRequests[0].query, {
        tenant: 'default', storeCode: 'agoraMainStore', locale: 'en', status: 'CURRENT',
        'payload.categoryCodes': 'agoraWomen', 'payload.classificationValues.domain': 'apparel'
    });
});

test('customer discovery maps storefront collection codes to indexed product category classifications', async () => {
    let response = await discoveryController.list({
        tenant: 'default',
        httpRequest: { query: { storeCode: 'agoraMainStore', locale: 'en', collectionCode: 'agoraWomen', pageSize: '12' } }
    });

    assert.equal(response.data.products.length, 1);
    assert.equal(response.data.products[0].productCode, 'agoraLinenWrapDress');
    assert.deepEqual(searchRequests[0].query, {
        tenant: 'default', storeCode: 'agoraMainStore', locale: 'en', status: 'CURRENT', 'payload.categoryCodes': 'agoraWomen'
    });
});

test('customer discovery fails open when secured Discovery configuration lookup is unavailable', async () => {
    global.SERVICE.DefaultDiscoveryConfigurationResolverService.resolveIndexConfiguration = async () => {
        throw new Error('Discovery index configuration is secured');
    };
    let response = await discoveryController.list({
        tenant: 'default',
        httpRequest: { query: { storeCode: 'agoraMainStore', locale: 'en', categoryCode: 'agoraWomen', pageSize: '12' } }
    });

    assert.equal(response.data.products.length, 1);
    assert.equal(searchRequests[0].indexName, 'productLocalized');
    assert.equal(response.data.discovery.indexName, 'productLocalized');
    assert.equal(response.data.discovery.indexConfigurationCode, undefined);
});

test('customer discovery resolves default tenant for public storefront requests', async () => {
    let response = await discoveryController.list({
        httpRequest: { query: { storeCode: 'agoraMainStore', locale: 'en', pageSize: '12' } }
    });

    assert.equal(response.data.tenant, 'default');
    assert.equal(searchRequests[0].query.tenant, 'default');
    assert.equal(searchRequests[0].query.storeCode, 'agoraMainStore');
    assert.equal(searchRequests[0].query.locale, 'en');
});

test('customer discovery falls back to Product projection store when browse search index is empty', async () => {
    global.SERVICE.DefaultProductSearchProjectionService.doSearch = async request => {
        searchRequests.push(request);
        return { result: [] };
    };
    let response = await discoveryController.list({
        tenant: 'default',
        httpRequest: { query: { storeCode: 'agoraMainStore', locale: 'en', categoryCode: 'agoraWomen', pageSize: '12' } }
    });

    assert.equal(response.data.products.length, 1);
    assert.equal(response.data.products[0].productCode, 'agoraLinenWrapDress');
    assert.equal(response.data.discovery.source, 'PROJECTION_STORE_FALLBACK');
});

test('customer discovery completes short search-adapter pages from Product projection store', async () => {
    global.SERVICE.DefaultProductSearchProjectionService.doSearch = async request => {
        searchRequests.push(request);
        return { result: [projections[0]] };
    };
    let response = await discoveryController.list({
        tenant: 'default',
        httpRequest: { query: { storeCode: 'agoraMainStore', locale: 'en', pageSize: '2' } }
    });

    assert.equal(response.data.products.length, 2);
    assert.deepEqual(response.data.products.map(item => item.productCode).sort(), ['agoraLinenWrapDress', 'agoraOxfordShirt']);
    assert.equal(response.data.discovery.source, 'PROJECTION_STORE_FALLBACK');
});

test('customer discovery uses active nSearch registry before projection-store fallback', async () => {
    let pipelineRequests = [];
    global.SERVICE.DefaultProductSearchProjectionService.doSearch = async request => {
        searchRequests.push(request);
        return { result: [] };
    };
    global.SERVICE.DefaultPipelineService = {
        start: async (pipelineName, request) => {
            pipelineRequests.push({ pipelineName, request });
            return { result: [projections[0]] };
        }
    };
    global.NODICS.getSearchModel = (moduleName, tenant, indexName) => {
        assert.equal(moduleName, 'product');
        assert.equal(tenant, 'default');
        assert.equal(indexName, 'productLocalized');
        return { doSearch: async () => ({ result: [projections[0]] }) };
    };

    let response = await discoveryController.list({
        tenant: 'default',
        httpRequest: { query: { storeCode: 'agoraMainStore', locale: 'en', categoryCode: 'agoraWomen', pageSize: '12' } }
    });

    assert.equal(response.data.products.length, 1);
    assert.equal(response.data.products[0].productCode, 'agoraLinenWrapDress');
    assert.equal(response.data.discovery.source, 'SEARCH_INDEX');
    assert.equal(pipelineRequests[0].pipelineName, 'doSearchModelInitializerPipeline');
    assert.equal(pipelineRequests[0].request.searchModel.doSearch instanceof Function, true);
});

test('customer discovery applies text search during projection-store fallback', async () => {
    global.SERVICE.DefaultProductSearchProjectionService.doSearch = async request => {
        searchRequests.push(request);
        return { result: [] };
    };
    let response = await discoveryController.list({
        tenant: 'default',
        httpRequest: { query: { storeCode: 'agoraMainStore', locale: 'en', q: 'linen', pageSize: '12' } }
    });

    assert.deepEqual(response.data.products.map(item => item.productCode), ['agoraLinenWrapDress']);
    assert.equal(searchRequests[0].query.text, 'linen');
    assert.equal(response.data.discovery.source, 'PROJECTION_STORE_FALLBACK');
});

test('customer discovery text fallback scans beyond the requested first page before filtering', async () => {
    global.SERVICE.DefaultProductSearchProjectionService.doSearch = async request => {
        searchRequests.push(request);
        return { result: [] };
    };
    let response = await discoveryController.list({
        tenant: 'default',
        httpRequest: { query: { storeCode: 'agoraMainStore', locale: 'en', q: 'coupon', pageSize: '2' } }
    });

    assert.deepEqual(response.data.products.map(item => item.productCode), ['agoraStylePass5Coupon']);
    assert.equal(response.data.discovery.source, 'PROJECTION_STORE_FALLBACK');
});

test('customer discovery finds coupon products by digital coupon projection metadata', async () => {
    let response = await discoveryController.list({
        tenant: 'default',
        httpRequest: { query: { storeCode: 'agoraMainStore', locale: 'en', domainCode: 'apparel', q: 'coupon', pageSize: '12' } }
    });

    assert.deepEqual(response.data.products.map(item => item.productCode), ['agoraStylePass5Coupon']);
    assert.equal(response.data.products[0].name, 'Agora Style Pass 5 Percent Coupon');
    assert.equal(response.data.products[0].availability.status, 'IN_STOCK');
    assert.deepEqual(searchRequests[0].query, {
        tenant: 'default',
        storeCode: 'agoraMainStore',
        locale: 'en',
        status: 'CURRENT',
        'payload.classificationValues.domain': 'apparel',
        text: 'coupon'
    });
});

test('customer discovery extracts nested nSearch Elasticsearch hits', () => {
    let rows = discovery.records({ result: { hits: { hits: [{ _source: projections[0] }] } } });
    assert.equal(rows.length, 1);
    assert.equal(rows[0].code, 'agoraLinenWrapDress|agoraMainStore|en');
    rows = discovery.records({ result: { body: { hits: { hits: [{ _source: projections[1] }] } } } });
    assert.equal(rows.length, 1);
    assert.equal(rows[0].code, 'agoraOxfordShirt|agoraMainStore|en');
    rows = discovery.records({ data: { result: { response: { body: { hits: { hits: [{ _source: projections[0] }] } } } } } });
    assert.equal(rows.length, 1);
    assert.equal(rows[0].code, 'agoraLinenWrapDress|agoraMainStore|en');
});

test('customer discovery delegates customer-safe result ordering to Commerce Search when available', async () => {
    let response = await discoveryController.list({
        tenant: 'default',
        httpRequest: { query: { storeCode: 'agoraMainStore', locale: 'en', pageSize: '12' } }
    });

    assert.deepEqual(response.data.products.map(item => item.productCode), ['agoraStylePass5Coupon', 'agoraOxfordShirt', 'agoraLinenWrapDress']);
    assert.equal(rankingRequests.length, 1);
    assert.equal(rankingRequests[0].request.storeCode, 'agoraMainStore');
    assert.equal(rankingRequests[0].products[0].sku, undefined);
    assert.equal(rankingRequests[0].products[0].inventory, undefined);
});

test('customer PDP resolves one Product detail through Product search projection only', async () => {
    let response = await discoveryController.detail({
        tenant: 'default',
        httpRequest: { params: { productCode: 'agoraOxfordShirt' }, query: { storeCode: 'agoraMainStore', locale: 'en' } }
    });

    assert.equal(response.data.product.productCode, 'agoraOxfordShirt');
    assert.equal(response.data.product.description, 'Oxford shirt');
    assert.equal(response.data.product.price, undefined);
    assert.equal(response.data.product.availability, undefined);
    assert.equal(response.data.product.inventory, undefined);
    assert.equal(response.data.product.sku, undefined);
    assert.equal(response.data.product.variantSkuMap, undefined);
    assert.equal(searchRequests[0].query.productCode, 'agoraOxfordShirt');
    assert.equal(response.data.discovery.source, 'SEARCH_INDEX');
    assert.equal(response.data.discovery.indexName, 'productLocalized');
});

test('public discovery fails closed when Store or locale context is absent', async () => {
    let originalConfig = global.CONFIG;
    global.CONFIG = { get: key => key === 'product' ? { discovery: {} } : key === 'defaultTenant' ? 'default' : undefined };
    try {
        await assert.rejects(() => discoveryController.list({
            httpRequest: { query: {} }
        }), /Tenant, Store, and locale are required/);
    } finally {
        global.CONFIG = originalConfig;
    }
});

test('operator publication orchestration reads persisted Product records and writes nSearch projections', async () => {
    let response = await publicationController.publishSearch({
        authData: { tenant: 'default', loginId: 'operator-1' },
        correlationId: 'corr-publish-1',
        now: '2026-08-14T00:00:00.000Z',
        httpRequest: { body: { catalogVersion: 'agoraStaged', storeCode: 'agoraMainStore' } }
    });

    assert.equal(response.data.requested, 2);
    assert.equal(response.data.published, 2);
    assert.equal(response.data.projectionCount, 4);
    assert.deepEqual(productReadRequests[0].searchOptions, { pageSize: 101, pageNumber: 1 });
    assert.deepEqual(localizationReadRequests[0].searchOptions, { pageSize: 20, pageNumber: 1 });
    assert.deepEqual(variantReadRequests[0].searchOptions, { pageSize: 100, pageNumber: 1 });
    assert.equal(savedProjections.length, 4);
    assert.equal(indexedProjections.length, 4);
    assert(indexedProjections.every(item => item.moduleName === 'product'));
    assert(indexedProjections.every(item => item.indexName === 'productLocalized'));
    assert.deepEqual(new Set(indexedProjections.map(item => item.searchOptions.analyzer)), new Set(['arabic', 'standard']));
    assert(indexedProjections.every(item => item.model.payload.inventory === undefined));
    assert(indexedProjections.every(item => item.model.payload.sku === undefined));
    assert(indexedProjections.every(item => item.model.payload.variantSkuMap && Object.keys(item.model.payload.variantSkuMap).length === 1));
    assert(indexedProjections.every(item => item.model.payload.price && item.model.payload.price.currency === 'USD'));
    assert(indexedProjections.every(item => item.model.payload.availability && item.model.payload.availability.status === 'IN_STOCK'));
    assert.equal(response.data.projectionSnapshots, undefined);
});

test('operator publication can include projection snapshots only when requested for Online handoff', async () => {
    let response = await publicationController.publishSearch({
        authData: { tenant: 'default', loginId: 'operator-1' },
        correlationId: 'corr-publish-2',
        now: '2026-08-14T00:00:00.000Z',
        httpRequest: { body: { catalogVersion: 'agoraStaged', storeCode: 'agoraMainStore', includeProjectionSnapshots: true } }
    });

    assert.equal(response.data.published, 2);
    assert.equal(response.data.projectionSnapshots.length, 2);
    assert.equal(response.data.projectionSnapshots[0].storeCode, 'agoraMainStore');
    assert(response.data.projectionSnapshots.every(snapshot => Array.isArray(snapshot.projections)));
    assert.equal(response.data.projectionSnapshots.flatMap(snapshot => snapshot.projections).length, 4);
});

test('operator restoration ingests evidenced projections through Product search publication boundary', async () => {
    let response = await publicationController.restoreSearch({
        authData: { tenant: 'default', loginId: 'operator-1' },
        correlationId: 'corr-restore-1',
        now: '2026-08-15T00:00:00.000Z',
        httpRequest: {
            body: {
                storeCode: 'agoraMainStore',
                projectionSnapshots: [
                    { productCode: 'agoraLinenWrapDress', storeCode: 'agoraMainStore', projections: [projections[0]] },
                    { productCode: 'agoraOxfordShirt', storeCode: 'agoraMainStore', projections: [projections[1]] }
                ]
            }
        }
    });

    assert.equal(response.data.restored, 2);
    assert.equal(response.data.projectionCount, 2);
    assert.equal(savedProjections.length, 2);
    assert.equal(indexedProjections.length, 2);
    assert(indexedProjections.every(item => item.moduleName === 'product'));
    assert(indexedProjections.every(item => item.indexName === 'productLocalized'));
    assert(indexedProjections.every(item => item.model.status === 'CURRENT'));
});
