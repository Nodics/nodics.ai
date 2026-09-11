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
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        draftType: { type: 'string', required: true, enum: ['CREATE', 'CORRECTION', 'DEACTIVATION'] , description: 'Classifies this record by draft type for validation and business handling.'},
        targetLocationCode: { type: 'string', required: false , description: 'Stores the target location code used to classify, link, or resolve this record.'},
        proposedLocation: { type: 'object', required: true , description: 'Stores structured proposed location details used by this record.'},
        evidenceRefs: { type: 'array', required: false , description: 'Lists related evidence records used by this record.'},
        submittedByRef: { type: 'object', required: true , description: 'References the related submitted by record used by this record.'},
        sourceRef: { type: 'object', required: true , description: 'References the related source record used by this record.'},
        enterpriseRef: { type: 'object', required: false , description: 'References the related enterprise record used by this record.'},
        status: { type: 'string', required: true, enum: ['DRAFT', 'SUBMITTED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'WITHDRAWN'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        revision: { type: 'int', required: true, default: 0 , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'},
        submittedAt: { type: 'date', required: false , description: 'Records when the submitted event or value applies.'},
        resolvedAt: { type: 'date', required: false , description: 'Records when the resolved event or value applies.'},
        correlationId: { type: 'string', required: true , description: 'Stores the correlation identifier used to correlate this record.'}
    }, refSchema: {
        enterpriseRef: {"enabled":true,"moduleName":"profile","schemaName":"enterprise","type":"one","propertyName":"code"}
    } })
} };
