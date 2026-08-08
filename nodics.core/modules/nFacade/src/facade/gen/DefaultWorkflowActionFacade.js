/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultWorkflowActionFacade
 * @description Generated facade for schema `workflowAction` owned by module `workflow`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner workflow
 * @schema workflowAction
 * @model WorkflowActionModel
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
        return SERVICE.DefaultWorkflowActionService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultWorkflowActionService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultWorkflowActionService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultWorkflowActionService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultWorkflowActionService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultWorkflowActionService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultWorkflowActionService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultWorkflowActionService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultWorkflowActionService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultWorkflowActionService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultWorkflowActionService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultWorkflowActionService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultWorkflowActionService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultWorkflowActionService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultWorkflowActionService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultWorkflowActionService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultWorkflowActionService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultWorkflowActionService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultWorkflowActionService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultWorkflowActionService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultWorkflowActionService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultWorkflowActionService.doIndexing(request);
    }
};