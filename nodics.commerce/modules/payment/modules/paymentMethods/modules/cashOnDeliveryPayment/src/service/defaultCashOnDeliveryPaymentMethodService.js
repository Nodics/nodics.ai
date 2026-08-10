/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module cashOnDeliveryPayment/src/service/defaultCashOnDeliveryPaymentMethodService @description Validates Cash on delivery eligibility without retaining protected credentials. @layer service @owner cashOnDeliveryPayment */
module.exports = { prepare: function (request) {
    if (!request || !request.tenant || request.acceptTerms !== true) throw new Error('Cash on delivery requirements are not satisfied');
    return Object.freeze({ tenant: request.tenant, methodCode: 'CASH_ON_DELIVERY', providerToken: undefined, amount: request.amount, currency: request.currency, idempotencyKey: request.idempotencyKey, correlationId: request.correlationId });
} };
