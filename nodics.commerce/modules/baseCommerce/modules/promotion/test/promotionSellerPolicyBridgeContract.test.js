/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const fixture = require('./helpers/secureIssuanceFixture');
const secure = require('../src/service/defaultCouponSecureIssuanceService');
const seller = require('../src/service/defaultCouponSellerAuthorizationService');
const bridge = require('../src/service/defaultPromotionSellerPolicyService');
const publication = require('../src/service/defaultPromotionPublicationService');
const setup = require('../src/service/defaultPromotionSetupContributionService');
const admission = require('../src/service/defaultPromotionBudgetAdmissionService');
const operation = require('../src/service/defaultPromotionOperationService');
const distribution = require('../src/service/defaultPromotionDistributionAdmissionService');
const productDiscovery = require('../../product/src/service/defaultProductDiscoveryService');
const productEnrichment = require('../../product/src/service/defaultProductSearchEnrichmentService');
const digitalCheckout = require('../../../../digitalCommerce/modules/digitalCore/src/service/defaultDigitalCommerceCheckoutService');
const cartPorts = require('../../../../checkout/modules/cart/src/service/defaultCommerceCalculationPortsService');

/** @module promotion/test/promotionSellerPolicyBridgeContract @description Exercises actual issued receipt, issuer consent and canonical activated-policy readers with isolated generated persistence/Profile ports. Not installed or customer acceptance. @layer test @owner promotion */

/** Builds real encrypted owner stock and consent, then installs isolated exact issuer publication records for the real reader. @param {Object} t Test context. @returns {Promise<Object>} Fixture and bounded read-only owner observations. */
async function prepared(t) {
    const f = fixture.create(t);
    f.policy.vendorEnterpriseRef = { ...f.policy.vendorEnterpriseRef, code: 'sellerB' };
    f.policy.conditions = { sourceProductCode: 'offerA' };
    f.campaign.rootCode = f.policy.code;
    f.settings.promotion.publication.delivery.rootCodesByStore.storeA = [f.policy.code];
    f.campaign.policyFingerprint = publication.fingerprint(f.policy);
    f.settings.promotion.sellerAuthorization = { enabled: true, qualified: true, maximumSellers: 10 };
    f.request.authorization = 'Bearer isolated-test-context';
    SERVICE.DefaultSecuredRequestPipelineService = { getGrantedPermissions: () => ['commerce.promotion.manage', 'commerce.coupon.seller.manage'],
        isPermissionGranted: (permission, granted) => granted.includes(permission) };
    SERVICE.DefaultModuleService = { invokeModule: async request => {
        if (f.state.onProfile) await f.state.onProfile(request);
        if (request.apiName === '/identity/scopes/me') return { principalCode: 'operatorA', deniedScopes: [],
            scopes: [{ tenantCode: f.request.tenant, scopeType: 'ENTERPRISE', scopeCode: 'issuerA' }] };
        assert.equal(request.apiName, '/references/read');
        assert.equal(request.methodName, 'POST');
        const code = request.requestBody?.codes?.[0];
        assert.ok(['issuerA', 'sellerB'].includes(code));
        assert.deepEqual(request.requestBody, { type: 'enterprise', codes: [code] });
        assert.equal(request.tenant, f.request.tenant);
        assert.deepEqual(request.request, { tenant: f.request.tenant });
        assert.equal(request.header, undefined);
        return [{ code, active: code !== f.state.inactive }];
    } };
    const update = SERVICE.DefaultPromotionService.update;
    SERVICE.DefaultPromotionService.update = async command => {
        SERVICE.DefaultPromotionBudgetAdmissionService.protect(command); await seller.protect(command); return update(command);
    };
    await SERVICE.DefaultPromotionBudgetAdmissionService.initialize(setup.campaignRequest(f.request, f.campaign));
    let sequence = 0;
    f.review = action => seller.manage({ ...f.request, promotionCode: f.policy.code, payload: {
        action, sellerEnterpriseCode: 'sellerB', expectedRevision: f.rows.promotion[0].revision,
        commandReference: 'owner-review-' + (++sequence),
        ...(action === 'GRANT' ? { expiresAt: '2099-01-01T00:00:00.000Z' } : {}),
    } });
    await f.review('GRANT');
    await secure.issue(f.request, f.intent, f.campaign);
    f.rows.promotion[0].budget.spent = '17'; f.rows.promotion[0].revision++;
    const owner = { tenant: f.request.tenant, enterpriseCode: 'issuerA' };
    const payload = { ...owner, rootType: 'promotion', rootCode: f.policy.code,
        records: [{ schema: 'promotion', policy: structuredClone(f.policy) }] };
    const code = publication.fingerprint(payload), root = { rootType: 'promotion', rootCode: f.policy.code };
    const pointerCode = publication.pointerCode(root, owner), operationKey = 'original-activation';
    const receiptCode = publication.fingerprint({ ...owner, pointerCode, operationKey });
    f.retained = {
        release: { ...owner, code, rootType: root.rootType, rootCode: root.rootCode, fingerprint: code, payload },
        pointer: { ...owner, code: pointerCode, rootType: root.rootType, rootCode: root.rootCode, revision: 1, version: code, receiptCode },
        receipt: { ...owner, code: receiptCode, pointerCode, operationKey, targetVersion: code, sourceVersion: code,
            expectedRevision: 0, fingerprint: code, applied: true, publicationCode: 'publicationA' },
    };
    f.reads = []; f.state.systemReads = 0;
    SERVICE.DefaultIdentityGovernanceService = { getSystemAuthData: () => {
        f.state.systemReads++; return { isSystem: true, userGroups: ['serviceAccountUserGroup'], permissions: [] };
    } };
    for (const [kind, name] of [['release', 'DefaultPromotionPolicyReleaseService'],
        ['pointer', 'DefaultPromotionPolicyPointerService'], ['receipt', 'DefaultPromotionPolicyReceiptService']])
        SERVICE[name] = { save: async () => { throw new Error('unexpected publication write'); },
            update: async () => { throw new Error('unexpected publication write'); }, get: async request => {
                f.reads.push(structuredClone({ kind, request }));
                assert.equal(request.authData.isSystem, true);
                assert.equal(request.authData.enterpriseCode, undefined);
                assert.equal(request.options.skipItemCache, true);
                if (f.state.onRead) await f.state.onRead(kind, request);
                const row = f.retained[kind];
                return { code: 'SUC_TEST', result: row && Object.entries(request.query).every(([key, value]) => row[key] === value)
                    ? [structuredClone(row)] : [] };
            } };
    SERVICE.DefaultPromotionPublicationService = publication;
    SERVICE.DefaultPromotionSellerPolicyService = bridge;
    // The isolated generated port supports exact disjunctions used only for candidate narrowing.
    const get = SERVICE.DefaultPromotionService.get;
    SERVICE.DefaultPromotionService.get = async request => {
        if (!request.query?.$or) return get(request);
        const { $or, ...query } = request.query;
        const response = await get({ ...request, query });
        return { ...response, result: response.result.filter(row => $or.some(branch => f.matches(row, branch))) };
    };
    f.customer = { tenant: f.request.tenant, enterpriseCode: 'sellerB', storeCode: 'storeA',
        authData: { tenant: f.request.tenant, enterpriseCode: 'sellerB', tokenType: 'access', principalType: 'customer', principalId: 'buyerA' } };
    return f;
}

