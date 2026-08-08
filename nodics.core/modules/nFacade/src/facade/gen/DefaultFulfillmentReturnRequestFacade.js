/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultFulfillmentReturnRequestFacade
 * @description Generated facade for schema `fulfillmentReturnRequest` owned by module `fulfillment`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner fulfillment
 * @schema fulfillmentReturnRequest
 * @model FulfillmentReturnRequestModel
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
        return SERVICE.DefaultFulfillmentReturnRequestService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultFulfillmentReturnRequestService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultFulfillmentReturnRequestService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultFulfillmentReturnRequestService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultFulfillmentReturnRequestService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultFulfillmentReturnRequestService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultFulfillmentReturnRequestService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultFulfillmentReturnRequestService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultFulfillmentReturnRequestService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultFulfillmentReturnRequestService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultFulfillmentReturnRequestService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultFulfillmentReturnRequestService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultFulfillmentReturnRequestService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultFulfillmentReturnRequestService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultFulfillmentReturnRequestService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultFulfillmentReturnRequestService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultFulfillmentReturnRequestService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultFulfillmentReturnRequestService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultFulfillmentReturnRequestService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultFulfillmentReturnRequestService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultFulfillmentReturnRequestService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultFulfillmentReturnRequestService.doIndexing(request);
    }
};