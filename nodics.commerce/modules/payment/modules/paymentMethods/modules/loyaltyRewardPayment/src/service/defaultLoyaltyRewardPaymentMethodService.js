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
    /** Reads effective reward payment configuration from the Nodics configuration layer. */
    config: function () {
        return typeof CONFIG !== 'undefined' && CONFIG.get && CONFIG.get('loyaltyRewardPayment') || {};
    },
    /** Throws the owning operation error and stops processing; callers retain responsibility for recovery. */
    fail: function (message) {
        throw new Error(message);
    },
    /** Rejects a missing or blank required value before dispatching the owning operation. */
    required: function (value, name) {
        if (value === undefined || value === null || String(value).trim() === '') this.fail(name + ' is required');
        return value;
    },
    /** Validates the calculated total and reward currency, rejects amount overrides, and freezes the provider-neutral payment request. */
    prepare: function (request) {
        const config = this.config();
        if (!request || !request.tenant) this.fail('Loyalty reward payment requires tenant context');
        const walletCode = this.required(request.walletCode, 'walletCode');
        const amount = this.required(request.amount, 'calculated amount');
        if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) this.fail('Calculated reward amount must be positive');
        if (request.rewardAmount !== undefined && Number(request.rewardAmount) !== Number(amount)) this.fail('Reward amount must match the calculated order total');
        if (request.rewardCurrency && request.rewardCurrency !== request.currency) this.fail('Reward currency must match the calculated order currency');
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
            currency: request.currency,
            idempotencyKey: request.idempotencyKey,
            correlationId: request.correlationId
        });
    }
};
