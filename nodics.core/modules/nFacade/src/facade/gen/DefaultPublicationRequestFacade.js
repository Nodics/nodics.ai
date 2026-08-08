/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultPublicationRequestFacade
 * @description Generated facade for schema `publicationRequest` owned by module `publish`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner publish
 * @schema publicationRequest
 * @model PublicationRequestModel
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
        return SERVICE.DefaultPublicationRequestService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultPublicationRequestService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultPublicationRequestService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultPublicationRequestService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultPublicationRequestService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultPublicationRequestService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultPublicationRequestService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultPublicationRequestService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultPublicationRequestService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultPublicationRequestService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultPublicationRequestService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultPublicationRequestService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultPublicationRequestService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultPublicationRequestService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultPublicationRequestService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultPublicationRequestService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultPublicationRequestService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultPublicationRequestService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultPublicationRequestService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultPublicationRequestService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultPublicationRequestService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultPublicationRequestService.doIndexing(request);
    }
};