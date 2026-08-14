/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultCustomerFeedbackHandoffFacade
 * @description Generated facade for schema `customerFeedbackHandoff` owned by module `customerFeedback`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner customerFeedback
 * @schema customerFeedbackHandoff
 * @model CustomerFeedbackHandoffModel
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
        return SERVICE.DefaultCustomerFeedbackHandoffService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultCustomerFeedbackHandoffService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultCustomerFeedbackHandoffService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultCustomerFeedbackHandoffService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultCustomerFeedbackHandoffService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultCustomerFeedbackHandoffService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultCustomerFeedbackHandoffService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultCustomerFeedbackHandoffService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultCustomerFeedbackHandoffService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultCustomerFeedbackHandoffService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultCustomerFeedbackHandoffService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultCustomerFeedbackHandoffService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultCustomerFeedbackHandoffService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultCustomerFeedbackHandoffService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultCustomerFeedbackHandoffService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultCustomerFeedbackHandoffService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultCustomerFeedbackHandoffService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultCustomerFeedbackHandoffService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultCustomerFeedbackHandoffService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultCustomerFeedbackHandoffService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultCustomerFeedbackHandoffService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultCustomerFeedbackHandoffService.doIndexing(request);
    }
};