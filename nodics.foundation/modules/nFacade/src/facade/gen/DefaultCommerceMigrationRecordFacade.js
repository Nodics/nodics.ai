/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultCommerceMigrationRecordFacade
 * @description Generated facade for schema `commerceMigrationRecord` owned by module `checkoutCore`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner checkoutCore
 * @schema commerceMigrationRecord
 * @model CommerceMigrationRecordModel
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
        return SERVICE.DefaultCommerceMigrationRecordService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultCommerceMigrationRecordService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultCommerceMigrationRecordService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultCommerceMigrationRecordService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultCommerceMigrationRecordService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultCommerceMigrationRecordService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultCommerceMigrationRecordService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultCommerceMigrationRecordService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultCommerceMigrationRecordService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultCommerceMigrationRecordService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultCommerceMigrationRecordService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultCommerceMigrationRecordService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultCommerceMigrationRecordService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultCommerceMigrationRecordService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultCommerceMigrationRecordService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultCommerceMigrationRecordService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultCommerceMigrationRecordService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultCommerceMigrationRecordService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultCommerceMigrationRecordService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultCommerceMigrationRecordService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultCommerceMigrationRecordService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultCommerceMigrationRecordService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultCommerceMigrationRecordService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultCommerceMigrationRecordService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultCommerceMigrationRecordService.doIndexing(request);
    }
};