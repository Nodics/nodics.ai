/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultEngagementRecoveryCheckpointFacade
 * @description Generated facade for schema `engagementRecoveryCheckpoint` owned by module `engagementCore`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner engagementCore
 * @schema engagementRecoveryCheckpoint
 * @model EngagementRecoveryCheckpointModel
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
        return SERVICE.DefaultEngagementRecoveryCheckpointService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultEngagementRecoveryCheckpointService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultEngagementRecoveryCheckpointService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultEngagementRecoveryCheckpointService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultEngagementRecoveryCheckpointService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultEngagementRecoveryCheckpointService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultEngagementRecoveryCheckpointService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultEngagementRecoveryCheckpointService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultEngagementRecoveryCheckpointService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultEngagementRecoveryCheckpointService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultEngagementRecoveryCheckpointService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultEngagementRecoveryCheckpointService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultEngagementRecoveryCheckpointService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultEngagementRecoveryCheckpointService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultEngagementRecoveryCheckpointService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultEngagementRecoveryCheckpointService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultEngagementRecoveryCheckpointService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultEngagementRecoveryCheckpointService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultEngagementRecoveryCheckpointService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultEngagementRecoveryCheckpointService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultEngagementRecoveryCheckpointService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultEngagementRecoveryCheckpointService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultEngagementRecoveryCheckpointService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultEngagementRecoveryCheckpointService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultEngagementRecoveryCheckpointService.doIndexing(request);
    }
};