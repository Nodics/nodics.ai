/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultOrderLifecycleReasonFacade
 * @description Generated facade for schema `orderLifecycleReason` owned by module `order`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner order
 * @schema orderLifecycleReason
 * @model OrderLifecycleReasonModel
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
        return SERVICE.DefaultOrderLifecycleReasonService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultOrderLifecycleReasonService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultOrderLifecycleReasonService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultOrderLifecycleReasonService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultOrderLifecycleReasonService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultOrderLifecycleReasonService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultOrderLifecycleReasonService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultOrderLifecycleReasonService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultOrderLifecycleReasonService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultOrderLifecycleReasonService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultOrderLifecycleReasonService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultOrderLifecycleReasonService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultOrderLifecycleReasonService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultOrderLifecycleReasonService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultOrderLifecycleReasonService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultOrderLifecycleReasonService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultOrderLifecycleReasonService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultOrderLifecycleReasonService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultOrderLifecycleReasonService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultOrderLifecycleReasonService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultOrderLifecycleReasonService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultOrderLifecycleReasonService.doIndexing(request);
    }
};