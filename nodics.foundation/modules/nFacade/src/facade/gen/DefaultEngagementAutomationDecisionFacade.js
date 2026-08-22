/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultEngagementAutomationDecisionFacade
 * @description Generated facade for schema `engagementAutomationDecision` owned by module `engagementCore`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner engagementCore
 * @schema engagementAutomationDecision
 * @model EngagementAutomationDecisionModel
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
        return SERVICE.DefaultEngagementAutomationDecisionService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultEngagementAutomationDecisionService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultEngagementAutomationDecisionService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultEngagementAutomationDecisionService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultEngagementAutomationDecisionService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultEngagementAutomationDecisionService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultEngagementAutomationDecisionService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultEngagementAutomationDecisionService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultEngagementAutomationDecisionService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultEngagementAutomationDecisionService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultEngagementAutomationDecisionService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultEngagementAutomationDecisionService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultEngagementAutomationDecisionService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultEngagementAutomationDecisionService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultEngagementAutomationDecisionService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultEngagementAutomationDecisionService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultEngagementAutomationDecisionService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultEngagementAutomationDecisionService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultEngagementAutomationDecisionService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultEngagementAutomationDecisionService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultEngagementAutomationDecisionService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultEngagementAutomationDecisionService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultEngagementAutomationDecisionService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultEngagementAutomationDecisionService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultEngagementAutomationDecisionService.doIndexing(request);
    }
};