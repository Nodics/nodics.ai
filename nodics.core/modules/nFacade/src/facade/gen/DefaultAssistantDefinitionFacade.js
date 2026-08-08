/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultAssistantDefinitionFacade
 * @description Generated facade for schema `assistantDefinition` owned by module `aiAssistant`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner aiAssistant
 * @schema assistantDefinition
 * @model AssistantDefinitionModel
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
        return SERVICE.DefaultAssistantDefinitionService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultAssistantDefinitionService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultAssistantDefinitionService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultAssistantDefinitionService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultAssistantDefinitionService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultAssistantDefinitionService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultAssistantDefinitionService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultAssistantDefinitionService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultAssistantDefinitionService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultAssistantDefinitionService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultAssistantDefinitionService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultAssistantDefinitionService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultAssistantDefinitionService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultAssistantDefinitionService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultAssistantDefinitionService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultAssistantDefinitionService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultAssistantDefinitionService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultAssistantDefinitionService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultAssistantDefinitionService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultAssistantDefinitionService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultAssistantDefinitionService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultAssistantDefinitionService.doIndexing(request);
    }
};