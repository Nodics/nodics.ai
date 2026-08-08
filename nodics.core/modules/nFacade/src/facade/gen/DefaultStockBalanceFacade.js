/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultStockBalanceFacade
 * @description Generated facade for schema `stockBalance` owned by module `inventory`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner inventory
 * @schema stockBalance
 * @model StockBalanceModel
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
        return SERVICE.DefaultStockBalanceService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultStockBalanceService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultStockBalanceService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultStockBalanceService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultStockBalanceService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultStockBalanceService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultStockBalanceService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultStockBalanceService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultStockBalanceService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultStockBalanceService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultStockBalanceService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultStockBalanceService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultStockBalanceService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultStockBalanceService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultStockBalanceService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultStockBalanceService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultStockBalanceService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultStockBalanceService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultStockBalanceService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultStockBalanceService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultStockBalanceService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultStockBalanceService.doIndexing(request);
    }
};