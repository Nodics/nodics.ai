/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultCustomerReviewMigrationFacade
 * @description Generated facade for schema `customerReviewMigration` owned by module `customerReview`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner customerReview
 * @schema customerReviewMigration
 * @model CustomerReviewMigrationModel
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
        return SERVICE.DefaultCustomerReviewMigrationService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultCustomerReviewMigrationService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultCustomerReviewMigrationService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultCustomerReviewMigrationService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultCustomerReviewMigrationService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultCustomerReviewMigrationService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultCustomerReviewMigrationService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultCustomerReviewMigrationService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultCustomerReviewMigrationService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultCustomerReviewMigrationService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultCustomerReviewMigrationService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultCustomerReviewMigrationService.update(request);
    }
};