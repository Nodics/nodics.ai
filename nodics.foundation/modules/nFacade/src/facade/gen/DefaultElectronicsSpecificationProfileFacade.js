/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultElectronicsSpecificationProfileFacade
 * @description Generated facade for schema `electronicsSpecificationProfile` owned by module `electronicsProduct`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner electronicsProduct
 * @schema electronicsSpecificationProfile
 * @model ElectronicsSpecificationProfileModel
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
        return SERVICE.DefaultElectronicsSpecificationProfileService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultElectronicsSpecificationProfileService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultElectronicsSpecificationProfileService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultElectronicsSpecificationProfileService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultElectronicsSpecificationProfileService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultElectronicsSpecificationProfileService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultElectronicsSpecificationProfileService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultElectronicsSpecificationProfileService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultElectronicsSpecificationProfileService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultElectronicsSpecificationProfileService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultElectronicsSpecificationProfileService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultElectronicsSpecificationProfileService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultElectronicsSpecificationProfileService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultElectronicsSpecificationProfileService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultElectronicsSpecificationProfileService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultElectronicsSpecificationProfileService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultElectronicsSpecificationProfileService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultElectronicsSpecificationProfileService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultElectronicsSpecificationProfileService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultElectronicsSpecificationProfileService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultElectronicsSpecificationProfileService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultElectronicsSpecificationProfileService.doIndexing(request);
    }
};