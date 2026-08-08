/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultAssistantTurnFacade
 * @description Generated facade for schema `assistantTurn` owned by module `aiAssistant`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner aiAssistant
 * @schema assistantTurn
 * @model AssistantTurnModel
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
        return SERVICE.DefaultAssistantTurnService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultAssistantTurnService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultAssistantTurnService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultAssistantTurnService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultAssistantTurnService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultAssistantTurnService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultAssistantTurnService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultAssistantTurnService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultAssistantTurnService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultAssistantTurnService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultAssistantTurnService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultAssistantTurnService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultAssistantTurnService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultAssistantTurnService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultAssistantTurnService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultAssistantTurnService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultAssistantTurnService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultAssistantTurnService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultAssistantTurnService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultAssistantTurnService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultAssistantTurnService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultAssistantTurnService.doIndexing(request);
    }
};