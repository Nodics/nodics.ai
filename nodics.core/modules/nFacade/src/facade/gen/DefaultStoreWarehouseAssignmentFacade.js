/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultStoreWarehouseAssignmentFacade
 * @description Generated facade for schema `storeWarehouseAssignment` owned by module `store`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner store
 * @schema storeWarehouseAssignment
 * @model StoreWarehouseAssignmentModel
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
        return SERVICE.DefaultStoreWarehouseAssignmentService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultStoreWarehouseAssignmentService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultStoreWarehouseAssignmentService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultStoreWarehouseAssignmentService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultStoreWarehouseAssignmentService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultStoreWarehouseAssignmentService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultStoreWarehouseAssignmentService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultStoreWarehouseAssignmentService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultStoreWarehouseAssignmentService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultStoreWarehouseAssignmentService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultStoreWarehouseAssignmentService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultStoreWarehouseAssignmentService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultStoreWarehouseAssignmentService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultStoreWarehouseAssignmentService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultStoreWarehouseAssignmentService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultStoreWarehouseAssignmentService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultStoreWarehouseAssignmentService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultStoreWarehouseAssignmentService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultStoreWarehouseAssignmentService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultStoreWarehouseAssignmentService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultStoreWarehouseAssignmentService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultStoreWarehouseAssignmentService.doIndexing(request);
    }
};