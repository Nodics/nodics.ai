/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultNotifyProviderAccountFacade
 * @description Generated facade for schema `notifyProviderAccount` owned by module `notifySchema`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner notifySchema
 * @schema notifyProviderAccount
 * @model NotifyProviderAccountModel
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
        return SERVICE.DefaultNotifyProviderAccountService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultNotifyProviderAccountService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultNotifyProviderAccountService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultNotifyProviderAccountService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultNotifyProviderAccountService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultNotifyProviderAccountService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultNotifyProviderAccountService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultNotifyProviderAccountService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultNotifyProviderAccountService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultNotifyProviderAccountService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultNotifyProviderAccountService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultNotifyProviderAccountService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultNotifyProviderAccountService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultNotifyProviderAccountService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultNotifyProviderAccountService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultNotifyProviderAccountService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultNotifyProviderAccountService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultNotifyProviderAccountService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultNotifyProviderAccountService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultNotifyProviderAccountService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultNotifyProviderAccountService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultNotifyProviderAccountService.doIndexing(request);
    }
};