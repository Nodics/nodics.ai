/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultKycProviderExecutionAttemptFacade
 * @description Generated facade for schema `kycProviderExecutionAttempt` owned by module `kycSchema`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner kycSchema
 * @schema kycProviderExecutionAttempt
 * @model KycProviderExecutionAttemptModel
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
        return SERVICE.DefaultKycProviderExecutionAttemptService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultKycProviderExecutionAttemptService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultKycProviderExecutionAttemptService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultKycProviderExecutionAttemptService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultKycProviderExecutionAttemptService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultKycProviderExecutionAttemptService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultKycProviderExecutionAttemptService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultKycProviderExecutionAttemptService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultKycProviderExecutionAttemptService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultKycProviderExecutionAttemptService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultKycProviderExecutionAttemptService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultKycProviderExecutionAttemptService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultKycProviderExecutionAttemptService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultKycProviderExecutionAttemptService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultKycProviderExecutionAttemptService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultKycProviderExecutionAttemptService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultKycProviderExecutionAttemptService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultKycProviderExecutionAttemptService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultKycProviderExecutionAttemptService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultKycProviderExecutionAttemptService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultKycProviderExecutionAttemptService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultKycProviderExecutionAttemptService.doIndexing(request);
    }
};