/** Installs actual owner orchestration with isolated index/retained-storage ports that enforce every selector. @param {Object} f Issued-stock fixture. @returns {Object} Public request and retained Product. */
function distributionOwners(f) {
    f.settings.product = { discovery: { activationService: 'FixtureProductActivation', projectionStoreFallback: false },
        publication: { searchEnrichment: { pricing: { enabled: false } } } };
    f.settings.digitalCore = { maximumCouponUnitsPerCheckout: 20 };
    const row = { code: 'offer-projection', tenant: 'tenantA', enterpriseCode: 'sellerB', storeCode: 'storeA', locale: 'en',
        productCode: 'offerA', status: 'STALE', publicationVersion: 'b'.repeat(64), sourceHash: 'c'.repeat(64),
        payload: { variantCodes: ['variantA'], variantSkuMap: { variantA: 'SKU-A' }, localizedAttributes: {
            productType: 'DIGITAL', digitalDeliveryType: 'COUPON_CODE', inventoryStrategy: 'COUPON_CODE_POOL' } } };
    const state = { versions: [row.publicationVersion], selections: 0, reads: 0, ownerRequests: [], contexts: [] };
    const matches = (item, query) => Object.entries(query).every(([key, value]) =>
        Array.isArray(value) ? value.includes(item[key]) :
            value && typeof value === 'object' && Array.isArray(value.$in) ? value.$in.includes(item[key]) : item[key] === value);
    Object.assign(SERVICE, {
        DefaultPromotionDistributionAdmissionService: distribution,
        DefaultProductDiscoveryService: { ...productDiscovery, publicationSelections: new WeakMap() },
        DefaultProductSearchEnrichmentService: productEnrichment,
        FixtureProductActivation: { activeVersions: async () => { state.selections++; return [...state.versions]; } },
        DefaultProductSearchProjectionService: {
            doSearch: async request => ({ code: 'SUC_TEST', result: matches(row, request.query) ? [structuredClone(row)] : [] }),
            get: async request => {
                state.reads++;
                assert.equal(request.options.skipItemCache, true);
                return { code: 'SUC_TEST', result: matches(row, request.query) ? [structuredClone(row)] : [] };
            },
        },
        DefaultDigitalCommerceCheckoutService: digitalCheckout,
        DefaultPromotionSellerPolicyService: { ...bridge, readProduct: async function (request, code) {
            state.ownerRequests.push(request);
            // Observe the real context owner; never resolve the private admission in a test dispatch stub.
            const result = await bridge.readProduct.call(this, request, code);
            if (state.afterProduct) await state.afterProduct(request, result);
            return result;
        } },
    });
    return { row, state, request: { tenant: 'tenantA', storeCode: 'storeA', locale: 'en', productCode: 'offerA' } };
}

/** Issues additional isolated stock through the actual issuer review and encrypted issuance owners, without publishing unrelated roots. @param {Object} f Fixture. @param {number} index Unique suffix. @returns {Promise<void>} Retained owner stock. */
async function addProductStock(f, index) {
    const policy = { ...structuredClone(f.policy), code: 'campaign' + index, conditions: { sourceProductCode: 'offer' + index } };
    const campaign = { ...f.campaign, promotionCode: policy.code, rootCode: policy.code,
        commandReference: 'admission' + index, policyFingerprint: publication.fingerprint(policy) };
    const intent = { ...f.intent, promotionCode: policy.code, batchCode: 'batch' + index, commandReference: 'issuance' + index };
    f.settings.promotion.publication.delivery.rootCodesByStore.storeA.push(policy.code);
    f.payload.campaigns.push(campaign); f.payload.couponBatches.push(intent);
    const previous = SERVICE.DefaultPromotionPublicationService;
    SERVICE.DefaultPromotionPublicationService = { ...publication, readActivated: async () => [{ schema: 'promotion', policy }] };
    try {
        await admission.initialize(setup.campaignRequest(f.request, campaign));
        await seller.manage({ ...f.request, promotionCode: policy.code, payload: { action: 'GRANT', sellerEnterpriseCode: 'sellerB',
            expectedRevision: f.rows.promotion.find(row => row.code === policy.code).revision,
            commandReference: 'owner-review-' + index, expiresAt: '2099-01-01T00:00:00.000Z' } });
        await secure.issue(f.request, intent, campaign);
    } finally { SERVICE.DefaultPromotionPublicationService = previous; }
}

test('exact issuer receipt and live grant read issuer policy/consumption without changing signed seller or any state', async t => {
    const f = await prepared(t), original = structuredClone(f.rows), caller = structuredClone(f.customer), writes = f.state.writes;
    const policies = await bridge.readRoot(f.customer, f.policy.code);
    assert.equal(policies.length, 1); assert.equal(policies[0].enterpriseCode, 'issuerA');
    assert.deepEqual(policies[0].budget, { limit: '100', spent: '17' });
    assert.equal(Object.hasOwn(policies[0], 'sellerAuthorizations'), false);
    assert.deepEqual(await bridge.readBudget(f.customer, policies[0]), { tenant: f.request.tenant, enterpriseCode: 'issuerA',
        promotionCode: f.policy.code, revision: f.rows.promotion[0].revision, budget: { limit: '100', spent: '17' } });
    assert.ok(f.reads.length > 0);
    assert.equal(f.reads.every(read => read.request.query.enterpriseCode === 'issuerA'), true);
    assert.deepEqual(f.customer, caller); assert.equal(f.state.writes, writes); assert.deepEqual(f.rows, original);
    assert.ok(!/secureIssuance|actorId|sellerAuthorizations|protectedToken|admissionContribution/.test(JSON.stringify(policies)));
    await assert.rejects(bridge.readBudget(f.customer, structuredClone(policies[0])));
});

