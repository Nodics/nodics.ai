/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module store/src/schemas/schemas @description Defines governed Phase 2 store persistence and decision evidence. @layer schema @owner store */
module.exports = { store: {
    store: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: { code: { type: 'string', required: true }, tenant: { type: 'string', required: true }, name: { type: 'string', required: true }, status: { type: 'string', required: true, enum: ['ACTIVE', 'INACTIVE'] }, defaultCurrency: { type: 'string', required: true }, defaultLocale: { type: 'string', required: true }, timezone: { type: 'string', required: true }, revision: { type: 'int', required: true } } }),
    salesChannel: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: { code: { type: 'string', required: true }, tenant: { type: 'string', required: true }, storeCode: { type: 'string', required: true }, name: { type: 'string', required: true }, channelType: { type: 'string', required: true, enum: ['WEB', 'MOBILE', 'MARKETPLACE', 'POS'] }, status: { type: 'string', required: true, enum: ['ACTIVE', 'INACTIVE'] }, revision: { type: 'int', required: true } } }),
    pointOfService: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: { code: { type: 'string', required: true }, tenant: { type: 'string', required: true }, storeCode: { type: 'string', required: true }, name: { type: 'string', required: true }, status: { type: 'string', required: true, enum: ['ACTIVE', 'INACTIVE'] }, timezone: { type: 'string', required: true }, revision: { type: 'int', required: true } } })
} };
module.exports.store.store.backoffice = { operations: ['search', 'read', 'create', 'update'], description: 'Store master data and selling context defaults.' };
