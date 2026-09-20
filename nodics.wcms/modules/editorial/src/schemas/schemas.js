/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module editorial/src/schemas/schemas
 * @description Schema definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */

module.exports = {
    editorial: {
        editorialContentType: Object.assign(
            {
                super: 'base',
                model: true,
                schemaPolicies: ['tenantOwned'],
                service: { enabled: true },
                router: { enabled: true },
                cache: { enabled: false },
                event: { enabled: false },
                search: { enabled: false },
            },
            {
                definition: {
                    code: {
                        type: 'string',
                        required: true,
                        description:
                            'Uniquely identifies this record for references, APIs, imports, and business administration.',
                    },
                    name: {
                        type: 'string',
                        required: true,
                        description:
                            'Stores the business display name shown to administrators and related user journeys.',
                    },
                    description: {
                        type: 'string',
                        required: false,
                        description:
                            'Explains the business purpose, usage, or administrative meaning of this record.',
                    },
                    active: {
                        type: 'bool',
                        required: true,
                        description: 'Indicates whether this record is active and available for normal use.',
                    },
                    workflowDefinitionCode: {
                        type: 'string',
                        required: false,
                        description:
                            'Stores the workflow definition code used to classify, link, or resolve this record.',
                    },
                    requiredLocaleCodes: {
                        type: 'array',
                        required: false,
                        description: 'Indicates whether locale codes applies for this record.',
                    },
                    validationRules: {
                        type: 'object',
                        required: false,
                        description: 'Stores structured validation rules details used by this record.',
                    },
                    publicationPolicy: {
                        type: 'object',
                        required: false,
                        description:
                            'Defines the publication policy that controls how this record is handled.',
                    },
                },
            },
        ),
        editorialArticle: Object.assign(
            {
                super: 'base',
                model: true,
                schemaPolicies: ['tenantOwned'],
                service: { enabled: true },
                router: { enabled: true },
                cache: { enabled: false },
                event: { enabled: false },
                search: { enabled: false },
            },
            {
                definition: {
                    code: {
                        type: 'string',
                        required: true,
                        description:
                            'Uniquely identifies this record for references, APIs, imports, and business administration.',
                    },
                    contentTypeCode: {
                        type: 'string',
                        required: true,
                        description:
                            'Stores the content type code used to classify, link, or resolve this record.',
                    },
                    internalName: {
                        type: 'string',
                        required: true,
                        description: 'Stores the internal name value used by this record.',
                    },
                    slug: {
                        type: 'string',
                        required: true,
                        description: 'Stores the slug value used by this record.',
                    },
                    siteCodes: {
                        type: 'array',
                        required: true,
                        description: 'Lists site codes used to classify, link, or resolve this record.',
                    },
                    authorCodes: {
                        type: 'array',
                        required: true,
                        description: 'Lists author codes used to classify, link, or resolve this record.',
                    },
                    seriesCode: {
                        type: 'string',
                        required: false,
                        description: 'Stores the series code used to classify, link, or resolve this record.',
                    },
                    featuredMediaCode: {
                        type: 'string',
                        required: false,
                        description:
                            'Stores the featured media code used to classify, link, or resolve this record.',
                    },
                    taxonomyTermCodes: {
                        type: 'array',
                        required: false,
                        description:
                            'Lists taxonomy term codes used to classify, link, or resolve this record.',
                    },
                    special: {
                        type: 'bool',
                        required: false,
                        description: 'Indicates whether special applies for this record.',
                    },
                    specialLabel: {
                        type: 'string',
                        required: false,
                        description: 'Stores the special label value used by this record.',
                    },
                    specialRank: {
                        type: 'int',
                        required: false,
                        description: 'Stores the numeric special rank used by this record.',
                    },
                    specialFrom: {
                        type: 'date',
                        required: false,
                        description: 'Records when the special from event or value applies.',
                    },
                    specialUntil: {
                        type: 'date',
                        required: false,
                        description: 'Records when the special until event or value applies.',
                    },
                    specialVariant: {
                        type: 'string',
                        required: false,
                        description: 'Stores the special variant value used by this record.',
                    },
                    status: {
                        type: 'string',
                        required: true,
                        enum: [
                            'DRAFT',
                            'READY',
                            'IN_REVIEW',
                            'CHANGES_REQUESTED',
                            'APPROVED',
                            'PUBLISHED',
                            'WITHDRAWN',
                            'ARCHIVED',
                        ],
                        description:
                            'Tracks the lifecycle state that controls whether this record can be used in business processes.',
                    },
                    embargoAt: {
                        type: 'date',
                        required: false,
                        description: 'Records when the embargo event or value applies.',
                    },
                    publishFrom: {
                        type: 'date',
                        required: false,
                        description: 'Records when the publish from event or value applies.',
                    },
                    publishUntil: {
                        type: 'date',
                        required: false,
                        description: 'Records when the publish until event or value applies.',
                    },
                    decisionEvidence: {
                        type: 'object',
                        required: false,
                        description:
                            'Editorial decision receipt binding action, actor, Process instance, node and execution for safe retry without copying workflow state.',
                    },
                    workflowInstanceCode: {
                        type: 'string',
                        required: false,
                        description:
                            'Stores the workflow instance code used to classify, link, or resolve this record.',
                    },
                    publicationCode: {
                        type: 'string',
                        required: false,
                        description:
                            'Stores the publication code used to classify, link, or resolve this record.',
                    },
                    revision: {
                        type: 'int',
                        required: true,
                        description:
                            'Tracks the business revision used for governance, review, and optimistic update checks.',
                    },
                },
                backoffice: {
                    operations: ['search', 'read', 'create', 'update'],
                    description: 'Editorial article authoring master data.',
                },
            },
        ),
        editorialArticleLocalization: Object.assign(
            {
                super: 'base',
                model: true,
                schemaPolicies: ['tenantOwned'],
                service: { enabled: true },
                router: { enabled: true },
                cache: { enabled: false },
                event: { enabled: false },
                search: { enabled: false },
            },
            {
                definition: {
                    code: {
                        type: 'string',
                        required: true,
                        description:
                            'Uniquely identifies this record for references, APIs, imports, and business administration.',
                    },
                    articleCode: {
                        type: 'string',
                        required: true,
                        description:
                            'Stores the article code used to classify, link, or resolve this record.',
                    },
                    localeCode: {
                        type: 'string',
                        required: true,
                        description: 'Stores the locale code used to classify, link, or resolve this record.',
                    },
                    title: {
                        type: 'string',
                        required: true,
                        description: 'Stores the title value used by this record.',
                    },
                    summary: {
                        type: 'string',
                        required: false,
                        description: 'Stores the summary value used by this record.',
                    },
                    body: {
                        type: 'object',
                        required: true,
                        description: 'Stores structured body details used by this record.',
                    },
                    takeaways: {
                        type: 'array',
                        required: false,
                        description: 'Lists the takeaways associated with this record.',
                    },
                    seo: {
                        type: 'object',
                        required: false,
                        description: 'Stores structured seo details used by this record.',
                    },
                    slug: {
                        type: 'string',
                        required: true,
                        description: 'Stores the slug value used by this record.',
                    },
                    status: {
                        type: 'string',
                        required: true,
                        enum: ['DRAFT', 'READY'],
                        description:
                            'Tracks the lifecycle state that controls whether this record can be used in business processes.',
                    },
                    revision: {
                        type: 'int',
                        required: true,
                        description:
                            'Tracks the business revision used for governance, review, and optimistic update checks.',
                    },
                },
                indexes: {
                    composite: {
                        articleCode: { enabled: true, name: 'articleCode', options: { unique: true } },
                        localeCode: { enabled: true, name: 'localeCode', options: { unique: true } },
                    },
                },
            },
        ),
        editorialAuthor: Object.assign(
            {
                super: 'base',
                model: true,
                schemaPolicies: ['tenantOwned'],
                service: { enabled: true },
                router: { enabled: true },
                cache: { enabled: false },
                event: { enabled: false },
                search: { enabled: false },
            },
            {
                definition: {
                    code: {
                        type: 'string',
                        required: true,
                        description:
                            'Uniquely identifies this record for references, APIs, imports, and business administration.',
                    },
                    displayName: {
                        type: 'string',
                        required: true,
                        description: 'Stores the display name value used by this record.',
                    },
                    biography: {
                        type: 'object',
                        required: false,
                        description: 'Stores structured biography details used by this record.',
                    },
                    profileMediaCode: {
                        type: 'string',
                        required: false,
                        description:
                            'Stores the profile media code used to classify, link, or resolve this record.',
                    },
                    socialLinks: {
                        type: 'object',
                        required: false,
                        description: 'Stores structured social links details used by this record.',
                    },
                    status: {
                        type: 'string',
                        required: true,
                        enum: ['DRAFT', 'ACTIVE', 'INACTIVE'],
                        description:
                            'Tracks the lifecycle state that controls whether this record can be used in business processes.',
                    },
                },
            },
        ),
        editorialTaxonomyTerm: Object.assign(
            {
                super: 'base',
                model: true,
                schemaPolicies: ['tenantOwned'],
                service: { enabled: true },
                router: { enabled: true },
                cache: { enabled: false },
                event: { enabled: false },
                search: { enabled: false },
            },
            {
                definition: {
                    code: {
                        type: 'string',
                        required: true,
                        description:
                            'Uniquely identifies this record for references, APIs, imports, and business administration.',
                    },
                    taxonomyCode: {
                        type: 'string',
                        required: true,
                        description:
                            'Stores the taxonomy code used to classify, link, or resolve this record.',
                    },
                    parentCode: {
                        type: 'string',
                        required: false,
                        description: 'Stores the parent code used to classify, link, or resolve this record.',
                    },
                    name: {
                        type: 'string',
                        required: true,
                        description:
                            'Stores the business display name shown to administrators and related user journeys.',
                    },
                    slug: {
                        type: 'string',
                        required: true,
                        description: 'Stores the slug value used by this record.',
                    },
                    active: {
                        type: 'bool',
                        required: true,
                        description: 'Indicates whether this record is active and available for normal use.',
                    },
                    metadata: {
                        type: 'object',
                        required: false,
                        description:
                            'Stores additional structured metadata needed by extensions without changing the core schema contract.',
                    },
                },
            },
        ),
        editorialArticleTaxonomy: Object.assign(
            {
                super: 'base',
                model: true,
                schemaPolicies: ['tenantOwned'],
                service: { enabled: true },
                router: { enabled: true },
                cache: { enabled: false },
                event: { enabled: false },
                search: { enabled: false },
            },
            {
                definition: {
                    code: {
                        type: 'string',
                        required: true,
                        description:
                            'Uniquely identifies this record for references, APIs, imports, and business administration.',
                    },
                    articleCode: {
                        type: 'string',
                        required: true,
                        description:
                            'Stores the article code used to classify, link, or resolve this record.',
                    },
                    termCode: {
                        type: 'string',
                        required: true,
                        description: 'Stores the term code used to classify, link, or resolve this record.',
                    },
                    relationType: {
                        type: 'string',
                        required: true,
                        description:
                            'Classifies this record by relation type for validation and business handling.',
                    },
                },
            },
        ),
        editorialSeries: Object.assign(
            {
                super: 'base',
                model: true,
                schemaPolicies: ['tenantOwned'],
                service: { enabled: true },
                router: { enabled: true },
                cache: { enabled: false },
                event: { enabled: false },
                search: { enabled: false },
            },
            {
                definition: {
                    code: {
                        type: 'string',
                        required: true,
                        description:
                            'Uniquely identifies this record for references, APIs, imports, and business administration.',
                    },
                    name: {
                        type: 'string',
                        required: true,
                        description:
                            'Stores the business display name shown to administrators and related user journeys.',
                    },
                    description: {
                        type: 'object',
                        required: false,
                        description:
                            'Explains the business purpose, usage, or administrative meaning of this record.',
                    },
                    active: {
                        type: 'bool',
                        required: true,
                        description: 'Indicates whether this record is active and available for normal use.',
                    },
                },
            },
        ),
        editorialCorrection: Object.assign(
            {
                super: 'base',
                model: true,
                schemaPolicies: ['tenantOwned'],
                service: { enabled: true },
                router: { enabled: true },
                cache: { enabled: false },
                event: { enabled: false },
                search: { enabled: false },
            },
            {
                definition: {
                    code: {
                        type: 'string',
                        required: true,
                        description:
                            'Uniquely identifies this record for references, APIs, imports, and business administration.',
                    },
                    articleCode: {
                        type: 'string',
                        required: true,
                        description:
                            'Stores the article code used to classify, link, or resolve this record.',
                    },
                    reason: {
                        type: 'string',
                        required: true,
                        description: 'Stores the reason value used by this record.',
                    },
                    correctionText: {
                        type: 'string',
                        required: true,
                        description: 'Stores the correction text value used by this record.',
                    },
                    requestedBy: {
                        type: 'string',
                        required: true,
                        description: 'Stores the requested by value used by this record.',
                    },
                    status: {
                        type: 'string',
                        required: true,
                        enum: ['OPEN', 'APPROVED', 'APPLIED', 'REJECTED'],
                        description:
                            'Tracks the lifecycle state that controls whether this record can be used in business processes.',
                    },
                },
            },
        ),
        editorialOnlineArticle: Object.assign(
            {
                super: 'base',
                model: true,
                schemaPolicies: ['operational'],
                service: { enabled: true },
                router: { enabled: true },
                cache: { enabled: false },
                event: { enabled: false },
                search: { enabled: false },
            },
            {
                router: { enabled: true, groups: { schemaOperations: true } },
                search: { enabled: true, idPropertyName: 'code' },
                definition: {
                    code: {
                        type: 'string',
                        required: true,
                        description:
                            'Uniquely identifies this record for references, APIs, imports, and business administration.',
                    },
                    articleCode: {
                        type: 'string',
                        required: true,
                        description:
                            'Stores the article code used to classify, link, or resolve this record.',
                    },
                    contentTypeCode: {
                        type: 'string',
                        required: true,
                        description:
                            'Stores the content type code used to classify, link, or resolve this record.',
                    },
                    siteCode: {
                        type: 'string',
                        required: true,
                        description: 'Stores the site code used to classify, link, or resolve this record.',
                    },
                    localeCode: {
                        type: 'string',
                        required: true,
                        description: 'Stores the locale code used to classify, link, or resolve this record.',
                    },
                    slug: {
                        type: 'string',
                        required: true,
                        description: 'Stores the slug value used by this record.',
                    },
                    payload: {
                        type: 'object',
                        required: true,
                        description: 'Stores structured payload details used by this record.',
                    },
                    sourceRevision: {
                        type: 'int',
                        required: true,
                        description: 'Stores the numeric source revision used by this record.',
                    },
                    sourceHash: {
                        type: 'string',
                        required: true,
                        description:
                            'Stores a fingerprint of the source data used to detect changes or duplicates.',
                    },
                    status: {
                        type: 'string',
                        required: true,
                        enum: ['CURRENT', 'SUPERSEDED', 'WITHDRAWN'],
                        description:
                            'Tracks the lifecycle state that controls whether this record can be used in business processes.',
                    },
                    publishedAt: {
                        type: 'date',
                        required: true,
                        description: 'Records when the published event or value applies.',
                    },
                },
            },
        ),
        editorialPublicationReceipt: Object.assign(
            {
                super: 'base',
                model: true,
                schemaPolicies: ['operational'],
                service: { enabled: true },
                router: { enabled: true },
                cache: { enabled: false },
                event: { enabled: false },
                search: { enabled: false },
            },
            {
                router: { enabled: true, groups: { schemaOperations: true } },
                definition: {
                    code: {
                        type: 'string',
                        required: true,
                        description:
                            'Uniquely identifies this record for references, APIs, imports, and business administration.',
                    },
                    articleCode: {
                        type: 'string',
                        required: true,
                        description:
                            'Stores the article code used to classify, link, or resolve this record.',
                    },
                    sourceRevision: {
                        type: 'int',
                        required: true,
                        description: 'Stores the numeric source revision used by this record.',
                    },
                    targetCode: {
                        type: 'string',
                        required: true,
                        description: 'Stores the target code used to classify, link, or resolve this record.',
                    },
                    status: {
                        type: 'string',
                        required: true,
                        enum: ['STAGED', 'PUBLISHED', 'SUPERSEDED', 'WITHDRAWN', 'FAILED'],
                        description:
                            'Tracks the lifecycle state that controls whether this record can be used in business processes.',
                    },
                    sourceHash: {
                        type: 'string',
                        required: true,
                        description:
                            'Stores a fingerprint of the source data used to detect changes or duplicates.',
                    },
                    projectionCodes: {
                        type: 'array',
                        required: false,
                        description: 'Lists projection codes used to classify, link, or resolve this record.',
                    },
                    correlationId: {
                        type: 'string',
                        required: true,
                        description: 'Stores the correlation identifier used to correlate this record.',
                    },
                    evidence: {
                        type: 'object',
                        required: false,
                        description: 'Stores structured evidence details used by this record.',
                    },
                    publishedAt: {
                        type: 'date',
                        required: false,
                        description: 'Records when the published event or value applies.',
                    },
                },
            },
        ),
    },
};

// Source authoring and Online projection writes have distinct backend authorities.
for (const name of [
    'editorialContentType',
    'editorialArticle',
    'editorialArticleLocalization',
    'editorialAuthor',
    'editorialTaxonomyTerm',
    'editorialArticleTaxonomy',
    'editorialSeries',
    'editorialCorrection',
]) {
    const schema = module.exports.editorial[name];
    schema.backoffice = Object.assign({}, schema.backoffice, {
        mutationPolicy: { lifecycle: 'PUBLISHABLE', publishRequired: true },
    });
}
for (const name of ['editorialOnlineArticle', 'editorialPublicationReceipt']) {
    module.exports.editorial[name].backoffice = { mutationMode: 'READ_ONLY', operations: ['search', 'read'] };
}
