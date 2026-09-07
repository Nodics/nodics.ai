/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module locationDraft/src/schemas/schemas
 * @description Schema definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = { locationDraft: {
    locationDraft: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true },
        draftType: { type: 'string', required: true, enum: ['CREATE', 'CORRECTION', 'DEACTIVATION'] },
        targetLocationCode: { type: 'string', required: false },
        proposedLocation: { type: 'object', required: true },
        evidenceRefs: { type: 'array', required: false },
        submittedByRef: { type: 'object', required: true },
        sourceRef: { type: 'object', required: true },
        enterpriseRef: { type: 'object', required: false },
        status: { type: 'string', required: true, enum: ['DRAFT', 'SUBMITTED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'WITHDRAWN'] },
        revision: { type: 'int', required: true, default: 0 },
        submittedAt: { type: 'date', required: false },
        resolvedAt: { type: 'date', required: false },
        correlationId: { type: 'string', required: true }
    } })
} };
