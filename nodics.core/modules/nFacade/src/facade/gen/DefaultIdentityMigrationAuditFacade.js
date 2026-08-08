/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultIdentityMigrationAuditFacade
 * @description Generated facade for schema `identityMigrationAudit` owned by module `profile`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner profile
 * @schema identityMigrationAudit
 * @model IdentityMigrationAuditModel
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
        return SERVICE.DefaultIdentityMigrationAuditService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultIdentityMigrationAuditService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultIdentityMigrationAuditService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultIdentityMigrationAuditService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultIdentityMigrationAuditService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultIdentityMigrationAuditService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultIdentityMigrationAuditService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultIdentityMigrationAuditService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultIdentityMigrationAuditService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultIdentityMigrationAuditService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultIdentityMigrationAuditService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultIdentityMigrationAuditService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultIdentityMigrationAuditService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultIdentityMigrationAuditService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultIdentityMigrationAuditService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultIdentityMigrationAuditService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultIdentityMigrationAuditService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultIdentityMigrationAuditService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultIdentityMigrationAuditService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultIdentityMigrationAuditService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultIdentityMigrationAuditService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultIdentityMigrationAuditService.doIndexing(request);
    }
};