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
    /** Builds service credentials for owner-bounded operational lifecycle persistence. @param {Object} request Request. @returns {Object} Service auth data. */
    serviceAuthData: function (request) {
        return Object.assign({}, request.authData || {}, {
            principalId: 'commerceOrderLifecycleApiService',
            code: 'commerceOrderLifecycleApiService',
            loginId: 'commerceOrderLifecycleApiService',
            principalType: 'service',
            userGroups: ['serviceAccountUserGroup'],
            groups: ['serviceAccountUserGroup']
        });
    },
    /** Adds operational persistence fields expected by generated schemas. @param {Object} model Lifecycle model. @returns {Object} Persistable model. */
    persistenceModel: function (model) {
        const now = new Date();
        return Object.assign({ active: true, created: now, updated: now, occurredAt: model.occurredAt || now }, model);
    },
    /** Resolves the default customer-facing policy for one reverse lifecycle type. @param {string} requestType Lifecycle type. @returns {Object} Policy summary. */
    policyFor: function (requestType) {
        const policies = {
            CANCELLATION: {
                eligible: true,
                reasonCodes: ['CUSTOMER_CHANGED_MIND', 'FOUND_BETTER_PRICE', 'ORDERED_BY_MISTAKE'],
                itemSelectionRequired: true,
                quantitySelectionRequired: true,
                rejectionAppealSupported: true,
                downstreamOwners: ['order', 'payment', 'inventory', 'fulfillment', 'workflow']
            },
            RETURN: {
                eligible: true,
                reasonCodes: ['SIZE_OR_EXPECTATION_MISMATCH', 'DAMAGED_ITEM', 'WRONG_ITEM'],
                itemSelectionRequired: true,
                quantitySelectionRequired: true,
                returnMethods: ['PICKUP', 'DROP_OFF', 'STORE_RETURN'],
                rmaRequired: true,
                inspectionRequired: true,
                rejectionAppealSupported: true,
                downstreamOwners: ['order', 'fulfillment', 'inventory', 'payment', 'workflow']
            },
            REFUND: {
                eligible: true,
                reasonCodes: ['REFUND_STATUS_REQUESTED', 'PARTIAL_REFUND_REQUESTED', 'DELAYED_REFUND'],
                refundMethods: ['ORIGINAL_PAYMENT', 'STORE_CREDIT', 'MANUAL_REVIEW'],
                refundPreviewRequired: true,
                reconciliationSupported: true,
                rejectionAppealSupported: true,
                downstreamOwners: ['order', 'payment', 'workflow']
            },
            EXCHANGE: {
                eligible: true,
                reasonCodes: ['SIZE_OR_EXPECTATION_MISMATCH', 'WRONG_ITEM', 'DAMAGED_ITEM'],
                itemSelectionRequired: true,
                quantitySelectionRequired: true,
                returnMethods: ['PICKUP', 'DROP_OFF', 'STORE_RETURN'],
                rmaRequired: true,
                replacementSelectionRequired: true,
                inspectionRequired: true,
                rejectionAppealSupported: true,
                downstreamOwners: ['order', 'fulfillment', 'inventory', 'payment', 'workflow']
            },
            REPLACEMENT: {
                eligible: true,
                reasonCodes: ['DAMAGED_ITEM', 'WRONG_ITEM', 'MISSING_PART'],
                itemSelectionRequired: true,
                quantitySelectionRequired: true,
                returnMethods: ['PICKUP', 'DROP_OFF', 'STORE_RETURN'],
                rmaRequired: true,
                replacementSelectionRequired: true,
                inspectionRequired: true,
                rejectionAppealSupported: true,
                downstreamOwners: ['order', 'fulfillment', 'inventory', 'workflow']
            },
            APPEAL: {
                eligible: true,
                reasonCodes: ['CANCELLATION_REJECTED', 'RETURN_REJECTED', 'REFUND_DELAYED', 'REFUND_REJECTED'],
                itemSelectionRequired: false,
                quantitySelectionRequired: false,
                appealEvidenceRequired: true,
                downstreamOwners: ['order', 'workflow']
            }
        };
        return policies[requestType] || { eligible: false, reasonCodes: [], downstreamOwners: ['order'] };
    },

    /** Builds safe customer-provided evidence for reverse lifecycle orchestration. @param {Object} request Request. @returns {Object} Evidence. */
    evidence: function (request) {
        const input = request.payload || {};
        const evidence = Object.assign({}, input.evidence || {});
        const quantity = Number(evidence.quantity || input.quantity || 1);
        const productCodes = evidence.productCodes || input.productCodes || [];
        return Object.assign(evidence, {
            quantity: Number.isFinite(quantity) && quantity > 0 ? String(quantity) : '1',
            productCodes: Array.isArray(productCodes) ? productCodes : [productCodes].filter(Boolean),
            returnMethod: evidence.returnMethod || input.returnMethod,
            refundMethod: evidence.refundMethod || input.refundMethod || 'ORIGINAL_PAYMENT',
            customerComment: evidence.customerComment || evidence.comment || input.comment,
            replacementProductCode: evidence.replacementProductCode || input.replacementProductCode,
            preferredResolution: evidence.preferredResolution || input.preferredResolution,
            appealReferenceCode: evidence.appealReferenceCode || input.appealReferenceCode,
            appealReason: evidence.appealReason || input.appealReason,
            rmaCode: evidence.rmaCode,
            returnTrackingStatus: evidence.returnTrackingStatus || 'NOT_STARTED',
            inspectionStatus: evidence.inspectionStatus || 'PENDING',
            disposition: evidence.disposition || 'PENDING',
            refundStatus: evidence.refundStatus || 'NOT_REQUESTED',
            reconciliationStatus: evidence.reconciliationStatus || 'NOT_REQUIRED'
        });
    },

    /** Calculates a conservative customer-visible refund preview. @param {Object} request Request. @param {Object} evidence Evidence. @returns {Object} Refund preview. */
    refundPreview: function (request, evidence) {
        const amount = request.payload && request.payload.refundAmount;
        return {
            currency: request.payload && request.payload.currency || 'USD',
            amount: amount ? String(amount) : 'PENDING_CALCULATION',
            method: evidence.refundMethod || 'ORIGINAL_PAYMENT',
            status: amount ? 'ESTIMATED' : 'REQUIRES_BACKOFFICE_CALCULATION',
            reconciliationRequired: evidence.reconciliationStatus === 'REQUIRED' || (request.payload && request.payload.requestType) === 'REFUND'
        };
    },

    /** Builds owner-specific automation plan entries without executing downstream domains. @param {Object} request Request. @param {Object} policy Policy. @param {Object} evidence Evidence. @returns {Array} Plan entries. */
    automationPlan: function (request, policy, evidence) {
        const requestType = request.payload.requestType;
        const plan = [];
        if (requestType === 'CANCELLATION') {
            plan.push({ step: 'reservation-release', owner: 'inventory', trigger: 'before fulfillment release', customerVisibleState: 'Cancellation requested' });
        }
        if (['RETURN', 'EXCHANGE', 'REPLACEMENT'].includes(requestType)) {
            plan.push({ step: 'return-logistics', owner: 'fulfillment', trigger: evidence.returnMethod || 'RETURN_METHOD_REQUIRED', customerVisibleState: 'Return method selected' });
            plan.push({ step: 'inspection-disposition', owner: 'fulfillment+inventory', trigger: 'return received', customerVisibleState: 'Return received for inspection' });
        }
        if (['EXCHANGE', 'REPLACEMENT'].includes(requestType)) {
            plan.push({ step: 'replacement-reservation', owner: 'inventory', trigger: evidence.replacementProductCode || evidence.preferredResolution || 'REPLACEMENT_SELECTION_REQUIRED', customerVisibleState: 'Replacement selection received' });
            plan.push({ step: 'exchange-shipment', owner: 'fulfillment', trigger: 'replacement stock reserved', customerVisibleState: 'Replacement shipment preparation' });
        }
        if (['RETURN', 'REFUND', 'EXCHANGE'].includes(requestType)) {
            plan.push({ step: 'refund-reconciliation', owner: 'payment', trigger: evidence.refundMethod || 'ORIGINAL_PAYMENT', customerVisibleState: 'Refund review in progress' });
        }
        if (requestType === 'APPEAL' || policy.rejectionAppealSupported === true) {
            plan.push({ step: 'appeal-sla-review', owner: 'workflow+order', trigger: evidence.appealReferenceCode || 'REJECTION_OR_DELAY', customerVisibleState: requestType === 'APPEAL' ? 'Appeal submitted' : 'Appeal available if rejected' });
        }
        return plan;
    },

    /** Evaluates lifecycle request prerequisites. @param {Object} request Request. @returns {Promise<Object>} Immutable preview. */
    preview: async function (request) {
        if (!request.orderCode || !['CANCELLATION', 'RETURN', 'REFUND', 'EXCHANGE', 'REPLACEMENT', 'APPEAL'].includes(request.payload.requestType)) throw new Error('Order and lifecycle request type are required');
        const policy = this.policyFor(request.payload.requestType);
        const evidence = this.evidence(request);
        const requiresRma = ['RETURN', 'EXCHANGE', 'REPLACEMENT'].includes(request.payload.requestType);
        const preview = {
            tenant: request.tenant,
            ownerId: request.ownerId,
            orderCode: request.orderCode,
            requestType: request.payload.requestType,
            status: 'PREVIEWED',
            eligible: policy.eligible === true,
            requiresApproval: request.payload.requestType === 'REFUND',
            policyVersion: request.payload.policyVersion || '1',
            reasonCodes: policy.reasonCodes,
            itemSelectionRequired: policy.itemSelectionRequired === true,
            quantitySelectionRequired: policy.quantitySelectionRequired === true,
            replacementSelectionRequired: policy.replacementSelectionRequired === true,
            appealEvidenceRequired: policy.appealEvidenceRequired === true,
            inspectionRequired: policy.inspectionRequired === true,
            returnMethods: policy.returnMethods || [],
            refundMethods: policy.refundMethods || ['ORIGINAL_PAYMENT'],
            rmaCode: requiresRma ? evidence.rmaCode || `${request.orderCode}:RMA:${Date.now()}` : undefined,
            refundPreview: this.refundPreview(request, evidence),
            automationPlan: this.automationPlan(request, policy, evidence),
            downstreamOwners: policy.downstreamOwners,
            rejectionAppealSupported: policy.rejectionAppealSupported === true,
            correlationId: request.correlationId || request.requestId
        };
        return Object.freeze(preview);
    },
    /** Idempotently creates a lifecycle request. @param {Object} request Request. @returns {Promise<Object>} Persisted request. */
    create: async function (request) {
        if (!request.idempotencyKey) throw new Error('Idempotency-Key is required');
        const serviceAuth = this.serviceAuthData(request);
        const matches = await this.repository().list(request.tenant, { ownerId: request.ownerId, idempotencyKey: request.idempotencyKey }, serviceAuth, 1);
        if (matches && matches[0]) return matches[0];
        const preview = await this.preview(request);
        const evidence = this.evidence(request);
        if (preview.rmaCode && !evidence.rmaCode) evidence.rmaCode = preview.rmaCode;
        if (preview.refundPreview) evidence.refundPreview = preview.refundPreview;
        return this.repository().save(request.tenant, this.persistenceModel(Object.assign({}, preview, { code: request.payload.code, revision: 0, idempotencyKey: request.idempotencyKey, status: 'SUBMITTED', evidence: evidence })), serviceAuth);
    },
    /** Lists customer-owned lifecycle requests. @param {Object} request Request. @returns {Promise<Array>} Results. */
    listOwn: function (request) { return this.repository().list(request.tenant, { ownerId: request.ownerId, orderCode: request.orderCode }, this.serviceAuthData(request), request.query.limit); },
    /** Lists bounded operator lifecycle requests. @param {Object} request Request. @returns {Promise<Array>} Results. */
    list: function (request) { return this.repository().list(request.tenant, {}, request.authData, request.query.limit); },
    /** Returns true when an action is supported by Order lifecycle orchestration. @param {string} actionCode Action code. @returns {boolean} Supported flag. */
    isSupportedAction: function (actionCode) {
        return ['APPROVE', 'REJECT', 'RETRY', 'RECONCILE', 'MARK_RECEIVED', 'MARK_INSPECTED', 'DISPOSITION'].includes(actionCode);
    },
    /** Resolves the next lifecycle status for an operator action. @param {string} actionCode Action code. @returns {string} Status. */
    actionStatus: function (actionCode) {
        return { APPROVE: 'APPROVED', REJECT: 'REJECTED', RETRY: 'RETRY_PENDING', RECONCILE: 'RECONCILING', MARK_RECEIVED: 'RETURN_RECEIVED', MARK_INSPECTED: 'INSPECTED', DISPOSITION: 'DISPOSITION_RECORDED' }[actionCode];
    },
    /** Invokes downstream owner services for approved operator lifecycle actions. @param {Object} request Operator request. @param {Object} record Lifecycle record. @returns {Promise<Object>} Downstream evidence. */
    downstreamActionEvidence: async function (request, record) {
        const evidence = {}, payload = request.payload || {}, recordEvidence = record.evidence || {};
        if (record.requestType === 'REFUND' && ['APPROVE', 'RECONCILE'].includes(request.actionCode) && SERVICE.DefaultPaymentRefundExecutionService && typeof SERVICE.DefaultPaymentRefundExecutionService.executeRefund === 'function') {
            evidence.payment = await SERVICE.DefaultPaymentRefundExecutionService.executeRefund({
                tenant: request.tenant,
                ownerId: record.ownerId,
                orderCode: record.orderCode,
                cartCode: record.cartCode,
                idempotencyKey: payload.refundIdempotencyKey || [record.code, request.actionCode, 'refund'].join(':'),
                payload: {
                    amount: payload.refundAmount || (recordEvidence.refundPreview && recordEvidence.refundPreview.amount),
                    currency: payload.currency || (recordEvidence.refundPreview && recordEvidence.refundPreview.currency),
                    providerToken: payload.providerToken || 'tok_test_refund'
                },
                correlationId: request.correlationId || request.requestId,
                authData: request.authData
            });
        }
        if (record.requestType === 'RETURN' && ['MARK_RECEIVED', 'MARK_INSPECTED', 'DISPOSITION'].includes(request.actionCode) && SERVICE.DefaultFulfillmentReturnExecutionService) {
            const fulfillmentRequest = {
                tenant: request.tenant,
                ownerId: record.ownerId,
                orderCode: record.orderCode,
                cartCode: record.cartCode,
                actorId: request.actorId,
                idempotencyKey: payload.fulfillmentIdempotencyKey || [record.code, request.actionCode, 'fulfillment'].join(':'),
                payload: Object.assign({}, payload, { rmaCode: payload.rmaCode || recordEvidence.rmaCode }),
                correlationId: request.correlationId || request.requestId,
                authData: request.authData
            };
            if (request.actionCode === 'MARK_RECEIVED') evidence.fulfillment = await SERVICE.DefaultFulfillmentReturnExecutionService.recordReceipt(fulfillmentRequest);
            else evidence.fulfillment = await SERVICE.DefaultFulfillmentReturnExecutionService.recordInspection(fulfillmentRequest);
        }
        if (['EXCHANGE', 'REPLACEMENT'].includes(record.requestType) && request.actionCode === 'APPROVE') {
            const replacementRequest = {
                tenant: request.tenant,
                ownerId: record.ownerId,
                orderCode: record.orderCode,
                actorId: request.actorId,
                idempotencyKey: payload.inventoryIdempotencyKey || [record.code, request.actionCode, 'replacement'].join(':'),
                payload: Object.assign({}, payload, {
                    productCodes: payload.productCodes || recordEvidence.productCodes,
                    replacementProductCode: payload.replacementProductCode || recordEvidence.replacementProductCode,
                    preferredResolution: payload.preferredResolution || recordEvidence.preferredResolution
                }),
                correlationId: request.correlationId || request.requestId,
                authData: request.authData
            };
            if (SERVICE.DefaultInventoryReplacementReservationService && typeof SERVICE.DefaultInventoryReplacementReservationService.reserveReplacement === 'function') {
                evidence.inventory = await SERVICE.DefaultInventoryReplacementReservationService.reserveReplacement(replacementRequest);
            }
            if (SERVICE.DefaultFulfillmentExchangeShipmentService && typeof SERVICE.DefaultFulfillmentExchangeShipmentService.createExchangeShipment === 'function') {
                evidence.fulfillment = await SERVICE.DefaultFulfillmentExchangeShipmentService.createExchangeShipment(Object.assign({}, replacementRequest, {
                    idempotencyKey: payload.fulfillmentIdempotencyKey || [record.code, request.actionCode, 'exchangeShipment'].join(':')
                }));
            }
        }
        if (record.requestType === 'APPEAL' && request.actionCode === 'APPROVE' && SERVICE.DefaultWorkflowAppealSlaService && typeof SERVICE.DefaultWorkflowAppealSlaService.startAppealReview === 'function') {
            evidence.workflow = await SERVICE.DefaultWorkflowAppealSlaService.startAppealReview({
                tenant: request.tenant,
                ownerId: record.ownerId,
                orderCode: record.orderCode,
                requestCode: record.code,
                actorId: request.actorId,
                idempotencyKey: payload.workflowIdempotencyKey || [record.code, request.actionCode, 'appealSla'].join(':'),
                payload: Object.assign({}, payload, {
                    appealReferenceCode: payload.appealReferenceCode || recordEvidence.appealReferenceCode,
                    appealReason: payload.appealReason || recordEvidence.appealReason
                }),
                correlationId: request.correlationId || request.requestId,
                authData: request.authData
            });
        }
        return evidence;
    },
    /** Applies an approved maker-checker action. @param {Object} request Request. @returns {Promise<Object>} Updated request. */
    action: async function (request) {
        const record = await this.repository().get(request.tenant, request.requestCode, request.authData);
        if (!record) throw new Error('Lifecycle request not found');
        if (record.ownerId === request.actorId) throw new Error('Maker-checker separation is required');
        if (!this.isSupportedAction(request.actionCode)) throw new Error('Unsupported lifecycle action');
        const downstream = await this.downstreamActionEvidence(request, record);
        return this.repository().update(request.tenant, record, { status: this.actionStatus(request.actionCode), revision: Number(record.revision || 0) + 1, evidence: Object.assign({}, record.evidence, { lastActionBy: request.actorId, reason: request.payload.reason, downstream }) }, request.authData);
    }
};
