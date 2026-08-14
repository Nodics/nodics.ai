/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultUserGroupFacade
 * @description Generated facade for schema `userGroup` owned by module `profile`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner profile
 * @schema userGroup
 * @model UserGroupModel
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
        return SERVICE.DefaultUserGroupService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultUserGroupService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultUserGroupService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultUserGroupService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultUserGroupService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultUserGroupService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultUserGroupService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultUserGroupService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultUserGroupService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultUserGroupService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultUserGroupService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultUserGroupService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultUserGroupService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultUserGroupService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultUserGroupService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultUserGroupService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultUserGroupService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultUserGroupService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultUserGroupService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultUserGroupService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultUserGroupService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultUserGroupService.doIndexing(request);
    }
};