/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultUnitDimensionFacade
 * @description Generated facade for schema `unitDimension` owned by module `units`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner units
 * @schema unitDimension
 * @model UnitDimensionModel
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
        return SERVICE.DefaultUnitDimensionService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultUnitDimensionService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultUnitDimensionService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultUnitDimensionService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultUnitDimensionService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultUnitDimensionService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultUnitDimensionService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultUnitDimensionService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultUnitDimensionService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultUnitDimensionService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultUnitDimensionService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultUnitDimensionService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultUnitDimensionService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultUnitDimensionService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultUnitDimensionService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultUnitDimensionService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultUnitDimensionService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultUnitDimensionService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultUnitDimensionService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultUnitDimensionService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultUnitDimensionService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultUnitDimensionService.doIndexing(request);
    }
};