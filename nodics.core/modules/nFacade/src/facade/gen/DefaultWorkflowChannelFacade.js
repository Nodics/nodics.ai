/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultWorkflowChannelFacade
 * @description Generated facade for schema `workflowChannel` owned by module `workflow`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner workflow
 * @schema workflowChannel
 * @model WorkflowChannelModel
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
        return SERVICE.DefaultWorkflowChannelService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultWorkflowChannelService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultWorkflowChannelService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultWorkflowChannelService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultWorkflowChannelService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultWorkflowChannelService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultWorkflowChannelService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultWorkflowChannelService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultWorkflowChannelService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultWorkflowChannelService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultWorkflowChannelService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultWorkflowChannelService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultWorkflowChannelService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultWorkflowChannelService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultWorkflowChannelService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultWorkflowChannelService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultWorkflowChannelService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultWorkflowChannelService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultWorkflowChannelService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultWorkflowChannelService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultWorkflowChannelService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultWorkflowChannelService.doIndexing(request);
    }
};