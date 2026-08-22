/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module editorial/service/DefaultEditorialBackofficeCapabilityService @description Publishes Editorial authoring workbenches to the BackOffice capability registry. @layer service @owner editorial */
module.exports = {
    /** Registers the Editorial capability provider. */
    init: function () { SERVICE.DefaultModuleRegistrationAgentService.registerBackofficeCapabilityProvider('editorial', this); return Promise.resolve(true); },
    /** Completes lifecycle initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns Editorial authoring navigation and backend-owned lifecycle intents. */
    getCapability: function () {
        let definitions = SERVICE.DefaultBackofficeCapabilityDefinitionService;
        let item = (id, parentId, label, route, schemaName, order, summary, presentation, featureState) => definitions.workbench({
            id: id, parentId: parentId, label: label, route: route, moduleName: 'editorial', schemaName: schemaName, order: order,
            permission: 'editorial.backoffice.read', summary: summary, presentation: presentation, featureState: featureState,
            group: { id: 'editorial-space', label: 'Editorial Space', order: 1400 }
        });
        let navigation = [
            item('editorial-content', undefined, 'Editorial Workspace', '/content/editorial', 'editorialArticle', 1400, 'Review drafts, review status, approvals, scheduled/published/attention-required content, corrections, creation shortcuts, and readiness validation.', { defaultColumns: ['code', 'contentTypeCode', 'internalName', 'status', 'revision'] }),
            item('editorial-articles', undefined, 'Editorial Content', '/content/editorial/articles', 'editorialArticle', 1410, 'Author governed News, Blog, and future editorial content types.', { defaultColumns: ['code', 'contentTypeCode', 'internalName', 'status', 'revision'] }),
            item('editorial-news', 'editorial-articles', 'News', '/content/editorial/news', 'editorialArticle', 1411, 'Author News records.', { defaultColumns: ['code', 'internalName', 'status', 'publishFrom', 'revision'], fixedFilters: [{ id: 'editorial-content-type-news', label: 'News', field: 'contentTypeCode', value: 'NEWS', order: 10 }] }),
            item('editorial-blogs', 'editorial-articles', 'Blogs', '/content/editorial/blogs', 'editorialArticle', 1412, 'Author Blog records.', { defaultColumns: ['code', 'internalName', 'status', 'publishFrom', 'revision'], fixedFilters: [{ id: 'editorial-content-type-blog', label: 'Blogs', field: 'contentTypeCode', value: 'BLOG', order: 10 }] }),
            item('article-editor', undefined, 'Article Editor', '/content/editorial/editor', 'editorialArticle', 1420, 'Planned article editor for type, name, slug, websites, authors, series, taxonomy, media, localization, title, body, SEO, embargo, validation, preview, draft, review, and readiness.', { defaultColumns: ['code', 'contentTypeCode', 'internalName', 'status', 'revision'] }, 'DISABLED'),
            item('editorial-review-approval', undefined, 'Editorial Review and Approval', '/content/editorial/review', 'editorialArticle', 1425, 'Planned review queue, review article, review decisions, and workflow-status workspace.', { defaultColumns: ['code', 'contentTypeCode', 'internalName', 'status', 'revision'] }, 'DISABLED'),
            item('editorial-localizations', undefined, 'Languages and Localization', '/content/editorial/languages', 'editorialArticleLocalization', 1430, 'Manage required languages, missing translations, localized content, slugs, SEO, completeness, and revision comparison.', { defaultColumns: ['articleCode', 'localeCode', 'title', 'status', 'revision'] }),
            item('editorial-authors', undefined, 'Authors', '/content/editorial/authors', 'editorialAuthor', 1440, 'Manage author identities and profiles.', { defaultColumns: ['code', 'displayName', 'status'] }),
            item('editorial-taxonomy', undefined, 'Taxonomy', '/content/editorial/taxonomy', 'editorialTaxonomyTerm', 1450, 'Manage editorial categories and tags.', { defaultColumns: ['taxonomyCode', 'code', 'name', 'active'] }),
            item('editorial-series', undefined, 'Series', '/content/editorial/series', 'editorialSeries', 1460, 'Manage recurring editorial series.', { defaultColumns: ['code', 'name', 'active'] }),
            item('featured-special-content', undefined, 'Featured and Special Content', '/content/editorial/featured', 'editorialArticle', 1465, 'Planned featured label, rank, window, variant, conflict, expiry, and preview workspace.', { defaultColumns: ['code', 'contentTypeCode', 'internalName', 'status', 'revision'] }, 'DISABLED'),
            item('editorial-corrections', undefined, 'Corrections and Governance', '/content/editorial/corrections', 'editorialCorrection', 1470, 'Record governed correction, withdrawal, archive, compliance, and governance audit requests.', { defaultColumns: ['code', 'articleCode', 'status', 'requestedBy'] }),
            item('editorial-content-types', undefined, 'Content Type Policies', '/content/editorial/types', 'editorialContentType', 1480, 'Configure Editorial content-type policy.', { defaultColumns: ['code', 'name', 'active', 'workflowDefinitionCode'] })
            ,item('editorial-calendar', undefined, 'Editorial Calendar', '/content/editorial/calendar', 'editorialArticle', 1490, 'Planned calendar by website, author, type, series, deadlines, embargoes, windows, featured windows, and expiry.', { defaultColumns: ['code', 'contentTypeCode', 'internalName', 'status', 'revision'] }, 'DISABLED')
            ,item('editorial-preview-distribution', undefined, 'Editorial Preview and Distribution', '/content/editorial/preview-distribution', 'editorialArticle', 1495, 'Planned preview, public URL, RSS, sitemap, search-discovery, publishing status, and publishing deep-link workspace.', { defaultColumns: ['code', 'contentTypeCode', 'internalName', 'status', 'revision'] }, 'DISABLED')
            ,item('editorial-history-insights', undefined, 'Editorial History and Insights', '/content/editorial/history-insights', 'editorialArticle', 1498, 'Planned article, workflow, review, publishing, correction, author activity, classification, localization completeness, and analytics workspace.', { defaultColumns: ['code', 'contentTypeCode', 'internalName', 'status', 'revision'] }, 'DISABLED')
        ];
        let actions = [
            { id: 'validate', label: 'Validate', intent: 'UPDATE', permission: 'editorial.backoffice.manage', ownerModule: 'editorial', operationRoute: '/authoring/articles/validate', targetStatuses: ['DRAFT', 'CHANGES_REQUESTED'], order: 10 },
            { id: 'submit', label: 'Submit for review', intent: 'UPDATE', permission: 'editorial.workflow.submit', ownerModule: 'editorial', operationRoute: '/authoring/articles/:code/submit', targetStatuses: ['READY'], order: 20 },
            { id: 'approve', label: 'Approve review', intent: 'APPROVE', permission: 'editorial.workflow.submit', ownerModule: 'editorial', operationRoute: '/authoring/articles/:code/approve', targetStatuses: ['IN_REVIEW'], order: 30 },
            { id: 'reject', label: 'Request changes', intent: 'REJECT', permission: 'editorial.workflow.submit', ownerModule: 'editorial', operationRoute: '/authoring/articles/:code/reject', targetStatuses: ['IN_REVIEW'], order: 40 },
            { id: 'publish', label: 'Publish now', intent: 'UPDATE', permission: 'editorial.publish.execute', ownerModule: 'editorial', operationRoute: '/authoring/articles/:code/publish', targetStatuses: ['APPROVED'], order: 50 },
            { id: 'schedule', label: 'Schedule publication', intent: 'UPDATE', permission: 'editorial.publish.schedule', ownerModule: 'editorial', operationRoute: '/authoring/articles/:code/schedule', targetStatuses: ['APPROVED'], order: 60 },
            { id: 'withdraw', label: 'Withdraw', intent: 'UPDATE', permission: 'editorial.publish.withdraw', ownerModule: 'editorial', operationRoute: '/authoring/articles/:code/withdraw', targetStatuses: ['PUBLISHED'], order: 70 }
        ];
        navigation.filter(entry => ['editorial-content', 'editorial-news', 'editorial-blogs'].includes(entry.id)).forEach(entry => { entry.lifecycleActions = actions; });
        return definitions.capability({ capabilityId: 'wcms-editorial', displayName: 'Editorial Content', category: 'content', icon: 'article', navigation: navigation });
    }
};
