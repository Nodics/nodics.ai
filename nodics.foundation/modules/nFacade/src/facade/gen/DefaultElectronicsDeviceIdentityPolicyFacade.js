/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultElectronicsDeviceIdentityPolicyFacade
 * @description Generated facade for schema `electronicsDeviceIdentityPolicy` owned by module `electronicsProduct`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner electronicsProduct
 * @schema electronicsDeviceIdentityPolicy
 * @model ElectronicsDeviceIdentityPolicyModel
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
        return SERVICE.DefaultElectronicsDeviceIdentityPolicyService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultElectronicsDeviceIdentityPolicyService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultElectronicsDeviceIdentityPolicyService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultElectronicsDeviceIdentityPolicyService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultElectronicsDeviceIdentityPolicyService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultElectronicsDeviceIdentityPolicyService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultElectronicsDeviceIdentityPolicyService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultElectronicsDeviceIdentityPolicyService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultElectronicsDeviceIdentityPolicyService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultElectronicsDeviceIdentityPolicyService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultElectronicsDeviceIdentityPolicyService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultElectronicsDeviceIdentityPolicyService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultElectronicsDeviceIdentityPolicyService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultElectronicsDeviceIdentityPolicyService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultElectronicsDeviceIdentityPolicyService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultElectronicsDeviceIdentityPolicyService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultElectronicsDeviceIdentityPolicyService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultElectronicsDeviceIdentityPolicyService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultElectronicsDeviceIdentityPolicyService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultElectronicsDeviceIdentityPolicyService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultElectronicsDeviceIdentityPolicyService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultElectronicsDeviceIdentityPolicyService.doIndexing(request);
    }
};