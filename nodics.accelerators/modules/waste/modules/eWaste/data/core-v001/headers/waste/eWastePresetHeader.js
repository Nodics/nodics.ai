/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module eWaste/data/core-v001/headers/eWastePresetHeader @description Imports eWaste seed records into nodics.waste schemas. @layer data-header @owner eWaste */
const entry = (schemaName, dataFilePrefix) => ({
    options: { enabled: true, schemaName, operation: 'saveAll', dataFilePrefix },
    query: { code: '$code' }
});

module.exports = {
    wasteCore: {
        eWasteAssetCreationPolicyData: entry('wasteAssetCreationPolicy', 'eWasteAssetCreationPolicyData'),
        eWasteAssetTypeData: entry('wasteAssetType', 'eWasteAssetTypeData'),
        eWasteAssetTransferPolicyData: entry('wasteAssetTransferPolicy', 'eWasteAssetTransferPolicyData'),
        eWasteMarketplaceEligibilityPolicyData: entry('wasteMarketplaceEligibilityPolicy', 'eWasteMarketplaceEligibilityPolicyData'),
        eWasteRewardSettlementPolicyData: entry('wasteRewardSettlementPolicy', 'eWasteRewardSettlementPolicyData'),
        eWasteCarbonSettlementPolicyData: entry('wasteCarbonSettlementPolicy', 'eWasteCarbonSettlementPolicyData'),
        eWasteCouponRedemptionSettlementPolicyData: entry('wasteCouponRedemptionSettlementPolicy', 'eWasteCouponRedemptionSettlementPolicyData')
    },
    wasteMaterial: {
        eWasteFamilyData: entry('wasteFamily', 'eWasteFamilyData'),
        eWasteCategoryData: entry('wasteCategory', 'eWasteCategoryData'),
        eWasteItemTypeData: entry('wasteItemType', 'eWasteItemTypeData'),
        eWasteMaterialTypeData: entry('wasteMaterialType', 'eWasteMaterialTypeData'),
        eWasteEvidencePolicyData: entry('wasteEvidencePolicy', 'eWasteEvidencePolicyData')
    },
    wasteCollection: {
        eWasteCollectionPointTypeData: entry('wasteCollectionPointType', 'eWasteCollectionPointTypeData'),
        eWasteCollectionPresetData: entry('wasteCollectionPreset', 'eWasteCollectionPresetData'),
        eWasteReceiptPolicyData: entry('wasteReceiptPolicy', 'eWasteReceiptPolicyData'),
        eWasteAcceptanceRuleData: entry('wasteCollectionAcceptanceRule', 'eWasteAcceptanceRuleData')
    },
    wasteVerification: {
        eWasteVerificationPolicyData: entry('wasteVerificationPolicy', 'eWasteVerificationPolicyData')
    },
    wasteImpact: {
        eWasteImpactMetricData: entry('wasteImpactMetric', 'eWasteImpactMetricData'),
        eWasteImpactProfileData: entry('wasteImpactProfile', 'eWasteImpactProfileData')
    }
};
