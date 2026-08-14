/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultMediaSetEntryFacade
 * @description Generated facade for schema `mediaSetEntry` owned by module `media`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner media
 * @schema mediaSetEntry
 * @model MediaSetEntryModel
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
        return SERVICE.DefaultMediaSetEntryService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultMediaSetEntryService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultMediaSetEntryService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultMediaSetEntryService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultMediaSetEntryService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultMediaSetEntryService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultMediaSetEntryService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultMediaSetEntryService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultMediaSetEntryService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultMediaSetEntryService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultMediaSetEntryService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultMediaSetEntryService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultMediaSetEntryService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultMediaSetEntryService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultMediaSetEntryService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultMediaSetEntryService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultMediaSetEntryService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultMediaSetEntryService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultMediaSetEntryService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultMediaSetEntryService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultMediaSetEntryService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultMediaSetEntryService.doIndexing(request);
    }
};