/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteCompliance/src/schemas/schemas @description Defines reusable Waste compliance profile and evidence schemas. @layer schema @owner wasteCompliance @override Partner modules may add jurisdiction-specific details without making unsupported legal claims. */
module.exports = { wasteCompliance: {
    wasteComplianceProfile: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true },
        name: { type: 'object', required: true },
        jurisdictionCode: { type: 'string', required: false },
        wasteFamilyCodes: { type: 'array', required: false },
        hazardFlags: { type: 'array', required: false },
        requiredEvidenceTypes: { type: 'array', required: false },
        claimPolicy: { type: 'object', required: false },
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'DEPRECATED', 'ARCHIVED'] },
        revision: { type: 'int', required: true, default: 0 },
        metadata: { type: 'object', required: false }
    } }),
    wasteComplianceEvidence: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true },
        sourceRef: { type: 'object', required: true },
        complianceProfileCode: { type: 'string', required: false },
        evidenceRefs: { type: 'array', required: true },
        chainOfCustodyRefs: { type: 'array', required: false },
        decision: { type: 'string', required: true, enum: ['RECORDED', 'REVIEW_REQUIRED', 'APPROVED', 'REJECTED', 'SUPERSEDED'] },
        reasonCode: { type: 'string', required: false },
        recordedBy: { type: 'object', required: false },
        recordedAt: { type: 'date', required: true },
        correlationId: { type: 'string', required: false },
        idempotencyKey: { type: 'string', required: false },
        revision: { type: 'int', required: true, default: 0 },
        metadata: { type: 'object', required: false }
    } })
} };
