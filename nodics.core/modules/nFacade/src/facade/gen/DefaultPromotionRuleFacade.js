/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultPromotionRuleFacade
 * @description Generated facade for schema `promotionRule` owned by module `promotion`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner promotion
 * @schema promotionRule
 * @model PromotionRuleModel
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
        return SERVICE.DefaultPromotionRuleService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultPromotionRuleService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultPromotionRuleService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultPromotionRuleService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultPromotionRuleService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultPromotionRuleService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultPromotionRuleService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultPromotionRuleService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultPromotionRuleService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultPromotionRuleService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultPromotionRuleService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultPromotionRuleService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultPromotionRuleService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultPromotionRuleService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultPromotionRuleService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultPromotionRuleService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultPromotionRuleService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultPromotionRuleService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultPromotionRuleService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultPromotionRuleService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultPromotionRuleService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultPromotionRuleService.doIndexing(request);
    }
};