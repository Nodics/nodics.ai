/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultCheckoutReverseRunFacade
 * @description Generated facade for schema `checkoutReverseRun` owned by module `order`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner order
 * @schema checkoutReverseRun
 * @model CheckoutReverseRunModel
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
        return SERVICE.DefaultCheckoutReverseRunService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultCheckoutReverseRunService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultCheckoutReverseRunService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultCheckoutReverseRunService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultCheckoutReverseRunService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultCheckoutReverseRunService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultCheckoutReverseRunService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultCheckoutReverseRunService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultCheckoutReverseRunService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultCheckoutReverseRunService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultCheckoutReverseRunService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultCheckoutReverseRunService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultCheckoutReverseRunService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultCheckoutReverseRunService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultCheckoutReverseRunService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultCheckoutReverseRunService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultCheckoutReverseRunService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultCheckoutReverseRunService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultCheckoutReverseRunService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultCheckoutReverseRunService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultCheckoutReverseRunService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultCheckoutReverseRunService.doIndexing(request);
    }
};