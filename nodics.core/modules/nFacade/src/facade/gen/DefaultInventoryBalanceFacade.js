/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultInventoryBalanceFacade
 * @description Generated facade for schema `inventoryBalance` owned by module `inventory`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner inventory
 * @schema inventoryBalance
 * @model InventoryBalanceModel
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
        return SERVICE.DefaultInventoryBalanceService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultInventoryBalanceService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultInventoryBalanceService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultInventoryBalanceService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultInventoryBalanceService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultInventoryBalanceService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultInventoryBalanceService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultInventoryBalanceService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultInventoryBalanceService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultInventoryBalanceService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultInventoryBalanceService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultInventoryBalanceService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultInventoryBalanceService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultInventoryBalanceService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultInventoryBalanceService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultInventoryBalanceService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultInventoryBalanceService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultInventoryBalanceService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultInventoryBalanceService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultInventoryBalanceService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultInventoryBalanceService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultInventoryBalanceService.doIndexing(request);
    }
};