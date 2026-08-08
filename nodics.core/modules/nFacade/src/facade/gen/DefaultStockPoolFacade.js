/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultStockPoolFacade
 * @description Generated facade for schema `stockPool` owned by module `inventory`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner inventory
 * @schema stockPool
 * @model StockPoolModel
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
        return SERVICE.DefaultStockPoolService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultStockPoolService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultStockPoolService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultStockPoolService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultStockPoolService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultStockPoolService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultStockPoolService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultStockPoolService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultStockPoolService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultStockPoolService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultStockPoolService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultStockPoolService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultStockPoolService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultStockPoolService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultStockPoolService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultStockPoolService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultStockPoolService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultStockPoolService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultStockPoolService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultStockPoolService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultStockPoolService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultStockPoolService.doIndexing(request);
    }
};