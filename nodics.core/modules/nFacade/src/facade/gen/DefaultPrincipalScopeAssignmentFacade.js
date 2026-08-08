/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultPrincipalScopeAssignmentFacade
 * @description Generated facade for schema `principalScopeAssignment` owned by module `profile`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner profile
 * @schema principalScopeAssignment
 * @model PrincipalScopeAssignmentModel
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
        return SERVICE.DefaultPrincipalScopeAssignmentService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultPrincipalScopeAssignmentService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultPrincipalScopeAssignmentService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultPrincipalScopeAssignmentService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultPrincipalScopeAssignmentService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultPrincipalScopeAssignmentService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultPrincipalScopeAssignmentService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultPrincipalScopeAssignmentService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultPrincipalScopeAssignmentService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultPrincipalScopeAssignmentService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultPrincipalScopeAssignmentService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultPrincipalScopeAssignmentService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultPrincipalScopeAssignmentService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultPrincipalScopeAssignmentService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultPrincipalScopeAssignmentService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultPrincipalScopeAssignmentService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultPrincipalScopeAssignmentService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultPrincipalScopeAssignmentService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultPrincipalScopeAssignmentService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultPrincipalScopeAssignmentService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultPrincipalScopeAssignmentService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultPrincipalScopeAssignmentService.doIndexing(request);
    }
};