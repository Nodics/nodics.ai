/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module wasteRecycling/test/wasteRecyclingHandoffContract @description Verifies reusable recycling handoff contracts remain provider-neutral and compose with Waste donation completion. @layer test @owner wasteRecycling */
const assert = require('assert');
const service = require('../src/service/defaultWasteRecyclingHandoffContractService');
const donationService = require('../../../../../../nodics.waste/modules/wasteCore/src/service/defaultWasteAssetDonationTransferService');

const ownerRef = { module: 'profile', schema: 'customer', code: 'customer-owner' };
const recyclerRef = { module: 'profile', schema: 'enterprise', code: 'recycler-enterprise-001' };
const customerLocationRef = { module: 'location', schema: 'location', code: 'customer-location-001' };
const recyclerLocationRef = { module: 'location', schema: 'location', code: 'recycler-location-001' };
const providerProfileRef = { module: 'projectProvider', schema: 'recyclingProviderProfile', code: 'provider-profile-001' };

const transferPolicy = {
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
        code: 'WASTE_ASSET_RECYCLING_001',
        assetTypeCode: 'EWASTE_MOBILE_DEVICE_ASSET',
        sourceSubmissionCode: 'sub-recycling-001',
        ownerRef: ownerRef,
        originalOwnerRef: ownerRef,
        assetStatus: 'OWNED',
        custodyStatus: 'CUSTOMER_HELD',
        evidenceRefs: [{ module: 'media', schema: 'mediaAsset', code: 'photo-recycling-001' }],
        revision: 1
    };
}

function assertNoProviderOrLedgerLeakage(value) {
    if (!value || typeof value !== 'object') return;
    Object.keys(value).forEach(function (key) {
        assert(![
            'apiKey',
            'accessToken',
            'clientSecret',
            'secret',
            'password',
            'trackingNumber',
            'carrierCode',
            'certificateNumber',
            'walletBalance',
            'ledgerEntry',
            'ledgerEntries',
            'recyclerAdapter',
            'logisticsAdapter'
        ].includes(key), key + ' must stay outside reusable recycling handoff contracts');
        assertNoProviderOrLedgerLeakage(value[key]);
    });
}

const donation = donationService.requestDonation({
    asset: ownedAsset(),
    ownerRef: ownerRef,
    recyclerRef: recyclerRef,
    transferPolicy: transferPolicy,
    now: new Date('2026-09-01T16:00:00.000Z'),
    correlationId: 'corr-recycling-001',
    idempotencyKey: 'recycling-donation-001'
});

const handoff = service.requestHandoff({
    asset: donation.asset,
    donationEvent: donation.ownershipEvent,
    recyclerRef: recyclerRef,
    sourceLocationRef: customerLocationRef,
    targetLocationRef: recyclerLocationRef,
    providerProfileRef: providerProfileRef,
    movementType: 'PICKUP',
    movementStatus: 'READY_FOR_PICKUP',
    now: new Date('2026-09-01T16:05:00.000Z'),
    correlationId: 'corr-recycling-002',
    idempotencyKey: 'recycling-handoff-001'
});

assert.strictEqual(handoff.handoffRequest.state, 'REQUESTED');
assert.strictEqual(handoff.handoffRequest.callbackOperation, 'completeAssetDonation');
assert.deepStrictEqual(handoff.handoffRequest.requiredCompletionRefs, ['movementRef', 'complianceEvidenceRef']);
assert.strictEqual(handoff.handoffRequest.assetRef.code, 'WASTE_ASSET_RECYCLING_001');
assert.strictEqual(handoff.handoffRequest.donationEventRef.code, donation.ownershipEvent.code);
assert.strictEqual(handoff.handoffRequest.providerProfileRef.code, 'provider-profile-001');
assert.strictEqual(handoff.movementIntent.module, 'wasteMovement');
assert.strictEqual(handoff.movementIntent.schema, 'wasteMovement');
assert.strictEqual(handoff.movementIntent.movementType, 'PICKUP');
assert.strictEqual(handoff.movementIntent.movementStatus, 'READY_FOR_PICKUP');
assert.strictEqual(handoff.movementIntent.sourceLocationRef.code, 'customer-location-001');
assert.strictEqual(handoff.movementIntent.targetLocationRef.code, 'recycler-location-001');
assert(handoff.domainEvents.some(function (event) { return event.eventType === 'waste.recycling.handoff.requested'; }));

const completion = service.completionPayload({
    asset: donation.asset,
    donationEvent: donation.ownershipEvent,
    recyclerRef: recyclerRef,
    movementRef: handoff.handoffRequest.movementIntentRef,
    complianceEvidenceRef: { module: 'wasteCompliance', schema: 'wasteComplianceEvidence', code: 'compliance-recycling-001' },
    transferPolicy: transferPolicy,
    now: new Date('2026-09-01T16:10:00.000Z'),
    correlationId: 'corr-recycling-003',
    idempotencyKey: 'recycling-completion-001'
});

assert.strictEqual(completion.donationCompletionRequest.existingDonationEvent.code, donation.ownershipEvent.code);
assert.strictEqual(completion.donationCompletionRequest.receiverRef.code, 'recycler-enterprise-001');
assert.strictEqual(completion.donationCompletionRequest.movementRef.code, handoff.handoffRequest.movementIntentRef.code);
assert.strictEqual(completion.donationCompletionRequest.complianceEvidenceRef.code, 'compliance-recycling-001');

const completedDonation = donationService.completeDonation(completion.donationCompletionRequest);
assert.strictEqual(completedDonation.asset.assetStatus, 'DONATED');
assert.strictEqual(completedDonation.asset.custodyStatus, 'TRANSFERRED_TO_RECYCLER');
assert.strictEqual(completedDonation.ownershipEvent.movementRef.code, handoff.handoffRequest.movementIntentRef.code);
assert.strictEqual(completedDonation.ownershipEvent.complianceEvidenceRef.code, 'compliance-recycling-001');

assert.throws(function () {
    service.requestHandoff({
        asset: donation.asset,
        donationEvent: donation.ownershipEvent,
        recyclerRef: recyclerRef,
        sourceLocationRef: customerLocationRef,
        targetLocationRef: recyclerLocationRef,
        trackingNumber: 'raw-provider-tracking-001'
    });
}, /trackingNumber must stay outside/);

assert.throws(function () {
    service.completionPayload({
        asset: donation.asset,
        donationEvent: Object.assign({}, donation.ownershipEvent, { transferStatus: 'COMPLETED' }),
        recyclerRef: recyclerRef,
        movementRef: handoff.handoffRequest.movementIntentRef,
        complianceEvidenceRef: { module: 'wasteCompliance', schema: 'wasteComplianceEvidence', code: 'compliance-recycling-001' }
    });
}, /donation event must be PENDING_ACCEPTANCE/);

assertNoProviderOrLedgerLeakage(handoff);
assertNoProviderOrLedgerLeakage(completion);
assertNoProviderOrLedgerLeakage(completedDonation.ownershipEvent);

console.log('Waste Recycling handoff contract validated');
