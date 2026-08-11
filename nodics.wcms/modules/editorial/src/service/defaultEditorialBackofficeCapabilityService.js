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
        let item = (id, parentId, label, route, schemaName, order, summary, presentation) => definitions.workbench({
            id: id, parentId: parentId, label: label, route: route, moduleName: 'editorial', schemaName: schemaName, order: order,
            permission: 'editorial.backoffice.read', summary: summary, presentation: presentation,
            group: id === 'editorial-content' ? { id: 'content', label: 'Content & Experience', order: 200 } : undefined
        });
        let navigation = [
            item('editorial-content', undefined, 'Editorial Content', '/content/editorial', 'editorialArticle', 700, 'Author governed News, Blog, and future editorial content types.', { defaultColumns: ['code', 'contentTypeCode', 'internalName', 'status', 'revision'] }),
            item('editorial-news', 'editorial-content', 'News', '/content/editorial/news', 'editorialArticle', 710, 'Author News records.', { defaultColumns: ['code', 'internalName', 'status', 'publishFrom', 'revision'], fixedFilters: [{ id: 'editorial-content-type-news', label: 'News', field: 'contentTypeCode', value: 'NEWS', order: 10 }] }),
            item('editorial-blogs', 'editorial-content', 'Blogs', '/content/editorial/blogs', 'editorialArticle', 720, 'Author Blog records.', { defaultColumns: ['code', 'internalName', 'status', 'publishFrom', 'revision'], fixedFilters: [{ id: 'editorial-content-type-blog', label: 'Blogs', field: 'contentTypeCode', value: 'BLOG', order: 10 }] }),
            item('editorial-localizations', 'editorial-content', 'Article Languages', '/content/editorial/languages', 'editorialArticleLocalization', 730, 'Manage localized editorial presentation.', { defaultColumns: ['articleCode', 'localeCode', 'title', 'status', 'revision'] }),
            item('editorial-authors', 'editorial-content', 'Authors', '/content/editorial/authors', 'editorialAuthor', 740, 'Manage author identities and profiles.', { defaultColumns: ['code', 'displayName', 'status'] }),
            item('editorial-taxonomy', 'editorial-content', 'Taxonomy', '/content/editorial/taxonomy', 'editorialTaxonomyTerm', 750, 'Manage editorial categories and tags.', { defaultColumns: ['taxonomyCode', 'code', 'name', 'active'] }),
            item('editorial-series', 'editorial-content', 'Series', '/content/editorial/series', 'editorialSeries', 760, 'Manage recurring editorial series.', { defaultColumns: ['code', 'name', 'active'] }),
            item('editorial-corrections', 'editorial-content', 'Corrections', '/content/editorial/corrections', 'editorialCorrection', 770, 'Record governed correction requests.', { defaultColumns: ['code', 'articleCode', 'status', 'requestedBy'] }),
            item('editorial-content-types', 'editorial-content', 'Content Types', '/content/editorial/types', 'editorialContentType', 780, 'Configure Editorial content-type policy.', { defaultColumns: ['code', 'name', 'active', 'workflowDefinitionCode'] })
        ];
        let actions = [
            { id: 'validate', label: 'Validate', intent: 'UPDATE', permission: 'editorial.backoffice.manage', ownerModule: 'editorial', operationRoute: '/authoring/articles/validate', targetStatuses: ['DRAFT', 'CHANGES_REQUESTED'], order: 10 },
            { id: 'submit', label: 'Submit for review', intent: 'UPDATE', permission: 'editorial.workflow.submit', ownerModule: 'editorial', operationRoute: '/authoring/articles/:code/submit', targetStatuses: ['DRAFT', 'CHANGES_REQUESTED'], order: 20 },
            { id: 'publish', label: 'Publish now', intent: 'UPDATE', permission: 'editorial.publish.execute', ownerModule: 'editorial', operationRoute: '/authoring/articles/:code/publish', targetStatuses: ['APPROVED'], order: 30 },
            { id: 'schedule', label: 'Schedule publication', intent: 'UPDATE', permission: 'editorial.publish.schedule', ownerModule: 'editorial', operationRoute: '/authoring/articles/:code/schedule', targetStatuses: ['APPROVED'], order: 40 },
            { id: 'withdraw', label: 'Withdraw', intent: 'UPDATE', permission: 'editorial.publish.withdraw', ownerModule: 'editorial', operationRoute: '/authoring/articles/:code/withdraw', targetStatuses: ['PUBLISHED'], order: 50 }
        ];
        navigation.filter(entry => ['editorial-content', 'editorial-news', 'editorial-blogs'].includes(entry.id)).forEach(entry => { entry.lifecycleActions = actions; });
        return definitions.capability({ capabilityId: 'wcms-editorial', displayName: 'Editorial Content', category: 'content', icon: 'article', navigation: navigation });
    }
};
