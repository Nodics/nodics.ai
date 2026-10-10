/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module promotion/test/promotionDistributionAdmissionContract @description Exercises real installed-source guards and governed Product authority with isolated generated persistence ports; never establishes live native qualification. @layer test @owner promotion */
const test = require('node:test'), assert = require('node:assert/strict');
const admission = require('../src/service/defaultPromotionDistributionAdmissionService');
const seller = require('../src/service/defaultCouponSellerAuthorizationService');
const secure = require('../src/service/defaultCouponSecureIssuanceService');
const schemas = require('../src/schemas/schemas').promotion;
const interceptors = require('../src/interceptors/interceptors');
const discovery = require('../../product/src/service/defaultProductDiscoveryService');
const enrichment = require('../../product/src/service/defaultProductSearchEnrichmentService');

/** Installs canonical owner code and bounded in-memory boundary doubles, not readiness flags for a native deployment. @param {Object} t Test context. @returns {Object} Mutable isolated state. */
function fixture(t) {
    const saved = Object.fromEntries(['SERVICE', 'CONFIG', 'NODICS', 'UTILS', 'CLASSES'].map(key => [key, global[key]]));
    t.after(() => Object.assign(global, saved));
    global.CLASSES = { NodicsError: class extends Error {} };
    const state = { privacy: true, atomic: true, poolCalls: 0, selections: 0, captured: [],
        versions: ['a'.repeat(64)], selected: true,
        config: { promotion: { sellerAuthorization: { enabled: true, qualified: true, maximumSellers: 10 },
            publication: { delivery: { enabled: true } } },
            databaseTransactions: { enabled: true, failClosed: true, maximumCommitTimeMs: 1000 },
            product: { discovery: { activationService: 'ActiveReader' } } },
        row: { code: 'projection', tenant: 'tenant', enterpriseCode: 'vendor', storeCode: 'store', locale: 'en',
            productCode: 'product', status: 'STALE', publicationVersion: 'a'.repeat(64), sourceHash: 'b'.repeat(64),
            payload: { variantCodes: ['variant'], variantSkuMap: { variant: 'SKU' }, localizedAttributes: {
                productType: 'DIGITAL', digitalDeliveryType: 'COUPON_CODE', inventoryStrategy: 'COUPON_CODE_POOL' } } },
        indexes: {}, hooks: {}, models: {} };
    for (const name of ['promotion', 'coupon', 'couponBatch']) {
        state.models[name] = { primaryKey: 'code', versioned: false, compareAndSetItem() {},
            guardProtectedRead() {}, projectReadResult() {}, rawSchema: structuredClone(schemas[name]) };
        state.indexes[name] = { versioned: false, indexes: [{ unique: true, key: { code: 1 } },
            ...(name === 'coupon' ? [{ unique: true, key: { tenant: 1, tokenHash: 1 } }] : [])] };
        state.hooks[name] = Object.groupBy(Object.values(interceptors).filter(item => item.item === name), item => item.trigger);
    }
    global.CONFIG = { get: key => state.config[key] };
    global.NODICS = { getModels: () => state.models };
    global.UTILS = { createModelName: name => name };
    global.SERVICE = {
        DefaultPromotionDistributionAdmissionService: admission,
        DefaultCouponSellerAuthorizationService: seller,
        DefaultCouponSecureIssuanceService: secure,
        DefaultPromotionSellerPolicyService: { readProduct() {} },
        DefaultPromotionPublicationService: { deliveryEnabled: () => state.selected },
        DefaultLoggerService: { isRequestPrivacyQualified: () => state.privacy,
            hasPrivateCaptureProtection: () => false, runSensitiveOperation: (_r, action) => action() },
        DefaultDatabaseTransactionService: { capabilities: () => ({ multiRecordAtomic: state.atomic }) },
        DefaultDatabaseConfigurationService: { getSchemaInterceptors: name => state.hooks[name] },
        DefaultDatabaseModelHandlerService: { inspectIndexes: async model => state.indexes[
            Object.entries(state.models).find(([, value]) => value === model)[0]] },
        DefaultModelConcurrencyService: { getField: () => undefined },
        DefaultPromotionService: { get() {}, update() {} },
        ActiveReader: { activeVersions: async () => { state.selections++; return state.versions; } },
        DefaultProductDiscoveryService: { ...discovery, publicationSelections: new WeakMap(), searchSelected: async (_r, query) => {
            assert.equal(query.productCode, 'product'); assert.equal(query.status, 'STALE');
            return [{ ...structuredClone(state.row), payload: {} }];
        } },
        DefaultProductSearchEnrichmentService: enrichment,
        DefaultProductSearchProjectionService: { get: async () => ({ code: 'SUC_READ', result: [structuredClone(state.row)] }) },
        DefaultPromotionOperationService: { requireOperationalRuntime() {}, couponPoolAvailability: async command => {
            state.poolCalls++; state.captured.push(command);
            const context = admission.resolveReadContext(command);
            assert.ok(context); state.captured.push(context);
            admission.assertReadPurpose(command, 'PRODUCT', command.productCode);
            admission.assertProductPolicy(context, { conditions: { sourceProductCode: command.productCode } });
            if (state.duringPool) await state.duringPool(command, context);
            return { available: true, availableQuantity: '4', batchCode: 'private-batch', protectedToken: 'must-not-escape' };
        } },
    };
    return { state, request: { tenant: 'tenant', storeCode: 'store', locale: 'en', productCode: 'product' } };
}

