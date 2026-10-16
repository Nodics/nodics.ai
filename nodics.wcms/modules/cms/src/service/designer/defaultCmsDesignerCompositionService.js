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
                operations: ['validateDraftComposition', 'saveDraftComposition', 'addSection', 'updateSection', 'deleteSection',
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
                defaults: this.clientAuthoringDefaults(),
                retirement: this.retirementPresentation(),
                metadata
            }
        };
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
        let saved = {};
        saved.page = await this.saveRecord('DefaultCmsPageService', request, this.pageModel(draft));
        saved.components = [];
        saved.localizations = [];
        saved.sections = [];
        saved.media = [];
        for (let sectionIndex = 0; sectionIndex < draft.sections.length; sectionIndex++) {
            let section = draft.sections[sectionIndex];
            for (let componentIndex = 0; componentIndex < section.components.length; componentIndex++) {
                let component = section.components[componentIndex];
                saved.components.push(await this.saveRecord('DefaultCmsComponentService', request, this.componentModel(component)));
                for (let localization of component.localizations) {
                    saved.localizations.push(await this.saveRecord('DefaultCmsComponentLocalizationService', request,
                        this.localizationModel(component, localization)));
                }
                saved.sections.push(await this.saveRecord('DefaultCmsComponentDetailService', request,
                    this.sectionModel(draft, section, component, sectionIndex, componentIndex)));
                for (let mediaIndex = 0; mediaIndex < component.media.length; mediaIndex++) {
                    await SERVICE.DefaultCmsContractValidationService.validateComponentMedia(Object.assign({}, request, {
                        model: this.mediaModel(component, component.media[mediaIndex], mediaIndex)
                    }));
                    saved.media.push(await this.saveRecord('DefaultCmsComponentMediaService', request,
                        this.mediaModel(component, component.media[mediaIndex], mediaIndex)));
                }
            }
        }
        if (draft.route) saved.route = await this.assignRoute(Object.assign({}, request, { cmsDesigner:
            Object.assign({ siteCode: draft.siteCode, catalogCode: draft.catalogCode }, this.routeIntent(draft)) }));
        if (draft.navigation) saved.navigation = await this.assignNavigation(Object.assign({}, request, { cmsDesigner:
            Object.assign({ siteCode: draft.siteCode, catalogCode: draft.catalogCode }, this.navigationIntent(draft)) }));
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
    assignRoute: async function (request) {
        this.access().authorize(request, 'cms.authoring.write');
        let model = this.routeIntent(request.cmsDesigner || request.body || {});
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
        if (!draft.navigation && this.authoringPolicy().requireNavigationForPublish) {
            throw this.error('ERR_CMS_00106', 'A navigation node is required before this CMS draft can be publication-ready');
        }
        return { result: Object.assign({ valid: true, status: 'READY_TO_PUBLISH' }, evidence) };
    },

    /** Submits one saved Page Designer route version to CMS/nPublish governance. */
    submitForPublication: async function (request) {
        this.access().authorize(request, 'cms.authoring.write');
        let draft = this.normalizeDraft(request.cmsDesigner || request.body || {});
        let readiness = await this.validatePublishReadiness(Object.assign({}, request, { cmsDesigner: draft }));
        let routeIntent = this.routeIntent(draft);
        let route = await this.resolveSavedRouteVersion(request, routeIntent);
        let sourceVersion = route.versionId === undefined ? route.revision : route.versionId;
        if (sourceVersion === undefined || sourceVersion === null) {
            throw this.error('ERR_CMS_00106', 'Saved CMS route version is required before submitting to Publishing');
        }
        let publicationCode = ['cms', route.site, route.code, sourceVersion].filter(Boolean).join('-');
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
        return {
            catalogCode: this.requiredCode(draft.catalogCode, 'catalogCode'),
            siteCode: this.requiredCode(draft.siteCode, 'siteCode'),
            templateCode: this.requiredCode(draft.templateCode, 'templateCode'),
            page: {
                code: this.requiredCode(page.code || draft.pageCode, 'page.code'),
                name: this.requiredText(page.name || page.code || draft.pageCode, 'page.name'),
                typeCode: this.requiredCode(page.typeCode || 'contentPageType', 'page.typeCode'),
                renderer: page.renderer
            },
            route: draft.route || null,
            navigation: draft.navigation || null,
            sections: this.normalizeSections(draft.sections)
        };
    },

    /** Normalizes designer sections while allowing any number of slots. */
    normalizeSections: function (sections) {
        if (!Array.isArray(sections)) return [];
        return sections.map((section, index) => {
            let safe = section && typeof section === 'object' && !Array.isArray(section) ? section : {};
            return {
                code: safe.code,
                slot: this.requiredCode(safe.slot || 'default', 'section.slot'),
                index: Number.isInteger(Number(safe.index)) ? Number(safe.index) : index,
                components: this.normalizeComponents(safe.components)
            };
        });
    },

    /** Normalizes designer component intents. */
    normalizeComponents: function (components) {
        if (!Array.isArray(components)) return [];
        return components.map(component => {
            let safe = component && typeof component === 'object' && !Array.isArray(component) ? component : {};
            return {
                code: this.requiredCode(safe.code, 'component.code'),
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
        draft.sections.forEach((section, sectionIndex) => section.components.forEach((component, componentIndex) => {
            planned.push(['DefaultCmsComponentService', this.componentModel(component)]);
            planned.push(['DefaultCmsComponentDetailService', this.sectionModel(draft, section, component, sectionIndex, componentIndex)]);
            component.localizations.forEach(locale => planned.push(['DefaultCmsComponentLocalizationService', this.localizationModel(component, locale)]));
            component.media.forEach((media, index) => planned.push(['DefaultCmsComponentMediaService', this.mediaModel(component, media, index)]));
        }));
        if (draft.route) planned.push(['DefaultCmsPageRouteService', this.routeIntent(draft)]);
        if (draft.navigation) planned.push(['DefaultCmsNavigationNodeService', this.navigationIntent(draft)]);
        for (const [serviceName, model] of planned) {
            await this.access().assertIdentity(serviceName, request, model.code, scope);
            await this.assertModelScope(serviceName, request, model, scope, planned);
        }
        return {
            catalog: { code: catalog.code, name: catalog.name, catalogType: catalog.catalogType },
            site: { code: site.code, name: site.name, catalog: site.catalog },
            template: { code: template.code, name: template.name, renderer: template.renderer, slots: slots.map(slot => slot.name) },
            sectionCount: draft.sections.length,
            componentCount: draft.sections.reduce((total, section) => total + section.components.length, 0)
        };
    },

    /** Validates page and type-code references used by a designer draft. */
    validatePageReferences: async function (request, draft) {
        await this.getSingle('DefaultCmsTypeCodeService', request, { code: draft.page.typeCode, kind: 'PAGE', active: true }, 'ERR_CMS_00100');
        return true;
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
            cmsComponents: []
        };
    },

    /** Builds one CMS component model. */
    componentModel: function (component) {
        return {
            code: component.code,
            active: true,
            typeCode: component.typeCode,
            renderer: component.renderer,
            properties: component.properties,
            accessMode: component.accessMode,
            subComponents: []
        };
    },

    /** Builds one locale variant persisted separately from shared component properties. */
    localizationModel: function (component, localization) {
        return {
            code: [component.code, localization.locale].join('-'),
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
            index: Number.isInteger(Number(section.index)) ? Number(section.index) : sectionIndex + componentIndex
        };
    },

    /** Builds one CMS component-media model from a normalized component/media intent. */
    mediaModel: function (component, media, index) {
        let safe = media && typeof media === 'object' && !Array.isArray(media) ? media : {};
        return {
            code: safe.code || safe.componentMediaCode || [component.code, safe.role || 'primary', safe.mediaCode || safe.mediaSetCode || index].join('-'),
            componentMediaCode: safe.componentMediaCode || safe.code || [component.code, safe.role || 'primary', safe.mediaCode || safe.mediaSetCode || index].join('-'),
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
            code: route.code || [draft.siteCode || route.site, pageCode, 'route'].filter(Boolean).join('-'),
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

    /** Builds or normalizes navigation assignment intent. */
    navigationIntent: function (draft) {
        let navigation = draft.navigation && typeof draft.navigation === 'object' && !Array.isArray(draft.navigation) ? draft.navigation : draft;
        let pageCode = draft.page && draft.page.code || navigation.targetPage || navigation.pageCode;
        let pageName = draft.page && draft.page.name || navigation.name || navigation.title || pageCode;
        return {
            code: navigation.code || [draft.siteCode || navigation.site, pageCode, 'nav'].filter(Boolean).join('-'),
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
            code: input.code || [input.source, input.slot || 'default', input.target].filter(Boolean).join('-'),
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
            subComponents: Array.isArray(input.subComponents) ? input.subComponents : []
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
        this.access().authorize(request, 'cms.authoring.write');
        try {
            let response = await service.save({ tenant: request.tenant, authData: this.access().persistenceAuth(),
                model: this.access().nextModel(Object.assign({}, model, {
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
        let items = await this.safeGet(serviceName, request, query);
        if (items.length === 1) return items[0];
        if (optionalWhenMissing && items.length === 0) return Object.assign({ code: query.code, name: query.code }, query);
        throw this.error(code, 'Required CMS designer reference is unavailable');
    },

    /** Fetches many matching records through a generated service. */
    getMany: async function (serviceName, request, query) {
        return this.safeGet(serviceName, request, query);
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
        let sites = await this.safeGet('DefaultCmsSiteService', request, { active: true, enterpriseCode });
        if (sites.some(site => site.enterpriseCode !== enterpriseCode)) this.access().deny();
        let catalogs = this.catalogsFromSites(sites);
        const referenceRows = async serviceName => (await this.access().records(serviceName, request, { active: true }))
            .filter(row => !row.authoringScope || row.authoringScope.enterpriseCode === enterpriseCode &&
                catalogs.some(catalog => catalog.code === row.authoringScope.catalogCode));
        let templates = await referenceRows('DefaultCmsPageTemplateService');
        let slots = await referenceRows('DefaultCmsSlotDefinitionService');
        let typeCodes = await referenceRows('DefaultCmsTypeCodeService');
        let groups = await referenceRows('DefaultCmsComponentTypeGroupService');
        let mediaFolders = await this.safeOptionalGet('DefaultMediaFolderService', request, { status: 'ACTIVE' });
        let mediaFormats = await this.safeOptionalGet('DefaultMediaFormatService', request, { status: 'ACTIVE' });
        let navigationNodes = await this.safeOptionalGet('DefaultCmsNavigationNodeService', request,
            { status: 'ACTIVE', 'authoringScope.enterpriseCode': enterpriseCode });
        return {
            contentCatalogs: catalogs.map(this.catalogReference.bind(this)),
            sites: sites.map(this.siteReference.bind(this)),
            pageTemplates: templates.map(this.templateReference.bind(this)),
            slotDefinitions: slots.map(this.slotReference.bind(this)),
            pageTypes: typeCodes.filter(item => item.kind === 'PAGE').map(this.typeReference.bind(this)),
            componentTypes: typeCodes.filter(item => item.kind === 'COMPONENT').map(this.typeReference.bind(this)),
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
            name: item.name || item.displayName || item.code,
            renderer: item.renderer,
            typeCode: this.codeOf(item.typeCode || item.pageTypeCode)
        };
    },

    /** Returns a client-safe slot definition reference. */
    slotReference: function (item) {
        return {
            code: item.code,
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
            name: item.name || item.displayName || item.code,
            kind: item.kind,
            propertySchema: item.propertySchema
        };
    },

    /** Normalizes a component locale variant without merging it into shared properties. */
    normalizeLocalization: function (input) {
        let safe = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
        return {
            locale: this.requiredText(safe.locale, 'localization.locale'),
            properties: safe.properties && typeof safe.properties === 'object' && !Array.isArray(safe.properties) ? safe.properties : {},
            seo: safe.seo && typeof safe.seo === 'object' && !Array.isArray(safe.seo) ? safe.seo : undefined,
            status: safe.status || 'DRAFT'
        };
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
            const placements = await this.access().assertIdentity('DefaultCmsComponentDetailService', request, code, scope, true);
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
            requireNavigationForPublish: false,
            draftDefaults: {},
            componentKinds: []
        }, configured || {});
    },

    /** Returns client-safe authoring defaults without exposing unrelated runtime policy. */
    clientAuthoringDefaults: function () {
        let policy = this.authoringPolicy();
        return {
            maximumReferenceLookupItems: policy.maximumReferenceLookupItems,
            requireNavigationForPublish: policy.requireNavigationForPublish,
            draftDefaults: policy.draftDefaults,
            componentKinds: Array.isArray(policy.componentKinds) ? policy.componentKinds : []
        };
    },

    /** Returns the bounded locale policy needed by Axis authoring controls. */
    clientLocalizationPolicy: function () {
        let configured = (typeof CONFIG !== 'undefined' && CONFIG.get ? (CONFIG.get('cms') || {}).localization : {}) || {};
        return {
            supportedLocales: Array.isArray(configured.supportedLocales) ? configured.supportedLocales : [],
            defaultLocale: configured.defaultLocale || 'en',
            fallbackLocales: Array.isArray(configured.fallbackLocales) ? configured.fallbackLocales : []
        };
    },

    /** Builds a stable component-detail code for page/component placement. */
    sectionCode: function (pageCode, section, component) {
        return [pageCode, section.slot, component.code].filter(Boolean).join('-');
    },

    /** Validates and returns a safe Nodics code. */
    requiredCode: function (value, label) {
        if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(value)) {
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
