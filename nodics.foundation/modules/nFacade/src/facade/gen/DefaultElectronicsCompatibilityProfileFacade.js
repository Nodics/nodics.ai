/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultElectronicsCompatibilityProfileFacade
 * @description Generated facade for schema `electronicsCompatibilityProfile` owned by module `electronicsProduct`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner electronicsProduct
 * @schema electronicsCompatibilityProfile
 * @model ElectronicsCompatibilityProfileModel
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
        return SERVICE.DefaultElectronicsCompatibilityProfileService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultElectronicsCompatibilityProfileService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultElectronicsCompatibilityProfileService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultElectronicsCompatibilityProfileService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultElectronicsCompatibilityProfileService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultElectronicsCompatibilityProfileService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultElectronicsCompatibilityProfileService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultElectronicsCompatibilityProfileService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultElectronicsCompatibilityProfileService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultElectronicsCompatibilityProfileService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultElectronicsCompatibilityProfileService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultElectronicsCompatibilityProfileService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultElectronicsCompatibilityProfileService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultElectronicsCompatibilityProfileService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultElectronicsCompatibilityProfileService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultElectronicsCompatibilityProfileService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultElectronicsCompatibilityProfileService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultElectronicsCompatibilityProfileService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultElectronicsCompatibilityProfileService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultElectronicsCompatibilityProfileService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultElectronicsCompatibilityProfileService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultElectronicsCompatibilityProfileService.doIndexing(request);
    }
};