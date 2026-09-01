/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteVerification/src/schemas/schemas @description Defines reusable Waste verification result schemas. @layer schema @owner wasteVerification @override Partner modules may add reviewer policy without overwriting submitted facts. */
module.exports = { wasteVerification: {
    wasteVerificationPolicy: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true },
        name: { type: 'object', required: true },
        verificationRequired: { type: 'bool', required: true, default: true },
        allowedReviewerTypes: { type: 'array', required: false },
        requiredEvidenceTypes: { type: 'array', required: false },
        editableFactFields: { type: 'array', required: false },
        requirePublicReasonOnReject: { type: 'bool', required: true, default: true },
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'DEPRECATED', 'ARCHIVED'] },
        revision: { type: 'int', required: true, default: 0 },
        metadata: { type: 'object', required: false }
    } }),
    wasteVerification: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true },
        submissionCode: { type: 'string', required: true },
        verifiedBy: { type: 'object', required: true },
        verificationStatus: { type: 'string', required: true, enum: ['APPROVED', 'REJECTED', 'CHANGES_REQUESTED', 'NEEDS_RECEIPT', 'NEEDS_INSPECTION'] },
        verifiedFacts: { type: 'object', required: false },
        verifiedCategoryCode: { type: 'string', required: false },
        verifiedItemTypeCode: { type: 'string', required: false },
        verifiedMaterialTypeCodes: { type: 'array', required: false },
        verifiedConditionGrade: { type: 'string', required: false },
        verifiedQuantity: { type: 'int', required: false },
        verifiedWeight: { type: 'string', required: false },
        reasonCode: { type: 'string', required: false },
        notes: { type: 'string', required: false },
        publicReason: { type: 'string', required: false },
        verifiedAt: { type: 'date', required: true },
        correlationId: { type: 'string', required: false },
        idempotencyKey: { type: 'string', required: false },
        revision: { type: 'int', required: true, default: 0 },
        metadata: { type: 'object', required: false }
    } })
} };
