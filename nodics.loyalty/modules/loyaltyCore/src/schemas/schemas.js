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
        programCode: { type: 'string', required: true , description: 'Stores the program code used to classify, link, or resolve this record.'},
        rewardTypeCode: { type: 'string', required: true , description: 'Stores the reward type code used to classify, link, or resolve this record.'},
        operationType: { type: 'string', required: true, enum: ['EARN', 'RESERVE', 'CAPTURE', 'RELEASE', 'EXPIRE', 'ADJUST', 'REVERSE'] , description: 'Classifies this record by operation type for validation and business handling.'},
        enabled: { type: 'bool', required: true, default: true , description: 'Indicates whether enabled applies for this record.'},
        minimumAmount: { type: 'string', required: false , description: 'Stores the minimum amount used for calculation, reporting, or settlement.'},
        maximumAmount: { type: 'string', required: false , description: 'Stores the maximum amount used for calculation, reporting, or settlement.'},
        reservationTtlSeconds: { type: 'int', required: false , description: 'Stores the numeric reservation ttl seconds used by this record.'},
        idempotencyRequired: { type: 'bool', required: true, default: true , description: 'Indicates whether idempotency is required for this record.'},
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'PAUSED', 'RETIRED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        revision: { type: 'int', required: true, default: 0 , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'},
        metadata: { type: 'object', required: false , description: 'Stores additional structured metadata needed by extensions without changing the core schema contract.'}
    } })
} };
