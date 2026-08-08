/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultAiTokenRepairFindingFacade
 * @description Generated facade for schema `aiTokenRepairFinding` owned by module `aiProviders`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner aiProviders
 * @schema aiTokenRepairFinding
 * @model AiTokenRepairFindingModel
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
        return SERVICE.DefaultAiTokenRepairFindingService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultAiTokenRepairFindingService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultAiTokenRepairFindingService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultAiTokenRepairFindingService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultAiTokenRepairFindingService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultAiTokenRepairFindingService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultAiTokenRepairFindingService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultAiTokenRepairFindingService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultAiTokenRepairFindingService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultAiTokenRepairFindingService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultAiTokenRepairFindingService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultAiTokenRepairFindingService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultAiTokenRepairFindingService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultAiTokenRepairFindingService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultAiTokenRepairFindingService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultAiTokenRepairFindingService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultAiTokenRepairFindingService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultAiTokenRepairFindingService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultAiTokenRepairFindingService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultAiTokenRepairFindingService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultAiTokenRepairFindingService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultAiTokenRepairFindingService.doIndexing(request);
    }
};