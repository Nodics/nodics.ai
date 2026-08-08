/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultEventLogFacade
 * @description Generated facade for schema `eventLog` owned by module `nems`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner nems
 * @schema eventLog
 * @model EventLogModel
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
        return SERVICE.DefaultEventLogService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultEventLogService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultEventLogService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultEventLogService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultEventLogService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultEventLogService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultEventLogService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultEventLogService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultEventLogService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultEventLogService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultEventLogService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultEventLogService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultEventLogService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultEventLogService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultEventLogService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultEventLogService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultEventLogService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultEventLogService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultEventLogService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultEventLogService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultEventLogService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultEventLogService.doIndexing(request);
    }
};