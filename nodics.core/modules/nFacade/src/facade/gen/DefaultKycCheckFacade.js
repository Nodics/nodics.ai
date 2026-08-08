/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultKycCheckFacade
 * @description Generated facade for schema `kycCheck` owned by module `kycSchema`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner kycSchema
 * @schema kycCheck
 * @model KycCheckModel
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
        return SERVICE.DefaultKycCheckService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultKycCheckService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultKycCheckService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultKycCheckService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultKycCheckService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultKycCheckService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultKycCheckService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultKycCheckService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultKycCheckService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultKycCheckService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultKycCheckService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultKycCheckService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultKycCheckService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultKycCheckService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultKycCheckService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultKycCheckService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultKycCheckService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultKycCheckService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultKycCheckService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultKycCheckService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultKycCheckService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultKycCheckService.doIndexing(request);
    }
};