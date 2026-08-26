/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultBackofficeAxisPolicyFacade
 * @description Generated facade for schema `backofficeAxisPolicy` owned by module `backoffice`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner backoffice
 * @schema backofficeAxisPolicy
 * @model BackofficeAxisPolicyModel
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
        return SERVICE.DefaultBackofficeAxisPolicyService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultBackofficeAxisPolicyService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultBackofficeAxisPolicyService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultBackofficeAxisPolicyService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultBackofficeAxisPolicyService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultBackofficeAxisPolicyService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultBackofficeAxisPolicyService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultBackofficeAxisPolicyService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultBackofficeAxisPolicyService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultBackofficeAxisPolicyService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultBackofficeAxisPolicyService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultBackofficeAxisPolicyService.update(request);
    }
};