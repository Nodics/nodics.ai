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
const offer = require('../src/service/defaultCouponOfferService');
const operation = require('../src/service/defaultPromotionOperationService');

test('Promotion internal service authority uses one operational Enterprise across aliases', () => {
    const result = operation.serviceAuthData({ tenant: 'tenant', enterpriseCode: 'merchant',
        authData: { tenant: 'tenant', enterpriseCode: 'participant', entCode: 'participant', principalType: 'customer' } });
    assert.equal(result.enterpriseCode, 'merchant');
    assert.equal(result.entCode, 'merchant');
    assert.equal(result.principalType, 'service');
});

test('distribution behavior passes the canonical export audit without exposing a capability factory', () => {
    const audit = require('../../../../../../nodics.foundation/modules/nTooling/src/service/quality/defaultDesignPrincipleAuditService');
    const failures = [];
    audit.auditServiceExportStyle(failures, [
        'nodics.commerce/modules/baseCommerce/modules/promotion/src/service/defaultPromotionDistributionAdmissionService.js',
    ]);
    assert.deepEqual(failures, []);
    assert.deepEqual(Object.keys(admission).sort(), [
        'fail', 'identifier', 'identityIdentifier', 'participantOwner', 'selected', 'detached', 'assertInstalled', 'resolveReadContext',
        'referenceReadAdmitted', 'assertReadPurpose', 'assertProductPolicy', 'visibleProduct', 'visibleCommerceProduct',
        'dispatchAvailability', 'publicRequest', 'publicAvailabilityBatch', 'publicAvailability', 'trustedAvailability',
        'resolveMembershipRead', 'couponIssuerMemberships', 'trustedPolicies', 'trustedCouponPolicy',
    ].sort());
});

/** Installs canonical owner code and bounded in-memory boundary doubles, not readiness flags for a native deployment. @param {Object} t Test context. @returns {Object} Mutable isolated state. */
function fixture(t) {
    const saved = Object.fromEntries(['SERVICE', 'CONFIG', 'NODICS', 'UTILS', 'CLASSES'].map(key => [key, global[key]]));
    t.after(() => Object.assign(global, saved));
    global.CLASSES = { NodicsError: class extends Error {} };
    const state = { privacy: true, atomic: true, poolCalls: 0, selections: 0, captured: [],
        versions: ['a'.repeat(64)], selected: true,
        config: { promotion: { sellerAuthorization: { enabled: true, qualified: true, maximumSellers: 10 },
            couponOffers: structuredClone(require('../config/properties').promotion.couponOffers),
            couponIssuerMembership: structuredClone(require('../config/properties').promotion.couponIssuerMembership),
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
        DefaultCouponOfferService: offer,
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
            return { available: true, availableQuantity: '4', batchCode: 'private-batch', protectedToken: 'must-not-escape',
                purchaseRequirements: { type: 'REWARDS', priceRef: 'private-price' } };
        } },
    };
    return { state, request: { tenant: 'tenant', storeCode: 'store', locale: 'en', productCode: 'product' } };
}

