/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
'use strict';
/** @module promotion/test/promotionMerchantScopeContract @description Exercises private issuer staff admission against actual Digital merchant coordination, secure receipt membership and live consent with isolated persistence ports. @layer test @owner promotion */
const test = require('node:test'), assert = require('node:assert/strict'), crypto = require('node:crypto');
const bridge = require('../src/service/defaultPromotionMerchantScopeService');
const secureOwner = require('../src/service/defaultCouponSecureIssuanceService');
const generatedCouponReads = require('./helpers/generatedCouponReadFixture');
const seller = require('../src/service/defaultCouponSellerAuthorizationService');
const sellerPolicy = require('../src/service/defaultPromotionSellerPolicyService');
const operation = require('../src/service/defaultPromotionOperationService');
const merchant = require('../../../../digitalCommerce/modules/digitalCore/src/service/defaultDigitalCommerceMerchantService');
const digital = require('../../../../digitalCommerce/modules/digitalCore/src/service/defaultDigitalCommerceEntitlementService');
const provider = require('../../../../digitalCommerce/modules/digitalCore/src/service/defaultDigitalCommerceMerchantScreenProviderService');
const clone = value => structuredClone(value), fingerprint = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const ref = code => ({ moduleName: 'profile', schemaName: 'enterprise', code });
let coupon, batch, campaign, item, receipts, denial, qualified, persistenceReady, writes, profileHeaders;
function employee(payload = {}) {
    return { tenant: 'runtime', code: 'entitlement', enterpriseCode: 'issuer', authorization: 'Bearer original-staff-token',
        authData: { tenant: 'runtime', enterpriseCode: 'issuer', tokenType: 'access', principalType: 'human', loginId: 'employee' },
        idempotencyKey: 'confirm:entitlement', payload: { confirmed: true, merchantReceiptReference: 'SALE-123', ...payload } };
}
function equal(query, row) { return Object.entries(query).every(([key, value]) =>
    key.split('.').reduce((current, part) => current?.[part], row) === value); }
