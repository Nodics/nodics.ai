/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module discoverySource/src/schemas/schemas @description Defines generic Discovery source registration schemas. @layer schema @owner discoverySource */
module.exports = { discoverySource: {
    discoverySourceProvider: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        tenant: { type: 'string', required: true , description: 'Identifies the runtime tenant partition that scopes this record.'},
        ownerType: { type: 'string', required: true , description: 'Classifies the type of owner responsible for this record.'},
        providerName: { type: 'string', required: true , description: 'Stores the provider name value used by this record.'},
        sourceType: { type: 'string', required: true , description: 'Classifies this record by source type for validation and business handling.'},
        sourceContract: { type: 'object', required: true , description: 'Stores structured source contract details used by this record.'},
        status: { type: 'string', required: true, enum: ['DRAFT', 'READY', 'APPROVED', 'CURRENT', 'RETIRED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        revision: { type: 'int', required: true , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'}
    } })
} };
module.exports.discoverySource.discoverySourceProvider.backoffice = { operations: ['search', 'read', 'create', 'update'], description: 'Generic Discovery source provider registration.' };
