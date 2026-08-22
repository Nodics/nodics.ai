/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultEditorialAuthorFacade
 * @description Generated facade for schema `editorialAuthor` owned by module `editorial`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner editorial
 * @schema editorialAuthor
 * @model EditorialAuthorModel
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
        return SERVICE.DefaultEditorialAuthorService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultEditorialAuthorService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultEditorialAuthorService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultEditorialAuthorService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultEditorialAuthorService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultEditorialAuthorService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultEditorialAuthorService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultEditorialAuthorService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultEditorialAuthorService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultEditorialAuthorService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultEditorialAuthorService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultEditorialAuthorService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultEditorialAuthorService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultEditorialAuthorService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultEditorialAuthorService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultEditorialAuthorService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultEditorialAuthorService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultEditorialAuthorService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultEditorialAuthorService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultEditorialAuthorService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultEditorialAuthorService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultEditorialAuthorService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultEditorialAuthorService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultEditorialAuthorService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultEditorialAuthorService.doIndexing(request);
    }
};