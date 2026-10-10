/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
'use strict';
/** @module promotion/test/promotionUsedBenefitReversalDisabledContract @description Verifies disabled used-benefit reversal at the actual private merchant boundary and preserves unused purchase revocation with isolated persistence ports. @layer test @owner promotion */
const test = require('node:test'), assert = require('node:assert/strict'), crypto = require('node:crypto');
const bridge = require('../src/service/defaultPromotionMerchantScopeService');
const receiver = require('../src/service/defaultPromotionCouponBudgetService');
const secure = require('../src/service/defaultCouponSecureIssuanceService');
const seller = require('../src/service/defaultCouponSellerAuthorizationService');
const sellerPolicy = require('../src/service/defaultPromotionSellerPolicyService');
const operation = require('../src/service/defaultPromotionOperationService');
const digital = require('../../../../digitalCommerce/modules/digitalCore/src/service/defaultDigitalCommerceEntitlementService');
const clone = value => structuredClone(value);
const fingerprint = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const ref = code => ({ moduleName: 'profile', schemaName: 'enterprise', code });
const denied = error => error.code === 'ERR_PROMOTION_SELLER_UNCONFIRMED';
const equal = (query, row) => Object.entries(query).every(([key, value]) => row[key] === value);
let coupon, item, staff, receipt, counts;

