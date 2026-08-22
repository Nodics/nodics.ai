/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultCustomerReviewRequestFacade
 * @description Generated facade for schema `customerReviewRequest` owned by module `customerReview`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner customerReview
 * @schema customerReviewRequest
 * @model CustomerReviewRequestModel
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
        return SERVICE.DefaultCustomerReviewRequestService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultCustomerReviewRequestService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultCustomerReviewRequestService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultCustomerReviewRequestService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultCustomerReviewRequestService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultCustomerReviewRequestService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultCustomerReviewRequestService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultCustomerReviewRequestService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultCustomerReviewRequestService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultCustomerReviewRequestService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultCustomerReviewRequestService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultCustomerReviewRequestService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultCustomerReviewRequestService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultCustomerReviewRequestService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultCustomerReviewRequestService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultCustomerReviewRequestService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultCustomerReviewRequestService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultCustomerReviewRequestService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultCustomerReviewRequestService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultCustomerReviewRequestService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultCustomerReviewRequestService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultCustomerReviewRequestService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultCustomerReviewRequestService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultCustomerReviewRequestService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultCustomerReviewRequestService.doIndexing(request);
    }
};