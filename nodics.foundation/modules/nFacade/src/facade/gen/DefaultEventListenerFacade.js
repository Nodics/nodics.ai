/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultEventListenerFacade
 * @description Generated facade for schema `eventListener` owned by module `system`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner system
 * @schema eventListener
 * @model EventListenerModel
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
        return SERVICE.DefaultEventListenerService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultEventListenerService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultEventListenerService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultEventListenerService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultEventListenerService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultEventListenerService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultEventListenerService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultEventListenerService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultEventListenerService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultEventListenerService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultEventListenerService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultEventListenerService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultEventListenerService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultEventListenerService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultEventListenerService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultEventListenerService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultEventListenerService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultEventListenerService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultEventListenerService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultEventListenerService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultEventListenerService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultEventListenerService.doIndexing(request);
    }
};