test('public availability uses fresh activated/retained Product authority, not supplied projection or selectors', async t => {
    const f = fixture(t);
    Object.assign(f.request, { payload: { batchCode: 'forged' }, batchCode: 'forged', indexConfiguration: { indexName: 'forged' },
        projection: { enterpriseCode: 'forged' } });
    const original = structuredClone(f.request);
    assert.deepEqual(await admission.publicAvailability(f.request), { available: true, status: 'IN_STOCK' });
    assert.deepEqual(f.request, original);
    assert.equal(f.state.selections, 2, 'A new owner context rechecks the activation after supply work');
    assert.equal(f.state.poolCalls, 1);
    assert.deepEqual(f.state.captured[0].authData, {}, 'Catalogue scope never becomes signed authentication');
    assert.equal(admission.resolveReadContext(f.state.captured[0]), undefined);
    assert.equal(admission.resolveReadContext(f.state.captured[1]), undefined);
});

test('copied identities, arbitrary dispatch and non-Product operations do not receive private authority', async t => {
    const f = fixture(t);
    f.state.duringPool = (command, context) => {
        assert.equal(admission.resolveReadContext(structuredClone(command)), undefined);
        assert.equal(admission.resolveReadContext({ ...context, distributionAdmitted: true }), undefined);
        for (const purpose of ['ROOT', 'COUPON', 'BUDGET', 'MUTATION'])
            assert.throws(() => admission.assertReadPurpose(context, purpose, 'product'));
        assert.throws(() => admission.assertReadPurpose(context, 'PRODUCT', 'other'));
        assert.throws(() => admission.assertProductPolicy(context, { conditions: { sourceProductCode: 'other' } }));
    };
    await admission.publicAvailability(f.request);
    await assert.rejects(admission.dispatchAvailability({ ...f.request, authData: {} }, { tenant: 'tenant', enterpriseCode: 'vendor' }));
});

test('private identity mutation and owner integration absence fail closed and expire admission after errors', async t => {
    for (const kind of ['request', 'context', 'hook', 'failure', 'result']) {
        const f = fixture(t);
        if (kind === 'request') f.state.duringPool = command => { command.authData.entCode = 'forged'; };
        if (kind === 'context') f.state.duringPool = (_command, context) => { context.enterpriseCode = 'forged'; };
        if (kind === 'failure') f.state.duringPool = () => { throw new Error('isolated failure'); };
        if (kind === 'hook') SERVICE.DefaultPromotionOperationService.couponPoolAvailability = async () => ({ available: true });
        if (kind === 'result') SERVICE.DefaultPromotionOperationService.couponPoolAvailability = async command => {
            admission.resolveReadContext(command); return { available: true, errors: ['failed'] };
        };
        await assert.rejects(admission.publicAvailability(f.request));
        for (const captured of f.state.captured) assert.equal(admission.resolveReadContext(captured), undefined);
    }
});

test('public scope, classification, activation and post-read drift cannot widen catalogue visibility', async t => {
    const mutations = [
        f => { f.state.versions = []; },
        f => { f.state.versions = ['c'.repeat(64)]; },
        f => { f.state.row.status = 'CURRENT'; },
        f => { f.state.row.tenant = 'foreign'; },
        f => { f.state.row.sourceHash = 'forged'; },
        f => { f.state.row.payload.variantSkuMap = {}; },
        f => { f.state.row.payload.localizedAttributes.digitalDeliveryType = 'DIGITAL_OWNERSHIP'; },
        f => { f.request.enterpriseCode = 'foreign'; },
        f => { f.request.authData = { enterpriseCode: 'foreign' }; },
        f => { f.request.authData = { principalType: 'service' }; },
        f => { f.request.quantity = '2'; },
        f => { f.state.duringPool = () => { f.state.row.sourceHash = 'c'.repeat(64); }; },
        f => { f.state.duringPool = () => { f.state.versions = []; }; },
    ];
    for (const mutate of mutations) {
        const f = fixture(t); mutate(f);
        await assert.rejects(admission.publicAvailability(f.request));
    }
});

