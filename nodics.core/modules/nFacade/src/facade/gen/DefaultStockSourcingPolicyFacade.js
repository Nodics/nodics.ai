/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultStockSourcingPolicyFacade
 * @description Generated facade for schema `stockSourcingPolicy` owned by module `inventory`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner inventory
 * @schema stockSourcingPolicy
 * @model StockSourcingPolicyModel
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
        return SERVICE.DefaultStockSourcingPolicyService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultStockSourcingPolicyService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultStockSourcingPolicyService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultStockSourcingPolicyService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultStockSourcingPolicyService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultStockSourcingPolicyService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultStockSourcingPolicyService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultStockSourcingPolicyService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultStockSourcingPolicyService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultStockSourcingPolicyService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultStockSourcingPolicyService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultStockSourcingPolicyService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultStockSourcingPolicyService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultStockSourcingPolicyService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultStockSourcingPolicyService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultStockSourcingPolicyService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultStockSourcingPolicyService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultStockSourcingPolicyService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultStockSourcingPolicyService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultStockSourcingPolicyService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultStockSourcingPolicyService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultStockSourcingPolicyService.doIndexing(request);
    }
};