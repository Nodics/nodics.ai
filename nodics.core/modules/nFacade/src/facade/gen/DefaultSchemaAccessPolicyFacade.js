/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultSchemaAccessPolicyFacade
 * @description Generated facade for schema `schemaAccessPolicy` owned by module `dynamo`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner dynamo
 * @schema schemaAccessPolicy
 * @model SchemaAccessPolicyModel
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
        return SERVICE.DefaultSchemaAccessPolicyService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultSchemaAccessPolicyService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultSchemaAccessPolicyService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultSchemaAccessPolicyService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultSchemaAccessPolicyService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultSchemaAccessPolicyService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultSchemaAccessPolicyService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultSchemaAccessPolicyService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultSchemaAccessPolicyService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultSchemaAccessPolicyService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultSchemaAccessPolicyService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultSchemaAccessPolicyService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultSchemaAccessPolicyService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultSchemaAccessPolicyService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultSchemaAccessPolicyService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultSchemaAccessPolicyService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultSchemaAccessPolicyService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultSchemaAccessPolicyService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultSchemaAccessPolicyService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultSchemaAccessPolicyService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultSchemaAccessPolicyService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultSchemaAccessPolicyService.doIndexing(request);
    }
};