/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultApparelFitProfileFacade
 * @description Generated facade for schema `apparelFitProfile` owned by module `apparelProduct`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner apparelProduct
 * @schema apparelFitProfile
 * @model ApparelFitProfileModel
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
        return SERVICE.DefaultApparelFitProfileService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultApparelFitProfileService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultApparelFitProfileService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultApparelFitProfileService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultApparelFitProfileService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultApparelFitProfileService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultApparelFitProfileService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultApparelFitProfileService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultApparelFitProfileService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultApparelFitProfileService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultApparelFitProfileService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultApparelFitProfileService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultApparelFitProfileService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultApparelFitProfileService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultApparelFitProfileService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultApparelFitProfileService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultApparelFitProfileService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultApparelFitProfileService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultApparelFitProfileService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultApparelFitProfileService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultApparelFitProfileService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultApparelFitProfileService.doIndexing(request);
    }
};