/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultOrderPaymentAllocationFacade
 * @description Generated facade for schema `orderPaymentAllocation` owned by module `order`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner order
 * @schema orderPaymentAllocation
 * @model OrderPaymentAllocationModel
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
        return SERVICE.DefaultOrderPaymentAllocationService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultOrderPaymentAllocationService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultOrderPaymentAllocationService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultOrderPaymentAllocationService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultOrderPaymentAllocationService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultOrderPaymentAllocationService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultOrderPaymentAllocationService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultOrderPaymentAllocationService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultOrderPaymentAllocationService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultOrderPaymentAllocationService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultOrderPaymentAllocationService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultOrderPaymentAllocationService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultOrderPaymentAllocationService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultOrderPaymentAllocationService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultOrderPaymentAllocationService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultOrderPaymentAllocationService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultOrderPaymentAllocationService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultOrderPaymentAllocationService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultOrderPaymentAllocationService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultOrderPaymentAllocationService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultOrderPaymentAllocationService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultOrderPaymentAllocationService.doIndexing(request);
    }
};