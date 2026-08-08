/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultNotifyDeliveryAttemptFacade
 * @description Generated facade for schema `notifyDeliveryAttempt` owned by module `notifySchema`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner notifySchema
 * @schema notifyDeliveryAttempt
 * @model NotifyDeliveryAttemptModel
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
        return SERVICE.DefaultNotifyDeliveryAttemptService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultNotifyDeliveryAttemptService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultNotifyDeliveryAttemptService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultNotifyDeliveryAttemptService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultNotifyDeliveryAttemptService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultNotifyDeliveryAttemptService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultNotifyDeliveryAttemptService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultNotifyDeliveryAttemptService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultNotifyDeliveryAttemptService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultNotifyDeliveryAttemptService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultNotifyDeliveryAttemptService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultNotifyDeliveryAttemptService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultNotifyDeliveryAttemptService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultNotifyDeliveryAttemptService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultNotifyDeliveryAttemptService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultNotifyDeliveryAttemptService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultNotifyDeliveryAttemptService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultNotifyDeliveryAttemptService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultNotifyDeliveryAttemptService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultNotifyDeliveryAttemptService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultNotifyDeliveryAttemptService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultNotifyDeliveryAttemptService.doIndexing(request);
    }
};