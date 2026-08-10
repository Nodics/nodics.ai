/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module cardPayment/src/service/defaultCardPaymentMethodService @description Validates Card eligibility without retaining protected credentials. @layer service @owner cardPayment */
module.exports = { prepare: function (request) {
    if (!request || !request.tenant || typeof request.providerToken !== 'string' || !request.providerToken.startsWith('tok_')) throw new Error('Card requirements are not satisfied');
    return Object.freeze({ tenant: request.tenant, methodCode: 'CARD', providerToken: request.providerToken, amount: request.amount, currency: request.currency, idempotencyKey: request.idempotencyKey, correlationId: request.correlationId });
} };
