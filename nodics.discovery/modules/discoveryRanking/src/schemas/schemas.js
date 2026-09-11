/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module discoveryRanking/src/schemas/schemas @description Defines generic Discovery ranking action schema. @layer schema @owner discoveryRanking */
module.exports = { discoveryRanking: {
    discoveryRankingAction: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        tenant: { type: 'string', required: true , description: 'Identifies the runtime tenant partition that scopes this record.'},
        ownerType: { type: 'string', required: true , description: 'Classifies the type of owner responsible for this record.'},
        actionType: { type: 'string', required: true, enum: ['PIN', 'BOOST', 'BURY'] , description: 'Classifies this record by action type for validation and business handling.'},
        targetCode: { type: 'string', required: true , description: 'Stores the target code used to classify, link, or resolve this record.'},
        position: { type: 'int', required: false , description: 'Stores the numeric position used by this record.'},
        score: { type: 'int', required: false , description: 'Stores the numeric score used by this record.'},
        status: { type: 'string', required: true, enum: ['DRAFT', 'APPROVED', 'CURRENT', 'RETIRED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        revision: { type: 'int', required: true , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'}
    } })
} };
