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
        code: { type: 'string', required: true },
        tenant: { type: 'string', required: true },
        ownerType: { type: 'string', required: true },
        providerName: { type: 'string', required: true },
        sourceType: { type: 'string', required: true },
        sourceContract: { type: 'object', required: true },
        status: { type: 'string', required: true, enum: ['DRAFT', 'READY', 'APPROVED', 'CURRENT', 'RETIRED'] },
        revision: { type: 'int', required: true }
    } })
} };
module.exports.discoverySource.discoverySourceProvider.backoffice = { operations: ['search', 'read', 'create', 'update'], description: 'Generic Discovery source provider registration.' };
