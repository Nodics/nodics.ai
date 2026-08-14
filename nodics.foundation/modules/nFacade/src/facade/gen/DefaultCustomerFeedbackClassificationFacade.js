/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultCustomerFeedbackClassificationFacade
 * @description Generated facade for schema `customerFeedbackClassification` owned by module `customerFeedback`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner customerFeedback
 * @schema customerFeedbackClassification
 * @model CustomerFeedbackClassificationModel
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
        return SERVICE.DefaultCustomerFeedbackClassificationService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultCustomerFeedbackClassificationService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultCustomerFeedbackClassificationService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultCustomerFeedbackClassificationService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultCustomerFeedbackClassificationService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultCustomerFeedbackClassificationService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultCustomerFeedbackClassificationService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultCustomerFeedbackClassificationService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultCustomerFeedbackClassificationService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultCustomerFeedbackClassificationService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultCustomerFeedbackClassificationService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultCustomerFeedbackClassificationService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultCustomerFeedbackClassificationService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultCustomerFeedbackClassificationService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultCustomerFeedbackClassificationService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultCustomerFeedbackClassificationService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultCustomerFeedbackClassificationService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultCustomerFeedbackClassificationService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultCustomerFeedbackClassificationService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultCustomerFeedbackClassificationService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultCustomerFeedbackClassificationService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultCustomerFeedbackClassificationService.doIndexing(request);
    }
};