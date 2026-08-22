/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultCustomerReviewSessionFacade
 * @description Generated facade for schema `customerReviewSession` owned by module `customerReview`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner customerReview
 * @schema customerReviewSession
 * @model CustomerReviewSessionModel
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
        return SERVICE.DefaultCustomerReviewSessionService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultCustomerReviewSessionService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultCustomerReviewSessionService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultCustomerReviewSessionService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultCustomerReviewSessionService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultCustomerReviewSessionService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultCustomerReviewSessionService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultCustomerReviewSessionService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultCustomerReviewSessionService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultCustomerReviewSessionService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultCustomerReviewSessionService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultCustomerReviewSessionService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultCustomerReviewSessionService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultCustomerReviewSessionService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultCustomerReviewSessionService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultCustomerReviewSessionService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultCustomerReviewSessionService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultCustomerReviewSessionService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultCustomerReviewSessionService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultCustomerReviewSessionService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultCustomerReviewSessionService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultCustomerReviewSessionService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultCustomerReviewSessionService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultCustomerReviewSessionService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultCustomerReviewSessionService.doIndexing(request);
    }
};