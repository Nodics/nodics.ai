/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module fulfillmentCore/src/service/defaultFulfillmentIntegrationReadinessService @description Declares Fulfillment-owned enterprise integration readiness requirements for carriers, return logistics, and warehouse receipt feeds. @layer service @owner fulfillmentCore */
module.exports = {
    /** Returns carrier and warehouse integration controls for shipment, return, receipt, and inspection flows. @returns {Object} Readiness contract. */
    contract: function () {
        return Object.freeze({
            ownerModule: 'fulfillmentCore',
            providerBoundary: 'CARRIER_AND_WAREHOUSE_ADAPTER',
            secretPolicy: 'RUNTIME_CONFIGURATION_ONLY',
            idempotency: {
                required: true,
                keyFields: ['tenant', 'orderCode', 'rmaCode', 'carrierCode', 'trackingNumber', 'idempotencyKey']
            },
            returnMethods: ['PICKUP', 'DROP_OFF', 'STORE_RETURN'],
            carrierEvents: ['LABEL_CREATED', 'PICKUP_BOOKED', 'IN_TRANSIT', 'DELIVERED', 'EXCEPTION'],
            warehouseEvents: ['RETURN_RECEIVED', 'INSPECTION_PASSED', 'INSPECTION_FAILED', 'DISPOSITION_RECORDED'],
            disposition: {
                allowedValues: ['RESTOCK', 'REFURBISH', 'SCRAP', 'REJECT_RETURN'],
                inventoryAdjustmentRequiredFor: ['RESTOCK', 'SCRAP', 'REFURBISH']
            },
            liveCertification: {
                requiredFields: ['liveEvidenceReference', 'certifiedAt', 'certifiedBy', 'productionTrafficApproved'],
                certificationAuthority: 'BACKOFFICE_OPERATOR_WITH_FULFILLMENT_PERMISSION',
                productionTrafficApprovalRequired: true
            },
            customerSafety: {
                neverExpose: ['warehouseBin', 'supplierCost', 'internalCarrierCredential', 'inspectionPrivateNote'],
                exposeOnly: ['rmaCode', 'returnMethod', 'trackingStatus', 'receivedQuantity', 'disposition', 'refundEligible']
            }
        });
    },
    /** Validates a carrier or warehouse declaration before production integration. @param {Object} adapter Provider declaration. @returns {Object} Validation result. */
    validateAdapter: function (adapter) {
        const missing = [];
        if (!adapter || typeof adapter !== 'object') missing.push('adapter');
        if (!adapter.providerCode) missing.push('providerCode');
        if (!Array.isArray(adapter.supportedReturnMethods) || !adapter.supportedReturnMethods.includes('DROP_OFF')) missing.push('supportedReturnMethods.DROP_OFF');
        if (!Array.isArray(adapter.supportedEvents) || !adapter.supportedEvents.includes('DELIVERED')) missing.push('supportedEvents.DELIVERED');
        if (adapter.webhookSignatureValidation !== true) missing.push('webhookSignatureValidation');
        if (adapter.idempotencyRequired !== true) missing.push('idempotencyRequired');
        if (adapter.secretSource !== 'RUNTIME_CONFIGURATION') missing.push('secretSource');
        if (!adapter.liveEvidenceReference) missing.push('liveEvidenceReference');
        if (!adapter.certifiedAt) missing.push('certifiedAt');
        if (!adapter.certifiedBy) missing.push('certifiedBy');
        if (adapter.productionTrafficApproved !== true) missing.push('productionTrafficApproved');
        return Object.freeze({ ready: missing.length === 0, missing });
    }
};
