/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const { isDeepStrictEqual } = require("node:util");

/**
 * @module paymentCore/service/defaultPaymentReadEvidenceService
 * @description Reads one exact Payment journey through its generated owner without exposing provider credentials or accepting persistence queries.
 * @layer service
 * @owner paymentCore
 * @override Preserve the original signed service principal, exact journey selectors, bounded reads, and safe evidence projection.
 */
module.exports = {
    /**
     * Rejects malformed, unauthorized, ambiguous, or changed Payment evidence.
     * @returns {never} Always throws a bounded evidence error.
     */
    fail: function () {
        const error = new Error("Exact authorized Payment evidence is unavailable");
        error.code = "ERR_PAYMENT_EVIDENCE_UNAVAILABLE";
        throw error;
    },

    /**
     * Checks the fixed identifier grammar used by Payment journey coordinates.
     * @param {*} value Candidate identifier.
     * @returns {boolean} Whether the value is a bounded scalar identifier.
     */
    identifier: function (value) {
        return typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9_.:@|\-]{0,191}$/.test(value);
    },

    /**
     * Reads the exact transaction entries for one original Cart and Order.
     * @param {Object} request Original private service request.
     * @returns {Promise<Object>} Bounded safe Payment evidence.
     * @throws {Error} When authority, selectors, generated evidence, or retained identity is incomplete.
     */
    query: async function (request) {
        if (SERVICE.DefaultLoggerService?.hasPrivateCaptureProtection?.(request) !== true) this.fail();
        const auth = SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(request, "paymentCore");
        const payload = request.payload;
        const fields = ["orderCode", "cartCode", "ownerId"];
        if (auth !== request.authData || auth.principalType !== "service" || auth.isSystem ||
            !auth.permissions?.includes("commerce.payment.read") || !this.identifier(auth.tenant) ||
            !payload || typeof payload !== "object" || Array.isArray(payload) ||
            Object.keys(payload).sort().join() !== fields.sort().join() || fields.some(key => !this.identifier(payload[key])) ||
            [request.tenantCode, auth.tenantCode].some(value => value !== undefined && value !== auth.tenant) ||
            [request.enterpriseCode, request.entCode, request.httpRequest?.headers?.["x-enterprise-code"]]
                .some(value => value !== undefined && value !== auth.entCode) || Object.keys(request.query || {}).length) this.fail();
        const snapshot = structuredClone({ auth: request.authData, payload: request.payload, tenant: request.tenant });
        const response = await SERVICE.DefaultPaymentTransactionEntryService.get({
            tenant: auth.tenant,
            authData: auth,
            query: { tenant: auth.tenant, orderCode: payload.orderCode, cartCode: payload.cartCode, ownerId: payload.ownerId },
            options: { recursive: false, skipItemCache: true },
            searchOptions: { limit: 9, pageSize: 9, pageNumber: 1 },
        });
        if (!isDeepStrictEqual(snapshot, { auth: request.authData, payload: request.payload, tenant: request.tenant }) ||
            SERVICE.DefaultLoggerService?.hasPrivateCaptureProtection?.(request) !== true ||
            !/^SUC_/.test(response?.code || "") || response.success === false || response.acknowledged === false ||
            response.error || response.errors && (!Array.isArray(response.errors) || response.errors.length) ||
            !Array.isArray(response.result) || !response.result.length || response.result.length > 8 ||
            [response.count, response.total, response.totalCount].some(value =>
                value !== undefined && (!Number.isSafeInteger(value) || value !== response.result.length)) ||
            response.result.some(row => !row || !this.identifier(row.code) || row.tenant !== auth.tenant ||
                row.orderCode !== payload.orderCode || row.cartCode !== payload.cartCode || row.ownerId !== payload.ownerId ||
                !["AUTHORIZE", "CAPTURE", "VOID", "REFUND"].includes(row.evidence?.operation) ||
                !this.identifier(row.evidence?.methodCode) || !this.identifier(row.evidence?.providerCode))) this.fail();
        const enterprises = new Set(response.result.map(row => row.enterpriseCode).filter(Boolean));
        if (enterprises.size > 1) this.fail();
        return {
            contractVersion: 1,
            orderCode: payload.orderCode,
            cartCode: payload.cartCode,
            ownerId: payload.ownerId,
            enterpriseCode: [...enterprises][0],
            transactions: response.result.map(row => ({
                code: row.code,
                status: row.status,
                operation: row.evidence.operation,
                methodCode: row.evidence.methodCode,
                providerCode: row.evidence.providerCode,
                providerReference: row.evidence.providerReference,
                walletCode: row.evidence.walletCode,
                programCode: row.evidence.programCode,
                rewardTypeCode: row.evidence.rewardTypeCode,
                totalAmount: row.totalAmount,
                correlationId: row.correlationId,
            })),
        };
    },
};
