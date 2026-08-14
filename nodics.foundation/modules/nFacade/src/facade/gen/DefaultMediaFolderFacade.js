/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultMediaFolderFacade
 * @description Generated facade for schema `mediaFolder` owned by module `media`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner media
 * @schema mediaFolder
 * @model MediaFolderModel
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
        return SERVICE.DefaultMediaFolderService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultMediaFolderService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultMediaFolderService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultMediaFolderService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultMediaFolderService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultMediaFolderService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultMediaFolderService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultMediaFolderService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultMediaFolderService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultMediaFolderService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultMediaFolderService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultMediaFolderService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultMediaFolderService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultMediaFolderService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultMediaFolderService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultMediaFolderService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultMediaFolderService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultMediaFolderService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultMediaFolderService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultMediaFolderService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultMediaFolderService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultMediaFolderService.doIndexing(request);
    }
};