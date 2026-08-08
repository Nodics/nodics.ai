/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultStockProviderOperationFacade
 * @description Generated facade for schema `stockProviderOperation` owned by module `inventory`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner inventory
 * @schema stockProviderOperation
 * @model StockProviderOperationModel
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
        return SERVICE.DefaultStockProviderOperationService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultStockProviderOperationService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultStockProviderOperationService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultStockProviderOperationService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultStockProviderOperationService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultStockProviderOperationService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultStockProviderOperationService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultStockProviderOperationService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultStockProviderOperationService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultStockProviderOperationService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultStockProviderOperationService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultStockProviderOperationService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultStockProviderOperationService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultStockProviderOperationService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultStockProviderOperationService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultStockProviderOperationService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultStockProviderOperationService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultStockProviderOperationService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultStockProviderOperationService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultStockProviderOperationService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultStockProviderOperationService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultStockProviderOperationService.doIndexing(request);
    }
};