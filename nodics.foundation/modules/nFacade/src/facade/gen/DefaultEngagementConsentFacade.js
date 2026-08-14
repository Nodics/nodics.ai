/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultEngagementConsentFacade
 * @description Generated facade for schema `engagementConsent` owned by module `engagementCore`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner engagementCore
 * @schema engagementConsent
 * @model EngagementConsentModel
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
        return SERVICE.DefaultEngagementConsentService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultEngagementConsentService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultEngagementConsentService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultEngagementConsentService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultEngagementConsentService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultEngagementConsentService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultEngagementConsentService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultEngagementConsentService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultEngagementConsentService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultEngagementConsentService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultEngagementConsentService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultEngagementConsentService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultEngagementConsentService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultEngagementConsentService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultEngagementConsentService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultEngagementConsentService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultEngagementConsentService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultEngagementConsentService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultEngagementConsentService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultEngagementConsentService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultEngagementConsentService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultEngagementConsentService.doIndexing(request);
    }
};