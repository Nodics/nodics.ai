/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultEngagementClassificationFacade
 * @description Generated facade for schema `engagementClassification` owned by module `engagementCore`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner engagementCore
 * @schema engagementClassification
 * @model EngagementClassificationModel
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
        return SERVICE.DefaultEngagementClassificationService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultEngagementClassificationService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultEngagementClassificationService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultEngagementClassificationService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultEngagementClassificationService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultEngagementClassificationService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultEngagementClassificationService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultEngagementClassificationService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultEngagementClassificationService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultEngagementClassificationService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultEngagementClassificationService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultEngagementClassificationService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultEngagementClassificationService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultEngagementClassificationService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultEngagementClassificationService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultEngagementClassificationService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultEngagementClassificationService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultEngagementClassificationService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultEngagementClassificationService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultEngagementClassificationService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultEngagementClassificationService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultEngagementClassificationService.doIndexing(request);
    }
};