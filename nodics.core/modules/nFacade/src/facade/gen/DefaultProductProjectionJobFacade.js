/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultProductProjectionJobFacade
 * @description Generated facade for schema `productProjectionJob` owned by module `product`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner product
 * @schema productProjectionJob
 * @model ProductProjectionJobModel
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
        return SERVICE.DefaultProductProjectionJobService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultProductProjectionJobService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultProductProjectionJobService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultProductProjectionJobService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultProductProjectionJobService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultProductProjectionJobService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultProductProjectionJobService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultProductProjectionJobService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultProductProjectionJobService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultProductProjectionJobService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultProductProjectionJobService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultProductProjectionJobService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultProductProjectionJobService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultProductProjectionJobService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultProductProjectionJobService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultProductProjectionJobService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultProductProjectionJobService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultProductProjectionJobService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultProductProjectionJobService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultProductProjectionJobService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultProductProjectionJobService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultProductProjectionJobService.doIndexing(request);
    }
};