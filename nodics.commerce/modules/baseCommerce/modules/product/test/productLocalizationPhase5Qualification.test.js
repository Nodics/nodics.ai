/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const test = require('node:test');

const properties = require('../config/properties');
const localization = require('../src/service/defaultProductLocalizationPolicyService');
const builder = require('../src/service/defaultProductLocalizedProjectionBuilderService');
const staging = require('../src/service/defaultProductPublicationPolicyService');
const searchPublication = require('../src/service/defaultProductSearchPublicationService');
const lifecycle = require('../src/service/defaultProductLocalizedPublicationLifecycleService');
const bulk = require('../src/service/defaultProductLocalizationBulkService');
const indexes = require('../src/search/indexes');
const product = require('../data/sample/data/product/sampleProductData').record0;
const localizations = Object.values(require('../data/sample/data/product/sampleProductLocalizationData'));

const savedPublications = [];
const updatedPublications = [];
const savedProjections = [];
const indexedProjections = [];
const removedQueries = [];

global.CONFIG = { get: key => key === 'product' ? properties.product : undefined };
global.SERVICE = {
    DefaultProductLocalizationPolicyService: localization,
    DefaultProductLocalizedProjectionBuilderService: builder,
    DefaultProductPublicationPolicyService: staging,
    DefaultProductSearchPublicationService: searchPublication,
    DefaultProductPublicationService: {
        save: async request => savedPublications.push(request),
        update: async request => updatedPublications.push(request)
    },
    DefaultProductSearchProjectionService: {
        save: async request => savedProjections.push(request),
        doSave: async request => indexedProjections.push(request),
        update: async () => undefined,
        doRemoveByQuery: async request => removedQueries.push(request)
    }
};

const request = { tenant: 'default', correlationId: 'phase5-correlation', authData: {},
    now: '2026-08-10T12:00:00.000Z' };
const input = { product: product, localizations: localizations, storeCode: 'sampleStore',
    categoryCodes: ['sampleFootwear'], variantCodes: ['sampleRunningShoeBlue42'], publicationRevision: 1 };

test.beforeEach(() => {
    savedPublications.length = 0;
    updatedPublications.length = 0;
    savedProjections.length = 0;
    indexedProjections.length = 0;
    removedQueries.length = 0;
});

test('preview and stage preserve one identity while proving bilingual direction and completeness', async () => {
    let preview = lifecycle.preview(request, input);
    assert.deepEqual(preview.previews.map(item => [item.locale, item.direction]).sort(), [['ar', 'rtl'], ['en', 'ltr']]);
    assert.equal(preview.publication.localization.complete, true);
    let staged = await lifecycle.stage(request, input);
    assert.equal(staged.model.status, 'STAGED');
    assert.deepEqual(staged.model.projectionCodes.sort(), ['sampleRunningShoe|sampleStore|ar', 'sampleRunningShoe|sampleStore|en']);
    assert.equal(savedPublications.length, 1);
    assert.equal(indexedProjections.length, 0);
});

test('publish synchronizes staged evidence and both online locale projections', async () => {
    let staged = await lifecycle.stage(request, input);
    let result = await lifecycle.publish(request, Object.assign({}, input, { staged: staged }));
    assert.equal(result.publication.status, 'PUBLISHED');
    assert.equal(indexedProjections.length, 2);
    assert(updatedPublications.some(item => item.model.status === 'PUBLISHED'));
});

test('rollback withdraws current state, restores the target snapshot, and appends evidence', async () => {
    let targetProjections = lifecycle.preview(request, input).projections;
    let target = { code: 'publication-1', tenant: 'default', productCode: product.code,
        catalogVersion: product.catalogVersion, storeCode: 'sampleStore', revision: 1, status: 'SUPERSEDED',
        sourceHash: 'source-1', localizationEvidence: { complete: true } };
    let current = Object.assign({}, target, { code: 'publication-2', revision: 2, status: 'PUBLISHED', sourceHash: 'source-2' });
    let result = await lifecycle.rollback(request, { currentPublication: current, targetPublication: target,
        targetProjections: targetProjections });
    assert.equal(result.publication.rollbackOf, 'publication-2');
    assert.equal(result.publication.status, 'PUBLISHED');
    assert.equal(removedQueries.length, 1);
    assert.equal(indexedProjections.length, 2);
    assert(updatedPublications.some(item => item.model.status === 'ROLLED_BACK'));
});

test('bulk preflight rejects duplicates and missing mandatory locales while export stays tenant and locale scoped', () => {
    assert.equal(bulk.preflight(request, { kind: 'product', rows: localizations, requireComplete: true }).rowCount, 2);
    assert.throws(() => bulk.preflight(request, { kind: 'product', rows: [localizations[0], localizations[0]] }));
    assert.throws(() => bulk.preflight(request, { kind: 'product', rows: localizations.slice(0, 1), requireComplete: true }),
        { code: 'ERR_PRODUCT_L10N_0006' });
    let exported = bulk.prepareExport(request, { rows: localizations.concat(Object.assign({}, localizations[0], { tenant: 'other' })),
        locales: ['ar'] });
    assert.deepEqual(exported.map(item => item.locale), ['ar']);
});

test('search cache keys and index partitions isolate tenant Store and locale and mutations enable invalidation', () => {
    global._ = { merge: (...values) => Object.assign({}, ...values) };
    global.UTILS = { generateHash: value => crypto.createHash('sha256').update(value).digest('hex') };
    let cache = require('../../../../../../nodics.foundation/modules/nCache/cache/src/service/config/defaultCacheConfigurationService');
    let base = { searchModel: { indexName: 'productLocalized' }, tenant: 'default', options: {}, searchOptions: {},
        query: { storeCode: 'sampleStore', locale: 'en' } };
    let english = cache.createSearchKey(base);
    let arabic = cache.createSearchKey(Object.assign({}, base, { query: { storeCode: 'sampleStore', locale: 'ar' } }));
    let otherTenant = cache.createSearchKey(Object.assign({}, base, { tenant: 'other' }));
    assert.notEqual(english, arabic);
    assert.notEqual(english, otherTenant);
    assert.deepEqual(indexes.product.productLocalized.partitionProperties, ['tenant', 'storeCode', 'locale']);
    assert.equal(indexes.product.productLocalized.cache.enabled, true);
});

test('partial indexing failure invokes tenant Product and Store compensation', async () => {
    let calls = 0;
    let original = global.SERVICE.DefaultProductSearchProjectionService.doSave;
    global.SERVICE.DefaultProductSearchProjectionService.doSave = async () => {
        calls += 1;
        if (calls === 2) throw new Error('provider unavailable');
    };
    try {
        await assert.rejects(searchPublication.publish(request, input), /provider unavailable/);
        assert.equal(removedQueries.length, 1);
        assert.deepEqual(removedQueries[0].query, { tenant: 'default', productCode: product.code, storeCode: 'sampleStore' });
    } finally {
        global.SERVICE.DefaultProductSearchProjectionService.doSave = original;
    }
});
