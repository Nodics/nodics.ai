/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultProductRelationFacade
 * @description Generated facade for schema `productRelation` owned by module `product`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner product
 * @schema productRelation
 * @model ProductRelationModel
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
        return SERVICE.DefaultProductRelationService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultProductRelationService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultProductRelationService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultProductRelationService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultProductRelationService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultProductRelationService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultProductRelationService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultProductRelationService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultProductRelationService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultProductRelationService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultProductRelationService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultProductRelationService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultProductRelationService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultProductRelationService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultProductRelationService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultProductRelationService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultProductRelationService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultProductRelationService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultProductRelationService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultProductRelationService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultProductRelationService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultProductRelationService.doIndexing(request);
    }
};