/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cms/service/designer/defaultCmsDesignerCompositionService
 * @description Governs Axis Page Designer composition intents using CMS, Catalog, Media, route, navigation, and publication-owned contracts.
 * @layer service
 * @owner cms
 * @override Customer WCMS modules may override focused methods to strengthen authoring rules while keeping Catalog-first ownership and existing CMS schemas.
 */
const { createHash } = require('node:crypto');
const designerCodePattern = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;

module.exports = {
    /** Initializes the designer composition service lifecycle. */
    init: function () { return Promise.resolve(true); },

    /** Completes the designer composition service lifecycle. */
    postInit: function () { return Promise.resolve(true); },

    /** Returns the client-safe designer authority model and accepted workflow operations. */
    getAuthoringModel: async function (request) {
        this.access().authorize(request, 'cms.backoffice.view');
        const metadata = await this.authoringMetadata(request);
        this.access().authorize(request, 'cms.backoffice.view');
        return {
            result: {
                contractVersion: 0,
                hierarchy: ['Content Catalog', 'Site', 'Page Template', 'Page', 'Template Slots', 'Page Sections',
                    'Component Instances', 'Governed Media', 'Page Route', 'Navigation Node', 'Publishing'],
                ownership: {
                    catalog: 'catalog.catalog',
                    site: 'cms.cmsSite',
                    template: 'cms.cmsPageTemplate',
                    slot: 'cms.cmsSlotDefinition',
                    page: 'cms.cmsPage',
                    section: 'cms.cmsComponentDetail',
                    component: 'cms.cmsComponent',
                    componentLocalization: 'cms.cmsComponentLocalization',
                    media: 'cms.cmsComponentMedia and media-owned media/mediaSet',
                    route: 'cms.cmsPageRoute',
                    navigation: 'cms.cmsNavigationNode',
                    publishing: 'publish.publicationRequest and cms publication manifest contracts'
                },
                operations: ['listDraftPages', 'getDraftComposition', 'validateDraftComposition', 'saveDraftComposition', 'addSection', 'updateSection', 'deleteSection',
                    'reorderSection', 'addComponent', 'updateComponent', 'deleteComponent', 'reorderComponent',
                    'associateMedia', 'detachMedia', 'assignRoute', 'assignNavigation', 'validatePublishReadiness',
                    'submitForPublication'].filter(operation => {
                        const route = require('../../router/routers').cms.cmsDesignerComposition[operation];
                        const security = SERVICE.DefaultSecuredRequestPipelineService;
                        return CONFIG.get('runtimeRole')?.publication === 'STAGED' &&
                            security.isPermissionGranted(route.permission, security.getGrantedPermissions(request), {});
                    }),
                rules: {
                    catalogFirst: true,
                    arbitrarySlots: true,
                    frontendPersistence: false,
                    pixelPerfectRendering: false
                },
                defaults: this.clientAuthoringDefaults(metadata),
                presentation: this.authoringPresentation(),
                retirement: this.retirementPresentation(),
                metadata
            }
        };
    },

    /** Lists existing scoped pages through the read-only Designer owner. */
    listDraftPages: function (request) { return SERVICE.DefaultCmsDesignerReadService.listPages(request); },

    /** Reopens one exact scoped page through the read-only Designer owner. */
    getDraftComposition: function (request) { return SERVICE.DefaultCmsDesignerReadService.getDraft(request); },

    /** Resolves the existing documentation product's root page, template and slots without modifying source-pack records. */
    getDocumentationDraftModel: async function (request) {
        const access = this.access();
        const { siteCode, catalogCode } = await access.scope(request, 'cms.authoring.write');
        const read = (owner, query) => access.records(owner, request, { ...query, active: true });
        const one = values => {
            const distinct = new Map(values.map(value => [JSON.stringify(value), value]));
            if (distinct.size !== 1 || distinct.has(undefined))
                throw this.error('ERR_CMS_00103', 'The documentation product does not have one qualified authoring template.');
            return distinct.values().next().value;
        };
        const product = one((await read('DefaultCmsDocumentationProductService', { site: siteCode, contentCatalog: catalogCode }))
            .map(row => ({ rootPath: row.publicRootPath, locale: row.defaultLocale })));
        if (typeof product.rootPath !== 'string' || !/^\/docs\/[A-Za-z0-9][A-Za-z0-9/_-]*$/.test(product.rootPath) ||
            typeof product.locale !== 'string' || !product.locale)
            throw this.error('ERR_CMS_00103', 'The documentation product has no valid root route.');
        const rootRoute = one((await read('DefaultCmsPageRouteService', { site: siteCode, path: product.rootPath, channel: 'web' }))
            .map(row => ({ code: this.codeOf(row.page), accessMode: row.accessMode })));
        const page = one((await read('DefaultCmsPageService', { code: rootRoute.code }))
            .filter(row => Array.isArray(row.cmsSite) && row.cmsSite.map(this.codeOf).includes(siteCode))
            .map(row => ({ templateCode: this.codeOf(row.template), typeCode: this.codeOf(row.typeCode), renderer: row.renderer })));
        if (page.renderer !== 'documentation.page.article' || !page.templateCode || !page.typeCode ||
            !['PUBLIC', 'AUTHENTICATED'].includes(rootRoute.accessMode))
            throw this.error('ERR_CMS_00103', 'The documentation product has no qualified article renderer.');
        const slots = await read('DefaultCmsSlotDefinitionService', { template: page.templateCode });
        const type = name => one(slots.filter(slot => slot.name === name)
            .flatMap(slot => (slot.allowedComponentTypes || []).map(this.codeOf)));
        const articleTypeCode = type('article'), navigationTypeCode = type('navigation');
        if (!articleTypeCode || !navigationTypeCode)
            throw this.error('ERR_CMS_00103', 'The documentation template has no qualified article and navigation slots.');
        const localization = CONFIG.get('cms')?.localization || {};
        access.authorize(request, 'cms.authoring.write');
        return { result: { siteCode, catalogCode, rootPath: product.rootPath, ...page,
            articleTypeCode, navigationTypeCode, accessMode: rootRoute.accessMode,
            locale: localization.legacyRouteLocale || product.locale } };
    },

    /** Projects only bounded configured form copy; it never grants an operation or embeds executable form controls. */
    authoringPresentation: function () {
        const configured = this.authoringPolicy().presentation;
        if (configured === undefined) return undefined;
        if (!configured || typeof configured !== 'object' || Array.isArray(configured))
            throw this.error('ERR_CMS_00100', 'CMS Designer presentation configuration is invalid.');
        const result = {};
        for (const key of ['newPageTitle', 'pageNameLabel', 'pageNameHelp', 'createdMessage', 'continueLabel',
            'knownSavedMessage', 'changedAfterCreationMessage', 'publicationUnconfirmedMessage']) {
            const value = configured[key];
            if (typeof value !== 'string' || !value.trim() || value.length > 1024 || /[\u0000-\u001f\u007f]/.test(value))
                throw this.error('ERR_CMS_00100', 'CMS Designer presentation configuration is invalid.');
            result[key] = value;
        }
        return result;
    },

    /** Supplies inert retirement review copy; permitted operations remain the only command admission projection. */
    retirementPresentation: function () {
        return {
            title: 'Retire content', targetLabel: 'Record kind', codeLabel: 'Record code',
            catalogLabel: 'Catalog', siteLabel: 'Site', enterpriseLabel: 'Enterprise',
            reviewLabel: 'Review retirement', reviewTitle: 'Review content retirement',
            confirmLabel: 'Confirm retirement', cancelLabel: 'Close review',
            acknowledgeLabel: 'I reviewed this record, scope and consequence',
            inspectionLabel: 'I inspected the current CMS record after this outcome',
            uncertainMessage: 'The outcome is uncertain. Inspect the current record through its CMS owner before another submission. This command will not be replayed.',
            successMessage: 'Retirement saved as an inactive version. Publication remains a separate governed action.',
            changedMessage: 'Authority or scope changed. Close this review and review the current selection again.',
            historyMessage: 'History is retained. This does not remove references, delete Media assets or deploy a publication.',
            actions: [
                { operation: 'deleteSection', label: 'Section placement',
                    consequence: 'Retires only this placement, not its target component. Page placements retain their Site; nested component placements belong to the shared Catalog.' },
                { operation: 'deleteComponent', label: 'Shared component',
                    consequence: 'Retires this component in the selected enterprise and Catalog. It may be reused by multiple Sites in that Catalog; their references are not removed.' },
                { operation: 'detachMedia', label: 'Media association',
                    consequence: 'Retires only this component-to-Media association. The Media asset and component remain; the association may be shared across Sites in this Catalog.' }
            ]
        };
    },

    /** Validates a complete draft composition without mutating CMS records. */
    validateDraftComposition: async function (request) {
        let draft = this.normalizeDraft(request.cmsDesigner || request.body || {});
        let evidence = await this.validateDraftGraph(request, draft);
        return { result: Object.assign({ valid: true, status: 'VALID_DRAFT' }, evidence) };
    },

    /** Saves a complete draft composition through existing CMS-generated services. */
    saveDraftComposition: async function (request) {
        let draft = this.normalizeDraft(request.cmsDesigner || request.body || {});
        let evidence = await this.validateDraftGraph(request, draft);
        const scope = await this.access().scope(request, 'cms.authoring.write');
        const existing = await this.access().assertIdentity('DefaultCmsPageService', request, draft.page.code, scope);
        if (existing.length && draft.sourceVersion === undefined)
            throw this.error('ERR_CMS_00111', 'This page already exists. Open its saved composition before editing it.');
        if (draft.sourceVersion !== undefined) {
            const current = (await this.getDraftComposition(request)).result;
            if (!current.editable || current.sourceVersion !== draft.sourceVersion) {
                throw this.error('ERR_CMS_00111', 'The saved composition changed or requires another editor. Reopen it before saving.');
            }
        }
        const placementPlan = await this.planDraftPlacements(request, draft, scope);
        for (const move of placementPlan.moves)
            await this.saveRecord('DefaultCmsComponentDetailService', request, move);
        let saved = {};
        saved.page = await this.saveRecord('DefaultCmsPageService', request, this.pageModel(draft));
        saved.components = [];
        saved.localizations = [];
        saved.sections = [];
        saved.media = [];
        const saveSections = async (sections, source) => {
            for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
                const section = sections[sectionIndex];
                for (let componentIndex = 0; componentIndex < section.components.length; componentIndex++) {
                    const component = section.components[componentIndex];
                    saved.components.push(await this.saveRecord('DefaultCmsComponentService', request, this.componentModel(component)));
                    await saveSections(component.sections || [], component.code);
                    for (const localization of component.localizations) saved.localizations.push(await this.saveRecord(
                        'DefaultCmsComponentLocalizationService', request, this.localizationModel(component, localization)));
                    saved.sections.push(await this.saveRecord('DefaultCmsComponentDetailService', request,
                        this.sectionModel({ page: { code: source } }, section, component, sectionIndex, componentIndex)));
                    for (let mediaIndex = 0; mediaIndex < component.media.length; mediaIndex++) {
                        const model = this.mediaModel(component, component.media[mediaIndex], mediaIndex);
                        await SERVICE.DefaultCmsContractValidationService.validateComponentMedia({ ...request, model });
                        saved.media.push(await this.saveRecord('DefaultCmsComponentMediaService', request, model));
                    }
                }
            }
        };
        await saveSections(draft.sections, draft.page.code);
        const navigation = draft.navigation && this.navigationIntent(draft);
        const route = draft.route && this.routeIntent(draft);
        const navigationEntry = route && this.navigationEntry(route, navigation);
        const scopedIntent = model => Object.assign({ siteCode: draft.siteCode, catalogCode: draft.catalogCode }, model);
        // Page links can be frozen with the route only after their owner accepts the menu write.
        if (navigationEntry) saved.navigation = await this.assignNavigation({ ...request, cmsDesigner: scopedIntent(navigation) });
        if (route) saved.route = await this.assignRoute({ ...request, cmsDesigner: scopedIntent(route) },
            navigation ? navigationEntry || null : undefined);
        // A separate ROUTE node may reference the route just saved above.
        if (navigation && !navigationEntry) saved.navigation = await this.assignNavigation({ ...request, cmsDesigner: scopedIntent(navigation) });
        await this.invalidateDelivery(request);
        return { result: { status: 'DRAFT_SAVED', evidence: evidence, saved: saved } };
    },

    /** Adds one section placement by creating a CMS component-detail record. */
    addSection: async function (request) {
        this.access().authorize(request, 'cms.authoring.write');
        let input = request.cmsDesigner || request.body || {};
        let model = this.componentDetailIntent(input);
        await this.validateSlotPlacement(request, model);
        return { result: await this.saveRecord('DefaultCmsComponentDetailService', request, model) };
    },

    /** Updates one section placement by saving the component-detail model. */
    updateSection: async function (request) {
        return this.addSection(request);
    },

    /** Removes one section placement through the CMS component-detail service. */
    deleteSection: async function (request) {
        return { result: await this.removeRecord('DefaultCmsComponentDetailService', request, this.deleteQuery(request)) };
    },

    /** Reorders one section placement by saving the requested component-detail index. */
    reorderSection: async function (request) {
        return this.addSection(request);
    },

    /** Adds one CMS component record. */
    addComponent: async function (request) {
        this.access().authorize(request, 'cms.authoring.write');
        let model = this.componentIntent(request.cmsDesigner || request.body || {});
        this.validateConfiguredContent(model);
        if (model.renderer) {
            await SERVICE.DefaultCmsContractValidationService.validateRenderer({ model: { renderer: model.renderer } });
        }
        return { result: await this.saveRecord('DefaultCmsComponentService', request, model) };
    },

    /** Updates one CMS component record. */
    updateComponent: async function (request) {
        return this.addComponent(request);
    },

    /** Removes one CMS component record. */
    deleteComponent: async function (request) {
        return { result: await this.removeRecord('DefaultCmsComponentService', request, this.deleteQuery(request)) };
    },

    /** Reorders one component placement by updating its component-detail index. */
    reorderComponent: async function (request) {
        return this.addSection(request);
    },

    /** Associates a governed media item or set with one CMS component. */
    associateMedia: async function (request) {
        this.access().authorize(request, 'cms.authoring.write');
        let model = this.mediaIntent(request.cmsDesigner || request.body || {});
        await SERVICE.DefaultCmsContractValidationService.validateComponentMedia(Object.assign({}, request, { model: model }));
        return { result: await this.saveRecord('DefaultCmsComponentMediaService', request, model) };
    },

    /** Detaches a governed media association from one CMS component. */
    detachMedia: async function (request) {
        return { result: await this.removeRecord('DefaultCmsComponentMediaService', request, this.deleteQuery(request)) };
    },

    /** Assigns one draft route to a CMS page after route uniqueness validation. */
    assignRoute: async function (request, navigationEntry) {
        this.access().authorize(request, 'cms.authoring.write');
        let model = this.routeIntent(request.cmsDesigner || request.body || {});
        if (navigationEntry !== undefined) model.navigationEntry = navigationEntry;
        await SERVICE.DefaultCmsContractValidationService.validateRoute({ model: model });
        await this.validateRouteUniqueness(request, model);
        return { result: await this.saveRecord('DefaultCmsPageRouteService', request, model) };
    },

    /** Assigns one navigation node to a CMS Site. */
    assignNavigation: async function (request) {
        this.access().authorize(request, 'cms.authoring.write');
        let model = this.navigationIntent(request.cmsDesigner || request.body || {});
        await SERVICE.DefaultCmsContractValidationService.validateNavigationNode(Object.assign({}, request, { model: model }));
        return { result: await this.saveRecord('DefaultCmsNavigationNodeService', request, model) };
    },

    /** Validates whether a draft is ready for a publication request. */
    validatePublishReadiness: async function (request) {
        let draft = this.normalizeDraft(request.cmsDesigner || request.body || {});
        let evidence = await this.validateDraftGraph(request, draft);
        if (!draft.route) throw this.error('ERR_CMS_00106', 'A route is required before a CMS draft can be publication-ready');
        if (this.compositionEntries(draft).some(({ component }) =>
            component.localizations.some(localization => localization.status !== 'READY'))) {
            throw this.error('ERR_CMS_00106', 'Review each entered translation and mark it ready before submitting for publication');
        }
        if (!draft.navigation && this.authoringPolicy().requireNavigationForPublish) {
            throw this.error('ERR_CMS_00106', 'A navigation node is required before this CMS draft can be publication-ready');
        }
        return { result: Object.assign({ valid: true, status: 'READY_TO_PUBLISH' }, evidence) };
    },

    /** Submits one saved Page Designer route version to CMS/nPublish governance. */
    submitForPublication: async function (request) {
        this.access().authorize(request, 'cms.authoring.write');
        let draft = this.normalizeDraft(request.cmsDesigner || request.body || {});
        const current = (await this.getDraftComposition(request)).result;
        if (!current.editable || draft.sourceVersion !== undefined && current.sourceVersion !== draft.sourceVersion)
            throw this.error('ERR_CMS_00111', 'The saved composition changed or needs another editor. Reopen it before requesting publication.');
        // Every Designer publication validates actual saved translations, never
        // a caller's unsaved READY flags or omitted variants.
        draft = this.normalizeDraft(current.draft);
        let readiness = await this.validatePublishReadiness(Object.assign({}, request, { cmsDesigner: draft }));
        let routeIntent = this.routeIntent(draft);
        let route = await this.resolveSavedRouteVersion(request, routeIntent);
        const entry = this.navigationEntry(routeIntent, draft.navigation && this.navigationIntent(draft));
        if (!require('node:util').isDeepStrictEqual(route.navigationEntry || null, entry || null))
            throw this.error('ERR_CMS_00106', 'Save the page with its current menu entry before submitting for publication');
        let sourceVersion = route.versionId === undefined ? route.revision : route.versionId;
        if (sourceVersion === undefined || sourceVersion === null) {
            throw this.error('ERR_CMS_00106', 'Saved CMS route version is required before submitting to Publishing');
        }
        let publicationCode = this.derivedCode('publication', ['cms', route.site, route.code, String(sourceVersion)]);
        let publication = {
            code: publicationCode,
            domain: 'cms',
            rootType: 'pageRoute',
            rootCode: route.code,
            sourceVersion: String(sourceVersion),
            siteCode: route.site,
            catalogCode: draft.catalogCode
        };
        let lifecycle = this.service('DefaultPublicationLifecycleService');
        this.access().authorize(request, 'cms.authoring.write');
        let created = await lifecycle.create(Object.assign({}, request, {
            publication: publication,
            reason: 'Axis Page Designer submit to Publishing'
        }));
        this.access().authorize(request, 'cms.authoring.write');
        let validated = await lifecycle.validate(Object.assign({}, request, {
            publicationCode: created.code,
            expectedRevision: created.revision,
            reason: 'Axis Page Designer publish-readiness validation'
        }));
        this.access().authorize(request, 'cms.authoring.write');
        let pending = await lifecycle.requestApproval(Object.assign({}, request, {
            publicationCode: validated.code,
            expectedRevision: validated.revision,
            reason: 'Axis Page Designer request approval'
        }));
        return { result: { status: pending.state || 'PENDING_APPROVAL',
            publication: pending, readiness: readiness.result,
            route: { code: route.code, site: route.site, path: route.path,
                locale: route.locale, channel: route.channel, versionId: route.versionId } } };
    },

    /** Resolves the exact saved route version for a Page Designer draft. */
    resolveSavedRouteVersion: async function (request, routeIntent) {
        let routes = await this.safeGet('DefaultCmsPageRouteService', request, {
            code: routeIntent.code,
            active: true
        });
        if (!routes.length) {
            routes = await this.safeGet('DefaultCmsPageRouteService', request, {
                site: routeIntent.site,
                path: routeIntent.path,
                locale: routeIntent.locale,
                channel: routeIntent.channel,
                active: true
            });
        }
        if (!routes.length) throw this.error('ERR_CMS_00106', 'Save the CMS route before submitting the draft to Publishing');
        routes = routes.filter(route => route.code === routeIntent.code || route.path === routeIntent.path);
        if (!routes.length) throw this.error('ERR_CMS_00106', 'Saved CMS route does not match the draft route intent');
        return routes.sort((left, right) => Number(right.versionId || right.revision || 0) - Number(left.versionId || left.revision || 0))[0];
    },

    /** Normalizes the complete Catalog-first draft envelope. */
    normalizeDraft: function (input) {
        let draft = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
        let page = draft.page && typeof draft.page === 'object' && !Array.isArray(draft.page) ? draft.page : {};
        const pageCode = this.requiredCode(page.code || draft.pageCode, 'page.code');
        return {
            catalogCode: this.requiredCode(draft.catalogCode, 'catalogCode'),
            siteCode: this.requiredCode(draft.siteCode, 'siteCode'),
            templateCode: this.requiredCode(draft.templateCode, 'templateCode'),
            ...(draft.sourceVersion === undefined ? {} : { sourceVersion: this.sourceVersion(draft.sourceVersion) }),
            page: {
                code: pageCode,
                name: this.requiredText(page.name || page.code || draft.pageCode, 'page.name'),
                typeCode: this.requiredCode(page.typeCode || 'contentPageType', 'page.typeCode'),
                renderer: page.renderer
            },
            route: draft.route || null,
            navigation: draft.navigation || null,
            sections: this.normalizeSections(draft.sections, pageCode, { seen: new Set([pageCode]), count: 0 }, 0)
        };
    },

    /** Normalizes designer sections while allowing any number of slots. */
    normalizeSections: function (sections, pageCode, state = { seen: new Set([pageCode]), count: 0 }, depth = 0) {
        if (!Array.isArray(sections) || !sections.length) return [];
        if (depth > this.authoringPolicy().maximumCompositionDepth) throw this.error("ERR_CMS_00104", "The composition exceeds its supported nesting depth");
        const nextIndex = new Map();
        return sections.map(section => {
            let safe = section && typeof section === 'object' && !Array.isArray(section) ? section : {};
            const slot = this.requiredCode(safe.slot || 'default', 'section.slot');
            const index = safe.index === undefined ? nextIndex.get(slot) || 0 : Number(safe.index);
            if (!Number.isSafeInteger(index) || index < 0 || safe.index === null || safe.index === '' || typeof safe.index === 'boolean')
                throw this.error('ERR_CMS_00104', 'Section order must be a non-negative safe integer');
            const components = this.normalizeComponents(safe.components, pageCode, slot, state, depth);
            nextIndex.set(slot, Math.max(nextIndex.get(slot) || 0, index + components.length));
            return {
                code: safe.code,
                slot,
                index,
                components
            };
        });
    },

    /** Normalizes designer component intents. */
    normalizeComponents: function (components, pageCode, slot, state, depth) {
        if (!Array.isArray(components)) return [];
        return components.map(component => {
            let safe = component && typeof component === 'object' && !Array.isArray(component) ? component : {};
            // Axis sends this established default for a new page. Bound that
            // exact generated value while still validating other explicit codes.
            const axisDefault = pageCode + slot.charAt(0).toUpperCase() + slot.slice(1) + 'Component';
            const code = safe.code === axisDefault && !designerCodePattern.test(axisDefault)
                ? this.derivedCode('component', [pageCode, slot, 'Component'])
                : this.requiredCode(safe.code, 'component.code');
            if (state.seen.has(code) || ++state.count > this.authoringPolicy().maximumCompositionComponents)
                throw this.error("ERR_CMS_00104", "Use distinct content blocks within the supported composition size");
            state.seen.add(code);
            return {
                code,
                sections: this.normalizeSections(safe.sections, code, state, depth + 1),
                typeCode: this.requiredCode(safe.typeCode, 'component.typeCode'),
                renderer: safe.renderer,
                accessMode: safe.accessMode || 'AUTHENTICATED',
                properties: safe.properties && typeof safe.properties === 'object' && !Array.isArray(safe.properties) ? safe.properties : undefined,
                localizations: Array.isArray(safe.localizations) ? safe.localizations.map(this.normalizeLocalization.bind(this)) : [],
                media: Array.isArray(safe.media) ? safe.media : []
            };
        });
    },

    /** Validates the Catalog-first graph and returns client-safe readiness evidence. */
    validateDraftGraph: async function (request, draft) {
        const scope = await this.access().scope(request, 'cms.authoring.write');
        let catalog = await this.getSingle('DefaultCatalogService', request, { code: draft.catalogCode, catalogType: 'CONTENT', active: true }, 'ERR_CMS_00101');
        let site = await this.getSingle('DefaultCmsSiteService', request, { code: draft.siteCode, active: true }, 'ERR_CMS_00102');
        if (this.codeOf(site.catalog) !== draft.catalogCode) throw this.error('ERR_CMS_00102', 'CMS Site does not belong to the selected Content Catalog');
        let template = await this.getSingle('DefaultCmsPageTemplateService', request, { code: draft.templateCode, active: true }, 'ERR_CMS_00103');
        let slots = await this.getMany('DefaultCmsSlotDefinitionService', request, { template: draft.templateCode, active: true });
        await this.validatePageReferences(request, draft);
        await this.validateSections(request, draft, slots);
        if (draft.route) {
            let route = this.routeIntent(draft);
            await SERVICE.DefaultCmsContractValidationService.validateRoute({ model: route });
            await this.validateRouteUniqueness(request, route);
        }
        const planned = [['DefaultCmsPageService', this.pageModel(draft)]];
        const graph = this.compositionEntries(draft);
        for (const { component, placement, depth } of graph) {
            if (depth > 0) await this.validateComponentForSlot(request, component, {});
            planned.push(['DefaultCmsComponentService', this.componentModel(component)]);
            planned.push(['DefaultCmsComponentDetailService', placement]);
            component.localizations.forEach(locale => planned.push(['DefaultCmsComponentLocalizationService', this.localizationModel(component, locale)]));
            component.media.forEach((media, index) => planned.push(['DefaultCmsComponentMediaService', this.mediaModel(component, media, index)]));
        }
        if (draft.route) planned.push(['DefaultCmsPageRouteService', this.routeIntent(draft)]);
        if (draft.navigation) planned.push(['DefaultCmsNavigationNodeService', this.navigationIntent(draft)]);
        for (const [serviceName, model] of planned) {
            await this.access().assertIdentity(serviceName, request, model.code, scope);
            await this.assertModelScope(serviceName, request, model, scope, planned);
        }
        for (const [serviceName, model] of planned) {
            if (serviceName === 'DefaultCmsComponentMediaService') {
                await SERVICE.DefaultCmsContractValidationService.validateDraftComponentMediaReference(
                    Object.assign({}, request, { model }));
            }
        }
        const placementPlan = await this.planDraftPlacements(request, draft, scope);
        return {
            catalog: { code: catalog.code, name: catalog.name, catalogType: catalog.catalogType },
            site: { code: site.code, name: site.name, catalog: site.catalog },
            template: { code: template.code, name: template.name, renderer: template.renderer, slots: slots.map(slot => slot.name) },
            sectionCount: draft.sections.length,
            componentCount: graph.length,
            reorderedPlacementCount: placementPlan.moves.length
        };
    },

    /** Flattens a normalized tree without losing parent/placement identity or child order. */
    compositionEntries: function (draft) {
        const entries = [];
        const visit = (sections, source, depth) => sections.forEach((section, sectionIndex) => section.components.forEach((component, componentIndex) => {
            entries.push({ component, depth, placement: this.sectionModel({ page: { code: source } }, section, component, sectionIndex, componentIndex) });
            visit(component.sections || [], component.code, depth + 1);
        }));
        visit(draft.sections, draft.page.code, 0);
        return entries;
    },

    /** Plans collision-free versioned moves without retiring omitted placements or assuming an atomic graph save. */
    planDraftPlacements: async function (request, draft, scope) {
        const service = 'DefaultCmsComponentDetailService';
        const reader = SERVICE.DefaultCmsDesignerReadService;
        const planned = this.compositionEntries(draft).map(entry => entry.placement);
        const sources = [...new Set([draft.page.code, ...this.compositionEntries(draft).map(entry => entry.component.code)])];
        const current = [];
        for (const source of sources) current.push(...(await reader.currentHeads(service, request, { source }, scope)).filter(row => row.active === true));
        const position = model => JSON.stringify([model.source, model.slot, model.index]);
        const codes = new Set(), positions = new Set();
        for (const model of planned) {
            if (!Number.isSafeInteger(model.index) || model.index < 0 || codes.has(model.code) || positions.has(position(model)))
                throw this.error('ERR_CMS_00104', 'Each placement needs its own identity and an unambiguous slot position');
            codes.add(model.code); positions.add(position(model));
            const history = await this.access().assertIdentity(service, request, model.code, scope);
            if (history.length && reader.heads(history)[0].source !== model.source)
                throw this.error('ERR_CMS_00104', 'A saved placement cannot be moved from another parent by this composition');
        }
        if (current.some(row => !Number.isSafeInteger(row.index) || row.index < 0))
            throw this.error('ERR_CMS_00104', 'The saved placement order requires owner inspection');
        for (const model of planned) {
            if (current.some(row => row.code !== model.code && position(row) === position(model) && !codes.has(row.code)))
                throw this.error('ERR_CMS_00104', 'A saved placement outside this draft occupies the requested position; omission does not retire it');
        }
        const next = new Map();
        const group = row => JSON.stringify([row.source, row.slot]);
        for (const row of [...current, ...planned]) next.set(group(row), Math.max(next.get(group(row)) || 0, row.index + 1));
        const moves = [];
        for (const model of planned) {
            const existing = current.find(row => row.code === model.code);
            if (!existing || position(existing) === position(model)) continue;
            const spare = next.get(group(existing));
            if (!Number.isSafeInteger(spare)) throw this.error('ERR_CMS_00104', 'No safe temporary position is available for this reorder');
            next.set(group(existing), spare + 1);
            // Keep the original source, target and slot while freeing its old position.
            moves.push(Object.assign({}, existing, { index: spare }));
        }
        return { moves };
    },

    /** Validates page and type-code references used by a designer draft. */
    validatePageReferences: async function (request, draft) {
        await this.getSingle('DefaultCmsTypeCodeService', request, { code: draft.page.typeCode, kind: 'PAGE', active: true }, 'ERR_CMS_00100');
        const defaults = this.authoringPolicy().draftDefaults;
        await this.validateTypeRenderer(request, draft.page, defaults?.pageTypeCode === draft.page.typeCode ? [defaults.pageRenderer] : []);
        return true;
    },

    /** Rejects renderer choices outside the type's active mapping and admitted legacy Designer keys. */
    validateTypeRenderer: async function (request, item, compatibleRenderers) {
        if (item.renderer === undefined) return;
        const mappingService = SERVICE.DefaultCmsTypeCode2RendererService;
        const mappings = typeof mappingService?.get === 'function'
            ? await this.getMany('DefaultCmsTypeCode2RendererService', request, { code: item.typeCode, active: true })
            : [];
        const accepted = compatibleRenderers.concat(mappings.filter(mapping => mapping.deprecated !== true)
            .map(mapping => mapping.renderer)).filter(renderer => typeof renderer === 'string' && renderer.length);
        if ((mappings.length || accepted.length) && !accepted.includes(item.renderer))
            throw this.error('ERR_CMS_00100', 'Choose an active renderer mapped to the selected content type');
    },

    /** Validates arbitrary slot sections against template-owned slot definitions. */
    validateSections: async function (request, draft, slots) {
        let slotByName = slots.reduce((accumulator, slot) => {
            accumulator[slot.name] = slot;
            return accumulator;
        }, {});
        let counts = {};
        for (let section of draft.sections) {
            let slot = slotByName[section.slot];
            if (!slot) throw this.error('ERR_CMS_00104', 'Section slot is not declared by the selected page template');
            counts[section.slot] = (counts[section.slot] || 0) + section.components.length;
            for (let component of section.components) {
                await this.validateComponentForSlot(request, component, slot);
            }
        }
        slots.forEach(slot => {
            let count = counts[slot.name] || 0;
            if (slot.minItems !== undefined && count < Number(slot.minItems)) {
                throw this.error('ERR_CMS_00104', 'Template slot has fewer components than the configured minimum');
            }
            if (slot.maxItems !== undefined && count > Number(slot.maxItems)) {
                throw this.error('ERR_CMS_00104', 'Template slot has more components than the configured maximum');
            }
        });
        return true;
    },

    /** Validates one component type against a template slot allowlist. */
    validateComponentForSlot: async function (request, component, slot) {
        let typeCode = await this.getSingle('DefaultCmsTypeCodeService', request, { code: component.typeCode, kind: 'COMPONENT', active: true }, 'ERR_CMS_00100');
        const kinds = this.authoringPolicy().componentKinds;
        await this.validateTypeRenderer(request, component, kinds.filter(kind => kind.typeCode === component.typeCode).map(kind => kind.renderer));
        if (SERVICE.DefaultCmsContentLocalizationService) {
            SERVICE.DefaultCmsContentLocalizationService.validateTypeContract(typeCode);
            component.localizations.forEach(localization => SERVICE.DefaultCmsContentLocalizationService.validateVariant(
                Object.assign({ componentCode: component.code }, localization), typeCode, component));
        }
        if (Array.isArray(slot.allowedComponentTypes) && slot.allowedComponentTypes.length &&
            !slot.allowedComponentTypes.includes(component.typeCode)) {
            throw this.error('ERR_CMS_00104', 'Component type is not allowed in the selected template slot');
        }
        if (Array.isArray(slot.allowedComponentTypeGroups) && slot.allowedComponentTypeGroups.length) {
            let groups = await this.getMany('DefaultCmsComponentTypeGroupService', request,
                { code: { $in: slot.allowedComponentTypeGroups }, active: true });
            let allowed = groups.some(group => Array.isArray(group.componentTypeCodes) && group.componentTypeCodes.includes(component.typeCode));
            if (!allowed) throw this.error('ERR_CMS_00104', 'Component type group does not allow the selected component type');
        }
        return true;
    },

    /** Validates a component-detail placement intent. */
    validateSlotPlacement: async function (request, model) {
        await SERVICE.DefaultCmsContractValidationService.validateAssociation(Object.assign({}, request, { model: model }));
        return true;
    },

    /** Validates a route is unique within site, path, locale, and channel. */
    validateRouteUniqueness: async function (request, model) {
        let response = await this.safeGet('DefaultCmsPageRouteService', request, {
            site: model.site,
            path: model.path,
            locale: model.locale,
            channel: model.channel,
            active: true
        });
        let conflicts = response.filter(item => item.code !== model.code);
        if (conflicts.length) throw this.error('ERR_CMS_00105', 'A CMS route already exists for this site, path, locale, and channel');
        return true;
    },

    /** Builds the CMS page model persisted by the draft operation. */
    pageModel: function (draft) {
        return {
            code: draft.page.code,
            name: draft.page.name,
            active: true,
            cmsSite: [draft.siteCode],
            typeCode: draft.page.typeCode,
            template: draft.templateCode,
            renderer: draft.page.renderer,
            // Embedded relationships are not edited by this flat composition intent.
        };
    },

    /** Validates inert owner-configured content controls before any component or graph write. */
    validateConfiguredContent: function (component) {
        const kinds = (this.authoringPolicy().componentKinds || []).filter(kind =>
            kind.typeCode === component.typeCode && kind.fields !== undefined);
        if (!kinds.length) return;
        const fail = message => { throw this.error('ERR_CMS_00100', message); };
        if (kinds.length !== 1) fail('CMS content field configuration is ambiguous');
        const validateDeclarations = (fields, nested = false) => {
            if (!Array.isArray(fields) || fields.length > 16) fail('CMS content fields are incompatible');
            const names = new Set();
            for (const field of fields) {
                if (!field || typeof field !== 'object' ||
                    typeof field.property !== 'string' || !/^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(field.property) ||
                    ['constructor', 'prototype', '__proto__'].includes(field.property) || names.has(field.property) ||
                    typeof field.label !== 'string' || !field.label.trim() || field.label.length > 160 ||
                    !['text', 'multiline', 'items'].includes(field.control) || nested && field.control === 'items' ||
                    field.required !== undefined && typeof field.required !== 'boolean' ||
                    field.maxLength !== undefined && (!Number.isSafeInteger(field.maxLength) || field.maxLength < 1 || field.maxLength > 100000) ||
                    field.maximumItems !== undefined && (!Number.isSafeInteger(field.maximumItems) || field.maximumItems < 1 || field.maximumItems > 32)) {
                    fail('CMS content fields are incompatible');
                }
                names.add(field.property);
                if (field.control === 'items') {
                    validateDeclarations(field.itemFields, true);
                    if (!field.itemFields.length) fail('CMS content item fields are unavailable');
                }
            }
        };
        validateDeclarations(kinds[0].fields);
        const properties = component.properties || {};
        if (!properties || typeof properties !== 'object' || Array.isArray(properties)) fail('CMS content properties must be an object');
        const variants = component.localizations || [];
        const ownValue = (source, name) => Object.getOwnPropertyDescriptor(source, name)?.value;
        const check = (fields, values, required) => {
            if (!values || typeof values !== 'object' || Array.isArray(values)) fail('CMS content properties must be an object');
            for (const field of fields) {
                const value = ownValue(values, field.property);
                if (value === undefined || value === null || typeof value === 'string' && !value.trim()) {
                    if (required && field.required) fail('Complete the required content field: ' + field.label);
                    continue;
                }
                if (field.control === 'items') {
                    if (!Array.isArray(value) || value.length > (field.maximumItems || 32) || required && field.required && !value.length)
                        fail('Complete the content list: ' + field.label);
                    value.forEach(item => check(field.itemFields, item, true));
                } else if (typeof value !== 'string' || field.maxLength !== undefined && value.length > field.maxLength) {
                    fail('Content text is invalid or too long: ' + field.label);
                }
            }
        };
        check(kinds[0].fields, properties, true);
        // Optional translations cannot change declared value types or collection bounds.
        variants.forEach(variant => check(kinds[0].fields, variant.properties || {}, false));
    },

    /** Builds one CMS component model after configured content validation. */
    componentModel: function (component) {
        this.validateConfiguredContent(component);
        return {
            code: component.code,
            active: true,
            typeCode: component.typeCode,
            renderer: component.renderer,
            properties: component.properties,
            accessMode: component.accessMode,
            // Child placements retain their canonical source/target records; legacy reference arrays are preserved.
        };
    },

    /** Builds one locale variant persisted separately from shared component properties. */
    localizationModel: function (component, localization) {
        return {
            code: localization.code || this.derivedCode('localization', [component.code, localization.locale]),
            componentCode: component.code,
            locale: localization.locale,
            properties: localization.properties,
            seo: localization.seo,
            active: true,
            status: localization.status || 'DRAFT'
        };
    },

    /** Builds one CMS component-detail placement model. */
    sectionModel: function (draft, section, component, sectionIndex, componentIndex) {
        return {
            code: section.code || this.sectionCode(draft.page.code, section, component),
            source: draft.page.code,
            target: component.code,
            slot: section.slot,
            active: true,
            index: (Number.isInteger(Number(section.index)) ? Number(section.index) : sectionIndex) + componentIndex
        };
    },

    /** Builds one CMS component-media model from a normalized component/media intent. */
    mediaModel: function (component, media, index) {
        let safe = media && typeof media === 'object' && !Array.isArray(media) ? media : {};
        const code = safe.code || safe.componentMediaCode ||
            this.derivedCode('media', [component.code, safe.role || 'primary', safe.mediaCode || safe.mediaSetCode || index]);
        return {
            code,
            componentMediaCode: safe.componentMediaCode || code,
            componentCode: component.code,
            mediaCode: safe.mediaCode,
            mediaSetCode: safe.mediaSetCode,
            mediaType: safe.mediaType || 'IMAGE',
            role: safe.role || 'primary',
            slot: safe.slot || 'default',
            localeCode: safe.localeCode,
            active: true,
            position: Number.isInteger(Number(safe.position)) ? Number(safe.position) : index,
            altText: safe.altText,
            caption: safe.caption
        };
    },

    /** Builds or normalizes route assignment intent. */
    routeIntent: function (draft) {
        let route = draft.route && typeof draft.route === 'object' && !Array.isArray(draft.route) ? draft.route : draft;
        let pageCode = draft.page && draft.page.code || route.page || route.pageCode;
        return {
            code: route.code || this.derivedCode('route', [draft.siteCode || route.site, pageCode, 'route']),
            site: route.site || draft.siteCode,
            path: route.path,
            locale: route.locale || 'default',
            channel: route.channel || 'web',
            page: pageCode,
            routeType: route.routeType || 'PAGE',
            redirectPath: route.redirectPath,
            deliveryState: route.deliveryState || 'DRAFT',
            active: true,
            accessMode: route.accessMode || 'AUTHENTICATED'
        };
    },

    /** Projects an active, same-page menu entry into the route version; other navigation stays private. */
    navigationEntry: function (route, navigation) {
        if (!navigation || navigation.status !== 'ACTIVE' || navigation.parent || navigation.restrictions.length ||
            navigation.site !== route.site || navigation.locale !== route.locale || navigation.channel !== route.channel ||
            route.routeType !== 'PAGE' || navigation.nodeType !== 'PAGE' || navigation.targetPage !== route.page ||
            typeof navigation.title !== 'string' || !navigation.title.trim() || navigation.title.length > 512 ||
            !Number.isSafeInteger(navigation.position) || navigation.position < 0) return undefined;
        return { code: navigation.code, title: navigation.title.trim(), position: navigation.position };
    },

    /** Builds or normalizes navigation assignment intent. */
    navigationIntent: function (draft) {
        let navigation = draft.navigation && typeof draft.navigation === 'object' && !Array.isArray(draft.navigation) ? draft.navigation : draft;
        let pageCode = draft.page && draft.page.code || navigation.targetPage || navigation.pageCode;
        let pageName = draft.page && draft.page.name || navigation.name || navigation.title || pageCode;
        return {
            code: navigation.code || this.derivedCode('navigation', [draft.siteCode || navigation.site, pageCode, 'nav']),
            site: navigation.site || draft.siteCode,
            parent: navigation.parent,
            name: navigation.name || navigation.title || pageName,
            title: navigation.title || navigation.name || pageName,
            nodeType: navigation.nodeType || 'PAGE',
            targetPage: navigation.targetPage || navigation.pageCode || pageCode,
            targetRoute: navigation.targetRoute,
            externalUrl: navigation.externalUrl,
            position: Number.isInteger(Number(navigation.position)) ? Number(navigation.position) : 100,
            status: navigation.status || 'ACTIVE',
            active: true,
            locale: navigation.locale || 'default',
            channel: navigation.channel || 'web',
            restrictions: Array.isArray(navigation.restrictions) ? navigation.restrictions : []
        };
    },

    /** Normalizes one component-detail intent from a route body. */
    componentDetailIntent: function (input) {
        return {
            code: input.code || this.derivedCode('placement', [input.source, input.slot || 'default', input.target]),
            source: this.requiredCode(input.source || input.pageCode || input.componentCode, 'source'),
            target: this.requiredCode(input.target || input.targetComponentCode, 'target'),
            slot: this.requiredCode(input.slot || 'default', 'slot'),
            index: Number.isInteger(Number(input.index)) ? Number(input.index) : 0
        };
    },

    /** Normalizes one component intent from a route body. */
    componentIntent: function (input) {
        return {
            code: this.requiredCode(input.code || input.componentCode, 'component.code'),
            versionId: Number.isInteger(Number(input.versionId)) ? Number(input.versionId) : undefined,
            active: input.active !== false,
            typeCode: this.requiredCode(input.typeCode, 'component.typeCode'),
            renderer: input.renderer,
            properties: input.properties,
            localizations: Array.isArray(input.localizations) ? input.localizations.map(this.normalizeLocalization.bind(this)) : [],
            accessMode: input.accessMode || 'AUTHENTICATED',
            subComponents: Array.isArray(input.subComponents) ? input.subComponents : undefined
        };
    },

    /** Normalizes one component-media intent from a route body. */
    mediaIntent: function (input) {
        return this.mediaModel({ code: this.requiredCode(input.componentCode, 'componentCode') }, input, Number(input.position || 0));
    },

    /** Saves one record through an existing generated service. */
    saveRecord: async function (serviceName, request, model) {
        const scope = await this.access().scope(request, 'cms.authoring.write');
        if (model.active === false) this.access().authorize(request, 'cms.authoring.delete');
        const rows = await this.access().assertIdentity(serviceName, request, model.code, scope);
        const modelScope = await this.assertModelScope(serviceName, request, model, scope);
        if (serviceName === 'DefaultCmsComponentDetailService' &&
            rows.some(row => row.authoringScope.siteCode !== modelScope.siteCode)) this.access().deny();
        let service = this.service(serviceName);
        const current = rows.length ? SERVICE.DefaultCmsDesignerReadService.heads(rows)[0] : {};
        // Preserve attributes outside this command's projection. Undefined optional
        // values do not erase saved SEO, extensions or nested relationships.
        const merged = Object.assign({}, current, Object.fromEntries(Object.entries(model).filter(([, value]) => value !== undefined)));
        // New page records require their relationship array. Existing arrays
        // remain owner-read data and are never cleared by a flat edit.
        if (serviceName === 'DefaultCmsPageService' && merged.cmsComponents === undefined) merged.cmsComponents = [];
        if (serviceName === 'DefaultCmsComponentService' && merged.subComponents === undefined) merged.subComponents = [];
        this.access().authorize(request, 'cms.authoring.write');
        try {
            let response = await service.save({ tenant: request.tenant, authData: this.access().persistenceAuth(),
                model: this.access().nextModel(Object.assign({}, merged, {
                    authoringScope: modelScope }), rows) });
            const saved = this.access().savedRecord(response);
            this.access().authorize(request, 'cms.authoring.write');
            if (!saved || saved.code !== model.code || !this.access().matches(saved, scope, serviceName)) this.access().deny();
            return saved;
        } catch (error) {
            let message = serviceName + ' failed to save ' + (model && model.code ? model.code : 'draft record') +
                ': ' + (error && error.message ? error.message : error);
            throw this.error('ERR_CMS_00100', message);
        }
    },

    /** Retires an owned record through the existing generated versioned save path. */
    removeRecord: async function (serviceName, request, query) {
        const scope = await this.access().scope(request, 'cms.authoring.delete');
        const rows = await this.access().assertIdentity(serviceName, request, query.code, scope, true);
        const current = rows.sort((left, right) => Number(right.versionId || 0) - Number(left.versionId || 0))[0];
        let service = this.service(serviceName);
        const model = this.access().nextModel(Object.assign({}, current, { active: false }), rows);
        this.access().authorize(request, 'cms.authoring.delete');
        const response = await service.save({ tenant: request.tenant, authData: this.access().persistenceAuth(), model });
        const saved = this.access().savedRecord(response);
        this.access().authorize(request, 'cms.authoring.delete');
        if (!saved || saved.code !== query.code || saved.active !== false || !this.access().matches(saved, scope, serviceName)) this.access().deny();
        return saved;
    },

    /** Fetches exactly one matching record or throws the requested CMS error. */
    getSingle: async function (serviceName, request, query, code, optionalWhenMissing) {
        let items = await this.currentReferences(serviceName, request, query);
        if (items.length === 1) return items[0];
        if (optionalWhenMissing && items.length === 0) return Object.assign({ code: query.code, name: query.code }, query);
        throw this.error(code, 'Required CMS designer reference is unavailable');
    },

    /** Fetches many matching records through a generated service. */
    getMany: async function (serviceName, request, query) {
        return this.currentReferences(serviceName, request, query);
    },

    /** Resolves retained reference history before applying active-state filters; retired heads never resurrect. */
    currentReferences: async function (serviceName, request, query) {
        const sourceQuery = { ...query };
        delete sourceQuery.active;
        const heads = SERVICE.DefaultCmsDesignerReadService.heads(await this.safeGet(serviceName, request, sourceQuery));
        return query.active === undefined ? heads : heads.filter(row => row.active === query.active);
    },

    /** Performs a safe generated-service get and normalizes its result array. */
    safeGet: async function (serviceName, request, query) {
        const result = await this.access().records(serviceName, request, query);
        const enterpriseCode = this.access().authorize(request, 'cms.backoffice.view').enterpriseCode;
        const { catalogCode } = this.access().inputScope(request);
        if (result.some(row => row.authoringScope && (row.authoringScope.enterpriseCode !== enterpriseCode ||
            catalogCode && row.authoringScope.catalogCode !== catalogCode))) this.access().deny();
        return result;
    },

    /** Builds the client-safe backend metadata needed by Axis Designer forms. */
    authoringMetadata: async function (request) {
        const enterpriseCode = this.access().authorize(request, 'cms.backoffice.view').enterpriseCode;
        const selected = this.access().inputScope(request);
        const scope = selected.siteCode || selected.catalogCode
            ? await this.access().scope(request, 'cms.backoffice.view') : undefined;
        let sites = await this.currentReferences('DefaultCmsSiteService', request, { active: true, enterpriseCode,
            ...(scope ? { code: scope.siteCode, catalog: scope.catalogCode } : {}) });
        if (sites.some(site => site.enterpriseCode !== enterpriseCode)) this.access().deny();
        let catalogs = this.catalogsFromSites(sites);
        // Query only editable Catalog references before the owner's bounded read.
        // Historical unowned content cannot become authoring authority or exhaust
        // this enterprise's lookup with another application's documentation.
        const referenceRows = async serviceName => this.currentReferences(serviceName, request, {
            active: true,
            'authoringScope.enterpriseCode': enterpriseCode,
            'authoringScope.catalogCode': { $in: catalogs.map(catalog => catalog.code) }
        });
        let templates = await referenceRows('DefaultCmsPageTemplateService');
        let slots = await referenceRows('DefaultCmsSlotDefinitionService');
        let typeCodes = await referenceRows('DefaultCmsTypeCodeService');
        let groups = await referenceRows('DefaultCmsComponentTypeGroupService');
        const mappings = SERVICE.DefaultCmsTypeCode2RendererService ? await referenceRows('DefaultCmsTypeCode2RendererService') : [];
        const currentMappings = SERVICE.DefaultCmsDesignerReadService.heads(mappings).filter(row => row.active === true && row.deprecated !== true);
        let mediaFolders = await this.safeOptionalGet('DefaultMediaFolderService', request, { status: 'ACTIVE' });
        let mediaFormats = await this.safeOptionalGet('DefaultMediaFormatService', request, { status: 'ACTIVE' });
        let navigationNodes = await this.safeOptionalGet('DefaultCmsNavigationNodeService', request,
            { status: 'ACTIVE', 'authoringScope.enterpriseCode': enterpriseCode,
                ...(scope ? { site: scope.siteCode, 'authoringScope.catalogCode': scope.catalogCode } : {}) });
        return {
            contentCatalogs: catalogs.map(this.catalogReference.bind(this)),
            sites: sites.map(this.siteReference.bind(this)),
            pageTemplates: templates.map(this.templateReference.bind(this)),
            slotDefinitions: slots.map(this.slotReference.bind(this)),
            pageTypes: typeCodes.filter(item => item.kind === 'PAGE').map(this.typeReference.bind(this)),
            componentTypes: typeCodes.filter(item => item.kind === 'COMPONENT').map(item => ({ ...this.typeReference(item),
                renderers: currentMappings.filter(mapping => mapping.code === item.code).map(mapping => mapping.renderer) })),
            componentTypeGroups: groups.map(this.componentTypeGroupReference.bind(this)),
            mediaFolders: mediaFolders.map(this.mediaFolderReference.bind(this)),
            mediaFormats: mediaFormats.map(this.mediaFormatReference.bind(this)),
            mediaTypes: ['IMAGE', 'VIDEO', 'DOCUMENT', 'FILE', 'MIXED'],
            navigationNodes: navigationNodes.map(this.navigationReference.bind(this)),
            localization: this.clientLocalizationPolicy(),
            publicationReadiness: {
                requireNavigationForPublish: this.authoringPolicy().requireNavigationForPublish,
                requiredDraftParts: ['catalogCode', 'siteCode', 'templateCode', 'page', 'sections', 'route']
            }
        };
    },

    /** Performs a generated-service get when the service is present, otherwise returns no optional references. */
    safeOptionalGet: async function (serviceName, request, query) {
        let service = typeof SERVICE !== 'undefined' && SERVICE ? SERVICE[serviceName] : null;
        if (!service || typeof service.get !== 'function') return [];
        try {
            return await this.safeGet(serviceName, request, query);
        } catch (error) {
            if (this.isMissingGeneratedModelRegistry(error)) return [];
            throw error;
        }
    },

    /** Returns true for optional metadata services whose generated model registry is absent in this runtime. */
    isMissingGeneratedModelRegistry: function (error) {
        let message = String(error && error.message || '');
        let stack = String(error && error.stack || '');
        return (/reading 'models'/.test(message) && /getModels/.test(stack)) ||
            (/reading 'schemaName'/.test(message) && /ModelsRemoveInitializerService/.test(stack));
    },

    /** Derives minimal content-catalog references from CMS-owned sites when catalog metadata lives in another runtime. */
    catalogsFromSites: function (sites) {
        let byCode = {};
        [].concat(sites || []).forEach(site => {
            let code = this.codeOf(site.catalog || site.catalogCode || site.contentCatalog);
            if (code && !byCode[code]) byCode[code] = { code: code, name: code, catalogType: 'CONTENT' };
        });
        return Object.values(byCode);
    },

    /** Returns a client-safe content catalog reference. */
    catalogReference: function (item) {
        return {
            code: item.code,
            name: item.name || item.code,
            catalogType: item.catalogType || 'CONTENT'
        };
    },

    /** Returns a client-safe CMS site reference. */
    siteReference: function (item) {
        return {
            code: item.code,
            name: item.name || item.displayName || item.code,
            catalogCode: this.codeOf(item.catalog || item.catalogCode || item.contentCatalog)
        };
    },

    /** Returns a client-safe page template reference. */
    templateReference: function (item) {
        return {
            code: item.code,
            catalogCode: item.authoringScope?.catalogCode,
            name: item.name || item.displayName || item.code,
            renderer: item.renderer,
            typeCode: this.codeOf(item.typeCode || item.pageTypeCode)
        };
    },

    /** Returns a client-safe slot definition reference. */
    slotReference: function (item) {
        return {
            code: item.code,
            catalogCode: item.authoringScope?.catalogCode,
            name: item.name || item.slot || item.code,
            templateCode: this.codeOf(item.template || item.templateCode),
            allowedComponentTypes: Array.isArray(item.allowedComponentTypes) ? item.allowedComponentTypes.map(this.codeOf.bind(this)).filter(Boolean) : [],
            allowedComponentTypeGroups: Array.isArray(item.allowedComponentTypeGroups) ? item.allowedComponentTypeGroups.map(this.codeOf.bind(this)).filter(Boolean) : [],
            minItems: Number.isFinite(Number(item.minItems)) ? Number(item.minItems) : undefined,
            maxItems: Number.isFinite(Number(item.maxItems)) ? Number(item.maxItems) : undefined
        };
    },

    /** Returns a client-safe CMS type-code reference. */
    typeReference: function (item) {
        return {
            code: item.code,
            catalogCode: item.authoringScope?.catalogCode,
            name: item.name || item.displayName || item.code,
            kind: item.kind,
            propertySchema: item.propertySchema
        };
    },

    /** Normalizes a component locale variant without merging it into shared properties. */
    normalizeLocalization: function (input) {
        let safe = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
        return {
            ...(safe.code === undefined ? {} : { code: this.requiredCode(safe.code, 'localization.code') }),
            locale: this.requiredText(safe.locale, 'localization.locale'),
            properties: safe.properties && typeof safe.properties === 'object' && !Array.isArray(safe.properties) ? safe.properties : {},
            seo: safe.seo && typeof safe.seo === 'object' && !Array.isArray(safe.seo) ? safe.seo : undefined,
            status: safe.status || 'DRAFT'
        };
    },

    /** Admits an opaque owner-read stamp only as stale-source preflight evidence, never as scope authority. */
    sourceVersion: function (value) {
        if (typeof value !== 'string' || !/^[a-f0-9]{64}$/.test(value))
            throw this.error('ERR_CMS_00100', 'Reopen the saved composition before saving.');
        return value;
    },

    /** Returns a client-safe component type group reference. */
    componentTypeGroupReference: function (item) {
        return {
            code: item.code,
            name: item.name || item.displayName || item.code,
            componentTypeCodes: Array.isArray(item.componentTypeCodes) ? item.componentTypeCodes.map(this.codeOf.bind(this)).filter(Boolean) : []
        };
    },

    /** Returns a client-safe media folder reference for authoring guidance. */
    mediaFolderReference: function (item) {
        return {
            code: item.code,
            name: item.name || item.code,
            access: item.access,
            businessPurpose: item.businessPurpose,
            reusable: item.reusable === true
        };
    },

    /** Returns a client-safe media format reference for authoring guidance. */
    mediaFormatReference: function (item) {
        return {
            code: item.code,
            name: item.name || item.code,
            width: item.width,
            height: item.height
        };
    },

    /** Returns a client-safe navigation node reference for parent-node selection. */
    navigationReference: function (item) {
        return {
            code: item.code,
            name: item.title || item.name || item.code,
            siteCode: this.codeOf(item.site || item.siteCode),
            parentCode: this.codeOf(item.parent || item.parentCode),
            nodeType: item.nodeType || 'PAGE'
        };
    },

    /** Resolves a required generated service or throws a designer configuration error. */
    service: function (serviceName) {
        let service = typeof SERVICE !== 'undefined' && SERVICE ? SERVICE[serviceName] : null;
        if (!service) throw this.error('ERR_CMS_00100', serviceName + ' is unavailable');
        return service;
    },

    /** Resolves the existing CMS owner guard; absence is a configuration failure, not open access. */
    access: function () { return this.service('DefaultCmsDesignerAccessService'); },

    /** Rejects foreign relationships before an owner-authored record reaches generated persistence. */
    assertModelScope: async function (serviceName, request, model, scope, planned = []) {
        let modelScope = this.access().ownedScope(scope, serviceName);
        if (model.site && model.site !== scope.siteCode || model.cmsSite &&
            (!Array.isArray(model.cmsSite) || model.cmsSite.some(site => site !== scope.siteCode))) this.access().deny();
        const references = [];
        if (model.page) references.push(['DefaultCmsPageService', model.page]);
        if (model.targetPage) references.push(['DefaultCmsPageService', model.targetPage]);
        if (model.targetRoute) references.push(['DefaultCmsPageRouteService', model.targetRoute]);
        if (model.componentCode) references.push(['DefaultCmsComponentService', model.componentCode]);
        if (serviceName === 'DefaultCmsNavigationNodeService' && model.parent) references.push(['DefaultCmsNavigationNodeService', model.parent]);
        if (serviceName === 'DefaultCmsComponentDetailService') {
            references.push(['DefaultCmsComponentService', model.target]);
            const pages = await this.access().records('DefaultCmsPageService', request, { code: model.source });
            const pageSource = pages.length || planned.some(([owner, item]) => owner === 'DefaultCmsPageService' && item.code === model.source);
            references.push([pageSource ? 'DefaultCmsPageService' : 'DefaultCmsComponentService', model.source]);
            if (!pageSource) modelScope = this.access().ownedScope(scope, 'DefaultCmsComponentService');
        }
        for (const detail of model.subComponents || []) {
            const code = this.codeOf(detail);
            const placements = planned.filter(([owner, item]) => owner === 'DefaultCmsComponentDetailService' && item.code === code).map(([, item]) => item);
            if (!placements.length) placements.push(...await this.access().assertIdentity('DefaultCmsComponentDetailService', request, code, scope, true));
            if (placements.some(placement => placement.source !== model.code)) this.access().deny();
        }
        for (const [owner, code] of references) {
            if (!planned.some(([plannedOwner, item]) => plannedOwner === owner && item.code === code))
                await this.access().assertIdentity(owner, request, code, scope, true);
        }
        return modelScope;
    },

    /** Returns a stable code whether a generated reference is stored as text or populated object. */
    codeOf: function (value) {
        if (value && typeof value === 'object' && !Array.isArray(value)) return value.code;
        return value;
    },

    /** Builds the delete query accepted by focused delete APIs. */
    deleteQuery: function (request) {
        let input = request.cmsDesigner || request.body || {};
        let code = this.requiredCode(input.code, 'code');
        return { code: code };
    },

    /** Invalidates delivery after mutating authoring records. */
    invalidateDelivery: function (request) {
        if (SERVICE.DefaultCmsDeliveryCacheInvalidationService && typeof SERVICE.DefaultCmsDeliveryCacheInvalidationService.invalidate === 'function') {
            return SERVICE.DefaultCmsDeliveryCacheInvalidationService.invalidate(request);
        }
        return Promise.resolve(true);
    },

    /** Returns effective designer authoring policy. */
    authoringPolicy: function () {
        let configured = typeof CONFIG !== 'undefined' && CONFIG.get ? (CONFIG.get('cms') || {}).designerAuthoring : {};
        return Object.assign({
            maximumReferenceLookupItems: 100,
            maximumCompositionDepth: 6,
            maximumCompositionComponents: 100,
            nestedSlot: "default",
            requireNavigationForPublish: false,
            draftDefaults: {},
            componentKinds: []
        }, configured || {});
    },

    /** Returns client-safe authoring defaults without exposing unrelated runtime policy. */
    clientAuthoringDefaults: function (metadata = {}) {
        const policy = this.authoringPolicy(), draft = policy.draftDefaults || {};
        const site = (metadata.sites || []).find(item => item.code === draft.siteCode && item.catalogCode === draft.catalogCode);
        const template = (metadata.pageTemplates || []).find(item => item.code === draft.templateCode && item.catalogCode === draft.catalogCode);
        const pageType = (metadata.pageTypes || []).find(item => item.code === draft.pageTypeCode && item.catalogCode === draft.catalogCode);
        const slots = (metadata.slotDefinitions || []).filter(item => item.templateCode === draft.templateCode && item.catalogCode === draft.catalogCode);
        const valid = Boolean(site && template && pageType && Array.isArray(draft.slots) &&
            draft.slots.every(name => slots.some(slot => slot.name === name)));
        const componentKinds = (Array.isArray(policy.componentKinds) ? policy.componentKinds : [])
            .filter(kind => (metadata.componentTypes || []).some(type => type.code === kind.typeCode &&
                (!site || type.catalogCode === site.catalogCode)))
            .map(kind => ({ ...kind, compatibleRenderers: [...new Set([kind.renderer, ...(metadata.componentTypes || [])
                .filter(type => type.code === kind.typeCode).flatMap(type => type.renderers || [])])] }));
        return {
            maximumReferenceLookupItems: policy.maximumReferenceLookupItems,
            nesting: { maximumDepth: policy.maximumCompositionDepth, maximumComponents: policy.maximumCompositionComponents, defaultSlot: policy.nestedSlot },
            requireNavigationForPublish: policy.requireNavigationForPublish,
            draftDefaults: valid ? structuredClone(draft) : {},
            componentKinds: structuredClone(componentKinds)
        };
    },

    /** Returns the bounded locale policy needed by Axis authoring controls. */
    clientLocalizationPolicy: function () {
        let configured = (typeof CONFIG !== 'undefined' && CONFIG.get ? (CONFIG.get('cms') || {}).localization : {}) || {};
        return {
            supportedLocales: Array.isArray(configured.supportedLocales) ? configured.supportedLocales : [],
            defaultLocale: configured.defaultLocale || 'en',
            routeLocale: configured.legacyRouteLocale || configured.defaultLocale || 'en',
            fallbackLocales: Array.isArray(configured.fallbackLocales) ? configured.fallbackLocales : []
        };
    },

    /** Builds a stable component-detail code for page/component placement. */
    sectionCode: function (pageCode, section, component) {
        return this.derivedCode('placement', [pageCode, section.slot, component.code]);
    },

    /** Keeps existing derived IDs and bounds longer ones without losing tuple identity. */
    derivedCode: function (kind, parts) {
        const legacy = parts.filter(value => value !== undefined && value !== null && value !== '').join('-');
        if (designerCodePattern.test(legacy)) return legacy;
        const digest = createHash('sha256').update(JSON.stringify([kind, parts])).digest('hex');
        return kind + '-' + digest;
    },

    /** Validates and returns a safe Nodics code. */
    requiredCode: function (value, label) {
        if (typeof value !== 'string' || !designerCodePattern.test(value)) {
            throw this.error('ERR_CMS_00100', label + ' is invalid');
        }
        return value;
    },

    /** Validates and returns bounded business text. */
    requiredText: function (value, label) {
        if (typeof value !== 'string' || !value.trim() || value.length > 256) {
            throw this.error('ERR_CMS_00100', label + ' is invalid');
        }
        return value.trim();
    },

    /** Creates a stable CMS designer error. */
    error: function (code, message) {
        let error = typeof CLASSES !== 'undefined' && CLASSES.NodicsError ? new CLASSES.NodicsError(code, message) : new Error(message);
        error.code = error.code || code;
        return error;
    }
};
