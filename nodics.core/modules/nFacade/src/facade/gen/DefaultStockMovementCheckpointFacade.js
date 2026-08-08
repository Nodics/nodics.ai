/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultStockMovementCheckpointFacade
 * @description Generated facade for schema `stockMovementCheckpoint` owned by module `inventory`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner inventory
 * @schema stockMovementCheckpoint
 * @model StockMovementCheckpointModel
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
        return SERVICE.DefaultStockMovementCheckpointService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultStockMovementCheckpointService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultStockMovementCheckpointService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultStockMovementCheckpointService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultStockMovementCheckpointService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultStockMovementCheckpointService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultStockMovementCheckpointService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultStockMovementCheckpointService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultStockMovementCheckpointService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultStockMovementCheckpointService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultStockMovementCheckpointService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultStockMovementCheckpointService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultStockMovementCheckpointService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultStockMovementCheckpointService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultStockMovementCheckpointService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultStockMovementCheckpointService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultStockMovementCheckpointService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultStockMovementCheckpointService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultStockMovementCheckpointService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultStockMovementCheckpointService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultStockMovementCheckpointService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultStockMovementCheckpointService.doIndexing(request);
    }
};