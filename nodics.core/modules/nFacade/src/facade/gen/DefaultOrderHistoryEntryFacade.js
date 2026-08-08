/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultOrderHistoryEntryFacade
 * @description Generated facade for schema `orderHistoryEntry` owned by module `order`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner order
 * @schema orderHistoryEntry
 * @model OrderHistoryEntryModel
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
        return SERVICE.DefaultOrderHistoryEntryService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultOrderHistoryEntryService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultOrderHistoryEntryService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultOrderHistoryEntryService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultOrderHistoryEntryService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultOrderHistoryEntryService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultOrderHistoryEntryService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultOrderHistoryEntryService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultOrderHistoryEntryService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultOrderHistoryEntryService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultOrderHistoryEntryService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultOrderHistoryEntryService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultOrderHistoryEntryService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultOrderHistoryEntryService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultOrderHistoryEntryService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultOrderHistoryEntryService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultOrderHistoryEntryService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultOrderHistoryEntryService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultOrderHistoryEntryService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultOrderHistoryEntryService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultOrderHistoryEntryService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultOrderHistoryEntryService.doIndexing(request);
    }
};