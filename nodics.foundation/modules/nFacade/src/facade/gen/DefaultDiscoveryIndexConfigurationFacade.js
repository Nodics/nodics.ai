/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultDiscoveryIndexConfigurationFacade
 * @description Generated facade for schema `discoveryIndexConfiguration` owned by module `discoveryConfig`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner discoveryConfig
 * @schema discoveryIndexConfiguration
 * @model DiscoveryIndexConfigurationModel
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
        return SERVICE.DefaultDiscoveryIndexConfigurationService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultDiscoveryIndexConfigurationService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultDiscoveryIndexConfigurationService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultDiscoveryIndexConfigurationService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultDiscoveryIndexConfigurationService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultDiscoveryIndexConfigurationService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultDiscoveryIndexConfigurationService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultDiscoveryIndexConfigurationService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultDiscoveryIndexConfigurationService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultDiscoveryIndexConfigurationService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultDiscoveryIndexConfigurationService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultDiscoveryIndexConfigurationService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultDiscoveryIndexConfigurationService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultDiscoveryIndexConfigurationService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultDiscoveryIndexConfigurationService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultDiscoveryIndexConfigurationService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultDiscoveryIndexConfigurationService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultDiscoveryIndexConfigurationService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultDiscoveryIndexConfigurationService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultDiscoveryIndexConfigurationService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultDiscoveryIndexConfigurationService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultDiscoveryIndexConfigurationService.doIndexing(request);
    }
};