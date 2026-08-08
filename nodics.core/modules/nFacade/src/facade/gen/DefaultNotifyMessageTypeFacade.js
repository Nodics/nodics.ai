/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultNotifyMessageTypeFacade
 * @description Generated facade for schema `notifyMessageType` owned by module `notifySchema`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner notifySchema
 * @schema notifyMessageType
 * @model NotifyMessageTypeModel
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
        return SERVICE.DefaultNotifyMessageTypeService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultNotifyMessageTypeService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultNotifyMessageTypeService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultNotifyMessageTypeService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultNotifyMessageTypeService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultNotifyMessageTypeService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultNotifyMessageTypeService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultNotifyMessageTypeService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultNotifyMessageTypeService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultNotifyMessageTypeService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultNotifyMessageTypeService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultNotifyMessageTypeService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultNotifyMessageTypeService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultNotifyMessageTypeService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultNotifyMessageTypeService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultNotifyMessageTypeService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultNotifyMessageTypeService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultNotifyMessageTypeService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultNotifyMessageTypeService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultNotifyMessageTypeService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultNotifyMessageTypeService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultNotifyMessageTypeService.doIndexing(request);
    }
};