/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultPointOfServiceFacade
 * @description Generated facade for schema `pointOfService` owned by module `store`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner store
 * @schema pointOfService
 * @model PointOfServiceModel
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
        return SERVICE.DefaultPointOfServiceService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultPointOfServiceService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultPointOfServiceService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultPointOfServiceService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultPointOfServiceService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultPointOfServiceService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultPointOfServiceService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultPointOfServiceService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultPointOfServiceService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultPointOfServiceService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultPointOfServiceService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultPointOfServiceService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultPointOfServiceService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultPointOfServiceService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultPointOfServiceService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultPointOfServiceService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultPointOfServiceService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultPointOfServiceService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultPointOfServiceService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultPointOfServiceService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultPointOfServiceService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultPointOfServiceService.doIndexing(request);
    }
};