// Digital and installed persistence are explicit isolated ports. MerchantScope,
// its private command lifetime, secure reads, stock binding and consent are real.
test.beforeEach(() => {
    counts = { digital: 0, writes: 0, budget: 0, receipts: 0, identity: 0 };
    const proof = { issuerEnterpriseCode: 'issuer', sellerEnterpriseCode: 'vendor', promotionCode: 'promotion', grantRevision: 1 };
    coupon = { tenant: 'runtime', enterpriseCode: 'vendor', code: 'batch:1', batchCode: 'batch', promotionCode: 'promotion',
        issuerEnterpriseRef: ref('issuer'), vendorEnterpriseRef: ref('vendor'), enterpriseRef: ref('vendor'),
        soldTo: 'buyer@example.test', productCode: 'product', orderCode: 'order', status: 'REDEEMED', revision: 3,
        tokenHash: 'd'.repeat(64), secureIssuanceCode: 'batch', protectedToken: { ciphertext: 'immutable' }, sellerAuthorizationProof: proof };
    const batch = { tenant: 'runtime', enterpriseCode: 'vendor', code: 'batch', promotionCode: 'promotion', issuedCount: 1,
        issuerEnterpriseRef: ref('issuer'), vendorEnterpriseRef: ref('vendor'), enterpriseRef: ref('vendor'),
        secureIssuance: { createdAt: '2026-10-01T00:00:00Z', command: { tenant: 'runtime', enterpriseCode: 'issuer',
            promotionCode: 'promotion', batchCode: 'batch', storeCode: 'catalogue', rootCode: 'root',
            policyFingerprint: 'a'.repeat(64), actorId: 'issuer-admin', commandReference: 'issuance:1', quantity: 1,
            contribution: { moduleName: 'circa', releaseCode: 'sample-v001', version: 'v001', checksum: 'b'.repeat(64) },
            issuanceAuthority: { issuerEnterpriseRef: ref('issuer'), vendorEnterpriseRef: ref('vendor'), sellerAuthorizationProof: proof } },
            units: [{ code: coupon.code, tokenHash: coupon.tokenHash, protectedFingerprint: fingerprint(coupon.protectedToken) }] } };
    const campaign = { tenant: 'runtime', enterpriseCode: 'issuer', code: 'promotion', active: true, status: 'ACTIVE',
        issuerEnterpriseRef: ref('issuer'), vendorEnterpriseRef: ref('vendor'), revision: 2,
        sellerAuthorizations: [{ issuerEnterpriseCode: 'issuer', sellerEnterpriseCode: 'vendor', status: 'ACTIVE',
            revision: 1, expiresAt: '2099-01-01T00:00:00Z', benefitConsumption: 'ISSUED_COUPON_BENEFIT_V1' }] };
    staff = { tenant: 'runtime', code: 'entitlement', enterpriseCode: 'issuer', authorization: 'Bearer original-staff',
        authData: { tenant: 'runtime', enterpriseCode: 'issuer', principalType: 'human', tokenType: 'access', loginId: 'employee' },
        idempotencyKey: 'original:confirm', payload: { merchantReceiptReference: 'CART:original' } };
    const benefit = { benefitType: 'MONETARY', discountAmount: '25', currency: 'AED', sourceReference: 'CART:original' };
    const marker = { code: 'original:benefit', merchantCode: 'issuer', confirmationKey: staff.idempotencyKey,
        storeRef: { code: 'outlet' }, storeRevision: 1, mode: 'MERCHANT_SCREEN',
        merchantReceiptReference: 'CART:original', pricedBenefit: benefit, pricedBinding: fingerprint(benefit) };
    item = { tenant: 'runtime', enterpriseCode: 'vendor', code: 'entitlement', providerOwner: 'promotion', providerCode: coupon.code,
        ownerId: coupon.soldTo, productCode: coupon.productCode, orderCode: coupon.orderCode, claimStatus: 'REDEEMED',
        evidence: { merchantRedemption: marker, claimTargetCode: marker.code, claimTargetType: 'POS' } };
    receipt = { code: 'RECEIPT_original:benefit', tenant: 'runtime', enterpriseCode: 'vendor', benefit: clone(benefit) };
    const success = rows => ({ code: 'SUC_READ', result: clone(rows), count: rows.length });
    global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
    global.CONFIG = { get: key => key === 'runtimeRole' ? 'COMMERCE' : key === 'promotion' ?
        { sellerAuthorization: { enabled: true, qualified: true, maximumSellers: 100 } } : {} };
    global.SERVICE = {
        DefaultPromotionMerchantScopeService: bridge, DefaultPromotionCouponBudgetService: receiver,
        DefaultPromotionOperationService: operation, DefaultCouponSellerAuthorizationService: seller,
        DefaultPromotionSellerPolicyService: sellerPolicy,
        DefaultIdentityGovernanceService: { getSystemAuthData: () => { counts.identity++; return { isSystem: true, principalType: 'service' }; } },
        DefaultLoggerService: { isRequestPrivacyQualified: () => true, hasPrivateCaptureProtection: () => true,
            runSensitiveOperation: async (_r, action) => action() },
        DefaultModuleService: { invokeModule: async r => ({ result: [{ code: r.requestBody.codes?.[0] || r.requestBody.query.code, active: true }] }) },
        DefaultCouponSecureIssuanceService: { ...secure, persistence: async () => {} },
        DefaultPromotionPublicationService: { fingerprint, deliveryEnabled: () => true, deliveryRoots: () => ['root'] },
        DefaultPromotionService: { get: async () => success([campaign]) },
        DefaultCouponService: { get: async r => success(equal(r.query, coupon) ? [coupon] : []), update: async r => {
            seller.protectCoupon(r); secure.protect(r);
            assert.equal(equal(r.query, coupon), true);
            assert.equal(r.query.enterpriseCode, 'vendor');
            coupon = { ...coupon, ...clone(r.model) }; counts.writes++;
            return { code: 'SUC_UPDATE', result: { acknowledged: true, matchedCount: 1 } };
        } },
        DefaultCouponBatchService: { get: async r => success(equal(r.query, batch) ? [batch] : []) },
        DefaultDigitalEntitlementService: { get: async r => success(equal(r.query, item) ? [item] : []) },
        DefaultDigitalCommerceEntitlementService: { listEntitlements: async () => [clone(item)],
            redeem: async () => { counts.digital++; return { claimStatus: 'REDEEMED' }; } },
        DefaultDigitalCommerceMerchantService: {
            staff: async r => { assert.equal(r.authorization, staff.authorization); assert.equal(r.enterpriseCode, 'issuer'); return r; },
            withStore: async () => ({ enterpriseCode: 'issuer', store: { code: 'outlet', revision: 1 } }), scoped: () => true,
            assertEntitlement: (r, row) => { assert.equal(r.enterpriseCode, 'vendor'); assert.equal(row.code, item.code); },
            resolveDelegatedAction: (command, r, action) => command === phase && r === staff && action === 'redeem',
            merchantReceiptModel: () => clone(receipt), readMerchantReceipt: async (_r, model) => {
                assert.deepEqual(model, receipt); counts.receipts++; return clone(receipt);
            }, pricedBinding: value => fingerprint(value),
        },
        DefaultPromotionBudgetMutationService: { mutateCoupon: async () => { counts.budget++; throw Error('must not reach budget persistence'); } },
    };
});
const phase = Object.freeze({ testOnlyDigitalPhase: true });
async function admitted() {
    assert.equal(await bridge.admit(staff, { entitlementCode: item.code }), true);
    return clone(staff);
}
async function assertReleaseRefused(command) {
    const before = clone(counts);
    await assert.rejects(bridge.resolveBudgetRequest(command, 'RELEASE'), denied);
    await assert.rejects(receiver.release(command), denied);
    assert.deepEqual(counts, before, 'refusal precedes owner reads, identity creation and accounting writes');
}

