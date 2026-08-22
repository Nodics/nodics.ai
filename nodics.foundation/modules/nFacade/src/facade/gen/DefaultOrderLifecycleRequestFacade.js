/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultOrderLifecycleRequestFacade
 * @description Generated facade for schema `orderLifecycleRequest` owned by module `order`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner order
 * @schema orderLifecycleRequest
 * @model OrderLifecycleRequestModel
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
        return SERVICE.DefaultOrderLifecycleRequestService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultOrderLifecycleRequestService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultOrderLifecycleRequestService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultOrderLifecycleRequestService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultOrderLifecycleRequestService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultOrderLifecycleRequestService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultOrderLifecycleRequestService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultOrderLifecycleRequestService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultOrderLifecycleRequestService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultOrderLifecycleRequestService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultOrderLifecycleRequestService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultOrderLifecycleRequestService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultOrderLifecycleRequestService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultOrderLifecycleRequestService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultOrderLifecycleRequestService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultOrderLifecycleRequestService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultOrderLifecycleRequestService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultOrderLifecycleRequestService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultOrderLifecycleRequestService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultOrderLifecycleRequestService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultOrderLifecycleRequestService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultOrderLifecycleRequestService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultOrderLifecycleRequestService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultOrderLifecycleRequestService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultOrderLifecycleRequestService.doIndexing(request);
    }
};