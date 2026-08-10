/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultEngagementDashboardSnapshotFacade
 * @description Generated facade for schema `engagementDashboardSnapshot` owned by module `engagementCore`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner engagementCore
 * @schema engagementDashboardSnapshot
 * @model EngagementDashboardSnapshotModel
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
        return SERVICE.DefaultEngagementDashboardSnapshotService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultEngagementDashboardSnapshotService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultEngagementDashboardSnapshotService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultEngagementDashboardSnapshotService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultEngagementDashboardSnapshotService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultEngagementDashboardSnapshotService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultEngagementDashboardSnapshotService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultEngagementDashboardSnapshotService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultEngagementDashboardSnapshotService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultEngagementDashboardSnapshotService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultEngagementDashboardSnapshotService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultEngagementDashboardSnapshotService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultEngagementDashboardSnapshotService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultEngagementDashboardSnapshotService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultEngagementDashboardSnapshotService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultEngagementDashboardSnapshotService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultEngagementDashboardSnapshotService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultEngagementDashboardSnapshotService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultEngagementDashboardSnapshotService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultEngagementDashboardSnapshotService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultEngagementDashboardSnapshotService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultEngagementDashboardSnapshotService.doIndexing(request);
    }
};