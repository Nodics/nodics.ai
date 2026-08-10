/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module testimonial/src/schemas/schemas @description Defines provenance-safe testimonial candidates, immutable editorial versions, scoped consent evidence, and sanitized public projections. @layer schema @owner testimonial @override Later modules may add governed fields without weakening evidence, consent, tenant, or withdrawal guarantees. */
const internal = policy => ({ super: 'base', model: true, schemaPolicies: [policy], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } });
module.exports = { testimonial: {
    testimonialCandidate: Object.assign(internal('customerOwned'), { definition: {
        tenant: { type: 'string', required: true }, ownerId: { type: 'string', required: true }, sourceType: { type: 'string', required: true, enum: ['DIRECT', 'REVIEW', 'FEEDBACK', 'INTERVIEW', 'IMPORT'] },
        sourceModule: { type: 'string', required: false }, sourceRecordType: { type: 'string', required: false }, sourceRecordCode: { type: 'string', required: false }, originalText: { type: 'string', required: true },
        provenance: { type: 'object', required: true }, evidenceReferences: { type: 'array', required: false }, materialRelationship: { type: 'string', required: false }, status: { type: 'string', required: true, enum: ['CANDIDATE', 'EDITING', 'PENDING_CONFIRMATION', 'PENDING_APPROVAL', 'APPROVED', 'SCHEDULED', 'PUBLISHED', 'HIDDEN', 'WITHDRAWN', 'EXPIRED', 'REJECTED'] },
        revision: { type: 'int', required: true, default: 0 }, correlationId: { type: 'string', required: true }, capturedAt: { type: 'date', required: true }
    } }),
    testimonialVersion: Object.assign(internal('operational'), { definition: {
        tenant: { type: 'string', required: true }, candidateCode: { type: 'string', required: true }, version: { type: 'int', required: true }, locale: { type: 'string', required: true }, variant: { type: 'string', required: true, enum: ['SHORT_QUOTE', 'FULL_STORY', 'CASE_STUDY_TEASER', 'VIDEO'] },
        editorialText: { type: 'string', required: true }, sanitizedText: { type: 'string', required: true }, mediaCodes: { type: 'array', required: false }, status: { type: 'string', required: true, enum: ['DRAFT', 'PENDING_CUSTOMER_CONFIRMATION', 'CUSTOMER_CONFIRMED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SUPERSEDED'] },
        customerConfirmedAt: { type: 'date', required: false }, approvedBy: { type: 'string', required: false }, approvedAt: { type: 'date', required: false }, correlationId: { type: 'string', required: true }, createdAt: { type: 'date', required: true }
    } }),
    testimonialConsent: Object.assign(internal('customerOwned'), { definition: {
        tenant: { type: 'string', required: true }, candidateCode: { type: 'string', required: true }, ownerId: { type: 'string', required: true }, version: { type: 'int', required: true }, status: { type: 'string', required: true, enum: ['PENDING', 'GRANTED', 'DENIED', 'WITHDRAWN', 'EXPIRED'] },
        attribution: { type: 'object', required: true }, channels: { type: 'array', required: true }, regions: { type: 'array', required: true }, likenessAllowed: { type: 'bool', required: true, default: false }, mediaAllowed: { type: 'bool', required: true, default: false },
        policyVersion: { type: 'string', required: true }, evidence: { type: 'object', required: true }, validFrom: { type: 'date', required: true }, expiresAt: { type: 'date', required: false }, withdrawnAt: { type: 'date', required: false }, correlationId: { type: 'string', required: true }
    } }),
    testimonialProjection: Object.assign(internal('operational'), { definition: {
        tenant: { type: 'string', required: true }, candidateCode: { type: 'string', required: true }, versionCode: { type: 'string', required: true }, projectionVersion: { type: 'int', required: true }, publicText: { type: 'string', required: true }, attribution: { type: 'object', required: true }, disclosures: { type: 'array', required: false },
        channel: { type: 'string', required: true }, region: { type: 'string', required: true }, locale: { type: 'string', required: true }, wcmsPlacementCodes: { type: 'array', required: false }, publicationRequestCode: { type: 'string', required: false }, status: { type: 'string', required: true, enum: ['PREVIEW', 'SCHEDULED', 'PUBLISHED', 'HIDDEN', 'WITHDRAWN', 'EXPIRED', 'FAILED'] },
        scheduledAt: { type: 'date', required: false }, publishedAt: { type: 'date', required: false }, hiddenAt: { type: 'date', required: false }, expiresAt: { type: 'date', required: false }, revision: { type: 'int', required: true, default: 0 }, lastErrorCode: { type: 'string', required: false }, correlationId: { type: 'string', required: true }
    } })
} };
