/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module commerceSearchCore/src/schemas/schemas @description Defines Commerce Search rule and projection persistence. @layer schema @owner commerceSearchCore */
module.exports = { commerceSearchCore: {
    commerceSearchRule: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true },
        tenant: { type: 'string', required: true },
        name: { type: 'string', required: true },
        storeCode: { type: 'string', required: true },
        locale: { type: 'string', required: false },
        scopeType: { type: 'string', required: true, enum: ['GLOBAL', 'CATEGORY', 'SEARCH_TERM'] },
        categoryCode: { type: 'string', required: false },
        searchTerm: { type: 'string', required: false },
        status: { type: 'string', required: true, enum: ['DRAFT', 'READY', 'APPROVED', 'PUBLISHED', 'RETIRED'] },
        validFrom: { type: 'date', required: false },
        validTo: { type: 'date', required: false },
        actions: { type: 'array', required: true },
        priority: { type: 'int', required: false },
        revision: { type: 'int', required: true },
        evidence: { type: 'object', required: false }
    } }),
    commerceSearchRuleVersion: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true },
        tenant: { type: 'string', required: true },
        ruleCode: { type: 'string', required: true },
        version: { type: 'string', required: true },
        status: { type: 'string', required: true, enum: ['DRAFT', 'APPROVED', 'PUBLISHED', 'SUPERSEDED', 'RETIRED'] },
        snapshot: { type: 'object', required: true },
        sourceHash: { type: 'string', required: true },
        revision: { type: 'int', required: true },
        evidence: { type: 'object', required: false }
    } }),
    commerceSearchRuleProjection: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { search: { enabled: true, idPropertyName: 'code' }, definition: {
        code: { type: 'string', required: true },
        tenant: { type: 'string', required: true },
        storeCode: { type: 'string', required: true },
        locale: { type: 'string', required: false },
        scopeType: { type: 'string', required: true, enum: ['GLOBAL', 'CATEGORY', 'SEARCH_TERM'] },
        categoryCode: { type: 'string', required: false },
        searchTerm: { type: 'string', required: false },
        actions: { type: 'array', required: true },
        priority: { type: 'int', required: false },
        status: { type: 'string', required: true, enum: ['CURRENT', 'WITHDRAWN'] },
        sourceHash: { type: 'string', required: true },
        projectedAt: { type: 'date', required: true }
    } })
} };
module.exports.commerceSearchCore.commerceSearchRule.backoffice = { operations: ['search', 'read', 'create', 'update'], description: 'Commerce-specific product discovery ranking rules.' };
