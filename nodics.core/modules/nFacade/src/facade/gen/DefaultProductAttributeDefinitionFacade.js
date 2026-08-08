/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultProductAttributeDefinitionFacade
 * @description Generated facade for schema `productAttributeDefinition` owned by module `product`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner product
 * @schema productAttributeDefinition
 * @model ProductAttributeDefinitionModel
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
        return SERVICE.DefaultProductAttributeDefinitionService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultProductAttributeDefinitionService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultProductAttributeDefinitionService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultProductAttributeDefinitionService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultProductAttributeDefinitionService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultProductAttributeDefinitionService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultProductAttributeDefinitionService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultProductAttributeDefinitionService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultProductAttributeDefinitionService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultProductAttributeDefinitionService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultProductAttributeDefinitionService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultProductAttributeDefinitionService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultProductAttributeDefinitionService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultProductAttributeDefinitionService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultProductAttributeDefinitionService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultProductAttributeDefinitionService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultProductAttributeDefinitionService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultProductAttributeDefinitionService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultProductAttributeDefinitionService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultProductAttributeDefinitionService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultProductAttributeDefinitionService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultProductAttributeDefinitionService.doIndexing(request);
    }
};