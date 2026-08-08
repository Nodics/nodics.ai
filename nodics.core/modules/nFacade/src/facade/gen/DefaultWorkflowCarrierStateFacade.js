/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultWorkflowCarrierStateFacade
 * @description Generated facade for schema `workflowCarrierState` owned by module `workflow`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner workflow
 * @schema workflowCarrierState
 * @model WorkflowCarrierStateModel
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
        return SERVICE.DefaultWorkflowCarrierStateService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultWorkflowCarrierStateService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultWorkflowCarrierStateService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultWorkflowCarrierStateService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultWorkflowCarrierStateService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultWorkflowCarrierStateService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultWorkflowCarrierStateService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultWorkflowCarrierStateService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultWorkflowCarrierStateService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultWorkflowCarrierStateService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultWorkflowCarrierStateService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultWorkflowCarrierStateService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultWorkflowCarrierStateService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultWorkflowCarrierStateService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultWorkflowCarrierStateService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultWorkflowCarrierStateService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultWorkflowCarrierStateService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultWorkflowCarrierStateService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultWorkflowCarrierStateService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultWorkflowCarrierStateService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultWorkflowCarrierStateService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultWorkflowCarrierStateService.doIndexing(request);
    }
};