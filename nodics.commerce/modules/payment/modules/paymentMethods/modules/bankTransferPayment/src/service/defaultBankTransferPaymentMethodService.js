/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module bankTransferPayment/src/service/defaultBankTransferPaymentMethodService @description Validates Bank transfer eligibility without retaining protected credentials. @layer service @owner bankTransferPayment */
module.exports = { prepare: function (request) {
    if (!request || !request.tenant || typeof request.bankReference !== 'string' || !request.bankReference.startsWith('bank_')) throw new Error('Bank transfer requirements are not satisfied');
    return Object.freeze({ tenant: request.tenant, methodCode: 'BANK_TRANSFER', providerToken: request.bankReference, amount: request.amount, currency: request.currency, idempotencyKey: request.idempotencyKey, correlationId: request.correlationId });
} };
