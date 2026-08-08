/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultAssistantConversationFacade
 * @description Generated facade for schema `assistantConversation` owned by module `aiAssistant`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner aiAssistant
 * @schema assistantConversation
 * @model AssistantConversationModel
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
        return SERVICE.DefaultAssistantConversationService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultAssistantConversationService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultAssistantConversationService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultAssistantConversationService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultAssistantConversationService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultAssistantConversationService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultAssistantConversationService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultAssistantConversationService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultAssistantConversationService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultAssistantConversationService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultAssistantConversationService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultAssistantConversationService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultAssistantConversationService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultAssistantConversationService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultAssistantConversationService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultAssistantConversationService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultAssistantConversationService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultAssistantConversationService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultAssistantConversationService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultAssistantConversationService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultAssistantConversationService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultAssistantConversationService.doIndexing(request);
    }
};