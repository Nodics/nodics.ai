/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteCore/src/schemas/schemas @description Defines shared Waste policy and extension-point schemas. @layer schema @owner wasteCore @override Later modules may add governed policies without moving child capability ownership. */
module.exports = { wasteCore: {
    wasteLifecyclePolicy: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true },
        ownerModule: { type: 'string', required: true },
        lifecycleType: { type: 'string', required: true, enum: ['SUBMISSION', 'VERIFICATION', 'RECEIPT', 'IMPACT', 'MOVEMENT', 'COMPLIANCE'] },
        triggerEventCodes: { type: 'array', required: false },
        idempotencyRequired: { type: 'bool', required: true, default: true },
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'DEPRECATED', 'ARCHIVED'] },
        revision: { type: 'int', required: true, default: 0 },
        metadata: { type: 'object', required: false }
    } })
} };
