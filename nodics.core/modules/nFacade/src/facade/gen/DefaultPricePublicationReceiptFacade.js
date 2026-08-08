/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultPricePublicationReceiptFacade
 * @description Generated facade for schema `pricePublicationReceipt` owned by module `pricing`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner pricing
 * @schema pricePublicationReceipt
 * @model PricePublicationReceiptModel
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
        return SERVICE.DefaultPricePublicationReceiptService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultPricePublicationReceiptService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultPricePublicationReceiptService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultPricePublicationReceiptService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultPricePublicationReceiptService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultPricePublicationReceiptService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultPricePublicationReceiptService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultPricePublicationReceiptService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultPricePublicationReceiptService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultPricePublicationReceiptService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultPricePublicationReceiptService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultPricePublicationReceiptService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultPricePublicationReceiptService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultPricePublicationReceiptService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultPricePublicationReceiptService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultPricePublicationReceiptService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultPricePublicationReceiptService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultPricePublicationReceiptService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultPricePublicationReceiptService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultPricePublicationReceiptService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultPricePublicationReceiptService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultPricePublicationReceiptService.doIndexing(request);
    }
};