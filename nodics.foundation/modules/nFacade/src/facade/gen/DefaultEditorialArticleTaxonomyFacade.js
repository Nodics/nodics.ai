/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultEditorialArticleTaxonomyFacade
 * @description Generated facade for schema `editorialArticleTaxonomy` owned by module `editorial`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner editorial
 * @schema editorialArticleTaxonomy
 * @model EditorialArticleTaxonomyModel
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
        return SERVICE.DefaultEditorialArticleTaxonomyService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultEditorialArticleTaxonomyService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultEditorialArticleTaxonomyService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultEditorialArticleTaxonomyService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultEditorialArticleTaxonomyService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultEditorialArticleTaxonomyService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultEditorialArticleTaxonomyService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultEditorialArticleTaxonomyService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultEditorialArticleTaxonomyService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultEditorialArticleTaxonomyService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultEditorialArticleTaxonomyService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultEditorialArticleTaxonomyService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultEditorialArticleTaxonomyService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultEditorialArticleTaxonomyService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultEditorialArticleTaxonomyService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultEditorialArticleTaxonomyService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultEditorialArticleTaxonomyService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultEditorialArticleTaxonomyService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultEditorialArticleTaxonomyService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultEditorialArticleTaxonomyService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultEditorialArticleTaxonomyService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultEditorialArticleTaxonomyService.doIndexing(request);
    }
};