/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module wcmsExperience/service/defaultWcmsExperiencePublicationIndexingService
 * @description Builds and persists Discovery projections for published WCMS Experience placements after CMS Online activation.
 * @layer service
 * @owner wcmsExperience
 * @override Projects may override loading/projecting while preserving idempotency, rollback, and alias-safety contracts.
 */
'use strict';

const crypto = require('node:crypto');

module.exports = {
    /** Returns effective WCMS Experience configuration. @returns {Object} Configuration. */
    config: function () {
        return typeof CONFIG !== 'undefined' && CONFIG.get ? (CONFIG.get('wcmsExperience') || {}) : {};
    },

    /** Returns projection configuration. @returns {Object} Projection configuration. */
    projectionConfig: function () {
        return this.config().projection || {};
    },

    /** Determines whether publication indexing is enabled. @returns {boolean} Enabled state. */
    isEnabled: function () {
        let config = this.config();
        let projection = this.projectionConfig();
        return config.enabled !== false && projection.provider !== 'FIXTURE';
    },

    /** Handles a committed CMS Online publication event. @param {Object} event Outbox event. @param {Object} request Nodics request. @returns {Promise<Object>} Indexing result. */
    handlePublicationEvent: async function (event, request) {
        if (!this.isEnabled()) return { skipped: true, reason: 'DISABLED' };
        if (!event || event.eventType !== 'CMS_ONLINE_CHANGED') return { skipped: true, reason: 'UNSUPPORTED_EVENT' };
        if (!['DEPLOY', 'ROLLBACK', 'WITHDRAW'].includes(event.operation)) return { skipped: true, reason: 'UNSUPPORTED_OPERATION' };
        let context = await this.loadPublicationContext(event, request || {});
        let placements = await this.loadPlacements(context, request || {});
        let documents = this.buildProjectionDocuments(placements, context, request || {});
        let plan = this.planPublication(context, documents, request || {});
        let saved = await this.indexProjectionDocuments(documents, plan, context, request || {});
        let alias = await this.switchAlias(plan, context, request || {});
        return {
            skipped: false,
            eventCode: event.code,
            publicationCode: event.publicationCode,
            manifestCode: event.manifestCode,
            operation: event.operation,
            documentCount: documents.length,
            savedCount: saved.length,
            alias: alias,
            plan: plan
        };
    },

    /** Loads target publication context from manifest service when available. @param {Object} event Outbox event. @param {Object} request Nodics request. @returns {Promise<Object>} Context. */
    loadPublicationContext: async function (event, request) {
        let manifest = event.manifest;
        if (!manifest && event.manifestCode && SERVICE.DefaultCmsPublicationManifestOrchestrationService &&
            typeof SERVICE.DefaultCmsPublicationManifestOrchestrationService.getManifest === 'function') {
            manifest = await SERVICE.DefaultCmsPublicationManifestOrchestrationService.getManifest(event.manifestCode, request);
        }
        let snapshot = manifest && manifest.snapshot || {};
        return {
            event: event,
            manifest: manifest,
            tenant: request.tenant || event.tenant || snapshot.tenant,
            authData: request.authData,
            site: snapshot.site || event.site,
            locale: snapshot.locale || event.locale,
            channel: snapshot.channel || event.channel,
            publicationStatus: event.operation === 'WITHDRAW' ? 'ARCHIVED' : 'ONLINE',
            deliveryStatus: event.operation === 'WITHDRAW' ? 'INACTIVE' : 'ACTIVE',
            release: event.publicationCode || manifest && manifest.publicationCode,
            indexVersion: this.indexVersion(event, manifest)
        };
    },

    /** Creates deterministic index version identity. @param {Object} event Event. @param {Object} manifest Manifest. @returns {string} Version. */
    indexVersion: function (event, manifest) {
        let source = manifest && manifest.code || event.manifestCode || event.code || 'unknown';
        return String(source).replace(/[^A-Za-z0-9._-]/g, '-');
    },

    /** Loads experience placement records touched by the publication. @param {Object} context Publication context. @param {Object} request Nodics request. @returns {Promise<Array<Object>>} Placements. */
    loadPlacements: async function (context, request) {
        if (request && request.cmsExperiencePlacements) return [].concat(request.cmsExperiencePlacements);
        if (context.manifest && Array.isArray(context.manifest.cmsExperiencePlacements)) return context.manifest.cmsExperiencePlacements.slice();
        let service = SERVICE.DefaultCmsExperiencePlacementService;
        if (!service || typeof service.get !== 'function') return [];
        let query = { active: true };
        if (context.site) query.site = context.site;
        let response = await service.get({ tenant: context.tenant || request.tenant, authData: request.authData,
            query: query, searchOptions: { limit: Number((this.config().resolver || {}).maxComponents || 200) } });
        return response && Array.isArray(response.result) ? response.result : [];
    },

    /** Builds deterministic Discovery document projections. @param {Array<Object>} placements Placements. @param {Object} context Context. @param {Object} request Request. @returns {Array<Object>} Documents. */
    buildProjectionDocuments: function (placements, context, request) {
        let projection = this.projectionConfig();
        return [].concat(placements || []).filter(Boolean).map(placement => {
            let payload = this.toProjectionPayload(placement, context);
            let builder = SERVICE.DefaultDiscoveryDocumentBuilderService;
            let base = {
                code: this.documentCode(payload, context),
                tenant: context.tenant || request.tenant,
                ownerType: projection.ownerType || 'WCMS_EXPERIENCE',
                ownerCode: payload.code,
                indexConfigurationCode: projection.indexConfigurationCode || 'cmsExperiencePlacement',
                storeCode: payload.site,
                locale: payload.locale,
                status: projection.status || 'CURRENT',
                site: payload.site,
                pageType: payload.pageType,
                slot: payload.slot,
                targetType: payload.targetType,
                targetCode: payload.targetCode,
                channel: payload.channel,
                device: payload.device,
                region: payload.region,
                publicationStatus: payload.publicationStatus,
                deliveryStatus: payload.deliveryStatus,
                specificity: payload.specificity,
                priority: payload.priority,
                release: payload.release,
                indexVersion: payload.indexVersion,
                payload: payload,
                sourceHash: this.sourceHash(payload),
                projectedAt: new Date(),
                active: payload.deliveryStatus !== 'INACTIVE'
            };
            return builder && typeof builder.build === 'function' ? builder.build(base) : base;
        });
    },

    /** Builds a deterministic projection source hash. @param {Object} payload Delivery payload. @returns {string} Hash. */
    sourceHash: function (payload) {
        return crypto.createHash('sha256').update(JSON.stringify(payload || {})).digest('hex');
    },

    /** Converts placement into delivery-safe projection payload. @param {Object} placement Placement. @param {Object} context Context. @returns {Object} Payload. */
    toProjectionPayload: function (placement, context) {
        return {
            code: placement.code,
            site: placement.site || context.site,
            pageType: placement.pageType,
            slot: placement.slot,
            targetType: placement.targetType,
            targetCode: placement.targetCode,
            component: placement.component,
            componentCode: placement.componentCode || placement.component,
            rendererKey: placement.rendererKey,
            contractVersion: Number(placement.contractVersion || 1),
            properties: Object.assign({}, placement.properties || {}),
            media: Array.isArray(placement.media) ? placement.media.slice() : [],
            priority: Number(placement.priority || 0),
            specificity: Number(placement.specificity || 0),
            locale: placement.locale || context.locale,
            channel: placement.channel || context.channel,
            region: placement.region,
            device: placement.device,
            validFrom: placement.validFrom,
            validTo: placement.validTo,
            fallbackComponent: placement.fallbackComponent,
            publicationStatus: context.publicationStatus || placement.publicationStatus || 'ONLINE',
            deliveryStatus: context.deliveryStatus || placement.deliveryStatus || 'ACTIVE',
            release: context.release || placement.release,
            indexVersion: context.indexVersion || placement.indexVersion
        };
    },

    /** Returns deterministic idempotent document code. @param {Object} payload Payload. @param {Object} context Context. @returns {string} Document code. */
    documentCode: function (payload, context) {
        return [
            'wcmsExperience',
            payload.site,
            payload.pageType,
            payload.slot,
            payload.targetType,
            payload.targetCode,
            payload.locale || '*',
            payload.channel || '*',
            context.indexVersion
        ].filter(Boolean).join('|');
    },

    /** Builds generic Discovery publication plan. @param {Object} context Context. @param {Array<Object>} documents Documents. @param {Object} request Request. @returns {Object} Plan. */
    planPublication: function (context, documents, request) {
        let projection = this.projectionConfig();
        let indexConfiguration = {
            code: projection.indexConfigurationCode || 'cmsExperiencePlacement',
            indexName: projection.indexName || 'discoveryDocumentProjection',
            aliasName: this.aliasName(context)
        };
        let planner = SERVICE.DefaultDiscoveryPublicationPlannerService;
        let plan = planner && typeof planner.plan === 'function' ? planner.plan({
            tenant: context.tenant || request.tenant,
            ownerType: projection.ownerType || 'WCMS_EXPERIENCE',
            indexConfiguration: indexConfiguration,
            publicationPolicy: projection.publicationPolicy || {}
        }) : { tenant: context.tenant || request.tenant, ownerType: projection.ownerType || 'WCMS_EXPERIENCE',
            indexConfigurationCode: indexConfiguration.code, indexName: indexConfiguration.indexName,
            aliasSwitch: true, rollbackEnabled: true };
        plan.documentCount = documents.length;
        plan.indexVersion = context.indexVersion;
        plan.aliasName = indexConfiguration.aliasName;
        return plan;
    },

    /** Resolves alias name from status and site. @param {Object} context Context. @returns {string} Alias name. */
    aliasName: function (context) {
        let indexing = this.config().indexing || {};
        let template = context.publicationStatus === 'ONLINE' ? indexing.onlineAliasTemplate : indexing.stagedAliasTemplate;
        return String(template || 'cms_experience_${site}_online_current').replace('${site}', context.site || 'global');
    },

    /** Persists documents through generic Discovery projection service. @param {Array<Object>} documents Documents. @param {Object} plan Plan. @param {Object} context Context. @param {Object} request Request. @returns {Promise<Array<Object>>} Saved documents. */
    indexProjectionDocuments: async function (documents, plan, context, request) {
        let service = SERVICE.DefaultDiscoveryDocumentProjectionService;
        if (!service || typeof service.doSave !== 'function') throw this.error('ERR_WCMS_EXPERIENCE_INDEX_SERVICE_UNAVAILABLE',
            'Discovery document projection service is unavailable');
        let saved = [];
        for (let document of documents) {
            let response = await service.doSave({ tenant: context.tenant || request.tenant, authData: request.authData,
                moduleName: 'discoveryProjection', indexName: plan.indexName, model: document });
            if (response && Array.isArray(response.errors) && response.errors.length > 0) {
                throw this.error('ERR_WCMS_EXPERIENCE_INDEX_SERVICE_UNAVAILABLE',
                    'Discovery projection save failed for WCMS Experience placement: ' +
                    String(document.ownerCode || document.code) + '; ' + this.errorSummary(response.errors));
            }
            saved.push(document);
        }
        return saved;
    },

    /** Creates a compact, operationally useful error summary without leaking full payloads. @param {Array<Object>} errors Search errors. @returns {string} Summary. */
    errorSummary: function (errors) {
        return [].concat(errors || []).map(error => {
            let code = error && (error.code || error.defaultCode || error.name);
            let message = error && error.message || String(error);
            return [code, message].filter(Boolean).join(': ');
        }).filter(Boolean).join(' | ');
    },

    /** Switches alias only after successful indexing when a provider is present. @param {Object} plan Plan. @param {Object} context Context. @param {Object} request Request. @returns {Promise<Object>} Alias result. */
    switchAlias: async function (plan, context, request) {
        if (plan.aliasSwitch === false) return { skipped: true, reason: 'DISABLED' };
        let service = SERVICE.DefaultDiscoveryIndexAliasService;
        if (!service || typeof service.switchAlias !== 'function') return { skipped: true, reason: 'ALIAS_PROVIDER_UNAVAILABLE',
            aliasName: plan.aliasName, indexVersion: context.indexVersion };
        return service.switchAlias({ tenant: context.tenant || request.tenant, authData: request.authData,
            aliasName: plan.aliasName, indexName: plan.indexName, indexVersion: context.indexVersion,
            rollbackEnabled: plan.rollbackEnabled !== false });
    },

    /** Creates a Nodics-compatible error. @param {string} code Error code. @param {string} message Error message. @returns {Error} Error. */
    error: function (code, message) {
        if (typeof CLASSES !== 'undefined' && CLASSES.NodicsError) return new CLASSES.NodicsError(code, message);
        let error = new Error(message || code);
        error.code = code;
        return error;
    }
};