test('coupon and Product helpers resolve only owner stock and exact approved source Product', async t => {
    const f = await prepared(t);
    const selected = await bridge.readProduct(f.customer, 'offerA');
    assert.equal(selected.batchCode, f.intent.batchCode); assert.equal(selected.campaign.code, f.policy.code);
    assert.equal(await bridge.readProduct(f.customer, 'otherProduct'), undefined);
    await assert.rejects(bridge.readProduct({ ...f.customer, productCode: 'differentProduct' }, 'offerA'));
    const result = await bridge.readCoupon(f.customer, f.rows.coupon[0]);
    assert.equal(result.activated, true); assert.equal(result.campaign.enterpriseCode, 'issuerA');
    assert.deepEqual(result.campaign, f.policy);
    assert.equal(publication.fingerprint(result.campaign), f.campaign.policyFingerprint);
    assert.equal(Object.hasOwn(result.campaign.budget, 'spent'), false);
    assert.equal(Object.hasOwn(result.campaign, 'sellerAuthorizations'), false);
    await assert.rejects(bridge.readCoupon(f.customer, { ...f.rows.coupon[0], batchCode: 'otherBatch' }));
    await assert.rejects(bridge.readCoupon(f.customer, { ...f.rows.coupon[0], promotionCode: 'otherCampaign' }));
    f.rows.coupon[0].vendorEnterpriseRef.moduleName = 'foreign';
    await assert.rejects(bridge.readCoupon(f.customer, f.rows.coupon[0]));
});

test('purchase policy stays pure and fingerprint-stable as live issuer budget consumption changes', async t => {
    const f = await prepared(t);
    const first = await bridge.readCoupon(f.customer, f.rows.coupon[0]);
    f.rows.promotion[0].budget.spent = '27'; f.rows.promotion[0].revision++;
    const second = await bridge.readCoupon(f.customer, f.rows.coupon[0]);
    assert.deepEqual(first.campaign, f.policy); assert.deepEqual(second.campaign, f.policy);
    assert.equal(publication.fingerprint(second.campaign), f.campaign.policyFingerprint);
    assert.deepEqual((await bridge.readRoot(f.customer, f.policy.code))[0].budget, { limit: '100', spent: '27' });
    assert.equal((await bridge.readBudget(f.customer, second.campaign)).budget.spent, '27');
});

test('actual Operation preview, purchase selection and Product availability use the real bridge and exact vendor batch', async t => {
    const f = await prepared(t), original = structuredClone(f.customer), writes = f.state.writes;
    assert.equal(SERVICE.DefaultPromotionOperationService, operation);
    assert.equal(SERVICE.DefaultPromotionSellerPolicyService, bridge);
    const previews = await operation.promotions(f.customer);
    assert.equal(previews.length, 1);
    assert.deepEqual(previews[0].budget, { limit: '100', spent: '17' });
    const purchase = await operation.couponPurchaseCampaign(f.customer, f.rows.coupon[0]);
    assert.equal(purchase.activated, true); assert.deepEqual(purchase.campaign, f.policy);
    assert.equal(publication.fingerprint(purchase.campaign), f.campaign.policyFingerprint);
    assert.equal(Object.hasOwn(purchase.campaign.budget, 'spent'), false);
    assert.equal(Object.hasOwn(purchase.campaign, 'sellerAuthorizations'), false);
    f.rows.promotion[0].budget.spent = '27'; f.rows.promotion[0].revision++;
    const nextPurchase = await operation.couponPurchaseCampaign(f.customer, f.rows.coupon[0]);
    assert.deepEqual(nextPurchase.campaign, f.policy);
    assert.equal(publication.fingerprint(nextPurchase.campaign), f.campaign.policyFingerprint);
    const batchGet = SERVICE.DefaultCouponBatchService.get, couponGet = SERVICE.DefaultCouponService.get;
    let vendorBatchChecks = 0, stockCounts = 0;
    SERVICE.DefaultCouponBatchService.get = async request => {
        if (request.query.status === 'GENERATED' && request.query.promotionCode) {
            vendorBatchChecks++;
            assert.deepEqual(request.query, { tenant: f.request.tenant, enterpriseCode: 'sellerB',
                promotionCode: f.policy.code, status: 'GENERATED', code: f.intent.batchCode });
            assert.equal(request.authData.enterpriseCode, 'sellerB');
            assert.equal(request.options.skipItemCache, true);
        }
        return batchGet(request);
    };
    SERVICE.DefaultCouponService.get = async request => {
        if (request.query.batchCode) {
            stockCounts++;
            assert.deepEqual(request.query, { tenant: f.request.tenant, enterpriseCode: 'sellerB',
                batchCode: f.intent.batchCode, promotionCode: f.policy.code });
            assert.equal(request.options.skipItemCache, true);
        }
        return couponGet(request);
    };
    const availability = await operation.couponPoolAvailability({ ...f.customer, productCode: 'offerA', quantity: '2' });
    assert.equal(availability.batchCode, f.intent.batchCode); assert.equal(availability.couponBatchCode, f.intent.batchCode);
    assert.equal(availability.promotionCode, f.policy.code); assert.equal(availability.available, true);
    assert.equal(availability.availableQuantity, '3'); assert.equal(availability.issuedQuantity, '3');
    assert.equal(availability.guaranteed, false); assert.equal(vendorBatchChecks, 1); assert.equal(stockCounts, 1);
    assert.deepEqual(f.customer, original); assert.equal(f.state.writes, writes);
});

test('actual Operation refuses seller-scoped consumption of delegated issuer policy before any budget read or write', async t => {
    const f = await prepared(t);
    const [delegatedPolicy] = await operation.promotions(f.customer);
    assert.equal(delegatedPolicy.enterpriseCode, 'issuerA');
    const original = structuredClone(f.rows), writes = f.state.writes;
    let reads = 0, updates = 0, ledgerWrites = 0;
    SERVICE.DefaultPromotionService = { ...SERVICE.DefaultPromotionService,
        get: async () => { reads++; throw new Error('unexpected budget read'); },
        update: async () => { updates++; throw new Error('unexpected budget update'); } };
    SERVICE.DefaultPromotionBudgetLedgerService = { ...SERVICE.DefaultPromotionBudgetLedgerService,
        save: async () => { ledgerWrites++; throw new Error('unexpected budget ledger write'); } };
    await assert.rejects(operation.consumeActivatedBudget(f.customer, delegatedPolicy, '1'), error =>
        error instanceof CLASSES.NodicsError && error.code === 'ERR_PROMOTION_SELLER_UNCONFIRMED');
    assert.equal(reads, 0); assert.equal(updates, 0); assert.equal(ledgerWrites, 0);
    assert.equal(f.state.writes, writes); assert.deepEqual(f.rows, original);
});

test('actual Operation Product availability refuses a different vendor batch before counting stock', async t => {
    const f = await prepared(t), batchGet = SERVICE.DefaultCouponBatchService.get;
    const couponGet = SERVICE.DefaultCouponService.get;
    let stockCounts = 0;
    SERVICE.DefaultCouponBatchService.get = async request => {
        const response = await batchGet(request);
        return request.query.status === 'GENERATED' && request.query.promotionCode
            ? { ...response, result: response.result.map(row => ({ ...row, code: 'differentBatch' })) }
            : response;
    };
    SERVICE.DefaultCouponService.get = async request => {
        if (request.query.batchCode) stockCounts++;
        return couponGet(request);
    };
    await assert.rejects(operation.couponPoolAvailability({ ...f.customer, productCode: 'offerA' }), /batch is missing or ambiguous/);
    assert.equal(stockCounts, 0);
});

