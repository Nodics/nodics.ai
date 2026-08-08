/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultConfigurationActivationRequestFacade
 * @description Generated facade for schema `configurationActivationRequest` owned by module `dynamo`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner dynamo
 * @schema configurationActivationRequest
 * @model ConfigurationActivationRequestModel
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
        return SERVICE.DefaultConfigurationActivationRequestService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultConfigurationActivationRequestService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultConfigurationActivationRequestService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultConfigurationActivationRequestService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultConfigurationActivationRequestService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultConfigurationActivationRequestService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultConfigurationActivationRequestService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultConfigurationActivationRequestService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultConfigurationActivationRequestService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultConfigurationActivationRequestService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultConfigurationActivationRequestService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultConfigurationActivationRequestService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultConfigurationActivationRequestService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultConfigurationActivationRequestService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultConfigurationActivationRequestService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultConfigurationActivationRequestService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultConfigurationActivationRequestService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultConfigurationActivationRequestService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultConfigurationActivationRequestService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultConfigurationActivationRequestService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultConfigurationActivationRequestService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultConfigurationActivationRequestService.doIndexing(request);
    }
};