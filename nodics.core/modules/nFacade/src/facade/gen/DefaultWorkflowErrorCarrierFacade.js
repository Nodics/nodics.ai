/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultWorkflowErrorCarrierFacade
 * @description Generated facade for schema `workflowErrorCarrier` owned by module `workflow`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner workflow
 * @schema workflowErrorCarrier
 * @model WorkflowErrorCarrierModel
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
        return SERVICE.DefaultWorkflowErrorCarrierService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultWorkflowErrorCarrierService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultWorkflowErrorCarrierService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultWorkflowErrorCarrierService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultWorkflowErrorCarrierService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultWorkflowErrorCarrierService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultWorkflowErrorCarrierService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultWorkflowErrorCarrierService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultWorkflowErrorCarrierService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultWorkflowErrorCarrierService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultWorkflowErrorCarrierService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultWorkflowErrorCarrierService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultWorkflowErrorCarrierService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultWorkflowErrorCarrierService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultWorkflowErrorCarrierService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultWorkflowErrorCarrierService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultWorkflowErrorCarrierService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultWorkflowErrorCarrierService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultWorkflowErrorCarrierService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultWorkflowErrorCarrierService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultWorkflowErrorCarrierService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultWorkflowErrorCarrierService.doIndexing(request);
    }
};