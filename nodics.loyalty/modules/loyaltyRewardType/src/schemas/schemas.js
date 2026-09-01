/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module loyaltyRewardType/src/schemas/schemas @description Defines reward type records for Loyalty wallet balances. @layer schema @owner loyaltyRewardType @override Later modules may add reward metadata while preserving unit and precision semantics. */
module.exports = { loyaltyRewardType: {
    loyaltyRewardType: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        name: { type: 'string', required: true },
        unitType: { type: 'string', required: true, enum: ['POINT', 'CREDIT', 'STAMP', 'TOKEN', 'CUSTOM'] },
        precision: { type: 'int', required: true, default: 2 },
        allowNegativeBalance: { type: 'bool', required: true, default: false },
        expires: { type: 'bool', required: true, default: false },
        expiryDays: { type: 'int', required: false },
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'SUSPENDED', 'RETIRED'] },
        revision: { type: 'int', required: true, default: 0 },
        metadata: { type: 'object', required: false }
    } })
} };
