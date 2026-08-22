/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultInterceptorFacade
 * @description Generated facade for schema `interceptor` owned by module `system`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner system
 * @schema interceptor
 * @model InterceptorModel
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
        return SERVICE.DefaultInterceptorService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultInterceptorService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultInterceptorService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultInterceptorService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultInterceptorService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultInterceptorService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultInterceptorService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultInterceptorService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultInterceptorService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultInterceptorService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultInterceptorService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultInterceptorService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultInterceptorService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultInterceptorService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultInterceptorService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultInterceptorService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultInterceptorService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultInterceptorService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultInterceptorService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultInterceptorService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultInterceptorService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultInterceptorService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultInterceptorService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultInterceptorService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultInterceptorService.doIndexing(request);
    }
};