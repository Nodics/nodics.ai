/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/service/DefaultNotifyDeliveryPolicyService
 * @description Generated service for schema `notifyDeliveryPolicy` owned by module `notifySchema`. This file is recreated by clean/build from the effective schema and common service template.
 * @layer service
 * @owner notifySchema
 * @schema notifyDeliveryPolicy
 * @model NotifyDeliveryPolicyModel
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
        let moduleName = request.moduleName || 'notifySchema';
        request.schemaModel = NODICS.getModels(moduleName, request.tenant).NotifyDeliveryPolicyModel;
        request.moduleName = moduleName;
        return SERVICE.DefaultPipelineService.start('modelsGetInitializerPipeline', request, {});
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
        let moduleName = request.moduleName || 'notifySchema';
        request.schemaModel = NODICS.getModels(moduleName, request.tenant).NotifyDeliveryPolicyModel;
        request.moduleName = moduleName;
        return SERVICE.DefaultPipelineService.start('modelSaveInitializerPipeline', request, {});
    },
    saveAll: function (request) {
        let moduleName = request.moduleName || 'notifySchema';
        request.schemaModel = NODICS.getModels(moduleName, request.tenant).NotifyDeliveryPolicyModel;
        request.moduleName = moduleName;
        return SERVICE.DefaultPipelineService.start('modelsSaveInitializerPipeline', request, {});
    },
    remove: function (request) {
        let moduleName = request.moduleName || 'notifySchema';
        request.schemaModel = NODICS.getModels(moduleName, request.tenant).NotifyDeliveryPolicyModel;
        request.moduleName = moduleName;
        return SERVICE.DefaultPipelineService.start('modelsRemoveInitializerPipeline', request, {});
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
        let moduleName = request.moduleName || 'notifySchema';
        request.schemaModel = NODICS.getModels(moduleName, request.tenant).NotifyDeliveryPolicyModel;
        request.moduleName = moduleName;
        return SERVICE.DefaultPipelineService.start('modelsUpdateInitializerPipeline', request, {});
    },
    getSearchModel: function (request) {
        let moduleName = request.moduleName || 'notifySchema';
        request.schemaModel = NODICS.getModels(moduleName, request.tenant).NotifyDeliveryPolicyModel;
        request.moduleName = moduleName;
        request.indexName = request.indexName ? request.indexName : request.schemaModel.indexName;
        if (!request.tenant || !request.indexName) {
            throw new CLASSES.SearchError('ERR_SRCH_00003', 'Invalid request or search is not active for this type');
        } else {
            return NODICS.getSearchModel(moduleName, request.tenant, request.indexName);
        }
    },
    doRefresh: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doRefreshIndexInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject(new CLASSES.SearchError(error));
        }
    },
    doCheckHealth: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doHealthCheckClusterInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject(new CLASSES.SearchError(error));
        }
    },
    doExists: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doExistModelInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject(new CLASSES.SearchError(error));
        }
    },
    doGet: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doGetModelsInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject(new CLASSES.SearchError(error));
        }
    },
    doSearch: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doSearchModelInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject(new CLASSES.SearchError(error));
        }
    },
    doSave: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doSaveModelsInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject(new CLASSES.SearchError(error));
        }
    },
    doBulk: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doBulkModelInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject(new CLASSES.SearchError(error));
        }
    },
    doRemove: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doRemoveModelsInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject(new CLASSES.SearchError(error));
        }
    },
    doRemoveByQuery: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doRemoveModelsByQueryInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject(new CLASSES.SearchError(error));
        }
    },
    doGetSchema: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doGetSchemaModelInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject(new CLASSES.SearchError(error));
        }
    },
    doUpdateSchema: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doUpdateSchemaModelInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject(new CLASSES.SearchError(error));
        }
    },
    doRemoveIndex: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultPipelineService.start('doRemoveIndexInitializerPipeline', request, {});
        } catch (error) {
            return Promise.reject(new CLASSES.SearchError(error));
        }
    },
    doIndexing: function (request) {
        try {
            request.searchModel = this.getSearchModel(request);
            return SERVICE.DefaultIndexerService.prepareIndexer(request);
        } catch (error) {
            return Promise.reject(new CLASSES.SearchError(error));
        }
    }
};