for (const [name, command] of [
    ['empty command', {}],
    ['plausible original inverse', { operationCode: 'original:benefit', originalOperationCode: 'original:benefit', reversalCode: 'refund:1' }],
    ['copied owner-looking evidence', { request: { enterpriseCode: 'issuer', authData: { isSystem: true } }, couponCode: 'batch:1',
        originalOperationCode: 'original:benefit', reversalCode: 'refund:1', receiptCode: 'original-budget-receipt',
        benefit: { amount: '25', currency: 'AED', sourceReference: 'CART:original' }, benefitConsumption: 'ISSUED_COUPON_BENEFIT_V1' }],
]) test('actual private owner refuses RELEASE with ' + name, async () => {
    await admitted(); await assertReleaseRefused(clone(command));
});

test('live genuine COMMIT identity, detached copy and retained command never authorize RELEASE', async () => {
    const original = await admitted(); let held, commits = 0;
    SERVICE.DefaultPromotionCouponBudgetService = { consume: async command => {
        held = command; commits++;
        const evidence = await bridge.resolveBudgetRequest(command, 'COMMIT');
        assert.equal(evidence.request.enterpriseCode, 'issuer'); assert.equal(evidence.vendorEnterpriseCode, 'vendor');
        assert.deepEqual(evidence.benefit, { amount: '25', currency: 'AED', sourceReference: 'CART:original' });
        await Promise.all([assertReleaseRefused(command), assertReleaseRefused(clone(command)), assertReleaseRefused(command)]);
        assert.deepEqual(await bridge.resolveBudgetRequest(command, 'COMMIT'), evidence,
            'refused concurrent inverses do not change the original COMMIT authority');
        await assert.rejects(bridge.resolveBudgetRequest(clone(command), 'COMMIT'), denied);
    } };
    assert.equal((await bridge.execute(staff, 'redeem', {}, phase)).claimStatus, 'REDEEMED');
    assert.equal(commits, 1); assert.equal(counts.digital, 1); assert.equal(counts.budget, 0);
    assert(counts.receipts > 0, 'positive handoff rechecks durable original merchant receipt');
    await assertReleaseRefused(held);
    await assert.rejects(bridge.resolveBudgetRequest(held, 'COMMIT'), denied);
    assert.deepEqual(staff, original, 'signed issuer identity is not rewritten');
});

test('failed COMMIT dispatch cleans its command without automatic RELEASE or redemption', async () => {
    await admitted(); let held;
    SERVICE.DefaultPromotionCouponBudgetService = { consume: async command => {
        held = command;
        await bridge.resolveBudgetRequest(command, 'COMMIT');
        await assertReleaseRefused(command);
        throw Error('isolated lost acknowledgement');
    }, release: () => { assert.fail('no automatic used-benefit reversal'); } };
    await assert.rejects(bridge.execute(staff, 'redeem', {}, phase), /isolated lost acknowledgement/);
    await assertReleaseRefused(held);
    await assert.rejects(bridge.resolveBudgetRequest(held, 'COMMIT'), denied);
    assert.equal(counts.digital, 0); assert.equal(counts.budget, 0); assert.equal(counts.writes, 0);
});

