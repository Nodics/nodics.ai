/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultCommerceSearchRuleProjectionFacade
 * @description Generated facade for schema `commerceSearchRuleProjection` owned by module `commerceSearchCore`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner commerceSearchCore
 * @schema commerceSearchRuleProjection
 * @model CommerceSearchRuleProjectionModel
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
        return SERVICE.DefaultCommerceSearchRuleProjectionService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultCommerceSearchRuleProjectionService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultCommerceSearchRuleProjectionService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultCommerceSearchRuleProjectionService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultCommerceSearchRuleProjectionService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultCommerceSearchRuleProjectionService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultCommerceSearchRuleProjectionService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultCommerceSearchRuleProjectionService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultCommerceSearchRuleProjectionService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultCommerceSearchRuleProjectionService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultCommerceSearchRuleProjectionService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultCommerceSearchRuleProjectionService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultCommerceSearchRuleProjectionService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultCommerceSearchRuleProjectionService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultCommerceSearchRuleProjectionService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultCommerceSearchRuleProjectionService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultCommerceSearchRuleProjectionService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultCommerceSearchRuleProjectionService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultCommerceSearchRuleProjectionService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultCommerceSearchRuleProjectionService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultCommerceSearchRuleProjectionService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultCommerceSearchRuleProjectionService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultCommerceSearchRuleProjectionService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultCommerceSearchRuleProjectionService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultCommerceSearchRuleProjectionService.doIndexing(request);
    }
};