test.beforeEach(() => {
    denial = false; qualified = true; persistenceReady = true; writes = 0; profileHeaders = [];
    const proof = { issuerEnterpriseCode: 'issuer', sellerEnterpriseCode: 'vendor', promotionCode: 'promotion', grantRevision: 1 };
    coupon = { tenant: 'runtime', enterpriseCode: 'vendor', code: 'batch:1', batchCode: 'batch', promotionCode: 'promotion',
        issuerEnterpriseRef: ref('issuer'), vendorEnterpriseRef: ref('vendor'), enterpriseRef: ref('vendor'),
        soldTo: 'buyer@example.test', productCode: 'product', orderCode: 'order', status: 'DELIVERED', revision: 1,
        tokenHash: operation.tokenHashSelector('runtime', 'CUSTOMER-CODE'), secureIssuanceCode: 'batch',
        protectedToken: { ciphertext: 'not-plaintext' }, sellerAuthorizationProof: proof };
    batch = { tenant: 'runtime', enterpriseCode: 'vendor', code: 'batch', promotionCode: 'promotion', issuedCount: 1,
        issuerEnterpriseRef: ref('issuer'), vendorEnterpriseRef: ref('vendor'), enterpriseRef: ref('vendor'),
        secureIssuance: { createdAt: '2026-10-01T00:00:00Z', command: { tenant: 'runtime', enterpriseCode: 'issuer', promotionCode: 'promotion',
            batchCode: 'batch', storeCode: 'catalogue', rootCode: 'root', policyFingerprint: 'a'.repeat(64),
            actorId: 'issuer-admin', commandReference: 'issuance:1', quantity: 1,
            contribution: { moduleName: 'circa', releaseCode: 'sample-v001', version: 'v001', checksum: 'b'.repeat(64) },
            issuanceAuthority: { issuerEnterpriseRef: ref('issuer'), vendorEnterpriseRef: ref('vendor'), sellerAuthorizationProof: proof } },
            units: [{ code: coupon.code, tokenHash: coupon.tokenHash, protectedFingerprint: fingerprint(coupon.protectedToken) }] } };
    campaign = { tenant: 'runtime', enterpriseCode: 'issuer', code: 'promotion', issuerEnterpriseRef: ref('issuer'), vendorEnterpriseRef: ref('vendor'),
        active: true, status: 'ACTIVE', revision: 2, sellerAuthorizations: [{ issuerEnterpriseCode: 'issuer', sellerEnterpriseCode: 'vendor',
            status: 'ACTIVE', revision: 1, expiresAt: '2099-01-01T00:00:00Z' }] };
    item = { tenant: 'runtime', enterpriseCode: 'vendor', code: 'entitlement', ownerId: coupon.soldTo, productCode: 'product', orderCode: 'order',
        providerOwner: 'promotion', providerCode: coupon.code, status: 'ACTIVE', claimStatus: 'UNCLAIMED', revision: 0, evidence: {} };
    receipts = new Map();
    global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message || code); this.code = code; } } };
    global.CONFIG = { get: key => key === 'runtimeRole' ? 'COMMERCE' : key === 'promotion' ?
        { sellerAuthorization: { enabled: true, qualified, maximumSellers: 100 } } : key === 'digitalCore' ? { merchantRedemption: { enabled: true } } : {} };
    const success = rows => ({ code: 'SUC_READ', result: clone(rows), count: rows.length });
    global.SERVICE = {
        DefaultDigitalCommerceMerchantService: merchant, DefaultDigitalCommerceEntitlementService: digital,
        DefaultPromotionMerchantScopeService: bridge, DefaultCouponSellerAuthorizationService: seller,
        DefaultPromotionSellerPolicyService: sellerPolicy, DefaultDigitalCommerceMerchantScreenProviderService: provider,
        DefaultIdentityGovernanceService: { getSystemAuthData: async () => ({ isSystem: true, principalType: 'service' }) },
        DefaultLoggerService: { isRequestPrivacyQualified: () => true, hasPrivateCaptureProtection: () => true,
            runSensitiveOperation: async (_r, action) => action() },
        DefaultSecuredRequestPipelineService: { getGrantedPermissions: () => ['commerce.coupon.pos.redeem'], isPermissionGranted: (p, all) => all.includes(p) },
        DefaultModuleService: { invokeModule: async r => {
            if (r.apiName === '/identity/scopes/me') {
                profileHeaders.push(clone(r.header));
                return { data: { principalCode: 'employee', scopes: [{ scopeType: 'ENTERPRISE', scopeCode: 'issuer' }],
                    deniedScopes: denial ? [{ scopeType: 'ENTERPRISE', scopeCode: 'issuer' }] : [] } };
            }
            return { result: [{ code: r.requestBody.codes?.[0] || r.requestBody.query.code, active: true }] };
        } },
        DefaultCouponSecureIssuanceService: { ...secureOwner, persistence: async () => { if (!persistenceReady) throw Error('installed persistence missing'); } },
        DefaultPromotionPublicationService: { fingerprint, deliveryEnabled: () => true, deliveryRoots: () => ['root'] },
        DefaultCouponService: { get: async r => { assert.equal(r.authData.isSystem, true); return success(equal(r.query, coupon) ? [coupon] : []); } },
        DefaultCouponBatchService: { get: async r => success(equal(r.query, batch) ? [batch] : []) },
        DefaultPromotionService: { get: async () => success([campaign]) },
        DefaultDigitalEntitlementService: {
            get: async r => success(equal(r.query, item) ? [item] : []),
            update: async r => {
                assert.equal(r.authData.enterpriseCode, 'vendor'); assert.equal(r.authData.isSystem, true);
                assert.equal(r.query.enterpriseCode, 'vendor'); assert.equal(r.query.revision, item.revision);
                item = { ...item, ...clone(r.model) }; writes++;
                return { code: 'SUC_UPDATE', result: { acknowledged: true, matchedCount: 1 } };
            } },
        DefaultDigitalDeliveryService: { get: async r => success(receipts.has(r.query.code) ? [receipts.get(r.query.code)] : []),
            save: async r => { assert.equal(r.model.enterpriseCode, 'vendor'); receipts.set(r.model.code, clone(r.model)); writes++;
                return { code: 'SUC_SAVE', result: clone(r.model) }; } },
        DefaultPromotionOperationService: { ...operation,
            validateMerchantCoupon: async r => { assert.equal(r.enterpriseCode, 'vendor'); assert.equal(r.couponCode, coupon.code); return { eligible: true, conditions: {} }; },
            claimPurchasedCouponCode: async r => { assert.equal(r.enterpriseCode, 'vendor'); coupon.status = 'CLAIMED'; writes++; return clone(coupon); },
            redeemClaimedCouponCode: async r => { assert.equal(r.enterpriseCode, 'vendor'); coupon.status = 'REDEEMED'; writes++; return clone(coupon); } },
    };
});
async function validated() {
    const result = await merchant.validate(employee({ couponToken: 'CUSTOMER-CODE' }));
    return employee({ expectedRevision: result.revision, validationCode: result.validationCode, validationExpiresAt: result.validationExpiresAt });
}
test('issuer validation compares detached BSON entitlement snapshots without dropping purchase fields', async () => {
    const { ObjectId } = require('mongodb');
    const id = '0123456789abcdef01234567';
    SERVICE.DefaultDigitalEntitlementService.get = async request => ({ code: 'SUC_READ', count: equal(request.query, item) ? 1 : 0,
        result: equal(request.query, item) ? [{ ...item, _id: new ObjectId(id), created: new Date('2026-10-01T00:00:00Z') }] : [] });
    const result = await merchant.validate(employee({ couponToken: 'CUSTOMER-CODE' }));
    assert.equal(result.eligible, true);
    assert.equal(result.entitlementCode, item.code);
    assert.equal(writes, 0);
    const request = await merchant.staff(employee({ couponToken: 'CUSTOMER-CODE' }));
    await bridge.admit(request, { token: 'CUSTOMER-CODE' });
    const original = await bridge.execute(request, 'entitlement');
    assert.equal(original._id, id);
    assert.equal(original.created, '2026-10-01T00:00:00.000Z');
    for (const change of [value => value._id = 'f'.repeat(24), value => value.created = '2025-10-01T00:00:00.000Z',
        value => value.revision++, value => value.purchasePolicy = { injected: true }]) {
        const altered = clone(original);
        change(altered);
        await assert.rejects(bridge.execute(request, 'coupon', { item: altered }), { code: 'ERR_PROMOTION_SELLER_UNCONFIRMED' });
    }
    assert.equal(writes, 0);
});
test('effective wire snapshot override is used without exposing diagnostic writes or admission maps', async () => {
    let snapshots = 0;
    const effective = { ...bridge, recordSnapshot: function (value) {
        snapshots++;
        return bridge.recordSnapshot(value);
    } };
    SERVICE.DefaultPromotionMerchantScopeService = effective;
    const request = await merchant.staff(employee({ couponToken: 'CUSTOMER-CODE' }));
    assert.equal(await effective.admit(request, { token: 'CUSTOMER-CODE' }), true);
    assert.deepEqual(await effective.execute(request, 'entitlement'), item);
    assert(snapshots > 0);
    assert.equal(effective.admitted({ ...request }), false);
    for (const name of ['stage', 'admissionDiagnostics', 'admissionStages', 'admissionFailures', 'admissions'])
        assert.equal(Object.hasOwn(bridge, name), false);
});

