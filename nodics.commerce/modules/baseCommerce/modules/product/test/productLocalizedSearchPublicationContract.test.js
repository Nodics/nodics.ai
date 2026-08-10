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
const staging = require('../src/service/defaultProductPublicationPolicyService');
const publication = require('../src/service/defaultProductSearchPublicationService');
const indexes = require('../src/search/indexes');
const sampleProducts = require('../data/sample/data/product/sampleProductData');
const sampleLocalizations = require('../data/sample/data/product/sampleProductLocalizationData');

const persisted = [];
const indexed = [];
const updated = [];
const removed = [];

global.CONFIG = { get: key => key === 'product' ? properties.product : undefined };
global.SERVICE = {
    DefaultProductLocalizationPolicyService: localization,
    DefaultProductLocalizedProjectionBuilderService: builder,
    DefaultProductPublicationPolicyService: staging,
    DefaultProductSearchProjectionService: {
        save: async request => persisted.push(request),
        doSave: async request => indexed.push(request),
        update: async request => updated.push(request),
        doRemoveByQuery: async request => removed.push(request)
    }
};

const request = { tenant: 'default', correlationId: 'corr-search-1', authData: { groups: ['adminGroup'] },
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
        storeCode: 'sampleStore', categoryCodes: ['sampleFootwear'], variantCodes: ['sampleRunningShoeBlue42'] });

    assert.equal(result.publication.localization.complete, true);
    assert.deepEqual(result.projections.map(item => item.locale).sort(), ['ar', 'en']);
    assert.equal(persisted.length, 2);
    assert.equal(indexed.length, 2);
    assert(indexed.every(item => item.moduleName === 'product' && item.indexName === 'productLocalized'));
    assert.deepEqual(Object.fromEntries(indexed.map(item => [item.model.locale, item.searchOptions.analyzer])), {
        en: 'standard', ar: 'arabic'
    });
    assert(indexed.every(item => item.model.tenant === 'default' && item.model.storeCode === 'sampleStore'));
    assert(indexed.every(item => item.model.payload.sku === undefined && item.model.payload.price === undefined &&
        item.model.payload.inventory === undefined));
});

test('publication fails closed before persistence when tenant or required locale readiness is invalid', async () => {
    await assert.rejects(publication.publish({ tenant: 'other' }, { product: product, localizations: localizations,
        storeCode: 'sampleStore' }));
    await assert.rejects(publication.publish(request, { product: product, localizations: localizations.slice(0, 1),
        storeCode: 'sampleStore' }), { code: 'ERR_PRODUCT_L10N_0006' });
    assert.equal(persisted.length, 0);
    assert.equal(indexed.length, 0);
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

test('Product contributes a provider-neutral tenant Store and locale partitioned index', () => {
    let definition = indexes.product.productLocalized;
    assert.equal(definition.schemaName, 'productSearchProjection');
    assert.equal(definition.tenantPropertyName, 'tenant');
    assert.deepEqual(definition.partitionProperties, ['tenant', 'storeCode', 'locale']);
    assert.equal(definition.properties.payload.type, 'object');
});
