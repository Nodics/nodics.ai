/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultReturnReceiptFacade
 * @description Generated facade for schema `returnReceipt` owned by module `fulfillmentCore`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner fulfillmentCore
 * @schema returnReceipt
 * @model ReturnReceiptModel
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
        return SERVICE.DefaultReturnReceiptService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultReturnReceiptService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultReturnReceiptService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultReturnReceiptService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultReturnReceiptService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultReturnReceiptService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultReturnReceiptService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultReturnReceiptService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultReturnReceiptService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultReturnReceiptService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultReturnReceiptService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultReturnReceiptService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultReturnReceiptService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultReturnReceiptService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultReturnReceiptService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultReturnReceiptService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultReturnReceiptService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultReturnReceiptService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultReturnReceiptService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultReturnReceiptService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultReturnReceiptService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultReturnReceiptService.doIndexing(request);
    }
};