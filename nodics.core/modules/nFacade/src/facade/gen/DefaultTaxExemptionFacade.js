/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultTaxExemptionFacade
 * @description Generated facade for schema `taxExemption` owned by module `tax`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner tax
 * @schema taxExemption
 * @model TaxExemptionModel
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
        return SERVICE.DefaultTaxExemptionService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultTaxExemptionService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultTaxExemptionService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultTaxExemptionService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultTaxExemptionService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultTaxExemptionService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultTaxExemptionService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultTaxExemptionService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultTaxExemptionService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultTaxExemptionService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultTaxExemptionService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultTaxExemptionService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultTaxExemptionService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultTaxExemptionService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultTaxExemptionService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultTaxExemptionService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultTaxExemptionService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultTaxExemptionService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultTaxExemptionService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultTaxExemptionService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultTaxExemptionService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultTaxExemptionService.doIndexing(request);
    }
};