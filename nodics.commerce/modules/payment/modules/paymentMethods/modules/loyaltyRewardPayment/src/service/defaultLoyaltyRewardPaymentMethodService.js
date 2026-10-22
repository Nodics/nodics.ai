/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module loyaltyRewardPayment/src/service/defaultLoyaltyRewardPaymentMethodService
 * @description Validates Loyalty reward payment eligibility without reading or mutating Loyalty wallet
 * balances.
 * @layer service
 * @owner loyaltyRewardPayment
 * @override Later modules may add conversion or eligibility rules while preserving provider-neutral
 * payment evidence.
 * @remarks The Loyalty reward Payment method owns its configuration contract and immutable
 * provider-neutral preparation. Loyalty owns amounts and wallet effects; callers cannot override
 * calculated monetary consideration.
 * Inputs and outputs are specified on each exported member below.
 * Effects and failures remain in the existing owner flow; missing evidence is never synthetic success.
 * Exported members: config, fail, required, prepare.
 * @override Customize through the existing loader-visible module members, preserving private
 * authority.
 */
module.exports = {
    /**
     * Reads effective reward payment configuration from the Nodics configuration layer.
     * @returns {Object} Validated effective reward-method policy.
     * @remarks Effects: Reads implementing module properties through CONFIG only.
     * Failure behavior: Rejects missing, disabled or malformed method definitions.
     * @override Override through the effective module member; retain the original owner, scope and
     * evidence checks described above.
     */
    config: function () {
        const config = CONFIG.get('loyaltyRewardPayment');
        if (!config || config.enabled !== true || ['providerCode', 'defaultProgramCode', 'defaultRewardTypeCode', 'defaultCurrency']
            .some(key => typeof config[key] !== 'string' || !config[key].trim())) this.fail('Complete Loyalty reward payment configuration is required');
        return config;
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
    /**
     * Validates the calculated total and reward currency, rejects amount overrides, and freezes the
     * provider-neutral payment request.
     * @param {Object} request Original owner request with tenant, authData and operation selectors;
     * payload is not authority.
     * @returns {Object} Frozen original payment request with exact calculated reward amount/currency and
     * participant binding.
     * @remarks Effects: Validates and projects input; does not acquire funds.
     * Failure behavior: Rejects unsupported currency, malformed amount, unqualified consideration or
     * amount override.
     * @override Override through the effective module member; retain the original owner, scope and
     * evidence checks described above.
     */
    prepare: function (request) {
        const config = this.config();
        if (!request || !request.tenant) this.fail('Loyalty reward payment requires tenant context');
        const walletCode = this.required(request.walletCode, 'walletCode');
        const amount = this.required(request.amount, 'calculated amount');
        const exact = SERVICE.DefaultExactAmountService;
        if (!exact?.compare) this.fail('Canonical exact amount owner is required');
        if (exact.compare(amount, '0') <= 0) this.fail('Calculated reward amount must be positive');
        if (request.rewardAmount !== undefined && exact.compare(request.rewardAmount, amount) !== 0) this.fail('Reward amount must match the calculated order total');
        if (request.rewardCurrency && request.rewardCurrency !== request.currency) this.fail('Reward currency must match the calculated order currency');
        return Object.freeze({
            tenant: request.tenant,
            authData: request.authData,
            authorization: request.authorization,
            ownerId: request.ownerId,
            ownerRef: request.ownerRef,
            actorRef: request.actorRef,
            enterpriseCode: request.enterpriseCode,
            participantEnterpriseCode: request.participantEnterpriseCode,
            orderCode: request.orderCode,
            cartCode: request.cartCode,
            methodCode: 'LOYALTY_REWARD',
            providerCode: config.providerCode,
            providerToken: undefined,
            walletCode,
            programCode: request.programCode ?? config.defaultProgramCode,
            rewardTypeCode: request.rewardTypeCode ?? config.defaultRewardTypeCode,
            amount,
            currency: request.currency,
            idempotencyKey: request.idempotencyKey,
            correlationId: request.correlationId
        });
    }
};
