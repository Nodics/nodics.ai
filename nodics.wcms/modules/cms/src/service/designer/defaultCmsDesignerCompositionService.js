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
                    'submitForPublication'],
                rules: {
                    catalogFirst: true,
                    arbitrarySlots: true,
                    frontendPersistence: false,
                    pixelPerfectRendering: false
                },
                defaults: this.clientAuthoringDefaults(),
                metadata: await this.authoringMetadata(request)
            }
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
        if (draft.route) saved.route = await this.assignRoute(Object.assign({}, request, { cmsDesigner: this.routeIntent(draft) }));
        if (draft.navigation) saved.navigation = await this.assignNavigation(Object.assign({}, request, { cmsDesigner: this.navigationIntent(draft) }));
        await this.invalidateDelivery(request);
        return { result: { status: 'DRAFT_SAVED', evidence: evidence, saved: saved } };
    },

    /** Adds one section placement by creating a CMS component-detail record. */
    addSection: async function (request) {
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
        let model = this.routeIntent(request.cmsDesigner || request.body || {});
        await SERVICE.DefaultCmsContractValidationService.validateRoute({ model: model });
        await this.validateRouteUniqueness(request, model);
        return { result: await this.saveRecord('DefaultCmsPageRouteService', request, model) };
    },

    /** Assigns one navigation node to a CMS Site. */
    assignNavigation: async function (request) {
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
        let created = await lifecycle.create(Object.assign({}, request, {
            publication: publication,
            reason: 'Axis Page Designer submit to Publishing'
        }));
        let validated = await lifecycle.validate(Object.assign({}, request, {
            publicationCode: created.code,
            expectedRevision: created.revision,
            reason: 'Axis Page Designer publish-readiness validation'
        }));
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
        let service = this.service(serviceName);
        try {
            let response = await service.save({ tenant: request.tenant, authData: request.authData, model: model });
            return this.firstResult(response) || model;
        } catch (error) {
            let message = serviceName + ' failed to save ' + (model && model.code ? model.code : 'draft record') +
                ': ' + (error && error.message ? error.message : error);
            throw this.error('ERR_CMS_00100', message);
        }
    },

    /** Removes one record through an existing generated service. */
    removeRecord: async function (serviceName, request, query) {
        let service = this.service(serviceName);
        if (typeof service.remove === 'function') return service.remove({ tenant: request.tenant, authData: request.authData, query: query });
        if (typeof service.delete === 'function') return service.delete({ tenant: request.tenant, authData: request.authData, query: query });
        throw this.error('ERR_CMS_00100', serviceName + ' does not expose a remove operation');
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
        let service = this.service(serviceName);
        let response = await service.get({
            tenant: request.tenant,
            authData: request.authData,
            options: Object.assign({}, request.options || {}, { recursive: false }),
            query: query,
            searchOptions: { limit: this.authoringPolicy().maximumReferenceLookupItems }
        });
        return response && Array.isArray(response.result) ? response.result : [];
    },

    /** Builds the client-safe backend metadata needed by Axis Designer forms. */
    authoringMetadata: async function (request) {
        let catalogs = await this.safeGet('DefaultCatalogService', request, { catalogType: 'CONTENT', active: true });
        let sites = await this.safeGet('DefaultCmsSiteService', request, { active: true });
        let templates = await this.safeGet('DefaultCmsPageTemplateService', request, { active: true });
        let slots = await this.safeGet('DefaultCmsSlotDefinitionService', request, { active: true });
        let typeCodes = await this.safeGet('DefaultCmsTypeCodeService', request, { active: true });
        let groups = await this.safeGet('DefaultCmsComponentTypeGroupService', request, { active: true });
        let mediaFolders = await this.safeOptionalGet('DefaultMediaFolderService', request, { status: 'ACTIVE' });
        let mediaFormats = await this.safeOptionalGet('DefaultMediaFormatService', request, { status: 'ACTIVE' });
        let navigationNodes = await this.safeOptionalGet('DefaultCmsNavigationNodeService', request, { status: 'ACTIVE' });
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
        return this.safeGet(serviceName, request, query);
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

    /** Returns the first generated-service result item. */
    firstResult: function (response) {
        if (response && Array.isArray(response.result)) return response.result[0];
        return response && response.result ? response.result : response;
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
            draftDefaults: {
                accessMode: 'PUBLIC',
                catalogCode: 'nexusContentCatalog',
                siteCode: 'nexusCorporateSite',
                templateCode: 'nexusCorporatePageTemplate',
                pageTypeCode: 'nexusCorporateStandardPageType',
                pageRenderer: 'nexus.page.standard',
                routePath: '/axis-e2e/content-designer-draft',
                slots: ['main']
            },
            componentKinds: [
                { label: 'Nexus hero', typeCode: 'nexusPageHeroType', renderer: 'nexus.hero' },
                { label: 'Nexus content section', typeCode: 'nexusContentSectionType', renderer: 'nexus.contentSection' },
                { label: 'Nexus card grid', typeCode: 'nexusCardGridType', renderer: 'nexus.cardGrid' },
                { label: 'Rich text', typeCode: 'richTextComponentType', renderer: 'axis.richText' },
                { label: 'Image card', typeCode: 'imageCardComponentType', renderer: 'axis.imageCard' },
                { label: 'Media gallery', typeCode: 'mediaGalleryComponentType', renderer: 'axis.mediaGallery' },
                { label: 'Call to action', typeCode: 'callToActionComponentType', renderer: 'axis.callToAction' },
                { label: 'Documentation article', typeCode: 'documentationArticleComponentType', renderer: 'axis.documentationArticle' },
                { label: 'Dashboard widget', typeCode: 'dashboardWidgetComponentType', renderer: 'axis.dashboardWidget' }
            ]
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
