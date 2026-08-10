/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultEngagementDeliveryAttemptFacade
 * @description Generated facade for schema `engagementDeliveryAttempt` owned by module `engagementCore`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner engagementCore
 * @schema engagementDeliveryAttempt
 * @model EngagementDeliveryAttemptModel
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
        return SERVICE.DefaultEngagementDeliveryAttemptService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultEngagementDeliveryAttemptService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultEngagementDeliveryAttemptService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultEngagementDeliveryAttemptService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultEngagementDeliveryAttemptService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultEngagementDeliveryAttemptService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultEngagementDeliveryAttemptService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultEngagementDeliveryAttemptService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultEngagementDeliveryAttemptService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultEngagementDeliveryAttemptService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultEngagementDeliveryAttemptService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultEngagementDeliveryAttemptService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultEngagementDeliveryAttemptService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultEngagementDeliveryAttemptService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultEngagementDeliveryAttemptService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultEngagementDeliveryAttemptService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultEngagementDeliveryAttemptService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultEngagementDeliveryAttemptService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultEngagementDeliveryAttemptService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultEngagementDeliveryAttemptService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultEngagementDeliveryAttemptService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultEngagementDeliveryAttemptService.doIndexing(request);
    }
};