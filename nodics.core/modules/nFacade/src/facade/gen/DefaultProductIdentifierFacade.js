/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultProductIdentifierFacade
 * @description Generated facade for schema `productIdentifier` owned by module `product`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner product
 * @schema productIdentifier
 * @model ProductIdentifierModel
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
        return SERVICE.DefaultProductIdentifierService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultProductIdentifierService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultProductIdentifierService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultProductIdentifierService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultProductIdentifierService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultProductIdentifierService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultProductIdentifierService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultProductIdentifierService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultProductIdentifierService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultProductIdentifierService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultProductIdentifierService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultProductIdentifierService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultProductIdentifierService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultProductIdentifierService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultProductIdentifierService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultProductIdentifierService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultProductIdentifierService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultProductIdentifierService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultProductIdentifierService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultProductIdentifierService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultProductIdentifierService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultProductIdentifierService.doIndexing(request);
    }
};