/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module eWaste/data/core-v001/records/eWasteMarketplaceEligibilityPolicyData @description Provides reusable e-waste marketplace eligibility policy records for nodics.waste. @layer data @owner eWaste */
module.exports = {
    record0: {
        code: 'EWASTE_PUBLIC_MARKETPLACE_BIDDING',
        name: { en: 'E-Waste Public Marketplace Bidding' },
        eligibleAssetStatuses: ['OWNED'],
        eligibleCustodyStatuses: ['CUSTOMER_HELD', 'DROPPED_AT_COLLECTION_POINT'],
        listingMode: 'BIDDING',
        visibilityMode: 'PUBLIC_MARKETPLACE',
        valuationMode: 'CARBON_VALUE_SUGGESTED',
        productProjectionMode: 'COMMERCE_LISTING',
        requiresComplianceReview: false,
        status: 'ACTIVE',
        revision: 1,
        active: true
    },
    record1: {
        code: 'EWASTE_RESTRICTED_MARKETPLACE_REVIEW',
        name: { en: 'E-Waste Restricted Marketplace Review' },
        eligibleAssetStatuses: ['OWNED'],
        eligibleCustodyStatuses: ['RECEIVED_BY_OPERATOR', 'PROCESSED'],
        listingMode: 'BIDDING',
        visibilityMode: 'ENTERPRISE_BUYERS',
        valuationMode: 'MATERIAL_SUGGESTED',
        productProjectionMode: 'POLICY_RESOLVED',
        requiresComplianceReview: true,
        status: 'ACTIVE',
        revision: 1,
        active: true
    }
};
