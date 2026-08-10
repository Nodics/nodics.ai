/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultTrackingEventFacade
 * @description Generated facade for schema `trackingEvent` owned by module `fulfillmentCore`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner fulfillmentCore
 * @schema trackingEvent
 * @model TrackingEventModel
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
        return SERVICE.DefaultTrackingEventService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultTrackingEventService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultTrackingEventService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultTrackingEventService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultTrackingEventService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultTrackingEventService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultTrackingEventService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultTrackingEventService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultTrackingEventService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultTrackingEventService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultTrackingEventService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultTrackingEventService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultTrackingEventService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultTrackingEventService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultTrackingEventService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultTrackingEventService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultTrackingEventService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultTrackingEventService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultTrackingEventService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultTrackingEventService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultTrackingEventService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultTrackingEventService.doIndexing(request);
    }
};