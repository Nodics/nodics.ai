/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultTaxProviderFacade
 * @description Generated facade for schema `taxProvider` owned by module `tax`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner tax
 * @schema taxProvider
 * @model TaxProviderModel
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
        return SERVICE.DefaultTaxProviderService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultTaxProviderService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultTaxProviderService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultTaxProviderService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultTaxProviderService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultTaxProviderService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultTaxProviderService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultTaxProviderService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultTaxProviderService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultTaxProviderService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultTaxProviderService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultTaxProviderService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultTaxProviderService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultTaxProviderService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultTaxProviderService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultTaxProviderService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultTaxProviderService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultTaxProviderService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultTaxProviderService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultTaxProviderService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultTaxProviderService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultTaxProviderService.doIndexing(request);
    }
};