test('actual generated token and batch reads retain private issuance proof through issuer admission', async t => {
    const state = generatedCouponReads(t, name => [name === 'coupon' ? coupon : batch]);
    const input = await merchant.staff(employee({ couponToken: 'CUSTOMER-CODE' })), original = clone(input);
    assert.equal(await bridge.admit(input, { token: 'CUSTOMER-CODE' }), true);
    assert.deepEqual(input, original); assert.equal(bridge.admitted(input), true);
    assert.equal(bridge.admitted({ ...input }), false);
    assert.equal(state.sameRequest, true); assert.equal(state.findCalls, 2); assert.equal(state.countCalls, 2);
    assert.deepEqual(state.reads.map(row => row.query), [
        { tenant: 'runtime', tokenHash: coupon.tokenHash },
        { tenant: 'runtime', enterpriseCode: 'vendor', code: 'batch' },
    ]);
    assert.deepEqual(state.hooks.map(row => row.hasCode), [false, true, false, true]);
    assert(state.hooks.every(row => row.privateFields && row.count === 1));
    const generic = await SERVICE.DefaultCouponService.get({ tenant: 'runtime', authData: { userGroups: ['serviceAccountUserGroup'] },
        query: { tenant: 'runtime', code: coupon.code }, options: { recursive: false, skipItemCache: true }, searchOptions: { pageSize: 2 } });
    assert.equal(generic.code, 'SUC_FIND_00000');
    assert.equal(generic.result[0].protectedToken, undefined); assert.equal(generic.result[0].secureIssuanceCode, undefined);
    assert.ok(coupon.protectedToken); assert.equal(writes, 0);
});
test('delegated purchased campaign rechecks protected membership after the real generic coupon projection', async t => {
    generatedCouponReads(t, name => [name === 'coupon' ? coupon : batch]);
    SERVICE.DefaultPromotionOperationService.validateMerchantCoupon = async request => {
        const visible = await operation.getOne(SERVICE.DefaultCouponService, { tenant: request.tenant,
            authData: operation.serviceAuthData(request), query: operation.enterpriseQuery(request,
                { tenant: request.tenant, code: request.couponCode }), options: { recursive: false, skipItemCache: true },
            searchOptions: { pageSize: 2 } });
        assert.equal(visible.protectedToken, undefined);
        assert.equal(visible.secureIssuanceCode, undefined);
        const current = await operation.merchantCampaign(request, visible);
        assert.equal(current.code, campaign.code);
        return { eligible: true, conditions: {} };
    };
    const result = await merchant.validate(employee({ couponToken: 'CUSTOMER-CODE' }));
    assert.equal(result.eligible, true);
    assert.equal(writes, 0);
});
for (const [name, change] of [
    ['buyer', value => value.soldTo = 'another-buyer'], ['original Order', value => delete value.orderCode],
    ['revision', value => value.revision++], ['purchase rights', value => value.purchasePolicy = { injected: true }],
    ['metadata', value => value.metadata = { injected: true }],
    ['supplied ciphertext', value => value.protectedToken = { ciphertext: 'changed' }],
    ['supplied issuance', value => value.secureIssuanceCode = 'another-batch'],
]) test('private campaign reread refuses changed generic projection ' + name, async t => {
    generatedCouponReads(t, schema => [schema === 'coupon' ? coupon : batch]);
    SERVICE.DefaultPromotionOperationService.validateMerchantCoupon = async request => {
        const visible = await operation.getOne(SERVICE.DefaultCouponService, { tenant: request.tenant,
            authData: operation.serviceAuthData(request), query: operation.enterpriseQuery(request,
                { tenant: request.tenant, code: request.couponCode }), options: { recursive: false, skipItemCache: true },
            searchOptions: { pageSize: 2 } });
        change(visible);
        return operation.merchantCampaign(request, visible);
    };
    await assert.rejects(merchant.validate(employee({ couponToken: 'CUSTOMER-CODE' })), { code: 'ERR_PROMOTION_SELLER_UNCONFIRMED' });
    assert.equal(writes, 0);
});

test('copied generated token read cannot retain private proof or grant issuer admission', async t => {
    const state = generatedCouponReads(t, name => [name === 'coupon' ? coupon : batch]); state.copyRequest = true;
    const input = await merchant.staff(employee({ couponToken: 'CUSTOMER-CODE' }));
    await assert.rejects(bridge.admit(input, { token: 'CUSTOMER-CODE' }));
    assert.equal(bridge.admitted(input), false); assert.equal(state.sameRequest, false); assert.equal(writes, 0);
});

test('generated generic protected selector refuses before Mongo and staff input drift cannot grant admission', async t => {
    const state = generatedCouponReads(t, name => [name === 'coupon' ? coupon : batch]);
    await assert.rejects(SERVICE.DefaultCouponService.get({ tenant: 'runtime', authData: { userGroups: ['serviceAccountUserGroup'] },
        query: { tenant: 'runtime', protectedToken: { $exists: true } }, options: { recursive: false }, searchOptions: { pageSize: 2 } }));
    assert.equal(state.findCalls, 0); assert.equal(state.countCalls, 0);
    const input = await merchant.staff(employee({ couponToken: 'CUSTOMER-CODE' }));
    state.afterGet = () => { input.authData.loginId = 'another-employee'; };
    await assert.rejects(bridge.admit(input, { token: 'CUSTOMER-CODE' }));
    assert.equal(bridge.admitted(input), false); assert.equal(writes, 0);
});

for (const [name, change] of [
    ['missing final success', result => { delete result.code; }],
    ['failed final envelope', result => { result.code = 'ERR_FIND_00000'; }],
    ['failed final flag', result => { result.success = false; }],
]) test('real generated issuer token admission refuses ' + name, async t => {
    const state = generatedCouponReads(t, schema => [schema === 'coupon' ? coupon : batch]); state.afterGet = change;
    const input = await merchant.staff(employee({ couponToken: 'CUSTOMER-CODE' }));
    await assert.rejects(bridge.admit(input, { token: 'CUSTOMER-CODE' }), error => {
        assert.equal(bridge.admissionFailureStage(error), 'TOKEN_READ');
        assert.equal(bridge.admissionFailureStage({ ...error }), undefined);
        return true;
    });
    assert.equal(bridge.admitted(input), false); assert.equal(writes, 0);
});

for (const [expected, change] of [
    ['SECURE_PERSISTENCE', () => { persistenceReady = false; }],
    ['COUPON_SCOPE', () => { coupon.issuerEnterpriseRef = ref('foreign'); }],
    ['ISSUANCE_BINDING', () => { batch.secureIssuance.command.enterpriseCode = 'foreign'; }],
    ['TOKEN_MEMBERSHIP', () => { coupon.protectedToken.ciphertext = 'changed'; }],
    ['PUBLICATION_SELECTION', () => { SERVICE.DefaultPromotionPublicationService.deliveryRoots = () => []; }],
    ['CONSENT', () => { campaign.sellerAuthorizations[0].status = 'REVOKED'; }],
]) test('private admission failure stage is original-error-only for ' + expected, async t => {
    generatedCouponReads(t, name => [name === 'coupon' ? coupon : batch]); change();
    const input = await merchant.staff(employee({ couponToken: 'CUSTOMER-CODE' }));
    await assert.rejects(bridge.admit(input, { token: 'CUSTOMER-CODE' }), error => {
        assert.equal(bridge.admissionFailureStage(error), expected);
        assert.equal(bridge.admissionFailureStage({ ...error }), undefined);
        assert.equal(bridge.admissionFailureStage({ stage: expected, code: error.code }), undefined);
        assert.equal(error.stage, undefined); assert.equal(error.cause, undefined);
        assert.doesNotMatch(JSON.stringify(error), /CUSTOMER-CODE|not-plaintext|sellerAuthorizationProof|tokenHash/);
        return true;
    });
    assert.equal(bridge.admitted(input), false); assert.equal(writes, 0);
});

