/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module eWaste/data/core-v001/records/eWasteAssetTypeData @description Provides reusable e-waste asset type records for nodics.waste. @layer data @owner eWaste */
const assetType = (code, name, familyCode, categoryCode, itemTypeCode, materialTypeCodes, options) => Object.assign({
    code,
    name: { en: name },
    familyCode,
    categoryCode,
    itemTypeCode,
    materialTypeCodes,
    defaultImpactProfileCode: 'EWASTE_WEIGHT_ESTIMATE',
    defaultTransferPolicyCode: 'EWASTE_GIFT_TRANSFER_STANDARD',
    defaultMarketplaceEligibilityPolicyCode: 'EWASTE_PUBLIC_MARKETPLACE_BIDDING',
    defaultRewardSettlementPolicyCode: 'EWASTE_APPROVAL_REWARD_STANDARD',
    defaultCarbonSettlementPolicyCode: 'EWASTE_APPROVAL_CARBON_STANDARD',
    defaultCouponRedemptionSettlementPolicyCode: 'EWASTE_COUPON_REDEMPTION_STANDARD',
    certificateAllowed: true,
    marketplaceEligibleByDefault: true,
    giftableByDefault: true,
    status: 'ACTIVE',
    revision: 1,
    active: true
}, options || {});

module.exports = {
    record0: assetType('EWASTE_MOBILE_DEVICE_ASSET', 'E-Waste Mobile Device Asset', 'ELECTRONICS', 'MOBILE_DEVICE', 'SMARTPHONE', ['LITHIUM_BATTERY', 'CIRCUIT_BOARD', 'PLASTIC_CASING', 'GLASS_SCREEN']),
    record1: assetType('EWASTE_LAPTOP_ASSET', 'E-Waste Laptop Asset', 'ELECTRONICS', 'LAPTOP_COMPUTER', 'LAPTOP', ['LITHIUM_BATTERY', 'CIRCUIT_BOARD', 'ALUMINUM', 'PLASTIC_CASING']),
    record2: assetType('EWASTE_ACCESSORY_ASSET', 'E-Waste Accessory Asset', 'ELECTRONICS', 'CABLE_CHARGER', 'CHARGER', ['COPPER', 'PLASTIC_CASING'], {
        defaultImpactProfileCode: 'EWASTE_ITEM_COUNT'
    }),
    record3: assetType('EWASTE_BATTERY_ASSET', 'E-Waste Battery Asset', 'BATTERY', 'LITHIUM_BATTERY', 'LOOSE_LITHIUM_BATTERY', ['LITHIUM_BATTERY'], {
        defaultImpactProfileCode: 'EWASTE_BATTERY_COUNT',
        defaultMarketplaceEligibilityPolicyCode: 'EWASTE_RESTRICTED_MARKETPLACE_REVIEW',
        certificateAllowed: true,
        marketplaceEligibleByDefault: false,
        giftableByDefault: false
    })
};
