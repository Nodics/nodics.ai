/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultEditorialContentTypeFacade
 * @description Generated facade for schema `editorialContentType` owned by module `editorial`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner editorial
 * @schema editorialContentType
 * @model EditorialContentTypeModel
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
        return SERVICE.DefaultEditorialContentTypeService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultEditorialContentTypeService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultEditorialContentTypeService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultEditorialContentTypeService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultEditorialContentTypeService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultEditorialContentTypeService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultEditorialContentTypeService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultEditorialContentTypeService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultEditorialContentTypeService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultEditorialContentTypeService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultEditorialContentTypeService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultEditorialContentTypeService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultEditorialContentTypeService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultEditorialContentTypeService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultEditorialContentTypeService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultEditorialContentTypeService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultEditorialContentTypeService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultEditorialContentTypeService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultEditorialContentTypeService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultEditorialContentTypeService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultEditorialContentTypeService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultEditorialContentTypeService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultEditorialContentTypeService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultEditorialContentTypeService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultEditorialContentTypeService.doIndexing(request);
    }
};