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
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        submissionCode: { type: 'string', required: true , description: 'Stores the submission code used to classify, link, or resolve this record.'},
        collectionPointCode: { type: 'string', required: true , description: 'Stores the collection point code used to classify, link, or resolve this record.'},
        receivedBy: { type: 'object', required: true , description: 'Stores structured received by details used by this record.'},
        receivedAt: { type: 'date', required: true , description: 'Records when the received event or value applies.'},
        receivedFacts: { type: 'object', required: false , description: 'Stores structured received facts details used by this record.'},
        receivedQuantity: { type: 'int', required: false , description: 'Stores the received quantity used for validation, calculation, or operational decisions.'},
        receivedWeight: { type: 'string', required: false , description: 'Stores the received weight used for validation, calculation, or operational decisions.'},
        conditionAtReceipt: { type: 'string', required: false , description: 'Stores the condition at receipt value used by this record.'},
        receiptEvidenceRefs: { type: 'array', required: false , description: 'Lists related receipt evidence records used by this record.'},
        receiptStatus: { type: 'string', required: true, enum: ['RECEIVED', 'PARTIALLY_RECEIVED', 'NOT_RECEIVED', 'DAMAGED', 'REJECTED_AT_RECEIPT', 'DISCREPANCY'] , description: 'Selects the receipt status value used to drive validation, filtering, and business behavior.'},
        discrepancyReason: { type: 'string', required: false , description: 'Stores the discrepancy reason value used by this record.'},
        correlationId: { type: 'string', required: false , description: 'Stores the correlation identifier used to correlate this record.'},
        idempotencyKey: { type: 'string', required: false , description: 'Stores the idempotency key value used by this record.'},
        revision: { type: 'int', required: true, default: 0 , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'},
        metadata: { type: 'object', required: false , description: 'Stores additional structured metadata needed by extensions without changing the core schema contract.'}
    }, refSchema: {
        receiptEvidenceRefs: {"enabled":true,"moduleName":"wasteSubmission","schemaName":"wasteEvidence","type":"many","propertyName":"code"}
    } })
} };
