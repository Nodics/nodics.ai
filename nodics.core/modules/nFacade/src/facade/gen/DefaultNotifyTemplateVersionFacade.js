/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultNotifyTemplateVersionFacade
 * @description Generated facade for schema `notifyTemplateVersion` owned by module `notifySchema`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner notifySchema
 * @schema notifyTemplateVersion
 * @model NotifyTemplateVersionModel
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
        return SERVICE.DefaultNotifyTemplateVersionService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultNotifyTemplateVersionService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultNotifyTemplateVersionService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultNotifyTemplateVersionService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultNotifyTemplateVersionService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultNotifyTemplateVersionService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultNotifyTemplateVersionService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultNotifyTemplateVersionService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultNotifyTemplateVersionService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultNotifyTemplateVersionService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultNotifyTemplateVersionService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultNotifyTemplateVersionService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultNotifyTemplateVersionService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultNotifyTemplateVersionService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultNotifyTemplateVersionService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultNotifyTemplateVersionService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultNotifyTemplateVersionService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultNotifyTemplateVersionService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultNotifyTemplateVersionService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultNotifyTemplateVersionService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultNotifyTemplateVersionService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultNotifyTemplateVersionService.doIndexing(request);
    }
};