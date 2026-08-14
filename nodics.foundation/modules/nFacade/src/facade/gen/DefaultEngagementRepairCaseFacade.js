/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultEngagementRepairCaseFacade
 * @description Generated facade for schema `engagementRepairCase` owned by module `engagementCore`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner engagementCore
 * @schema engagementRepairCase
 * @model EngagementRepairCaseModel
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
        return SERVICE.DefaultEngagementRepairCaseService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultEngagementRepairCaseService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultEngagementRepairCaseService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultEngagementRepairCaseService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultEngagementRepairCaseService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultEngagementRepairCaseService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultEngagementRepairCaseService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultEngagementRepairCaseService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultEngagementRepairCaseService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultEngagementRepairCaseService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultEngagementRepairCaseService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultEngagementRepairCaseService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultEngagementRepairCaseService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultEngagementRepairCaseService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultEngagementRepairCaseService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultEngagementRepairCaseService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultEngagementRepairCaseService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultEngagementRepairCaseService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultEngagementRepairCaseService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultEngagementRepairCaseService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultEngagementRepairCaseService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultEngagementRepairCaseService.doIndexing(request);
    }
};