/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultPromotionRepairRunFacade
 * @description Generated facade for schema `promotionRepairRun` owned by module `promotion`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner promotion
 * @schema promotionRepairRun
 * @model PromotionRepairRunModel
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
        return SERVICE.DefaultPromotionRepairRunService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultPromotionRepairRunService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultPromotionRepairRunService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultPromotionRepairRunService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultPromotionRepairRunService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultPromotionRepairRunService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultPromotionRepairRunService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultPromotionRepairRunService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultPromotionRepairRunService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultPromotionRepairRunService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultPromotionRepairRunService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultPromotionRepairRunService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultPromotionRepairRunService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultPromotionRepairRunService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultPromotionRepairRunService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultPromotionRepairRunService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultPromotionRepairRunService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultPromotionRepairRunService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultPromotionRepairRunService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultPromotionRepairRunService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultPromotionRepairRunService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultPromotionRepairRunService.doIndexing(request);
    }
};