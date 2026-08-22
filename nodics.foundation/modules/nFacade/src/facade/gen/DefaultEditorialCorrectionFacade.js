/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultEditorialCorrectionFacade
 * @description Generated facade for schema `editorialCorrection` owned by module `editorial`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner editorial
 * @schema editorialCorrection
 * @model EditorialCorrectionModel
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
        return SERVICE.DefaultEditorialCorrectionService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultEditorialCorrectionService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultEditorialCorrectionService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultEditorialCorrectionService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultEditorialCorrectionService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultEditorialCorrectionService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultEditorialCorrectionService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultEditorialCorrectionService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultEditorialCorrectionService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultEditorialCorrectionService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultEditorialCorrectionService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultEditorialCorrectionService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultEditorialCorrectionService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultEditorialCorrectionService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultEditorialCorrectionService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultEditorialCorrectionService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultEditorialCorrectionService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultEditorialCorrectionService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultEditorialCorrectionService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultEditorialCorrectionService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultEditorialCorrectionService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultEditorialCorrectionService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultEditorialCorrectionService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultEditorialCorrectionService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultEditorialCorrectionService.doIndexing(request);
    }
};