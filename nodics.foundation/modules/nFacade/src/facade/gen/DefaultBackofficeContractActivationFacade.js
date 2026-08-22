/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultBackofficeContractActivationFacade
 * @description Generated facade for schema `backofficeContractActivation` owned by module `backoffice`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner backoffice
 * @schema backofficeContractActivation
 * @model BackofficeContractActivationModel
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
        return SERVICE.DefaultBackofficeContractActivationService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultBackofficeContractActivationService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultBackofficeContractActivationService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultBackofficeContractActivationService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultBackofficeContractActivationService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultBackofficeContractActivationService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultBackofficeContractActivationService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultBackofficeContractActivationService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultBackofficeContractActivationService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultBackofficeContractActivationService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultBackofficeContractActivationService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultBackofficeContractActivationService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultBackofficeContractActivationService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultBackofficeContractActivationService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultBackofficeContractActivationService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultBackofficeContractActivationService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultBackofficeContractActivationService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultBackofficeContractActivationService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultBackofficeContractActivationService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultBackofficeContractActivationService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultBackofficeContractActivationService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultBackofficeContractActivationService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultBackofficeContractActivationService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultBackofficeContractActivationService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultBackofficeContractActivationService.doIndexing(request);
    }
};