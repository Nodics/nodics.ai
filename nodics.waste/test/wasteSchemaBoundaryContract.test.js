/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module waste/test/wasteSchemaBoundaryContract @description Verifies Waste schemas remain generic, lifecycle-separated, and partner-customizable. @layer test @owner waste */
const assert = require('assert');
const path = require('path');

const moduleRoot = path.resolve(__dirname, '..');
const schemaFiles = [
    'modules/wasteCore/src/schemas/schemas.js',
    'modules/wasteMaterial/src/schemas/schemas.js',
    'modules/wasteCollection/src/schemas/schemas.js',
    'modules/wasteSubmission/src/schemas/schemas.js',
    'modules/wasteVerification/src/schemas/schemas.js',
    'modules/wasteReceipt/src/schemas/schemas.js',
    'modules/wasteImpact/src/schemas/schemas.js',
    'modules/wasteMovement/src/schemas/schemas.js',
    'modules/wasteCompliance/src/schemas/schemas.js'
];

const namespaces = {};
const schemas = schemaFiles.flatMap(function (file) {
    let contributed = require(path.join(moduleRoot, file));
    Object.keys(contributed).forEach(function (namespace) { namespaces[namespace] = contributed[namespace]; });
    return Object.keys(contributed).flatMap(function (namespace) {
        return Object.keys(contributed[namespace]).map(function (schemaCode) {
            return { schemaCode: schemaCode, schema: contributed[namespace][schemaCode] };
        });
    });
});

schemas.forEach(function (entry) {
    let definition = entry.schema.definition || {};
    assert.strictEqual(definition.tenant, undefined, entry.schemaCode + ' must derive tenant from runtime context');
    assert.strictEqual(definition.enterpriseCode, undefined, entry.schemaCode + ' must use source references rather than enterpriseCode data ownership');
    assert.strictEqual(definition.rewardEligibility, undefined, entry.schemaCode + ' must not own reward eligibility policy');
    assert.strictEqual(entry.schema.router.enabled, false, entry.schemaCode + ' must not expose generated CRUD routers');
});

const collectionPoint = namespaces.wasteCollection.wasteCollectionPoint.definition;
assert(namespaces.wasteCollection.wasteCollectionPointType, 'collection point type values must be schema-driven');
assert(namespaces.wasteCollection.wasteCollectionPreset, 'collection preset values must be schema-driven');
assert(namespaces.wasteCollection.wasteReceiptPolicy, 'receipt policy values must be schema-driven');
assert.strictEqual(collectionPoint.collectionPointType.enum, undefined, 'collection point types must be added as schema data, not hardcoded enum values');
assert(collectionPoint.acceptanceSummary, 'collection point may expose acceptanceSummary projection');
assert.strictEqual(collectionPoint.acceptedFamilyCodes, undefined, 'collection point must not duplicate authoritative accepted families');
assert.strictEqual(collectionPoint.acceptedCategoryCodes, undefined, 'collection point must not duplicate authoritative accepted categories');
assert.strictEqual(collectionPoint.acceptedItemTypeCodes, undefined, 'collection point must not duplicate authoritative accepted item types');

const acceptanceRule = namespaces.wasteCollection.wasteCollectionAcceptanceRule.definition;
assert.strictEqual(acceptanceRule.decision.required, true);
assert.deepStrictEqual(acceptanceRule.decision.enum, ['ACCEPT', 'REJECT']);
const collectionPreset = namespaces.wasteCollection.wasteCollectionPreset.definition;
assert.strictEqual(collectionPreset.collectionPointType.required, true);
assert.strictEqual(collectionPreset.acceptanceRuleCodes.type, 'array');
assert(namespaces.wasteVerification.wasteVerificationPolicy, 'verification policies must be schema-driven');

