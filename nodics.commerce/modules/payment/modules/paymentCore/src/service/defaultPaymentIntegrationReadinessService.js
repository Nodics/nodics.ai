/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module paymentCore/src/service/defaultPaymentIntegrationReadinessService @description Declares Payment-owned enterprise integration readiness requirements for provider adapters and webhooks. @layer service @owner paymentCore */
module.exports = {
    /** Returns provider-neutral readiness controls that every real Payment adapter must satisfy. @returns {Object} Readiness contract. */
    contract: function () {
        return Object.freeze({
            ownerModule: 'paymentCore',
            providerBoundary: 'PAYMENT_PROVIDER_ADAPTER',
            secretPolicy: 'RUNTIME_CONFIGURATION_ONLY',
            idempotency: {
                required: true,
                keyFields: ['tenant', 'operation', 'orderCode', 'amount', 'currency', 'providerReference', 'idempotencyKey']
            },
            webhook: {
                requiredEvents: ['PAYMENT_AUTHORIZED', 'PAYMENT_CAPTURED', 'REFUND_SUCCEEDED', 'REFUND_FAILED', 'REFUND_PENDING'],
                signatureValidationRequired: true,
                replayProtectionRequired: true,
                rawPayloadPersistence: 'HASHED_OR_REDACTED_ONLY'
            },
            reconciliation: {
                delayedStatuses: ['REFUND_PENDING', 'PROVIDER_PENDING', 'UNKNOWN'],
                failedStatuses: ['REFUND_FAILED', 'PROVIDER_REJECTED'],
                ownerService: 'DefaultPaymentReconciliationService'
            },
            liveCertification: {
                requiredFields: ['liveEvidenceReference', 'certifiedAt', 'certifiedBy', 'productionTrafficApproved'],
                certificationAuthority: 'BACKOFFICE_OPERATOR_WITH_PAYMENT_PERMISSION',
                productionTrafficApprovalRequired: true
            },
            customerSafety: {
                neverExpose: ['providerSecret', 'rawCardNumber', 'cvv', 'webhookSigningSecret', 'supplierCost'],
                exposeOnly: ['status', 'method', 'amount', 'currency', 'reconciliationRequired']
            }
        });
    },
    /** Validates an adapter declaration before promoting it beyond sandbox maturity. @param {Object} adapter Provider declaration. @returns {Object} Validation result. */
    validateAdapter: function (adapter) {
        const missing = [];
        if (!adapter || typeof adapter !== 'object') missing.push('adapter');
        if (!adapter.providerCode) missing.push('providerCode');
        if (!Array.isArray(adapter.supportedOperations) || !adapter.supportedOperations.includes('REFUND')) missing.push('supportedOperations.REFUND');
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
