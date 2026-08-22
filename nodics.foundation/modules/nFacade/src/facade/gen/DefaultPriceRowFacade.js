/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultPriceRowFacade
 * @description Generated facade for schema `priceRow` owned by module `pricing`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner pricing
 * @schema priceRow
 * @model PriceRowModel
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
        return SERVICE.DefaultPriceRowService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultPriceRowService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultPriceRowService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultPriceRowService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultPriceRowService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultPriceRowService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultPriceRowService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultPriceRowService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultPriceRowService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultPriceRowService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultPriceRowService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultPriceRowService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultPriceRowService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultPriceRowService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultPriceRowService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultPriceRowService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultPriceRowService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultPriceRowService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultPriceRowService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultPriceRowService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultPriceRowService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultPriceRowService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultPriceRowService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultPriceRowService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultPriceRowService.doIndexing(request);
    }
};