test('signed issuer staff completes exact vendor unit through existing claim, durable receipt and redeem coordination', async () => {
    const r = await validated(), original = clone(r);
    const result = await merchant.confirm(r);
    assert.equal(result.claimStatus, 'REDEEMED'); assert.equal(item.enterpriseCode, 'vendor'); assert.deepEqual(r, original);
    assert.equal(receipts.size, 1); assert.equal(receipts.values().next().value.enterpriseCode, 'vendor');
    const count = writes; await merchant.confirm(r); assert.equal(writes, count);
    assert.equal((await merchant.inspectReceipt(r)).state, 'COMPLETED');
    assert.doesNotMatch(JSON.stringify(result), /CUSTOMER-CODE|not-plaintext|buyer@example|sellerAuthorizationProof|tokenHash/);
    assert(profileHeaders.length > 5);
    assert(profileHeaders.every(value => value.Authorization === 'Bearer original-staff-token' && value['X-Enterprise-Code'] === 'issuer'));
});
test('explicit LOCAL ITEM simulation preserves private issuer admission, original encrypted stock and unverified receipt labels through actual merchant redemption', async () => {
    const previousNodics = global.NODICS;
    try {
        actualMerchantLifecycle();
        global.NODICS = { getSelectedEnvironmentName: () => 'fixtureNative' };
        const get = CONFIG.get;
        CONFIG.get = key => key === 'environment' ? { class: 'LOCAL' } : key === 'fulfillmentCore' ?
            { itemSimulation: { enabled: true, environmentAllowlist: ['fixtureNative'] } } :
            key === 'promotion' ? { ...get(key), merchantBenefits: { enabled: true, qualified: false,
                itemEvidenceMode: 'LOCAL_SIMULATION', itemEvidenceService: 'DefaultFulfillmentItemSimulationService' } } :
            key === 'digitalCore' ? { merchantRedemption: { enabled: true, storeScope: { enabled: true, qualified: true } } } : get(key);
        SERVICE.DefaultPromotionItemBenefitService = require('../src/service/defaultPromotionItemBenefitService');
        SERVICE.DefaultFulfillmentItemSimulationService = require('../../../../fulfillment/modules/fulfillmentCore/src/service/defaultFulfillmentItemSimulationService');
        SERVICE.DefaultFulfillmentItemDeliveryEvidenceService = require('../../../../fulfillment/modules/fulfillmentCore/src/service/defaultFulfillmentItemDeliveryEvidenceService');
        SERVICE.DefaultDigitalCommerceItemMerchantProviderService = require('../../../../digitalCommerce/modules/digitalCore/src/service/defaultDigitalCommerceItemMerchantProviderService');
        SERVICE.DefaultStoreContextService = { resolveMerchantStore: async () => ({ code: 'outlet', revision: 2 }) };
        const invoke = SERVICE.DefaultModuleService.invokeModule;
        SERVICE.DefaultModuleService.invokeModule = async r => {
            const response = await invoke(r);
            if (r.apiName === '/identity/scopes/me') response.data.scopes.push({ scopeType: 'STORE', scopeCode: 'outlet', enterpriseCode: 'issuer' });
            return response;
        };
        campaign.actions = { benefitType: 'ITEM', items: [{ sku: 'MENU_TEA', quantity: 1, unit: 'EACH' }] };
        campaign.conditions = { storeCodes: ['outlet'] };
        coupon.soldAt = new Date(Date.now() - 60000).toISOString();
        const protectedOriginal = clone(coupon.protectedToken);
        const input = { ...employee({ couponToken: 'CUSTOMER-CODE', merchantReceiptReference: 'SIM:original@outlet' }), storeCode: 'outlet' };
        const validation = await merchant.validate(input);
        assert.equal(validation.conditions.benefit.sourceStage, 'SIMULATED_ITEMS');
        assert.equal(validation.conditions.benefit.verified, false);
        assert.equal(validation.conditions.benefit.deliveredAt, undefined);
        const command = { ...input, payload: { confirmed: true, merchantReceiptReference: 'SIM:original@outlet',
            expectedRevision: validation.revision, validationCode: validation.validationCode, validationExpiresAt: validation.validationExpiresAt } };
        const result = await merchant.confirm(command);
        assert.equal(result.claimStatus, 'REDEEMED');
        assert.equal(result.simulated, true);
        assert.equal(result.deliveryVerified, false);
        assert.equal(result.merchantReceiptReference, 'SIM:original@outlet');
        assert.equal(coupon.enterpriseCode, 'vendor');
        assert.equal(command.enterpriseCode, 'issuer');
        assert.deepEqual(coupon.protectedToken, protectedOriginal);
        assert.equal(receipts.size, 1);
        assert.equal([...receipts.values()][0].evidence.pricedBenefit.verified, false);
        const count = writes;
        assert.equal((await merchant.confirm(command)).simulated, true);
        assert.equal(writes, count);
        assert.equal((await merchant.inspectReceipt(command)).deliveryVerified, false);
        assert.equal((await merchant.queue(command)).redemptions[0].simulated, true);
        assert(profileHeaders.every(value => value.Authorization === 'Bearer original-staff-token' && value['X-Enterprise-Code'] === 'issuer'));
        assert.doesNotMatch(JSON.stringify(result), /protectedToken|tokenHash|buyer@example/);
    } finally { global.NODICS = previousNodics; }
});
test('copied, changed and unadmitted requests cannot acquire private execution', async () => {
    const r = await merchant.staff(employee()); await bridge.admit(r, { entitlementCode: item.code });
    await assert.rejects(bridge.execute({ ...r }, 'entitlement'));
    r.authData.enterpriseCode = 'vendor'; await assert.rejects(bridge.execute(r, 'entitlement')); assert.equal(writes, 0);
    await assert.rejects(bridge.locateEntitlement(employee(), item.code));
});
for (const [name, change] of [
    ['foreign issuer', () => coupon.issuerEnterpriseRef = ref('other')],
    ['foreign vendor', () => coupon.vendorEnterpriseRef = ref('other')],
    ['changed protected member', () => coupon.protectedToken.ciphertext = 'changed'],
    ['wrong original grant', () => coupon.sellerAuthorizationProof.grantRevision = 2],
    ['revoked original grant', () => campaign.sellerAuthorizations[0].status = 'REVOKED'],
    ['regranted consent', () => campaign.sellerAuthorizations[0].revision = 2],
    ['expired consent', () => campaign.sellerAuthorizations[0].expiresAt = '2000-01-01T00:00:00Z'],
    ['foreign purchase buyer', () => item.ownerId = 'other'],
    ['foreign purchase order', () => item.orderCode = 'other'],
    ['missing installed persistence', () => persistenceReady = false],
    ['unqualified consent', () => qualified = false],
    ['fresh Profile denial', () => denial = true],
]) test('delegated merchant refuses ' + name + ' before writes', async () => {
    change(); await assert.rejects(merchant.validate(employee({ couponToken: 'CUSTOMER-CODE' }))); assert.equal(writes, 0);
});
test('fresh revoked consent after validation cannot persist an instruction or claim', async () => {
    const r = await validated(); campaign.sellerAuthorizations[0].status = 'REVOKED';
    await assert.rejects(merchant.confirm(r)); assert.equal(writes, 0);
});
test('exact original receipt is independently required before delegated redemption', async () => {
    const r = await validated(); await merchant.confirm(r); receipts.clear();
    await assert.rejects(merchant.confirm(r));
});
test('actual Promotion validation and lifecycle receive only the exact private issuer campaign while stock CAS stays vendor-owned', async () => {
    const get = CONFIG.get;
    CONFIG.get = key => key === 'promotion' ? { ...get(key), purchasedRights: { enabled: true, qualified: true } } : get(key);
    coupon.soldAt = new Date(Date.now() - 86400000);
    coupon.soldAt.setMilliseconds(123);
    coupon.validTo = new Date(coupon.soldAt.getTime() + 365 * 86400000);
    coupon.purchasePolicy = { version: 1, promotionCode: campaign.code, promotionRevision: campaign.revision,
        issuerEnterpriseRef: ref('issuer'), vendorEnterpriseRef: ref('vendor'), purchasedAt: coupon.soldAt.toISOString(),
        validityDays: 365, name: 'Original purchase rights', conditions: {}, actions: {}, terms: [] };
    item.purchasePolicy = clone(coupon.purchasePolicy);
    Object.assign(SERVICE.DefaultPromotionOperationService, {
        validateMerchantCoupon: operation.validateMerchantCoupon,
        claimPurchasedCouponCode: operation.claimPurchasedCouponCode,
        redeemClaimedCouponCode: operation.redeemClaimedCouponCode,
    });
    SERVICE.DefaultCouponService.update = async r => {
        assert.equal(r.authData.isSystem, true); assert.equal(r.query.enterpriseCode, 'vendor');
        assert.equal(r.query.code, coupon.code); assert.equal(r.query.revision, coupon.revision);
        coupon = { ...coupon, ...clone(r.model) }; writes++;
        return { code: 'SUC_UPDATE', result: { acknowledged: true, matchedCount: 1 } };
    };
    const r = await validated();
    await merchant.confirm(r);
    assert.equal(coupon.status, 'REDEEMED'); assert.equal(coupon.redeemedTargetType, 'POS');
    assert.equal(item.claimStatus, 'REDEEMED');
    assert.equal(await bridge.readPurchasedCampaign({ tenant: 'runtime', enterpriseCode: 'vendor' }, coupon), undefined);
});
test('issuer recovery queue revalidates every exact vendor purchase and returns only safe summaries', async () => {
    await merchant.confirm(await validated());
    const result = await merchant.queue(employee());
    assert.equal(result.redemptions.length, 1); assert.equal(result.redemptions[0].claimStatus, 'REDEEMED');
    assert.doesNotMatch(JSON.stringify(result), /buyer@example|protectedToken|tokenHash|sellerAuthorizationProof/);
    denial = true; assert.deepEqual(await merchant.queue(employee()), { redemptions: [] });
});
test('private child delegation cannot be forged by cloning a system-looking owner context', async () => {
    const fake = { tenant: 'runtime', enterpriseCode: 'vendor', authData: { isSystem: true } };
    assert.equal(bridge.evidenceEnterprise(fake, coupon), undefined);
    assert.equal(await bridge.readPurchasedCampaign(fake, coupon), undefined);
    assert.equal(bridge.forwardLifecycle(fake, { ...fake }, 'claim'), undefined);
});

