/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module store/src/schemas/schemas @description Defines governed Phase 2 store persistence and decision evidence. @layer schema @owner store */
const internal = policy => ({ super: 'base', model: true, schemaPolicies: [policy], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } });
module.exports = { store: {
    store: Object.assign(internal('tenantOwned'), { definition: { code: { type: 'string', required: true }, tenant: { type: 'string', required: true }, name: { type: 'string', required: true }, status: { type: 'string', required: true, enum: ['ACTIVE', 'INACTIVE'] }, defaultCurrency: { type: 'string', required: true }, defaultLocale: { type: 'string', required: true }, timezone: { type: 'string', required: true }, revision: { type: 'int', required: true } } }),
    salesChannel: Object.assign(internal('tenantOwned'), { definition: { code: { type: 'string', required: true }, tenant: { type: 'string', required: true }, storeCode: { type: 'string', required: true }, name: { type: 'string', required: true }, channelType: { type: 'string', required: true, enum: ['WEB', 'MOBILE', 'MARKETPLACE', 'POS'] }, status: { type: 'string', required: true, enum: ['ACTIVE', 'INACTIVE'] }, revision: { type: 'int', required: true } } }),
    pointOfService: Object.assign(internal('tenantOwned'), { definition: { code: { type: 'string', required: true }, tenant: { type: 'string', required: true }, storeCode: { type: 'string', required: true }, name: { type: 'string', required: true }, status: { type: 'string', required: true, enum: ['ACTIVE', 'INACTIVE'] }, timezone: { type: 'string', required: true }, revision: { type: 'int', required: true } } })
} };
