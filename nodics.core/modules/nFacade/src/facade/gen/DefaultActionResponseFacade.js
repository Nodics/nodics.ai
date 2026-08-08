/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultActionResponseFacade
 * @description Generated facade for schema `actionResponse` owned by module `workflow`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner workflow
 * @schema actionResponse
 * @model ActionResponseModel
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
        return SERVICE.DefaultActionResponseService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultActionResponseService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultActionResponseService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultActionResponseService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultActionResponseService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultActionResponseService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultActionResponseService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultActionResponseService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultActionResponseService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultActionResponseService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultActionResponseService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultActionResponseService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultActionResponseService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultActionResponseService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultActionResponseService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultActionResponseService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultActionResponseService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultActionResponseService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultActionResponseService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultActionResponseService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultActionResponseService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultActionResponseService.doIndexing(request);
    }
};