test('actual Operation methods never turn revoked delegated consent into legacy policy or stock availability', async t => {
    const f = await prepared(t);
    await f.review('REVOKE');
    const writes = f.state.writes, before = f.state.systemReads;
    await assert.rejects(operation.promotions(f.customer), /ERR_PROMOTION_SELLER_UNCONFIRMED/);
    await assert.rejects(operation.couponPurchaseCampaign(f.customer, f.rows.coupon[0]), /ERR_PROMOTION_SELLER_UNCONFIRMED/);
    await assert.rejects(operation.couponPoolAvailability({ ...f.customer, productCode: 'offerA' }), /ERR_PROMOTION_SELLER_UNCONFIRMED/);
    assert.equal(f.state.systemReads, before); assert.equal(f.state.writes, writes);
});

test('actual Operation methods refuse missing or partial selected seller owner before any issuer policy read', async t => {
    const f = await prepared(t), before = f.state.systemReads, writes = f.state.writes;
    for (const missing of [undefined, {}, { ...bridge, readRoot: undefined },
        { ...bridge, readCoupon: undefined }, { ...bridge, readProduct: undefined }]) {
        SERVICE.DefaultPromotionSellerPolicyService = missing;
        await assert.rejects(operation.promotions(f.customer), /ERR_PROMOTION_SELLER_UNCONFIRMED/);
        await assert.rejects(operation.couponPurchaseCampaign(f.customer, f.rows.coupon[0]), /ERR_PROMOTION_SELLER_UNCONFIRMED/);
        await assert.rejects(operation.couponPoolAvailability({ ...f.customer, productCode: 'offerA' }), /ERR_PROMOTION_SELLER_UNCONFIRMED/);
    }
    assert.equal(f.state.systemReads, before); assert.equal(f.state.writes, writes);
});

test('actual Operation methods preserve unchanged self-issued policy and Product-to-stock fallback', async t => {
    const f = fixture.create(t);
    f.policy.conditions.sourceProductCode = 'ownOffer';
    f.campaign.policyFingerprint = publication.fingerprint(f.policy);
    f.settings.promotion.sellerAuthorization = { enabled: true, qualified: true, maximumSellers: 10 };
    await setup.installContribution(f.request);
    const request = { ...f.request, storeCode: 'storeA' }, fallbacks = { root: 0, coupon: 0, product: 0 };
    const reader = { ...bridge };
    for (const [method, key] of [['readRoot', 'root'], ['readCoupon', 'coupon'], ['readProduct', 'product']])
        reader[method] = async function (...args) {
            const result = await bridge[method].apply(this, args);
            assert.equal(result, undefined); fallbacks[key]++;
            return result;
        };
    SERVICE.DefaultPromotionSellerPolicyService = reader;
    const writes = f.state.writes, original = structuredClone(f.rows);
    const [preview] = await operation.promotions(request);
    assert.equal(preview.code, f.policy.code); assert.deepEqual(preview.budget, { limit: '100', spent: '0' });
    const purchase = await operation.couponPurchaseCampaign(request, f.rows.coupon[0]);
    assert.equal(purchase.activated, true); assert.equal(purchase.campaign.code, f.policy.code);
    const availability = await operation.couponPoolAvailability({ ...request, productCode: 'ownOffer' });
    assert.equal(availability.batchCode, f.intent.batchCode); assert.equal(availability.availableQuantity, '3');
    assert.ok(fallbacks.root > 0); assert.equal(fallbacks.coupon, 1); assert.equal(fallbacks.product, 1);
    assert.equal(f.state.writes, writes); assert.deepEqual(f.rows, original);
});

test('38 roots and 43 Product calls use one private discovery and one bounded candidate query per call, never full reads for unrelated policies', async t => {
    const f = await prepared(t);
    for (let index = 1; index < 38; index++) await addProductStock(f, index);
    let discoveries = 0, exactBatchReads = 0, candidateQueries = 0, profiles = 0;
    f.state.onProfile = async () => { profiles++; };
    const batchGet = SERVICE.DefaultCouponBatchService.get, campaignGet = SERVICE.DefaultPromotionService.get;
    SERVICE.DefaultCouponBatchService.get = async request => {
        if (request.query.code) exactBatchReads++; else discoveries++;
        return batchGet(request);
    };
    SERVICE.DefaultPromotionService.get = async request => {
        if (request.query.$or) {
            candidateQueries++;
            assert.equal(request.query.$or.length, 38);
            assert.equal(request.searchOptions.limit, 39);
            assert.equal(request.options.skipItemCache, true);
            assert.equal(request.query['vendorEnterpriseRef.code'], 'sellerB');
            assert.ok(request.query.$or.every(selector => selector.enterpriseCode === 'issuerA'));
            assert.equal(request.authData.enterpriseCode, 'sellerB');
        }
        return campaignGet(request);
    };
    const selected = await bridge.readProduct(f.customer, 'offerA');
    assert.equal(selected.batchCode, f.intent.batchCode);
    const reads = f.reads.length, systemReads = f.state.systemReads, profileReads = profiles;
    assert.ok(profileReads > 0); assert.equal(exactBatchReads, 2);
    for (let index = 0; index < 42; index++)
        assert.equal(await bridge.readProduct(f.customer, 'missing' + index), undefined);
    assert.equal(discoveries, 43); assert.equal(candidateQueries, 43);
    assert.equal(f.reads.length, reads); assert.equal(f.state.systemReads, systemReads);
    assert.equal(profiles, profileReads); assert.equal(exactBatchReads, 2);
});

test('candidate hints cannot authorize different pinned Products, foreign scope, duplicates or failed discovery', async t => {
    const f = await prepared(t), original = structuredClone(f.rows.promotion[0]);
    f.rows.promotion[0].conditions.sourceProductCode = 'changedProduct';
    await assert.rejects(bridge.readProduct(f.customer, 'changedProduct'));
    f.rows.promotion[0] = structuredClone(original);
    const get = SERVICE.DefaultPromotionService.get;
    for (const mutate of [
        response => ({ ...response, code: 'ERR_FAILED' }),
        response => ({ ...response, result: [...response.result, ...response.result] }),
        response => ({ ...response, result: [{ ...response.result[0], enterpriseCode: 'sellerB' }] }),
        response => ({ ...response, result: [{ ...response.result[0], code: 'notReceiptBound' }] }),
        response => ({ ...response, result: [{ ...response.result[0], vendorEnterpriseRef: { ...original.vendorEnterpriseRef, schemaName: 'other' } }] }),
    ]) {
        SERVICE.DefaultPromotionService.get = async request => {
            const response = await get(request);
            return request.query.$or ? mutate(response) : response;
        };
        const before = f.state.systemReads;
        await assert.rejects(bridge.readProduct(f.customer, 'offerA'));
        assert.equal(f.state.systemReads, before);
    }
});

