/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module wasteCore/test/wasteAssetMarketplaceProjectionContract @description Verifies Waste asset marketplace projection remains a relationship contract with Commerce/Product. @layer test @owner wasteCore */
const assert = require('assert');
const service = require('../src/service/defaultWasteAssetMarketplaceProjectionService');

const ownerRef = { module: 'profile', schema: 'customer', code: 'customer-001' };
const asset = {
    code: 'WASTE_ASSET_SUB_001',
    assetTypeCode: 'EWASTE_MOBILE_DEVICE_ASSET',
    sourceSubmissionCode: 'sub-001',
    ownerRef: ownerRef,
    originalOwnerRef: ownerRef,
    custodyStatus: 'CUSTOMER_HELD',
    assetStatus: 'OWNED',
    evidenceRefs: [{ module: 'media', schema: 'mediaAsset', code: 'photo-001' }],
    rewardSettlementRefs: [{ module: 'wallet', schema: 'rewardSettlementIntent', code: 'reward-001' }],
    carbonSettlementRefs: [{ module: 'wallet', schema: 'carbonSettlementIntent', code: 'carbon-001' }],
    revision: 0
};
const policy = {
    code: 'EWASTE_PUBLIC_MARKETPLACE_BIDDING',
    eligibleAssetStatuses: ['OWNED'],
    eligibleCustodyStatuses: ['CUSTOMER_HELD'],
    listingMode: 'BIDDING',
    visibilityMode: 'PUBLIC_MARKETPLACE',
    valuationMode: 'CARBON_VALUE_SUGGESTED',
    productProjectionMode: 'COMMERCE_LISTING',
    transferPolicyCode: 'EWASTE_SALE_TRANSFER_STANDARD',
    rewardSettlementPolicyCode: 'EWASTE_SALE_REWARD_RETAIN_OWNER',
    carbonSettlementPolicyCode: 'EWASTE_SALE_CARBON_TRANSFER'
};

const requested = service.requestProjection({
    asset: asset,
    ownerRef: ownerRef,
    policy: policy,
    listingFacts: { title: 'Used smartphone for recovery', description: 'Verified e-waste object ready for bidding.' },
    now: new Date('2026-09-01T12:00:00.000Z'),
    correlationId: 'corr-market-001',
    idempotencyKey: 'market-001'
});

assert.strictEqual(requested.idempotent, false);
assert.strictEqual(requested.asset.assetStatus, 'LISTING_REQUESTED');
assert.strictEqual(requested.asset.marketplaceProjectionRef.schema, 'wasteAssetMarketplaceProjection');
assert.strictEqual(requested.projection.code, 'WASTE_MARKETPLACE_PROJECTION_WASTE_ASSET_SUB_001');
assert.strictEqual(requested.projection.assetCode, asset.code);
assert.strictEqual(requested.projection.projectionStatus, 'REQUESTED');
assert.strictEqual(requested.projection.commerceProductRef, undefined);
assert.strictEqual(requested.projection.commerceListingRef, undefined);
assert.strictEqual(requested.commerceProjectionRequest.assetRef.code, asset.code);
assert.deepStrictEqual(requested.commerceProjectionRequest.ownerRef, ownerRef);
assert.strictEqual(requested.commerceProjectionRequest.projectionMode, 'COMMERCE_LISTING');
assert.strictEqual(requested.commerceProjectionRequest.listingMode, 'BIDDING');
assert.strictEqual(requested.commerceProjectionRequest.transferPolicyCode, 'EWASTE_SALE_TRANSFER_STANDARD');
assert.strictEqual(requested.commerceProjectionRequest.rewardSettlementPolicyCode, 'EWASTE_SALE_REWARD_RETAIN_OWNER');
assert.strictEqual(requested.commerceProjectionRequest.carbonSettlementPolicyCode, 'EWASTE_SALE_CARBON_TRANSFER');
assert(requested.domainEvents.some(function (event) { return event.eventType === 'waste.asset.marketplace.projection.requested'; }));

const completed = service.completeProjection({
    asset: requested.asset,
    projection: requested.projection,
    commerceProductRef: { module: 'commerce', schema: 'product', code: 'product-001' },
    commerceListingRef: { module: 'commerce', schema: 'marketplaceListing', code: 'listing-001' },
    now: new Date('2026-09-01T12:05:00.000Z'),
    correlationId: 'corr-market-002',
    idempotencyKey: 'market-002'
});
assert.strictEqual(completed.asset.assetStatus, 'LISTED');
assert.strictEqual(completed.projection.projectionStatus, 'LISTED');
assert.strictEqual(completed.projection.commerceProductRef.code, 'product-001');
assert.strictEqual(completed.projection.commerceListingRef.code, 'listing-001');
assert(completed.domainEvents.some(function (event) { return event.eventType === 'waste.asset.marketplace.projection.completed'; }));

const cancelled = service.closeProjection({
    asset: completed.asset,
    projection: completed.projection,
    closeStatus: 'CANCELLED',
    now: new Date('2026-09-01T12:10:00.000Z')
});
assert.strictEqual(cancelled.asset.assetStatus, 'OWNED');
assert.strictEqual(cancelled.asset.marketplaceProjectionRef, undefined);
assert.strictEqual(cancelled.projection.projectionStatus, 'CANCELLED');

assert.throws(function () {
    service.requestProjection({
        asset: Object.assign({}, asset, { assetStatus: 'SOLD' }),
        ownerRef: ownerRef,
        policy: policy
    });
}, /assetStatus/);

assert.throws(function () {
    service.requestProjection({
        asset: asset,
        ownerRef: { module: 'profile', schema: 'customer', code: 'customer-002' },
        policy: policy
    });
}, /current owner/);

assert.throws(function () {
    service.requestProjection({
        asset: asset,
        ownerRef: ownerRef,
        policy: Object.assign({}, policy, { productProjectionMode: 'NONE' })
    });
}, /productProjectionMode/);

const idempotent = service.requestProjection({
    asset: requested.asset,
    ownerRef: ownerRef,
    policy: policy,
    existingProjection: requested.projection
});
assert.strictEqual(idempotent.idempotent, true);
assert.deepStrictEqual(idempotent.projection, requested.projection);
assert.strictEqual(idempotent.commerceProjectionRequest, undefined);

console.log('Waste asset marketplace projection contract validated');
