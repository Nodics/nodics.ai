/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultCmsSiteFacade
 * @description Generated facade for schema `cmsSite` owned by module `cms`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner cms
 * @schema cmsSite
 * @model CmsSiteModel
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
        return SERVICE.DefaultCmsSiteService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultCmsSiteService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultCmsSiteService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultCmsSiteService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultCmsSiteService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultCmsSiteService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultCmsSiteService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultCmsSiteService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultCmsSiteService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultCmsSiteService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultCmsSiteService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultCmsSiteService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultCmsSiteService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultCmsSiteService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultCmsSiteService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultCmsSiteService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultCmsSiteService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultCmsSiteService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultCmsSiteService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultCmsSiteService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultCmsSiteService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultCmsSiteService.doIndexing(request);
    }
};