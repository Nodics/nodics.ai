/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultDiscoveryQueryProfileFacade
 * @description Generated facade for schema `discoveryQueryProfile` owned by module `discoveryConfig`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner discoveryConfig
 * @schema discoveryQueryProfile
 * @model DiscoveryQueryProfileModel
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
        return SERVICE.DefaultDiscoveryQueryProfileService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultDiscoveryQueryProfileService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultDiscoveryQueryProfileService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultDiscoveryQueryProfileService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultDiscoveryQueryProfileService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultDiscoveryQueryProfileService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultDiscoveryQueryProfileService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultDiscoveryQueryProfileService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultDiscoveryQueryProfileService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultDiscoveryQueryProfileService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultDiscoveryQueryProfileService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultDiscoveryQueryProfileService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultDiscoveryQueryProfileService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultDiscoveryQueryProfileService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultDiscoveryQueryProfileService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultDiscoveryQueryProfileService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultDiscoveryQueryProfileService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultDiscoveryQueryProfileService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultDiscoveryQueryProfileService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultDiscoveryQueryProfileService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultDiscoveryQueryProfileService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultDiscoveryQueryProfileService.doIndexing(request);
    }
};