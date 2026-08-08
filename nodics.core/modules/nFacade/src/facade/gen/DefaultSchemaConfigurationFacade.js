/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultSchemaConfigurationFacade
 * @description Generated facade for schema `schemaConfiguration` owned by module `dynamo`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner dynamo
 * @schema schemaConfiguration
 * @model SchemaConfigurationModel
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
        return SERVICE.DefaultSchemaConfigurationService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultSchemaConfigurationService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultSchemaConfigurationService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultSchemaConfigurationService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultSchemaConfigurationService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultSchemaConfigurationService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultSchemaConfigurationService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultSchemaConfigurationService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultSchemaConfigurationService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultSchemaConfigurationService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultSchemaConfigurationService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultSchemaConfigurationService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultSchemaConfigurationService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultSchemaConfigurationService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultSchemaConfigurationService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultSchemaConfigurationService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultSchemaConfigurationService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultSchemaConfigurationService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultSchemaConfigurationService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultSchemaConfigurationService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultSchemaConfigurationService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultSchemaConfigurationService.doIndexing(request);
    }
};