/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module eWaste/data/core-v001/records/eWasteAssetCreationPolicyData @description Provides reusable e-waste approved-submission asset creation policies for nodics.waste. @layer data @owner eWaste */
module.exports = {
    record0: {
        code: 'EWASTE_APPROVED_ASSET_STANDARD',
        name: { en: 'E-Waste Approved Asset Standard' },
        sourceStatusRequired: 'APPROVED',
        verificationStatusRequired: 'APPROVED',
        requiresEvidence: true,
        requiresReceipt: false,
        requiresImpactResult: false,
        duplicateStrategy: 'RETURN_EXISTING',
        assetCodeStrategy: 'SOURCE_SUBMISSION',
        assetCodePrefix: 'EWASTE_ASSET',
        initialCustodyStatus: 'CUSTOMER_HELD',
        initialAssetStatus: 'OWNED',
        rewardSettlementPolicyCode: 'EWASTE_APPROVAL_REWARD_STANDARD',
        carbonSettlementPolicyCode: 'EWASTE_APPROVAL_CARBON_STANDARD',
        settlementReferenceFailureMode: 'LOCK_ASSET',
        status: 'ACTIVE',
        revision: 1,
        active: true
    }
};
