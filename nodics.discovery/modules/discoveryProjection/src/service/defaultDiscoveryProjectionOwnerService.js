/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module discoveryProjection/service/defaultDiscoveryProjectionOwnerService
 * @description Local projection execution through existing nSearch pipelines; callable only on the qualified owner.
 * @layer service
 * @owner discoveryProjection
 * @override Projects may replace projection persistence/search behavior while preserving doSave/doSearch request semantics.
 */
module.exports = {
    /** Returns an opaque identity for the actual local provider object, never its methods or credentials.
     * @param {Object} request Trusted tenant/logical index.
     * @returns {Object} Physical name and opaque binding identity.
     * @throws {Error} Nonowner or unavailable binding.
     */
    doDescribeIndex: function(request) {
        const model=this.getSearchModel(request);
        if(!model?.indexDef?.indexName)throw new Error('Discovery model binding unavailable');
        this._bindingIds=this._bindingIds||new WeakMap();
        if(!this._bindingIds.has(model))this._bindingIds.set(model,require('node:crypto').randomUUID());
        const current=SERVICE.DefaultModuleService.getCurrentRuntimeAuthority();
        const targetAuthority=SERVICE.DefaultModuleService.normalizeTargetAuthority({publication:current.runtimeRole?.publication,
            ...Object.fromEntries(['environment','server','node'].filter(key=>current[key]!==undefined).map(key=>[key,current[key]]))});
        return {indexName:model.indexDef.indexName,bindingId:this._bindingIds.get(model),targetAuthority};
    },
    /** Refreshes search visibility through the existing nSearch pipeline. @param {Object} request Trusted projection request. @returns {Promise<Object>} Provider acknowledgement. */
    doRefresh: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doRefreshIndexInitializerPipeline', request, {});
        } catch (error) { return Promise.reject(new CLASSES.SearchError(error)); }
    },
    /** Removes an owner-qualified derived projection query through nSearch. @param {Object} request Trusted bounded removal request. @returns {Promise<Object>} Provider acknowledgement. */
    doRemoveByQuery: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doRemoveModelsByQueryInitializerPipeline', request, {});
        } catch (error) { return Promise.reject(new CLASSES.SearchError(error)); }
    },
    /**
     * Resolves the nSearch model for the Discovery document projection index.
     *
     * @param {Object} request Search request.
     * @returns {Object} Search model.
     * @throws {Error} When called on a nonowner or with an invalid module/index.
     */
    getSearchModel: function (request) {
        const dms = SERVICE.DefaultModuleService;
        const authority = SERVICE.DefaultDiscoveryDocumentProjectionService.targetAuthority();
        if (!dms.isLocalModuleActive('discoveryProjection') || !dms.isCurrentRuntimeAuthority(authority)) {
            throw new Error('Discovery projection owner is unavailable');
        }
        if (request.moduleName && request.moduleName !== 'discoveryProjection') throw new Error('Invalid Discovery projection module');
        let moduleName = 'discoveryProjection';
        let models = NODICS.getModels(moduleName, request.tenant) || {};
        request.schemaModel = models.DiscoveryDocumentProjectionModel;
        request.moduleName = moduleName;
        request.indexName = request.indexName ? request.indexName : request.schemaModel && (request.schemaModel.typeName || request.schemaModel.indexName);
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
