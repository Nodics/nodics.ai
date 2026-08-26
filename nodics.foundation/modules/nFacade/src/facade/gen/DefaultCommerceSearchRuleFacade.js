/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultCommerceSearchRuleFacade
 * @description Generated facade for schema `commerceSearchRule` owned by module `commerceSearchCore`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner commerceSearchCore
 * @schema commerceSearchRule
 * @model CommerceSearchRuleModel
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
        return SERVICE.DefaultCommerceSearchRuleService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultCommerceSearchRuleService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultCommerceSearchRuleService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultCommerceSearchRuleService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultCommerceSearchRuleService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultCommerceSearchRuleService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultCommerceSearchRuleService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultCommerceSearchRuleService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultCommerceSearchRuleService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultCommerceSearchRuleService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultCommerceSearchRuleService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultCommerceSearchRuleService.update(request);
    }
};