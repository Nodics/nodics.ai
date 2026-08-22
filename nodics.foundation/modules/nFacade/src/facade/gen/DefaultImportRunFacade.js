/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultImportRunFacade
 * @description Generated facade for schema `importRun` owned by module `import`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner import
 * @schema importRun
 * @model ImportRunModel
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
        return SERVICE.DefaultImportRunService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultImportRunService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultImportRunService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultImportRunService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultImportRunService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultImportRunService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultImportRunService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultImportRunService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultImportRunService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultImportRunService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultImportRunService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultImportRunService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultImportRunService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultImportRunService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultImportRunService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultImportRunService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultImportRunService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultImportRunService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultImportRunService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultImportRunService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultImportRunService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultImportRunService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultImportRunService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultImportRunService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultImportRunService.doIndexing(request);
    }
};