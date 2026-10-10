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
const captureIntents = new Map();
const { isDeepStrictEqual } = require('node:util');
module.exports = {
    /** Returns true when a payment operation is supported by the provider-neutral execution contract. @param {string} operation Operation code. @returns {boolean} Supported flag. */
    isSupportedOperation: function (operation) { return ALLOWED.has(operation); },
    /** Returns a tenant/idempotency in-flight key. @param {Object} request Payment request. @returns {string} Key. */
    inFlightKey: function (request) { return request.tenant + ':' + request.idempotencyKey; },
    /** Resolves supplied operation enterprise aliases without accepting conflicting or malformed scope. Missing legacy scope stays missing. */
    operationEnterprise: function (request) {
        const aliases = [request.enterpriseCode, request.entCode, request.authData?.enterpriseCode, request.authData?.entCode]
            .filter(value => value !== undefined);
        if (aliases.some(value => typeof value !== 'string' || !/^[A-Za-z0-9_.:@-]{1,128}$/.test(value) || value !== aliases[0]))
            throw new Error('Payment enterprise scope is invalid or conflicting');
        return aliases[0];
    },
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
        const enterpriseCode = this.operationEnterprise(request);
        return Object.freeze({
            tenant: request.tenant,
            ...(enterpriseCode ? { enterpriseCode } : {}),
            ownerId: request.ownerId,
            orderCode: request.orderCode,
            cartCode: request.cartCode,
            operation: request.operation,
            methodCode: request.methodCode,
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
                methodCode: request.methodCode,
                providerCode: adapter.code,
                providerReference: response && response.reference,
                providerStatus: response && response.status,
                sandbox: response && response.sandbox === true,
                ...(response && response.originalCaptureReceipt ? { originalCaptureReceipt: structuredClone(response.originalCaptureReceipt), maturity: response.maturity, sandboxMode: response.sandboxMode } : {}),
                ...(response && response.originalRefundReceipt ? { originalRefundReceipt: structuredClone(response.originalRefundReceipt), maturity: response.maturity, sandboxMode: response.sandboxMode } : {}),
                ...(response && response.originalRefundUnconfirmed === true ? { originalRefundUnconfirmed: true, maturity: response.maturity, sandboxMode: response.sandboxMode } : {}),
                walletCode: request.walletCode,
                programCode: request.programCode,
                rewardTypeCode: request.rewardTypeCode
            }
        });
    },
    /** Executes one idempotent provider-neutral payment operation. @param {Object} request Payment request. @param {Object} adapter Provider adapter. @param {Object} repository Persistence adapter. @returns {Promise<Object>} Stored transaction evidence. */
    execute: async function (request, adapter, repository) {
        if (!request || !request.tenant || !request.idempotencyKey || !this.isSupportedOperation(request.operation)) throw new Error('Valid tenant payment operation and idempotency key are required');
        request = { ...request, enterpriseCode: this.operationEnterprise(request) };
        const qualifiedCapture = request.operation === 'CAPTURE' && request.sandboxMode !== undefined;
        let captureIntent;
        if (qualifiedCapture) {
            if (adapter.code !== 'stripe-sandbox' || typeof adapter.captureBinding !== 'function' || typeof adapter.validateCaptureRecord !== 'function')
                throw new Error('Original offline capture owner is unavailable');
            captureIntent = adapter.captureBinding(request);
        }
        const key = this.inFlightKey(request);
        if (inFlight.has(key)) {
            if ((captureIntent || captureIntents.has(key)) && !isDeepStrictEqual(captureIntents.get(key), captureIntent))
                throw new Error('Concurrent original capture intent changed');
            return inFlight.get(key);
        }
        const execution = (async () => {
            const existing = await repository.find(request.tenant, request.idempotencyKey);
            if (existing) {
                if (existing.evidence?.originalCaptureReceipt && !qualifiedCapture)
                    throw new Error('Original capture replay cannot drop its bound offline intent');
                if (qualifiedCapture) adapter.validateCaptureRecord(request, existing);
                return existing;
            }
            const response = await adapter.execute(Object.freeze({
                tenant: request.tenant,
                enterpriseCode: request.enterpriseCode,
                authData: request.authData,
                authorization: request.methodCode === 'LOYALTY_REWARD' ? request.authorization : undefined,
                ownerId: request.ownerId,
                orderCode: request.orderCode,
                cartCode: request.cartCode,
                paymentTransactionCode: request.paymentTransactionCode,
                operation: request.operation,
                sandboxMode: request.sandboxMode,
                sandboxRefundOutcome: request.sandboxRefundOutcome,
                captureCode: request.captureCode,
                refundIntent: request.refundIntent,
                methodCode: request.methodCode,
                amount: request.amount,
                currency: request.currency,
                providerToken: request.providerToken,
                providerReference: request.providerReference,
                walletCode: request.walletCode,
                programCode: request.programCode,
                rewardTypeCode: request.rewardTypeCode,
                reversalOfEntryCode: request.reversalOfEntryCode,
                sourceCode: request.sourceCode,
                targetType: request.targetType,
                targetCode: request.targetCode,
                payload: request.payload,
                idempotencyKey: request.idempotencyKey,
                correlationId: request.correlationId
            }));
            const stored = await repository.record(this.transactionModel(request, adapter, response));
            if (qualifiedCapture) {
                const retained = await repository.find(request.tenant, request.idempotencyKey);
                adapter.validateCaptureRecord(request, retained);
                return retained;
            }
            return stored;
        })();
        inFlight.set(key, execution);
        if (captureIntent) captureIntents.set(key, captureIntent);
        try { return await execution; } finally { inFlight.delete(key); captureIntents.delete(key); }
    }
};
