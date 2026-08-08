/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultTaxJurisdictionFacade
 * @description Generated facade for schema `taxJurisdiction` owned by module `tax`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner tax
 * @schema taxJurisdiction
 * @model TaxJurisdictionModel
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
        return SERVICE.DefaultTaxJurisdictionService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultTaxJurisdictionService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultTaxJurisdictionService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultTaxJurisdictionService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultTaxJurisdictionService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultTaxJurisdictionService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultTaxJurisdictionService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultTaxJurisdictionService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultTaxJurisdictionService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultTaxJurisdictionService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultTaxJurisdictionService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultTaxJurisdictionService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultTaxJurisdictionService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultTaxJurisdictionService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultTaxJurisdictionService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultTaxJurisdictionService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultTaxJurisdictionService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultTaxJurisdictionService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultTaxJurisdictionService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultTaxJurisdictionService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultTaxJurisdictionService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultTaxJurisdictionService.doIndexing(request);
    }
};