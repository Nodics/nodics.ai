/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultKycDecisionFacade
 * @description Generated facade for schema `kycDecision` owned by module `kycSchema`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner kycSchema
 * @schema kycDecision
 * @model KycDecisionModel
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
        return SERVICE.DefaultKycDecisionService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultKycDecisionService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultKycDecisionService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultKycDecisionService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultKycDecisionService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultKycDecisionService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultKycDecisionService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultKycDecisionService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultKycDecisionService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultKycDecisionService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultKycDecisionService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultKycDecisionService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultKycDecisionService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultKycDecisionService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultKycDecisionService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultKycDecisionService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultKycDecisionService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultKycDecisionService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultKycDecisionService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultKycDecisionService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultKycDecisionService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultKycDecisionService.doIndexing(request);
    }
};