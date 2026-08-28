/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cms/service/publication/DefaultCmsPublicationAdapterService
 * @description Resolves and validates immutable CMS page-route dependency graphs for the generic nPublish lifecycle.
 * @layer service
 * @owner cms
 * @override Projects may extend supported CMS root types while preserving exact-version dependency and bounded graph contracts.
 */
module.exports = {
    /** Initializes CMS publication adaptation. */
    init: function () { return Promise.resolve(true); },
    /** Completes CMS publication adaptation initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns effective CMS publication settings. */
    settings: function () { return (CONFIG.get('cms') || {}).publication || {}; },
    /** Resolves one supported root descriptor. */
    descriptor: function (rootType) {
        let descriptor = (this.settings().rootTypes || {})[rootType];
        if (!descriptor) throw this.error('CMS_PUBLICATION_ROOT_UNSUPPORTED', 'Unsupported CMS publication root type');
        return descriptor;
    },
    /** Resolves one generated schema service by configured name. */
    service: function (name) {
        if (!name || !SERVICE[name]) throw this.error('CMS_PUBLICATION_SERVICE_UNAVAILABLE', 'CMS publication schema service is unavailable');
        return SERVICE[name];
    },
    /** Normalizes generated-service results. */
    items: function (response) { return response && Array.isArray(response.result) ? response.result : []; },
    /** Loads an exact immutable CMS version. */
    getVersion: async function (publication, request) {
        let descriptor = this.descriptor(publication.rootType);
        if (String(publication.sourceVersion) === '0') {
            let latest = await this.loadLatest(descriptor.service, request, { code: publication.rootCode });
            let version = latest[0];
            if (!version) throw this.error('CMS_PUBLICATION_VERSION_NOT_FOUND', 'CMS source version was not found');
            return version;
        }
        let response = await this.service(descriptor.service).get({ tenant: request.tenant, authData: request.authData,
            query: { code: publication.rootCode, versionId: Number(publication.sourceVersion), active: true }, searchOptions: { limit: 1 } });
        let version = this.items(response)[0];
        if (!version) throw this.error('CMS_PUBLICATION_VERSION_NOT_FOUND', 'CMS source version was not found');
        return version;
    },
    /** Selects the latest version for each stable code from generated-service results. */
    latestByCode: function (items) {
        return Array.from(items.reduce((result, item) => {
            let current = result.get(item.code);
            if (!current || Number(item.versionId || 0) > Number(current.versionId || 0)) result.set(item.code, item);
            return result;
        }, new Map()).values());
    },
    /** Loads active models and collapses version history to exact latest identities. */
    loadLatest: async function (serviceName, request, query) {
        let maximum = Number(this.settings().maxDependencies || 500);
        let response = await this.service(serviceName).get({ tenant: request.tenant, authData: request.authData,
            query: Object.assign({ active: true }, query), searchOptions: { limit: maximum, pageSize: maximum,
                sort: { versionId: -1 } } });
        return this.latestByCode(this.items(response));
    },
    /** Converts one model into a frozen dependency identity. */
    identity: function (schema, model) {
        return { schema: schema, code: model.code, version: String(model.versionId) };
    },
    /** Resolves the bounded exact-version graph owned by one page route. */
    resolveRouteDependencies: async function (rootVersion, request) {
        let settings = this.settings();
        let max = Number(settings.maxDependencies || 500);
        let dependencies = [this.identity('cmsPageRoute', rootVersion)];
        let pages = await this.loadLatest('DefaultCmsPageService', request, { code: rootVersion.page });
        if (pages.length !== 1) throw this.error('CMS_PUBLICATION_PAGE_INVALID', 'Published route must resolve exactly one page');
        dependencies.push(this.identity('cmsPage', pages[0]));
        let frontier = [pages[0].code];
        let visited = new Set();
        for (let depth = 0; frontier.length; depth++) {
            if (depth >= Number(settings.maxDepth || 12)) throw this.error('CMS_PUBLICATION_DEPTH_EXCEEDED', 'CMS publication graph exceeds configured depth');
            let sources = frontier.filter(code => !visited.has(code));
            if (!sources.length) break;
            sources.forEach(code => visited.add(code));
            let associations = await this.loadLatest('DefaultCmsComponentDetailService', request, { source: { $in: sources } });
            associations.forEach(model => dependencies.push(this.identity('cmsComponentDetail', model)));
            let targets = Array.from(new Set(associations.map(item => item.target && item.target.code || item.target).filter(Boolean)));
            let components = targets.length ? await this.loadLatest('DefaultCmsComponentService', request, { code: { $in: targets } }) : [];
            components.forEach(model => dependencies.push(this.identity('cmsComponent', model)));
            let typeCodes = Array.from(new Set(components.map(model => model.typeCode && model.typeCode.code || model.typeCode).filter(Boolean)));
            if (typeCodes.length) {
                let types = await this.loadLatest('DefaultCmsTypeCodeService', request, { code: { $in: typeCodes } });
                types.forEach(model => dependencies.push(this.identity('cmsTypeCode', model)));
            }
            if (targets.length && SERVICE.DefaultCmsComponentLocalizationService) {
                let localizations = await this.loadLatest('DefaultCmsComponentLocalizationService', request, { componentCode: { $in: targets } });
                localizations.forEach(model => dependencies.push(this.identity('cmsComponentLocalization', model)));
            }
            if (targets.length && SERVICE.DefaultCmsComponentMediaService) {
                let media = await this.loadLatest('DefaultCmsComponentMediaService', request, { componentCode: { $in: targets } });
                media.forEach(model => dependencies.push(this.identity('cmsComponentMedia', model)));
            }
            frontier = components.map(model => model.code);
            if (dependencies.length > max) throw this.error('CMS_PUBLICATION_DEPENDENCY_EXCEEDED', 'CMS publication graph exceeds configured size');
        }
        if (pages[0].template) {
            let templates = await this.loadLatest('DefaultCmsPageTemplateService', request, { code: pages[0].template });
            templates.forEach(model => dependencies.push(this.identity('cmsPageTemplate', model)));
            let slots = templates.length ? await this.loadLatest('DefaultCmsSlotDefinitionService', request, { template: templates[0].code }) : [];
            slots.forEach(model => dependencies.push(this.identity('cmsSlotDefinition', model)));
        }
        if (dependencies.length > max) throw this.error('CMS_PUBLICATION_DEPENDENCY_EXCEEDED', 'CMS publication graph exceeds configured size');
        return Array.from(dependencies.reduce((result, item) => {
            result.set(item.schema + ':' + item.code + ':' + item.version, item); return result;
        }, new Map()).values());
    },
    /** Resolves either one page route or every route in one immutable site baseline. */
    resolveDependencies: async function (publication, rootVersion, request) {
        if (publication.rootType !== 'site') return this.resolveRouteDependencies(rootVersion, request);
        let routes = await this.loadLatest('DefaultCmsPageRouteService', request, { site: rootVersion.code });
        if (!routes.length) throw this.error('CMS_PUBLICATION_SITE_EMPTY', 'Published CMS site must contain at least one route');
        let maximumRoutes = Number(this.settings().maxBundleRoutes || 200);
        if (routes.length > maximumRoutes) throw this.error('CMS_PUBLICATION_ROUTE_BOUNDARY', 'CMS site publication route boundary exceeded');
        let dependencies = [this.identity('cmsSite', rootVersion)];
        for (let route of routes) dependencies.push(...await this.resolveRouteDependencies(route, request));
        dependencies = Array.from(dependencies.reduce((result, item) => {
            result.set(item.schema + ':' + item.code + ':' + item.version, item); return result;
        }, new Map()).values());
        if (dependencies.length > Number(this.settings().maxBundleDependencies || 10000)) {
            throw this.error('CMS_PUBLICATION_DEPENDENCY_EXCEEDED', 'CMS publication graph exceeds configured size');
        }
        return dependencies;
    },
    /** Validates route, graph identity uniqueness, and renderer contracts. */
    validate: async function (publication, rootVersion, request, dependencies) {
        let routes = publication.rootType === 'site'
            ? (dependencies || []).filter(identity => identity.schema === 'cmsPageRoute')
            : [{ code: rootVersion.code, version: String(rootVersion.versionId) }];
        if (!routes.length) return { valid: false, reason: 'SITE_ROUTES_MISSING' };
        for (let identity of routes) {
            let route = identity.code === rootVersion.code && publication.rootType !== 'site' ? rootVersion :
                this.items(await this.service('DefaultCmsPageRouteService').get({ tenant: request.tenant, authData: request.authData,
                    query: { code: identity.code, versionId: Number(identity.version), active: true }, searchOptions: { limit: 1 } }))[0];
            if (!route) return { valid: false, reason: 'ROUTE_VERSION_MISSING' };
            await SERVICE.DefaultCmsContractValidationService.validateRoute({ model: Object.assign({}, route) });
        }
        let keys = (dependencies || []).map(item => item.schema + ':' + item.code + ':' + item.version);
        if (!keys.length || keys.length !== new Set(keys).size) return { valid: false, reason: 'DEPENDENCY_IDENTITY_INVALID' };
        for (let identity of dependencies) {
            let serviceNames = { cmsSite: 'DefaultCmsSiteService', cmsPageRoute: 'DefaultCmsPageRouteService', cmsPage: 'DefaultCmsPageService',
                cmsComponentDetail: 'DefaultCmsComponentDetailService', cmsComponent: 'DefaultCmsComponentService',
                cmsComponentLocalization: 'DefaultCmsComponentLocalizationService', cmsComponentMedia: 'DefaultCmsComponentMediaService',
                cmsTypeCode: 'DefaultCmsTypeCodeService',
                cmsPageTemplate: 'DefaultCmsPageTemplateService', cmsSlotDefinition: 'DefaultCmsSlotDefinitionService' };
            let response = await this.service(serviceNames[identity.schema]).get({ tenant: request.tenant, authData: request.authData,
                query: { code: identity.code, versionId: Number(identity.version), active: true }, searchOptions: { limit: 1 } });
            let model = this.items(response)[0];
            if (!model) return { valid: false, reason: 'DEPENDENCY_VERSION_MISSING' };
            if (model.renderer) await SERVICE.DefaultCmsContractValidationService.validateRenderer({ model: { renderer: model.renderer } });
            if (identity.schema === 'cmsComponentLocalization' && model.status !== 'READY') {
                return { valid: false, reason: 'LOCALIZATION_NOT_READY' };
            }
        }
        return { valid: publication.rootType === 'site' ? Boolean(rootVersion.code) :
            Boolean(rootVersion.code && rootVersion.page && rootVersion.site && rootVersion.path),
            rootVersion: rootVersion.versionId, routeCount: routes.length, dependencyCount: keys.length };
    },
    /** Invalidates locally only when this runtime also owns the publication target. */
    invalidateLocalTarget: function (request) {
        if (this.settings().targetTransportProvider) return Promise.resolve(true);
        return SERVICE.DefaultCmsDeliveryCacheInvalidationService.invalidate(request);
    },
    /** Invalidates CMS delivery cache after activation for an in-process target. */
    afterActivate: function (publication, activation, request) {
        return this.invalidateLocalTarget(request);
    },
    /** Invalidates CMS delivery cache after rollback for an in-process target. */
    afterRollback: function (publication, activation, request) {
        return this.invalidateLocalTarget(request);
    },
    /** Invalidates CMS delivery cache after withdrawal for an in-process target. */
    afterWithdraw: function (publication, activation, request) {
        return this.invalidateLocalTarget(request);
    },
    /** Creates a stable CMS publication error. */
    error: function (code, message) {
        let error = new CLASSES.NodicsError(code, message); error.code = error.code || code; return error;
    }
};
