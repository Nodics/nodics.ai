/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultSearchFacade
 * @description Generated facade for schema `search` owned by module `search`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner search
 * @schema search
 * @model SearchModel
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
        return SERVICE.DefaultSearchService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultSearchService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultSearchService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultSearchService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultSearchService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultSearchService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultSearchService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultSearchService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultSearchService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultSearchService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultSearchService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultSearchService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultSearchService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultSearchService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultSearchService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultSearchService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultSearchService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultSearchService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultSearchService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultSearchService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultSearchService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultSearchService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultSearchService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultSearchService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultSearchService.doIndexing(request);
    }
};