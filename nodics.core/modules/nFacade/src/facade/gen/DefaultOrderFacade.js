/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultOrderFacade
 * @description Generated facade for schema `order` owned by module `order`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner order
 * @schema order
 * @model OrderModel
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
        return SERVICE.DefaultOrderService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultOrderService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultOrderService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultOrderService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultOrderService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultOrderService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultOrderService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultOrderService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultOrderService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultOrderService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultOrderService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultOrderService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultOrderService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultOrderService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultOrderService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultOrderService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultOrderService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultOrderService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultOrderService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultOrderService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultOrderService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultOrderService.doIndexing(request);
    }
};