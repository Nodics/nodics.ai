/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteSubmission/src/schemas/schemas @description Defines reusable Waste submission, evidence-reference, and metadata suggestion schemas. @layer schema @owner wasteSubmission @override Partner modules may add journey fields while preserving advisory metadata and external media ownership. */
module.exports = { wasteSubmission: {
    wasteSubmission: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true },
        submitterRef: { type: 'object', required: true },
        submissionChannel: { type: 'string', required: true },
        categoryCode: { type: 'string', required: false },
        itemTypeCode: { type: 'string', required: false },
        materialTypeCodes: { type: 'array', required: false },
        conditionGrade: { type: 'string', required: false },
        quantity: { type: 'int', required: false },
        weight: { type: 'string', required: false },
        brand: { type: 'string', required: false },
        model: { type: 'string', required: false },
        serialNumberHash: { type: 'string', required: false },
        description: { type: 'string', required: false },
        preferredCollectionPointCode: { type: 'string', required: false },
        submissionStatus: { type: 'string', required: true, enum: ['DRAFT', 'MEDIA_STAGED', 'METADATA_SUGGESTED', 'AWAITING_SUBMITTER_CONFIRMATION', 'SUBMITTED', 'UNDER_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'REJECTED', 'CANCELLED', 'ARCHIVED'] },
        submittedFacts: { type: 'object', required: false },
        confirmedFacts: { type: 'object', required: false },
        evidenceRefs: { type: 'array', required: false },
        metadataSuggestionRefs: { type: 'array', required: false },
        verificationRef: { type: 'object', required: false },
        receiptRef: { type: 'object', required: false },
        impactRef: { type: 'object', required: false },
        policyContextRef: { type: 'object', required: false },
        sourceContext: { type: 'object', required: false },
        correlationId: { type: 'string', required: false },
        idempotencyKey: { type: 'string', required: false },
        statusUpdatedAt: { type: 'date', required: false },
        revision: { type: 'int', required: true, default: 0 },
        metadata: { type: 'object', required: false }
    } }),
    wasteEvidence: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true },
        ownerRef: { type: 'object', required: true },
        evidenceType: { type: 'string', required: true, enum: ['PHOTO', 'DOCUMENT', 'WEIGHT_SLIP', 'RECEIPT', 'SIGNATURE', 'AI_METADATA', 'OPERATOR_NOTE', 'CERTIFICATE'] },
        mediaRef: { type: 'object', required: false },
        capturedBy: { type: 'object', required: false },
        capturedAt: { type: 'date', required: false },
        captureLocationRef: { type: 'object', required: false },
        confidence: { type: 'string', required: false },
        publicSafe: { type: 'bool', required: true, default: false },
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'DEPRECATED', 'ARCHIVED'] },
        revision: { type: 'int', required: true, default: 0 },
        metadata: { type: 'object', required: false }
    } }),
    wasteMetadataSuggestion: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true },
        submissionCode: { type: 'string', required: true },
        sourceType: { type: 'string', required: true, enum: ['AI', 'BARCODE', 'OPERATOR', 'RULE', 'IMPORT'] },
        providerRef: { type: 'object', required: false },
        suggestedCategoryCode: { type: 'string', required: false },
        suggestedItemTypeCode: { type: 'string', required: false },
        suggestedMaterialTypeCodes: { type: 'array', required: false },
        suggestedConditionGrade: { type: 'string', required: false },
        suggestedBrand: { type: 'string', required: false },
        suggestedModel: { type: 'string', required: false },
        suggestedWeight: { type: 'string', required: false },
        confidence: { type: 'string', required: false },
        fieldConfidence: { type: 'object', required: false },
        rawSummary: { type: 'string', required: false },
        status: { type: 'string', required: true, enum: ['PROPOSED', 'CONFIRMED', 'PARTIALLY_CONFIRMED', 'REJECTED', 'SUPERSEDED'] },
        revision: { type: 'int', required: true, default: 0 },
        metadata: { type: 'object', required: false }
    } })
} };
