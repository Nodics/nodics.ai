/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('node:assert/strict');
const test = require('node:test');

/**
 * @module product/test/productLocalizedSearchPublicationContract
 * @description Proves the sample import-to-publication-to-projection-to-nSearch boundary for every required locale.
 * @layer test
 * @owner product
 */

const properties = require('../config/properties');
const localization = require('../src/service/defaultProductLocalizationPolicyService');
const builder = require('../src/service/defaultProductLocalizedProjectionBuilderService');
const enrichment = require('../src/service/defaultProductSearchEnrichmentService');
const staging = require('../src/service/defaultProductPublicationPolicyService');
const publication = require('../src/service/defaultProductSearchPublicationService');
const indexes = require('../src/search/indexes');
const sampleProducts = require('../data/sample-v001/records/product/sampleProductData');
const sampleLocalizations = require('../data/sample-v001/records/product/sampleProductLocalizationData');

const persisted = [];
const indexed = [];
const updated = [];
const removed = [];

global.CONFIG = { get: key => key === 'product' ? properties.product : undefined };
global.SERVICE = {
    DefaultProductLocalizationPolicyService: localization,
    DefaultProductLocalizedProjectionBuilderService: builder,
    DefaultProductSearchEnrichmentService: enrichment,
    DefaultProductPublicationPolicyService: staging,
    DefaultCustomerPriceSummaryService: {
        summarize: async request => ({ [request.productCodes[0]]: { currency: request.currency, unitAmount: '89.00' } })
    },
    DefaultCustomerAvailabilitySummaryService: {
        summarize: async request => ({ [request.products[0].productCode]: { available: true, status: 'IN_STOCK' } })
    },
    DefaultProductSearchProjectionService: {
        save: async request => persisted.push(request),
        update: async request => updated.push(request)
    },
    DefaultSearchService: {
        doSave: async request => indexed.push(request),
        doRemoveByQuery: async request => removed.push(request)
    }
};

const request = { tenant: 'default', enterpriseCode: 'sampleEnterprise', correlationId: 'corr-search-1', authData: { groups: ['adminGroup'] },
    now: '2026-08-10T00:00:00.000Z' };
const product = sampleProducts.record0;
const localizations = Object.values(sampleLocalizations);

test.beforeEach(() => {
    persisted.length = 0;
    indexed.length = 0;
    updated.length = 0;
    removed.length = 0;
});

test('sample release publishes one isolated nSearch document for English and Arabic', async () => {
    let result = await publication.publish(request, { product: product, localizations: localizations,
        storeCode: 'sampleStore', categoryCodes: ['sampleFootwear'], variantCodes: ['sampleRunningShoeBlue42'],
        variants: [{ code: 'sampleRunningShoeBlue42', sku: 'SAMPLE-RUN-BLUE-42' }] });

    assert.equal(result.publication.localization.complete, true);
    assert.deepEqual(result.projections.map(item => item.locale).sort(), ['ar', 'en']);
    assert(result.projections.every(item => item.projectedAt instanceof Date));
    assert(result.projections.every(item => Object.isExtensible(item)));
    assert.equal(persisted.length, 2);
    assert(persisted.every(item => item.model.active === true && item.model.created instanceof Date && item.model.updated instanceof Date));
    assert.equal(indexed.length, 2);
    assert(indexed.every(item => item.moduleName === 'product' && item.indexName === 'productLocalized'));
    assert.deepEqual(Object.fromEntries(indexed.map(item => [item.model.locale, item.searchOptions.analyzer])), {
        en: 'standard', ar: 'arabic'
    });
    assert(indexed.every(item => item.model.tenant === 'default' && item.model.enterpriseCode === 'sampleEnterprise' && item.model.storeCode === 'sampleStore'));
    assert(indexed.every(item => item.model.payload.sku === undefined && item.model.payload.inventory === undefined));
    assert(indexed.every(item => item.model.payload.variantSkuMap.sampleRunningShoeBlue42 === 'SAMPLE-RUN-BLUE-42'));
    assert(indexed.every(item => item.model.payload.price.currency === 'USD' && item.model.payload.price.unitAmount === '89.00'));
    assert(indexed.every(item => item.model.payload.availability.status === 'IN_STOCK'));
});

test('localized media is carried into customer search projection payloads', async () => {
    let mediaLocalizations = localizations.map(item => item.locale === 'en' ? Object.assign({}, item, {
        media: { primaryImage: { mediaCode: 'sample-product-primary', altText: 'Sample product primary' } }
    }) : item);

    await publication.publish(request, { product: product, localizations: mediaLocalizations,
        storeCode: 'sampleStore', categoryCodes: ['sampleFootwear'], variantCodes: ['sampleRunningShoeBlue42'],
        variants: [{ code: 'sampleRunningShoeBlue42', sku: 'SAMPLE-RUN-BLUE-42' }] });

    let englishProjection = indexed.find(item => item.model.locale === 'en').model;
    assert.equal(englishProjection.payload.media.primaryImage.mediaCode, 'sample-product-primary');
    assert.equal(englishProjection.payload.media.primaryImage.altText, 'Sample product primary');
});

