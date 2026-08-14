/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultCustomerReviewProjectionFacade
 * @description Generated facade for schema `customerReviewProjection` owned by module `customerReview`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner customerReview
 * @schema customerReviewProjection
 * @model CustomerReviewProjectionModel
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
        return SERVICE.DefaultCustomerReviewProjectionService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultCustomerReviewProjectionService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultCustomerReviewProjectionService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultCustomerReviewProjectionService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultCustomerReviewProjectionService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultCustomerReviewProjectionService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultCustomerReviewProjectionService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultCustomerReviewProjectionService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultCustomerReviewProjectionService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultCustomerReviewProjectionService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultCustomerReviewProjectionService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultCustomerReviewProjectionService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultCustomerReviewProjectionService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultCustomerReviewProjectionService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultCustomerReviewProjectionService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultCustomerReviewProjectionService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultCustomerReviewProjectionService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultCustomerReviewProjectionService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultCustomerReviewProjectionService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultCustomerReviewProjectionService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultCustomerReviewProjectionService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultCustomerReviewProjectionService.doIndexing(request);
    }
};