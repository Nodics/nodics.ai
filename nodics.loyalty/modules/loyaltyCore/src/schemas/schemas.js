/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module loyaltyCore/src/schemas/schemas @description Defines shared Loyalty policy schema contracts. @layer schema @owner loyaltyCore @override Later modules may add governed fields while preserving operation semantics. */
module.exports = { loyaltyCore: {
    loyaltyOperationPolicy: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        programCode: { type: 'string', required: true },
        rewardTypeCode: { type: 'string', required: true },
        operationType: { type: 'string', required: true, enum: ['EARN', 'RESERVE', 'CAPTURE', 'RELEASE', 'EXPIRE', 'ADJUST', 'REVERSE'] },
        enabled: { type: 'bool', required: true, default: true },
        minimumAmount: { type: 'string', required: false },
        maximumAmount: { type: 'string', required: false },
        reservationTtlSeconds: { type: 'int', required: false },
        idempotencyRequired: { type: 'bool', required: true, default: true },
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'PAUSED', 'RETIRED'] },
        revision: { type: 'int', required: true, default: 0 },
        metadata: { type: 'object', required: false }
    } })
} };
