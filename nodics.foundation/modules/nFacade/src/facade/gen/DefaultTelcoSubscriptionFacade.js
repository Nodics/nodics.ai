/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultTelcoSubscriptionFacade
 * @description Generated facade for schema `telcoSubscription` owned by module `telcoSubscription`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner telcoSubscription
 * @schema telcoSubscription
 * @model TelcoSubscriptionModel
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
        return SERVICE.DefaultTelcoSubscriptionService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultTelcoSubscriptionService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultTelcoSubscriptionService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultTelcoSubscriptionService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultTelcoSubscriptionService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultTelcoSubscriptionService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultTelcoSubscriptionService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultTelcoSubscriptionService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultTelcoSubscriptionService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultTelcoSubscriptionService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultTelcoSubscriptionService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultTelcoSubscriptionService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultTelcoSubscriptionService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultTelcoSubscriptionService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultTelcoSubscriptionService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultTelcoSubscriptionService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultTelcoSubscriptionService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultTelcoSubscriptionService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultTelcoSubscriptionService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultTelcoSubscriptionService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultTelcoSubscriptionService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultTelcoSubscriptionService.doIndexing(request);
    }
};