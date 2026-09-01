/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module loyaltyRedemption/src/schemas/schemas @description Defines reward redemption evidence records. @layer schema @owner loyaltyRedemption @override Later modules may add governed evidence fields while preserving downstream target ownership. */
module.exports = { loyaltyRedemption: {
    rewardRedemption: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        walletCode: { type: 'string', required: true },
        programCode: { type: 'string', required: true },
        rewardTypeCode: { type: 'string', required: true },
        amount: { type: 'string', required: true },
        status: { type: 'string', required: true, enum: ['CREATED', 'CAPTURED', 'RELEASED', 'REVERSED', 'FAILED'] },
        targetType: { type: 'string', required: true },
        targetCode: { type: 'string', required: true },
        reservationCode: { type: 'string', required: false },
        captureLedgerEntryCode: { type: 'string', required: false },
        providerReference: { type: 'string', required: false },
        idempotencyKey: { type: 'string', required: true },
        correlationId: { type: 'string', required: true },
        redeemedAt: { type: 'date', required: false },
        revision: { type: 'int', required: true, default: 0 },
        metadata: { type: 'object', required: false }
    } })
} };
