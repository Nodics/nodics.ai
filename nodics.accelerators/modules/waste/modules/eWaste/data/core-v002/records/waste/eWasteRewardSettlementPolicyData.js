/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module eWaste/data/core-v001/records/eWasteRewardSettlementPolicyData @description Provides reusable e-waste reward settlement policy references for nodics.waste. @layer data @owner eWaste */
module.exports = {
    record0: {
        code: 'EWASTE_APPROVAL_REWARD_STANDARD',
        name: { en: 'E-Waste Approval Reward Standard' },
        triggerType: 'APPROVAL',
        settlementMode: 'CREDIT_ORIGINAL_OWNER',
        walletCurrencyCode: 'SUSTAINABILITY_REWARD',
        reversalAllowed: true,
        status: 'ACTIVE',
        revision: 1,
        active: true
    },
    record1: {
        code: 'EWASTE_SALE_REWARD_RETAIN_OWNER',
        name: { en: 'E-Waste Sale Reward Retain Owner' },
        triggerType: 'SALE',
        settlementMode: 'NONE',
        walletCurrencyCode: 'SUSTAINABILITY_REWARD',
        reversalAllowed: true,
        status: 'ACTIVE',
        revision: 1,
        active: true
    },
    record2: {
        code: 'EWASTE_GIFT_REWARD_TRANSFER',
        name: { en: 'E-Waste Gift Reward Transfer' },
        triggerType: 'GIFT',
        settlementMode: 'TRANSFER_TO_COUNTERPARTY',
        walletCurrencyCode: 'SUSTAINABILITY_REWARD',
        reversalAllowed: true,
        status: 'ACTIVE',
        revision: 1,
        active: true
    },
    record3: {
        code: 'EWASTE_COUPON_REWARD_DEBIT',
        name: { en: 'E-Waste Coupon Reward Debit' },
        triggerType: 'COUPON_PURCHASE',
        settlementMode: 'DEBIT_FULL_ELIGIBLE',
        walletCurrencyCode: 'SUSTAINABILITY_REWARD',
        reversalAllowed: true,
        status: 'ACTIVE',
        revision: 1,
        active: true
    }
};
