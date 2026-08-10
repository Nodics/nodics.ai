/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module promotion/src/schemas/schemas @description Defines governed Phase 2 promotion persistence and decision evidence. @layer schema @owner promotion */
const internal = policy => ({ super: 'base', model: true, schemaPolicies: [policy], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } });
module.exports = { promotion: {
    promotion: Object.assign(internal('tenantOwned'), { definition: { code: { type: 'string', required: true }, tenant: { type: 'string', required: true }, name: { type: 'string', required: true }, status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'SUSPENDED', 'ARCHIVED'] }, priority: { type: 'int', required: true }, conditions: { type: 'object', required: true }, actions: { type: 'object', required: true }, validFrom: { type: 'date', required: false }, validTo: { type: 'date', required: false }, revision: { type: 'int', required: true } } }),
    coupon: Object.assign(internal('tenantOwned'), { definition: { code: { type: 'string', required: true }, tenant: { type: 'string', required: true }, promotionCode: { type: 'string', required: true }, tokenHash: { type: 'string', required: true }, status: { type: 'string', required: true, enum: ['ACTIVE', 'REDEEMED', 'SUSPENDED', 'EXPIRED'] }, maxUses: { type: 'int', required: true }, usedCount: { type: 'int', required: true }, revision: { type: 'int', required: true } } }),
    discountDecision: Object.assign(internal('operational'), { definition: { code: { type: 'string', required: true }, tenant: { type: 'string', required: true }, promotionCode: { type: 'string', required: true }, targetType: { type: 'string', required: true, enum: ['CART', 'ENTRY', 'DELIVERY'] }, targetCode: { type: 'string', required: true }, discountAmount: { type: 'string', required: true }, currency: { type: 'string', required: true }, reasonCode: { type: 'string', required: true }, ruleVersion: { type: 'string', required: true }, sourceHash: { type: 'string', required: true }, correlationId: { type: 'string', required: true }, decidedAt: { type: 'date', required: true } } })
} };
