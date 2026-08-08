/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultKycProviderFacade
 * @description Generated facade for schema `kycProvider` owned by module `kycSchema`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner kycSchema
 * @schema kycProvider
 * @model KycProviderModel
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
        return SERVICE.DefaultKycProviderService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultKycProviderService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultKycProviderService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultKycProviderService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultKycProviderService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultKycProviderService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultKycProviderService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultKycProviderService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultKycProviderService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultKycProviderService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultKycProviderService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultKycProviderService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultKycProviderService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultKycProviderService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultKycProviderService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultKycProviderService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultKycProviderService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultKycProviderService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultKycProviderService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultKycProviderService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultKycProviderService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultKycProviderService.doIndexing(request);
    }
};