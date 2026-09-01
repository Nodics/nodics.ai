/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module loyaltyRewardPayment/src/service/defaultLoyaltyRewardPaymentMethodService @description Validates Loyalty reward payment eligibility without reading or mutating Loyalty wallet balances. @layer service @owner loyaltyRewardPayment @override Later modules may add conversion or eligibility rules while preserving provider-neutral payment evidence. */
module.exports = {
    config: function () {
        return typeof CONFIG !== 'undefined' && CONFIG.get && CONFIG.get('loyaltyRewardPayment') || {};
    },
    fail: function (message) {
        throw new Error(message);
    },
    required: function (value, name) {
        if (value === undefined || value === null || String(value).trim() === '') this.fail(name + ' is required');
        return value;
    },
    prepare: function (request) {
        const config = this.config();
        if (!request || !request.tenant) this.fail('Loyalty reward payment requires tenant context');
        const walletCode = this.required(request.walletCode, 'walletCode');
        const amount = this.required(request.rewardAmount || request.amount, 'rewardAmount');
        return Object.freeze({
            tenant: request.tenant,
            authData: request.authData,
            ownerId: request.ownerId,
            orderCode: request.orderCode,
            cartCode: request.cartCode,
            methodCode: 'LOYALTY_REWARD',
            providerCode: config.providerCode || 'loyalty-reward-points',
            providerToken: undefined,
            walletCode,
            programCode: request.programCode || config.defaultProgramCode || 'default',
            rewardTypeCode: request.rewardTypeCode || config.defaultRewardTypeCode || 'points',
            amount,
            currency: request.rewardCurrency || config.defaultCurrency || 'POINTS',
            idempotencyKey: request.idempotencyKey,
            correlationId: request.correlationId
        });
    }
};
