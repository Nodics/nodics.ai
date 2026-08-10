/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module pricing/src/schemas/schemas @description Defines governed Phase 2 pricing persistence and decision evidence. @layer schema @owner pricing */
const internal = policy => ({ super: 'base', model: true, schemaPolicies: [policy], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } });
module.exports = { pricing: {
    priceBook: Object.assign(internal('tenantOwned'), { definition: { code: { type: 'string', required: true }, tenant: { type: 'string', required: true }, currency: { type: 'string', required: true }, status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'] }, validFrom: { type: 'date', required: false }, validTo: { type: 'date', required: false }, revision: { type: 'int', required: true } } }),
    priceRow: Object.assign(internal('tenantOwned'), { definition: { code: { type: 'string', required: true }, tenant: { type: 'string', required: true }, priceBookCode: { type: 'string', required: true }, productCode: { type: 'string', required: true }, unitAmount: { type: 'string', required: true }, currency: { type: 'string', required: true }, minQuantity: { type: 'string', required: true }, validFrom: { type: 'date', required: false }, validTo: { type: 'date', required: false }, revision: { type: 'int', required: true } } }),
    priceDecision: Object.assign(internal('operational'), { definition: { code: { type: 'string', required: true }, tenant: { type: 'string', required: true }, productCode: { type: 'string', required: true }, storeCode: { type: 'string', required: true }, quantity: { type: 'string', required: true }, unitAmount: { type: 'string', required: true }, totalAmount: { type: 'string', required: true }, currency: { type: 'string', required: true }, priceRowCode: { type: 'string', required: true }, calculationVersion: { type: 'string', required: true }, sourceHash: { type: 'string', required: true }, correlationId: { type: 'string', required: true }, decidedAt: { type: 'date', required: true } } })
} };
