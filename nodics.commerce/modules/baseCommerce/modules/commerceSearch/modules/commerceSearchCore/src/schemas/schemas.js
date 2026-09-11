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
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        tenant: { type: 'string', required: true , description: 'Identifies the runtime tenant partition that scopes this record.'},
        name: { type: 'string', required: true , description: 'Stores the business display name shown to administrators and related user journeys.'},
        storeCode: { type: 'string', required: true , description: 'Stores the store code used to classify, link, or resolve this record.'},
        locale: { type: 'string', required: false , description: 'Stores the locale code used for language, formatting, and regional behavior.'},
        scopeType: { type: 'string', required: true, enum: ['GLOBAL', 'CATEGORY', 'SEARCH_TERM'] , description: 'Classifies this record by scope type for validation and business handling.'},
        categoryCode: { type: 'string', required: false , description: 'Stores the category code used to classify, link, or resolve this record.'},
        searchTerm: { type: 'string', required: false , description: 'Stores the search term value used by this record.'},
        status: { type: 'string', required: true, enum: ['DRAFT', 'READY', 'APPROVED', 'PUBLISHED', 'RETIRED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        validFrom: { type: 'date', required: false , description: 'Records when the valid from event or value applies.'},
        validTo: { type: 'date', required: false , description: 'Records when the valid to event or value applies.'},
        actions: { type: 'array', required: true , description: 'Lists the actions associated with this record.'},
        priority: { type: 'int', required: false , description: 'Stores the numeric priority used by this record.'},
        revision: { type: 'int', required: true , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'},
        evidence: { type: 'object', required: false , description: 'Stores structured evidence details used by this record.'}
    } }),
    commerceSearchRuleVersion: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        tenant: { type: 'string', required: true , description: 'Identifies the runtime tenant partition that scopes this record.'},
        ruleCode: { type: 'string', required: true , description: 'Stores the rule code used to classify, link, or resolve this record.'},
        version: { type: 'string', required: true , description: 'Stores the version value used by this record.'},
        status: { type: 'string', required: true, enum: ['DRAFT', 'APPROVED', 'PUBLISHED', 'SUPERSEDED', 'RETIRED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        snapshot: { type: 'object', required: true , description: 'Stores structured snapshot details used by this record.'},
        sourceHash: { type: 'string', required: true , description: 'Stores a fingerprint of the source data used to detect changes or duplicates.'},
        revision: { type: 'int', required: true , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'},
        evidence: { type: 'object', required: false , description: 'Stores structured evidence details used by this record.'}
    } }),
    commerceSearchRuleProjection: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { search: { enabled: true, idPropertyName: 'code' }, definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        tenant: { type: 'string', required: true , description: 'Identifies the runtime tenant partition that scopes this record.'},
        storeCode: { type: 'string', required: true , description: 'Stores the store code used to classify, link, or resolve this record.'},
        locale: { type: 'string', required: false , description: 'Stores the locale code used for language, formatting, and regional behavior.'},
        scopeType: { type: 'string', required: true, enum: ['GLOBAL', 'CATEGORY', 'SEARCH_TERM'] , description: 'Classifies this record by scope type for validation and business handling.'},
        categoryCode: { type: 'string', required: false , description: 'Stores the category code used to classify, link, or resolve this record.'},
        searchTerm: { type: 'string', required: false , description: 'Stores the search term value used by this record.'},
        actions: { type: 'array', required: true , description: 'Lists the actions associated with this record.'},
        priority: { type: 'int', required: false , description: 'Stores the numeric priority used by this record.'},
        status: { type: 'string', required: true, enum: ['CURRENT', 'WITHDRAWN'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        sourceHash: { type: 'string', required: true , description: 'Stores a fingerprint of the source data used to detect changes or duplicates.'},
        projectedAt: { type: 'date', required: true , description: 'Records when the projected event or value applies.'}
    } })
} };
module.exports.commerceSearchCore.commerceSearchRule.backoffice = { operations: ['search', 'read', 'create', 'update'], description: 'Commerce-specific product discovery ranking rules.' };
