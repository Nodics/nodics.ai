/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultEngagementExportEvidenceFacade
 * @description Generated facade for schema `engagementExportEvidence` owned by module `engagementCore`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner engagementCore
 * @schema engagementExportEvidence
 * @model EngagementExportEvidenceModel
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
        return SERVICE.DefaultEngagementExportEvidenceService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultEngagementExportEvidenceService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultEngagementExportEvidenceService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultEngagementExportEvidenceService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultEngagementExportEvidenceService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultEngagementExportEvidenceService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultEngagementExportEvidenceService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultEngagementExportEvidenceService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultEngagementExportEvidenceService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultEngagementExportEvidenceService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultEngagementExportEvidenceService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultEngagementExportEvidenceService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultEngagementExportEvidenceService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultEngagementExportEvidenceService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultEngagementExportEvidenceService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultEngagementExportEvidenceService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultEngagementExportEvidenceService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultEngagementExportEvidenceService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultEngagementExportEvidenceService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultEngagementExportEvidenceService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultEngagementExportEvidenceService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultEngagementExportEvidenceService.doIndexing(request);
    }
};