/** Uses real Promotion lifecycle methods behind isolated exact vendor CAS, not successful lifecycle stubs. */
function actualMerchantLifecycle() {
    Object.assign(SERVICE.DefaultPromotionOperationService, {
        validateMerchantCoupon: operation.validateMerchantCoupon,
        claimPurchasedCouponCode: operation.claimPurchasedCouponCode,
        redeemClaimedCouponCode: operation.redeemClaimedCouponCode,
    });
    SERVICE.DefaultCouponService.update = async r => {
        assert.equal(r.authData.isSystem, true); assert.equal(r.query.enterpriseCode, 'vendor');
        assert.equal(r.query.code, coupon.code); assert.equal(r.query.revision, coupon.revision);
        coupon = { ...coupon, ...clone(r.model) }; writes++;
        return { code: 'SUC_UPDATE', result: { acknowledged: true, matchedCount: 1 } };
    };
}
test('actual secure write guards preserve encrypted issuance during confirmed claim and redemption', async () => {
    actualMerchantLifecycle();
    const saved = clone({ protectedToken: coupon.protectedToken, secureIssuanceCode: coupon.secureIssuanceCode });
    const update = SERVICE.DefaultCouponService.update;
    let guarded = 0;
    SERVICE.DefaultCouponService.update = async r => {
        seller.protectCoupon(r);
        secureOwner.protect(r);
        assert.equal(Object.hasOwn(r.query, 'protectedToken'), false);
        assert.equal(Object.hasOwn(r.query, 'sellerAuthorizationProof'), false);
        assert.doesNotMatch(JSON.stringify(r.model), /protectedToken|secureIssuance/);
        guarded++;
        return update(r);
    };
    assert.equal((await merchant.confirm(await validated())).claimStatus, 'REDEEMED');
    assert.equal(guarded, 2);
    assert.deepEqual({ protectedToken: coupon.protectedToken, secureIssuanceCode: coupon.secureIssuanceCode }, saved);
    const generic = { tenant: 'runtime', query: { code: coupon.code }, model: { status: 'ACTIVE' } };
    secureOwner.protect(generic);
    assert.deepEqual(generic.query.protectedToken, { $exists: false });
    assert.throws(() => secureOwner.protect({ query: {}, model: saved }));
});
test('lifecycle CAS cannot change or clear original encrypted issuance even through its owner helper', async () => {
    actualMerchantLifecycle();
    coupon.secureIssuance = { original: 'immutable-receipt' };
    for (const key of ['protectedToken', 'secureIssuance', 'secureIssuanceCode']) {
        for (const value of [undefined, null, 'replacement']) {
            await assert.rejects(operation.commitLifecycleCoupon(employee(), clone(coupon),
                { ...clone(coupon), [key]: value, revision: coupon.revision + 1 }),
                error => error.code === 'ERR_PROMOTION_SECURE_ISSUANCE_UNCONFIRMED');
        }
    }
    assert.equal(writes, 0);
});
test('private lifecycle snapshot verifies original retention through the secure reader while generic readback stays redacted', async () => {
    actualMerchantLifecycle();
    const owner = { tenant: 'runtime', enterpriseCode: 'vendor', authData: { isSystem: true } };
    const original = clone(coupon), update = SERVICE.DefaultCouponService.update;
    SERVICE.DefaultCouponService.update = async r => { seller.protectCoupon(r); secureOwner.protect(r); return update(r); };
    let genericReads = 0, privateReads = 0;
    SERVICE.DefaultCouponService.get = async r => {
        const response = { code: 'SUC_READ', result: equal(r.query, coupon) ? [clone(coupon)] : [], count: 1 };
        secureOwner.providerResult(r, { success: response }, { moduleName: 'promotion', schemaName: 'coupon' });
        if (response.result[0]?.protectedToken) privateReads++; else genericReads++;
        return response;
    };
    const result = await operation.commitLifecycleCoupon(owner, original,
        { ...clone(original), status: 'CLAIMED', revision: original.revision + 1 });
    assert.equal(result.status, 'CLAIMED');
    assert.equal(result.protectedToken, undefined); assert.equal(result.secureIssuanceCode, undefined);
    assert.equal(genericReads, 1); assert.equal(privateReads, 1);
    assert.deepEqual(coupon.protectedToken, original.protectedToken);
    assert.equal(coupon.secureIssuanceCode, original.secureIssuanceCode);
});

