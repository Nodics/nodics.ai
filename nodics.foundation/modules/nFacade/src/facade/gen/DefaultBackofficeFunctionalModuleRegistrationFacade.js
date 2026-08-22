/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultBackofficeFunctionalModuleRegistrationFacade
 * @description Generated facade for schema `backofficeFunctionalModuleRegistration` owned by module `backoffice`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner backoffice
 * @schema backofficeFunctionalModuleRegistration
 * @model BackofficeFunctionalModuleRegistrationModel
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
        return SERVICE.DefaultBackofficeFunctionalModuleRegistrationService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultBackofficeFunctionalModuleRegistrationService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultBackofficeFunctionalModuleRegistrationService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultBackofficeFunctionalModuleRegistrationService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultBackofficeFunctionalModuleRegistrationService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultBackofficeFunctionalModuleRegistrationService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultBackofficeFunctionalModuleRegistrationService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultBackofficeFunctionalModuleRegistrationService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultBackofficeFunctionalModuleRegistrationService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultBackofficeFunctionalModuleRegistrationService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultBackofficeFunctionalModuleRegistrationService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultBackofficeFunctionalModuleRegistrationService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultBackofficeFunctionalModuleRegistrationService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultBackofficeFunctionalModuleRegistrationService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultBackofficeFunctionalModuleRegistrationService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultBackofficeFunctionalModuleRegistrationService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultBackofficeFunctionalModuleRegistrationService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultBackofficeFunctionalModuleRegistrationService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultBackofficeFunctionalModuleRegistrationService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultBackofficeFunctionalModuleRegistrationService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultBackofficeFunctionalModuleRegistrationService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultBackofficeFunctionalModuleRegistrationService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultBackofficeFunctionalModuleRegistrationService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultBackofficeFunctionalModuleRegistrationService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultBackofficeFunctionalModuleRegistrationService.doIndexing(request);
    }
};