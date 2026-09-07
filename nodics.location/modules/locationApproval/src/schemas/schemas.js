/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module locationApproval/src/schemas/schemas
 * @description Schema definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = { locationApproval: {
    locationApprovalRequest: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true },
        draftCode: { type: 'string', required: true },
        targetLocationCode: { type: 'string', required: false },
        reviewerRef: { type: 'object', required: false },
        decision: { type: 'string', required: false, enum: ['APPROVE', 'REJECT', 'RETURN'] },
        reasonCode: { type: 'string', required: false },
        decisionEvidence: { type: 'object', required: false },
        status: { type: 'string', required: true, enum: ['OPEN', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'RETURNED', 'CANCELLED'] },
        revision: { type: 'int', required: true, default: 0 },
        correlationId: { type: 'string', required: true },
        decidedAt: { type: 'date', required: false }
    } })
} };
