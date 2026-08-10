/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module walletPayment/src/service/defaultWalletPaymentMethodService @description Validates Wallet eligibility without retaining protected credentials. @layer service @owner walletPayment */
module.exports = { prepare: function (request) {
    if (!request || !request.tenant || typeof request.providerToken !== 'string' || !request.providerToken.startsWith('wallet_')) throw new Error('Wallet requirements are not satisfied');
    return Object.freeze({ tenant: request.tenant, methodCode: 'WALLET', providerToken: request.providerToken, amount: request.amount, currency: request.currency, idempotencyKey: request.idempotencyKey, correlationId: request.correlationId });
} };
