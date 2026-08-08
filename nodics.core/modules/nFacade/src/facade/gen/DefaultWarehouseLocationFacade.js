/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultWarehouseLocationFacade
 * @description Generated facade for schema `warehouseLocation` owned by module `inventory`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner inventory
 * @schema warehouseLocation
 * @model WarehouseLocationModel
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
        return SERVICE.DefaultWarehouseLocationService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultWarehouseLocationService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultWarehouseLocationService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultWarehouseLocationService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultWarehouseLocationService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultWarehouseLocationService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultWarehouseLocationService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultWarehouseLocationService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultWarehouseLocationService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultWarehouseLocationService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultWarehouseLocationService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultWarehouseLocationService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultWarehouseLocationService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultWarehouseLocationService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultWarehouseLocationService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultWarehouseLocationService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultWarehouseLocationService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultWarehouseLocationService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultWarehouseLocationService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultWarehouseLocationService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultWarehouseLocationService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultWarehouseLocationService.doIndexing(request);
    }
};