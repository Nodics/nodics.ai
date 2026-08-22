/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultEngagementCompatibilityRecordFacade
 * @description Generated facade for schema `engagementCompatibilityRecord` owned by module `engagementCore`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner engagementCore
 * @schema engagementCompatibilityRecord
 * @model EngagementCompatibilityRecordModel
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
        return SERVICE.DefaultEngagementCompatibilityRecordService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultEngagementCompatibilityRecordService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultEngagementCompatibilityRecordService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultEngagementCompatibilityRecordService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultEngagementCompatibilityRecordService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultEngagementCompatibilityRecordService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultEngagementCompatibilityRecordService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultEngagementCompatibilityRecordService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultEngagementCompatibilityRecordService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultEngagementCompatibilityRecordService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultEngagementCompatibilityRecordService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultEngagementCompatibilityRecordService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultEngagementCompatibilityRecordService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultEngagementCompatibilityRecordService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultEngagementCompatibilityRecordService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultEngagementCompatibilityRecordService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultEngagementCompatibilityRecordService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultEngagementCompatibilityRecordService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultEngagementCompatibilityRecordService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultEngagementCompatibilityRecordService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultEngagementCompatibilityRecordService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultEngagementCompatibilityRecordService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultEngagementCompatibilityRecordService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultEngagementCompatibilityRecordService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultEngagementCompatibilityRecordService.doIndexing(request);
    }
};