test('publication fails closed before persistence when tenant or required locale readiness is invalid', async () => {
    await assert.rejects(publication.publish({ tenant: 'other' }, { product: product, localizations: localizations,
        storeCode: 'sampleStore' }));
    await assert.rejects(publication.publish(request, { product: product, localizations: localizations.slice(0, 1),
        storeCode: 'sampleStore' }), { code: 'ERR_PRODUCT_L10N_0006' });
    assert.equal(persisted.length, 0);
    assert.equal(indexed.length, 0);
});

test('publication fails closed when nSearch reports document indexing failures', async () => {
    let original = global.SERVICE.DefaultSearchService.doSave;
    global.SERVICE.DefaultSearchService.doSave = async () => ({
        code: 'SUC_SRCH_00000',
        result: [],
        errors: [{ code: 'ERR_SRCH_00003', message: 'Invalid data model to save' }]
    });
    try {
        await assert.rejects(publication.publish(request, { product: product, localizations: localizations,
            storeCode: 'sampleStore', categoryCodes: ['sampleFootwear'], variantCodes: ['sampleRunningShoeBlue42'],
            variants: [{ code: 'sampleRunningShoeBlue42', sku: 'SAMPLE-RUN-BLUE-42' }] }), {
            code: 'ERR_PRODUCT_SEARCH_INDEX_0001'
        });
        assert.equal(removed.length, 1);
        assert.deepEqual(removed[0].query, { tenant: 'default', productCode: product.code, storeCode: 'sampleStore' });
    } finally {
        global.SERVICE.DefaultSearchService.doSave = original;
    }
});

test('withdrawal updates and removes only the tenant Product and Store partition', async () => {
    let result = await publication.withdraw(request, { productCode: product.code, storeCode: 'sampleStore' });
    let query = { tenant: 'default', productCode: product.code, storeCode: 'sampleStore' };

    assert.equal(result.status, 'WITHDRAWN');
    assert.deepEqual(updated[0].query, query);
    assert.deepEqual(updated[0].model, { status: 'WITHDRAWN' });
    assert.deepEqual(removed[0].query, query);
    assert.equal(removed[0].indexName, 'productLocalized');
});

test('publication uses active nSearch model registry when generated search service is not exposed', async () => {
    let originalSearchService = global.SERVICE.DefaultSearchService;
    let originalPipelineService = global.SERVICE.DefaultPipelineService;
    let originalNodics = global.NODICS;
    let pipelines = [];
    delete global.SERVICE.DefaultSearchService;
    global.SERVICE.DefaultPipelineService = {
        start: async (pipelineName, request) => {
            pipelines.push({ pipelineName, request });
            return { code: 'SUC_SRCH_00000', errors: [] };
        }
    };
    global.NODICS = {
        getSearchModel: (moduleName, tenant, indexName) => {
            assert.equal(moduleName, 'product');
            assert.equal(tenant, 'default');
            assert.equal(indexName, 'productLocalized');
            return { doSave: async () => true, doRemoveByQuery: async () => true };
        }
    };
    try {
        let searchService = publication.searchService();
        await searchService.doSave({ tenant: 'default', moduleName: 'product', indexName: 'productLocalized' });
        await searchService.doRemoveByQuery({ tenant: 'default', moduleName: 'product', indexName: 'productLocalized' });
        assert.deepEqual(pipelines.map(item => item.pipelineName), [
            'doSaveModelsInitializerPipeline',
            'doRemoveModelsByQueryInitializerPipeline'
        ]);
    } finally {
        global.SERVICE.DefaultSearchService = originalSearchService;
        global.SERVICE.DefaultPipelineService = originalPipelineService;
        global.NODICS = originalNodics;
    }
});

test('store replacement withdraws the full current tenant Store partition before restore', async () => {
    let result = await publication.replaceStore(request, { storeCode: 'sampleStore' });
    let query = { tenant: 'default', storeCode: 'sampleStore', status: 'CURRENT' };

    assert.equal(result.status, 'WITHDRAWN');
    assert.deepEqual(updated[0].query, query);
    assert.deepEqual(updated[0].model, { status: 'WITHDRAWN' });
    assert.deepEqual(removed[0].query, query);
    assert.equal(removed[0].indexName, 'productLocalized');
});

test('Product contributes a provider-neutral tenant Store and locale partitioned index', () => {
    let definition = indexes.product.productLocalized;
    assert.equal(definition.schemaName, 'productSearchProjection');
    assert.equal(definition.tenantPropertyName, 'tenant');
    assert.deepEqual(definition.partitionProperties, ['tenant', 'storeCode', 'locale']);
    assert.equal(definition.properties.payload.type, 'object');
    assert.equal(definition.properties.payload.dynamic, false);
    assert.equal(definition.properties.payload.properties.categoryCodes.type, 'keyword');
});
