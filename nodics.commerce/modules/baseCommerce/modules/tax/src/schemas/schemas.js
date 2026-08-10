/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module tax/src/schemas/schemas @description Defines governed Phase 2 tax persistence and decision evidence. @layer schema @owner tax */
const internal = policy => ({ super: 'base', model: true, schemaPolicies: [policy], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } });
module.exports = { tax: {
    taxPolicy: Object.assign(internal('tenantOwned'), { definition: { code: { type: 'string', required: true }, tenant: { type: 'string', required: true }, jurisdiction: { type: 'string', required: true }, taxCode: { type: 'string', required: true }, rate: { type: 'string', required: true }, status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'] }, revision: { type: 'int', required: true } } }),
    taxDecision: Object.assign(internal('operational'), { definition: { code: { type: 'string', required: true }, tenant: { type: 'string', required: true }, taxCode: { type: 'string', required: true }, jurisdiction: { type: 'string', required: true }, taxableAmount: { type: 'string', required: true }, taxAmount: { type: 'string', required: true }, currency: { type: 'string', required: true }, rate: { type: 'string', required: true }, inclusive: { type: 'bool', required: true }, policyVersion: { type: 'string', required: true }, sourceHash: { type: 'string', required: true }, correlationId: { type: 'string', required: true }, decidedAt: { type: 'date', required: true } } })
} };