test('installed readiness checks actual consent and encrypted aggregate protections, never flags alone', async t => {
    const mutations = [
        f => { f.state.privacy = false; },
        f => { f.state.atomic = false; },
        f => { f.state.config.databaseTransactions.failClosed = false; },
        f => { f.state.models.promotion.compareAndSetItem = undefined; },
        f => { f.state.models.promotion.versioned = true; },
        f => { f.state.models.promotion.rawSchema.definition.sellerAuthorizations = {}; },
        f => { f.state.models.promotion.rawSchema.cache.enabled = true; },
        f => { f.state.models.promotion.rawSchema.transaction.sideEffects = 'permitted'; },
        f => { f.state.hooks.promotion.preSave = []; },
        f => { f.state.hooks.promotion.preUpdate = []; },
        f => { f.state.hooks.promotion.preRemove = []; },
        f => { f.state.hooks.coupon.preUpdate = f.state.hooks.coupon.preUpdate.filter(item => !/protectCoupon$/.test(item.handler)); },
        f => { f.state.indexes.promotion.indexes[0].sparse = true; },
        f => { f.state.indexes.promotion.indexes[0].partialFilterExpression = { active: true }; },
        f => { f.state.indexes.promotion.indexes[0].collation = { locale: 'en' }; },
        f => { f.state.models.coupon.rawSchema.readProtection.owner = 'ForgedOwner'; },
        f => { f.state.models.couponBatch.projectReadResult = undefined; },
        f => { f.state.hooks.couponBatch.preRemove = []; },
        f => { f.state.indexes.coupon.indexes.pop(); },
    ];
    const good = fixture(t);
    assert.equal(await admission.assertInstalled(good.request), true);
    for (const mutate of mutations) {
        const f = fixture(t); mutate(f);
        await assert.rejects(admission.assertInstalled({ ...f.request, qualified: true, persistenceQualified: true }));
        assert.equal(f.state.poolCalls, 0);
    }
});

test('trusted service read preserves signed source authority without rewriting either caller', async t => {
    const f = fixture(t);
    const original = { ...f.request, enterpriseCode: 'vendor', authData: { tenant: 'tenant', entCode: 'vendor',
        tokenType: 'access', principalType: 'customer', principalId: 'buyer@example.test' } };
    const derived = { ...f.request, enterpriseCode: 'vendor', quantity: '2', authData: { tenant: 'tenant', enterpriseCode: 'vendor',
        principalType: 'service', loginId: 'cartCalculator', principalId: 'buyer@example.test' } };
    const before = structuredClone({ original, derived });
    f.state.duringPool = (command, context) => {
        assert.deepEqual(command.authData, derived.authData);
        assert.deepEqual(context.authData, original.authData);
        assert.equal(command.quantity, '2');
    };
    assert.equal((await admission.trustedAvailability(original, derived)).available, true);
    assert.deepEqual({ original, derived }, before);
    assert.equal(admission.resolveReadContext(f.state.captured[0]), undefined);
    await assert.rejects(admission.trustedAvailability(derived, derived));
    await assert.rejects(admission.trustedAvailability(original, { ...derived, enterpriseCode: 'foreign' }));
    await assert.rejects(admission.trustedAvailability(original, { ...derived, storeCode: 'other' }));
    await assert.rejects(admission.trustedAvailability({ ...original, authData: {} }, { ...derived, originalAuthority: original }));
});

test('defaults stay inert and a later-layer narrowing override is used through the effective owner', async t => {
    const f = fixture(t);
    f.state.selected = false;
    assert.equal(await admission.publicAvailability(f.request), undefined);
    assert.equal(f.state.poolCalls, 0);
    f.state.selected = true;
    let calls = 0;
    const narrowed = { ...admission, visibleProduct: async function (r) {
        calls++; const row = await admission.visibleProduct.call(this, r); this.fail(); return row;
    } };
    await assert.rejects(narrowed.publicAvailability(f.request));
    assert.equal(calls, 1);
    assert.equal(f.state.poolCalls, 0);
});
