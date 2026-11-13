/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module wcmsExperience/service/defaultWcmsExperienceProjectionService
 * @description Projection seam for locating indexed WCMS Experience placements.
 * @layer service
 * @owner wcmsExperience
 * @override Provider/project modules may replace this seam with Discovery/Elasticsearch-backed lookup.
 */
module.exports = {
    /** Finds candidate placements for resolver context. @param {Object} context Resolver context. @returns {Promise<Array<Object>>} Candidate placements. */
    findPlacements: async function (context) {
        const preview = this.config().stagedPreview;
        if (context.previewMode === true && preview) {
            if (preview.enabled !== true || !SERVICE.DefaultWcmsExperiencePreviewPreparationService) throw this.unavailable();
            return SERVICE.DefaultWcmsExperiencePreviewPreparationService.readPrepared(context.sourceRequest, context);
        }
        if (context.previewMode !== true && SERVICE.DefaultWcmsExperienceOnlinePublicationService)
            return SERVICE.DefaultWcmsExperienceOnlinePublicationService.read(context).catch(() => { throw this.unavailable(); });
        if (!this.shouldUseDiscovery()) throw this.unavailable();
        try {
            return await this.findDiscoveryPlacements(context);
        } catch (error) {
            // Provider details stay with the owner. Never turn a failed read into
            // an empty match or serve authored fixtures as indexed content.
            throw this.unavailable();
        }
    },

    /** Returns WCMS Experience configuration. @returns {Object} Configuration. */
    config: function () {
        return typeof CONFIG !== 'undefined' && CONFIG.get ? (CONFIG.get('wcmsExperience') || {}) : {};
    },

    /** Returns projection configuration. @returns {Object} Projection configuration. */
    projectionConfig: function () {
        return this.config().projection || {};
    },

    /** Determines whether the Discovery runtime adapter should be used. @returns {boolean} Discovery adapter state. */
    shouldUseDiscovery: function () {
        let projection = this.projectionConfig();
        return projection.provider !== 'FIXTURE' &&
            typeof SERVICE !== 'undefined' &&
            SERVICE.DefaultDiscoveryRuntimeService &&
            typeof SERVICE.DefaultDiscoveryRuntimeService.search === 'function';
    },

    /** Creates a client-safe owner error without provider internals. @returns {Error} Unavailable error. */
    unavailable: function () {
        return SERVICE.DefaultWcmsExperienceResolverService.error('ERR_WCMS_EXPERIENCE_INDEX_SERVICE_UNAVAILABLE');
    },

    /** Finds placements through the generic Discovery runtime service. @param {Object} context Resolver context. @returns {Promise<Array<Object>>} Placements. */
    findDiscoveryPlacements: async function (context) {
        let projection = this.projectionConfig();
        let records = await SERVICE.DefaultDiscoveryRuntimeService.search({
            tenant: context.tenant,
            authData: context.authData,
            targetAuthority: {publication: context.previewMode === true ? 'STAGED' : 'ONLINE'},
            ownerType: projection.ownerType || 'WCMS_EXPERIENCE',
            indexConfiguration: {
                code: projection.indexConfigurationCode || 'cmsExperiencePlacement',
                indexName: projection.indexName || 'discoveryDocumentProjection'
            },
            indexConfigurationCode: projection.indexConfigurationCode || 'cmsExperiencePlacement',
            query: this.discoveryQuery(context),
            searchOptions: this.discoverySearchOptions(context)
        });
        return this.normalizeDiscoveryRecords(records);
    },

    /** Builds a narrow Discovery query for placement resolution. @param {Object} context Resolver context. @returns {Object} Query. */
    discoveryQuery: function (context) {
        let projection = this.projectionConfig();
        let query = {
            ownerType: projection.ownerType || 'WCMS_EXPERIENCE',
            indexConfigurationCode: projection.indexConfigurationCode || 'cmsExperiencePlacement',
            status: projection.status || 'CURRENT',
            site: context.site,
            pageType: context.pageType,
            targetType: [context.targetType, (this.config().resolver || {}).fallbackTargetType || 'DEFAULT'],
            targetCode: [context.targetCode, (this.config().resolver || {}).fallbackTargetCode || '*'],
            locale: context.locale,
            channel: context.channel
        };
        if (context.region) query.region = context.region;
        if (context.device && context.deviceAuthored === true) query.device = context.device;
        return query;
    },

    /** Builds bounded Discovery search options for placement resolution. @returns {Object} Search options. */
    discoverySearchOptions: function () {
        let resolver = this.config().resolver || {};
        return {
            pageSize: Number(resolver.maxComponents || 200),
            pageNumber: 1,
            sort: [
                { specificity: 'desc' },
                { priority: 'desc' },
                { updatedAt: 'desc' },
                { code: 'asc' }
            ]
        };
    },

    /** Converts Discovery documents into placement payloads. @param {Array<Object>} records Discovery records. @returns {Array<Object>} Placements. */
    normalizeDiscoveryRecords: function (records) {
        if (!Array.isArray(records)) throw this.unavailable();
        return records.map(record => record && record.payload ? record.payload : record).filter(Boolean);
    }
};
