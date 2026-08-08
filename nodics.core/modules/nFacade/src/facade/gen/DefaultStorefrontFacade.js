/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultStorefrontFacade
 * @description Generated facade for schema `storefront` owned by module `storefront`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner storefront
 * @schema storefront
 * @model StorefrontModel
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
        return SERVICE.DefaultStorefrontService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultStorefrontService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultStorefrontService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultStorefrontService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultStorefrontService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultStorefrontService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultStorefrontService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultStorefrontService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultStorefrontService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultStorefrontService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultStorefrontService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultStorefrontService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultStorefrontService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultStorefrontService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultStorefrontService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultStorefrontService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultStorefrontService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultStorefrontService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultStorefrontService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultStorefrontService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultStorefrontService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultStorefrontService.doIndexing(request);
    }
};