/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultStockPoolMemberFacade
 * @description Generated facade for schema `stockPoolMember` owned by module `inventory`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner inventory
 * @schema stockPoolMember
 * @model StockPoolMemberModel
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
        return SERVICE.DefaultStockPoolMemberService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultStockPoolMemberService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultStockPoolMemberService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultStockPoolMemberService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultStockPoolMemberService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultStockPoolMemberService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultStockPoolMemberService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultStockPoolMemberService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultStockPoolMemberService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultStockPoolMemberService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultStockPoolMemberService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultStockPoolMemberService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultStockPoolMemberService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultStockPoolMemberService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultStockPoolMemberService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultStockPoolMemberService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultStockPoolMemberService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultStockPoolMemberService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultStockPoolMemberService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultStockPoolMemberService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultStockPoolMemberService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultStockPoolMemberService.doIndexing(request);
    }
};