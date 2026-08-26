/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultCommsDeliveryAttemptFacade
 * @description Generated facade for schema `commsDeliveryAttempt` owned by module `commsSchema`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner commsSchema
 * @schema commsDeliveryAttempt
 * @model CommsDeliveryAttemptModel
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
        return SERVICE.DefaultCommsDeliveryAttemptService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultCommsDeliveryAttemptService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultCommsDeliveryAttemptService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultCommsDeliveryAttemptService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultCommsDeliveryAttemptService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultCommsDeliveryAttemptService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultCommsDeliveryAttemptService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultCommsDeliveryAttemptService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultCommsDeliveryAttemptService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultCommsDeliveryAttemptService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultCommsDeliveryAttemptService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultCommsDeliveryAttemptService.update(request);
    }
};