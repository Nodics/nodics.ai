/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteSubmission/src/schemas/schemas @description Defines reusable Waste submission, evidence-reference, and metadata suggestion schemas. @layer schema @owner wasteSubmission @override Partner modules may add journey fields while preserving advisory metadata and external media ownership. */
function schemaRef(moduleName, schemaName, type) {
    return { enabled: true, moduleName: moduleName, schemaName: schemaName, type: type || 'one', propertyName: 'code' };
}

module.exports = { wasteSubmission: {
    wasteSubmission: Object.assign({ super: 'base', model: true, backoffice: { concurrency: { managed: true, field: 'revision' } }, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        submitterRef: { type: 'object', required: true , description: 'References the related submitter record used by this record.'},
        submissionChannel: { type: 'string', required: true , description: 'Stores the submission channel value used by this record.'},
        categoryCode: { type: 'string', required: false , description: 'Stores the category code used to classify, link, or resolve this record.'},
        itemTypeCode: { type: 'string', required: false , description: 'Stores the item type code used to classify, link, or resolve this record.'},
        materialTypeCodes: { type: 'array', required: false , description: 'Lists material type codes used to classify, link, or resolve this record.'},
        conditionGrade: { type: 'string', required: false , description: 'Stores the condition grade value used by this record.'},
        quantity: { type: 'int', required: false , description: 'Stores the numeric quantity used by this record.'},
        weight: { type: 'string', required: false , description: 'Stores the weight value used by this record.'},
        brand: { type: 'string', required: false , description: 'Stores the brand value used by this record.'},
        model: { type: 'string', required: false , description: 'Stores the model value used by this record.'},
        serialNumberHash: { type: 'string', required: false , description: 'Stores the serial number hash value used by this record.'},
        description: { type: 'string', required: false , description: 'Explains the business purpose, usage, or administrative meaning of this record.'},
        preferredCollectionPointCode: { type: 'string', required: false , description: 'Stores the preferred collection point code used to classify, link, or resolve this record.'},
        submissionStatus: { type: 'string', required: true, enum: ['DRAFT', 'MEDIA_STAGED', 'METADATA_SUGGESTED', 'AWAITING_SUBMITTER_CONFIRMATION', 'SUBMITTED', 'UNDER_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'REJECTED', 'CANCELLED', 'ARCHIVED'] , description: 'Selects the submission status value used to drive validation, filtering, and business behavior.'},
        submittedFacts: { type: 'object', required: false , description: 'Stores structured submitted facts details used by this record.'},
        confirmedFacts: { type: 'object', required: false , description: 'Stores structured confirmed facts details used by this record.'},
        evidenceRefs: { type: 'array', required: false , description: 'Lists related evidence records used by this record.'},
        metadataSuggestionRefs: { type: 'array', required: false , description: 'Lists related metadata suggestion records used by this record.'},
        verificationRef: { type: 'object', required: false , description: 'References the related verification record used by this record.'},
        receiptRef: { type: 'object', required: false , description: 'References the related receipt record used by this record.'},
        impactRef: { type: 'object', required: false , description: 'References the related impact record used by this record.'},
        policyContextRef: { type: 'object', required: false , description: 'References the related policy context record used by this record.'},
        sourceContext: { type: 'object', required: false , description: 'Stores structured source context details used by this record.'},
        correlationId: { type: 'string', required: false , description: 'Stores the correlation identifier used to correlate this record.'},
        idempotencyKey: { type: 'string', required: false , description: 'Stores the idempotency key value used by this record.'},
        statusUpdatedAt: { type: 'date', required: false , description: 'Records when the status updated event or value applies.'},
        revision: { type: 'int', required: true, default: 0 , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'},
        metadata: { type: 'object', required: false , description: 'Stores additional structured metadata needed by extensions without changing the core schema contract.'}
    }, refSchema: {
        submitterRef: schemaRef('profile', 'customer'),
        evidenceRefs: schemaRef('wasteSubmission', 'wasteEvidence', 'many'),
        metadataSuggestionRefs: schemaRef('wasteSubmission', 'wasteMetadataSuggestion', 'many'),
        verificationRef: schemaRef('wasteVerification', 'wasteVerification'),
        receiptRef: schemaRef('wasteReceipt', 'wasteReceipt'),
        impactRef: schemaRef('wasteImpact', 'wasteImpactResult')
    } }),
    wasteEvidence: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        ownerRef: { type: 'object', required: true , description: 'References the related owner record used by this record.'},
        evidenceType: { type: 'string', required: true, enum: ['PHOTO', 'DOCUMENT', 'WEIGHT_SLIP', 'RECEIPT', 'SIGNATURE', 'AI_METADATA', 'OPERATOR_NOTE', 'CERTIFICATE'] , description: 'Classifies this record by evidence type for validation and business handling.'},
        mediaRef: { type: 'object', required: false , description: 'References the related media record used by this record.'},
        capturedBy: { type: 'object', required: false , description: 'Stores structured captured by details used by this record.'},
        capturedAt: { type: 'date', required: false , description: 'Records when the captured event or value applies.'},
        captureLocationRef: { type: 'object', required: false , description: 'References the related capture location record used by this record.'},
        confidence: { type: 'string', required: false , description: 'Stores the confidence value used by this record.'},
        publicSafe: { type: 'bool', required: true, default: false , description: 'Indicates whether public safe applies for this record.'},
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'DEPRECATED', 'ARCHIVED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        revision: { type: 'int', required: true, default: 0 , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'},
        metadata: { type: 'object', required: false , description: 'Stores additional structured metadata needed by extensions without changing the core schema contract.'}
    }, refSchema: {
        ownerRef: schemaRef('profile', 'customer'),
        mediaRef: schemaRef('media', 'media'),
        captureLocationRef: schemaRef('locationCore', 'location')
    } }),
    wasteMetadataSuggestion: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        submissionCode: { type: 'string', required: true , description: 'Stores the submission code used to classify, link, or resolve this record.'},
        sourceType: { type: 'string', required: true, enum: ['AI', 'BARCODE', 'OPERATOR', 'RULE', 'IMPORT'] , description: 'Classifies this record by source type for validation and business handling.'},
        providerRef: { type: 'object', required: false , description: 'References the related provider record used by this record.'},
        suggestedCategoryCode: { type: 'string', required: false , description: 'Stores the suggested category code used to classify, link, or resolve this record.'},
        suggestedItemTypeCode: { type: 'string', required: false , description: 'Stores the suggested item type code used to classify, link, or resolve this record.'},
        suggestedMaterialTypeCodes: { type: 'array', required: false , description: 'Lists suggested material type codes used to classify, link, or resolve this record.'},
        suggestedConditionGrade: { type: 'string', required: false , description: 'Stores the suggested condition grade value used by this record.'},
        suggestedBrand: { type: 'string', required: false , description: 'Stores the suggested brand value used by this record.'},
        suggestedModel: { type: 'string', required: false , description: 'Stores the suggested model value used by this record.'},
        suggestedWeight: { type: 'string', required: false , description: 'Stores the suggested weight used for validation, calculation, or operational decisions.'},
        confidence: { type: 'string', required: false , description: 'Stores the confidence value used by this record.'},
        fieldConfidence: { type: 'object', required: false , description: 'Stores structured field confidence details used by this record.'},
        rawSummary: { type: 'string', required: false , description: 'Summarizes raw information for quick review and administration.'},
        status: { type: 'string', required: true, enum: ['PROPOSED', 'CONFIRMED', 'PARTIALLY_CONFIRMED', 'REJECTED', 'SUPERSEDED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        revision: { type: 'int', required: true, default: 0 , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'},
        metadata: { type: 'object', required: false , description: 'Stores additional structured metadata needed by extensions without changing the core schema contract.'}
    } })
} };
