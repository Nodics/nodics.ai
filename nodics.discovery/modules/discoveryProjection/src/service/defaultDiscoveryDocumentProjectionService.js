/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module discoveryProjection/service/defaultDiscoveryDocumentProjectionService
 * @description Stable Discovery projection service facade for runtime-created and search-backed document projections.
 * @layer service
 * @owner discoveryProjection
 * @override Projects may replace projection persistence/search behavior while preserving doSave/doSearch request semantics.
 */
module.exports = {
    /**
     * Resolves the nSearch model for the Discovery document projection index.
     *
     * @param {Object} request Search request.
     * @returns {Object} Search model.
     */
    getSearchModel: function (request) {
        let moduleName = request.moduleName || 'discoveryProjection';
        let models = NODICS.getModels(moduleName, request.tenant) || {};
        request.schemaModel = models.DiscoveryDocumentProjectionModel;
        request.moduleName = moduleName;
        request.indexName = request.indexName ? request.indexName : request.schemaModel && request.schemaModel.indexName;
        if (!request.tenant || !request.indexName) {
            throw new CLASSES.SearchError('ERR_SRCH_00003', 'Invalid Discovery projection request or search is not active');
        }
        return NODICS.getSearchModel(moduleName, request.tenant, request.indexName);
    },

    /**
     * Persists Discovery projection documents into the configured search index.
     *
     * @param {Object} request Save request.
     * @returns {Promise<Object>} Save result.
     */
    doSave: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doSaveModelsInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject(new CLASSES.SearchError(error));
        }
    },

    /**
     * Searches Discovery projection documents from the configured search index.
     *
     * @param {Object} request Search request.
     * @returns {Promise<Object>} Search result.
     */
    doSearch: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doSearchModelInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject(new CLASSES.SearchError(error));
        }
    }
};
