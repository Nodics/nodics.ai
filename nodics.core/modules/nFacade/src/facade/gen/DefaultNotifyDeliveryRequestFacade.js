/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultNotifyDeliveryRequestFacade
 * @description Generated facade for schema `notifyDeliveryRequest` owned by module `notifySchema`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner notifySchema
 * @schema notifyDeliveryRequest
 * @model NotifyDeliveryRequestModel
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
        return SERVICE.DefaultNotifyDeliveryRequestService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultNotifyDeliveryRequestService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultNotifyDeliveryRequestService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultNotifyDeliveryRequestService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultNotifyDeliveryRequestService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultNotifyDeliveryRequestService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultNotifyDeliveryRequestService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultNotifyDeliveryRequestService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultNotifyDeliveryRequestService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultNotifyDeliveryRequestService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultNotifyDeliveryRequestService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultNotifyDeliveryRequestService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultNotifyDeliveryRequestService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultNotifyDeliveryRequestService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultNotifyDeliveryRequestService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultNotifyDeliveryRequestService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultNotifyDeliveryRequestService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultNotifyDeliveryRequestService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultNotifyDeliveryRequestService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultNotifyDeliveryRequestService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultNotifyDeliveryRequestService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultNotifyDeliveryRequestService.doIndexing(request);
    }
};