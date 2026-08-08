/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultUserStateFacade
 * @description Generated facade for schema `userState` owned by module `profile`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner profile
 * @schema userState
 * @model UserStateModel
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
        return SERVICE.DefaultUserStateService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultUserStateService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultUserStateService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultUserStateService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultUserStateService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultUserStateService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultUserStateService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultUserStateService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultUserStateService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultUserStateService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultUserStateService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultUserStateService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultUserStateService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultUserStateService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultUserStateService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultUserStateService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultUserStateService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultUserStateService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultUserStateService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultUserStateService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultUserStateService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultUserStateService.doIndexing(request);
    }
};