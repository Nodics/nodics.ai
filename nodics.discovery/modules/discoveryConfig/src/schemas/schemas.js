/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module discoveryConfig/src/schemas/schemas @description Defines generic Discovery configuration schemas. @layer schema @owner discoveryConfig */
module.exports = { discoveryConfig: {
    discoveryIndexConfiguration: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true },
        tenant: { type: 'string', required: true },
        name: { type: 'string', required: true },
        ownerType: { type: 'string', required: true, enum: ['PRODUCT', 'CONTENT', 'PAGE', 'MEDIA', 'DOCUMENTATION'] },
        indexType: { type: 'string', required: true, enum: ['SEARCH', 'SUGGEST', 'DETAIL', 'FACET'] },
        engine: { type: 'string', required: true },
        indexName: { type: 'string', required: true },
        aliasName: { type: 'string', required: false },
        sourceMixCode: { type: 'string', required: true },
        fieldMappingCode: { type: 'string', required: true },
        queryProfileCode: { type: 'string', required: false },
        facetProfileCode: { type: 'string', required: false },
        rankingProfileCode: { type: 'string', required: false },
        publicationPolicyCode: { type: 'string', required: false },
        scope: { type: 'object', required: false },
        status: { type: 'string', required: true, enum: ['DRAFT', 'READY', 'APPROVED', 'CURRENT', 'RETIRED'] },
        revision: { type: 'int', required: true }
    } }),
    discoverySourceMixConfiguration: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true },
        tenant: { type: 'string', required: true },
        ownerType: { type: 'string', required: true },
        sources: { type: 'array', required: true },
        mergePolicy: { type: 'object', required: false },
        status: { type: 'string', required: true, enum: ['DRAFT', 'READY', 'APPROVED', 'CURRENT', 'RETIRED'] },
        revision: { type: 'int', required: true }
    } }),
    discoveryQueryProfile: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true },
        tenant: { type: 'string', required: true },
        ownerType: { type: 'string', required: true },
        searchableFields: { type: 'array', required: true },
        filters: { type: 'array', required: false },
        sorts: { type: 'array', required: false },
        defaultSort: { type: 'string', required: false },
        pageSizeLimit: { type: 'int', required: false },
        status: { type: 'string', required: true, enum: ['DRAFT', 'READY', 'APPROVED', 'CURRENT', 'RETIRED'] },
        revision: { type: 'int', required: true }
    } }),
    discoveryFacetProfile: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true },
        tenant: { type: 'string', required: true },
        ownerType: { type: 'string', required: true },
        facets: { type: 'array', required: true },
        status: { type: 'string', required: true, enum: ['DRAFT', 'READY', 'APPROVED', 'CURRENT', 'RETIRED'] },
        revision: { type: 'int', required: true }
    } }),
    discoveryRankingProfile: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true },
        tenant: { type: 'string', required: true },
        ownerType: { type: 'string', required: true },
        rules: { type: 'array', required: false },
        conflictPolicy: { type: 'string', required: false },
        status: { type: 'string', required: true, enum: ['DRAFT', 'READY', 'APPROVED', 'CURRENT', 'RETIRED'] },
        revision: { type: 'int', required: true }
    } }),
    discoveryPublicationPolicy: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true },
        tenant: { type: 'string', required: true },
        ownerType: { type: 'string', required: true },
        batchSize: { type: 'int', required: false },
        aliasSwitch: { type: 'bool', required: false },
        rollbackEnabled: { type: 'bool', required: false },
        status: { type: 'string', required: true, enum: ['DRAFT', 'READY', 'APPROVED', 'CURRENT', 'RETIRED'] },
        revision: { type: 'int', required: true }
    } })
} };
module.exports.discoveryConfig.discoveryIndexConfiguration.backoffice = { operations: ['search', 'read', 'create', 'update'], description: 'Generic Discovery index configuration.' };
module.exports.discoveryConfig.discoverySourceMixConfiguration.backoffice = { operations: ['search', 'read', 'create', 'update'], description: 'Generic Discovery source mix configuration.' };
module.exports.discoveryConfig.discoveryQueryProfile.backoffice = { operations: ['search', 'read', 'create', 'update'], description: 'Generic Discovery query profile.' };
module.exports.discoveryConfig.discoveryFacetProfile.backoffice = { operations: ['search', 'read', 'create', 'update'], description: 'Generic Discovery facet profile.' };
module.exports.discoveryConfig.discoveryRankingProfile.backoffice = { operations: ['search', 'read', 'create', 'update'], description: 'Generic Discovery ranking profile.' };
module.exports.discoveryConfig.discoveryPublicationPolicy.backoffice = { operations: ['search', 'read', 'create', 'update'], description: 'Generic Discovery publication policy.' };
