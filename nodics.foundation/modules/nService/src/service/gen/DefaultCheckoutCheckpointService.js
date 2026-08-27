/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/service/DefaultCheckoutCheckpointService
 * @description Generated service for schema `checkoutCheckpoint` owned by module `checkoutCore`. This file is recreated by clean/build from the effective schema and common service template.
 * @layer service
 * @owner checkoutCore
 * @schema checkoutCheckpoint
 * @model CheckoutCheckpointModel
 * @sourceTemplate /src/service/common.js
 * @override Do not edit generated files directly. Customize behavior by adding a later module in the hierarchy that overrides this generated artifact or its source template contract.
 */
module.exports = {
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },
    get: function (request) {
        let moduleName = request.moduleName || 'checkoutCore';
        request.schemaModel = NODICS.getModels(moduleName, request.tenant).CheckoutCheckpointModel;
        request.moduleName = moduleName;
        return SERVICE.DefaultPipelineService.start('modelsGetInitializerPipeline', request, {});
    },
    safeSearch: function (request) {
        let moduleName = request.moduleName || 'checkoutCore';
        request.schemaModel = NODICS.getModels(moduleName, request.tenant).CheckoutCheckpointModel;
        request.moduleName = moduleName;
        request.schemaName = request.schemaName || 'checkoutCheckpoint';
        request.generatedServiceName = 'DefaultCheckoutCheckpointService';
        if (!SERVICE.DefaultSchemaSafeQueryService || typeof SERVICE.DefaultSchemaSafeQueryService.searchGenerated !== 'function') {
            return Promise.reject(new CLASSES.NodicsError('ERR_DBS_00004', 'Generated safe search service is not available'));
        }
        return SERVICE.DefaultSchemaSafeQueryService.searchGenerated(request);
    },
    capabilities: function (request) {
        let moduleName = request.moduleName || 'checkoutCore';
        request.schemaModel = NODICS.getModels(moduleName, request.tenant).CheckoutCheckpointModel;
        request.moduleName = moduleName;
        request.schemaName = request.schemaName || 'checkoutCheckpoint';
        if (!SERVICE.DefaultSchemaUtilityService || typeof SERVICE.DefaultSchemaUtilityService.capabilitiesGenerated !== 'function') {
            return Promise.reject(new CLASSES.NodicsError('ERR_DBS_00004', 'Generated schema utility service is not available'));
        }
        return SERVICE.DefaultSchemaUtilityService.capabilitiesGenerated(request);
    },
    getById: function (id, tenant) {
        return this.get({
            tenant: tenant,
            query: {
                _id: id
            }
        });
    },
    getByCode: function (code, tenant) {
        return this.get({
            tenant: tenant,
            query: {
                code: code
            }
        });
    },
    save: function (request) {
        let moduleName = request.moduleName || 'checkoutCore';
        request.schemaModel = NODICS.getModels(moduleName, request.tenant).CheckoutCheckpointModel;
        request.moduleName = moduleName;
        return SERVICE.DefaultPipelineService.start('modelSaveInitializerPipeline', request, {});
    },
    saveAll: function (request) {
        let moduleName = request.moduleName || 'checkoutCore';
        request.schemaModel = NODICS.getModels(moduleName, request.tenant).CheckoutCheckpointModel;
        request.moduleName = moduleName;
        return SERVICE.DefaultPipelineService.start('modelsSaveInitializerPipeline', request, {});
    },
    remove: function (request) {
        let moduleName = request.moduleName || 'checkoutCore';
        let models = NODICS.getModels(moduleName, request.tenant) || {};
        request.schemaModel = models.CheckoutCheckpointModel;
        request.moduleName = moduleName;
        if (!request.schemaModel && SERVICE.DefaultLocalResetProviderService &&
            SERVICE.DefaultLocalResetProviderService.authorizes(request)) {
            let error = new Error('Local reset skipped unavailable generated schema model: ' + moduleName + '.CheckoutCheckpointModel');
            error.code = 'LOCAL_RESET_MODEL_REGISTRY_MISSING';
            error.localResetMissingModel = true;
            return Promise.reject(error);
        }
        return SERVICE.DefaultPipelineService.start('modelsRemoveInitializerPipeline', request, {});
    },
    deleteImpact: function (request) {
        let moduleName = request.moduleName || 'checkoutCore';
        request.schemaModel = NODICS.getModels(moduleName, request.tenant).CheckoutCheckpointModel;
        request.moduleName = moduleName;
        request.schemaName = request.schemaName || 'checkoutCheckpoint';
        if (!SERVICE.DefaultSchemaUtilityService || typeof SERVICE.DefaultSchemaUtilityService.deleteImpactGenerated !== 'function') {
            return Promise.reject(new CLASSES.NodicsError('ERR_DBS_00004', 'Generated schema utility service is not available'));
        }
        return SERVICE.DefaultSchemaUtilityService.deleteImpactGenerated(request);
    },
    removeById: function (ids, tenant) {
        return this.remove({
            tenant: tenant,
            ids: ids
        });
    },
    removeByCode: function (codes, tenant) {
        return this.remove({
            tenant: tenant,
            codes: codes
        });
    },
    update: function (request) {
        let moduleName = request.moduleName || 'checkoutCore';
        request.schemaModel = NODICS.getModels(moduleName, request.tenant).CheckoutCheckpointModel;
        request.moduleName = moduleName;
        return SERVICE.DefaultPipelineService.start('modelsUpdateInitializerPipeline', request, {});
    }
};