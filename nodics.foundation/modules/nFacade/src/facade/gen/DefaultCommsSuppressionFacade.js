/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultCommsSuppressionFacade
 * @description Generated facade for schema `commsSuppression` owned by module `commsSchema`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner commsSchema
 * @schema commsSuppression
 * @model CommsSuppressionModel
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
        return SERVICE.DefaultCommsSuppressionService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultCommsSuppressionService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultCommsSuppressionService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultCommsSuppressionService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultCommsSuppressionService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultCommsSuppressionService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultCommsSuppressionService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultCommsSuppressionService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultCommsSuppressionService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultCommsSuppressionService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultCommsSuppressionService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultCommsSuppressionService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultCommsSuppressionService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultCommsSuppressionService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultCommsSuppressionService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultCommsSuppressionService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultCommsSuppressionService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultCommsSuppressionService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultCommsSuppressionService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultCommsSuppressionService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultCommsSuppressionService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultCommsSuppressionService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultCommsSuppressionService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultCommsSuppressionService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultCommsSuppressionService.doIndexing(request);
    }
};