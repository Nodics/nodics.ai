/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultWorkflowCarrierFacade
 * @description Generated facade for schema `workflowCarrier` owned by module `workflow`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner workflow
 * @schema workflowCarrier
 * @model WorkflowCarrierModel
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
        return SERVICE.DefaultWorkflowCarrierService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultWorkflowCarrierService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultWorkflowCarrierService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultWorkflowCarrierService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultWorkflowCarrierService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultWorkflowCarrierService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultWorkflowCarrierService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultWorkflowCarrierService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultWorkflowCarrierService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultWorkflowCarrierService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultWorkflowCarrierService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultWorkflowCarrierService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultWorkflowCarrierService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultWorkflowCarrierService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultWorkflowCarrierService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultWorkflowCarrierService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultWorkflowCarrierService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultWorkflowCarrierService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultWorkflowCarrierService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultWorkflowCarrierService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultWorkflowCarrierService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultWorkflowCarrierService.doIndexing(request);
    }
};