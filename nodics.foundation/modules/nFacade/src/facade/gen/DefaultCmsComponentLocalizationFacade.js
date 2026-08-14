/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultCmsComponentLocalizationFacade
 * @description Generated facade for schema `cmsComponentLocalization` owned by module `cms`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner cms
 * @schema cmsComponentLocalization
 * @model CmsComponentLocalizationModel
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
        return SERVICE.DefaultCmsComponentLocalizationService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultCmsComponentLocalizationService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultCmsComponentLocalizationService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultCmsComponentLocalizationService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultCmsComponentLocalizationService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultCmsComponentLocalizationService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultCmsComponentLocalizationService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultCmsComponentLocalizationService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultCmsComponentLocalizationService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultCmsComponentLocalizationService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultCmsComponentLocalizationService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultCmsComponentLocalizationService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultCmsComponentLocalizationService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultCmsComponentLocalizationService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultCmsComponentLocalizationService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultCmsComponentLocalizationService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultCmsComponentLocalizationService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultCmsComponentLocalizationService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultCmsComponentLocalizationService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultCmsComponentLocalizationService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultCmsComponentLocalizationService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultCmsComponentLocalizationService.doIndexing(request);
    }
};