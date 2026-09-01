/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module wasteCore/test/wasteAssetSaleTransferContract @description Verifies Waste-side sale transfer contracts stay policy-driven and externalize Commerce/Wallet ownership. @layer test @owner wasteCore */
const assert = require('assert');
const service = require('../src/service/defaultWasteAssetSaleTransferService');

const sellerRef = { module: 'profile', schema: 'customer', code: 'customer-seller' };
const buyerRef = { module: 'profile', schema: 'customer', code: 'customer-buyer' };
const orderRef = { module: 'commerce', schema: 'order', code: 'order-001' };
const paymentRef = { module: 'commerce', schema: 'paymentTransaction', code: 'payment-001' };
const policy = {
    code: 'EWASTE_SALE_TRANSFER_STANDARD',
    transferType: 'SELL',
    ownershipTransferMode: 'TRANSFER_TO_COUNTERPARTY',
    rewardTransferMode: 'RETAIN_ORIGINAL_OWNER',
    carbonTransferMode: 'TRANSFER_TO_COUNTERPARTY',
    allowSelfTransfer: false,
    cancellationAssetStatus: 'LISTED',
    reversalAssetStatus: 'OWNED'
};

function listedAsset() {
    return {
        code: 'WASTE_ASSET_SUB_001',
        assetTypeCode: 'EWASTE_MOBILE_DEVICE_ASSET',
        sourceSubmissionCode: 'sub-001',
        ownerRef: sellerRef,
        originalOwnerRef: sellerRef,
        assetStatus: 'LISTED',
        custodyStatus: 'CUSTOMER_HELD',
        evidenceRefs: [{ module: 'media', schema: 'mediaAsset', code: 'photo-001' }],
        rewardSettlementRefs: [{ module: 'wallet', schema: 'rewardSettlementIntent', code: 'reward-approved-001' }],
        carbonSettlementRefs: [{ module: 'wallet', schema: 'carbonSettlementIntent', code: 'carbon-approved-001' }],
        marketplaceProjectionRef: { module: 'wasteCore', schema: 'wasteAssetMarketplaceProjection', code: 'projection-001' },
        revision: 2
    };
}

function listedProjection() {
    return {
        code: 'projection-001',
        assetCode: 'WASTE_ASSET_SUB_001',
        projectionStatus: 'LISTED',
        commerceProductRef: { module: 'commerce', schema: 'product', code: 'product-001' },
        commerceListingRef: { module: 'commerce', schema: 'marketplaceListing', code: 'listing-001' },
        transferPolicyCode: policy.code,
        rewardSettlementPolicyCode: 'EWASTE_SALE_REWARD_RETAIN_OWNER',
        carbonSettlementPolicyCode: 'EWASTE_SALE_CARBON_TRANSFER',
        revision: 1
    };
}

function assertNoCommerceOrWalletLeakage(value) {
    if (!value || typeof value !== 'object') return;
    Object.keys(value).forEach(function (key) {
        assert(!['price', 'paymentAmount', 'bidRules', 'couponCode', 'walletBalance', 'ledgerEntry', 'ledgerEntries'].includes(key), key + ' must stay outside Waste sale transfer contracts');
        assertNoCommerceOrWalletLeakage(value[key]);
    });
}

const reserved = service.reserveSale({
    asset: listedAsset(),
    projection: listedProjection(),
    transferPolicy: policy,
    buyerRef: buyerRef,
    commerceOrderRef: orderRef,
    paymentRef: paymentRef,
    now: new Date('2026-09-01T13:00:00.000Z'),
    correlationId: 'corr-sale-001',
    idempotencyKey: 'sale-order-001'
});

assert.strictEqual(reserved.idempotent, false);
assert.strictEqual(reserved.asset.assetStatus, 'SALE_PENDING');
assert.strictEqual(reserved.projection.projectionStatus, 'SALE_PENDING');
assert.strictEqual(reserved.projection.commerceOrderRef.code, 'order-001');
assert.strictEqual(reserved.projection.paymentRef.code, 'payment-001');
assert.strictEqual(reserved.ownershipEvent.transferType, 'SELL');
assert.strictEqual(reserved.ownershipEvent.transferStatus, 'RESERVED');
assert.strictEqual(reserved.ownershipEvent.commerceOrderRef.code, 'order-001');
assert.strictEqual(reserved.ownershipEvent.paymentRef.code, 'payment-001');
assert.strictEqual(reserved.settlementReferences.reward[0].settlementMode, 'RETAIN_ORIGINAL_OWNER');
assert.strictEqual(reserved.settlementReferences.reward[0].toOwnerRef.code, 'customer-seller');
assert.strictEqual(reserved.settlementReferences.carbon[0].settlementMode, 'TRANSFER_TO_COUNTERPARTY');
assert.strictEqual(reserved.settlementReferences.carbon[0].toOwnerRef.code, 'customer-buyer');
assert(reserved.domainEvents.some(function (event) { return event.eventType === 'waste.asset.sale.reserved'; }));
assert(reserved.domainEvents.some(function (event) { return event.eventType === 'waste.asset.settlement.requested'; }));

