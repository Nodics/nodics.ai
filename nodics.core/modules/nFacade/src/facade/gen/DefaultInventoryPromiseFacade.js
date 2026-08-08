/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultInventoryPromiseFacade
 * @description Generated facade for schema `inventoryPromise` owned by module `inventory`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner inventory
 * @schema inventoryPromise
 * @model InventoryPromiseModel
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
        return SERVICE.DefaultInventoryPromiseService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultInventoryPromiseService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultInventoryPromiseService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultInventoryPromiseService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultInventoryPromiseService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultInventoryPromiseService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultInventoryPromiseService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultInventoryPromiseService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultInventoryPromiseService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultInventoryPromiseService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultInventoryPromiseService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultInventoryPromiseService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultInventoryPromiseService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultInventoryPromiseService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultInventoryPromiseService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultInventoryPromiseService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultInventoryPromiseService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultInventoryPromiseService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultInventoryPromiseService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultInventoryPromiseService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultInventoryPromiseService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultInventoryPromiseService.doIndexing(request);
    }
};