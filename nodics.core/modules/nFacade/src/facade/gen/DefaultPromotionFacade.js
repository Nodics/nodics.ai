/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultPromotionFacade
 * @description Generated facade for schema `promotion` owned by module `promotion`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner promotion
 * @schema promotion
 * @model PromotionModel
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
        return SERVICE.DefaultPromotionService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultPromotionService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultPromotionService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultPromotionService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultPromotionService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultPromotionService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultPromotionService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultPromotionService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultPromotionService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultPromotionService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultPromotionService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultPromotionService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultPromotionService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultPromotionService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultPromotionService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultPromotionService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultPromotionService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultPromotionService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultPromotionService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultPromotionService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultPromotionService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultPromotionService.doIndexing(request);
    }
};