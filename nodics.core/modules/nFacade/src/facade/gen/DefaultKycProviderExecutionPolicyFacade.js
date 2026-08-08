/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultKycProviderExecutionPolicyFacade
 * @description Generated facade for schema `kycProviderExecutionPolicy` owned by module `kycSchema`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner kycSchema
 * @schema kycProviderExecutionPolicy
 * @model KycProviderExecutionPolicyModel
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
        return SERVICE.DefaultKycProviderExecutionPolicyService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultKycProviderExecutionPolicyService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultKycProviderExecutionPolicyService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultKycProviderExecutionPolicyService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultKycProviderExecutionPolicyService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultKycProviderExecutionPolicyService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultKycProviderExecutionPolicyService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultKycProviderExecutionPolicyService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultKycProviderExecutionPolicyService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultKycProviderExecutionPolicyService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultKycProviderExecutionPolicyService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultKycProviderExecutionPolicyService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultKycProviderExecutionPolicyService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultKycProviderExecutionPolicyService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultKycProviderExecutionPolicyService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultKycProviderExecutionPolicyService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultKycProviderExecutionPolicyService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultKycProviderExecutionPolicyService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultKycProviderExecutionPolicyService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultKycProviderExecutionPolicyService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultKycProviderExecutionPolicyService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultKycProviderExecutionPolicyService.doIndexing(request);
    }
};