test('service-principal, anonymous and body-flag availability cannot manufacture signed seller authority', async t => {
    const f = await prepared(t);
    const [policy] = await bridge.readRoot(f.customer, f.policy.code);
    for (const authData of [undefined, {}, { isSystem: true },
        { ...f.customer.authData, principalType: 'service' },
        { ...f.customer.authData, tokenType: 'service' }]) {
        const request = { ...f.customer, authData, trustedOwner: true, qualified: true, customer: f.customer.authData };
        const before = f.state.systemReads;
        await assert.rejects(bridge.readRoot(request, f.policy.code));
        await assert.rejects(bridge.readProduct(request, 'offerA'));
        await assert.rejects(bridge.readCoupon(request, f.rows.coupon[0]));
        await assert.rejects(bridge.readBudget(request, policy));
        assert.equal(f.state.systemReads, before);
    }
});

test('disabled and unselected paths retain legacy selection; unqualified selection never reads issuer state', async t => {
    const f = await prepared(t);
    f.settings.promotion.sellerAuthorization.enabled = false;
    assert.equal(await bridge.readRoot(f.customer, f.policy.code), undefined);
    await assert.rejects(bridge.readCoupon(f.customer, f.rows.coupon[0]));
    assert.equal(await bridge.readCoupon(f.customer, {}), undefined);
    f.settings.promotion.sellerAuthorization.enabled = true;
    assert.equal(await bridge.readRoot({ ...f.customer, storeCode: 'unselected' }, f.policy.code), undefined);
    await assert.rejects(bridge.readCoupon({ ...f.customer, storeCode: 'unselected' }, f.rows.coupon[0]));
    f.settings.promotion.sellerAuthorization.qualified = false;
    await assert.rejects(bridge.readRoot(f.customer, f.policy.code));
    assert.equal(f.state.systemReads, 0);
});

test('missing or conflicting signed scope and direct/copied private envelopes fail before system owner authority', async t => {
    const f = await prepared(t);
    for (const request of [
        { ...f.customer, tenant: 'foreign' }, { ...f.customer, enterpriseCode: 'issuerA' },
        { ...f.customer, entCode: 'issuerA' }, { ...f.customer, authData: {} },
        { ...f.customer, authData: { ...f.customer.authData, entCode: 'issuerA' } },
        { ...f.customer, authData: { ...f.customer.authData, principalType: 'service' } },
        { ...f.customer, authData: { ...f.customer.authData, tokenType: 'service' } },
        { ...f.customer, authData: { ...f.customer.authData, principalId: '' } },
    ]) await assert.rejects(bridge.readRoot({ ...request, qualified: true }, f.policy.code));
    await assert.rejects(publication.readSellerPolicy({ request: f.customer, binding: {}, privateRead: true }));
    const binding = await bridge.readBinding(f.customer, f.intent.batchCode);
    await assert.rejects(bridge.readBound(f.customer, { ...binding, rootCode: 'otherRoot' }));
    await assert.rejects(bridge.readBound(f.customer, { ...binding, policyFingerprint: 'f'.repeat(64) }));
    assert.equal(f.state.systemReads, 0);
    let observed;
    SERVICE.DefaultPromotionPublicationService = { ...publication, readSellerPolicy: async command => {
        observed = command;
        await assert.rejects(publication.readSellerPolicy(structuredClone(command)));
        return publication.readSellerPolicy(command);
    } };
    await bridge.readRoot(f.customer, f.policy.code);
    await assert.rejects(publication.readSellerPolicy(observed));
});

test('revoked, regranted, expired or inactive enterprise distribution never reads issuer publication', async t => {
    const f = await prepared(t);
    await f.review('REVOKE'); await assert.rejects(bridge.readRoot(f.customer, f.policy.code));
    await f.review('GRANT'); await assert.rejects(bridge.readRoot(f.customer, f.policy.code));
    f.rows.promotion[0].sellerAuthorizations[0].revision = 1;
    f.rows.promotion[0].sellerAuthorizations[0].expiresAt = '2000-01-01T00:00:00.000Z';
    await assert.rejects(bridge.readRoot(f.customer, f.policy.code));
    f.rows.promotion[0].sellerAuthorizations[0].expiresAt = '2099-01-01T00:00:00.000Z';
    for (const inactive of ['issuerA', 'sellerB']) {
        f.state.inactive = inactive; await assert.rejects(bridge.readRoot(f.customer, f.policy.code));
    }
    assert.equal(f.state.systemReads, 0);
});

test('uncommitted, missing, foreign or corrupt activation and changed pinned policy fail without source fallback', async t => {
    const f = await prepared(t), original = structuredClone(f.retained);
    for (const mutate of [
        () => { f.retained.receipt.applied = false; },
        () => { f.retained.pointer = undefined; },
        () => { f.retained.receipt.enterpriseCode = 'sellerB'; },
        () => { f.retained.receipt.expectedRevision = 7; },
        () => { f.retained.release.payload.records[0].policy.actions = { discountAmount: '999' }; },
        () => { f.retained.release.payload.enterpriseCode = 'sellerB'; },
        () => { f.retained.release.rootCode = 'otherRoot'; },
    ]) {
        f.retained = structuredClone(original); mutate();
        await assert.rejects(bridge.readRoot(f.customer, f.policy.code));
    }
    f.retained = structuredClone(original);
    const payload = structuredClone(original.release.payload);
    payload.records[0].policy.actions = { discountAmount: '99' };
    const next = publication.fingerprint(payload);
    f.retained.release = { ...original.release, code: next, fingerprint: next, payload };
    f.retained.pointer.version = next; f.retained.receipt.targetVersion = next; f.retained.receipt.fingerprint = next;
    await assert.rejects(bridge.readRoot(f.customer, f.policy.code));
});

test('issuer budget and admission provenance cannot be replaced with seller scope, different counters or another release', async t => {
    const f = await prepared(t), original = structuredClone(f.rows.promotion[0]);
    for (const mutate of [
        () => { f.rows.promotion[0].enterpriseCode = 'sellerB'; },
        () => { f.rows.promotion[0].enterpriseRef.code = 'sellerB'; },
        () => { f.rows.promotion[0].budget.limit = '999'; },
        () => { delete f.rows.promotion[0].budget.spent; },
        () => { delete f.rows.promotion[0].budgetAdmission; },
        () => { f.rows.promotion[0].budgetAdmission.command.contribution.checksum = 'f'.repeat(64); },
        () => { f.rows.promotion[0].budgetAdmission.command.storeCode = 'anotherStore'; },
        () => { f.rows.promotion[0].budgetAdmission.command.policyFingerprint = 'f'.repeat(64); },
    ]) {
        f.rows.promotion[0] = structuredClone(original); mutate();
        await assert.rejects(bridge.readRoot(f.customer, f.policy.code));
    }
});

