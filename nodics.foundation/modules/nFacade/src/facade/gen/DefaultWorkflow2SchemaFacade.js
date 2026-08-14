/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultWorkflow2SchemaFacade
 * @description Generated facade for schema `workflow2Schema` owned by module `system`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner system
 * @schema workflow2Schema
 * @model Workflow2SchemaModel
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
        return SERVICE.DefaultWorkflow2SchemaService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultWorkflow2SchemaService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultWorkflow2SchemaService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultWorkflow2SchemaService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultWorkflow2SchemaService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultWorkflow2SchemaService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultWorkflow2SchemaService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultWorkflow2SchemaService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultWorkflow2SchemaService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultWorkflow2SchemaService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultWorkflow2SchemaService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultWorkflow2SchemaService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultWorkflow2SchemaService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultWorkflow2SchemaService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultWorkflow2SchemaService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultWorkflow2SchemaService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultWorkflow2SchemaService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultWorkflow2SchemaService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultWorkflow2SchemaService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultWorkflow2SchemaService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultWorkflow2SchemaService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultWorkflow2SchemaService.doIndexing(request);
    }
};