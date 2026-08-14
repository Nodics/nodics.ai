/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultEngagementPrivacyCaseFacade
 * @description Generated facade for schema `engagementPrivacyCase` owned by module `engagementCore`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner engagementCore
 * @schema engagementPrivacyCase
 * @model EngagementPrivacyCaseModel
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
        return SERVICE.DefaultEngagementPrivacyCaseService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultEngagementPrivacyCaseService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultEngagementPrivacyCaseService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultEngagementPrivacyCaseService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultEngagementPrivacyCaseService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultEngagementPrivacyCaseService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultEngagementPrivacyCaseService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultEngagementPrivacyCaseService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultEngagementPrivacyCaseService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultEngagementPrivacyCaseService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultEngagementPrivacyCaseService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultEngagementPrivacyCaseService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultEngagementPrivacyCaseService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultEngagementPrivacyCaseService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultEngagementPrivacyCaseService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultEngagementPrivacyCaseService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultEngagementPrivacyCaseService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultEngagementPrivacyCaseService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultEngagementPrivacyCaseService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultEngagementPrivacyCaseService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultEngagementPrivacyCaseService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultEngagementPrivacyCaseService.doIndexing(request);
    }
};