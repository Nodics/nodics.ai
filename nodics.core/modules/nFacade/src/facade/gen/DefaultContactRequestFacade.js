/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultContactRequestFacade
 * @description Generated facade for schema `contactRequest` owned by module `contactSubmission`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner contactSubmission
 * @schema contactRequest
 * @model ContactRequestModel
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
        return SERVICE.DefaultContactRequestService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultContactRequestService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultContactRequestService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultContactRequestService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultContactRequestService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultContactRequestService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultContactRequestService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultContactRequestService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultContactRequestService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultContactRequestService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultContactRequestService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultContactRequestService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultContactRequestService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultContactRequestService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultContactRequestService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultContactRequestService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultContactRequestService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultContactRequestService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultContactRequestService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultContactRequestService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultContactRequestService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultContactRequestService.doIndexing(request);
    }
};