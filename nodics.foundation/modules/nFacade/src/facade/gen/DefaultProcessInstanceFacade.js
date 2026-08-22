/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultProcessInstanceFacade
 * @description Generated facade for schema `processInstance` owned by module `flowSchema`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner flowSchema
 * @schema processInstance
 * @model ProcessInstanceModel
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
        return SERVICE.DefaultProcessInstanceService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultProcessInstanceService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultProcessInstanceService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultProcessInstanceService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultProcessInstanceService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultProcessInstanceService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultProcessInstanceService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultProcessInstanceService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultProcessInstanceService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultProcessInstanceService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultProcessInstanceService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultProcessInstanceService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultProcessInstanceService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultProcessInstanceService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultProcessInstanceService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultProcessInstanceService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultProcessInstanceService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultProcessInstanceService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultProcessInstanceService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultProcessInstanceService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultProcessInstanceService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultProcessInstanceService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultProcessInstanceService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultProcessInstanceService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultProcessInstanceService.doIndexing(request);
    }
};