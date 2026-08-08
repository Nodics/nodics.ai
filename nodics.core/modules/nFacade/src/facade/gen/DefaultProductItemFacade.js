/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultProductItemFacade
 * @description Generated facade for schema `productItem` owned by module `product`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner product
 * @schema productItem
 * @model ProductItemModel
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
        return SERVICE.DefaultProductItemService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultProductItemService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultProductItemService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultProductItemService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultProductItemService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultProductItemService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultProductItemService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultProductItemService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultProductItemService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultProductItemService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultProductItemService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultProductItemService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultProductItemService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultProductItemService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultProductItemService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultProductItemService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultProductItemService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultProductItemService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultProductItemService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultProductItemService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultProductItemService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultProductItemService.doIndexing(request);
    }
};