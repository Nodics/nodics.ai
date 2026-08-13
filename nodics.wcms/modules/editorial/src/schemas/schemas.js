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

module.exports = { editorial: {
    editorialContentType: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true }, name: { type: 'string', required: true }, description: { type: 'string', required: false },
        active: { type: 'bool', required: true }, workflowDefinitionCode: { type: 'string', required: false }, requiredLocaleCodes: { type: 'array', required: false },
        validationRules: { type: 'object', required: false }, publicationPolicy: { type: 'object', required: false }
    }}),
    editorialArticle: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true }, contentTypeCode: { type: 'string', required: true }, internalName: { type: 'string', required: true },
        slug: { type: 'string', required: true }, siteCodes: { type: 'array', required: true }, authorCodes: { type: 'array', required: true },
        seriesCode: { type: 'string', required: false }, featuredMediaCode: { type: 'string', required: false }, taxonomyTermCodes: { type: 'array', required: false },
        special: { type: 'bool', required: false }, specialLabel: { type: 'string', required: false }, specialRank: { type: 'int', required: false },
        specialFrom: { type: 'date', required: false }, specialUntil: { type: 'date', required: false }, specialVariant: { type: 'string', required: false },
        status: { type: 'string', required: true, enum: ['DRAFT', 'READY', 'IN_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'PUBLISHED', 'WITHDRAWN', 'ARCHIVED'] },
        embargoAt: { type: 'date', required: false }, publishFrom: { type: 'date', required: false }, publishUntil: { type: 'date', required: false },
        workflowInstanceCode: { type: 'string', required: false }, publicationCode: { type: 'string', required: false }, revision: { type: 'int', required: true }
    }, backoffice: { operations: ['search', 'read', 'create', 'update'], description: 'Editorial article authoring master data.' } }),
    editorialArticleLocalization: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true }, articleCode: { type: 'string', required: true }, localeCode: { type: 'string', required: true },
        title: { type: 'string', required: true }, summary: { type: 'string', required: false }, body: { type: 'object', required: true },
        takeaways: { type: 'array', required: false }, seo: { type: 'object', required: false }, slug: { type: 'string', required: true }, status: { type: 'string', required: true, enum: ['DRAFT', 'READY'] }, revision: { type: 'int', required: true }
    }, indexes: { composite: { articleCode: { enabled: true, name: 'articleCode', options: { unique: true } }, localeCode: { enabled: true, name: 'localeCode', options: { unique: true } } } } }),
    editorialAuthor: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true }, displayName: { type: 'string', required: true }, biography: { type: 'object', required: false },
        profileMediaCode: { type: 'string', required: false }, socialLinks: { type: 'object', required: false }, status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'INACTIVE'] }
    }}),
    editorialTaxonomyTerm: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true }, taxonomyCode: { type: 'string', required: true }, parentCode: { type: 'string', required: false },
        name: { type: 'string', required: true }, slug: { type: 'string', required: true }, active: { type: 'bool', required: true }, metadata: { type: 'object', required: false }
    }}),
    editorialArticleTaxonomy: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true }, articleCode: { type: 'string', required: true }, termCode: { type: 'string', required: true }, relationType: { type: 'string', required: true }
    }}),
    editorialSeries: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true }, name: { type: 'string', required: true }, description: { type: 'object', required: false }, active: { type: 'bool', required: true }
    }}),
    editorialCorrection: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true }, articleCode: { type: 'string', required: true }, reason: { type: 'string', required: true },
        correctionText: { type: 'string', required: true }, requestedBy: { type: 'string', required: true }, status: { type: 'string', required: true, enum: ['OPEN', 'APPROVED', 'APPLIED', 'REJECTED'] }
    }}),
    editorialOnlineArticle: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { router: { enabled: false }, search: { enabled: true, idPropertyName: 'code' }, definition: {
        code: { type: 'string', required: true }, articleCode: { type: 'string', required: true }, contentTypeCode: { type: 'string', required: true }, siteCode: { type: 'string', required: true },
        localeCode: { type: 'string', required: true }, slug: { type: 'string', required: true }, payload: { type: 'object', required: true }, sourceRevision: { type: 'int', required: true },
        sourceHash: { type: 'string', required: true }, status: { type: 'string', required: true, enum: ['CURRENT', 'SUPERSEDED', 'WITHDRAWN'] }, publishedAt: { type: 'date', required: true }
    }}),
    editorialPublicationReceipt: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { router: { enabled: false }, definition: {
        code: { type: 'string', required: true }, articleCode: { type: 'string', required: true }, sourceRevision: { type: 'int', required: true }, targetCode: { type: 'string', required: true },
        status: { type: 'string', required: true, enum: ['STAGED', 'PUBLISHED', 'SUPERSEDED', 'WITHDRAWN', 'FAILED'] }, sourceHash: { type: 'string', required: true },
        projectionCodes: { type: 'array', required: false }, correlationId: { type: 'string', required: true }, evidence: { type: 'object', required: false }, publishedAt: { type: 'date', required: false }
    }})
}};
