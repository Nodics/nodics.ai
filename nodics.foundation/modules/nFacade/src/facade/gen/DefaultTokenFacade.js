/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultTokenFacade
 * @description Generated facade for schema `token` owned by module `token`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner token
 * @schema token
 * @model TokenModel
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
        return SERVICE.DefaultTokenService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultTokenService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultTokenService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultTokenService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultTokenService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultTokenService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultTokenService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultTokenService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultTokenService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultTokenService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultTokenService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultTokenService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultTokenService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultTokenService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultTokenService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultTokenService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultTokenService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultTokenService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultTokenService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultTokenService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultTokenService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultTokenService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultTokenService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultTokenService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultTokenService.doIndexing(request);
    }
};