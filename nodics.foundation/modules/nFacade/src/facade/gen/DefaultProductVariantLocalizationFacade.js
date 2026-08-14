/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultProductVariantLocalizationFacade
 * @description Generated facade for schema `productVariantLocalization` owned by module `product`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner product
 * @schema productVariantLocalization
 * @model ProductVariantLocalizationModel
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
        return SERVICE.DefaultProductVariantLocalizationService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultProductVariantLocalizationService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultProductVariantLocalizationService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultProductVariantLocalizationService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultProductVariantLocalizationService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultProductVariantLocalizationService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultProductVariantLocalizationService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultProductVariantLocalizationService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultProductVariantLocalizationService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultProductVariantLocalizationService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultProductVariantLocalizationService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultProductVariantLocalizationService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultProductVariantLocalizationService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultProductVariantLocalizationService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultProductVariantLocalizationService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultProductVariantLocalizationService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultProductVariantLocalizationService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultProductVariantLocalizationService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultProductVariantLocalizationService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultProductVariantLocalizationService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultProductVariantLocalizationService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultProductVariantLocalizationService.doIndexing(request);
    }
};