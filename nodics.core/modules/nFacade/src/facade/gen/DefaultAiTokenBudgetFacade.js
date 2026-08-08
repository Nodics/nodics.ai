/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultAiTokenBudgetFacade
 * @description Generated facade for schema `aiTokenBudget` owned by module `aiProviders`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner aiProviders
 * @schema aiTokenBudget
 * @model AiTokenBudgetModel
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
        return SERVICE.DefaultAiTokenBudgetService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultAiTokenBudgetService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultAiTokenBudgetService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultAiTokenBudgetService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultAiTokenBudgetService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultAiTokenBudgetService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultAiTokenBudgetService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultAiTokenBudgetService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultAiTokenBudgetService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultAiTokenBudgetService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultAiTokenBudgetService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultAiTokenBudgetService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultAiTokenBudgetService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultAiTokenBudgetService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultAiTokenBudgetService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultAiTokenBudgetService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultAiTokenBudgetService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultAiTokenBudgetService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultAiTokenBudgetService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultAiTokenBudgetService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultAiTokenBudgetService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultAiTokenBudgetService.doIndexing(request);
    }
};