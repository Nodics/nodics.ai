/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module cart/src/schemas/schemas @description Defines Cart intent, entries, immutable calculation evidence, and diagnostics. @layer schema @owner cart */
const internal = policy => ({ super: 'base', model: true, schemaPolicies: [policy], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } });
const evidence = {
    code: { type: 'string', required: true }, tenant: { type: 'string', required: true },
    ownerId: { type: 'string', required: true }, cartCode: { type: 'string', required: true },
    revision: { type: 'int', required: true }, correlationId: { type: 'string', required: true }
};
module.exports = { cart: {
    cart: Object.assign(internal('customerOwned'), { definition: {
        code: { type: 'string', required: true }, tenant: { type: 'string', required: true },
        ownerId: { type: 'string', required: true }, storeCode: { type: 'string', required: true },
        channelCode: { type: 'string', required: true }, locale: { type: 'string', required: true },
        jurisdiction: { type: 'string', required: true }, currency: { type: 'string', required: true },
        status: { type: 'string', required: true, enum: ['ACTIVE', 'CALCULATED', 'PLACEMENT_PENDING', 'PLACED', 'EXPIRED', 'ABANDONED'] },
        revision: { type: 'int', required: true }, calculationCode: { type: 'string', required: false },
        totalAmount: { type: 'string', required: false }, correlationId: { type: 'string', required: true }
    } }),
    cartEntry: Object.assign(internal('customerOwned'), { definition: Object.assign({}, evidence, {
        productCode: { type: 'string', required: true }, sku: { type: 'string', required: true },
        quantity: { type: 'string', required: true }, status: { type: 'string', required: true, enum: ['ACTIVE', 'REMOVED'] }
    }) }),
    cartCalculation: Object.assign(internal('customerOwned'), { definition: Object.assign({}, evidence, {
        cartRevision: { type: 'int', required: true }, currency: { type: 'string', required: true },
        subtotal: { type: 'string', required: true }, discountAmount: { type: 'string', required: true },
        taxAmount: { type: 'string', required: true }, totalAmount: { type: 'string', required: true },
        decisions: { type: 'object', required: true }, sourceHash: { type: 'string', required: true },
        status: { type: 'string', required: true, enum: ['CURRENT', 'STALE', 'FAILED'] },
        calculatedAt: { type: 'date', required: true }
    }) }),
    cartDiagnostic: Object.assign(internal('customerOwned'), { definition: Object.assign({}, evidence, {
        stage: { type: 'string', required: true }, status: { type: 'string', required: true, enum: ['FAILED', 'RECOVERED'] },
        errorCode: { type: 'string', required: true }, dependency: { type: 'string', required: false },
        retryable: { type: 'bool', required: true }, occurredAt: { type: 'date', required: true }
    }) })
} };
