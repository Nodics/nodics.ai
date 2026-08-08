/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultCmsMigrationAuditFacade
 * @description Generated facade for schema `cmsMigrationAudit` owned by module `cms`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner cms
 * @schema cmsMigrationAudit
 * @model CmsMigrationAuditModel
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
        return SERVICE.DefaultCmsMigrationAuditService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultCmsMigrationAuditService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultCmsMigrationAuditService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultCmsMigrationAuditService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultCmsMigrationAuditService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultCmsMigrationAuditService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultCmsMigrationAuditService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultCmsMigrationAuditService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultCmsMigrationAuditService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultCmsMigrationAuditService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultCmsMigrationAuditService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultCmsMigrationAuditService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultCmsMigrationAuditService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultCmsMigrationAuditService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultCmsMigrationAuditService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultCmsMigrationAuditService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultCmsMigrationAuditService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultCmsMigrationAuditService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultCmsMigrationAuditService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultCmsMigrationAuditService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultCmsMigrationAuditService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultCmsMigrationAuditService.doIndexing(request);
    }
};