/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module discoveryMapping/src/schemas/schemas @description Defines generic Discovery mapping schemas. @layer schema @owner discoveryMapping */
module.exports = { discoveryMapping: {
    discoveryFieldMapping: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true },
        tenant: { type: 'string', required: true },
        ownerType: { type: 'string', required: true },
        searchableFields: { type: 'array', required: false },
        filterableFields: { type: 'array', required: false },
        sortableFields: { type: 'array', required: false },
        displayFields: { type: 'array', required: false },
        sensitiveFields: { type: 'array', required: false },
        analyzers: { type: 'object', required: false },
        status: { type: 'string', required: true, enum: ['DRAFT', 'READY', 'APPROVED', 'CURRENT', 'RETIRED'] },
        revision: { type: 'int', required: true }
    } })
} };
module.exports.discoveryMapping.discoveryFieldMapping.backoffice = { operations: ['search', 'read', 'create', 'update'], description: 'Generic Discovery field mapping.' };
