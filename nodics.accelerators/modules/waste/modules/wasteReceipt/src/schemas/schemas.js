/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteReceipt/src/schemas/schemas @description Defines reusable Waste physical receipt schemas. @layer schema @owner wasteReceipt @override Partner modules may tune receipt policies while keeping receipt separate from submission approval. */
module.exports = { wasteReceipt: {
    wasteReceipt: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true },
        submissionCode: { type: 'string', required: true },
        collectionPointCode: { type: 'string', required: true },
        receivedBy: { type: 'object', required: true },
        receivedAt: { type: 'date', required: true },
        receivedFacts: { type: 'object', required: false },
        receivedQuantity: { type: 'int', required: false },
        receivedWeight: { type: 'string', required: false },
        conditionAtReceipt: { type: 'string', required: false },
        receiptEvidenceRefs: { type: 'array', required: false },
        receiptStatus: { type: 'string', required: true, enum: ['RECEIVED', 'PARTIALLY_RECEIVED', 'NOT_RECEIVED', 'DAMAGED', 'REJECTED_AT_RECEIPT', 'DISCREPANCY'] },
        discrepancyReason: { type: 'string', required: false },
        correlationId: { type: 'string', required: false },
        idempotencyKey: { type: 'string', required: false },
        revision: { type: 'int', required: true, default: 0 },
        metadata: { type: 'object', required: false }
    } })
} };
