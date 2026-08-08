/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultAssistantToolPolicyFacade
 * @description Generated facade for schema `assistantToolPolicy` owned by module `aiAssistant`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner aiAssistant
 * @schema assistantToolPolicy
 * @model AssistantToolPolicyModel
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
        return SERVICE.DefaultAssistantToolPolicyService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultAssistantToolPolicyService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultAssistantToolPolicyService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultAssistantToolPolicyService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultAssistantToolPolicyService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultAssistantToolPolicyService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultAssistantToolPolicyService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultAssistantToolPolicyService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultAssistantToolPolicyService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultAssistantToolPolicyService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultAssistantToolPolicyService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultAssistantToolPolicyService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultAssistantToolPolicyService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultAssistantToolPolicyService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultAssistantToolPolicyService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultAssistantToolPolicyService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultAssistantToolPolicyService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultAssistantToolPolicyService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultAssistantToolPolicyService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultAssistantToolPolicyService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultAssistantToolPolicyService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultAssistantToolPolicyService.doIndexing(request);
    }
};