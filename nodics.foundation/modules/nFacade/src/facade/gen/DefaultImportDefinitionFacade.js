/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultImportDefinitionFacade
 * @description Generated facade for schema `importDefinition` owned by module `import`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner import
 * @schema importDefinition
 * @model ImportDefinitionModel
 * @sourceTemplate /src/facade/common.js
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
        return SERVICE.DefaultImportDefinitionService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultImportDefinitionService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultImportDefinitionService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultImportDefinitionService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultImportDefinitionService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultImportDefinitionService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultImportDefinitionService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultImportDefinitionService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultImportDefinitionService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultImportDefinitionService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultImportDefinitionService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultImportDefinitionService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultImportDefinitionService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultImportDefinitionService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultImportDefinitionService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultImportDefinitionService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultImportDefinitionService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultImportDefinitionService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultImportDefinitionService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultImportDefinitionService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultImportDefinitionService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultImportDefinitionService.doIndexing(request);
    }
};