/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module discoveryMapping/src/schemas/schemas @description Defines generic Discovery mapping schemas. @layer schema @owner discoveryMapping */
module.exports = { discoveryMapping: {
    discoveryFieldMapping: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { groups: { schemaOperations: true }, enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        tenant: { type: 'string', required: true , description: 'Identifies the runtime tenant partition that scopes this record.'},
        ownerType: { type: 'string', required: true , description: 'Classifies the type of owner responsible for this record.'},
        searchableFields: { type: 'array', required: false , description: 'Lists the searchable fields associated with this record.'},
        filterableFields: { type: 'array', required: false , description: 'Lists the filterable fields associated with this record.'},
        sortableFields: { type: 'array', required: false , description: 'Lists the sortable fields associated with this record.'},
        displayFields: { type: 'array', required: false , description: 'Lists the display fields associated with this record.'},
        sensitiveFields: { type: 'array', required: false , description: 'Lists the sensitive fields associated with this record.'},
        analyzers: { type: 'object', required: false , description: 'Stores structured analyzers details used by this record.'},
        status: { type: 'string', required: true, enum: ['DRAFT', 'READY', 'APPROVED', 'CURRENT', 'RETIRED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        revision: { type: 'int', required: true , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'}
    } })
} };
module.exports.discoveryMapping.discoveryFieldMapping.backoffice = { operations: ['search', 'read', 'create', 'update'], description: 'Generic Discovery field mapping.' };
