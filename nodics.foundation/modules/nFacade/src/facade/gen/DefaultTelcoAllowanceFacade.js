/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultTelcoAllowanceFacade
 * @description Generated facade for schema `telcoAllowance` owned by module `telcoCatalog`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner telcoCatalog
 * @schema telcoAllowance
 * @model TelcoAllowanceModel
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
        return SERVICE.DefaultTelcoAllowanceService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultTelcoAllowanceService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultTelcoAllowanceService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultTelcoAllowanceService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultTelcoAllowanceService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultTelcoAllowanceService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultTelcoAllowanceService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultTelcoAllowanceService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultTelcoAllowanceService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultTelcoAllowanceService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultTelcoAllowanceService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultTelcoAllowanceService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultTelcoAllowanceService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultTelcoAllowanceService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultTelcoAllowanceService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultTelcoAllowanceService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultTelcoAllowanceService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultTelcoAllowanceService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultTelcoAllowanceService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultTelcoAllowanceService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultTelcoAllowanceService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultTelcoAllowanceService.doIndexing(request);
    }
};