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
        name: { type: 'string', required: true , description: 'Stores the business display name shown to administrators and related user journeys.'},
        unitType: { type: 'string', required: true, enum: ['POINT', 'CREDIT', 'STAMP', 'TOKEN', 'CUSTOM'] , description: 'Classifies this record by unit type for validation and business handling.'},
        precision: { type: 'int', required: true, default: 2 , description: 'Stores the numeric precision used by this record.'},
        allowNegativeBalance: { type: 'bool', required: true, default: false , description: 'Indicates whether negative balance applies for this record.'},
        expires: { type: 'bool', required: true, default: false , description: 'Indicates whether expires applies for this record.'},
        expiryDays: { type: 'int', required: false , description: 'Stores the numeric expiry days used by this record.'},
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'SUSPENDED', 'RETIRED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        revision: { type: 'int', required: true, default: 0 , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'},
        metadata: { type: 'object', required: false , description: 'Stores additional structured metadata needed by extensions without changing the core schema contract.'}
    } })
} };
