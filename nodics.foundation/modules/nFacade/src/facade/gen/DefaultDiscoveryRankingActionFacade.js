/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultDiscoveryRankingActionFacade
 * @description Generated facade for schema `discoveryRankingAction` owned by module `discoveryRanking`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner discoveryRanking
 * @schema discoveryRankingAction
 * @model DiscoveryRankingActionModel
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
        return SERVICE.DefaultDiscoveryRankingActionService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultDiscoveryRankingActionService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultDiscoveryRankingActionService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultDiscoveryRankingActionService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultDiscoveryRankingActionService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultDiscoveryRankingActionService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultDiscoveryRankingActionService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultDiscoveryRankingActionService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultDiscoveryRankingActionService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultDiscoveryRankingActionService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultDiscoveryRankingActionService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultDiscoveryRankingActionService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultDiscoveryRankingActionService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultDiscoveryRankingActionService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultDiscoveryRankingActionService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultDiscoveryRankingActionService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultDiscoveryRankingActionService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultDiscoveryRankingActionService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultDiscoveryRankingActionService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultDiscoveryRankingActionService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultDiscoveryRankingActionService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultDiscoveryRankingActionService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultDiscoveryRankingActionService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultDiscoveryRankingActionService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultDiscoveryRankingActionService.doIndexing(request);
    }
};