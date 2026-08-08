/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultProductClassificationAssignmentFacade
 * @description Generated facade for schema `productClassificationAssignment` owned by module `product`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner product
 * @schema productClassificationAssignment
 * @model ProductClassificationAssignmentModel
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
        return SERVICE.DefaultProductClassificationAssignmentService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultProductClassificationAssignmentService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultProductClassificationAssignmentService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultProductClassificationAssignmentService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultProductClassificationAssignmentService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultProductClassificationAssignmentService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultProductClassificationAssignmentService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultProductClassificationAssignmentService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultProductClassificationAssignmentService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultProductClassificationAssignmentService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultProductClassificationAssignmentService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultProductClassificationAssignmentService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultProductClassificationAssignmentService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultProductClassificationAssignmentService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultProductClassificationAssignmentService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultProductClassificationAssignmentService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultProductClassificationAssignmentService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultProductClassificationAssignmentService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultProductClassificationAssignmentService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultProductClassificationAssignmentService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultProductClassificationAssignmentService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultProductClassificationAssignmentService.doIndexing(request);
    }
};