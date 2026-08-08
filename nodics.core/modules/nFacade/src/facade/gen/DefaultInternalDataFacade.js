/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultInternalDataFacade
 * @description Generated facade for schema `internalData` owned by module `dataConsumer`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner dataConsumer
 * @schema internalData
 * @model InternalDataModel
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
        return SERVICE.DefaultInternalDataService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultInternalDataService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultInternalDataService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultInternalDataService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultInternalDataService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultInternalDataService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultInternalDataService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultInternalDataService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultInternalDataService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultInternalDataService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultInternalDataService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultInternalDataService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultInternalDataService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultInternalDataService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultInternalDataService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultInternalDataService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultInternalDataService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultInternalDataService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultInternalDataService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultInternalDataService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultInternalDataService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultInternalDataService.doIndexing(request);
    }
};