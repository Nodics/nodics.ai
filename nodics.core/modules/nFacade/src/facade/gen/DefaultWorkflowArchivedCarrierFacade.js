/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultWorkflowArchivedCarrierFacade
 * @description Generated facade for schema `workflowArchivedCarrier` owned by module `workflow`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner workflow
 * @schema workflowArchivedCarrier
 * @model WorkflowArchivedCarrierModel
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
        return SERVICE.DefaultWorkflowArchivedCarrierService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultWorkflowArchivedCarrierService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultWorkflowArchivedCarrierService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultWorkflowArchivedCarrierService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultWorkflowArchivedCarrierService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultWorkflowArchivedCarrierService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultWorkflowArchivedCarrierService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultWorkflowArchivedCarrierService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultWorkflowArchivedCarrierService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultWorkflowArchivedCarrierService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultWorkflowArchivedCarrierService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultWorkflowArchivedCarrierService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultWorkflowArchivedCarrierService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultWorkflowArchivedCarrierService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultWorkflowArchivedCarrierService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultWorkflowArchivedCarrierService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultWorkflowArchivedCarrierService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultWorkflowArchivedCarrierService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultWorkflowArchivedCarrierService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultWorkflowArchivedCarrierService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultWorkflowArchivedCarrierService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultWorkflowArchivedCarrierService.doIndexing(request);
    }
};