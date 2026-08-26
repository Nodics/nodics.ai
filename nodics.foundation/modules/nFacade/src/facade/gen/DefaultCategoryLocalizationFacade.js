/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultCategoryLocalizationFacade
 * @description Generated facade for schema `categoryLocalization` owned by module `product`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner product
 * @schema categoryLocalization
 * @model CategoryLocalizationModel
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
        return SERVICE.DefaultCategoryLocalizationService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultCategoryLocalizationService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultCategoryLocalizationService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultCategoryLocalizationService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultCategoryLocalizationService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultCategoryLocalizationService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultCategoryLocalizationService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultCategoryLocalizationService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultCategoryLocalizationService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultCategoryLocalizationService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultCategoryLocalizationService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultCategoryLocalizationService.update(request);
    }
};