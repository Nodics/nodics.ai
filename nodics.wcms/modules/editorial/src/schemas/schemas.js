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
// Content-type policy governs Staged authoring; it is reference data, not a public article projection.
module.exports.editorial.editorialContentType.backoffice = {
    mutationPolicy: { allowedStages: ['STAGED'] },
    displayProperties: ['name', 'code'],
};
module.exports.editorial.editorialAuthor.backoffice.displayProperties = ['displayName', 'code'];
module.exports.editorial.editorialAuthor.backoffice.searchableFields = ['displayName', 'code'];
for (const name of ['editorialSeries', 'editorialTaxonomyTerm']) {
    module.exports.editorial[name].backoffice.displayProperties = ['name', 'code'];
    module.exports.editorial[name].backoffice.searchableFields = ['name', 'code'];
}
for (const name of ['editorialOnlineArticle', 'editorialPublicationReceipt']) {
    module.exports.editorial[name].backoffice = { mutationMode: 'READ_ONLY', operations: ['search', 'read'] };
}

// A business revision is owned by Editorial commands, independently of technical versioning.
const article = module.exports.editorial.editorialArticle;
const localization = module.exports.editorial.editorialArticleLocalization;
for (const schema of [article, localization]) schema.transaction = { enabled: true, sideEffects: 'none' };
Object.assign(article.definition, {
    publicationSourceRevision: { type: 'int', required: false,
        description: 'Exact source revision of the retained nPublish reference; this does not assert current Online visibility.' },
    publicationIntent: { type: 'object', required: false,
        description: 'Bounded owner-managed nPublish code/source revision claimed before lifecycle effects; editing waits for exact owner confirmation. This is not a publication state or journal.' },
    lastAuthoringCommand: { type: 'object', required: false,
        description: 'Bounded original-actor draft command receipt for inspection without replay; not editable copy or a version history.' },
});
const managedArticleFields = ['active', 'status', 'revision', 'workflowInstanceCode', 'decisionEvidence',
    'publicationCode', 'publicationSourceRevision', 'publicationIntent', 'lastAuthoringCommand'];
article.backoffice.operations = ['search', 'read', 'create'];
article.backoffice.excludedFields = ['lastAuthoringCommand'];
article.backoffice.fields = Object.assign(Object.fromEntries(managedArticleFields.map(name => [name, { readOnly: true }])), {
    code: { label: 'Article reference', description: 'A stable reference used by integrations. Use letters, numbers, dots, underscores or hyphens.' },
    contentTypeCode: { label: 'Content type', description: 'Choose the kind of article. Its policy determines the required languages and review workflow.' },
    internalName: { label: 'Working title', description: 'A title for your team to identify this article. Add the public title separately for each language.' },
    slug: { label: 'URL slug', description: 'The article name used in its web address. Use a short, readable name with hyphens between words.' },
    siteCodes: { label: 'Websites', description: 'Choose the websites where this article will be available after publication.' },
    authorCodes: { label: 'Authors', description: 'Choose the people or editorial team responsible for this article.' },
    seriesCode: { label: 'Series', description: 'Choose an existing editorial series if this article belongs to one.' },
    taxonomyTermCodes: { label: 'Topics', description: 'Choose topics readers can use to find related articles.' },
    featuredMediaCode: { label: 'Featured Media reference' },
});
article.refSchema = {
    contentTypeCode: { enabled: true, schemaName: 'editorialContentType', propertyName: 'code', type: 'one', onTargetDelete: 'RESTRICT' },
    siteCodes: { enabled: true, moduleName: 'cms', schemaName: 'cmsSite', propertyName: 'code', type: 'many', onTargetDelete: 'RESTRICT' },
    authorCodes: { enabled: true, schemaName: 'editorialAuthor', propertyName: 'code', type: 'many', onTargetDelete: 'RESTRICT' },
    seriesCode: { enabled: true, schemaName: 'editorialSeries', propertyName: 'code', type: 'one', onTargetDelete: 'RESTRICT' },
    taxonomyTermCodes: { enabled: true, schemaName: 'editorialTaxonomyTerm', propertyName: 'code', type: 'many', onTargetDelete: 'RESTRICT' },
};
article.backoffice.relationships = {
    authorCodes: { actions: ['SELECT_EXISTING', 'CREATE_RELATED'] },
    taxonomyTermCodes: { actions: ['SELECT_EXISTING', 'CREATE_RELATED'] },
};
article.backoffice.form = {
    createOperation: 'createDraft', managedCreateFields: managedArticleFields,
    omitEmptyOptionalOnReview: true,
    sections: {
        article: { label: 'Article details', fields: ['code', 'contentTypeCode', 'internalName', 'slug'] },
        audience: { label: 'Websites and authors', fields: ['siteCodes', 'authorCodes'] },
        options: { label: 'Optional details', fields: ['description', 'seriesCode', 'featuredMediaCode', 'taxonomyTermCodes',
            'special', 'specialLabel', 'specialRank', 'specialFrom', 'specialUntil', 'specialVariant', 'embargoAt', 'publishFrom', 'publishUntil'] },
    },
};
article.backoffice.aggregateOperations = Object.fromEntries([
    ['createDraft', 'Create draft', 'CREATE', 'MODULE_OWNED', true],
    ['workspace', 'Read saved article', 'READ', 'READ_ONLY', false],
    ['saveDraft', 'Save draft revision', 'UPDATE', 'TRANSACTIONAL', false],
    ['inspectCommand', 'Inspect original command', 'INSPECT', 'READ_ONLY', false],
    ['archive', 'Archive article', 'ARCHIVE', 'MODULE_OWNED', true],
].map(([name, label, purpose, consistency, confirmationRequired]) => [name, {
    enabled: true, label, purpose, consistency, confirmationRequired,
    controller: 'DefaultEditorialAuthoringController', operation: name,
}]));
localization.backoffice = Object.assign({}, localization.backoffice, {
    mutationMode: 'READ_ONLY', operations: ['search', 'read'],
});
localization.dataRelease = { stagedSourceOperation: 'saveAll' };
// Incomplete copy remains a locale DRAFT; review/publication require READY copy through owner validation.
for (const field of ['title', 'slug', 'body']) localization.definition[field].required = false;

