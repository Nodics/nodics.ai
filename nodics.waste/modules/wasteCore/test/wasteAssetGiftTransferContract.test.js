/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module wasteCore/test/wasteAssetGiftTransferContract @description Verifies customer-to-customer Waste asset gift contracts stay policy-driven and externalize Wallet/Loyalty state. @layer test @owner wasteCore */
const assert = require('assert');
const service = require('../src/service/defaultWasteAssetGiftTransferService');

const ownerRef = { module: 'profile', schema: 'customer', code: 'customer-owner' };
const receiverRef = { module: 'profile', schema: 'customer', code: 'customer-receiver' };
const policy = {
    code: 'EWASTE_GIFT_TRANSFER_STANDARD',
    transferType: 'GIFT',
    ownershipTransferMode: 'TRANSFER_TO_COUNTERPARTY',
    rewardTransferMode: 'TRANSFER_TO_COUNTERPARTY',
    carbonTransferMode: 'TRANSFER_TO_COUNTERPARTY',
    allowSelfTransfer: false,
    requiresCounterpartyAcceptance: true,
    cancellationAssetStatus: 'OWNED',
    reversalAssetStatus: 'OWNED'
};

function ownedAsset() {
    return {
        code: 'WASTE_ASSET_SUB_002',
        assetTypeCode: 'EWASTE_MOBILE_DEVICE_ASSET',
        sourceSubmissionCode: 'sub-002',
        ownerRef: ownerRef,
        originalOwnerRef: ownerRef,
        assetStatus: 'OWNED',
        custodyStatus: 'CUSTOMER_HELD',
        evidenceRefs: [{ module: 'media', schema: 'mediaAsset', code: 'photo-002' }],
        rewardSettlementRefs: [{ module: 'wallet', schema: 'rewardSettlementIntent', code: 'reward-approved-002' }],
        carbonSettlementRefs: [{ module: 'wallet', schema: 'carbonSettlementIntent', code: 'carbon-approved-002' }],
        revision: 1
    };
}

function assertNoCommerceOrWalletLeakage(value) {
    if (!value || typeof value !== 'object') return;
    Object.keys(value).forEach(function (key) {
        assert(!['price', 'paymentAmount', 'bidRules', 'couponCode', 'walletBalance', 'ledgerEntry', 'ledgerEntries', 'commerceOrderRef', 'paymentRef'].includes(key), key + ' must stay outside Waste gift transfer contracts');
        assertNoCommerceOrWalletLeakage(value[key]);
    });
}

const requested = service.requestGift({
    asset: ownedAsset(),
    ownerRef: ownerRef,
    receiverRef: receiverRef,
    transferPolicy: policy,
    rewardSettlementPolicy: { code: 'EWASTE_GIFT_REWARD_TRANSFER', triggerType: 'GIFT', settlementMode: 'TRANSFER_TO_COUNTERPARTY' },
    carbonSettlementPolicy: { code: 'EWASTE_GIFT_CARBON_TRANSFER', triggerType: 'GIFT', settlementMode: 'TRANSFER_TO_COUNTERPARTY' },
    now: new Date('2026-09-01T14:00:00.000Z'),
    correlationId: 'corr-gift-001',
    idempotencyKey: 'gift-001'
});

assert.strictEqual(requested.idempotent, false);
assert.strictEqual(requested.asset.assetStatus, 'GIFT_PENDING');
assert.strictEqual(requested.ownershipEvent.transferType, 'GIFT');
assert.strictEqual(requested.ownershipEvent.transferStatus, 'PENDING_ACCEPTANCE');
assert.strictEqual(requested.ownershipEvent.fromOwnerRef.code, 'customer-owner');
assert.strictEqual(requested.ownershipEvent.toOwnerRef.code, 'customer-receiver');
assert.strictEqual(requested.settlementReferences.reward[0].settlementMode, 'TRANSFER_TO_COUNTERPARTY');
assert.strictEqual(requested.settlementReferences.reward[0].toOwnerRef.code, 'customer-receiver');
assert.strictEqual(requested.settlementReferences.carbon[0].settlementMode, 'TRANSFER_TO_COUNTERPARTY');
assert.strictEqual(requested.settlementReferences.carbon[0].toOwnerRef.code, 'customer-receiver');
assert(requested.domainEvents.some(function (event) { return event.eventType === 'waste.asset.gift.requested'; }));
assert(requested.domainEvents.some(function (event) { return event.eventType === 'waste.asset.settlement.requested'; }));

const accepted = service.acceptGift({
    asset: requested.asset,
    receiverRef: receiverRef,
    transferPolicy: policy,
    existingGiftEvent: requested.ownershipEvent,
    now: new Date('2026-09-01T14:05:00.000Z'),
    correlationId: 'corr-gift-002',
    idempotencyKey: 'gift-001-accept'
});

assert.strictEqual(accepted.asset.assetStatus, 'GIFTED');
assert.strictEqual(accepted.asset.ownerRef.code, 'customer-receiver');
assert.strictEqual(accepted.ownershipEvent.transferStatus, 'COMPLETED');
assert.deepStrictEqual(accepted.ownershipEvent.rewardSettlementRefs, requested.ownershipEvent.rewardSettlementRefs);
assert.deepStrictEqual(accepted.ownershipEvent.carbonSettlementRefs, requested.ownershipEvent.carbonSettlementRefs);
assert(accepted.domainEvents.some(function (event) { return event.eventType === 'waste.asset.gift.completed'; }));

const cancelled = service.cancelGift({
    asset: requested.asset,
    transferPolicy: policy,
    existingGiftEvent: requested.ownershipEvent,
    now: new Date('2026-09-01T14:10:00.000Z'),
    correlationId: 'corr-gift-003',
    idempotencyKey: 'gift-001-cancel'
});

assert.strictEqual(cancelled.asset.assetStatus, 'OWNED');
assert.strictEqual(cancelled.ownershipEvent.transferStatus, 'CANCELLED');
assert(cancelled.domainEvents.some(function (event) { return event.eventType === 'waste.asset.gift.cancelled'; }));

const idempotent = service.requestGift({
    asset: requested.asset,
    ownerRef: ownerRef,
    receiverRef: receiverRef,
    transferPolicy: policy,
    existingGiftEvent: requested.ownershipEvent,
    idempotencyKey: requested.ownershipEvent.idempotencyKey
});
assert.strictEqual(idempotent.idempotent, true);
assert.strictEqual(idempotent.ownershipEvent, requested.ownershipEvent);
assert.deepStrictEqual(idempotent.domainEvents, []);

assert.throws(function () {
    service.requestGift({
        asset: ownedAsset(),
        ownerRef: { module: 'profile', schema: 'customer', code: 'other-owner' },
        receiverRef: receiverRef,
        transferPolicy: policy
    });
}, /current owner/);

assert.throws(function () {
    service.requestGift({
        asset: ownedAsset(),
        ownerRef: ownerRef,
        receiverRef: ownerRef,
        transferPolicy: policy
    });
}, /receiver must differ/);

assert.throws(function () {
    service.acceptGift({
        asset: requested.asset,
        receiverRef: { module: 'profile', schema: 'customer', code: 'other-receiver' },
        transferPolicy: policy,
        existingGiftEvent: requested.ownershipEvent
    });
}, /receiver must match/);

assertNoCommerceOrWalletLeakage(requested.asset);
assertNoCommerceOrWalletLeakage(requested.ownershipEvent);
assertNoCommerceOrWalletLeakage(accepted.ownershipEvent);
assertNoCommerceOrWalletLeakage(cancelled.ownershipEvent);

console.log('Waste asset gift transfer contract validated');
