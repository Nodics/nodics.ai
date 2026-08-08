/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultStockTransferFacade
 * @description Generated facade for schema `stockTransfer` owned by module `inventory`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner inventory
 * @schema stockTransfer
 * @model StockTransferModel
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
        return SERVICE.DefaultStockTransferService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultStockTransferService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultStockTransferService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultStockTransferService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultStockTransferService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultStockTransferService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultStockTransferService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultStockTransferService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultStockTransferService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultStockTransferService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultStockTransferService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultStockTransferService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultStockTransferService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultStockTransferService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultStockTransferService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultStockTransferService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultStockTransferService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultStockTransferService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultStockTransferService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultStockTransferService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultStockTransferService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultStockTransferService.doIndexing(request);
    }
};