// Online visibility and receipt changes share one provider-neutral local transaction.
for (const name of ['editorialOnlineArticle', 'editorialPublicationReceipt']) {
    module.exports.editorial[name].transaction = { enabled: true, sideEffects: 'none' };
}
const publicationReceipt = module.exports.editorial.editorialPublicationReceipt;
publicationReceipt.definition.receiptKind = { type: 'string', required: false,
    enum: ['DEPLOYMENT', 'ARTICLE_HEAD', 'ROUTE_CLAIM', 'ROLLBACK', 'WITHDRAWAL'],
    description: 'Distinguishes retained target operation evidence from target-local article and route pointers; nPublish remains the lifecycle authority.' };
publicationReceipt.definition.revision = { type: 'int', required: false,
    description: 'Database-managed pointer/receipt concurrency token, independent of the Editorial source business revision.' };
publicationReceipt.backoffice.concurrency = { managed: true, field: 'revision' };

// Model-purpose presentation belongs to this schema owner; it grants no operations.
module.exports.editorial.editorialContentType.backoffice = Object.assign({ description: "Article-type policy defining required languages, review workflow and publication rules." }, module.exports.editorial.editorialContentType.backoffice);
module.exports.editorial.editorialArticleLocalization.backoffice = Object.assign({ description: "Saved language-specific article copy at an exact business revision. Edit through the article owner workspace." }, module.exports.editorial.editorialArticleLocalization.backoffice);
module.exports.editorial.editorialAuthor.backoffice = Object.assign({ description: "People or editorial teams credited on articles, with biography and profile references." }, module.exports.editorial.editorialAuthor.backoffice);
module.exports.editorial.editorialTaxonomyTerm.backoffice = Object.assign({ description: "Topics and categories used to classify editorial content." }, module.exports.editorial.editorialTaxonomyTerm.backoffice);
module.exports.editorial.editorialArticleTaxonomy.backoffice = Object.assign({ description: "Associations between editorial articles and taxonomy terms." }, module.exports.editorial.editorialArticleTaxonomy.backoffice);
module.exports.editorial.editorialSeries.backoffice = Object.assign({ description: "Named editorial series that group related articles." }, module.exports.editorial.editorialSeries.backoffice);
module.exports.editorial.editorialCorrection.backoffice = Object.assign({ description: "Retained editorial correction records and their source article references." }, module.exports.editorial.editorialCorrection.backoffice);
module.exports.editorial.editorialOnlineArticle.backoffice = Object.assign({ description: "Published editorial delivery projections. Use the authoring and publication lifecycle to change public content." }, module.exports.editorial.editorialOnlineArticle.backoffice);
module.exports.editorial.editorialPublicationReceipt.backoffice = Object.assign({ description: "Retained Editorial target publication acknowledgements for exact source revisions." }, module.exports.editorial.editorialPublicationReceipt.backoffice);
