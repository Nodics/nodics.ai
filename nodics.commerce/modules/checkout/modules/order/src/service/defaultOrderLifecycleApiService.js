/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module order/src/service/defaultOrderLifecycleApiService @description Persists immutable lifecycle intent and maker-checker decisions through generated repositories. @layer service @owner order */
module.exports = {
    /** Resolves the lifecycle repository adapter. @returns {Object} Repository service. */
    repository: function () { return SERVICE.DefaultOrderLifecycleRepositoryService; },
    /** Evaluates lifecycle request prerequisites. @param {Object} request Request. @returns {Promise<Object>} Immutable preview. */
    preview: async function (request) {
        if (!request.orderCode || !['CANCELLATION', 'RETURN', 'REFUND'].includes(request.payload.requestType)) throw new Error('Order and lifecycle request type are required');
        return Object.freeze({ tenant: request.tenant, ownerId: request.ownerId, orderCode: request.orderCode, requestType: request.payload.requestType, status: 'PREVIEWED', requiresApproval: request.payload.requestType === 'REFUND', policyVersion: request.payload.policyVersion || '1', correlationId: request.correlationId || request.requestId });
    },
    /** Idempotently creates a lifecycle request. @param {Object} request Request. @returns {Promise<Object>} Persisted request. */
    create: async function (request) {
        if (!request.idempotencyKey) throw new Error('Idempotency-Key is required');
        const matches = await this.repository().list(request.tenant, { ownerId: request.ownerId, idempotencyKey: request.idempotencyKey }, request.authData, 1);
        if (matches && matches[0]) return matches[0];
        const preview = await this.preview(request);
        return this.repository().save(request.tenant, Object.assign({}, preview, { code: request.payload.code, revision: 0, idempotencyKey: request.idempotencyKey, status: 'SUBMITTED', evidence: request.payload.evidence || {} }), request.authData);
    },
    /** Lists customer-owned lifecycle requests. @param {Object} request Request. @returns {Promise<Array>} Results. */
    listOwn: function (request) { return this.repository().list(request.tenant, { ownerId: request.ownerId, orderCode: request.orderCode }, request.authData, request.query.limit); },
    /** Lists bounded operator lifecycle requests. @param {Object} request Request. @returns {Promise<Array>} Results. */
    list: function (request) { return this.repository().list(request.tenant, {}, request.authData, request.query.limit); },
    /** Applies an approved maker-checker action. @param {Object} request Request. @returns {Promise<Object>} Updated request. */
    action: async function (request) {
        const record = await this.repository().get(request.tenant, request.requestCode, request.authData);
        if (!record) throw new Error('Lifecycle request not found');
        if (record.ownerId === request.actorId) throw new Error('Maker-checker separation is required');
        if (!['APPROVE', 'REJECT', 'RETRY', 'RECONCILE'].includes(request.actionCode)) throw new Error('Unsupported lifecycle action');
        return this.repository().update(request.tenant, record, { status: request.actionCode === 'APPROVE' ? 'APPROVED' : request.actionCode === 'REJECT' ? 'REJECTED' : request.actionCode === 'RETRY' ? 'RETRY_PENDING' : 'RECONCILING', revision: Number(record.revision || 0) + 1, evidence: Object.assign({}, record.evidence, { lastActionBy: request.actorId, reason: request.payload.reason }) }, request.authData);
    }
};
