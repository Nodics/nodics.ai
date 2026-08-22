/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultIndexFacade
 * @description Generated facade for schema `index` owned by module `search`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner search
 * @schema index
 * @model IndexModel
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
        return SERVICE.DefaultIndexService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultIndexService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultIndexService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultIndexService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultIndexService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultIndexService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultIndexService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultIndexService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultIndexService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultIndexService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultIndexService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultIndexService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultIndexService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultIndexService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultIndexService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultIndexService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultIndexService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultIndexService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultIndexService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultIndexService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultIndexService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultIndexService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultIndexService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultIndexService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultIndexService.doIndexing(request);
    }
};