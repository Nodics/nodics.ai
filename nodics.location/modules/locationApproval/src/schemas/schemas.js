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
    locationApprovalRequest: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { groups: { schemaOperations: true }, enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        draftCode: { type: 'string', required: true , description: 'Stores the draft code used to classify, link, or resolve this record.'},
        targetLocationCode: { type: 'string', required: false , description: 'Stores the target location code used to classify, link, or resolve this record.'},
        reviewerRef: { type: 'object', required: false , description: 'References the related reviewer record used by this record.'},
        decision: { type: 'string', required: false, enum: ['APPROVE', 'REJECT', 'RETURN'] , description: 'Selects the decision value used to drive validation, filtering, and business behavior.'},
        reasonCode: { type: 'string', required: false , description: 'Stores the reason code used to classify, link, or resolve this record.'},
        decisionEvidence: { type: 'object', required: false , description: 'Stores structured decision evidence details used by this record.'},
        status: { type: 'string', required: true, enum: ['OPEN', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'RETURNED', 'CANCELLED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        revision: { type: 'int', required: true, default: 0 , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'},
        correlationId: { type: 'string', required: true , description: 'Stores the correlation identifier used to correlate this record.'},
        decidedAt: { type: 'date', required: false , description: 'Records when the decided event or value applies.'}
    } })
} };
