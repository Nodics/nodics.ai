/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteMovement/src/schemas/schemas @description Defines reusable Waste batch and downstream movement schemas. @layer schema @owner wasteMovement @override Partner modules may add logistics integration fields without losing batch traceability. */
module.exports = { wasteMovement: {
    wasteBatch: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true },
        batchType: { type: 'string', required: true, enum: ['CONTAINER', 'PALLET', 'SHIPMENT', 'PROCESSING_LOT', 'AUDIT_LOT'] },
        submissionCodes: { type: 'array', required: false },
        receiptCodes: { type: 'array', required: false },
        sourceLocationRef: { type: 'object', required: false },
        currentLocationRef: { type: 'object', required: false },
        aggregateFacts: { type: 'object', required: false },
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'DEPRECATED', 'ARCHIVED'] },
        revision: { type: 'int', required: true, default: 0 },
        metadata: { type: 'object', required: false }
    } }),
    wasteMovement: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true },
        movementType: { type: 'string', required: true, enum: ['PICKUP', 'TRANSFER', 'WAREHOUSE_RECEIPT', 'PROCESSOR_TRANSFER', 'RECYCLER_RECEIPT', 'DISPOSAL'] },
        sourceLocationRef: { type: 'object', required: true },
        targetLocationRef: { type: 'object', required: true },
        submissionCodes: { type: 'array', required: false },
        receiptCodes: { type: 'array', required: false },
        batchCode: { type: 'string', required: false },
        operatorRef: { type: 'object', required: false },
        scheduledAt: { type: 'date', required: false },
        departedAt: { type: 'date', required: false },
        arrivedAt: { type: 'date', required: false },
        movementStatus: { type: 'string', required: true, enum: ['PLANNED', 'READY_FOR_PICKUP', 'IN_TRANSIT', 'ARRIVED', 'RECEIVED', 'CANCELLED', 'FAILED'] },
        evidenceRefs: { type: 'array', required: false },
        correlationId: { type: 'string', required: false },
        idempotencyKey: { type: 'string', required: false },
        revision: { type: 'int', required: true, default: 0 },
        metadata: { type: 'object', required: false }
    } })
} };
