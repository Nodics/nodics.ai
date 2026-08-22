/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultCustomerReviewVersionFacade
 * @description Generated facade for schema `customerReviewVersion` owned by module `customerReview`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner customerReview
 * @schema customerReviewVersion
 * @model CustomerReviewVersionModel
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
        return SERVICE.DefaultCustomerReviewVersionService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultCustomerReviewVersionService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultCustomerReviewVersionService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultCustomerReviewVersionService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultCustomerReviewVersionService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultCustomerReviewVersionService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultCustomerReviewVersionService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultCustomerReviewVersionService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultCustomerReviewVersionService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultCustomerReviewVersionService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultCustomerReviewVersionService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultCustomerReviewVersionService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultCustomerReviewVersionService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultCustomerReviewVersionService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultCustomerReviewVersionService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultCustomerReviewVersionService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultCustomerReviewVersionService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultCustomerReviewVersionService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultCustomerReviewVersionService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultCustomerReviewVersionService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultCustomerReviewVersionService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultCustomerReviewVersionService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultCustomerReviewVersionService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultCustomerReviewVersionService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultCustomerReviewVersionService.doIndexing(request);
    }
};