/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultStockAllocationFacade
 * @description Generated facade for schema `stockAllocation` owned by module `inventory`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner inventory
 * @schema stockAllocation
 * @model StockAllocationModel
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
        return SERVICE.DefaultStockAllocationService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultStockAllocationService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultStockAllocationService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultStockAllocationService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultStockAllocationService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultStockAllocationService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultStockAllocationService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultStockAllocationService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultStockAllocationService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultStockAllocationService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultStockAllocationService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultStockAllocationService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultStockAllocationService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultStockAllocationService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultStockAllocationService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultStockAllocationService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultStockAllocationService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultStockAllocationService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultStockAllocationService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultStockAllocationService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultStockAllocationService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultStockAllocationService.doIndexing(request);
    }
};