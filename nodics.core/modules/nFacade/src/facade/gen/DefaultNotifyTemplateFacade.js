/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultNotifyTemplateFacade
 * @description Generated facade for schema `notifyTemplate` owned by module `notifySchema`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner notifySchema
 * @schema notifyTemplate
 * @model NotifyTemplateModel
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
        return SERVICE.DefaultNotifyTemplateService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultNotifyTemplateService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultNotifyTemplateService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultNotifyTemplateService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultNotifyTemplateService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultNotifyTemplateService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultNotifyTemplateService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultNotifyTemplateService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultNotifyTemplateService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultNotifyTemplateService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultNotifyTemplateService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultNotifyTemplateService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultNotifyTemplateService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultNotifyTemplateService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultNotifyTemplateService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultNotifyTemplateService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultNotifyTemplateService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultNotifyTemplateService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultNotifyTemplateService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultNotifyTemplateService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultNotifyTemplateService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultNotifyTemplateService.doIndexing(request);
    }
};