const submissionStatus = namespaces.wasteSubmission.wasteSubmission.definition.submissionStatus.enum;
assert(!submissionStatus.includes('RECEIVED'), 'receipt state must not live inside submissionStatus');
assert(!submissionStatus.includes('IMPACT_CALCULATED'), 'impact state must not live inside submissionStatus');
assert(namespaces.wasteReceipt.wasteReceipt.definition.receiptStatus, 'receipt must own receiptStatus');
assert(namespaces.wasteImpact.wasteImpactResult.definition.calculationStatus, 'impact must own calculationStatus');
assert(namespaces.wasteMovement.wasteBatch, 'batch tracking must be modeled when movement references batches');
assert(namespaces.wasteCompliance.wasteComplianceProfile, 'compliance profile must be modeled');
assert(namespaces.wasteCompliance.wasteComplianceEvidence, 'compliance evidence must be modeled');

const wasteCore = namespaces.wasteCore;
[
    'wasteAssetType',
    'wasteAssetCreationPolicy',
    'wasteAsset',
    'wasteAssetMarketplaceProjection',
    'wasteAssetOwnershipEvent',
    'wasteAssetTransferPolicy',
    'wasteMarketplaceEligibilityPolicy',
    'wasteRewardSettlementPolicy',
    'wasteCarbonSettlementPolicy',
    'wasteCouponRedemptionSettlementPolicy'
].forEach(function (schemaName) {
    assert(wasteCore[schemaName], schemaName + ' must be modeled in wasteCore as reusable framework schema');
});

const lifecycleTypes = wasteCore.wasteLifecyclePolicy.definition.lifecycleType.enum;
['ASSET', 'ASSET_CREATION', 'TRANSFER', 'MARKETPLACE', 'REWARD_SETTLEMENT', 'CARBON_SETTLEMENT', 'COUPON_REDEMPTION'].forEach(function (lifecycleType) {
    assert(lifecycleTypes.includes(lifecycleType), lifecycleType + ' must be a schema-driven Waste lifecycle policy type');
});

const creationPolicy = wasteCore.wasteAssetCreationPolicy.definition;
assert.strictEqual(creationPolicy.requiresEvidence.type, 'bool');
assert(creationPolicy.duplicateStrategy.enum.includes('RETURN_EXISTING'));
assert(creationPolicy.assetCodeStrategy.enum.includes('SOURCE_SUBMISSION'));
assert(creationPolicy.settlementReferenceFailureMode.enum.includes('LOCK_ASSET'));

const asset = wasteCore.wasteAsset.definition;
assert(asset.ownerRef, 'approved waste objects must become customer-owned asset records');
assert(asset.originalOwnerRef, 'waste assets must preserve original owner provenance');
assert(asset.rewardSettlementRefs, 'waste assets may reference wallet reward settlements without owning rewards');
assert(asset.carbonSettlementRefs, 'waste assets may reference carbon settlements without owning the ledger');
assert(asset.marketplaceProjectionRef, 'waste assets may reference Commerce or Product projection only when tradeable');
assert(asset.couponEntitlementRefs, 'waste assets may reference coupon entitlements without owning Promotion');
assert.strictEqual(asset.rewardFormula, undefined, 'waste assets must not own reward formulas');
assert.strictEqual(asset.couponCode, undefined, 'waste assets must not own coupon codes');
assert.strictEqual(asset.enterpriseCode, undefined, 'waste assets must not own enterprise-scoped coupon receivers');
assert(asset.assetStatus.enum.includes('OWNED'));
assert(asset.assetStatus.enum.includes('LISTING_REQUESTED'));
assert(asset.assetStatus.enum.includes('LISTED'));
assert(asset.assetStatus.enum.includes('LISTING_FAILED'));
assert(asset.assetStatus.enum.includes('SOLD'));
assert(asset.assetStatus.enum.includes('GIFT_PENDING'));
assert(asset.assetStatus.enum.includes('GIFTED'));
assert(asset.assetStatus.enum.includes('REDEMPTION_PENDING'));
assert(asset.assetStatus.enum.includes('REDEEMED'));
assert(asset.assetStatus.enum.includes('DONATION_PENDING'));
assert(asset.assetStatus.enum.includes('DONATED'));
assert(asset.custodyStatus.enum.includes('CUSTOMER_HELD'));
assert(asset.custodyStatus.enum.includes('TRANSFERRED_TO_RECYCLER'));
assert(asset.custodyStatus.enum.includes('RECYCLED'));
assert.strictEqual(asset.recyclerAdapter, undefined, 'waste assets must not own recycler adapters');
assert.strictEqual(asset.logisticsAdapter, undefined, 'waste assets must not own logistics adapters');
assert.strictEqual(asset.trackingNumber, undefined, 'waste assets must not own logistics tracking numbers');