for (const action of ['release', 'reverse', 'refund']) test('admitted staff cannot dispatch arbitrary ' + action, async () => {
    await admitted(); const original = clone(coupon);
    await assert.rejects(bridge.execute(staff, action, { originalOperationCode: 'original:benefit', reversalCode: 'refund:1' }), denied);
    assert.deepEqual(coupon, original);
    assert.equal(counts.digital, 0); assert.equal(counts.budget, 0); assert.equal(counts.writes, 0);
});

function refundRequest(extra = {}) {
    return { tenant: 'runtime', enterpriseCode: 'vendor', couponCode: coupon.code, ownerId: coupon.soldTo,
        orderCode: coupon.orderCode, refundCode: 'approved:refund', ...extra };
}
test('unused purchase refund still locks, completes and replays through actual Promotion lifecycle without budget RELEASE', async () => {
    coupon.status = 'DELIVERED'; coupon.benefitStatus = 'UNCLAIMED';
    SERVICE.DefaultPromotionCouponBudgetService = { release: () => assert.fail('unused refunds do not release benefit spend') };
    assert.deepEqual(await operation.revokePurchasedCoupon(refundRequest()), { code: coupon.code, status: 'REFUND_PENDING' });
    const pendingWrites = counts.writes;
    await operation.revokePurchasedCoupon(refundRequest()); assert.equal(counts.writes, pendingWrites);
    assert.deepEqual(await operation.revokePurchasedCoupon(refundRequest({ complete: true })), { code: coupon.code, status: 'REVOKED' });
    const completeWrites = counts.writes;
    await operation.revokePurchasedCoupon(refundRequest({ complete: true })); assert.equal(counts.writes, completeWrites);
    await assert.rejects(operation.revokePurchasedCoupon(refundRequest({ refundCode: 'other:refund' })), /another refund/);
    assert.equal(completeWrites, 2); assert.equal(counts.budget, 0);
});
for (const [status, benefitStatus] of [['CLAIMED', 'CLAIMED'], ['REDEEMED', 'REDEEMED'], ['DELIVERED', 'REDEEMED']]) {
    test('existing refund refuses used/claimed coupon ' + status + '/' + benefitStatus, async () => {
        coupon.status = status; coupon.benefitStatus = benefitStatus;
        await assert.rejects(operation.revokePurchasedCoupon(refundRequest()), /used or claimed coupon requires manual resolution/);
        assert.equal(counts.writes, 0); assert.equal(counts.budget, 0);
    });
}
test('actual Digital refund policy retains unused eligibility, snapshot window, used manual review and physical-return refusal', () => {
    assert.deepEqual(digital.revocationPolicy({ claimStatus: 'UNCLAIMED' }, 'REFUND'),
        { policyDecision: 'REVOKE_AND_REFUND', refundable: true, reasonCode: 'DIGITAL_COUPON_UNCLAIMED' });
    for (const claimStatus of ['CLAIMED', 'REDEEMED']) {
        const result = digital.revocationPolicy({ claimStatus }, 'REFUND');
        assert.equal(result.policyDecision, 'MANUAL_REVIEW'); assert.equal(result.refundable, false);
        assert.equal(result.reasonCode, 'DIGITAL_COUPON_' + (claimStatus === 'REDEEMED' ? 'ALREADY_REDEEMED' : 'CLAIMED'));
    }
    assert.equal(digital.revocationPolicy({ claimStatus: 'UNCLAIMED' }, 'RETURN').policyDecision, 'BLOCKED');
    const policy = { claimStatus: 'UNCLAIMED', purchasedAt: new Date().toISOString(), validTo: new Date(Date.now() + 86400000).toISOString(),
        purchasePolicy: { refundPolicy: { windowHours: 1, requestTypes: ['REFUND'] } } };
    assert.equal(digital.revocationPolicy(policy, 'REFUND').refundable, true);
    policy.purchasedAt = new Date(Date.now() - 7200000).toISOString();
    assert.equal(digital.revocationPolicy(policy, 'REFUND').refundable, false);
});
