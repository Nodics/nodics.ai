/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module eWaste/test/eWastePresetDataContract @description Verifies eWaste contributes schema-driven presets without partner runtime ownership. @layer test @owner eWaste */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const moduleRoot = path.resolve(__dirname, '..');
const recordRoot = path.join(moduleRoot, 'data/core-v001/records/waste');
const header = require(path.join(moduleRoot, 'data/core-v001/headers/waste/eWastePresetHeader'));
const properties = require(path.join(moduleRoot, 'config/properties'));
const contributionPolicy = require('../../../../../../nodics.waste/modules/wasteCore/src/service/defaultWasteDataContributionPolicyService');
const forbiddenPattern = /(BANTGO|I2E|i2eCredits|MAPBOX|RECYCLER_ADAPTER|LOGISTICS_ADAPTER|VENDOR_CODE|VENDOR_REF)/;
const expectedHeaderSchemas = {
    eWasteAssetCreationPolicyData: 'wasteAssetCreationPolicy',
    eWasteAssetTypeData: 'wasteAssetType',
    eWasteAssetTransferPolicyData: 'wasteAssetTransferPolicy',
    eWasteMarketplaceEligibilityPolicyData: 'wasteMarketplaceEligibilityPolicy',
    eWasteRewardSettlementPolicyData: 'wasteRewardSettlementPolicy',
    eWasteCarbonSettlementPolicyData: 'wasteCarbonSettlementPolicy',
    eWasteCouponRedemptionSettlementPolicyData: 'wasteCouponRedemptionSettlementPolicy',
    eWasteFamilyData: 'wasteFamily',
    eWasteCategoryData: 'wasteCategory',
    eWasteItemTypeData: 'wasteItemType',
    eWasteMaterialTypeData: 'wasteMaterialType',
    eWasteEvidencePolicyData: 'wasteEvidencePolicy',
    eWasteCollectionPointTypeData: 'wasteCollectionPointType',
    eWasteCollectionPresetData: 'wasteCollectionPreset',
    eWasteReceiptPolicyData: 'wasteReceiptPolicy',
    eWasteAcceptanceRuleData: 'wasteCollectionAcceptanceRule',
    eWasteVerificationPolicyData: 'wasteVerificationPolicy',
    eWasteImpactMetricData: 'wasteImpactMetric',
    eWasteImpactProfileData: 'wasteImpactProfile'
};

const loadRecords = function (fileName) {
    return Object.values(require(path.join(recordRoot, fileName)));
};
const codes = function (records) {
    return records.map(function (record) { return record.code; });
};

assert.strictEqual(properties.eWaste.presetPack.code, 'EWASTE_CORE_PRESETS');
assert.strictEqual(properties.eWaste.presetPack.targetModule, 'nodics.waste');
assert.strictEqual(JSON.stringify(properties).includes('acceptedFamilyCodes'), false, 'Family/category/material values must not live in properties');
assert.strictEqual(contributionPolicy.validateHeader(header).length, Object.keys(expectedHeaderSchemas).length);

Object.keys(expectedHeaderSchemas).forEach(function (dataFilePrefix) {
    let matches = Object.values(header).flatMap(function (section) {
        return Object.keys(section).map(function (key) {
            return { key: key, schemaName: section[key].options.schemaName, dataFilePrefix: section[key].options.dataFilePrefix };
        });
    }).filter(function (entry) {
        return entry.key === dataFilePrefix;
    });
    assert.strictEqual(matches.length, 1, dataFilePrefix + ' must be mapped exactly once');
    assert.strictEqual(matches[0].schemaName, expectedHeaderSchemas[dataFilePrefix]);
    assert.strictEqual(matches[0].dataFilePrefix, dataFilePrefix);
});

const familyCodes = codes(loadRecords('eWasteFamilyData.js'));
const categoryCodes = codes(loadRecords('eWasteCategoryData.js'));
const materialCodes = codes(loadRecords('eWasteMaterialTypeData.js'));
const collectionPointTypeCodes = codes(loadRecords('eWasteCollectionPointTypeData.js'));
const collectionPresetCodes = codes(loadRecords('eWasteCollectionPresetData.js'));
const evidencePolicyCodes = codes(loadRecords('eWasteEvidencePolicyData.js'));
const receiptPolicyCodes = codes(loadRecords('eWasteReceiptPolicyData.js'));
const verificationPolicyCodes = codes(loadRecords('eWasteVerificationPolicyData.js'));
const impactMetricCodes = codes(loadRecords('eWasteImpactMetricData.js'));
const impactProfileCodes = codes(loadRecords('eWasteImpactProfileData.js'));
const assetCreationPolicyCodes = codes(loadRecords('eWasteAssetCreationPolicyData.js'));
const assetTypeCodes = codes(loadRecords('eWasteAssetTypeData.js'));
const assetTransferPolicyCodes = codes(loadRecords('eWasteAssetTransferPolicyData.js'));
const marketplacePolicyCodes = codes(loadRecords('eWasteMarketplaceEligibilityPolicyData.js'));
const rewardSettlementPolicyCodes = codes(loadRecords('eWasteRewardSettlementPolicyData.js'));
const carbonSettlementPolicyCodes = codes(loadRecords('eWasteCarbonSettlementPolicyData.js'));
const couponRedemptionPolicyCodes = codes(loadRecords('eWasteCouponRedemptionSettlementPolicyData.js'));
const acceptanceRules = loadRecords('eWasteAcceptanceRuleData.js');

