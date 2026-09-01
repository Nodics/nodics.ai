/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module wasteCore/test/wasteAssetCouponRedemptionContract @description Verifies Waste coupon redemption emits external settlement and entitlement intents without owning coupon or wallet state. @layer test @owner wasteCore */
const assert = require('assert');
const service = require('../src/service/defaultWasteAssetCouponRedemptionService');

const ownerRef = { module: 'profile', schema: 'customer', code: 'customer-owner' };
const enterpriseRef = { module: 'profile', schema: 'enterprise', code: 'enterprise-default' };
const couponListingRef = { module: 'promotion', schema: 'couponListing', code: 'coupon-listing-001' };
const couponEntitlementRef = { module: 'promotion', schema: 'couponEntitlement', code: 'coupon-entitlement-001' };
const redemptionPolicy = {
    code: 'EWASTE_COUPON_REDEMPTION_STANDARD',
    eligibleAssetStatuses: ['OWNED', 'GIFTED'],
    rewardDebitMode: 'FULL_ELIGIBLE_BALANCE',
    rewardReserveRequired: true,
    carbonReceiverMode: 'DEFAULT_ENTERPRISE',
    carbonTransferQuantityMode: 'PROPORTIONAL_TO_REWARD_COST',
    defaultCarbonReceiverRef: enterpriseRef,
    rewardSettlementPolicyCode: 'EWASTE_COUPON_REWARD_DEBIT',
    carbonSettlementPolicyCode: 'EWASTE_COUPON_CARBON_TO_DEFAULT_ENTERPRISE',
    entitlementMode: 'CUSTOMER_OWNED'
};
const transferPolicy = {
    code: 'EWASTE_REDEMPTION_TRANSFER_STANDARD',
    transferType: 'REDEEM',
    ownershipTransferMode: 'RETAIN_CURRENT_OWNER',
    rewardTransferMode: 'CONSUME',
    carbonTransferMode: 'TRANSFER_TO_DEFAULT_ENTERPRISE',
    allowSelfTransfer: true,
    cancellationAssetStatus: 'OWNED',
    reversalAssetStatus: 'OWNED'
};

function ownedAsset() {
    return {
        code: 'WASTE_ASSET_SUB_003',
        assetTypeCode: 'EWASTE_MOBILE_DEVICE_ASSET',
        sourceSubmissionCode: 'sub-003',
        ownerRef: ownerRef,
        originalOwnerRef: ownerRef,
        assetStatus: 'OWNED',
        custodyStatus: 'CUSTOMER_HELD',
        evidenceRefs: [{ module: 'media', schema: 'mediaAsset', code: 'photo-003' }],
        rewardSettlementRefs: [{ module: 'wallet', schema: 'rewardSettlementIntent', code: 'reward-approved-003' }],
        carbonSettlementRefs: [{ module: 'wallet', schema: 'carbonSettlementIntent', code: 'carbon-approved-003' }],
        revision: 1
    };
}

function assertNoOwnedStateLeakage(value) {
    if (!value || typeof value !== 'object') return;
    Object.keys(value).forEach(function (key) {
        assert(!['couponCode', 'couponToken', 'couponSecret', 'walletBalance', 'ledgerEntry', 'ledgerEntries', 'paymentAmount', 'price', 'bidRules'].includes(key), key + ' must stay outside Waste coupon redemption contracts');
        assertNoOwnedStateLeakage(value[key]);
    });
}

const requested = service.requestRedemption({
    asset: ownedAsset(),
    ownerRef: ownerRef,
    couponListingRef: couponListingRef,
    redemptionPolicy: redemptionPolicy,
    transferPolicy: transferPolicy,
    now: new Date('2026-09-01T15:00:00.000Z'),
    correlationId: 'corr-coupon-001',
    idempotencyKey: 'coupon-redemption-001'
});

assert.strictEqual(requested.idempotent, false);
assert.strictEqual(requested.asset.assetStatus, 'REDEMPTION_PENDING');
assert.strictEqual(requested.ownershipEvent.transferType, 'REDEEM');
assert.strictEqual(requested.ownershipEvent.transferStatus, 'RESERVED');
assert.strictEqual(requested.ownershipEvent.fromOwnerRef.code, 'customer-owner');
assert.strictEqual(requested.ownershipEvent.toOwnerRef.code, 'customer-owner');
assert.strictEqual(requested.settlementReferences.reward[0].settlementMode, 'DEBIT_FULL_ELIGIBLE');
assert.strictEqual(requested.settlementReferences.reward[0].rewardDebitMode, 'FULL_ELIGIBLE_BALANCE');
assert.strictEqual(requested.settlementReferences.reward[0].rewardReserveRequired, true);
assert.strictEqual(requested.settlementReferences.carbon[0].settlementMode, 'TRANSFER_TO_DEFAULT_ENTERPRISE');
assert.strictEqual(requested.settlementReferences.carbon[0].toOwnerRef.code, 'enterprise-default');
assert.strictEqual(requested.settlementReferences.carbon[0].carbonReceiverMode, 'DEFAULT_ENTERPRISE');
assert.strictEqual(requested.couponEntitlementRequest.module, 'promotion');
assert.strictEqual(requested.couponEntitlementRequest.schema, 'couponEntitlementRequest');
assert.strictEqual(requested.couponEntitlementRequest.entitlementMode, 'CUSTOMER_OWNED');
assert.strictEqual(requested.couponEntitlementRequest.ownerRef.code, 'customer-owner');
assert.strictEqual(requested.couponEntitlementRequest.couponListingRef.code, 'coupon-listing-001');
assert(requested.domainEvents.some(function (event) { return event.eventType === 'waste.asset.couponRedemption.requested'; }));
assert(requested.domainEvents.some(function (event) { return event.eventType === 'waste.asset.settlement.requested'; }));
assert(requested.domainEvents.some(function (event) { return event.eventType === 'waste.asset.couponEntitlement.requested'; }));

