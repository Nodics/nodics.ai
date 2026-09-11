/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module digitalCore/src/schemas/schemas @description Defines Digital Commerce binding, entitlement, delivery, and reversal evidence. @layer schema @owner digitalCore */
const common = {
    code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
    tenant: { type: 'string', required: true , description: 'Identifies the runtime tenant partition that scopes this record.'},
    enterpriseCode: { type: 'string', required: false , description: 'Stores the enterprise code used for business ownership, visibility, or settlement decisions.'},
    ownerId: { type: 'string', required: false , description: 'Identifies the principal or business owner responsible for this record.'},
    status: { type: 'string', required: true , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
    revision: { type: 'int', required: true , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'},
    idempotencyKey: { type: 'string', required: false , description: 'Stores the idempotency key used to prevent duplicate processing of the same business request.'},
    correlationId: { type: 'string', required: true , description: 'Stores the correlation identifier used to trace related requests, jobs, and events.'},
    evidence: { type: 'object', required: false , description: 'Stores structured evidence that explains how this record or decision was produced.'}
};

module.exports = { digitalCore: {
    digitalProductBinding: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: Object.assign({}, common, {
        productCode: { type: 'string', required: true , description: 'Stores the product code used to classify, link, or resolve this record.'},
        variantCode: { type: 'string', required: false , description: 'Stores the variant code used to classify, link, or resolve this record.'},
        sku: { type: 'string', required: false , description: 'Stores the SKU used to identify the purchasable product or variant.'},
        digitalDeliveryType: { type: 'string', required: true , description: 'Classifies this record by digital delivery type for validation and business handling.'},
        inventoryStrategy: { type: 'string', required: true , description: 'Stores the inventory strategy value used by this record.'},
        providerOwner: { type: 'string', required: true , description: 'Identifies the provider owner responsible for fulfilling or managing this record.'},
        providerReference: { type: 'object', required: true , description: 'Stores provider-specific reference data needed to resolve this record.'}
    }) }),
    digitalEntitlement: Object.assign({ super: 'base', model: true, schemaPolicies: ['customerOwned'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: Object.assign({}, common, {
        orderCode: { type: 'string', required: true , description: 'Stores the order code used to classify, link, or resolve this record.'},
        orderEntryCode: { type: 'string', required: false , description: 'Stores the order entry code used to classify, link, or resolve this record.'},
        cartCode: { type: 'string', required: false , description: 'Stores the cart code used to classify, link, or resolve this record.'},
        productCode: { type: 'string', required: true , description: 'Stores the product code used to classify, link, or resolve this record.'},
        sku: { type: 'string', required: false , description: 'Stores the SKU used to identify the purchasable product or variant.'},
        digitalDeliveryType: { type: 'string', required: true , description: 'Classifies this record by digital delivery type for validation and business handling.'},
        providerOwner: { type: 'string', required: true , description: 'Identifies the provider owner responsible for fulfilling or managing this record.'},
        providerCode: { type: 'string', required: true , description: 'Stores the provider code used to classify, link, or resolve this record.'},
        claimStatus: { type: 'string', required: false , description: 'Tracks whether and how this record has been claimed by the entitled party.'},
        revealPolicy: { type: 'object', required: false , description: 'Defines the reveal policy that controls how this record is handled.'},
        purchasedAt: { type: 'date', required: false , description: 'Records when the purchased event or value applies.'},
        deliveredAt: { type: 'date', required: false , description: 'Records when the delivered event or value applies.'},
        revokedAt: { type: 'date', required: false , description: 'Records when the revoked event or value applies.'}
    }) }),
    digitalDelivery: Object.assign({ super: 'base', model: true, schemaPolicies: ['customerOwned'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: Object.assign({}, common, {
        entitlementCode: { type: 'string', required: true , description: 'Stores the entitlement code used to classify, link, or resolve this record.'},
        orderCode: { type: 'string', required: true , description: 'Stores the order code used to classify, link, or resolve this record.'},
        deliveryType: { type: 'string', required: true , description: 'Classifies this record by delivery type for validation and business handling.'},
        providerOwner: { type: 'string', required: true , description: 'Identifies the provider owner responsible for fulfilling or managing this record.'},
        providerCode: { type: 'string', required: true , description: 'Stores the provider code used to classify, link, or resolve this record.'},
        deliveredAt: { type: 'date', required: false , description: 'Records when the delivered event or value applies.'},
        revealCount: { type: 'int', required: false , description: 'Counts how many times the protected digital value has been revealed.'},
        lastRevealedAt: { type: 'date', required: false , description: 'Records when the last revealed event or value applies.'}
    }) }),
    digitalReversal: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: Object.assign({}, common, {
        entitlementCode: { type: 'string', required: true , description: 'Stores the entitlement code used to classify, link, or resolve this record.'},
        orderCode: { type: 'string', required: true , description: 'Stores the order code used to classify, link, or resolve this record.'},
        requestType: { type: 'string', required: true , description: 'Classifies this record by request type for validation and business handling.'},
        policyDecision: { type: 'string', required: true , description: 'Stores the policy decision value used by this record.'},
        reasonCode: { type: 'string', required: false , description: 'Stores the reason code used to classify, link, or resolve this record.'},
        decidedAt: { type: 'date', required: true , description: 'Records when the decided event or value applies.'}
    }) })
} };

module.exports.digitalCore.digitalEntitlement.backoffice = { operations: ['search', 'read'], description: 'Customer-owned digital product entitlement.' };
module.exports.digitalCore.digitalDelivery.backoffice = { operations: ['search', 'read'], description: 'Digital delivery evidence.' };
