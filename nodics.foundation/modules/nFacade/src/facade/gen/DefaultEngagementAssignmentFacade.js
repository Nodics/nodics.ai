/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultEngagementAssignmentFacade
 * @description Generated facade for schema `engagementAssignment` owned by module `engagementCore`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner engagementCore
 * @schema engagementAssignment
 * @model EngagementAssignmentModel
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
        return SERVICE.DefaultEngagementAssignmentService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultEngagementAssignmentService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultEngagementAssignmentService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultEngagementAssignmentService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultEngagementAssignmentService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultEngagementAssignmentService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultEngagementAssignmentService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultEngagementAssignmentService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultEngagementAssignmentService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultEngagementAssignmentService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultEngagementAssignmentService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultEngagementAssignmentService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultEngagementAssignmentService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultEngagementAssignmentService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultEngagementAssignmentService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultEngagementAssignmentService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultEngagementAssignmentService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultEngagementAssignmentService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultEngagementAssignmentService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultEngagementAssignmentService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultEngagementAssignmentService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultEngagementAssignmentService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultEngagementAssignmentService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultEngagementAssignmentService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultEngagementAssignmentService.doIndexing(request);
    }
};