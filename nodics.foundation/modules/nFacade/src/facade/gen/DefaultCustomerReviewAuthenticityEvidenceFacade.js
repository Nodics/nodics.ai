/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultCustomerReviewAuthenticityEvidenceFacade
 * @description Generated facade for schema `customerReviewAuthenticityEvidence` owned by module `customerReview`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner customerReview
 * @schema customerReviewAuthenticityEvidence
 * @model CustomerReviewAuthenticityEvidenceModel
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
        return SERVICE.DefaultCustomerReviewAuthenticityEvidenceService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultCustomerReviewAuthenticityEvidenceService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultCustomerReviewAuthenticityEvidenceService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultCustomerReviewAuthenticityEvidenceService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultCustomerReviewAuthenticityEvidenceService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultCustomerReviewAuthenticityEvidenceService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultCustomerReviewAuthenticityEvidenceService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultCustomerReviewAuthenticityEvidenceService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultCustomerReviewAuthenticityEvidenceService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultCustomerReviewAuthenticityEvidenceService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultCustomerReviewAuthenticityEvidenceService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultCustomerReviewAuthenticityEvidenceService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultCustomerReviewAuthenticityEvidenceService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultCustomerReviewAuthenticityEvidenceService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultCustomerReviewAuthenticityEvidenceService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultCustomerReviewAuthenticityEvidenceService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultCustomerReviewAuthenticityEvidenceService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultCustomerReviewAuthenticityEvidenceService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultCustomerReviewAuthenticityEvidenceService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultCustomerReviewAuthenticityEvidenceService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultCustomerReviewAuthenticityEvidenceService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultCustomerReviewAuthenticityEvidenceService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultCustomerReviewAuthenticityEvidenceService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultCustomerReviewAuthenticityEvidenceService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultCustomerReviewAuthenticityEvidenceService.doIndexing(request);
    }
};