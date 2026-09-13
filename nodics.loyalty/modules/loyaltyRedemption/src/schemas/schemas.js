/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module loyaltyRedemption/src/schemas/schemas @description Defines reward redemption evidence records. @layer schema @owner loyaltyRedemption @override Later modules may add governed evidence fields while preserving downstream target ownership. */
module.exports = { loyaltyRedemption: {
    rewardRedemption: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { groups: { schemaOperations: true }, enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        walletCode: { type: 'string', required: true , description: 'Stores the wallet code used to classify, link, or resolve this record.'},
        programCode: { type: 'string', required: true , description: 'Stores the program code used to classify, link, or resolve this record.'},
        rewardTypeCode: { type: 'string', required: true , description: 'Stores the reward type code used to classify, link, or resolve this record.'},
        amount: { type: 'string', required: true , description: 'Stores the amount value used by this record.'},
        status: { type: 'string', required: true, enum: ['CREATED', 'CAPTURED', 'RELEASED', 'REVERSED', 'FAILED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        targetType: { type: 'string', required: true , description: 'Classifies this record by target type for validation and business handling.'},
        targetCode: { type: 'string', required: true , description: 'Stores the target code used to classify, link, or resolve this record.'},
        reservationCode: { type: 'string', required: false , description: 'Stores the reservation code used to classify, link, or resolve this record.'},
        captureLedgerEntryCode: { type: 'string', required: false , description: 'Stores the capture ledger entry code used to classify, link, or resolve this record.'},
        providerReference: { type: 'string', required: false , description: 'Stores provider-specific reference data needed to resolve this record.'},
        idempotencyKey: { type: 'string', required: true , description: 'Stores the idempotency key value used by this record.'},
        correlationId: { type: 'string', required: true , description: 'Stores the correlation identifier used to correlate this record.'},
        redeemedAt: { type: 'date', required: false , description: 'Records when the redeemed event or value applies.'},
        revision: { type: 'int', required: true, default: 0 , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'},
        metadata: { type: 'object', required: false , description: 'Stores additional structured metadata needed by extensions without changing the core schema contract.'}
    } })
} };
