/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultKycDocumentFacade
 * @description Generated facade for schema `kycDocument` owned by module `kycSchema`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner kycSchema
 * @schema kycDocument
 * @model KycDocumentModel
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
        return SERVICE.DefaultKycDocumentService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultKycDocumentService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultKycDocumentService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultKycDocumentService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultKycDocumentService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultKycDocumentService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultKycDocumentService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultKycDocumentService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultKycDocumentService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultKycDocumentService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultKycDocumentService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultKycDocumentService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultKycDocumentService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultKycDocumentService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultKycDocumentService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultKycDocumentService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultKycDocumentService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultKycDocumentService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultKycDocumentService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultKycDocumentService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultKycDocumentService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultKycDocumentService.doIndexing(request);
    }
};