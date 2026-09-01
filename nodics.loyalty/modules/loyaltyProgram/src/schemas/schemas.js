/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module loyaltyProgram/src/schemas/schemas @description Defines Loyalty program records. @layer schema @owner loyaltyProgram @override Later modules may add governed program attributes while preserving reward wallet boundaries. */
module.exports = { loyaltyProgram: {
    loyaltyProgram: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        name: { type: 'string', required: true },
        description: { type: 'string', required: false },
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'PAUSED', 'RETIRED'] },
        defaultRewardTypeCode: { type: 'string', required: true },
        earningEnabled: { type: 'bool', required: true, default: true },
        spendEnabled: { type: 'bool', required: true, default: true },
        startsAt: { type: 'date', required: false },
        endsAt: { type: 'date', required: false },
        expiryPolicyCode: { type: 'string', required: false },
        revision: { type: 'int', required: true, default: 0 },
        metadata: { type: 'object', required: false }
    } })
} };
