/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultConfigurationFacade
 * @description Generated facade for schema `configuration` owned by module `system`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner system
 * @schema configuration
 * @model ConfigurationModel
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
        return SERVICE.DefaultConfigurationService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultConfigurationService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultConfigurationService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultConfigurationService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultConfigurationService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultConfigurationService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultConfigurationService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultConfigurationService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultConfigurationService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultConfigurationService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultConfigurationService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultConfigurationService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultConfigurationService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultConfigurationService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultConfigurationService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultConfigurationService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultConfigurationService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultConfigurationService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultConfigurationService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultConfigurationService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultConfigurationService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultConfigurationService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultConfigurationService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultConfigurationService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultConfigurationService.doIndexing(request);
    }
};