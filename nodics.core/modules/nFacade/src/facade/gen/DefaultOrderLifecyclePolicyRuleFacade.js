/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultOrderLifecyclePolicyRuleFacade
 * @description Generated facade for schema `orderLifecyclePolicyRule` owned by module `order`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner order
 * @schema orderLifecyclePolicyRule
 * @model OrderLifecyclePolicyRuleModel
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
        return SERVICE.DefaultOrderLifecyclePolicyRuleService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultOrderLifecyclePolicyRuleService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultOrderLifecyclePolicyRuleService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultOrderLifecyclePolicyRuleService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultOrderLifecyclePolicyRuleService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultOrderLifecyclePolicyRuleService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultOrderLifecyclePolicyRuleService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultOrderLifecyclePolicyRuleService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultOrderLifecyclePolicyRuleService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultOrderLifecyclePolicyRuleService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultOrderLifecyclePolicyRuleService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultOrderLifecyclePolicyRuleService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultOrderLifecyclePolicyRuleService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultOrderLifecyclePolicyRuleService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultOrderLifecyclePolicyRuleService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultOrderLifecyclePolicyRuleService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultOrderLifecyclePolicyRuleService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultOrderLifecyclePolicyRuleService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultOrderLifecyclePolicyRuleService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultOrderLifecyclePolicyRuleService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultOrderLifecyclePolicyRuleService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultOrderLifecyclePolicyRuleService.doIndexing(request);
    }
};