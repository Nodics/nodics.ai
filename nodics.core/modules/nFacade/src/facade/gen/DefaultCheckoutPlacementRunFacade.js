/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultCheckoutPlacementRunFacade
 * @description Generated facade for schema `checkoutPlacementRun` owned by module `order`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner order
 * @schema checkoutPlacementRun
 * @model CheckoutPlacementRunModel
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
        return SERVICE.DefaultCheckoutPlacementRunService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultCheckoutPlacementRunService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultCheckoutPlacementRunService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultCheckoutPlacementRunService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultCheckoutPlacementRunService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultCheckoutPlacementRunService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultCheckoutPlacementRunService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultCheckoutPlacementRunService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultCheckoutPlacementRunService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultCheckoutPlacementRunService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultCheckoutPlacementRunService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultCheckoutPlacementRunService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultCheckoutPlacementRunService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultCheckoutPlacementRunService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultCheckoutPlacementRunService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultCheckoutPlacementRunService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultCheckoutPlacementRunService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultCheckoutPlacementRunService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultCheckoutPlacementRunService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultCheckoutPlacementRunService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultCheckoutPlacementRunService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultCheckoutPlacementRunService.doIndexing(request);
    }
};