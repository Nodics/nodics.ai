/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultAssistantMessageFacade
 * @description Generated facade for schema `assistantMessage` owned by module `aiAssistant`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner aiAssistant
 * @schema assistantMessage
 * @model AssistantMessageModel
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
        return SERVICE.DefaultAssistantMessageService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultAssistantMessageService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultAssistantMessageService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultAssistantMessageService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultAssistantMessageService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultAssistantMessageService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultAssistantMessageService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultAssistantMessageService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultAssistantMessageService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultAssistantMessageService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultAssistantMessageService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultAssistantMessageService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultAssistantMessageService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultAssistantMessageService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultAssistantMessageService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultAssistantMessageService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultAssistantMessageService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultAssistantMessageService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultAssistantMessageService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultAssistantMessageService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultAssistantMessageService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultAssistantMessageService.doIndexing(request);
    }
};