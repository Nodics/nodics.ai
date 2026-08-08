/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultTaxQuoteFacade
 * @description Generated facade for schema `taxQuote` owned by module `tax`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner tax
 * @schema taxQuote
 * @model TaxQuoteModel
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
        return SERVICE.DefaultTaxQuoteService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultTaxQuoteService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultTaxQuoteService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultTaxQuoteService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultTaxQuoteService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultTaxQuoteService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultTaxQuoteService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultTaxQuoteService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultTaxQuoteService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultTaxQuoteService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultTaxQuoteService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultTaxQuoteService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultTaxQuoteService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultTaxQuoteService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultTaxQuoteService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultTaxQuoteService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultTaxQuoteService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultTaxQuoteService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultTaxQuoteService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultTaxQuoteService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultTaxQuoteService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultTaxQuoteService.doIndexing(request);
    }
};