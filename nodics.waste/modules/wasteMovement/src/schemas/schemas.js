/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteMovement/src/schemas/schemas @description Defines reusable Waste batch and downstream movement schemas. @layer schema @owner wasteMovement @override Partner modules may add logistics integration fields without losing batch traceability. */
function schemaRef(moduleName, schemaName, type) {
    return { enabled: true, moduleName: moduleName, schemaName: schemaName, type: type || 'one', propertyName: 'code' };
}

module.exports = { wasteMovement: {
    wasteBatch: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        batchType: { type: 'string', required: true, enum: ['CONTAINER', 'PALLET', 'SHIPMENT', 'PROCESSING_LOT', 'AUDIT_LOT'] , description: 'Classifies this record by batch type for validation and business handling.'},
        submissionCodes: { type: 'array', required: false , description: 'Lists submission codes used to classify, link, or resolve this record.'},
        receiptCodes: { type: 'array', required: false , description: 'Lists receipt codes used to classify, link, or resolve this record.'},
        sourceLocationRef: { type: 'object', required: false , description: 'References the related source location record used by this record.'},
        currentLocationRef: { type: 'object', required: false , description: 'References the related current location record used by this record.'},
        aggregateFacts: { type: 'object', required: false , description: 'Stores structured aggregate facts details used by this record.'},
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'DEPRECATED', 'ARCHIVED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        revision: { type: 'int', required: true, default: 0 , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'},
        metadata: { type: 'object', required: false , description: 'Stores additional structured metadata needed by extensions without changing the core schema contract.'}
    }, refSchema: {
        sourceLocationRef: schemaRef('locationCore', 'location'),
        currentLocationRef: schemaRef('locationCore', 'location')
    } }),
    wasteMovement: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        movementType: { type: 'string', required: true, enum: ['PICKUP', 'TRANSFER', 'WAREHOUSE_RECEIPT', 'PROCESSOR_TRANSFER', 'RECYCLER_RECEIPT', 'DISPOSAL'] , description: 'Classifies this record by movement type for validation and business handling.'},
        sourceLocationRef: { type: 'object', required: true , description: 'References the related source location record used by this record.'},
        targetLocationRef: { type: 'object', required: true , description: 'References the related target location record used by this record.'},
        submissionCodes: { type: 'array', required: false , description: 'Lists submission codes used to classify, link, or resolve this record.'},
        receiptCodes: { type: 'array', required: false , description: 'Lists receipt codes used to classify, link, or resolve this record.'},
        batchCode: { type: 'string', required: false , description: 'Stores the batch code used to classify, link, or resolve this record.'},
        operatorRef: { type: 'object', required: false , description: 'References the related operator record used by this record.'},
        scheduledAt: { type: 'date', required: false , description: 'Records when the scheduled event or value applies.'},
        departedAt: { type: 'date', required: false , description: 'Records when the departed event or value applies.'},
        arrivedAt: { type: 'date', required: false , description: 'Records when the arrived event or value applies.'},
        movementStatus: { type: 'string', required: true, enum: ['PLANNED', 'READY_FOR_PICKUP', 'IN_TRANSIT', 'ARRIVED', 'RECEIVED', 'CANCELLED', 'FAILED'] , description: 'Selects the movement status value used to drive validation, filtering, and business behavior.'},
        evidenceRefs: { type: 'array', required: false , description: 'Lists related evidence records used by this record.'},
        correlationId: { type: 'string', required: false , description: 'Stores the correlation identifier used to correlate this record.'},
        idempotencyKey: { type: 'string', required: false , description: 'Stores the idempotency key value used by this record.'},
        revision: { type: 'int', required: true, default: 0 , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'},
        metadata: { type: 'object', required: false , description: 'Stores additional structured metadata needed by extensions without changing the core schema contract.'}
    }, refSchema: {
        sourceLocationRef: schemaRef('locationCore', 'location'),
        targetLocationRef: schemaRef('locationCore', 'location'),
        operatorRef: schemaRef('profile', 'enterprise'),
        evidenceRefs: schemaRef('wasteSubmission', 'wasteEvidence', 'many')
    } })
} };
