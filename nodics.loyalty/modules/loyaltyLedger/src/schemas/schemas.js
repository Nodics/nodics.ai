/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module loyaltyLedger/src/schemas/schemas @description Defines append-only reward movement entries. @layer schema @owner loyaltyLedger @override Later modules may add evidence fields while preserving immutable movement semantics. */
module.exports = { loyaltyLedger: {
    rewardLedgerEntry: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        walletCode: { type: 'string', required: true },
        programCode: { type: 'string', required: true },
        rewardTypeCode: { type: 'string', required: true },
        entryType: { type: 'string', required: true, enum: ['EARN', 'RESERVE', 'CAPTURE', 'RELEASE', 'EXPIRE', 'ADJUST', 'REVERSE'] },
        amount: { type: 'string', required: true },
        availableAfter: { type: 'string', required: true },
        reservedAfter: { type: 'string', required: true },
        sourceType: { type: 'string', required: true },
        sourceCode: { type: 'string', required: true },
        targetType: { type: 'string', required: false },
        targetCode: { type: 'string', required: false },
        reservationCode: { type: 'string', required: false },
        redemptionCode: { type: 'string', required: false },
        reversalOfEntryCode: { type: 'string', required: false },
        idempotencyKey: { type: 'string', required: true },
        correlationId: { type: 'string', required: true },
        reasonCode: { type: 'string', required: false },
        postedAt: { type: 'date', required: true },
        metadata: { type: 'object', required: false }
    } })
} };
