/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module order/src/service/defaultOrderLifecycleOperationalReadinessService @description Declares Order-owned operational readiness controls for cancellation, return, and refund lifecycle cases. @layer service @owner order */
module.exports = {
    /** Returns release-readiness controls for reverse order lifecycle operations. @returns {Object} Readiness controls. */
    contract: function () {
        return Object.freeze({
            ownerModule: 'order',
            lifecycleTypes: ['CANCELLATION', 'RETURN', 'REFUND', 'EXCHANGE', 'REPLACEMENT', 'APPEAL'],
            automationPlan: {
                ownerSteps: ['reservation-release', 'return-logistics', 'inspection-disposition', 'replacement-reservation', 'exchange-shipment', 'refund-reconciliation', 'appeal-sla-review'],
                executionOwners: ['order', 'inventory', 'fulfillment', 'payment', 'workflow'],
                customerSafeFields: ['step', 'owner', 'trigger', 'customerVisibleState']
            },
            audit: {
                requiredFields: ['actorId', 'actionCode', 'occurredAt', 'beforeStatus', 'afterStatus', 'correlationId'],
                downstreamEvidenceRequired: true
            },
            security: {
                customerOwnsOnly: true,
                operatorPermissionRequired: true,
                forbiddenCustomerFields: ['supplierCost', 'warehouseBin', 'providerSecret', 'rawCardNumber', 'cvv']
            },
            sla: {
                cancellationApprovalHours: 24,
                returnInspectionHoursAfterReceipt: 48,
                refundReconciliationHours: 72
            },
            observability: {
                metrics: ['lifecycle.submitted', 'lifecycle.approved', 'return.received', 'return.inspected', 'refund.reconciliation_required'],
                traceFields: ['tenant', 'orderCode', 'requestCode', 'requestType', 'correlationId']
            },
            releaseGates: ['customerOwnership', 'operatorActionMetadata', 'paymentRefundExecution', 'fulfillmentReturnExecution', 'ciCommerceSuite', 'liveQualification']
        });
    },
    /** Returns missing release gates for a qualification evidence object. @param {Object} evidence Qualification evidence. @returns {Object} Gate result. */
    releaseGateResult: function (evidence) {
        const contract = this.contract();
        const missing = contract.releaseGates.filter(gate => evidence && evidence[gate] !== true);
        return Object.freeze({ ready: missing.length === 0, missing });
    }
};
