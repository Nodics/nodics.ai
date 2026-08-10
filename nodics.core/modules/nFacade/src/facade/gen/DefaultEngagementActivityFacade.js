/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultEngagementActivityFacade
 * @description Generated facade for schema `engagementActivity` owned by module `engagementCore`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner engagementCore
 * @schema engagementActivity
 * @model EngagementActivityModel
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
        return SERVICE.DefaultEngagementActivityService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultEngagementActivityService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultEngagementActivityService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultEngagementActivityService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultEngagementActivityService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultEngagementActivityService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultEngagementActivityService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultEngagementActivityService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultEngagementActivityService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultEngagementActivityService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultEngagementActivityService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultEngagementActivityService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultEngagementActivityService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultEngagementActivityService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultEngagementActivityService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultEngagementActivityService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultEngagementActivityService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultEngagementActivityService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultEngagementActivityService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultEngagementActivityService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultEngagementActivityService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultEngagementActivityService.doIndexing(request);
    }
};