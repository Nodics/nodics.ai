/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultNotifyDeliverySuppressionFacade
 * @description Generated facade for schema `notifyDeliverySuppression` owned by module `notifySchema`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner notifySchema
 * @schema notifyDeliverySuppression
 * @model NotifyDeliverySuppressionModel
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
        return SERVICE.DefaultNotifyDeliverySuppressionService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultNotifyDeliverySuppressionService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultNotifyDeliverySuppressionService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultNotifyDeliverySuppressionService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultNotifyDeliverySuppressionService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultNotifyDeliverySuppressionService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultNotifyDeliverySuppressionService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultNotifyDeliverySuppressionService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultNotifyDeliverySuppressionService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultNotifyDeliverySuppressionService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultNotifyDeliverySuppressionService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultNotifyDeliverySuppressionService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultNotifyDeliverySuppressionService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultNotifyDeliverySuppressionService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultNotifyDeliverySuppressionService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultNotifyDeliverySuppressionService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultNotifyDeliverySuppressionService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultNotifyDeliverySuppressionService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultNotifyDeliverySuppressionService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultNotifyDeliverySuppressionService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultNotifyDeliverySuppressionService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultNotifyDeliverySuppressionService.doIndexing(request);
    }
};