const marketplaceProjection = wasteCore.wasteAssetMarketplaceProjection.definition;
assert(marketplaceProjection.commerceProductRef, 'Waste marketplace projection may reference Commerce/Product output');
assert(marketplaceProjection.commerceListingRef, 'Waste marketplace projection may reference Commerce listing output');
assert(marketplaceProjection.projectionStatus.enum.includes('REQUESTED'));
assert(marketplaceProjection.projectionStatus.enum.includes('LISTED'));
assert(marketplaceProjection.projectionStatus.enum.includes('SALE_PENDING'));
assert(marketplaceProjection.projectionStatus.enum.includes('SOLD'));
assert(marketplaceProjection.projectionStatus.enum.includes('REVERSED'));
assert(marketplaceProjection.commerceOrderRef, 'Waste marketplace projection may reference Commerce order callbacks');
assert(marketplaceProjection.paymentRef, 'Waste marketplace projection may reference Commerce payment callbacks');
assert.strictEqual(marketplaceProjection.productName, undefined, 'Waste marketplace projection must not own Product catalog fields');
assert.strictEqual(marketplaceProjection.price, undefined, 'Waste marketplace projection must not own Commerce pricing');
assert.strictEqual(marketplaceProjection.bidRules, undefined, 'Waste marketplace projection must not own bidding rules');
assert.strictEqual(marketplaceProjection.paymentAmount, undefined, 'Waste marketplace projection must not own payment amounts');

const ownershipEvent = wasteCore.wasteAssetOwnershipEvent.definition;
assert(ownershipEvent.transferType.enum.includes('CREATE'));
assert(ownershipEvent.transferType.enum.includes('SELL'));
assert(ownershipEvent.transferType.enum.includes('GIFT'));
assert(ownershipEvent.transferType.enum.includes('DONATE'));
assert(ownershipEvent.transferType.enum.includes('REDEEM'));
assert(ownershipEvent.transferStatus.enum.includes('RESERVED'));
assert(ownershipEvent.transferStatus.enum.includes('PENDING_ACCEPTANCE'));
assert(ownershipEvent.transferStatus.enum.includes('COMPLETED'));
assert(ownershipEvent.rewardSettlementRefs, 'ownership events must point to reward settlement records instead of embedding wallet logic');
assert(ownershipEvent.carbonSettlementRefs, 'ownership events must point to carbon settlement records instead of embedding wallet logic');
assert(ownershipEvent.commerceOrderRef, 'ownership events may reference the Commerce order without owning it');
assert(ownershipEvent.paymentRef, 'ownership events may reference the Commerce payment without owning it');
assert(ownershipEvent.couponEntitlementRef, 'ownership events may reference Promotion/Coupon entitlement without owning it');
assert(ownershipEvent.movementRef, 'ownership events may reference Waste Movement without owning logistics execution');
assert(ownershipEvent.complianceEvidenceRef, 'ownership events may reference Compliance evidence without owning certificates');
assert.strictEqual(ownershipEvent.price, undefined, 'ownership events must not own Commerce pricing');
assert.strictEqual(ownershipEvent.paymentAmount, undefined, 'ownership events must not own payment amounts');
assert.strictEqual(ownershipEvent.couponCode, undefined, 'ownership events must not own coupon codes');
assert.strictEqual(ownershipEvent.walletBalance, undefined, 'ownership events must not own wallet balances');
assert.strictEqual(ownershipEvent.ledgerEntries, undefined, 'ownership events must not own wallet ledger entries');
assert.strictEqual(ownershipEvent.recyclerAdapter, undefined, 'ownership events must not own recycler adapters');
assert.strictEqual(ownershipEvent.logisticsAdapter, undefined, 'ownership events must not own logistics adapters');
assert.strictEqual(ownershipEvent.trackingNumber, undefined, 'ownership events must not own shipment tracking numbers');

