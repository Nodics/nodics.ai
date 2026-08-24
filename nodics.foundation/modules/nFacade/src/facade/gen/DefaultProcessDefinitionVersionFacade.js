/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultProcessDefinitionVersionFacade
 * @description Generated facade for schema `processDefinitionVersion` owned by module `workflow`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner workflow
 * @schema processDefinitionVersion
 * @model ProcessDefinitionVersionModel
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
        return SERVICE.DefaultProcessDefinitionVersionService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultProcessDefinitionVersionService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultProcessDefinitionVersionService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultProcessDefinitionVersionService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultProcessDefinitionVersionService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultProcessDefinitionVersionService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultProcessDefinitionVersionService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultProcessDefinitionVersionService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultProcessDefinitionVersionService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultProcessDefinitionVersionService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultProcessDefinitionVersionService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultProcessDefinitionVersionService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultProcessDefinitionVersionService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultProcessDefinitionVersionService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultProcessDefinitionVersionService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultProcessDefinitionVersionService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultProcessDefinitionVersionService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultProcessDefinitionVersionService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultProcessDefinitionVersionService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultProcessDefinitionVersionService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultProcessDefinitionVersionService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultProcessDefinitionVersionService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultProcessDefinitionVersionService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultProcessDefinitionVersionService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultProcessDefinitionVersionService.doIndexing(request);
    }
};