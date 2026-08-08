/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultPriceOnlinePointerFacade
 * @description Generated facade for schema `priceOnlinePointer` owned by module `pricing`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner pricing
 * @schema priceOnlinePointer
 * @model PriceOnlinePointerModel
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
        return SERVICE.DefaultPriceOnlinePointerService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultPriceOnlinePointerService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultPriceOnlinePointerService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultPriceOnlinePointerService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultPriceOnlinePointerService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultPriceOnlinePointerService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultPriceOnlinePointerService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultPriceOnlinePointerService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultPriceOnlinePointerService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultPriceOnlinePointerService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultPriceOnlinePointerService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultPriceOnlinePointerService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultPriceOnlinePointerService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultPriceOnlinePointerService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultPriceOnlinePointerService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultPriceOnlinePointerService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultPriceOnlinePointerService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultPriceOnlinePointerService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultPriceOnlinePointerService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultPriceOnlinePointerService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultPriceOnlinePointerService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultPriceOnlinePointerService.doIndexing(request);
    }
};