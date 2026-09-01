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
        walletCode: { type: 'string', required: true },
        programCode: { type: 'string', required: true },
        rewardTypeCode: { type: 'string', required: true },
        amount: { type: 'string', required: true },
        status: { type: 'string', required: true, enum: ['RESERVED', 'CAPTURED', 'RELEASED', 'EXPIRED', 'REVERSED'] },
        sourceType: { type: 'string', required: true },
        sourceCode: { type: 'string', required: true },
        targetType: { type: 'string', required: false },
        targetCode: { type: 'string', required: false },
        expiresAt: { type: 'date', required: true },
        createdAt: { type: 'date', required: true },
        capturedAt: { type: 'date', required: false },
        releasedAt: { type: 'date', required: false },
        ledgerEntryCodes: { type: 'array', required: false },
        idempotencyKey: { type: 'string', required: true },
        correlationId: { type: 'string', required: true },
        revision: { type: 'int', required: true, default: 0 },
        metadata: { type: 'object', required: false }
    } })
} };
