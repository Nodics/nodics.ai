/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultPriceFacade
 * @description Generated facade for schema `price` owned by module `pricing`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner pricing
 * @schema price
 * @model PriceModel
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
        return SERVICE.DefaultPriceService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultPriceService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultPriceService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultPriceService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultPriceService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultPriceService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultPriceService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultPriceService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultPriceService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultPriceService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultPriceService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultPriceService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultPriceService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultPriceService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultPriceService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultPriceService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultPriceService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultPriceService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultPriceService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultPriceService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultPriceService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultPriceService.doIndexing(request);
    }
};