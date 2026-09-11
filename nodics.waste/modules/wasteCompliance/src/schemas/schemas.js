/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteCompliance/src/schemas/schemas @description Defines reusable Waste compliance profile and evidence schemas. @layer schema @owner wasteCompliance @override Partner modules may add jurisdiction-specific details without making unsupported legal claims. */
function schemaRef(moduleName, schemaName, type) {
    return { enabled: true, moduleName: moduleName, schemaName: schemaName, type: type || 'one', propertyName: 'code' };
}

module.exports = { wasteCompliance: {
    wasteComplianceProfile: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        name: { type: 'object', required: true , description: 'Stores the business display name shown to administrators and related user journeys.'},
        jurisdictionCode: { type: 'string', required: false , description: 'Stores the jurisdiction code used to classify, link, or resolve this record.'},
        wasteFamilyCodes: { type: 'array', required: false , description: 'Lists waste family codes used to classify, link, or resolve this record.'},
        hazardFlags: { type: 'array', required: false , description: 'Lists the hazard flags associated with this record.'},
        requiredEvidenceTypes: { type: 'array', required: false , description: 'Lists the evidence types required by this record.'},
        claimPolicy: { type: 'object', required: false , description: 'Defines the claim policy that controls how this record is handled.'},
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'DEPRECATED', 'ARCHIVED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        revision: { type: 'int', required: true, default: 0 , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'},
        metadata: { type: 'object', required: false , description: 'Stores additional structured metadata needed by extensions without changing the core schema contract.'}
    } }),
    wasteComplianceEvidence: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        sourceRef: { type: 'object', required: true , description: 'References the related source record used by this record.'},
        complianceProfileCode: { type: 'string', required: false , description: 'Stores the compliance profile code used to classify, link, or resolve this record.'},
        evidenceRefs: { type: 'array', required: true , description: 'Lists related evidence records used by this record.'},
        chainOfCustodyRefs: { type: 'array', required: false , description: 'Lists related chain of custody records used by this record.'},
        decision: { type: 'string', required: true, enum: ['RECORDED', 'REVIEW_REQUIRED', 'APPROVED', 'REJECTED', 'SUPERSEDED'] , description: 'Selects the decision value used to drive validation, filtering, and business behavior.'},
        reasonCode: { type: 'string', required: false , description: 'Stores the reason code used to classify, link, or resolve this record.'},
        recordedBy: { type: 'object', required: false , description: 'Stores structured recorded by details used by this record.'},
        recordedAt: { type: 'date', required: true , description: 'Records when the recorded event or value applies.'},
        correlationId: { type: 'string', required: false , description: 'Stores the correlation identifier used to correlate this record.'},
        idempotencyKey: { type: 'string', required: false , description: 'Stores the idempotency key value used by this record.'},
        revision: { type: 'int', required: true, default: 0 , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'},
        metadata: { type: 'object', required: false , description: 'Stores additional structured metadata needed by extensions without changing the core schema contract.'}
    }, refSchema: {
        evidenceRefs: schemaRef('wasteSubmission', 'wasteEvidence', 'many'),
        chainOfCustodyRefs: schemaRef('wasteMovement', 'wasteMovement', 'many')
    } })
} };
