/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module digitalCore/src/schemas/schemas @description Defines Digital Commerce binding, entitlement, delivery, and reversal evidence. @layer schema @owner digitalCore */
const common = {
    code: { type: 'string', required: true },
    tenant: { type: 'string', required: true },
    enterpriseCode: { type: 'string', required: false },
    ownerId: { type: 'string', required: false },
    status: { type: 'string', required: true },
    revision: { type: 'int', required: true },
    idempotencyKey: { type: 'string', required: false },
    correlationId: { type: 'string', required: true },
    evidence: { type: 'object', required: false }
};

module.exports = { digitalCore: {
    digitalProductBinding: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: Object.assign({}, common, {
        productCode: { type: 'string', required: true },
        variantCode: { type: 'string', required: false },
        sku: { type: 'string', required: false },
        digitalDeliveryType: { type: 'string', required: true },
        inventoryStrategy: { type: 'string', required: true },
        providerOwner: { type: 'string', required: true },
        providerReference: { type: 'object', required: true }
    }) }),
    digitalEntitlement: Object.assign({ super: 'base', model: true, schemaPolicies: ['customerOwned'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: Object.assign({}, common, {
        orderCode: { type: 'string', required: true },
        orderEntryCode: { type: 'string', required: false },
        cartCode: { type: 'string', required: false },
        productCode: { type: 'string', required: true },
        sku: { type: 'string', required: false },
        digitalDeliveryType: { type: 'string', required: true },
        providerOwner: { type: 'string', required: true },
        providerCode: { type: 'string', required: true },
        claimStatus: { type: 'string', required: false },
        revealPolicy: { type: 'object', required: false },
        purchasedAt: { type: 'date', required: false },
        deliveredAt: { type: 'date', required: false },
        revokedAt: { type: 'date', required: false }
    }) }),
    digitalDelivery: Object.assign({ super: 'base', model: true, schemaPolicies: ['customerOwned'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: Object.assign({}, common, {
        entitlementCode: { type: 'string', required: true },
        orderCode: { type: 'string', required: true },
        deliveryType: { type: 'string', required: true },
        providerOwner: { type: 'string', required: true },
        providerCode: { type: 'string', required: true },
        deliveredAt: { type: 'date', required: false },
        revealCount: { type: 'int', required: false },
        lastRevealedAt: { type: 'date', required: false }
    }) }),
    digitalReversal: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: Object.assign({}, common, {
        entitlementCode: { type: 'string', required: true },
        orderCode: { type: 'string', required: true },
        requestType: { type: 'string', required: true },
        policyDecision: { type: 'string', required: true },
        reasonCode: { type: 'string', required: false },
        decidedAt: { type: 'date', required: true }
    }) })
} };

module.exports.digitalCore.digitalEntitlement.backoffice = { operations: ['search', 'read'], description: 'Customer-owned digital product entitlement.' };
module.exports.digitalCore.digitalDelivery.backoffice = { operations: ['search', 'read'], description: 'Digital delivery evidence.' };
