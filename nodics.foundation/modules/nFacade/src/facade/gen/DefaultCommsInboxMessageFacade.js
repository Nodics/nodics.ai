/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultCommsInboxMessageFacade
 * @description Generated facade for schema `commsInboxMessage` owned by module `commsSchema`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner commsSchema
 * @schema commsInboxMessage
 * @model CommsInboxMessageModel
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
        return SERVICE.DefaultCommsInboxMessageService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultCommsInboxMessageService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultCommsInboxMessageService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultCommsInboxMessageService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultCommsInboxMessageService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultCommsInboxMessageService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultCommsInboxMessageService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultCommsInboxMessageService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultCommsInboxMessageService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultCommsInboxMessageService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultCommsInboxMessageService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultCommsInboxMessageService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultCommsInboxMessageService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultCommsInboxMessageService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultCommsInboxMessageService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultCommsInboxMessageService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultCommsInboxMessageService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultCommsInboxMessageService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultCommsInboxMessageService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultCommsInboxMessageService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultCommsInboxMessageService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultCommsInboxMessageService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultCommsInboxMessageService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultCommsInboxMessageService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultCommsInboxMessageService.doIndexing(request);
    }
};