/** Prepares actual private read/write guards around an isolated coupon CAS for negative readback checks. @returns {Object} Original immutable snapshot, owner request and commit dispatch. */
function protectedLifecycleFixture() {
    actualMerchantLifecycle();
    coupon.secureIssuance = { original: 'immutable-receipt' };
    const owner = { tenant: 'runtime', enterpriseCode: 'vendor', authData: { isSystem: true } };
    const original = clone(coupon), update = SERVICE.DefaultCouponService.update;
    SERVICE.DefaultCouponService.update = async r => {
        seller.protectCoupon(r); secureOwner.protect(r); return update(r);
    };
    SERVICE.DefaultCouponService.get = async r => {
        assert.deepEqual(r.query, { tenant: 'runtime', code: original.code, enterpriseCode: 'vendor' });
        const response = { code: 'SUC_READ', result: equal(r.query, coupon) ? [clone(coupon)] : [], count: 1 };
        secureOwner.providerResult(r, { success: response }, { moduleName: 'promotion', schemaName: 'coupon' });
        return response;
    };
    return { original, commit: () => operation.commitLifecycleCoupon(owner, original,
        { ...clone(original), status: 'CLAIMED', revision: original.revision + 1 }) };
}

for (const missing of ['owner', 'read', 'privateOperation', 'noncallableRead', 'noncallablePrivateOperation']) {
    test('protected lifecycle preflight refuses ' + missing + ' before any coupon write', async () => {
        const f = protectedLifecycleFixture();
        if (missing === 'owner') delete SERVICE.DefaultCouponSecureIssuanceService;
        if (missing === 'read') delete SERVICE.DefaultCouponSecureIssuanceService.read;
        if (missing === 'privateOperation') delete SERVICE.DefaultCouponSecureIssuanceService.privateOperation;
        if (missing === 'noncallableRead') SERVICE.DefaultCouponSecureIssuanceService.read = true;
        if (missing === 'noncallablePrivateOperation') SERVICE.DefaultCouponSecureIssuanceService.privateOperation = true;
        await assert.rejects(f.commit());
        assert.equal(writes, 0); assert.deepEqual(coupon, f.original);
    });
}

for (const fault of ['error', 'missing', 'revision', 'tenant', 'protectedToken', 'secureIssuance', 'secureIssuanceCode']) {
    test('private protected lifecycle readback ' + fault + ' cannot confirm an already-written transition', async () => {
        const f = protectedLifecycleFixture(), get = SERVICE.DefaultCouponService.get;
        let reads = 0;
        SERVICE.DefaultCouponService.get = async r => {
            const response = await get(r);
            if (++reads !== 2) return response;
            assert.ok(response.result[0].protectedToken);
            if (fault === 'error') throw new Error('isolated private read failure');
            if (fault === 'missing') { response.result = []; response.count = 0; }
            if (fault === 'revision') response.result[0].revision++;
            if (fault === 'tenant') response.result[0].tenant = 'foreign';
            if (fault === 'protectedToken') response.result[0].protectedToken.ciphertext = 'drifted';
            if (fault === 'secureIssuance') response.result[0].secureIssuance.original = 'drifted';
            if (fault === 'secureIssuanceCode') response.result[0].secureIssuanceCode = 'another-batch';
            return response;
        };
        await assert.rejects(f.commit());
        assert.equal(reads, 2); assert.equal(writes, 1);
        assert.equal(coupon.status, 'CLAIMED'); assert.equal(coupon.revision, f.original.revision + 1);
        for (const key of ['protectedToken', 'secureIssuance', 'secureIssuanceCode']) assert.deepEqual(coupon[key], f.original[key]);
    });
}
function phaseRefusal(error) {
    return error.code === 'ERR_DIGITAL_MERCHANT_INVALID' && error.message === 'Confirmed fulfillment phase is required';
}
/** Builds otherwise valid original instruction/receipt arguments so missing private phase checks cannot hide behind malformed input. */
function originalWriteArguments(r, action) {
    const target = merchant.targetCode({ enterpriseCode: 'vendor' }, item);
    const marker = { code: target, receiptCode: 'RECEIPT_' + target, merchantCode: 'issuer', enterpriseRef: ref('issuer'),
        mode: 'MERCHANT_SCREEN', confirmationKey: r.idempotencyKey, confirmedBy: r.authData.loginId,
        confirmedAt: new Date().toISOString(), merchantReceiptReference: r.payload.merchantReceiptReference };
    if (action !== 'update') item.evidence.merchantRedemption = clone(marker);
    if (action === 'persistReceipt' || action === 'redeem') {
        coupon.status = 'CLAIMED'; coupon.claimTargetCode = target; coupon.claimTargetType = 'POS';
        item.claimStatus = 'CLAIMED'; item.evidence.claimTargetCode = target; item.evidence.claimTargetType = 'POS';
    }
    const model = merchant.merchantReceiptModel({ tenant: r.tenant, enterpriseCode: 'vendor' }, item, marker,
        { code: 'issuer', mode: 'MERCHANT_SCREEN' }, r.idempotencyKey);
    if (action === 'redeem') receipts.set(model.code, clone(model));
    return action === 'update' ? { item: clone(item), patch: { evidence: { ...item.evidence, merchantRedemption: marker } } } :
        action === 'persistReceipt' ? { model } : { item: clone(item) };
}

for (const confirmed of [false, true]) for (const action of ['update', 'claim', 'persistReceipt', 'redeem']) {
    test('read-admitted staff confirmed=' + confirmed + ' cannot authorize ' + action + ' or mint delegated action', async () => {
        actualMerchantLifecycle();
        let providerCalls = 0;
        SERVICE.DefaultDigitalCommerceMerchantScreenProviderService = { confirm: async () => { providerCalls++; throw Error('provider must not run'); } };
        const r = await merchant.staff(employee({ confirmed }));
        const args = originalWriteArguments(r, action);
        assert.equal(await bridge.admit(r, { entitlementCode: item.code }), true);
        assert.equal(bridge.admitted(r), true);
        const before = clone({ coupon, item, receipts: [...receipts] });
        await assert.rejects(bridge.execute(r, action, args), phaseRefusal);
        await assert.rejects(bridge.execute(r, action, args, { operation: action }), phaseRefusal);
        await assert.rejects(merchant.delegatedAction(r, action, args), phaseRefusal);
        assert.throws(() => merchant.resolveDelegatedAction({ operation: action }, r, action, args), phaseRefusal);
        assert.deepEqual({ coupon, item, receipts: [...receipts] }, before);
        assert.equal(writes, 0); assert.equal(providerCalls, 0);
    });
}

