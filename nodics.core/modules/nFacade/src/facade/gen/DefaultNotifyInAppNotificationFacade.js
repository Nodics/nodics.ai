/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultNotifyInAppNotificationFacade
 * @description Generated facade for schema `notifyInAppNotification` owned by module `notifySchema`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner notifySchema
 * @schema notifyInAppNotification
 * @model NotifyInAppNotificationModel
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
        return SERVICE.DefaultNotifyInAppNotificationService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultNotifyInAppNotificationService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultNotifyInAppNotificationService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultNotifyInAppNotificationService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultNotifyInAppNotificationService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultNotifyInAppNotificationService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultNotifyInAppNotificationService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultNotifyInAppNotificationService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultNotifyInAppNotificationService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultNotifyInAppNotificationService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultNotifyInAppNotificationService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultNotifyInAppNotificationService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultNotifyInAppNotificationService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultNotifyInAppNotificationService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultNotifyInAppNotificationService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultNotifyInAppNotificationService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultNotifyInAppNotificationService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultNotifyInAppNotificationService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultNotifyInAppNotificationService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultNotifyInAppNotificationService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultNotifyInAppNotificationService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultNotifyInAppNotificationService.doIndexing(request);
    }
};