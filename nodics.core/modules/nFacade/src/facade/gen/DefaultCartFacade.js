/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultCartFacade
 * @description Generated facade for schema `cart` owned by module `cart`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner cart
 * @schema cart
 * @model CartModel
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
        return SERVICE.DefaultCartService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultCartService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultCartService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultCartService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultCartService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultCartService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultCartService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultCartService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultCartService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultCartService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultCartService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultCartService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultCartService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultCartService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultCartService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultCartService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultCartService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultCartService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultCartService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultCartService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultCartService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultCartService.doIndexing(request);
    }
};