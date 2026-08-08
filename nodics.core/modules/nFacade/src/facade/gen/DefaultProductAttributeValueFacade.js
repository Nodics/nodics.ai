/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultProductAttributeValueFacade
 * @description Generated facade for schema `productAttributeValue` owned by module `product`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner product
 * @schema productAttributeValue
 * @model ProductAttributeValueModel
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
        return SERVICE.DefaultProductAttributeValueService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultProductAttributeValueService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultProductAttributeValueService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultProductAttributeValueService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultProductAttributeValueService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultProductAttributeValueService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultProductAttributeValueService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultProductAttributeValueService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultProductAttributeValueService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultProductAttributeValueService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultProductAttributeValueService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultProductAttributeValueService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultProductAttributeValueService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultProductAttributeValueService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultProductAttributeValueService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultProductAttributeValueService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultProductAttributeValueService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultProductAttributeValueService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultProductAttributeValueService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultProductAttributeValueService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultProductAttributeValueService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultProductAttributeValueService.doIndexing(request);
    }
};