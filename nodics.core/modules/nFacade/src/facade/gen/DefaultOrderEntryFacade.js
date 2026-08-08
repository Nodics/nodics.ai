/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultOrderEntryFacade
 * @description Generated facade for schema `orderEntry` owned by module `order`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner order
 * @schema orderEntry
 * @model OrderEntryModel
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
        return SERVICE.DefaultOrderEntryService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultOrderEntryService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultOrderEntryService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultOrderEntryService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultOrderEntryService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultOrderEntryService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultOrderEntryService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultOrderEntryService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultOrderEntryService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultOrderEntryService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultOrderEntryService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultOrderEntryService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultOrderEntryService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultOrderEntryService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultOrderEntryService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultOrderEntryService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultOrderEntryService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultOrderEntryService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultOrderEntryService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultOrderEntryService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultOrderEntryService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultOrderEntryService.doIndexing(request);
    }
};