/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultPromotionBudgetLedgerFacade
 * @description Generated facade for schema `promotionBudgetLedger` owned by module `promotion`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner promotion
 * @schema promotionBudgetLedger
 * @model PromotionBudgetLedgerModel
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
        return SERVICE.DefaultPromotionBudgetLedgerService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultPromotionBudgetLedgerService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultPromotionBudgetLedgerService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultPromotionBudgetLedgerService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultPromotionBudgetLedgerService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultPromotionBudgetLedgerService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultPromotionBudgetLedgerService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultPromotionBudgetLedgerService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultPromotionBudgetLedgerService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultPromotionBudgetLedgerService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultPromotionBudgetLedgerService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultPromotionBudgetLedgerService.update(request);
    }
};