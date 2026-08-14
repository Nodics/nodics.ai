/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultCartDiagnosticFacade
 * @description Generated facade for schema `cartDiagnostic` owned by module `cart`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner cart
 * @schema cartDiagnostic
 * @model CartDiagnosticModel
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
        return SERVICE.DefaultCartDiagnosticService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultCartDiagnosticService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultCartDiagnosticService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultCartDiagnosticService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultCartDiagnosticService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultCartDiagnosticService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultCartDiagnosticService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultCartDiagnosticService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultCartDiagnosticService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultCartDiagnosticService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultCartDiagnosticService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultCartDiagnosticService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultCartDiagnosticService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultCartDiagnosticService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultCartDiagnosticService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultCartDiagnosticService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultCartDiagnosticService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultCartDiagnosticService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultCartDiagnosticService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultCartDiagnosticService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultCartDiagnosticService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultCartDiagnosticService.doIndexing(request);
    }
};