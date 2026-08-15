/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module paymentCore/src/service/defaultPaymentExecutionService @description Enforces provider-neutral idempotent payment operations and evidence. @layer service @owner paymentCore */
const ALLOWED = new Set(['AUTHORIZE', 'CAPTURE', 'VOID', 'REFUND']);
const inFlight = new Map();
module.exports = {
    /** Returns true when a payment operation is supported by the provider-neutral execution contract. @param {string} operation Operation code. @returns {boolean} Supported flag. */
    isSupportedOperation: function (operation) { return ALLOWED.has(operation); },
    /** Returns a tenant/idempotency in-flight key. @param {Object} request Payment request. @returns {string} Key. */
    inFlightKey: function (request) { return request.tenant + ':' + request.idempotencyKey; },
    /** Normalizes provider outcome into stable Commerce payment statuses. @param {Object} request Payment request. @param {Object} response Provider response. @returns {Object} Normalized outcome. */
    normalizeOutcome: function (request, response) {
        const status = response && response.status || 'SUBMITTED';
        const refundMap = { REFUNDED: 'REFUND_SUCCEEDED', REFUND_SUBMITTED: 'REFUND_SUBMITTED', REFUND_PENDING: 'REFUND_DELAYED', REFUND_FAILED: 'REFUND_FAILED', RECONCILIATION_REQUIRED: 'REFUND_RECONCILIATION_REQUIRED' };
        return Object.freeze({
            status: request.operation === 'REFUND' ? refundMap[status] || status : status,
            reconciliationRequired: request.operation === 'REFUND' && ['REFUND_DELAYED', 'REFUND_FAILED', 'REFUND_RECONCILIATION_REQUIRED'].includes(refundMap[status] || status)
        });
    },
    /** Builds provider-neutral persisted transaction evidence. @param {Object} request Payment request. @param {Object} adapter Adapter. @param {Object} response Provider response. @returns {Object} Transaction model. */
    transactionModel: function (request, adapter, response) {
        const outcome = this.normalizeOutcome(request, response || {});
        return Object.freeze({
            tenant: request.tenant,
            ownerId: request.ownerId,
            orderCode: request.orderCode,
            cartCode: request.cartCode,
            operation: request.operation,
            amount: String(request.amount),
            totalAmount: String(request.amount),
            currency: request.currency,
            providerCode: adapter.code,
            providerReference: response && response.reference,
            status: outcome.status,
            idempotencyKey: request.idempotencyKey,
            correlationId: request.correlationId,
            reconciliationRequired: outcome.reconciliationRequired,
            evidence: {
                operation: request.operation,
                providerCode: adapter.code,
                providerReference: response && response.reference,
                providerStatus: response && response.status,
                sandbox: response && response.sandbox === true
            }
        });
    },
    /** Executes one idempotent provider-neutral payment operation. @param {Object} request Payment request. @param {Object} adapter Provider adapter. @param {Object} repository Persistence adapter. @returns {Promise<Object>} Stored transaction evidence. */
    execute: async function (request, adapter, repository) {
        if (!request || !request.tenant || !request.idempotencyKey || !this.isSupportedOperation(request.operation)) throw new Error('Valid tenant payment operation and idempotency key are required');
        const key = this.inFlightKey(request);
        if (inFlight.has(key)) return inFlight.get(key);
        const execution = (async () => {
            const existing = await repository.find(request.tenant, request.idempotencyKey); if (existing) return existing;
            const response = await adapter.execute(Object.freeze({ tenant: request.tenant, operation: request.operation, amount: request.amount, currency: request.currency, providerToken: request.providerToken, providerReference: request.providerReference, idempotencyKey: request.idempotencyKey, correlationId: request.correlationId }));
            return repository.record(this.transactionModel(request, adapter, response));
        })();
        inFlight.set(key, execution);
        try { return await execution; } finally { inFlight.delete(key); }
    }
};
