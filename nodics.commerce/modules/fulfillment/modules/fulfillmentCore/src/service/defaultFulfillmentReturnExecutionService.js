/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module fulfillmentCore/src/service/defaultFulfillmentReturnExecutionService @description Coordinates Fulfillment-owned return shipment, receipt, inspection, and disposition evidence. @layer service @owner fulfillmentCore */
module.exports = {
    /** Builds service credentials for Fulfillment-owned operational persistence. @param {Object} request Return request. @returns {Object} Service auth data. */
    serviceAuthData: function (request) {
        return Object.assign({}, request.authData || {}, {
            principalId: 'commerceFulfillmentReturnExecutionService',
            code: 'commerceFulfillmentReturnExecutionService',
            loginId: 'commerceFulfillmentReturnExecutionService',
            principalType: 'service',
            userGroups: ['serviceAccountUserGroup'],
            groups: ['serviceAccountUserGroup']
        });
    },
    /** Adds operational persistence fields expected by generated schemas. @param {Object} model Model. @returns {Object} Persistable model. */
    persistenceModel: function (model) {
        const now = new Date();
        return Object.assign({ active: true, revision: 0, occurredAt: now, created: now, updated: now }, model);
    },
    /** Builds a deterministic RMA code when Order has not supplied one. @param {Object} request Return request. @returns {string} RMA code. */
    rmaCode: function (request) {
        const payload = request.payload || {};
        return payload.rmaCode || (payload.evidence && payload.evidence.rmaCode) || [request.orderCode, 'RMA', request.idempotencyKey || request.correlationId || Date.now()].join(':');
    },
    /** Normalizes one supported customer return method. @param {string} method Return method. @returns {string} Method. */
    returnMethod: function (method) {
        const value = method || 'DROP_OFF';
        if (!['PICKUP', 'DROP_OFF', 'STORE_RETURN'].includes(value)) throw new Error('Unsupported return method');
        return value;
    },
    /** Persists a Fulfillment Return intent and optional carrier return shipment evidence. @param {Object} request Return request. @returns {Promise<Object>} Return record. */
    createReturn: async function (request) {
        const payload = request.payload || {}, authData = this.serviceAuthData(request);
        if (!request.tenant || !request.orderCode || !request.ownerId || !request.idempotencyKey) throw new Error('Tenant owner order and idempotency key are required for return creation');
        const method = this.returnMethod(payload.returnMethod || (payload.evidence && payload.evidence.returnMethod));
        const rmaCode = this.rmaCode(request);
        const model = this.persistenceModel({
            code: payload.returnCode || rmaCode,
            tenant: request.tenant,
            ownerId: request.ownerId,
            orderCode: request.orderCode,
            cartCode: request.cartCode,
            status: method === 'PICKUP' ? 'PICKUP_REQUESTED' : method === 'STORE_RETURN' ? 'STORE_RETURN_AUTHORIZED' : 'DROP_OFF_AUTHORIZED',
            requestType: 'RETURN',
            reasonCode: payload.reasonCode,
            idempotencyKey: request.idempotencyKey,
            correlationId: request.correlationId || request.requestId,
            evidence: Object.assign({}, payload.evidence || {}, {
                rmaCode,
                returnMethod: method,
                productCodes: payload.productCodes || (payload.evidence && payload.evidence.productCodes) || [],
                quantity: String(payload.quantity || (payload.evidence && payload.evidence.quantity) || 1),
                trackingStatus: method === 'STORE_RETURN' ? 'WAITING_STORE_RECEIPT' : 'WAITING_CUSTOMER_SHIPMENT'
            })
        });
        const response = await SERVICE.DefaultFulfillmentReturnService.save({ tenant: request.tenant, authData, model });
        return response && Object.prototype.hasOwnProperty.call(response, 'result') ? response.result : response;
    },
    /** Records customer-safe tracking status for a return. @param {Object} request Tracking request. @returns {Promise<Object>} Tracking record. */
    recordTracking: async function (request) {
        const payload = request.payload || {}, nowStatus = payload.trackingStatus || 'IN_TRANSIT';
        const model = this.persistenceModel({
            code: payload.trackingCode || [request.orderCode, 'return-tracking', request.idempotencyKey].join(':'),
            tenant: request.tenant,
            ownerId: request.ownerId,
            orderCode: request.orderCode,
            status: nowStatus,
            idempotencyKey: request.idempotencyKey,
            correlationId: request.correlationId || request.requestId,
            evidence: { rmaCode: payload.rmaCode, carrierCode: payload.carrierCode, trackingNumber: payload.trackingNumber, trackingStatus: nowStatus }
        });
        const response = await SERVICE.DefaultTrackingEventService.save({ tenant: request.tenant, authData: this.serviceAuthData(request), model });
        return response && Object.prototype.hasOwnProperty.call(response, 'result') ? response.result : response;
    },
    /** Records physical receipt of returned goods. @param {Object} request Receipt request. @returns {Promise<Object>} Receipt record. */
    recordReceipt: async function (request) {
        const payload = request.payload || {};
        const model = this.persistenceModel({
            code: payload.receiptCode || [request.orderCode, 'return-receipt', request.idempotencyKey].join(':'),
            tenant: request.tenant,
            ownerId: request.ownerId,
            orderCode: request.orderCode,
            status: 'RECEIVED',
            idempotencyKey: request.idempotencyKey,
            correlationId: request.correlationId || request.requestId,
            evidence: { rmaCode: payload.rmaCode, receivedQuantity: String(payload.receivedQuantity || payload.quantity || 1), receivedAt: new Date().toISOString(), packageCondition: payload.packageCondition || 'PENDING_INSPECTION' }
        });
        const response = await SERVICE.DefaultReturnReceiptService.save({ tenant: request.tenant, authData: this.serviceAuthData(request), model });
        return response && Object.prototype.hasOwnProperty.call(response, 'result') ? response.result : response;
    },
    /** Records inspection and inventory disposition result. @param {Object} request Inspection request. @returns {Promise<Object>} Inspection record. */
    recordInspection: async function (request) {
        const payload = request.payload || {}, disposition = payload.disposition || 'RESTOCK';
        if (!['RESTOCK', 'REFURBISH', 'SCRAP', 'REJECT_RETURN'].includes(disposition)) throw new Error('Unsupported return disposition');
        const model = this.persistenceModel({
            code: payload.inspectionCode || [request.orderCode, 'return-inspection', request.idempotencyKey].join(':'),
            tenant: request.tenant,
            ownerId: request.ownerId,
            orderCode: request.orderCode,
            status: disposition === 'REJECT_RETURN' ? 'REJECTED' : 'INSPECTED',
            requestType: 'RETURN',
            reasonCode: payload.reasonCode,
            idempotencyKey: request.idempotencyKey,
            correlationId: request.correlationId || request.requestId,
            evidence: { rmaCode: payload.rmaCode, inspectionStatus: disposition === 'REJECT_RETURN' ? 'FAILED' : 'PASSED', disposition, refundEligible: disposition !== 'REJECT_RETURN', inspectorId: request.actorId || request.ownerId }
        });
        const response = await SERVICE.DefaultReturnInspectionService.save({ tenant: request.tenant, authData: this.serviceAuthData(request), model });
        return response && Object.prototype.hasOwnProperty.call(response, 'result') ? response.result : response;
    }
};
