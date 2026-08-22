/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultStoreFacade
 * @description Generated facade for schema `store` owned by module `store`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner store
 * @schema store
 * @model StoreModel
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
        return SERVICE.DefaultStoreService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultStoreService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultStoreService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultStoreService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultStoreService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultStoreService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultStoreService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultStoreService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultStoreService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultStoreService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultStoreService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultStoreService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultStoreService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultStoreService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultStoreService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultStoreService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultStoreService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultStoreService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultStoreService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultStoreService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultStoreService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultStoreService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultStoreService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultStoreService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultStoreService.doIndexing(request);
    }
};