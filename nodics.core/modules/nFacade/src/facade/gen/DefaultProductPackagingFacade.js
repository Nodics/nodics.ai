/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultProductPackagingFacade
 * @description Generated facade for schema `productPackaging` owned by module `product`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner product
 * @schema productPackaging
 * @model ProductPackagingModel
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
        return SERVICE.DefaultProductPackagingService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultProductPackagingService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultProductPackagingService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultProductPackagingService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultProductPackagingService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultProductPackagingService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultProductPackagingService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultProductPackagingService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultProductPackagingService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultProductPackagingService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultProductPackagingService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultProductPackagingService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultProductPackagingService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultProductPackagingService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultProductPackagingService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultProductPackagingService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultProductPackagingService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultProductPackagingService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultProductPackagingService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultProductPackagingService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultProductPackagingService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultProductPackagingService.doIndexing(request);
    }
};