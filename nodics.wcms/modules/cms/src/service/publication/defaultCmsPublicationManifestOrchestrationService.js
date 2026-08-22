/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const crypto = require('crypto');

/**
 * @module cms/service/publication/DefaultCmsPublicationManifestOrchestrationService
 * @description Builds immutable client-safe CMS manifests and atomically switches tenant-scoped Online pointers.
 * @layer service
 * @owner cms
 * @override Projects may extend manifest projection while preserving exact-version reads, deterministic integrity, and pointer CAS semantics.
 */
module.exports = {
    /** Initializes CMS publication manifests. */
    init: function () { return Promise.resolve(true); },
    /** Completes CMS publication manifest initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Normalizes generated-service results. */
    items: function (response) { return response && Array.isArray(response.result) ? response.result : []; },
    /** Returns a provider-neutral affected-record count. */
    affected: function (response) {
        let value = response && response.result !== undefined ? response.result : response;
        return value && (value.modifiedCount || value.nModified || value.n || value.result && this.affected(value.result)) || 0;
    },
    /** Maps CMS schema identities to their generated services. */
    serviceFor: function (schema) {
        let names = { cmsSite: 'DefaultCmsSiteService', cmsPageRoute: 'DefaultCmsPageRouteService', cmsPage: 'DefaultCmsPageService',
            cmsComponentDetail: 'DefaultCmsComponentDetailService', cmsComponent: 'DefaultCmsComponentService',
            cmsComponentLocalization: 'DefaultCmsComponentLocalizationService', cmsComponentMedia: 'DefaultCmsComponentMediaService',
            cmsTypeCode: 'DefaultCmsTypeCodeService',
            cmsPageTemplate: 'DefaultCmsPageTemplateService', cmsSlotDefinition: 'DefaultCmsSlotDefinitionService' };
        if (!names[schema] || !SERVICE[names[schema]]) throw new CLASSES.NodicsError('CMS_PUBLICATION_SERVICE_UNAVAILABLE', 'CMS manifest service is unavailable');
        return SERVICE[names[schema]];
    },
    /** Loads one exact immutable dependency version. */
    load: async function (identity, request) {
        let response = await this.serviceFor(identity.schema).get({ tenant: request.tenant, authData: request.authData,
            transactionContext: request.transactionContext,
            query: { code: identity.code, versionId: Number(identity.version), active: true }, searchOptions: { limit: 1 } });
        let model = this.items(response)[0];
        if (!model) throw new CLASSES.NodicsError('CMS_PUBLICATION_DEPENDENCY_MISSING', 'Frozen CMS dependency version is unavailable');
        return model;
    },
    /** Produces one detached client-safe page graph from preloaded exact frozen dependencies. */
    buildRouteSnapshot: function (models, route) {
        if (!route) throw new CLASSES.NodicsError('CMS_PUBLICATION_ROUTE_MISSING', 'Frozen CMS route is unavailable');
        let pageCode = route.page && route.page.code || route.page;
        let page = models['cmsPage:' + pageCode];
        if (!page) throw new CLASSES.NodicsError('CMS_PUBLICATION_PAGE_INVALID', 'Frozen CMS page is unavailable');
        let templateCode = page.template && page.template.code || page.template;
        let template = templateCode && models['cmsPageTemplate:' + templateCode];
        if (templateCode && !template) throw new CLASSES.NodicsError('CMS_PUBLICATION_TEMPLATE_MISSING', 'Frozen CMS page template is unavailable');
        let associations = Object.keys(models).filter(key => key.startsWith('cmsComponentDetail:')).map(key => models[key]);
        let components = Object.keys(models).filter(key => key.startsWith('cmsComponent:')).reduce((result, key) => {
            result[models[key].code] = models[key]; return result;
        }, {});
        let localizations = Object.keys(models).filter(key => key.startsWith('cmsComponentLocalization:')).map(key => models[key]);
        let media = Object.keys(models).filter(key => key.startsWith('cmsComponentMedia:')).map(key => models[key]);
        let build = (source, ancestors) => {
            ancestors = new Set(ancestors || []);
            if (ancestors.has(source)) throw new CLASSES.NodicsError('CMS_PUBLICATION_GRAPH_CYCLE', 'Frozen CMS component graph contains a cycle');
            ancestors.add(source);
            return associations.filter(item => item.source === source).sort((a, b) => Number(a.index || 0) - Number(b.index || 0)).map(item => {
                let code = item.target && item.target.code || item.target;
                let component = components[code];
                if (!component) throw new CLASSES.NodicsError('CMS_PUBLICATION_COMPONENT_MISSING',
                    'Frozen CMS component is unavailable: ' + String(code));
                let variants = localizations.filter(variant => variant.componentCode === component.code);
                let resolved = SERVICE.DefaultCmsContentLocalizationService ? SERVICE.DefaultCmsContentLocalizationService.resolve(
                    component, variants, route.locale) : { properties: component.properties };
                let componentMedia = media.filter(reference => reference.componentCode === component.code);
                if (SERVICE.DefaultCmsContentLocalizationService) componentMedia = SERVICE.DefaultCmsContentLocalizationService.selectMedia(
                    componentMedia, route.locale);
                return { code: component.code, typeCode: component.typeCode, active: component.active !== false, renderer: component.renderer,
                    rendererContractVersion: component.rendererContractVersion, rendererChannels: component.rendererChannels,
                    rendererDeprecated: component.rendererDeprecated, rendererReplacement: component.rendererReplacement,
                    properties: this.deliveryProperties(resolved.properties), localization: resolved.localization,
                    media: componentMedia.map(reference => ({ componentMediaCode: reference.componentMediaCode,
                        mediaCode: reference.mediaCode, mediaSetCode: reference.mediaSetCode, mediaType: reference.mediaType,
                        role: reference.role, slot: reference.slot, localeCode: reference.localeCode,
                        position: reference.position, altText: reference.altText, caption: reference.caption })),
                    slot: item.slot || 'default', index: Number(item.index || 0), components: build(component.code, ancestors) };
            });
        };
        return { contractVersion: 0, site: route.site, path: route.path, locale: route.locale, channel: route.channel,
            accessMode: route.accessMode, page: { code: page.code, name: page.name, typeCode: page.typeCode,
                template: page.template, renderer: page.renderer, rendererContractVersion: page.rendererContractVersion,
                rendererChannels: page.rendererChannels, rendererDeprecated: page.rendererDeprecated,
                rendererReplacement: page.rendererReplacement,
                templateContract: template && { code: template.code, renderer: template.renderer, contractVersion: template.contractVersion },
                components: build(page.code) } };
    },
    /** Produces either one page snapshot or one atomic site-bundle snapshot. */
    buildSnapshot: async function (publication, request) {
        let models = {};
        for (let identity of publication.dependencies || []) models[identity.schema + ':' + identity.code] = await this.load(identity, request);
        if (publication.rootType !== 'site') return this.buildRouteSnapshot(models, models['cmsPageRoute:' + publication.rootCode]);
        let site = models['cmsSite:' + publication.rootCode];
        if (!site) throw new CLASSES.NodicsError('CMS_PUBLICATION_SITE_MISSING', 'Frozen CMS site is unavailable');
        let routes = Object.keys(models).filter(key => key.startsWith('cmsPageRoute:')).map(key => models[key])
            .filter(route => route.site === site.code).sort((left, right) => String(left.path).localeCompare(String(right.path)));
        if (!routes.length) throw new CLASSES.NodicsError('CMS_PUBLICATION_SITE_EMPTY', 'Frozen CMS site contains no routes');
        return this.compactSiteSnapshot({ contractVersion: 2, bundleType: 'SITE', site: site.code,
            routes: routes.map(route => this.buildRouteSnapshot(models, route)) });
    },
    /** Stores repeated component subtrees once per site bundle while preserving route-local page contracts. */
    compactSiteSnapshot: function (snapshot) {
        if (!snapshot || snapshot.bundleType !== 'SITE' || !Array.isArray(snapshot.routes)) return snapshot;
        let sharedComponents = {};
        let identities = {};
        let compactComponent = component => {
            let model = Object.assign({}, component, {
                components: [].concat(component.components || []).map(compactComponent)
            });
            let hash = crypto.createHash('sha256').update(JSON.stringify(model)).digest('hex').slice(0, 16);
            let identity = [component.code || 'component', hash].join('_').replace(/[^A-Za-z0-9_-]/g, '_');
            if (!identities[identity]) {
                identities[identity] = true;
                sharedComponents[identity] = model;
            }
            return { componentRef: identity };
        };
        let routes = snapshot.routes.map(route => Object.assign({}, route, {
            page: Object.assign({}, route.page || {}, {
                components: [].concat(route.page && route.page.components || []).map(compactComponent)
            })
        }));
        return Object.assign({}, snapshot, { routes: routes, sharedComponents: sharedComponents });
    },
    /** Collects referenced concrete media identities from a detached snapshot. */
    collectMediaCodes: function (snapshot) {
        let codes = new Set();
        let visit = value => {
            if (Array.isArray(value)) return value.forEach(visit);
            if (!value || typeof value !== 'object') return;
            if (value.mediaCode) codes.add(value.mediaCode);
            Object.keys(value).forEach(key => visit(value[key]));
        };
        visit(snapshot);
        return Array.from(codes).sort();
    },
    /** Removes authoring/search-only payload from immutable delivery snapshots. */
    deliveryProperties: function (properties) {
        if (!properties || typeof properties !== 'object' || Array.isArray(properties)) return properties || {};
        let blocked = new Set(['searchText', 'searchKeywords', 'indexText']);
        return Object.keys(properties).reduce((result, key) => {
            if (!blocked.has(key)) result[key] = properties[key];
            return result;
        }, {});
    },
    /** Persists one deterministic immutable publication manifest idempotently. */
    persist: async function (publication, request) {
        let snapshot = await this.buildSnapshot(publication, request);
        let mediaCodes = this.collectMediaCodes(snapshot);
        let mediaAssets = mediaCodes.length ? await SERVICE.DefaultMediaPublicationTransferService.exportReferenced(mediaCodes, request) : [];
        let contentModel = { dependencies: publication.dependencies, snapshot: snapshot };
        if (mediaAssets.length) contentModel.mediaAssets = mediaAssets;
        let content = JSON.stringify(contentModel);
        let contentHash = crypto.createHash('sha256').update(content).digest('hex');
        let code = [publication.code, publication.sourceVersion, Number(publication.revision || 0)].join('_');
        let model = { code: code, active: true, publicationCode: publication.code, rootType: publication.rootType,
            rootCode: publication.rootCode, sourceVersion: publication.sourceVersion, dependencies: publication.dependencies,
            snapshot: snapshot, contentHash: contentHash, createdBy: publication.requestedBy ||
                request.authData && (request.authData.principalId || request.authData.code),
            correlationId: request.correlationId || request.requestId };
        if (mediaAssets.length) model.mediaAssets = mediaAssets;
        let existing = this.items(await SERVICE.DefaultCmsPublicationManifestService.get({ tenant: request.tenant, authData: request.authData,
            transactionContext: request.transactionContext,
            query: { code: code }, searchOptions: { limit: 1 } }))[0];
        if (existing) {
            if (existing.contentHash !== contentHash) throw new CLASSES.NodicsError('CMS_PUBLICATION_MANIFEST_CONFLICT', 'Publication manifest identity conflict');
            return existing;
        }
        let response = await SERVICE.DefaultCmsPublicationManifestService.save({ tenant: request.tenant, authData: request.authData,
            transactionContext: request.transactionContext, model: model });
        return this.items(response)[0] || response.result || model;
    },
    /** Imports one integrity-checked immutable manifest into the target CMS repository idempotently. */
    importManifest: async function (manifest, request) {
        let contentModel = { dependencies: manifest.dependencies, snapshot: manifest.snapshot };
        if (Object.prototype.hasOwnProperty.call(manifest, 'mediaAssets')) contentModel.mediaAssets = manifest.mediaAssets;
        let content = JSON.stringify(contentModel);
        let hash = crypto.createHash('sha256').update(content).digest('hex');
        if (!manifest.contentHash || hash !== manifest.contentHash) throw new CLASSES.NodicsError('CMS_PUBLICATION_MANIFEST_INTEGRITY', 'CMS publication manifest integrity validation failed');
        let existing = await this.getManifest(manifest.code, request);
        if (existing) {
            if (existing.contentHash !== manifest.contentHash) throw new CLASSES.NodicsError('CMS_PUBLICATION_MANIFEST_CONFLICT', 'Publication manifest identity conflict');
            return existing;
        }
        let safe = { code: manifest.code, active: true, publicationCode: manifest.publicationCode, rootType: manifest.rootType,
            rootCode: manifest.rootCode, sourceVersion: manifest.sourceVersion, dependencies: manifest.dependencies,
            snapshot: manifest.snapshot, contentHash: manifest.contentHash, createdBy: manifest.createdBy,
            correlationId: request.correlationId || request.requestId || manifest.correlationId };
        if (Object.prototype.hasOwnProperty.call(manifest, 'mediaAssets')) safe.mediaAssets = manifest.mediaAssets;
        let response = await SERVICE.DefaultCmsPublicationManifestService.save({ tenant: request.tenant, authData: request.authData,
            transactionContext: request.transactionContext, model: safe });
        return this.items(response)[0] || response.result || safe;
    },
    /** Returns the current Online pointer for a route scope. */
    getPointer: async function (route, request) {
        let response = await SERVICE.DefaultCmsOnlinePublicationPointerService.get({ tenant: request.tenant, authData: request.authData,
            transactionContext: request.transactionContext,
            query: { site: route.site, path: route.path, locale: route.locale, channel: route.channel, accessMode: route.accessMode, active: true },
            searchOptions: { limit: 1 } });
        return this.items(response)[0];
    },
    /** Returns a route pointer regardless of active delivery state for safe reactivation. */
    getStoredPointer: async function (route, request) {
        let response = await SERVICE.DefaultCmsOnlinePublicationPointerService.get({ tenant: request.tenant, authData: request.authData,
            transactionContext: request.transactionContext,
            query: { site: route.site, path: route.path, locale: route.locale, channel: route.channel, accessMode: route.accessMode },
            searchOptions: { limit: 1 } });
        return this.items(response)[0];
    },
    /** Returns every bounded Online pointer for one site bundle. */
    getSitePointers: async function (site, request) {
        let maximum = Number((((CONFIG.get('cms') || {}).publication || {}).maxBundleRoutes) || 200);
        let response = await SERVICE.DefaultCmsOnlinePublicationPointerService.get({ tenant: request.tenant, authData: request.authData,
            transactionContext: request.transactionContext, query: { site: site, active: true }, searchOptions: { limit: maximum } });
        let pointers = this.items(response);
        if (pointers.length > maximum) throw new CLASSES.NodicsError('CMS_PUBLICATION_ROUTE_BOUNDARY', 'CMS site pointer boundary exceeded');
        return pointers;
    },
    /** Returns bounded active and inactive pointer lineage used to protect live and rollback media. */
    getRetentionPointers: async function (request) {
        let maximum = Number(((((CONFIG.get('cms') || {}).publication || {}).mediaGarbageCollection || {}).maximumPointers) || 1000);
        let response = await SERVICE.DefaultCmsOnlinePublicationPointerService.get({ tenant: request.tenant,
            authData: request.authData, query: {}, searchOptions: { limit: maximum + 1 } });
        let pointers = this.items(response);
        if (pointers.length > maximum) throw new CLASSES.NodicsError('CMS_PUBLICATION_MEDIA_RETENTION_BOUNDARY', 'CMS publication pointer retention boundary exceeded');
        return pointers;
    },
    /** Resolves route-level and site-bundle delivery scopes from a manifest snapshot. */
    deliveryScopes: function (manifest) {
        let snapshot = manifest && manifest.snapshot;
        if (snapshot && snapshot.bundleType === 'SITE' && Array.isArray(snapshot.routes)) return snapshot.routes;
        return snapshot ? [snapshot] : [];
    },
    /** Atomically switches one route scope to an immutable manifest. */
    activateScope: async function (manifest, scope, request) {
        let current = await this.getStoredPointer(scope, request);
        if (current && current.active !== false && current.manifestCode === manifest.code) {
            return { version: manifest.code, previousOnlineVersion: current.previousManifestCode };
        }
        let patch = { active: true, manifestCode: manifest.code,
            previousManifestCode: current && current.active !== false ? current.manifestCode : undefined,
            revision: Number(current && current.revision || 0) + 1,
            activatedBy: request.authData && (request.authData.principalId || request.authData.code), correlationId: request.correlationId || request.requestId };
        if (current) {
            let response = await SERVICE.DefaultCmsOnlinePublicationPointerService.update({ tenant: request.tenant, authData: request.authData,
                transactionContext: request.transactionContext,
                query: { code: current.code, revision: Number(current.revision || 0) }, model: patch });
            if (this.affected(response) !== 1) throw new CLASSES.NodicsError('CMS_PUBLICATION_POINTER_CONFLICT', 'CMS Online pointer revision conflict');
        } else {
            let key = [scope.site, scope.path, scope.locale, scope.channel, scope.accessMode].join('|');
            try {
                await SERVICE.DefaultCmsOnlinePublicationPointerService.save({ tenant: request.tenant, authData: request.authData,
                    transactionContext: request.transactionContext,
                    model: Object.assign({ code: crypto.createHash('sha256').update(key).digest('hex'), active: true,
                        site: scope.site, path: scope.path, locale: scope.locale, channel: scope.channel, accessMode: scope.accessMode }, patch) });
            } catch (error) {
                let winner = await this.getPointer(scope, request);
                if (!winner || winner.manifestCode !== manifest.code) throw error;
                return { version: manifest.code, previousOnlineVersion: winner.previousManifestCode };
            }
        }
        return { version: manifest.code, previousOnlineVersion: current && current.manifestCode };
    },
    /** Atomically switches either one route or every route in one site manifest. */
    activate: async function (manifest, request) {
        let scopes = this.deliveryScopes(manifest);
        if (!Array.isArray(scopes) || !scopes.length) throw new CLASSES.NodicsError('CMS_PUBLICATION_ROUTE_MISSING', 'CMS publication contains no delivery scope');
        let activations = [];
        for (let scope of scopes) activations.push(await this.activateScope(manifest, scope, request));
        let previous = Array.from(new Set(activations.map(item => item.previousOnlineVersion).filter(Boolean)));
        return { version: manifest.code, previousOnlineVersion: previous.length === 1 ? previous[0] : undefined,
            routeCount: scopes.length };
    },
    /** Atomically disables every active pointer owned by one immutable manifest. */
    withdraw: async function (manifest, request) {
        let scopes = this.deliveryScopes(manifest);
        if (!Array.isArray(scopes) || !scopes.length) throw new CLASSES.NodicsError('CMS_PUBLICATION_ROUTE_MISSING', 'CMS publication contains no delivery scope');
        let count = 0;
        for (let scope of scopes) {
            let current = await this.getPointer(scope, request);
            if (!current) continue;
            if (current.manifestCode !== manifest.code) {
                throw new CLASSES.NodicsError('CMS_PUBLICATION_WITHDRAWAL_SCOPE_CONFLICT', 'CMS Online pointer belongs to a different release');
            }
            let response = await SERVICE.DefaultCmsOnlinePublicationPointerService.update({ tenant: request.tenant, authData: request.authData,
                transactionContext: request.transactionContext,
                query: { code: current.code, revision: Number(current.revision || 0) },
                model: { active: false, revision: Number(current.revision || 0) + 1,
                    correlationId: request.correlationId || request.requestId } });
            if (this.affected(response) !== 1) throw new CLASSES.NodicsError('CMS_PUBLICATION_POINTER_CONFLICT', 'CMS Online pointer revision conflict');
            count += 1;
        }
        return { version: manifest.code, routeCount: count };
    },
    /** Loads one immutable manifest by code. */
    getManifest: async function (code, request) {
        let response = await SERVICE.DefaultCmsPublicationManifestService.get({ tenant: request.tenant, authData: request.authData,
            transactionContext: request.transactionContext,
            query: { code: code }, searchOptions: { limit: 1 } });
        return this.items(response)[0];
    }
};