test('public availability uses fresh activated/retained Product authority, not supplied projection or selectors', async t => {
    const f = fixture(t);
    Object.assign(f.request, { payload: { batchCode: 'forged' }, batchCode: 'forged', indexConfiguration: { indexName: 'forged' },
        projection: { enterpriseCode: 'forged' } });
    const original = structuredClone(f.request);
    assert.deepEqual(await admission.publicAvailability(f.request), { available: true, status: 'IN_STOCK', acquisitionRequirements: { type: 'REWARDS' } });
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
        f => { f.request.authData = { tenant: 'foreign' }; },
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

test('fixed batch preparation expires private identities on success, failure and scope drift', async t => {
    for (const kind of ['success', 'failure', 'command', 'context', 'original']) await t.test(kind, async t => {
        const f = fixture(t), captured = [];
        SERVICE.DefaultPromotionSellerPolicyService.productBindings = async command => {
            const context = admission.resolveReadContext(command);
            assert.ok(context);
            captured.push(command, context);
            assert.equal(admission.resolveReadContext(structuredClone(command)), undefined);
            assert.equal(admission.resolveReadContext({ ...context, distributionAdmitted: true }), undefined);
            assert.throws(() => admission.assertReadPurpose(context, 'MUTATION', 'product'));
            if (kind === 'failure') throw new Error('binding failure');
            if (kind === 'command') command.productCode = 'other';
            if (kind === 'context') context.enterpriseCode = 'other';
            if (kind === 'original') f.request.storeCode = 'other';
            return { context, bindings: [] };
        };
        if (kind === 'success') {
            const result = await admission.publicAvailabilityBatch(f.request, ['product']);
            assert.deepEqual(result.get('product'), { available: true, status: 'IN_STOCK', acquisitionRequirements: { type: 'REWARDS' } });
            assert.equal(f.state.poolCalls, 1);
        } else {
            await assert.rejects(admission.publicAvailabilityBatch(f.request, ['product']));
            assert.equal(f.state.poolCalls, 0);
        }
        for (const request of [...captured, ...f.state.captured])
            assert.equal(admission.resolveReadContext(request), undefined);
        await assert.rejects(admission.dispatchAvailability(captured[0], captured[1]));
    });
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

test('trusted service read preserves signed participant authority while deriving a different seller from Product', async t => {
    const f = fixture(t);
    const original = { ...f.request, enterpriseCode: 'participant', authData: { tenant: 'tenant', entCode: 'participant',
        tokenType: 'access', principalType: 'customer', principalId: 'buyer@example.test' } };
    const derived = { ...f.request, enterpriseCode: 'vendor', quantity: '2', authData: { tenant: 'tenant', enterpriseCode: 'vendor',
        principalType: 'service', loginId: 'cartCalculator', principalId: 'buyer@example.test' } };
    const before = structuredClone({ original, derived });
    f.state.duringPool = (command, context) => {
        assert.deepEqual(command.authData, derived.authData);
        assert.deepEqual(context.authData, original.authData);
        assert.equal(context.enterpriseCode, 'vendor');
        assert.equal(command.quantity, '2');
    };
    assert.equal((await admission.trustedAvailability(original, derived)).available, true);
    assert.deepEqual({ original, derived }, before);
    assert.equal(admission.resolveReadContext(f.state.captured[0]), undefined);
    await assert.rejects(admission.trustedAvailability(derived, derived));
    await assert.rejects(admission.trustedAvailability(original, { ...derived, enterpriseCode: 'foreign',
        authData: { ...derived.authData, enterpriseCode: 'foreign' } }));
    await assert.rejects(admission.trustedAvailability(original, { ...derived, storeCode: 'other' }));
    await assert.rejects(admission.trustedAvailability({ ...original, authData: {} }, { ...derived, originalAuthority: original }));
});

test('trusted Cart policy quote reads exact Product policy without changing participant or seller identities', async t => {
    const f = fixture(t), campaign = { tenant: 'tenant', enterpriseCode: 'issuer', code: 'campaign', status: 'ACTIVE',
        conditions: { sourceProductCode: 'product' }, actions: { discountAmount: '1' } };
    const ownerRef = { module: 'profile', schema: 'customer', code: 'buyer@example.test' };
    const original = { tenant: 'tenant', enterpriseCode: 'participant', storeCode: 'store', locale: 'en', ownerId: 'buyer@example.test', ownerRef,
        authData: { tenant: 'tenant', entCode: 'participant', tokenType: 'access', principalType: 'customer', principalId: 'buyer@example.test' } };
    const downstream = { tenant: 'tenant', enterpriseCode: 'vendor', storeCode: 'store', locale: 'en', ownerId: 'buyer@example.test', ownerRef,
        productCodes: ['product'], authData: { tenant: 'tenant', enterpriseCode: 'vendor', principalType: 'service', loginId: 'cartCalculation' } };
    const before = structuredClone({ original, downstream });
    SERVICE.DefaultPromotionSellerPolicyService.readProduct = async (command, productCode) => {
        assert.equal(productCode, 'product'); assert.equal(command.authData.principalType, 'service');
        assert.equal(admission.resolveReadContext(command).authData.principalId, 'buyer@example.test');
        return { campaign: structuredClone(campaign) };
    };
    SERVICE.DefaultPromotionPublicationService.readOwnProductPolicy = () => assert.fail('Delegated policy must remain canonical');
    assert.deepEqual(await admission.trustedPolicies(original, downstream), [campaign]);
    const alternateOwnerRef = { ...ownerRef, code: 'buyer' };
    assert.deepEqual(await admission.trustedPolicies({ ...original, ownerId: 'buyer', ownerRef: alternateOwnerRef },
        { ...downstream, ownerId: 'buyer', ownerRef: alternateOwnerRef }), [campaign]);
    assert.deepEqual({ original, downstream }, before);
    await assert.rejects(admission.trustedPolicies(original, { ...downstream, enterpriseCode: 'foreign' }));
    await assert.rejects(admission.trustedPolicies(original, { ...downstream, ownerId: 'other' }));
    await assert.rejects(admission.trustedPolicies({ ...original, ownerId: 'other' }, downstream));
});

test('trusted Cart policy quote treats an authorized Product with no policy as no discount', async t => {
    const f = fixture(t), ownerRef = { module: 'profile', schema: 'customer', code: 'buyer' };
    const original = { tenant: 'tenant', enterpriseCode: 'participant', storeCode: 'store', locale: 'en', ownerId: 'buyer', ownerRef,
        authData: { tenant: 'tenant', entCode: 'participant', tokenType: 'access', principalType: 'customer', principalId: 'buyer' } };
    const downstream = { tenant: 'tenant', enterpriseCode: 'vendor', storeCode: 'store', locale: 'en', ownerId: 'buyer', ownerRef,
        productCodes: ['product'], authData: { tenant: 'tenant', enterpriseCode: 'vendor', principalType: 'service', loginId: 'cartCalculation' } };
    let ownReads = 0;
    SERVICE.DefaultPromotionSellerPolicyService.readProduct = async command => {
        assert.equal(admission.resolveReadContext(command).authData.principalId, 'buyer');
        return undefined;
    };
    SERVICE.DefaultPromotionPublicationService.readOwnProductPolicy = command => {
        ownReads++;
        assert.equal(admission.resolveMembershipRead(command).projection.productCode, 'product');
        return undefined;
    };
    assert.deepEqual(await admission.trustedPolicies(original, downstream), []);
    assert.equal(ownReads, 1);
});

test('trusted checkout coupon read admits only the exact protected unit purpose', async t => {
    const f = fixture(t), coupon = { code: 'unit', batchCode: 'batch', promotionCode: 'campaign' };
    const campaign = { tenant: 'tenant', enterpriseCode: 'issuer', code: 'campaign', status: 'ACTIVE',
        conditions: { sourceProductCode: 'product' } };
    const ownerRef = { module: 'profile', schema: 'customer', code: 'buyer' };
    const original = { tenant: 'tenant', enterpriseCode: 'participant', storeCode: 'store', locale: 'en', ownerId: 'buyer', ownerRef,
        authData: { tenant: 'tenant', enterpriseCode: 'participant', tokenType: 'access', principalType: 'customer', principalId: 'buyer@example.test' } };
    const downstream = { tenant: 'tenant', enterpriseCode: 'vendor', storeCode: 'store', locale: 'en', ownerId: 'buyer', ownerRef, productCode: 'product',
        authData: { tenant: 'tenant', enterpriseCode: 'vendor', principalType: 'service', loginId: 'checkout' } };
    SERVICE.DefaultPromotionSellerPolicyService.readCoupon = async (command, observed) => {
        assert.deepEqual(observed, coupon);
        admission.assertReadPurpose(command, 'COUPON');
        assert.throws(() => admission.assertReadPurpose(command, 'PRODUCT', 'product'));
        return { campaign: structuredClone(campaign) };
    };
    SERVICE.DefaultPromotionPublicationService.readOwnProductPolicy = () => assert.fail('Delegated coupon remains issuer-owned');
    assert.deepEqual(await admission.trustedCouponPolicy(original, downstream, coupon), campaign);
    await assert.rejects(admission.trustedCouponPolicy(original, downstream, { ...coupon, batchCode: 'bad batch' }));
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

test('canonical coupon requirements reach public Product cards and marketplace list/detail without copied attributes or private evidence', async t => {
    const operation = require('../src/service/defaultPromotionOperationService');
    const allocation = require('../src/service/defaultCouponOfferAllocationService');
    const persistence = require('../src/service/defaultCouponAcquisitionPersistenceService');
    const marketplace = require('../../../../../../nodics.accelerators/modules/waste/modules/eWaste/src/service/defaultEWasteMarketplaceService');
    for (const type of ['REWARDS', 'CERTIFICATES', 'BOTH']) await t.test(type, async t => {
        const f = fixture(t);
        const certificates = { quantity: 2, categoryCode: 'electronics', milestoneCode: 'verified', brandCodes: ['brand'], modelCodes: ['model'] };
        const requirements = { type, ...(type !== 'CERTIFICATES' ? { priceRef: 'private-price' } : {}),
            ...(type !== 'REWARDS' ? { certificates } : {}) };
        const safe = { type, ...(type !== 'REWARDS' ? { certificates } : {}) };
        const campaign = { tenant: 'tenant', code: 'private-campaign', status: 'ACTIVE', conditions: { sourceProductCode: 'product' },
            couponOffer: { version: 1, supply: { mode: 'UNLIMITED' }, expiry: { mode: 'NONE' }, terms: [], requirements } };
        SERVICE.DefaultPromotionOperationService = { ...operation, requireOperationalRuntime() {} };
        SERVICE.DefaultCouponOfferAllocationService = allocation;
        SERVICE.DefaultCouponAcquisitionPersistenceService = persistence;
        SERVICE.DefaultCouponOfferSupplyService = { get: async r => {
            persistence.providerRead(r, { moduleName: 'promotion', schemaName: 'couponOfferSupply' });
            return { code: 'SUC_GET', result: [], count: 0 };
        }, save: () => assert.fail('Read only'), update: () => assert.fail('Read only') };
        SERVICE.DefaultPromotionSellerPolicyService = {
            readRoot: () => assert.fail('No root enumeration'), readCoupon: () => assert.fail('No secret read'),
            productBindings: async r => ({ context: admission.resolveReadContext(r), bindings: [] }),
            readProduct: async r => {
                admission.assertReadPurpose(r, 'PRODUCT', 'product');
                admission.assertProductPolicy(admission.resolveReadContext(r), campaign);
                return { campaign: structuredClone(campaign) };
            },
        };
        SERVICE.DefaultDigitalCommerceCheckoutService = { availabilityFromProjection: () => assert.fail('Use admitted public batch') };
        const expected = { available: true, status: 'IN_STOCK', acquisitionRequirements: safe };
        assert.deepEqual(await admission.publicAvailability(f.request), expected);
        const rows = await enrichment.consumerAvailability({ ...f.request, enterpriseCode: 'vendor' }, [f.state.row]);
        assert.deepEqual(rows.product, expected);
        const product = discovery.card({ ...f.state.row, payload: { ...f.state.row.payload, availability: rows.product,
            price: { currency: 'POINTS', unitAmount: type === 'CERTIFICATES' ? '0' : '5' },
            localizedAttributes: { ...f.state.row.payload.localizedAttributes, kind: 'COUPON', acquisitionRequirements: { type: 'FORGED' } } } });
        const settings = { ...require('../../../../../../nodics.accelerators/modules/waste/modules/eWaste/config/properties').eWaste.marketplace,
            storeCode: 'store', currency: 'POINTS', jurisdiction: 'AE', programCode: 'program', rewardTypeCode: 'points' };
        const service = { ...marketplace, experience: () => ({ settings: () => ({ marketplace: settings }) }) };
        assert.equal(product.localizedAttributes.acquisitionRequirements, undefined);
        for (const dto of [await service.offer({}, product), await service.marketplaceOffer({}, product)]) {
            assert.deepEqual(dto.acquisitionRequirements, safe); assert.equal(dto.available, true);
            assert.equal(dto.rewardPrice, type === 'CERTIFICATES' ? '0' : '5');
            assert.doesNotMatch(JSON.stringify(dto), /private-price|private-campaign|FORGED|supplyMode|availableQuantity/);
        }
        rows.product.acquisitionRequirements.type = 'FORGED';
        assert.deepEqual(product.availability, expected, 'Public card detaches owner data');
    });
});

test('public requirements reject unsupported policy and preserve explicit unknown without rewards fallback', t => {
    const f = fixture(t), unavailable = { available: false, status: 'OUT_OF_STOCK', acquisitionRequirements: null };
    for (const purchaseRequirements of [undefined, null]) assert.deepEqual(offer.publicSupply({ available: true, purchaseRequirements }), unavailable);
    for (const purchaseRequirements of [{}, { type: 'UNKNOWN' }, { type: 'REWARDS' },
        { type: 'CERTIFICATES', certificates: { quantity: 0, categoryCode: 'x', milestoneCode: 'y' } }])
        assert.throws(() => offer.publicSupply({ available: true, purchaseRequirements }));
    const requirements = { type: 'CERTIFICATES', certificates: { quantity: 2, categoryCode: 'x', milestoneCode: 'y' } };
    assert.deepEqual(offer.publicSupply({ available: false, purchaseRequirements: requirements }), { ...unavailable, acquisitionRequirements: requirements });
    f.state.config.promotion.couponOffers.maximumCertificates = 1;
    assert.throws(() => offer.publicSupply({ available: true, purchaseRequirements: requirements }));
    delete f.state.config.promotion.couponOffers;
    assert.throws(() => offer.acquisitionRequirements({ type: 'REWARDS' }));
});
