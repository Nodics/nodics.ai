/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultOrderstatusFacade
 * @description Generated facade for schema `orderstatus` owned by module `order`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner order
 * @schema orderstatus
 * @model OrderstatusModel
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
        return SERVICE.DefaultOrderstatusService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultOrderstatusService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultOrderstatusService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultOrderstatusService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultOrderstatusService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultOrderstatusService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultOrderstatusService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultOrderstatusService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultOrderstatusService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultOrderstatusService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultOrderstatusService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultOrderstatusService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultOrderstatusService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultOrderstatusService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultOrderstatusService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultOrderstatusService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultOrderstatusService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultOrderstatusService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultOrderstatusService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultOrderstatusService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultOrderstatusService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultOrderstatusService.doIndexing(request);
    }
};