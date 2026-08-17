/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultCustomerListEntryFacade
 * @description Generated facade for schema `customerListEntry` owned by module `customerList`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner customerList
 * @schema customerListEntry
 * @model CustomerListEntryModel
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
        return SERVICE.DefaultCustomerListEntryService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultCustomerListEntryService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultCustomerListEntryService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultCustomerListEntryService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultCustomerListEntryService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultCustomerListEntryService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultCustomerListEntryService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultCustomerListEntryService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultCustomerListEntryService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultCustomerListEntryService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultCustomerListEntryService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultCustomerListEntryService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultCustomerListEntryService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultCustomerListEntryService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultCustomerListEntryService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultCustomerListEntryService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultCustomerListEntryService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultCustomerListEntryService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultCustomerListEntryService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultCustomerListEntryService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultCustomerListEntryService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultCustomerListEntryService.doIndexing(request);
    }
};