for (const action of ['update', 'claim', 'persistReceipt', 'redeem']) {
    test('later-layer non-true action guard refuses ' + action + ' before any write or provider call', async () => {
        actualMerchantLifecycle();
        let providerCalls = 0, guardCalls = 0;
        SERVICE.DefaultDigitalCommerceMerchantScreenProviderService = { confirm: async () => { providerCalls++; throw Error('provider must not run'); } };
        const r = await merchant.staff(employee()), args = originalWriteArguments(r, action);
        assert.equal(await bridge.admit(r, { entitlementCode: item.code }), true);
        const before = clone({ coupon, item, receipts: [...receipts] });
        for (const result of [false, undefined, 0, 'true', {}]) {
            SERVICE.DefaultDigitalCommerceMerchantService = { ...merchant, resolveDelegatedAction: () => { guardCalls++; return result; } };
            await assert.rejects(bridge.execute(r, action, args, { operation: action }),
                error => error.code === 'ERR_PROMOTION_SELLER_UNCONFIRMED');
        }
        assert.equal(guardCalls, 5); assert.equal(writes, 0); assert.equal(providerCalls, 0);
        assert.deepEqual({ coupon, item, receipts: [...receipts] }, before);
    });
}

test('delegated Digital reads and mutations stay inside the private capture owner through canonical confirmation', async () => {
    actualMerchantLifecycle();
    let depth = 0;
    const observed = new Set(), secure = SERVICE.DefaultCouponSecureIssuanceService;
    SERVICE.DefaultCouponSecureIssuanceService = { ...secure, privateOperation: function (r, action) {
        return secure.privateOperation.call(this, r, async () => {
            depth++;
            try { return await action(); } finally { depth--; }
        });
    } };
    for (const [name, methods] of [['DefaultDigitalEntitlementService', ['get', 'update']], ['DefaultDigitalDeliveryService', ['get', 'save']]]) {
        const owner = SERVICE[name];
        SERVICE[name] = { ...owner };
        for (const method of methods) SERVICE[name][method] = async function (...args) {
            assert.ok(depth > 0, name + '.' + method + ' must stay private');
            observed.add(name + '.' + method);
            return owner[method](...args);
        };
    }
    assert.equal((await merchant.confirm(await validated())).claimStatus, 'REDEEMED');
    assert.deepEqual([...observed].sort(), ['DefaultDigitalDeliveryService.get', 'DefaultDigitalDeliveryService.save',
        'DefaultDigitalEntitlementService.get', 'DefaultDigitalEntitlementService.update']);
    assert.equal(depth, 0);
});

test('canonical action authority is exact in-flight identity, expires after success and is not reused by terminal replay', async () => {
    actualMerchantLifecycle();
    let providerCalls = 0;
    SERVICE.DefaultDigitalCommerceMerchantScreenProviderService = { confirm: async (...args) => { providerCalls++; return provider.confirm(...args); } };
    const captured = [];
    SERVICE.DefaultPromotionMerchantScopeService = { ...bridge, execute: async function (r, action, args = {}, authorization) {
        if (['update', 'claim', 'persistReceipt', 'redeem'].includes(action)) {
            assert.equal(merchant.resolveDelegatedAction(authorization, r, action, args), true);
            const before = writes;
            assert.throws(() => merchant.resolveDelegatedAction({ ...authorization }, r, action, args), phaseRefusal);
            assert.throws(() => merchant.resolveDelegatedAction(authorization, { ...r }, action, args), phaseRefusal);
            assert.throws(() => merchant.resolveDelegatedAction(authorization, r, action === 'claim' ? 'redeem' : 'claim', args), phaseRefusal);
            assert.throws(() => merchant.resolveDelegatedAction(authorization, r, action, { ...args, injected: true }), phaseRefusal);
            await assert.rejects(bridge.execute(r, action, args, { ...authorization }), phaseRefusal);
            assert.equal(writes, before);
            captured.push({ r, action, args: clone(args), authorization });
        }
        return bridge.execute.call(this, r, action, args, authorization);
    } };
    const input = await validated();
    assert.equal((await merchant.confirm(input)).claimStatus, 'REDEEMED');
    assert.deepEqual(captured.map(value => value.action), ['update', 'claim', 'persistReceipt', 'redeem']);
    assert.equal(providerCalls, 1);
    const before = writes;
    for (const value of captured) {
        assert.throws(() => merchant.resolveDelegatedAction(value.authorization, value.r, value.action, value.args), phaseRefusal);
        await assert.rejects(bridge.execute(value.r, value.action, value.args, value.authorization), phaseRefusal);
        await assert.rejects(merchant.delegatedAction(value.r, value.action, value.args), phaseRefusal);
    }
    assert.equal(writes, before);
    assert.equal((await merchant.confirm(input)).claimStatus, 'REDEEMED');
    assert.equal(writes, before); assert.equal(providerCalls, 1); assert.equal(captured.length, 4);
});

for (const failingAction of ['update', 'claim', 'persistReceipt', 'redeem']) {
    test('private ' + failingAction + ' authority is cleaned after owner failure; original confirmation remains recoverable', async () => {
        actualMerchantLifecycle();
        let providerCalls = 0, held;
        SERVICE.DefaultDigitalCommerceMerchantScreenProviderService = { confirm: async (...args) => { providerCalls++; return provider.confirm(...args); } };
        SERVICE.DefaultPromotionMerchantScopeService = { ...bridge, execute: async function (r, action, args = {}, authorization) {
            if (action === failingAction) {
                assert.equal(merchant.resolveDelegatedAction(authorization, r, action, args), true);
                held = { r, action, args: clone(args), authorization };
                throw Error('isolated ' + action + ' failure');
            }
            return bridge.execute.call(this, r, action, args, authorization);
        } };
        const input = await validated();
        await assert.rejects(merchant.confirm(input), new RegExp('isolated ' + failingAction + ' failure'));
        assert.ok(held);
        const before = writes, providersBefore = providerCalls;
        assert.throws(() => merchant.resolveDelegatedAction(held.authorization, held.r, held.action, held.args), phaseRefusal);
        await assert.rejects(bridge.execute(held.r, held.action, held.args, held.authorization), phaseRefusal);
        await assert.rejects(merchant.delegatedAction(held.r, held.action, held.args), phaseRefusal);
        assert.equal(writes, before); assert.equal(providerCalls, providersBefore);
        assert.notEqual(coupon.status, 'REDEEMED'); assert.notEqual(item.claimStatus, 'REDEEMED');
        SERVICE.DefaultPromotionMerchantScopeService = bridge;
        assert.equal((await merchant.confirm(input)).claimStatus, 'REDEEMED');
        assert.equal(providerCalls, failingAction === 'persistReceipt' ? 2 : 1,
            'only a missing durable receipt can require the provider original-key retry');
        assert.equal(receipts.size, 1);
    });
}

