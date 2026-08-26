/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultLocalizationReleaseFacade
 * @description Generated facade for schema `localizationRelease` owned by module `localizationCore`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner localizationCore
 * @schema localizationRelease
 * @model LocalizationReleaseModel
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
        return SERVICE.DefaultLocalizationReleaseService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultLocalizationReleaseService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultLocalizationReleaseService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultLocalizationReleaseService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultLocalizationReleaseService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultLocalizationReleaseService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultLocalizationReleaseService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultLocalizationReleaseService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultLocalizationReleaseService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultLocalizationReleaseService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultLocalizationReleaseService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultLocalizationReleaseService.update(request);
    }
};