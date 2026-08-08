/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultFulfillmentShipmentFacade
 * @description Generated facade for schema `fulfillmentShipment` owned by module `fulfillment`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner fulfillment
 * @schema fulfillmentShipment
 * @model FulfillmentShipmentModel
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
        return SERVICE.DefaultFulfillmentShipmentService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultFulfillmentShipmentService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultFulfillmentShipmentService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultFulfillmentShipmentService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultFulfillmentShipmentService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultFulfillmentShipmentService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultFulfillmentShipmentService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultFulfillmentShipmentService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultFulfillmentShipmentService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultFulfillmentShipmentService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultFulfillmentShipmentService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultFulfillmentShipmentService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultFulfillmentShipmentService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultFulfillmentShipmentService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultFulfillmentShipmentService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultFulfillmentShipmentService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultFulfillmentShipmentService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultFulfillmentShipmentService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultFulfillmentShipmentService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultFulfillmentShipmentService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultFulfillmentShipmentService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultFulfillmentShipmentService.doIndexing(request);
    }
};