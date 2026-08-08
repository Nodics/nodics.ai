/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultPaymentMethodFacade
 * @description Generated facade for schema `paymentMethod` owned by module `payment`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner payment
 * @schema paymentMethod
 * @model PaymentMethodModel
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
        return SERVICE.DefaultPaymentMethodService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultPaymentMethodService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultPaymentMethodService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultPaymentMethodService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultPaymentMethodService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultPaymentMethodService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultPaymentMethodService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultPaymentMethodService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultPaymentMethodService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultPaymentMethodService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultPaymentMethodService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultPaymentMethodService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultPaymentMethodService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultPaymentMethodService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultPaymentMethodService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultPaymentMethodService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultPaymentMethodService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultPaymentMethodService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultPaymentMethodService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultPaymentMethodService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultPaymentMethodService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultPaymentMethodService.doIndexing(request);
    }
};