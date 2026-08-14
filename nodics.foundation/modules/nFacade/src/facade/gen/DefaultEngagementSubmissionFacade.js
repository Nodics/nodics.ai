/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultEngagementSubmissionFacade
 * @description Generated facade for schema `engagementSubmission` owned by module `engagementCore`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner engagementCore
 * @schema engagementSubmission
 * @model EngagementSubmissionModel
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
        return SERVICE.DefaultEngagementSubmissionService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultEngagementSubmissionService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultEngagementSubmissionService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultEngagementSubmissionService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultEngagementSubmissionService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultEngagementSubmissionService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultEngagementSubmissionService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultEngagementSubmissionService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultEngagementSubmissionService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultEngagementSubmissionService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultEngagementSubmissionService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultEngagementSubmissionService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultEngagementSubmissionService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultEngagementSubmissionService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultEngagementSubmissionService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultEngagementSubmissionService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultEngagementSubmissionService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultEngagementSubmissionService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultEngagementSubmissionService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultEngagementSubmissionService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultEngagementSubmissionService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultEngagementSubmissionService.doIndexing(request);
    }
};