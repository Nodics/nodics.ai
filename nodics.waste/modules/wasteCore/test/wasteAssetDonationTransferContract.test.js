/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module wasteCore/test/wasteAssetDonationTransferContract @description Verifies Waste-side donation and recycling transfer contracts stay policy-driven and externalize logistics, recycler operations, compliance review, and Wallet/Loyalty state. @layer test @owner wasteCore */
const assert = require('assert');
const service = require('../src/service/defaultWasteAssetDonationTransferService');

const ownerRef = { module: 'profile', schema: 'customer', code: 'customer-owner' };
const recyclerRef = { module: 'recycler', schema: 'partnerFacility', code: 'recycler-facility-001' };
const movementRef = { module: 'wasteMovement', schema: 'wasteMovementEvent', code: 'movement-001' };
const complianceEvidenceRef = { module: 'wasteCompliance', schema: 'wasteComplianceEvidence', code: 'compliance-evidence-001' };
const policy = {
    code: 'EWASTE_DONATION_TRANSFER_STANDARD',
    transferType: 'DONATE',
    ownershipTransferMode: 'TRANSFER_TO_COUNTERPARTY',
    rewardTransferMode: 'NONE',
    carbonTransferMode: 'TRANSFER_TO_COUNTERPARTY',
    eligibleAssetStatuses: ['OWNED', 'GIFTED'],
    allowSelfTransfer: false,
    requiresCounterpartyAcceptance: true,
    requiresReceiptConfirmation: true,
    requiresComplianceReview: true,
    completionAssetStatus: 'DONATED',
    completionCustodyStatus: 'TRANSFERRED_TO_RECYCLER',
    cancellationAssetStatus: 'OWNED',
    reversalAssetStatus: 'OWNED'
};

function ownedAsset() {
    return {
        code: 'WASTE_ASSET_SUB_004',
        assetTypeCode: 'EWASTE_MOBILE_DEVICE_ASSET',
        sourceSubmissionCode: 'sub-004',
        ownerRef: ownerRef,
        originalOwnerRef: ownerRef,
        assetStatus: 'OWNED',
        custodyStatus: 'CUSTOMER_HELD',
        evidenceRefs: [{ module: 'media', schema: 'mediaAsset', code: 'photo-004' }],
        rewardSettlementRefs: [{ module: 'wallet', schema: 'rewardSettlementIntent', code: 'reward-approved-004' }],
        carbonSettlementRefs: [{ module: 'wallet', schema: 'carbonSettlementIntent', code: 'carbon-approved-004' }],
        revision: 1
    };
}

function assertNoExternalOwnerLeakage(value) {
    if (!value || typeof value !== 'object') return;
    Object.keys(value).forEach(function (key) {
        assert(![
            'logisticsAdapter',
            'recyclerAdapter',
            'trackingNumber',
            'carrierCode',
            'certificateNumber',
            'walletBalance',
            'ledgerEntry',
            'ledgerEntries',
            'rewardBalance',
            'carbonBalance'
        ].includes(key), key + ' must stay outside Waste donation contracts');
        assertNoExternalOwnerLeakage(value[key]);
    });
}

const requested = service.requestDonation({
    asset: ownedAsset(),
    ownerRef: ownerRef,
    recyclerRef: recyclerRef,
    transferPolicy: policy,
    carbonSettlementPolicy: { code: 'EWASTE_DONATION_CARBON_TRANSFER', triggerType: 'DONATION', settlementMode: 'TRANSFER_TO_COUNTERPARTY' },
    now: new Date('2026-09-01T15:00:00.000Z'),
    correlationId: 'corr-donation-001',
    idempotencyKey: 'donation-001'
});

assert.strictEqual(requested.idempotent, false);
assert.strictEqual(requested.asset.assetStatus, 'DONATION_PENDING');
assert.strictEqual(requested.ownershipEvent.transferType, 'DONATE');
assert.strictEqual(requested.ownershipEvent.transferStatus, 'PENDING_ACCEPTANCE');
assert.strictEqual(requested.ownershipEvent.fromOwnerRef.code, 'customer-owner');
assert.strictEqual(requested.ownershipEvent.toOwnerRef.code, 'recycler-facility-001');
assert.deepStrictEqual(requested.settlementReferences.reward, []);
assert.strictEqual(requested.settlementReferences.carbon[0].settlementMode, 'TRANSFER_TO_COUNTERPARTY');
assert.strictEqual(requested.settlementReferences.carbon[0].toOwnerRef.code, 'recycler-facility-001');
assert(requested.domainEvents.some(function (event) { return event.eventType === 'waste.asset.donation.requested'; }));
assert(requested.domainEvents.some(function (event) { return event.eventType === 'waste.asset.settlement.requested'; }));

