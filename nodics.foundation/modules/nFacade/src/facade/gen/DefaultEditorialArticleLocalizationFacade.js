/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultEditorialArticleLocalizationFacade
 * @description Generated facade for schema `editorialArticleLocalization` owned by module `editorial`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner editorial
 * @schema editorialArticleLocalization
 * @model EditorialArticleLocalizationModel
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
        return SERVICE.DefaultEditorialArticleLocalizationService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultEditorialArticleLocalizationService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultEditorialArticleLocalizationService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultEditorialArticleLocalizationService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultEditorialArticleLocalizationService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultEditorialArticleLocalizationService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultEditorialArticleLocalizationService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultEditorialArticleLocalizationService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultEditorialArticleLocalizationService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultEditorialArticleLocalizationService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultEditorialArticleLocalizationService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultEditorialArticleLocalizationService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultEditorialArticleLocalizationService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultEditorialArticleLocalizationService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultEditorialArticleLocalizationService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultEditorialArticleLocalizationService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultEditorialArticleLocalizationService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultEditorialArticleLocalizationService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultEditorialArticleLocalizationService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultEditorialArticleLocalizationService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultEditorialArticleLocalizationService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultEditorialArticleLocalizationService.doIndexing(request);
    }
};