const completed = service.completeSale({
    asset: reserved.asset,
    projection: reserved.projection,
    transferPolicy: policy,
    buyerRef: buyerRef,
    commerceOrderRef: orderRef,
    paymentRef: paymentRef,
    existingReservedEvent: reserved.ownershipEvent,
    now: new Date('2026-09-01T13:05:00.000Z'),
    correlationId: 'corr-sale-002',
    idempotencyKey: 'sale-order-001-complete'
});

assert.strictEqual(completed.asset.assetStatus, 'SOLD');
assert.strictEqual(completed.asset.ownerRef.code, 'customer-buyer');
assert.strictEqual(completed.projection.projectionStatus, 'SOLD');
assert.strictEqual(completed.ownershipEvent.transferStatus, 'COMPLETED');
assert.deepStrictEqual(completed.ownershipEvent.rewardSettlementRefs, reserved.ownershipEvent.rewardSettlementRefs);
assert.deepStrictEqual(completed.ownershipEvent.carbonSettlementRefs, reserved.ownershipEvent.carbonSettlementRefs);
assert(completed.domainEvents.some(function (event) { return event.eventType === 'waste.asset.sale.completed'; }));

const cancelled = service.cancelSale({
    asset: reserved.asset,
    projection: reserved.projection,
    transferPolicy: policy,
    commerceOrderRef: orderRef,
    existingOwnershipEvent: reserved.ownershipEvent,
    now: new Date('2026-09-01T13:10:00.000Z'),
    correlationId: 'corr-sale-003',
    idempotencyKey: 'sale-order-001-cancel'
});

assert.strictEqual(cancelled.asset.assetStatus, 'LISTED');
assert.strictEqual(cancelled.projection.projectionStatus, 'LISTED');
assert.strictEqual(cancelled.ownershipEvent.transferStatus, 'CANCELLED');
assert(cancelled.domainEvents.some(function (event) { return event.eventType === 'waste.asset.sale.cancelled'; }));

const reversed = service.reverseSale({
    asset: completed.asset,
    projection: completed.projection,
    transferPolicy: policy,
    existingOwnershipEvent: completed.ownershipEvent,
    commerceOrderRef: orderRef,
    paymentRef: paymentRef,
    now: new Date('2026-09-01T13:15:00.000Z'),
    correlationId: 'corr-sale-004',
    idempotencyKey: 'sale-order-001-reverse'
});

assert.strictEqual(reversed.asset.assetStatus, 'OWNED');
assert.strictEqual(reversed.asset.ownerRef.code, 'customer-seller');
assert.strictEqual(reversed.projection.projectionStatus, 'REVERSED');
assert.strictEqual(reversed.ownershipEvent.transferType, 'REVERSAL');
assert.strictEqual(reversed.ownershipEvent.transferStatus, 'REVERSED');
assert.strictEqual(reversed.ownershipEvent.rewardSettlementRefs[0].settlementMode, 'REVERSAL');
assert.strictEqual(reversed.ownershipEvent.carbonSettlementRefs[0].settlementMode, 'REVERSAL');

const idempotent = service.completeSale({
    asset: completed.asset,
    projection: completed.projection,
    transferPolicy: policy,
    buyerRef: buyerRef,
    commerceOrderRef: orderRef,
    existingOwnershipEvent: completed.ownershipEvent,
    idempotencyKey: completed.ownershipEvent.idempotencyKey
});
assert.strictEqual(idempotent.idempotent, true);
assert.strictEqual(idempotent.ownershipEvent, completed.ownershipEvent);
assert.deepStrictEqual(idempotent.domainEvents, []);

assert.throws(function () {
    service.reserveSale({
        asset: listedAsset(),
        projection: listedProjection(),
        transferPolicy: policy,
        buyerRef: sellerRef,
        commerceOrderRef: orderRef
    });
}, /buyer must differ/);

assert.throws(function () {
    service.reserveSale({
        asset: listedAsset(),
        projection: Object.assign({}, listedProjection(), { assetCode: 'OTHER_ASSET' }),
        transferPolicy: policy,
        buyerRef: buyerRef,
        commerceOrderRef: orderRef
    });
}, /matching marketplace projection/);

assertNoCommerceOrWalletLeakage(reserved.asset);
assertNoCommerceOrWalletLeakage(reserved.projection);
assertNoCommerceOrWalletLeakage(reserved.ownershipEvent);
assertNoCommerceOrWalletLeakage(completed.ownershipEvent);
assertNoCommerceOrWalletLeakage(reversed.ownershipEvent);

console.log('Waste asset sale transfer contract validated');
