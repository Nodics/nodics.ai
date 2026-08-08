/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultProductPublicationReceiptFacade
 * @description Generated facade for schema `productPublicationReceipt` owned by module `product`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner product
 * @schema productPublicationReceipt
 * @model ProductPublicationReceiptModel
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
        return SERVICE.DefaultProductPublicationReceiptService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultProductPublicationReceiptService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultProductPublicationReceiptService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultProductPublicationReceiptService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultProductPublicationReceiptService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultProductPublicationReceiptService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultProductPublicationReceiptService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultProductPublicationReceiptService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultProductPublicationReceiptService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultProductPublicationReceiptService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultProductPublicationReceiptService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultProductPublicationReceiptService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultProductPublicationReceiptService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultProductPublicationReceiptService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultProductPublicationReceiptService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultProductPublicationReceiptService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultProductPublicationReceiptService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultProductPublicationReceiptService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultProductPublicationReceiptService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultProductPublicationReceiptService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultProductPublicationReceiptService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultProductPublicationReceiptService.doIndexing(request);
    }
};