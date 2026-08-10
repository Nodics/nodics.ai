/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultCommsTemplateFacade
 * @description Generated facade for schema `commsTemplate` owned by module `commsSchema`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner commsSchema
 * @schema commsTemplate
 * @model CommsTemplateModel
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
        return SERVICE.DefaultCommsTemplateService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultCommsTemplateService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultCommsTemplateService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultCommsTemplateService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultCommsTemplateService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultCommsTemplateService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultCommsTemplateService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultCommsTemplateService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultCommsTemplateService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultCommsTemplateService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultCommsTemplateService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultCommsTemplateService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultCommsTemplateService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultCommsTemplateService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultCommsTemplateService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultCommsTemplateService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultCommsTemplateService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultCommsTemplateService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultCommsTemplateService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultCommsTemplateService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultCommsTemplateService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultCommsTemplateService.doIndexing(request);
    }
};