test('grant and receipt mutations during private reads reject and private identity cannot be broadened', async t => {
    const f = await prepared(t);
    let changed = false;
    f.state.onRead = async () => {
        if (!changed) { changed = true; await f.review('REVOKE'); }
    };
    await assert.rejects(bridge.readRoot(f.customer, f.policy.code));
    assert.equal(f.rows.couponBatch.length, 1); assert.equal(f.rows.coupon.length, 3);
    f.state.onRead = undefined;
    f.rows.promotion[0].sellerAuthorizations[0].status = 'ACTIVE'; f.rows.promotion[0].sellerAuthorizations[0].revision = 1;
    SERVICE.DefaultPromotionPublicationService = { ...publication, readSellerPolicy: async command => {
        command.binding.issuerEnterpriseCode = 'otherIssuer';
        return publication.readSellerPolicy(command);
    } };
    const before = f.state.systemReads;
    await assert.rejects(bridge.readRoot(f.customer, f.policy.code));
    assert.equal(f.state.systemReads, before);
});

test('oversized, duplicate or failed receipt discovery cannot imply complete distribution', async t => {
    const f = await prepared(t), original = structuredClone(f.rows.couponBatch[0]);
    f.rows.couponBatch.push({ ...structuredClone(original), code: 'secondBatch' });
    await assert.rejects(bridge.readRoot(f.customer, f.policy.code));
    f.rows.couponBatch.splice(1);
    f.settings.promotion.publication.maxDependencies = 1;
    f.rows.couponBatch.push(structuredClone(original));
    await assert.rejects(bridge.readRoot(f.customer, f.policy.code));
    f.rows.couponBatch.splice(1);
    const get = SERVICE.DefaultCouponBatchService.get;
    SERVICE.DefaultCouponBatchService.get = async request => ({ ...await get(request), code: 'ERR_READ' });
    await assert.rejects(bridge.readRoot(f.customer, f.policy.code));
    assert.equal(f.state.systemReads, 0);
});

test('later layer narrowing rejects distribution without creating another owner or changing legacy publication equality', async t => {
    const f = await prepared(t);
    const narrowed = { ...bridge, maximumBindings: () => 0 };
    await assert.rejects(narrowed.readRoot(f.customer, f.policy.code));
    await assert.rejects(publication.readActivated({ rootType: 'promotion', rootCode: f.policy.code },
        { ...f.customer, authData: { isSystem: true } }));
    assert.equal(f.state.systemReads, 0);
});

test('receipt membership tampering and mutation during reads cannot extend an original coupon or distribution', async t => {
    const f = await prepared(t), original = structuredClone(f.rows.coupon[0]);
    f.rows.coupon[0].issuerEnterpriseRef = structuredClone(original.vendorEnterpriseRef);
    await assert.rejects(bridge.readCoupon(f.customer, f.rows.coupon[0]));
    f.rows.coupon[0] = structuredClone(original);
    f.rows.coupon[0].code = 'anotherCoupon';
    await assert.rejects(bridge.readCoupon(f.customer, f.rows.coupon[0]));
    f.rows.coupon[0] = structuredClone(original);
    f.rows.coupon[0].tokenHash = 'f'.repeat(64);
    await assert.rejects(bridge.readCoupon(f.customer, f.rows.coupon[0]));
    f.rows.coupon[0] = structuredClone(original);
    let changed = false;
    f.state.onRead = async () => {
        if (!changed) { changed = true; f.rows.couponBatch[0].secureIssuance.units[0].tokenHash = 'f'.repeat(64); }
    };
    await assert.rejects(bridge.readRoot(f.customer, f.policy.code));
});

test('ordinary self-issued root keeps its own reader and selected Staged cannot create private issuer authority', async t => {
    const f = await prepared(t);
    const batch = f.rows.couponBatch[0];
    f.rows.couponBatch.splice(0);
    assert.equal(await bridge.readRoot(f.customer, f.policy.code), undefined);
    f.rows.couponBatch.push(batch);
    f.settings.promotion.publication.runtimeRole = 'STAGED';
    await assert.rejects(bridge.readRoot(f.customer, f.policy.code));
    assert.equal(f.state.systemReads, 0);
});

test('all private receipt and coupon reads retain existing capture protection and unqualified capture refuses', async t => {
    const f = await prepared(t);
    for (const name of ['DefaultCouponBatchService', 'DefaultCouponService']) {
        const get = SERVICE[name].get;
        SERVICE[name].get = async request => {
            assert.equal(SERVICE.DefaultLoggerService.isSensitiveRequest(), true);
            return get(request);
        };
    }
    await bridge.readRoot(f.customer, f.policy.code);
    await bridge.readCoupon(f.customer, f.rows.coupon[0]);
    f.settings.log.requestPrivacy.qualified = false;
    const before = f.state.systemReads;
    await assert.rejects(bridge.readRoot(f.customer, f.policy.code));
    assert.equal(f.state.systemReads, before);
});

test('real public Product admission resolves through Operation and SellerPolicy without writes or private output', async t => {
    const f = await prepared(t), d = distributionOwners(f);
    const before = structuredClone(f.rows), writes = f.state.writes;
    const original = structuredClone(d.request);
    assert.deepEqual(await distribution.publicAvailability(d.request), { available: true, status: 'IN_STOCK' });
    assert.equal(d.state.ownerRequests.length, 1);
    assert.deepEqual(d.state.ownerRequests[0].authData, {});
    assert.equal(d.state.selections, 2);
    assert.deepEqual(d.request, original);
    assert.deepEqual(f.rows, before);
    assert.equal(f.state.writes, writes);
    assert.equal(distribution.resolveReadContext(d.state.ownerRequests[0]), undefined);
});

test('integrated customer summary reflects sold/reserved stock without leaking pool evidence or reserving units', async t => {
    const f = await prepared(t), d = distributionOwners(f);
    f.rows.coupon[0].soldTo = 'another-buyer';
    f.rows.coupon[1].reservedFor = 'another-cart';
    f.rows.coupon[2].status = 'REDEEMED';
    const before = structuredClone(f.rows), writes = f.state.writes;
    const request = { ...d.request, authData: { principalType: 'anonymous' } };
    assert.deepEqual(await productEnrichment.consumerSummaries(request, [structuredClone(d.row)]),
        { prices: {}, availability: { offerA: { available: false, status: 'OUT_OF_STOCK' } } });
    assert.deepEqual(f.rows, before);
    assert.equal(f.state.writes, writes);
});

test('real downstream publication faults expire public admission and never become stock-unavailable success', async t => {
    const f = await prepared(t), d = distributionOwners(f);
    f.state.onRead = () => { throw new Error('isolated retained-policy fault'); };
    await assert.rejects(productEnrichment.consumerSummaries(d.request, [structuredClone(d.row)]),
        /isolated retained-policy fault/);
    assert.equal(d.state.ownerRequests.length, 1);
    const retained = d.state.ownerRequests[0];
    assert.equal(distribution.resolveReadContext(retained), undefined);
    await assert.rejects(bridge.readProduct(retained, 'offerA'));
    delete f.state.onRead;
    assert.deepEqual(await distribution.publicAvailability(d.request), { available: true, status: 'IN_STOCK' });
});

