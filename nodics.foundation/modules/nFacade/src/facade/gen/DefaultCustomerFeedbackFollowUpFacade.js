/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultCustomerFeedbackFollowUpFacade
 * @description Generated facade for schema `customerFeedbackFollowUp` owned by module `customerFeedback`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner customerFeedback
 * @schema customerFeedbackFollowUp
 * @model CustomerFeedbackFollowUpModel
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
        return SERVICE.DefaultCustomerFeedbackFollowUpService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultCustomerFeedbackFollowUpService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultCustomerFeedbackFollowUpService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultCustomerFeedbackFollowUpService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultCustomerFeedbackFollowUpService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultCustomerFeedbackFollowUpService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultCustomerFeedbackFollowUpService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultCustomerFeedbackFollowUpService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultCustomerFeedbackFollowUpService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultCustomerFeedbackFollowUpService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultCustomerFeedbackFollowUpService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultCustomerFeedbackFollowUpService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultCustomerFeedbackFollowUpService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultCustomerFeedbackFollowUpService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultCustomerFeedbackFollowUpService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultCustomerFeedbackFollowUpService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultCustomerFeedbackFollowUpService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultCustomerFeedbackFollowUpService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultCustomerFeedbackFollowUpService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultCustomerFeedbackFollowUpService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultCustomerFeedbackFollowUpService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultCustomerFeedbackFollowUpService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultCustomerFeedbackFollowUpService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultCustomerFeedbackFollowUpService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultCustomerFeedbackFollowUpService.doIndexing(request);
    }
};