/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultSerializedStockUnitFacade
 * @description Generated facade for schema `serializedStockUnit` owned by module `inventory`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner inventory
 * @schema serializedStockUnit
 * @model SerializedStockUnitModel
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
        return SERVICE.DefaultSerializedStockUnitService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultSerializedStockUnitService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultSerializedStockUnitService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultSerializedStockUnitService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultSerializedStockUnitService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultSerializedStockUnitService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultSerializedStockUnitService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultSerializedStockUnitService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultSerializedStockUnitService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultSerializedStockUnitService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultSerializedStockUnitService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultSerializedStockUnitService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultSerializedStockUnitService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultSerializedStockUnitService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultSerializedStockUnitService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultSerializedStockUnitService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultSerializedStockUnitService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultSerializedStockUnitService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultSerializedStockUnitService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultSerializedStockUnitService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultSerializedStockUnitService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultSerializedStockUnitService.doIndexing(request);
    }
};