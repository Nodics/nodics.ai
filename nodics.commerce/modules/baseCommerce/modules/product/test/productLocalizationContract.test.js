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
 * @module product/test/productLocalizationContract
 * @description Proves Product localization schema, completeness, tenant isolation, search projection, and layered customization contracts.
 * @layer test
 * @owner product
 * @override Customer modules should add their own policy tests without replacing this framework contract.
 */

const properties = require('../config/properties');
const schemas = require('../src/schemas/schemas').product;
const localization = require('../src/service/defaultProductLocalizationPolicyService');
const projection = require('../src/service/defaultProductLocalizedProjectionBuilderService');
const publication = require('../src/service/defaultProductPublicationPolicyService');
const sampleProducts = require('../data/sample-v001/records/product/sampleProductData');
const sampleProductLocalizations = require('../data/sample-v001/records/product/sampleProductLocalizationData');
const sampleCategories = require('../data/sample-v001/records/product/sampleCategoryData');
const sampleCategoryLocalizations = require('../data/sample-v001/records/product/sampleCategoryLocalizationData');
const sampleVariants = require('../data/sample-v001/records/product/sampleProductVariantData');
const sampleVariantLocalizations = require('../data/sample-v001/records/product/sampleProductVariantLocalizationData');
const sampleHeader = require('../data/sample-v001/headers/product/sampleProductLocalizationDataHeader');

global.CONFIG = { get: key => key === 'product' ? properties.product : undefined };
global.SERVICE = { DefaultProductLocalizationPolicyService: localization };

const request = { tenant: 'tenant-a', correlationId: 'corr-1', now: '2026-08-10T00:00:00.000Z' };
const product = { code: 'shoe', tenant: 'tenant-a', name: 'Legacy shoe', status: 'ACTIVE', catalogVersion: 'summer', revision: 3 };
const variants = [
    { code: 'shoe-en', tenant: 'tenant-a', productCode: 'shoe', locale: 'en', name: 'Running shoe', description: 'Light shoe', status: 'READY', revision: 2 },
    { code: 'shoe-ar', tenant: 'tenant-a', productCode: 'shoe', locale: 'ar', name: 'حذاء للجري', description: 'حذاء خفيف', status: 'READY', revision: 2 }
];

test('schemas preserve one commercial identity and unique tenant-owner-locale variants', () => {
    assert(schemas.productLocalization);
    assert(schemas.categoryLocalization);
    assert(schemas.productVariantLocalization);
    assert.equal(schemas.productLocalization.indexes.composite.tenant.options.unique, true);
    assert.equal(schemas.productLocalization.indexes.composite.productCode.options.unique, true);
    assert.equal(schemas.productLocalization.indexes.composite.locale.options.unique, true);
    assert.equal(schemas.product.definition.catalogVersion.required, true);
    assert.equal(schemas.productVariant.definition.sku.required, true);
});

test('publication completeness requires every configured locale and tenant', () => {
    assert.deepEqual(localization.completeness(request, variants, 'product'), {
        complete: true,
        requiredLocales: ['en', 'ar'],
        readyLocales: ['en', 'ar']
    });
    assert.throws(() => localization.completeness(request, variants.slice(0, 1), 'product'), { code: 'ERR_PRODUCT_L10N_0006' });
    assert.throws(() => localization.validate(request, Object.assign({}, variants[0], { tenant: 'tenant-b' }), 'product'),
        { code: 'ERR_PRODUCT_L10N_0002' });
    let staged = publication.stageLocalized(request, product, variants);
    assert.equal(staged.localization.complete, true);
    assert.equal(staged.status, 'STAGED');
    assert.equal(staged.sourceHash.length, 64);
});

test('search projection is deterministic, locale-specific, and excludes shared commercial data', () => {
    let first = projection.build(request, { product: product, localizations: variants, storeCode: 'uae', locale: 'ar',
        categoryCodes: ['footwear'], variantCodes: ['shoe-red-42'] });
    let second = projection.build(request, { product: product, localizations: variants, storeCode: 'uae', locale: 'ar',
        categoryCodes: ['footwear'], variantCodes: ['shoe-red-42'] });
    assert.equal(first.code, 'shoe|uae|ar');
    assert.equal(first.payload.name, 'حذاء للجري');
    assert.equal(first.sourceHash, second.sourceHash);
    assert.equal(first.payload.sku, undefined);
    assert.equal(first.payload.price, undefined);
    assert.equal(first.payload.inventory, undefined);
});

test('later layers can customize required locales without replacing the service', () => {
    let original = properties.product.localization.requiredLocales;
    properties.product.localization.requiredLocales = ['en'];
    try {
        assert.equal(localization.completeness(request, variants.slice(0, 1), 'product').complete, true);
    } finally {
        properties.product.localization.requiredLocales = original;
    }
});

test('sample release persists bilingual content without duplicating Product, Category, or SKU identity', () => {
    assert.equal(Object.keys(sampleProducts).length, 1);
    assert.equal(Object.keys(sampleCategories).length, 1);
    assert.equal(Object.keys(sampleVariants).length, 1);
    assert.deepEqual(Object.values(sampleProductLocalizations).map(item => item.locale).sort(), ['ar', 'en']);
    assert.deepEqual(Object.values(sampleCategoryLocalizations).map(item => item.locale).sort(), ['ar', 'en']);
    assert.deepEqual(Object.values(sampleVariantLocalizations).map(item => item.locale).sort(), ['ar', 'en']);
    assert.equal(sampleVariants.record0.sku, 'SAMPLE-BLUE-42');
    assert(Object.values(sampleVariantLocalizations).every(item => item.sku === undefined));
    assert.deepEqual(Object.keys(sampleHeader.product), [
        'sampleProductData', 'sampleCategoryData', 'sampleProductVariantData',
        'sampleProductLocalizationData', 'sampleCategoryLocalizationData', 'sampleProductVariantLocalizationData'
    ]);
});
