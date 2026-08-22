/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultCronJobLogFacade
 * @description Generated facade for schema `cronJobLog` owned by module `cronjob`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner cronjob
 * @schema cronJobLog
 * @model CronJobLogModel
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
        return SERVICE.DefaultCronJobLogService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultCronJobLogService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultCronJobLogService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultCronJobLogService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultCronJobLogService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultCronJobLogService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultCronJobLogService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultCronJobLogService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultCronJobLogService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultCronJobLogService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultCronJobLogService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultCronJobLogService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultCronJobLogService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultCronJobLogService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultCronJobLogService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultCronJobLogService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultCronJobLogService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultCronJobLogService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultCronJobLogService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultCronJobLogService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultCronJobLogService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultCronJobLogService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultCronJobLogService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultCronJobLogService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultCronJobLogService.doIndexing(request);
    }
};