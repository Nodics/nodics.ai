/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultConfigurationActivationLogFacade
 * @description Generated facade for schema `configurationActivationLog` owned by module `dynamo`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner dynamo
 * @schema configurationActivationLog
 * @model ConfigurationActivationLogModel
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
        return SERVICE.DefaultConfigurationActivationLogService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultConfigurationActivationLogService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultConfigurationActivationLogService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultConfigurationActivationLogService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultConfigurationActivationLogService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultConfigurationActivationLogService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultConfigurationActivationLogService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultConfigurationActivationLogService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultConfigurationActivationLogService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultConfigurationActivationLogService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultConfigurationActivationLogService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultConfigurationActivationLogService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultConfigurationActivationLogService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultConfigurationActivationLogService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultConfigurationActivationLogService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultConfigurationActivationLogService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultConfigurationActivationLogService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultConfigurationActivationLogService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultConfigurationActivationLogService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultConfigurationActivationLogService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultConfigurationActivationLogService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultConfigurationActivationLogService.doIndexing(request);
    }
};