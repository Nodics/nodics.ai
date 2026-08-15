/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
const crypto = require('node:crypto');
/** @module stripeProvider/src/service/defaultStripeSandboxAdapterService @description Deterministic offline Stripe-shaped sandbox adapter for conformance testing only. @layer service @owner stripeProvider */
module.exports = {
    code: 'stripe-sandbox',
    /** Executes a deterministic offline provider operation. @param {Object} request Sandbox request with opaque test token. @returns {Promise<Object>} Provider-shaped evidence. */
    execute: async function (request) {
        if (!request || !request.tenant || !request.idempotencyKey || !['AUTHORIZE', 'CAPTURE', 'VOID', 'REFUND'].includes(request.operation)) throw new Error('Invalid sandbox payment request');
        if (typeof request.providerToken !== 'string' || !request.providerToken.startsWith('tok_test_')) throw new Error('Sandbox token required');
        const reference = 'sim_' + crypto.createHash('sha256').update([request.tenant, request.operation, request.idempotencyKey].join(':')).digest('hex').slice(0, 24);
        let status = { AUTHORIZE: 'AUTHORIZED', CAPTURE: 'CAPTURED', VOID: 'VOIDED', REFUND: 'REFUNDED' }[request.operation];
        if (request.operation === 'REFUND' && request.providerToken.includes('_delay')) status = 'REFUND_PENDING';
        if (request.operation === 'REFUND' && request.providerToken.includes('_fail')) status = 'REFUND_FAILED';
        return Object.freeze({ reference, status, sandbox: true });
    }
};
