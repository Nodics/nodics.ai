/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultPasswordFacade
 * @description Generated facade for schema `password` owned by module `profile`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner profile
 * @schema password
 * @model PasswordModel
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
        return SERVICE.DefaultPasswordService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultPasswordService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultPasswordService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultPasswordService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultPasswordService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultPasswordService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultPasswordService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultPasswordService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultPasswordService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultPasswordService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultPasswordService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultPasswordService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultPasswordService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultPasswordService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultPasswordService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultPasswordService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultPasswordService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultPasswordService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultPasswordService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultPasswordService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultPasswordService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultPasswordService.doIndexing(request);
    }
};