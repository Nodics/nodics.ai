/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultProductSearchProjectionFacade
 * @description Generated facade for schema `productSearchProjection` owned by module `product`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner product
 * @schema productSearchProjection
 * @model ProductSearchProjectionModel
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
        return SERVICE.DefaultProductSearchProjectionService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultProductSearchProjectionService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultProductSearchProjectionService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultProductSearchProjectionService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultProductSearchProjectionService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultProductSearchProjectionService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultProductSearchProjectionService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultProductSearchProjectionService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultProductSearchProjectionService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultProductSearchProjectionService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultProductSearchProjectionService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultProductSearchProjectionService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultProductSearchProjectionService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultProductSearchProjectionService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultProductSearchProjectionService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultProductSearchProjectionService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultProductSearchProjectionService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultProductSearchProjectionService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultProductSearchProjectionService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultProductSearchProjectionService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultProductSearchProjectionService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultProductSearchProjectionService.doIndexing(request);
    }
};