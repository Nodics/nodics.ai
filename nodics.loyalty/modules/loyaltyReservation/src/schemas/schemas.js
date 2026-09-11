/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module loyaltyReservation/src/schemas/schemas @description Defines reward reservation records used before capture or release. @layer schema @owner loyaltyReservation @override Later modules may add governed reservation evidence while preserving payment-provider handoff semantics. */
module.exports = { loyaltyReservation: {
    rewardReservation: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        walletCode: { type: 'string', required: true , description: 'Stores the wallet code used to classify, link, or resolve this record.'},
        programCode: { type: 'string', required: true , description: 'Stores the program code used to classify, link, or resolve this record.'},
        rewardTypeCode: { type: 'string', required: true , description: 'Stores the reward type code used to classify, link, or resolve this record.'},
        amount: { type: 'string', required: true , description: 'Stores the amount value used by this record.'},
        status: { type: 'string', required: true, enum: ['RESERVED', 'CAPTURED', 'RELEASED', 'EXPIRED', 'REVERSED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        sourceType: { type: 'string', required: true , description: 'Classifies this record by source type for validation and business handling.'},
        sourceCode: { type: 'string', required: true , description: 'Stores the source code used to classify, link, or resolve this record.'},
        targetType: { type: 'string', required: false , description: 'Classifies this record by target type for validation and business handling.'},
        targetCode: { type: 'string', required: false , description: 'Stores the target code used to classify, link, or resolve this record.'},
        expiresAt: { type: 'date', required: true , description: 'Records when the expires event or value applies.'},
        createdAt: { type: 'date', required: true , description: 'Records when the created event or value applies.'},
        capturedAt: { type: 'date', required: false , description: 'Records when the captured event or value applies.'},
        releasedAt: { type: 'date', required: false , description: 'Records when the released event or value applies.'},
        ledgerEntryCodes: { type: 'array', required: false , description: 'Lists ledger entry codes used to classify, link, or resolve this record.'},
        idempotencyKey: { type: 'string', required: true , description: 'Stores the idempotency key value used by this record.'},
        correlationId: { type: 'string', required: true , description: 'Stores the correlation identifier used to correlate this record.'},
        revision: { type: 'int', required: true, default: 0 , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'},
        metadata: { type: 'object', required: false , description: 'Stores additional structured metadata needed by extensions without changing the core schema contract.'}
    } })
} };
