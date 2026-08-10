/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module product/src/schemas/schemas @description Defines governed Phase 2 product persistence and decision evidence. @layer schema @owner product */
const internal = policy => ({ super: 'base', model: true, schemaPolicies: [policy], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } });
module.exports = { product: {
    product: Object.assign(internal('tenantOwned'), { definition: { code: { type: 'string', required: true }, tenant: { type: 'string', required: true }, name: { type: 'string', required: true }, status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'] }, catalogVersion: { type: 'string', required: true }, revision: { type: 'int', required: true } } }),
    productVariant: Object.assign(internal('tenantOwned'), { definition: { code: { type: 'string', required: true }, tenant: { type: 'string', required: true }, productCode: { type: 'string', required: true }, sku: { type: 'string', required: true }, attributes: { type: 'object', required: true }, status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'] }, revision: { type: 'int', required: true } } }),
    category: Object.assign(internal('tenantOwned'), { definition: { code: { type: 'string', required: true }, tenant: { type: 'string', required: true }, name: { type: 'string', required: true }, parentCode: { type: 'string', required: false }, status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'] }, revision: { type: 'int', required: true } } }),
    productPublication: Object.assign(internal('operational'), { definition: { code: { type: 'string', required: true }, tenant: { type: 'string', required: true }, productCode: { type: 'string', required: true }, catalogVersion: { type: 'string', required: true }, status: { type: 'string', required: true, enum: ['STAGED', 'PUBLISHED', 'WITHDRAWN'] }, sourceHash: { type: 'string', required: true }, publishedAt: { type: 'date', required: false }, correlationId: { type: 'string', required: true } } }),
    productSearchProjection: Object.assign(internal('operational'), { definition: { code: { type: 'string', required: true }, tenant: { type: 'string', required: true }, productCode: { type: 'string', required: true }, storeCode: { type: 'string', required: true }, locale: { type: 'string', required: true }, payload: { type: 'object', required: true }, sourceHash: { type: 'string', required: true }, status: { type: 'string', required: true, enum: ['CURRENT', 'STALE', 'WITHDRAWN'] }, projectedAt: { type: 'date', required: true } } })
} };
