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
        code: { type: 'string', required: true },
        tenant: { type: 'string', required: true },
        ownerType: { type: 'string', required: true },
        actionType: { type: 'string', required: true, enum: ['PIN', 'BOOST', 'BURY'] },
        targetCode: { type: 'string', required: true },
        position: { type: 'int', required: false },
        score: { type: 'int', required: false },
        status: { type: 'string', required: true, enum: ['DRAFT', 'APPROVED', 'CURRENT', 'RETIRED'] },
        revision: { type: 'int', required: true }
    } })
} };
