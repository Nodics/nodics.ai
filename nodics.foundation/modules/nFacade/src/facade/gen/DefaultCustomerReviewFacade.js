/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultCustomerReviewFacade
 * @description Generated facade for schema `customerReview` owned by module `customerReview`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner customerReview
 * @schema customerReview
 * @model CustomerReviewModel
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
        return SERVICE.DefaultCustomerReviewService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultCustomerReviewService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultCustomerReviewService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultCustomerReviewService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultCustomerReviewService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultCustomerReviewService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultCustomerReviewService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultCustomerReviewService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultCustomerReviewService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultCustomerReviewService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultCustomerReviewService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultCustomerReviewService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultCustomerReviewService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultCustomerReviewService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultCustomerReviewService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultCustomerReviewService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultCustomerReviewService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultCustomerReviewService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultCustomerReviewService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultCustomerReviewService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultCustomerReviewService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultCustomerReviewService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultCustomerReviewService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultCustomerReviewService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultCustomerReviewService.doIndexing(request);
    }
};