test('live public admission refuses real Root, Coupon, Budget and different Product owner escapes', async t => {
    const f = await prepared(t), d = distributionOwners(f);
    let exercised = false;
    d.state.afterProduct = async (request, result) => {
        exercised = true;
        const context = SERVICE.DefaultPromotionSellerPolicyService.context(request);
        assert.equal(context.enterpriseCode, 'sellerB');
        assert.deepEqual(context.authData, {});
        for (const input of [request, context]) {
            await assert.rejects(bridge.readRoot(input, f.policy.code));
            await assert.rejects(bridge.readCoupon(input, f.rows.coupon[0]));
            await assert.rejects(bridge.readBudget(input, result.campaign));
            await assert.rejects(bridge.readProduct(input, 'different-product'));
            await assert.rejects(bridge.readProduct(structuredClone(input), 'offerA'));
        }
    };
    await distribution.publicAvailability(d.request);
    assert.equal(exercised, true);
});

test('public Product admission cannot escape to a copied direct-batch Operation pool request', async t => {
    const f = await prepared(t), d = distributionOwners(f);
    d.state.afterProduct = async request => {
        await assert.rejects(operation.couponPoolAvailability({ ...request,
            batchCode: f.rows.couponBatch[0].code, promotionCode: f.policy.code }));
    };
    await distribution.publicAvailability(d.request);
});

test('selected Operation supply rejects caller batch selectors and fabricated source authority before stock queries', async t => {
    const f = await prepared(t), d = distributionOwners(f);
    let stockReads = 0;
    for (const name of ['DefaultCouponService', 'DefaultCouponBatchService']) {
        const get = SERVICE[name].get;
        SERVICE[name].get = request => { stockReads++; return get(request); };
    }
    for (const request of [
        { ...d.request, enterpriseCode: 'sellerB', batchCode: f.intent.batchCode },
        { ...f.customer, productCode: 'offerA', batchCode: f.intent.batchCode },
        { ...f.customer, productCode: 'offerA', promotionCode: f.policy.code },
        { ...f.customer, productCode: 'offerA', payload: { batchCode: f.intent.batchCode } },
        { ...f.customer, productCode: 'offerA', payload: { promotionCode: f.policy.code } },
        { ...f.customer, productCode: 'offerA', authData: { ...f.customer.authData, principalType: 'service' },
            original: f.customer, distributionAdmitted: true },
    ]) await assert.rejects(operation.couponPoolAvailability(request), /ERR_PROMOTION_SELLER_UNCONFIRMED/);
    assert.equal(stockReads, 0);
    const narrowed = { ...operation, couponPoolAdmission() { throw new Error('later-layer supply refusal'); } };
    await assert.rejects(narrowed.couponPoolAvailability({ ...f.customer, productCode: 'offerA' }), /later-layer supply refusal/);
    assert.equal(stockReads, 0);
    f.settings.promotion.publication.delivery.enabled = false;
    assert.equal((await operation.couponPoolAvailability({ ...f.customer, batchCode: f.intent.batchCode })).available, true);
});

test('real distribution owner rejects stale consent, receipt, visibility and installed privacy protections', async t => {
    for (const kind of ['revoked', 'regranted', 'receipt', 'inactive', 'unpublished', 'product-drift', 'privacy', 'consent-drift']) {
        await t.test(kind, async t => {
            const f = await prepared(t), d = distributionOwners(f);
            if (kind === 'revoked' || kind === 'regranted') await f.review('REVOKE');
            if (kind === 'regranted') await f.review('GRANT');
            if (kind === 'receipt') f.rows.couponBatch[0].secureIssuance.units[0].code = 'foreign-unit';
            if (kind === 'inactive') f.state.inactive = 'issuerA';
            if (kind === 'unpublished') d.state.versions = [];
            if (kind === 'product-drift') d.state.afterProduct = () => { d.row.sourceHash = 'd'.repeat(64); };
            if (kind === 'privacy') f.settings.log.requestPrivacy.qualified = false;
            let revoked = false;
            if (kind === 'consent-drift') f.state.onRead = async () => {
                if (!revoked) { revoked = true; await f.review('REVOKE'); }
            };
            const before = structuredClone(f.rows), writes = f.state.writes;
            await assert.rejects(distribution.publicAvailability(d.request));
            if (kind === 'consent-drift') {
                assert.equal(revoked, true);
                assert.deepEqual(f.rows.coupon, before.coupon);
                assert.deepEqual(f.rows.couponBatch, before.couponBatch);
                assert.equal(f.rows.promotion[0].revision, before.promotion[0].revision + 1,
                    'Only the explicit fixture issuer revocation changes the campaign');
                assert.equal(f.rows.promotion[0].sellerAuthorizations[0].status, 'REVOKED');
                assert.equal(f.state.writes, writes, 'Availability never inserts or replaces stock');
            } else {
                assert.deepEqual(f.rows, before);
                assert.equal(f.state.writes, writes);
            }
        });
    }
});

test('real Product customer summaries preserve anonymous and signed authority and reject service substitution', async t => {
    const f = await prepared(t), d = distributionOwners(f);
    for (const authData of [{}, { principalType: 'anonymous' },
        { tokenType: 'access', principalType: 'customer', tenant: 'tenantA', principalId: 'buyerA' }, f.customer.authData]) {
        const request = { ...d.request, authData: structuredClone(authData) }, original = structuredClone(request);
        const summaries = await productEnrichment.consumerSummaries(request, [structuredClone(d.row)]);
        assert.deepEqual(summaries, { prices: {}, availability: { offerA: { available: true, status: 'IN_STOCK' } } });
        assert.deepEqual(request, original);
        assert.deepEqual(d.state.ownerRequests.at(-1).authData, authData);
    }
    await assert.rejects(productEnrichment.consumerSummaries({ ...d.request, authData: {
        tenant: 'tenantA', enterpriseCode: 'sellerB', principalType: 'service' } }, [structuredClone(d.row)]));
});

