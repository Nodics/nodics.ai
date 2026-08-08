/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultProductReleaseManifestFacade
 * @description Generated facade for schema `productReleaseManifest` owned by module `product`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner product
 * @schema productReleaseManifest
 * @model ProductReleaseManifestModel
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
        return SERVICE.DefaultProductReleaseManifestService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultProductReleaseManifestService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultProductReleaseManifestService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultProductReleaseManifestService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultProductReleaseManifestService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultProductReleaseManifestService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultProductReleaseManifestService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultProductReleaseManifestService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultProductReleaseManifestService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultProductReleaseManifestService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultProductReleaseManifestService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultProductReleaseManifestService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultProductReleaseManifestService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultProductReleaseManifestService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultProductReleaseManifestService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultProductReleaseManifestService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultProductReleaseManifestService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultProductReleaseManifestService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultProductReleaseManifestService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultProductReleaseManifestService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultProductReleaseManifestService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultProductReleaseManifestService.doIndexing(request);
    }
};