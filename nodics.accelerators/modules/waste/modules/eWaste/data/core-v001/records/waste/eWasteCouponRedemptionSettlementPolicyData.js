/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module eWaste/data/core-v001/records/eWasteCouponRedemptionSettlementPolicyData @description Provides reusable e-waste coupon redemption settlement policy references for nodics.waste. @layer data @owner eWaste */
module.exports = {
    record0: {
        code: 'EWASTE_COUPON_REDEMPTION_STANDARD',
        name: { en: 'E-Waste Coupon Redemption Standard' },
        eligibleAssetStatuses: ['OWNED', 'GIFTED'],
        rewardDebitMode: 'FULL_ELIGIBLE_BALANCE',
        rewardReserveRequired: true,
        carbonReceiverMode: 'DEFAULT_ENTERPRISE',
        carbonTransferQuantityMode: 'PROPORTIONAL_TO_REWARD_COST',
        rewardSettlementPolicyCode: 'EWASTE_COUPON_REWARD_DEBIT',
        carbonSettlementPolicyCode: 'EWASTE_COUPON_CARBON_TO_DEFAULT_ENTERPRISE',
        entitlementMode: 'CUSTOMER_OWNED',
        status: 'ACTIVE',
        revision: 1,
        active: true
    }
};
