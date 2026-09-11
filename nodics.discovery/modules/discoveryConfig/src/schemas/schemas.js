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
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        tenant: { type: 'string', required: true , description: 'Identifies the runtime tenant partition that scopes this record.'},
        name: { type: 'string', required: true , description: 'Stores the business display name shown to administrators and related user journeys.'},
        ownerType: { type: 'string', required: true, enum: ['PRODUCT', 'CONTENT', 'PAGE', 'MEDIA', 'DOCUMENTATION', 'WCMS_EXPERIENCE'] , description: 'Classifies the type of owner responsible for this record.'},
        indexType: { type: 'string', required: true, enum: ['SEARCH', 'SUGGEST', 'DETAIL', 'FACET'] , description: 'Classifies this record by index type for validation and business handling.'},
        engine: { type: 'string', required: true , description: 'Stores the engine value used by this record.'},
        indexName: { type: 'string', required: true , description: 'Stores the index name value used by this record.'},
        aliasName: { type: 'string', required: false , description: 'Stores the alias name value used by this record.'},
        sourceMixCode: { type: 'string', required: true , description: 'Stores the source mix code used to classify, link, or resolve this record.'},
        fieldMappingCode: { type: 'string', required: true , description: 'Stores the field mapping code used to classify, link, or resolve this record.'},
        queryProfileCode: { type: 'string', required: false , description: 'Stores the query profile code used to classify, link, or resolve this record.'},
        facetProfileCode: { type: 'string', required: false , description: 'Stores the facet profile code used to classify, link, or resolve this record.'},
        rankingProfileCode: { type: 'string', required: false , description: 'Stores the ranking profile code used to classify, link, or resolve this record.'},
        publicationPolicyCode: { type: 'string', required: false , description: 'Stores the publication policy code used to classify, link, or resolve this record.'},
        scope: { type: 'object', required: false , description: 'Stores structured scope details used by this record.'},
        status: { type: 'string', required: true, enum: ['DRAFT', 'READY', 'APPROVED', 'CURRENT', 'RETIRED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        revision: { type: 'int', required: true , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'}
    } }),
    discoverySourceMixConfiguration: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        tenant: { type: 'string', required: true , description: 'Identifies the runtime tenant partition that scopes this record.'},
        ownerType: { type: 'string', required: true , description: 'Classifies the type of owner responsible for this record.'},
        sources: { type: 'array', required: true , description: 'Lists the sources associated with this record.'},
        mergePolicy: { type: 'object', required: false , description: 'Defines the merge policy that controls how this record is handled.'},
        status: { type: 'string', required: true, enum: ['DRAFT', 'READY', 'APPROVED', 'CURRENT', 'RETIRED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        revision: { type: 'int', required: true , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'}
    } }),
    discoveryQueryProfile: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        tenant: { type: 'string', required: true , description: 'Identifies the runtime tenant partition that scopes this record.'},
        ownerType: { type: 'string', required: true , description: 'Classifies the type of owner responsible for this record.'},
        searchableFields: { type: 'array', required: true , description: 'Lists the searchable fields associated with this record.'},
        filters: { type: 'array', required: false , description: 'Lists the filters associated with this record.'},
        sorts: { type: 'array', required: false , description: 'Lists the sorts associated with this record.'},
        defaultSort: { type: 'string', required: false , description: 'Stores the default sort value used by this record.'},
        pageSizeLimit: { type: 'int', required: false , description: 'Stores the page size limit used for validation, calculation, or operational decisions.'},
        status: { type: 'string', required: true, enum: ['DRAFT', 'READY', 'APPROVED', 'CURRENT', 'RETIRED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        revision: { type: 'int', required: true , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'}
    } }),
    discoveryFacetProfile: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        tenant: { type: 'string', required: true , description: 'Identifies the runtime tenant partition that scopes this record.'},
        ownerType: { type: 'string', required: true , description: 'Classifies the type of owner responsible for this record.'},
        facets: { type: 'array', required: true , description: 'Lists the facets associated with this record.'},
        status: { type: 'string', required: true, enum: ['DRAFT', 'READY', 'APPROVED', 'CURRENT', 'RETIRED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        revision: { type: 'int', required: true , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'}
    } }),
    discoveryRankingProfile: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        tenant: { type: 'string', required: true , description: 'Identifies the runtime tenant partition that scopes this record.'},
        ownerType: { type: 'string', required: true , description: 'Classifies the type of owner responsible for this record.'},
        rules: { type: 'array', required: false , description: 'Lists the rules associated with this record.'},
        conflictPolicy: { type: 'string', required: false , description: 'Defines the conflict policy that controls how this record is handled.'},
        status: { type: 'string', required: true, enum: ['DRAFT', 'READY', 'APPROVED', 'CURRENT', 'RETIRED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        revision: { type: 'int', required: true , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'}
    } }),
    discoveryPublicationPolicy: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        tenant: { type: 'string', required: true , description: 'Identifies the runtime tenant partition that scopes this record.'},
        ownerType: { type: 'string', required: true , description: 'Classifies the type of owner responsible for this record.'},
        batchSize: { type: 'int', required: false , description: 'Stores the numeric batch size used by this record.'},
        aliasSwitch: { type: 'bool', required: false , description: 'Indicates whether alias switch applies for this record.'},
        rollbackEnabled: { type: 'bool', required: false , description: 'Indicates whether rollback enabled applies for this record.'},
        status: { type: 'string', required: true, enum: ['DRAFT', 'READY', 'APPROVED', 'CURRENT', 'RETIRED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        revision: { type: 'int', required: true , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'}
    } })
} };
module.exports.discoveryConfig.discoveryIndexConfiguration.backoffice = { operations: ['search', 'read', 'create', 'update'], description: 'Generic Discovery index configuration.' };
module.exports.discoveryConfig.discoverySourceMixConfiguration.backoffice = { operations: ['search', 'read', 'create', 'update'], description: 'Generic Discovery source mix configuration.' };
module.exports.discoveryConfig.discoveryQueryProfile.backoffice = { operations: ['search', 'read', 'create', 'update'], description: 'Generic Discovery query profile.' };
module.exports.discoveryConfig.discoveryFacetProfile.backoffice = { operations: ['search', 'read', 'create', 'update'], description: 'Generic Discovery facet profile.' };
module.exports.discoveryConfig.discoveryRankingProfile.backoffice = { operations: ['search', 'read', 'create', 'update'], description: 'Generic Discovery ranking profile.' };
module.exports.discoveryConfig.discoveryPublicationPolicy.backoffice = { operations: ['search', 'read', 'create', 'update'], description: 'Generic Discovery publication policy.' };
