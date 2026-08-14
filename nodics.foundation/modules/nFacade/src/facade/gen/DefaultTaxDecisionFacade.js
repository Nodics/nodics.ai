/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultTaxDecisionFacade
 * @description Generated facade for schema `taxDecision` owned by module `tax`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner tax
 * @schema taxDecision
 * @model TaxDecisionModel
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
        return SERVICE.DefaultTaxDecisionService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultTaxDecisionService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultTaxDecisionService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultTaxDecisionService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultTaxDecisionService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultTaxDecisionService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultTaxDecisionService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultTaxDecisionService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultTaxDecisionService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultTaxDecisionService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultTaxDecisionService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultTaxDecisionService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultTaxDecisionService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultTaxDecisionService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultTaxDecisionService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultTaxDecisionService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultTaxDecisionService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultTaxDecisionService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultTaxDecisionService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultTaxDecisionService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultTaxDecisionService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultTaxDecisionService.doIndexing(request);
    }
};