const completed = service.completeRedemption({
    asset: requested.asset,
    ownerRef: ownerRef,
    redemptionPolicy: redemptionPolicy,
    transferPolicy: transferPolicy,
    existingRedemptionEvent: requested.ownershipEvent,
    couponEntitlementRef: couponEntitlementRef,
    now: new Date('2026-09-01T15:05:00.000Z'),
    correlationId: 'corr-coupon-002',
    idempotencyKey: 'coupon-redemption-001-complete'
});

assert.strictEqual(completed.asset.assetStatus, 'REDEEMED');
assert.strictEqual(completed.asset.ownerRef.code, 'customer-owner');
assert.strictEqual(completed.asset.couponEntitlementRefs[0].code, 'coupon-entitlement-001');
assert.strictEqual(completed.ownershipEvent.transferStatus, 'COMPLETED');
assert.strictEqual(completed.ownershipEvent.couponEntitlementRef.code, 'coupon-entitlement-001');
assert.deepStrictEqual(completed.ownershipEvent.rewardSettlementRefs, requested.ownershipEvent.rewardSettlementRefs);
assert.deepStrictEqual(completed.ownershipEvent.carbonSettlementRefs, requested.ownershipEvent.carbonSettlementRefs);
assert(completed.domainEvents.some(function (event) { return event.eventType === 'waste.asset.couponRedemption.completed'; }));

const cancelled = service.cancelRedemption({
    asset: requested.asset,
    redemptionPolicy: redemptionPolicy,
    transferPolicy: transferPolicy,
    existingRedemptionEvent: requested.ownershipEvent,
    now: new Date('2026-09-01T15:10:00.000Z'),
    correlationId: 'corr-coupon-003',
    idempotencyKey: 'coupon-redemption-001-cancel'
});

assert.strictEqual(cancelled.asset.assetStatus, 'OWNED');
assert.strictEqual(cancelled.ownershipEvent.transferStatus, 'CANCELLED');
assert(cancelled.domainEvents.some(function (event) { return event.eventType === 'waste.asset.couponRedemption.cancelled'; }));

const idempotent = service.requestRedemption({
    asset: requested.asset,
    ownerRef: ownerRef,
    couponListingRef: couponListingRef,
    redemptionPolicy: redemptionPolicy,
    transferPolicy: transferPolicy,
    existingRedemptionEvent: requested.ownershipEvent,
    idempotencyKey: requested.ownershipEvent.idempotencyKey
});
assert.strictEqual(idempotent.idempotent, true);
assert.strictEqual(idempotent.ownershipEvent, requested.ownershipEvent);
assert.strictEqual(idempotent.couponEntitlementRequest, undefined);
assert.deepStrictEqual(idempotent.domainEvents, []);

assert.throws(function () {
    service.requestRedemption({
        asset: Object.assign(ownedAsset(), { assetStatus: 'SOLD' }),
        ownerRef: ownerRef,
        couponListingRef: couponListingRef,
        redemptionPolicy: redemptionPolicy,
        transferPolicy: transferPolicy
    });
}, /asset status/);

assert.throws(function () {
    service.requestRedemption({
        asset: ownedAsset(),
        ownerRef: { module: 'profile', schema: 'customer', code: 'other-owner' },
        couponListingRef: couponListingRef,
        redemptionPolicy: redemptionPolicy,
        transferPolicy: transferPolicy
    });
}, /current owner/);

assert.throws(function () {
    service.requestRedemption({
        asset: ownedAsset(),
        ownerRef: ownerRef,
        redemptionPolicy: redemptionPolicy,
        transferPolicy: transferPolicy
    });
}, /source reference/);

assertNoOwnedStateLeakage(requested.asset);
assertNoOwnedStateLeakage(requested.ownershipEvent);
assertNoOwnedStateLeakage(requested.couponEntitlementRequest);
assertNoOwnedStateLeakage(completed.asset);
assertNoOwnedStateLeakage(completed.ownershipEvent);

console.log('Waste asset coupon redemption contract validated');
