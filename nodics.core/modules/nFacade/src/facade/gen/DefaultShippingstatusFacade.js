/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultShippingstatusFacade
 * @description Generated facade for schema `shippingstatus` owned by module `order`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner order
 * @schema shippingstatus
 * @model ShippingstatusModel
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
        return SERVICE.DefaultShippingstatusService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultShippingstatusService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultShippingstatusService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultShippingstatusService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultShippingstatusService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultShippingstatusService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultShippingstatusService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultShippingstatusService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultShippingstatusService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultShippingstatusService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultShippingstatusService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultShippingstatusService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultShippingstatusService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultShippingstatusService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultShippingstatusService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultShippingstatusService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultShippingstatusService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultShippingstatusService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultShippingstatusService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultShippingstatusService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultShippingstatusService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultShippingstatusService.doIndexing(request);
    }
};