const completed = service.completeDonation({
    asset: requested.asset,
    recyclerRef: recyclerRef,
    transferPolicy: policy,
    existingDonationEvent: requested.ownershipEvent,
    movementRef: movementRef,
    complianceEvidenceRef: complianceEvidenceRef,
    now: new Date('2026-09-01T15:05:00.000Z'),
    correlationId: 'corr-donation-002',
    idempotencyKey: 'donation-001-complete'
});

assert.strictEqual(completed.asset.assetStatus, 'DONATED');
assert.strictEqual(completed.asset.ownerRef.code, 'recycler-facility-001');
assert.strictEqual(completed.asset.physicalOwnerRef.code, 'recycler-facility-001');
assert.strictEqual(completed.asset.custodyStatus, 'TRANSFERRED_TO_RECYCLER');
assert.strictEqual(completed.ownershipEvent.transferStatus, 'COMPLETED');
assert.strictEqual(completed.ownershipEvent.movementRef.code, 'movement-001');
assert.strictEqual(completed.ownershipEvent.complianceEvidenceRef.code, 'compliance-evidence-001');
assert.deepStrictEqual(completed.ownershipEvent.rewardSettlementRefs, requested.ownershipEvent.rewardSettlementRefs);
assert.deepStrictEqual(completed.ownershipEvent.carbonSettlementRefs, requested.ownershipEvent.carbonSettlementRefs);
assert(completed.domainEvents.some(function (event) { return event.eventType === 'waste.asset.donation.completed'; }));

const cancelled = service.cancelDonation({
    asset: requested.asset,
    transferPolicy: policy,
    existingDonationEvent: requested.ownershipEvent,
    now: new Date('2026-09-01T15:10:00.000Z'),
    correlationId: 'corr-donation-003',
    idempotencyKey: 'donation-001-cancel'
});

assert.strictEqual(cancelled.asset.assetStatus, 'OWNED');
assert.strictEqual(cancelled.ownershipEvent.transferStatus, 'CANCELLED');
assert(cancelled.domainEvents.some(function (event) { return event.eventType === 'waste.asset.donation.cancelled'; }));

const idempotent = service.requestDonation({
    asset: requested.asset,
    ownerRef: ownerRef,
    recyclerRef: recyclerRef,
    transferPolicy: policy,
    existingDonationEvent: requested.ownershipEvent,
    idempotencyKey: requested.ownershipEvent.idempotencyKey
});
assert.strictEqual(idempotent.idempotent, true);
assert.strictEqual(idempotent.ownershipEvent, requested.ownershipEvent);
assert.deepStrictEqual(idempotent.domainEvents, []);

assert.throws(function () {
    service.requestDonation({
        asset: Object.assign({}, ownedAsset(), { assetStatus: 'LISTED' }),
        ownerRef: ownerRef,
        recyclerRef: recyclerRef,
        transferPolicy: policy
    });
}, /asset status is not eligible/);

assert.throws(function () {
    service.requestDonation({
        asset: ownedAsset(),
        ownerRef: ownerRef,
        recyclerRef: ownerRef,
        transferPolicy: policy
    });
}, /donation receiver must differ/);

assert.throws(function () {
    service.completeDonation({
        asset: requested.asset,
        recyclerRef: { module: 'recycler', schema: 'partnerFacility', code: 'other-facility' },
        transferPolicy: policy,
        existingDonationEvent: requested.ownershipEvent,
        movementRef: movementRef,
        complianceEvidenceRef: complianceEvidenceRef
    });
}, /receiver must match/);

assert.throws(function () {
    service.completeDonation({
        asset: requested.asset,
        recyclerRef: recyclerRef,
        transferPolicy: policy,
        existingDonationEvent: requested.ownershipEvent,
        complianceEvidenceRef: complianceEvidenceRef
    });
}, /movementRef is required/);

assertNoExternalOwnerLeakage(requested.asset);
assertNoExternalOwnerLeakage(requested.ownershipEvent);
assertNoExternalOwnerLeakage(completed.asset);
assertNoExternalOwnerLeakage(completed.ownershipEvent);
assertNoExternalOwnerLeakage(cancelled.ownershipEvent);

console.log('Waste asset donation transfer contract validated');