test('actual Product discovery route keeps missing eligible distribution unavailable without signed-policy fallback', async t => {
    for (const kind of ['eligible', 'no-batch', 'other-product', 'other-root']) await t.test(kind, async t => {
        const f = await prepared(t), d = distributionOwners(f);
        const previous = Object.getOwnPropertyDescriptor(global, 'FACADE');
        t.after(() => previous ? Object.defineProperty(global, 'FACADE', previous) : delete global.FACADE);
        global.FACADE = { DefaultProductDiscoveryFacade: require('../../product/src/facade/defaultProductDiscoveryFacade') };
        const controller = require('../../product/src/controller/defaultProductDiscoveryController');
        const route = require('../../product/src/router/routers').product.customer;
        assert.ok(Object.values(route).some(item => item.key === '/products/discovery' && item.operation === 'list'));
        if (kind === 'no-batch') f.rows.couponBatch.length = 0;
        if (kind === 'other-product') f.rows.promotion[0].conditions.sourceProductCode = 'other-product';
        if (kind === 'other-root') f.settings.promotion.publication.delivery.rootCodesByStore.storeA = ['other-root'];
        const before = structuredClone(f.rows), writes = f.state.writes;
        let fallback = 0, couponReads = 0;
        SERVICE.DefaultPromotionOperationService = { ...operation, promotions: async function (request) {
            fallback++; return operation.promotions.call(this, request);
        } };
        const get = SERVICE.DefaultCouponService.get;
        SERVICE.DefaultCouponService.get = request => { couponReads++; return get(request); };
        const authorities = [{}, { principalType: 'anonymous' },
            { tenant: 'tenantA', tokenType: 'access', principalType: 'customer', principalId: 'buyerA' }];
        if (kind === 'eligible') authorities.push(f.customer.authData);
        for (const authData of authorities) {
            const request = { tenant: 'tenantA', authData: structuredClone(authData),
                httpRequest: { query: { storeCode: 'storeA', locale: 'en', pageSize: '100' } } };
            const originalAuth = structuredClone(authData);
            const result = await controller.list(request);
            assert.equal(result.data.products.length, 1);
            assert.deepEqual(result.data.products[0].availability, {
                available: kind === 'eligible', status: kind === 'eligible' ? 'IN_STOCK' : 'OUT_OF_STOCK',
            });
            assert.deepEqual(request.authData, originalAuth);
            assert.ok(!/sellerAuthorizations|protectedToken|secureIssuance|private-batch/.test(JSON.stringify(result)));
        }
        assert.equal(fallback, 0, 'A Product-only read cannot enumerate signed/root policy');
        if (kind !== 'eligible') assert.equal(couponReads, 0, 'No eligible binding grants no coupon-unit read');
        assert.deepEqual(f.rows, before); assert.equal(f.state.writes, writes);
    });
});

test('actual discovery route does not turn foreign authority or broken owner proof into unavailable success', async t => {
    for (const kind of ['revoked', 'corrupt-receipt', 'failed-publication', 'foreign-enterprise', 'foreign-tenant', 'service-principal'])
        await t.test(kind, async t => {
            const f = await prepared(t), d = distributionOwners(f);
            const previous = Object.getOwnPropertyDescriptor(global, 'FACADE');
            t.after(() => previous ? Object.defineProperty(global, 'FACADE', previous) : delete global.FACADE);
            global.FACADE = { DefaultProductDiscoveryFacade: require('../../product/src/facade/defaultProductDiscoveryFacade') };
            const controller = require('../../product/src/controller/defaultProductDiscoveryController');
            const request = { tenant: 'tenantA', authData: {},
                httpRequest: { query: { storeCode: 'storeA', locale: 'en', pageSize: '100' } } };
            if (kind === 'revoked') await f.review('REVOKE');
            if (kind === 'corrupt-receipt') f.rows.couponBatch[0].secureIssuance.units[0].code = 'foreign-unit';
            if (kind === 'failed-publication') f.state.onRead = () => { throw new Error('retained-policy fault'); };
            if (kind === 'foreign-enterprise') request.authData = { ...f.customer.authData, enterpriseCode: 'foreign' };
            if (kind === 'foreign-tenant') d.row.tenant = 'foreign';
            if (kind === 'service-principal') request.authData = { ...f.customer.authData, principalType: 'service' };
            const before = structuredClone(f.rows), auth = structuredClone(request.authData), writes = f.state.writes;
            if (kind === 'foreign-tenant') {
                assert.deepEqual((await controller.list(request)).data.products, [], 'Foreign catalogue rows are not delivered');
                assert.equal(d.state.ownerRequests.length, 0);
            } else await assert.rejects(controller.list(request));
            assert.deepEqual(request.authData, auth); assert.deepEqual(f.rows, before); assert.equal(f.state.writes, writes);
            for (const retained of d.state.ownerRequests) assert.equal(distribution.resolveReadContext(retained), undefined);
        });
});

test('real trusted Cart read without eligible receipt returns zero supply without root enumeration or auth changes', async t => {
    const f = await prepared(t); distributionOwners(f); f.rows.couponBatch.length = 0;
    const cart = { tenant: 'tenantA', enterpriseCode: 'sellerB', storeCode: 'storeA', locale: 'en', ownerId: 'buyerA' };
    const original = { ...f.customer, ownerId: 'buyerA' }, before = structuredClone(original);
    let fallback = 0;
    SERVICE.DefaultPromotionOperationService = { ...operation, promotions: async function (request) {
        fallback++; return operation.promotions.call(this, request);
    } };
    const result = await cartPorts.create(cart, original).inventory({ ...cart, productCode: 'offerA', sku: 'SKU-A', quantity: '2' });
    assert.equal(result.available, false); assert.equal(result.availableQuantity, '0');
    assert.equal(result.issuedQuantity, undefined, 'Unavailable eligible supply is not a claim about total issued stock');
    assert.equal(fallback, 0); assert.deepEqual(original, before);
});

test('real Cart to Digital to Promotion forwards detached signed authority and does not grant absent origin', async t => {
    const f = await prepared(t), d = distributionOwners(f);
    const cart = { tenant: 'tenantA', enterpriseCode: 'sellerB', storeCode: 'storeA', locale: 'en', ownerId: 'buyerA' };
    const original = { ...f.customer, ownerId: 'buyerA' }, snapshot = structuredClone(original);
    const ports = cartPorts.create(cart, original);
    original.authData.enterpriseCode = 'foreign';
    const input = { ...cart, productCode: 'offerA', sku: 'SKU-A', quantity: '2' };
    const result = await ports.inventory(input);
    assert.equal(result.available, true);
    assert.equal(result.availableQuantity, '3');
    assert.equal(d.state.ownerRequests.at(-1).authData.principalType, 'service');
    d.state.afterProduct = request => {
        const context = SERVICE.DefaultPromotionSellerPolicyService.context(request);
        assert.deepEqual(context.authData, snapshot.authData);
        assert.notEqual(context.authData, snapshot.authData);
    };
    await ports.inventory(input);
    await assert.rejects(cartPorts.create(cart).inventory(input));
    await assert.rejects(cartPorts.create(cart, { ...snapshot, authData: { ...snapshot.authData, principalType: 'service' } }).inventory(input));
    f.settings.promotion.publication.delivery.enabled = false;
    delete d.state.afterProduct;
    assert.equal(distribution.selected(input), false);
    assert.equal(await distribution.publicAvailability(d.request), undefined);
    await assert.rejects(cartPorts.create(cart).inventory(input), /Coupon Product policy is missing or ambiguous/);
});
