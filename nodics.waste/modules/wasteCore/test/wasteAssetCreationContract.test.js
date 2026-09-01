/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module wasteCore/test/wasteAssetCreationContract @description Verifies approved submissions become customer-owned Waste assets through policy-driven contracts. @layer test @owner wasteCore */
const assert = require('assert');
const policyService = require('../src/service/defaultWasteAssetCreationPolicyService');
const assetCreationService = require('../src/service/defaultWasteAssetCreationService');

const ownerRef = { module: 'profile', schema: 'customer', code: 'customer-001' };
const approvedSubmission = {
    code: 'sub-001',
    submissionStatus: 'APPROVED',
    submissionChannel: 'CUSTOMER_APP',
    categoryCode: 'MOBILE_DEVICE',
    itemTypeCode: 'SMARTPHONE',
    customerRef: ownerRef,
    evidenceRefs: [{ module: 'media', schema: 'mediaAsset', code: 'photo-001' }],
    correlationId: 'corr-001',
    idempotencyKey: 'approve-sub-001'
};
const policy = {
    code: 'EWASTE_APPROVED_ASSET_STANDARD',
    assetTypeCode: 'EWASTE_MOBILE_DEVICE_ASSET',
    rewardSettlementPolicyCode: 'EWASTE_APPROVAL_REWARD_STANDARD',
    carbonSettlementPolicyCode: 'EWASTE_APPROVAL_CARBON_STANDARD'
};

const evaluation = policyService.evaluate({ submission: approvedSubmission, policy: policy });
assert.strictEqual(evaluation.eligible, true);
assert.strictEqual(evaluation.policyCode, 'EWASTE_APPROVED_ASSET_STANDARD');

const result = assetCreationService.createFromApprovedSubmission({
    submission: approvedSubmission,
    policy: policy,
    now: new Date('2026-09-01T11:00:00.000Z'),
    principalRef: { module: 'profile', schema: 'employee', code: 'operator-001' }
});

assert.strictEqual(result.idempotent, false);
assert.strictEqual(result.asset.code, 'WASTE_ASSET_SUB_001');
assert.strictEqual(result.asset.assetTypeCode, 'EWASTE_MOBILE_DEVICE_ASSET');
assert.deepStrictEqual(result.asset.ownerRef, ownerRef);
assert.deepStrictEqual(result.asset.originalOwnerRef, ownerRef);
assert.strictEqual(result.asset.assetStatus, 'OWNED');
assert.strictEqual(result.asset.custodyStatus, 'CUSTOMER_HELD');
assert.strictEqual(result.asset.rewardFormula, undefined);
assert.strictEqual(result.asset.couponCode, undefined);
assert.strictEqual(result.asset.enterpriseCode, undefined);
assert.strictEqual(result.asset.rewardSettlementRefs.length, 1);
assert.strictEqual(result.asset.rewardSettlementRefs[0].module, 'wallet');
assert.strictEqual(result.asset.rewardSettlementRefs[0].policyCode, 'EWASTE_APPROVAL_REWARD_STANDARD');
assert.strictEqual(result.asset.carbonSettlementRefs[0].policyCode, 'EWASTE_APPROVAL_CARBON_STANDARD');
assert.strictEqual(result.asset.marketplaceProjectionRef, undefined, 'asset creation must not require Commerce projection');
assert.strictEqual(result.ownershipEvent.transferType, 'CREATE');
assert.strictEqual(result.ownershipEvent.transferStatus, 'COMPLETED');
assert.strictEqual(result.ownershipEvent.assetCode, result.asset.code);
assert(result.auditEvents.some(function (event) { return event.eventType === 'waste.asset.creation'; }));
assert(result.domainEvents.some(function (event) { return event.eventType === 'waste.asset.created'; }));
assert(result.domainEvents.some(function (event) { return event.eventType === 'waste.asset.ownership.completed'; }));
assert(result.domainEvents.some(function (event) { return event.eventType === 'waste.asset.settlement.requested'; }));

assert.throws(function () {
    assetCreationService.createFromApprovedSubmission({
        submission: Object.assign({}, approvedSubmission, { code: 'sub-002', submissionStatus: 'SUBMITTED' }),
        policy: policy
    });
}, /submissionStatus:APPROVED/);

assert.throws(function () {
    assetCreationService.createFromApprovedSubmission({
        submission: Object.assign({}, approvedSubmission, { code: 'sub-003', evidenceRefs: [] }),
        policy: policy
    });
}, /evidenceRefs/);

assert.throws(function () {
    assetCreationService.createFromApprovedSubmission({
        submission: Object.assign({}, approvedSubmission, { code: 'sub-004', receiptRef: undefined }),
        policy: Object.assign({}, policy, { requiresReceipt: true })
    });
}, /receiptRef/);

assert.throws(function () {
    assetCreationService.createFromApprovedSubmission({
        submission: Object.assign({}, approvedSubmission, { code: 'sub-005', impactRef: undefined }),
        policy: Object.assign({}, policy, { requiresImpactResult: true })
    });
}, /impactRef/);

const idempotent = assetCreationService.createFromApprovedSubmission({
    submission: approvedSubmission,
    policy: policy,
    existingAsset: result.asset,
    existingOwnershipEvent: result.ownershipEvent
});
assert.strictEqual(idempotent.idempotent, true);
assert.deepStrictEqual(idempotent.asset, result.asset);
assert.deepStrictEqual(idempotent.ownershipEvent, result.ownershipEvent);
assert.deepStrictEqual(idempotent.auditEvents, []);
assert.deepStrictEqual(idempotent.domainEvents, []);

assert.throws(function () {
    assetCreationService.createFromApprovedSubmission({
        submission: approvedSubmission,
        policy: Object.assign({}, policy, { duplicateStrategy: 'FAIL' }),
        existingAsset: result.asset
    });
}, /duplicateAsset/);

const locked = assetCreationService.createFromApprovedSubmission({
    submission: Object.assign({}, approvedSubmission, { code: 'sub-006' }),
    policy: Object.assign({}, policy, { settlementReferenceFailureMode: 'LOCK_ASSET' }),
    settlementReferenceError: 'wallet policy endpoint unavailable'
});
assert.strictEqual(locked.asset.assetStatus, 'LOCKED');
assert.strictEqual(locked.ownershipEvent.transferStatus, 'RESERVED');
assert(locked.domainEvents.some(function (event) { return event.eventType === 'waste.asset.ownership.reserved'; }));

const owned = assetCreationService.ownedAssets({
    ownerRef: ownerRef,
    assets: [
        result.asset,
        Object.assign({}, result.asset, { code: 'WASTE_ASSET_OTHER', ownerRef: { module: 'profile', schema: 'customer', code: 'customer-002' } })
    ]
});
assert.deepStrictEqual(owned.map(function (asset) { return asset.code; }), ['WASTE_ASSET_SUB_001']);

console.log('Waste asset creation contract validated');
