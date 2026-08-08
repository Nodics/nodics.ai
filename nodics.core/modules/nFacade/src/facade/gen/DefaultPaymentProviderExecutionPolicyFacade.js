/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultPaymentProviderExecutionPolicyFacade
 * @description Generated facade for schema `paymentProviderExecutionPolicy` owned by module `payment`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner payment
 * @schema paymentProviderExecutionPolicy
 * @model PaymentProviderExecutionPolicyModel
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
        return SERVICE.DefaultPaymentProviderExecutionPolicyService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultPaymentProviderExecutionPolicyService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultPaymentProviderExecutionPolicyService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultPaymentProviderExecutionPolicyService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultPaymentProviderExecutionPolicyService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultPaymentProviderExecutionPolicyService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultPaymentProviderExecutionPolicyService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultPaymentProviderExecutionPolicyService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultPaymentProviderExecutionPolicyService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultPaymentProviderExecutionPolicyService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultPaymentProviderExecutionPolicyService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultPaymentProviderExecutionPolicyService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultPaymentProviderExecutionPolicyService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultPaymentProviderExecutionPolicyService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultPaymentProviderExecutionPolicyService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultPaymentProviderExecutionPolicyService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultPaymentProviderExecutionPolicyService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultPaymentProviderExecutionPolicyService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultPaymentProviderExecutionPolicyService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultPaymentProviderExecutionPolicyService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultPaymentProviderExecutionPolicyService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultPaymentProviderExecutionPolicyService.doIndexing(request);
    }
};