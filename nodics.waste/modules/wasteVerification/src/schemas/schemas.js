/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteVerification/src/schemas/schemas @description Defines reusable Waste verification result schemas. @layer schema @owner wasteVerification @override Partner modules may add reviewer policy without overwriting submitted facts. */
module.exports = { wasteVerification: {
    wasteVerificationPolicy: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { groups: { schemaOperations: true }, enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        name: { type: 'object', required: true , description: 'Stores the business display name shown to administrators and related user journeys.'},
        verificationRequired: { type: 'bool', required: true, default: true , description: 'Indicates whether verification is required for this record.'},
        allowedReviewerTypes: { type: 'array', required: false , description: 'Lists the allowed reviewer types that apply to this record.'},
        requiredEvidenceTypes: { type: 'array', required: false , description: 'Lists the evidence types required by this record.'},
        editableFactFields: { type: 'array', required: false , description: 'Lists the editable fact fields associated with this record.'},
        requirePublicReasonOnReject: { type: 'bool', required: true, default: true , description: 'Indicates whether require public reason on reject applies for this record.'},
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'DEPRECATED', 'ARCHIVED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        revision: { type: 'int', required: true, default: 0 , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'},
        metadata: { type: 'object', required: false , description: 'Stores additional structured metadata needed by extensions without changing the core schema contract.'}
    } }),
    wasteVerification: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { groups: { schemaOperations: true }, enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        submissionCode: { type: 'string', required: true , description: 'Stores the submission code used to classify, link, or resolve this record.'},
        verifiedBy: { type: 'object', required: true , description: 'Stores structured verified by details used by this record.'},
        verificationStatus: { type: 'string', required: true, enum: ['VERIFIED', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED', 'NEEDS_RECEIPT', 'NEEDS_INSPECTION'] , description: 'Selects the verification status value used to drive validation, filtering, and business behavior.'},
        verifiedFacts: { type: 'object', required: false , description: 'Stores structured verified facts details used by this record.'},
        verifiedCategoryCode: { type: 'string', required: false , description: 'Stores the verified category code used to classify, link, or resolve this record.'},
        verifiedItemTypeCode: { type: 'string', required: false , description: 'Stores the verified item type code used to classify, link, or resolve this record.'},
        verifiedMaterialTypeCodes: { type: 'array', required: false , description: 'Lists verified material type codes used to classify, link, or resolve this record.'},
        verifiedConditionGrade: { type: 'string', required: false , description: 'Stores the verified condition grade value used by this record.'},
        verifiedQuantity: { type: 'int', required: false , description: 'Stores the verified quantity used for validation, calculation, or operational decisions.'},
        verifiedWeight: { type: 'string', required: false , description: 'Stores the verified weight used for validation, calculation, or operational decisions.'},
        reasonCode: { type: 'string', required: false , description: 'Stores the reason code used to classify, link, or resolve this record.'},
        notes: { type: 'string', required: false , description: 'Stores the notes value used by this record.'},
        publicReason: { type: 'string', required: false , description: 'Stores the public reason value used by this record.'},
        verifiedAt: { type: 'date', required: true , description: 'Records when the verified event or value applies.'},
        correlationId: { type: 'string', required: false , description: 'Stores the correlation identifier used to correlate this record.'},
        idempotencyKey: { type: 'string', required: false , description: 'Stores the idempotency key value used by this record.'},
        revision: { type: 'int', required: true, default: 0 , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'},
        metadata: { type: 'object', required: false , description: 'Stores additional structured metadata needed by extensions without changing the core schema contract.'}
    } })
} };
