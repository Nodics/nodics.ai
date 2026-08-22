/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultContactCorrespondenceFacade
 * @description Generated facade for schema `contactCorrespondence` owned by module `contactSubmission`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner contactSubmission
 * @schema contactCorrespondence
 * @model ContactCorrespondenceModel
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
        return SERVICE.DefaultContactCorrespondenceService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultContactCorrespondenceService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultContactCorrespondenceService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultContactCorrespondenceService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultContactCorrespondenceService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultContactCorrespondenceService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultContactCorrespondenceService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultContactCorrespondenceService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultContactCorrespondenceService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultContactCorrespondenceService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultContactCorrespondenceService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultContactCorrespondenceService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultContactCorrespondenceService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultContactCorrespondenceService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultContactCorrespondenceService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultContactCorrespondenceService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultContactCorrespondenceService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultContactCorrespondenceService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultContactCorrespondenceService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultContactCorrespondenceService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultContactCorrespondenceService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultContactCorrespondenceService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultContactCorrespondenceService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultContactCorrespondenceService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultContactCorrespondenceService.doIndexing(request);
    }
};