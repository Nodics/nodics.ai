/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultNotifyVerificationChallengeFacade
 * @description Generated facade for schema `notifyVerificationChallenge` owned by module `notifySchema`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner notifySchema
 * @schema notifyVerificationChallenge
 * @model NotifyVerificationChallengeModel
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
        return SERVICE.DefaultNotifyVerificationChallengeService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultNotifyVerificationChallengeService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultNotifyVerificationChallengeService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultNotifyVerificationChallengeService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultNotifyVerificationChallengeService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultNotifyVerificationChallengeService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultNotifyVerificationChallengeService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultNotifyVerificationChallengeService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultNotifyVerificationChallengeService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultNotifyVerificationChallengeService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultNotifyVerificationChallengeService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultNotifyVerificationChallengeService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultNotifyVerificationChallengeService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultNotifyVerificationChallengeService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultNotifyVerificationChallengeService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultNotifyVerificationChallengeService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultNotifyVerificationChallengeService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultNotifyVerificationChallengeService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultNotifyVerificationChallengeService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultNotifyVerificationChallengeService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultNotifyVerificationChallengeService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultNotifyVerificationChallengeService.doIndexing(request);
    }
};