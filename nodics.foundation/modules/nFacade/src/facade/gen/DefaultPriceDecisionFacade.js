/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultPriceDecisionFacade
 * @description Generated facade for schema `priceDecision` owned by module `pricing`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner pricing
 * @schema priceDecision
 * @model PriceDecisionModel
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
        return SERVICE.DefaultPriceDecisionService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultPriceDecisionService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultPriceDecisionService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultPriceDecisionService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultPriceDecisionService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultPriceDecisionService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultPriceDecisionService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultPriceDecisionService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultPriceDecisionService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultPriceDecisionService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultPriceDecisionService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultPriceDecisionService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultPriceDecisionService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultPriceDecisionService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultPriceDecisionService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultPriceDecisionService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultPriceDecisionService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultPriceDecisionService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultPriceDecisionService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultPriceDecisionService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultPriceDecisionService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultPriceDecisionService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultPriceDecisionService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultPriceDecisionService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultPriceDecisionService.doIndexing(request);
    }
};