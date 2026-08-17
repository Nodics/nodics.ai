/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultApparelStyleFacade
 * @description Generated facade for schema `apparelStyle` owned by module `apparelProduct`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner apparelProduct
 * @schema apparelStyle
 * @model ApparelStyleModel
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
        return SERVICE.DefaultApparelStyleService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultApparelStyleService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultApparelStyleService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultApparelStyleService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultApparelStyleService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultApparelStyleService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultApparelStyleService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultApparelStyleService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultApparelStyleService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultApparelStyleService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultApparelStyleService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultApparelStyleService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultApparelStyleService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultApparelStyleService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultApparelStyleService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultApparelStyleService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultApparelStyleService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultApparelStyleService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultApparelStyleService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultApparelStyleService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultApparelStyleService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultApparelStyleService.doIndexing(request);
    }
};