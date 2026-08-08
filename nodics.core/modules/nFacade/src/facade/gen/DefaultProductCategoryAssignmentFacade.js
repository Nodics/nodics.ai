/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultProductCategoryAssignmentFacade
 * @description Generated facade for schema `productCategoryAssignment` owned by module `product`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner product
 * @schema productCategoryAssignment
 * @model ProductCategoryAssignmentModel
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
        return SERVICE.DefaultProductCategoryAssignmentService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultProductCategoryAssignmentService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultProductCategoryAssignmentService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultProductCategoryAssignmentService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultProductCategoryAssignmentService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultProductCategoryAssignmentService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultProductCategoryAssignmentService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultProductCategoryAssignmentService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultProductCategoryAssignmentService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultProductCategoryAssignmentService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultProductCategoryAssignmentService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultProductCategoryAssignmentService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultProductCategoryAssignmentService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultProductCategoryAssignmentService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultProductCategoryAssignmentService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultProductCategoryAssignmentService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultProductCategoryAssignmentService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultProductCategoryAssignmentService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultProductCategoryAssignmentService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultProductCategoryAssignmentService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultProductCategoryAssignmentService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultProductCategoryAssignmentService.doIndexing(request);
    }
};