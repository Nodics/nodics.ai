/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultApparelSizeSystemFacade
 * @description Generated facade for schema `apparelSizeSystem` owned by module `apparelProduct`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner apparelProduct
 * @schema apparelSizeSystem
 * @model ApparelSizeSystemModel
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
        return SERVICE.DefaultApparelSizeSystemService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultApparelSizeSystemService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultApparelSizeSystemService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultApparelSizeSystemService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultApparelSizeSystemService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultApparelSizeSystemService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultApparelSizeSystemService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultApparelSizeSystemService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultApparelSizeSystemService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultApparelSizeSystemService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultApparelSizeSystemService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultApparelSizeSystemService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultApparelSizeSystemService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultApparelSizeSystemService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultApparelSizeSystemService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultApparelSizeSystemService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultApparelSizeSystemService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultApparelSizeSystemService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultApparelSizeSystemService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultApparelSizeSystemService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultApparelSizeSystemService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultApparelSizeSystemService.doIndexing(request);
    }
};