assert(familyCodes.includes('ELECTRONICS'));
assert(familyCodes.includes('BATTERY'));
assert(categoryCodes.includes('MOBILE_DEVICE'));
assert(categoryCodes.includes('LITHIUM_BATTERY'));
assert(materialCodes.includes('CIRCUIT_BOARD'));
assert(collectionPointTypeCodes.includes('E_WASTE_DROP_OFF'));
assert(collectionPointTypeCodes.includes('E_WASTE_BIN'));
assert(collectionPresetCodes.includes('EWASTE_DROP_OFF_STANDARD'));
assert(collectionPresetCodes.includes('EWASTE_BIN_ACCESSORY_ONLY'));
assert(evidencePolicyCodes.includes('EWASTE_STANDARD_PHOTO'));
assert(receiptPolicyCodes.includes('EWASTE_STANDARD_RECEIPT'));
assert(verificationPolicyCodes.includes('EWASTE_STANDARD_VERIFICATION'));
assert(impactMetricCodes.includes('EWASTE_WEIGHT_KG'));
assert(impactProfileCodes.includes('EWASTE_WEIGHT_ESTIMATE'));
assert(assetCreationPolicyCodes.includes('EWASTE_APPROVED_ASSET_STANDARD'));
assert(assetTypeCodes.includes('EWASTE_MOBILE_DEVICE_ASSET'));
assert(assetTypeCodes.includes('EWASTE_BATTERY_ASSET'));
assert(assetTransferPolicyCodes.includes('EWASTE_SALE_TRANSFER_STANDARD'));
assert(assetTransferPolicyCodes.includes('EWASTE_GIFT_TRANSFER_STANDARD'));
assert(assetTransferPolicyCodes.includes('EWASTE_DONATION_TRANSFER_STANDARD'));
assert(marketplacePolicyCodes.includes('EWASTE_PUBLIC_MARKETPLACE_BIDDING'));
assert(rewardSettlementPolicyCodes.includes('EWASTE_APPROVAL_REWARD_STANDARD'));
assert(rewardSettlementPolicyCodes.includes('EWASTE_COUPON_REWARD_DEBIT'));
assert(carbonSettlementPolicyCodes.includes('EWASTE_APPROVAL_CARBON_STANDARD'));
assert(carbonSettlementPolicyCodes.includes('EWASTE_COUPON_CARBON_TO_DEFAULT_ENTERPRISE'));
assert(couponRedemptionPolicyCodes.includes('EWASTE_COUPON_REDEMPTION_STANDARD'));
const couponRedemptionPolicy = loadRecords('eWasteCouponRedemptionSettlementPolicyData.js').find(function (policy) {
    return policy.code === 'EWASTE_COUPON_REDEMPTION_STANDARD';
});
assert(couponRedemptionPolicy.eligibleAssetStatuses.includes('OWNED'));
assert(couponRedemptionPolicy.eligibleAssetStatuses.includes('GIFTED'));
assert.strictEqual(couponRedemptionPolicy.rewardSettlementPolicyCode, 'EWASTE_COUPON_REWARD_DEBIT');
assert.strictEqual(couponRedemptionPolicy.carbonSettlementPolicyCode, 'EWASTE_COUPON_CARBON_TO_DEFAULT_ENTERPRISE');
assert.strictEqual(couponRedemptionPolicy.entitlementMode, 'CUSTOMER_OWNED');
const donationTransferPolicy = loadRecords('eWasteAssetTransferPolicyData.js').find(function (policy) {
    return policy.code === 'EWASTE_DONATION_TRANSFER_STANDARD';
});
assert.strictEqual(donationTransferPolicy.transferType, 'DONATE');
assert(donationTransferPolicy.eligibleAssetStatuses.includes('OWNED'));
assert(donationTransferPolicy.eligibleAssetStatuses.includes('GIFTED'));
assert.strictEqual(donationTransferPolicy.rewardTransferMode, 'NONE');
assert.strictEqual(donationTransferPolicy.carbonTransferMode, 'TRANSFER_TO_COUNTERPARTY');
assert.strictEqual(donationTransferPolicy.completionAssetStatus, 'DONATED');
assert.strictEqual(donationTransferPolicy.completionCustodyStatus, 'TRANSFERRED_TO_RECYCLER');
assert(acceptanceRules.some(function (rule) {
    return rule.code === 'EWASTE_BIN_REJECT_LOOSE_BATTERY' && rule.decision === 'REJECT';
}));

fs.readdirSync(recordRoot).filter(function (fileName) {
    return fileName.endsWith('.js');
}).forEach(function (fileName) {
    let source = fs.readFileSync(path.join(recordRoot, fileName), 'utf8');
    assert(!forbiddenPattern.test(source), fileName + ' must not contain partner/reward/map/provider-specific values');
});

console.log('eWaste preset data contract validated');