/** Selects isolated monetary evidence ports while exercising real merchant, benefit, coupon and private handoff owners. */
function monetaryFixture() {
    const benefitOwner = require('../src/service/defaultPromotionMerchantBenefitService');
    const pricedProvider = require('../../../../digitalCommerce/modules/digitalCore/src/service/defaultDigitalCommercePricedMerchantProviderService');
    const get = CONFIG.get;
    CONFIG.get = key => key === 'promotion' ? { ...get(key), merchantBenefits: { enabled: true, qualified: true, evidenceService: 'TestPricedEvidence' } } :
        key === 'digitalCore' ? { merchantRedemption: { enabled: true, storeScope: { enabled: true, qualified: true }, pricedProvider: { qualified: true } } } : get(key);
    campaign.actions = { discountType: 'FIXED', discountAmount: '25' };
    coupon.soldAt = new Date(Date.now() - 86400000); coupon.validTo = new Date(Date.now() + 86400000);
    coupon.idempotencyKey = 'original:purchase';
    SERVICE.DefaultPromotionMerchantBenefitService = benefitOwner;
    SERVICE.DefaultExactAmountService = require('../../pricing/src/service/defaultExactAmountService');
    SERVICE.DefaultStoreContextService = { resolveMerchantStore: async () => ({ code: 'outlet', revision: 1 }) };
    SERVICE.DefaultDigitalCommercePricedMerchantProviderService = pricedProvider;
    const invoke = SERVICE.DefaultModuleService.invokeModule;
    SERVICE.DefaultModuleService.invokeModule = async r => {
        const result = await invoke(r);
        if (r.apiName === '/identity/scopes/me') result.data.scopes.push({ scopeType: 'STORE', scopeCode: 'outlet', enterpriseCode: 'issuer' });
        return result;
    };
    SERVICE.TestPricedEvidence = { evaluate: async r => {
        assert.equal(r.enterpriseCode, 'issuer');
        return { ...r, eligible: true, verified: true, sourceType: 'PRICED_TRANSACTION', sourceStage: 'PRICED_CART',
            sourceReference: r.merchantReceiptReference, sourceHash: 'c'.repeat(64), sourceRevision: 1, storeRevision: 1,
            currency: 'AED', subtotalAmount: '100', discountAmount: '25' };
    } };
    Object.assign(SERVICE.DefaultPromotionOperationService, {
        validateMerchantCoupon: operation.validateMerchantCoupon,
        claimPurchasedCouponCode: operation.claimPurchasedCouponCode,
        redeemClaimedCouponCode: operation.redeemClaimedCouponCode,
    });
    SERVICE.DefaultCouponService.update = async r => {
        assert.equal(r.query.enterpriseCode, 'vendor'); assert.equal(r.query.revision, coupon.revision);
        coupon = { ...coupon, ...clone(r.model) }; writes++;
        return { code: 'SUC_UPDATE', result: { acknowledged: true, matchedCount: 1 } };
    };
    return employee({ storeCode: 'outlet', merchantReceiptReference: 'CART:basket', benefit: { discountAmount: '999' } });
}
test('monetary redemption dispatches original issuer budget handoff only after durable receipt and before vendor coupon redemption', async () => {
    const input = monetaryFixture(), validation = await merchant.validate({ ...input, payload: { ...input.payload, couponToken: 'CUSTOMER-CODE' } });
    const r = { ...input, payload: { ...input.payload, expectedRevision: validation.revision,
        validationCode: validation.validationCode, validationExpiresAt: validation.validationExpiresAt } };
    let held, calls = 0;
    SERVICE.DefaultPromotionCouponBudgetService = { consume: async command => {
        held = command; calls++;
        const value = await bridge.resolveBudgetRequest(command, 'COMMIT');
        assert.equal(coupon.status, 'CLAIMED'); assert.equal(receipts.size, 1);
        assert.equal(value.request.enterpriseCode, 'issuer'); assert.equal(value.request.authData.enterpriseCode, 'issuer');
        assert.equal(value.request.authorization, input.authorization); assert.equal(value.vendorEnterpriseCode, 'vendor');
        assert.equal(value.distributionStoreCode, 'catalogue'); assert.equal(value.storeCode, 'outlet');
        assert.deepEqual(value.benefit, { amount: '25', currency: 'AED', sourceReference: 'CART:basket' });
        await assert.rejects(bridge.resolveBudgetRequest({ ...command }, 'COMMIT'));
        await assert.rejects(bridge.resolveBudgetRequest(command, 'RELEASE'));
        return { receiptCode: 'original-budget-receipt' };
    } };
    assert.equal((await merchant.confirm(r)).claimStatus, 'REDEEMED'); assert.equal(calls, 1);
    await assert.rejects(bridge.resolveBudgetRequest(held, 'COMMIT'));
    await merchant.confirm(r); assert.equal(calls, 1);
});
test('budget refusal keeps original receipt and claimed unit recoverable without redeeming or repeating provider effects', async () => {
    const input = monetaryFixture(), validation = await merchant.validate({ ...input, payload: { ...input.payload, couponToken: 'CUSTOMER-CODE' } });
    const r = { ...input, payload: { ...input.payload, expectedRevision: validation.revision,
        validationCode: validation.validationCode, validationExpiresAt: validation.validationExpiresAt } };
    SERVICE.DefaultPromotionCouponBudgetService = { consume: async () => { throw Error('budget unavailable'); } };
    await assert.rejects(merchant.confirm(r), /budget unavailable/);
    assert.equal(item.claimStatus, 'CLAIMED'); assert.equal(coupon.status, 'CLAIMED'); assert.equal(receipts.size, 1);
    SERVICE.DefaultDigitalCommercePricedMerchantProviderService = { confirm: async () => { throw Error('must not repeat provider'); } };
    SERVICE.DefaultPromotionCouponBudgetService = { consume: async command => { await bridge.resolveBudgetRequest(command, 'COMMIT'); } };
    assert.equal((await merchant.confirm(r)).claimStatus, 'REDEEMED');
});
