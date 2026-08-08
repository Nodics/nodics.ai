/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultFulfillmentCarrierProviderFacade
 * @description Generated facade for schema `fulfillmentCarrierProvider` owned by module `fulfillment`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner fulfillment
 * @schema fulfillmentCarrierProvider
 * @model FulfillmentCarrierProviderModel
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
        return SERVICE.DefaultFulfillmentCarrierProviderService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultFulfillmentCarrierProviderService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultFulfillmentCarrierProviderService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultFulfillmentCarrierProviderService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultFulfillmentCarrierProviderService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultFulfillmentCarrierProviderService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultFulfillmentCarrierProviderService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultFulfillmentCarrierProviderService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultFulfillmentCarrierProviderService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultFulfillmentCarrierProviderService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultFulfillmentCarrierProviderService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultFulfillmentCarrierProviderService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultFulfillmentCarrierProviderService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultFulfillmentCarrierProviderService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultFulfillmentCarrierProviderService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultFulfillmentCarrierProviderService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultFulfillmentCarrierProviderService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultFulfillmentCarrierProviderService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultFulfillmentCarrierProviderService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultFulfillmentCarrierProviderService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultFulfillmentCarrierProviderService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultFulfillmentCarrierProviderService.doIndexing(request);
    }
};