const transferPolicy = wasteCore.wasteAssetTransferPolicy.definition;
assert(transferPolicy.transferType.enum.includes('GIFT'));
assert(transferPolicy.transferType.enum.includes('DONATE'));
assert(transferPolicy.rewardTransferMode.enum.includes('RETAIN_ORIGINAL_OWNER'));
assert(transferPolicy.rewardTransferMode.enum.includes('TRANSFER_TO_COUNTERPARTY'));
assert(transferPolicy.rewardTransferMode.enum.includes('CONSUME'));
assert(transferPolicy.carbonTransferMode.enum.includes('TRANSFER_TO_COUNTERPARTY'));
assert(transferPolicy.carbonTransferMode.enum.includes('TRANSFER_TO_DEFAULT_ENTERPRISE'));
assert(transferPolicy.carbonTransferMode.enum.includes('POLICY_RESOLVED'));
assert(transferPolicy.eligibleAssetStatuses, 'transfer policies may own asset-status eligibility');
assert(transferPolicy.completionAssetStatus.enum.includes('DONATED'));
assert(transferPolicy.completionCustodyStatus.enum.includes('TRANSFERRED_TO_RECYCLER'));
assert(transferPolicy.completionCustodyStatus.enum.includes('RECYCLED'));
assert.strictEqual(transferPolicy.allowSelfTransfer.default, false);
assert(transferPolicy.cancellationAssetStatus.enum.includes('LISTED'));
assert(transferPolicy.reversalAssetStatus.enum.includes('OWNED'));

const marketplacePolicy = wasteCore.wasteMarketplaceEligibilityPolicy.definition;
assert(marketplacePolicy.productProjectionMode.enum.includes('COMMERCE_PRODUCT'));
assert(marketplacePolicy.listingMode.enum.includes('BIDDING'));
assert(marketplacePolicy.visibilityMode.enum.includes('PUBLIC_MARKETPLACE'));

const rewardPolicy = wasteCore.wasteRewardSettlementPolicy.definition;
assert(rewardPolicy.triggerType.enum.includes('COUPON_PURCHASE'));
assert(rewardPolicy.settlementMode.enum.includes('DEBIT_FULL_ELIGIBLE'));
assert(rewardPolicy.settlementMode.enum.includes('POLICY_RESOLVED'));

const carbonPolicy = wasteCore.wasteCarbonSettlementPolicy.definition;
assert(carbonPolicy.triggerType.enum.includes('GIFT'));
assert(carbonPolicy.settlementMode.enum.includes('TRANSFER_TO_DEFAULT_ENTERPRISE'));
assert(carbonPolicy.provenanceRequired, 'carbon settlement policies must carry provenance controls');

const couponPolicy = wasteCore.wasteCouponRedemptionSettlementPolicy.definition;
assert(couponPolicy.eligibleAssetStatuses, 'coupon redemption policies must own asset-status eligibility');
assert(couponPolicy.rewardDebitMode.enum.includes('FULL_ELIGIBLE_BALANCE'));
assert(couponPolicy.carbonReceiverMode.enum.includes('DEFAULT_ENTERPRISE'));
assert(couponPolicy.rewardSettlementPolicyCode, 'coupon redemption policies may reference reward settlement policy');
assert(couponPolicy.carbonSettlementPolicyCode, 'coupon redemption policies may reference carbon settlement policy');
assert(couponPolicy.entitlementMode.enum.includes('CUSTOMER_OWNED'));
assert.strictEqual(couponPolicy.couponCode, undefined, 'coupon redemption policies must not own coupon codes');

console.log('Waste schema boundary contract validated');
