/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultNotifyChannelFacade
 * @description Generated facade for schema `notifyChannel` owned by module `notifySchema`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner notifySchema
 * @schema notifyChannel
 * @model NotifyChannelModel
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
        return SERVICE.DefaultNotifyChannelService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultNotifyChannelService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultNotifyChannelService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultNotifyChannelService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultNotifyChannelService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultNotifyChannelService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultNotifyChannelService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultNotifyChannelService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultNotifyChannelService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultNotifyChannelService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultNotifyChannelService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultNotifyChannelService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultNotifyChannelService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultNotifyChannelService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultNotifyChannelService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultNotifyChannelService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultNotifyChannelService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultNotifyChannelService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultNotifyChannelService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultNotifyChannelService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultNotifyChannelService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultNotifyChannelService.doIndexing(request);
    }
};