/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module eWaste/data/core-v001/records/eWasteCarbonSettlementPolicyData @description Provides reusable e-waste carbon settlement policy references for nodics.waste. @layer data @owner eWaste */
module.exports = {
    record0: {
        code: 'EWASTE_APPROVAL_CARBON_STANDARD',
        name: { en: 'E-Waste Approval Carbon Standard' },
        triggerType: 'APPROVAL',
        settlementMode: 'ISSUE_TO_OWNER',
        carbonUnitCode: 'CARBON_CREDIT',
        provenanceRequired: true,
        complianceReviewRequired: false,
        reversalAllowed: true,
        status: 'ACTIVE',
        revision: 1,
        active: true
    },
    record1: {
        code: 'EWASTE_SALE_CARBON_TRANSFER',
        name: { en: 'E-Waste Sale Carbon Transfer' },
        triggerType: 'SALE',
        settlementMode: 'TRANSFER_TO_COUNTERPARTY',
        carbonUnitCode: 'CARBON_CREDIT',
        provenanceRequired: true,
        complianceReviewRequired: false,
        reversalAllowed: true,
        status: 'ACTIVE',
        revision: 1,
        active: true
    },
    record2: {
        code: 'EWASTE_GIFT_CARBON_TRANSFER',
        name: { en: 'E-Waste Gift Carbon Transfer' },
        triggerType: 'GIFT',
        settlementMode: 'TRANSFER_TO_COUNTERPARTY',
        carbonUnitCode: 'CARBON_CREDIT',
        provenanceRequired: true,
        complianceReviewRequired: false,
        reversalAllowed: true,
        status: 'ACTIVE',
        revision: 1,
        active: true
    },
    record3: {
        code: 'EWASTE_COUPON_CARBON_TO_DEFAULT_ENTERPRISE',
        name: { en: 'E-Waste Coupon Carbon To Default Enterprise' },
        triggerType: 'COUPON_PURCHASE',
        settlementMode: 'TRANSFER_TO_DEFAULT_ENTERPRISE',
        carbonUnitCode: 'CARBON_CREDIT',
        provenanceRequired: true,
        complianceReviewRequired: false,
        reversalAllowed: true,
        status: 'ACTIVE',
        revision: 1,
        active: true
    }
};
