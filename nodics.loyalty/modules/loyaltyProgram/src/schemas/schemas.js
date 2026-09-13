/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module loyaltyProgram/src/schemas/schemas @description Defines Loyalty program records. @layer schema @owner loyaltyProgram @override Later modules may add governed program attributes while preserving reward wallet boundaries. */
module.exports = { loyaltyProgram: {
    loyaltyProgram: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { groups: { schemaOperations: true }, enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        name: { type: 'string', required: true , description: 'Stores the business display name shown to administrators and related user journeys.'},
        description: { type: 'string', required: false , description: 'Explains the business purpose, usage, or administrative meaning of this record.'},
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'PAUSED', 'RETIRED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        defaultRewardTypeCode: { type: 'string', required: true , description: 'Stores the default reward type code used to classify, link, or resolve this record.'},
        earningEnabled: { type: 'bool', required: true, default: true , description: 'Indicates whether earning enabled applies for this record.'},
        spendEnabled: { type: 'bool', required: true, default: true , description: 'Indicates whether spend enabled applies for this record.'},
        startsAt: { type: 'date', required: false , description: 'Records when the starts event or value applies.'},
        endsAt: { type: 'date', required: false , description: 'Records when the ends event or value applies.'},
        expiryPolicyCode: { type: 'string', required: false , description: 'Stores the expiry policy code used to classify, link, or resolve this record.'},
        revision: { type: 'int', required: true, default: 0 , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'},
        metadata: { type: 'object', required: false , description: 'Stores additional structured metadata needed by extensions without changing the core schema contract.'}
    } })
} };
