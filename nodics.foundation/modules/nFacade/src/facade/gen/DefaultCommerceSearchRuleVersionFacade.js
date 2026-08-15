/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultCommerceSearchRuleVersionFacade
 * @description Generated facade for schema `commerceSearchRuleVersion` owned by module `commerceSearchCore`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner commerceSearchCore
 * @schema commerceSearchRuleVersion
 * @model CommerceSearchRuleVersionModel
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
        return SERVICE.DefaultCommerceSearchRuleVersionService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultCommerceSearchRuleVersionService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultCommerceSearchRuleVersionService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultCommerceSearchRuleVersionService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultCommerceSearchRuleVersionService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultCommerceSearchRuleVersionService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultCommerceSearchRuleVersionService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultCommerceSearchRuleVersionService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultCommerceSearchRuleVersionService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultCommerceSearchRuleVersionService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultCommerceSearchRuleVersionService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultCommerceSearchRuleVersionService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultCommerceSearchRuleVersionService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultCommerceSearchRuleVersionService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultCommerceSearchRuleVersionService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultCommerceSearchRuleVersionService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultCommerceSearchRuleVersionService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultCommerceSearchRuleVersionService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultCommerceSearchRuleVersionService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultCommerceSearchRuleVersionService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultCommerceSearchRuleVersionService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultCommerceSearchRuleVersionService.doIndexing(request);
    }
};