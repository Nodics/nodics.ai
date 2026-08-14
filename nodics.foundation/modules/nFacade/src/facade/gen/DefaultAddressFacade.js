/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultAddressFacade
 * @description Generated facade for schema `address` owned by module `profile`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner profile
 * @schema address
 * @model AddressModel
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
        return SERVICE.DefaultAddressService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultAddressService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultAddressService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultAddressService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultAddressService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultAddressService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultAddressService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultAddressService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultAddressService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultAddressService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultAddressService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultAddressService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultAddressService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultAddressService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultAddressService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultAddressService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultAddressService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultAddressService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultAddressService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultAddressService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultAddressService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultAddressService.doIndexing(request);
    }
};