/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultCommerceOrderEntryFacade
 * @description Generated facade for schema `commerceOrderEntry` owned by module `order`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner order
 * @schema commerceOrderEntry
 * @model CommerceOrderEntryModel
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
        return SERVICE.DefaultCommerceOrderEntryService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultCommerceOrderEntryService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultCommerceOrderEntryService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultCommerceOrderEntryService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultCommerceOrderEntryService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultCommerceOrderEntryService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultCommerceOrderEntryService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultCommerceOrderEntryService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultCommerceOrderEntryService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultCommerceOrderEntryService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultCommerceOrderEntryService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultCommerceOrderEntryService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultCommerceOrderEntryService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultCommerceOrderEntryService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultCommerceOrderEntryService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultCommerceOrderEntryService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultCommerceOrderEntryService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultCommerceOrderEntryService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultCommerceOrderEntryService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultCommerceOrderEntryService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultCommerceOrderEntryService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultCommerceOrderEntryService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultCommerceOrderEntryService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultCommerceOrderEntryService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultCommerceOrderEntryService.doIndexing(request);
    }
};