/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultKnowledgeDocumentFacade
 * @description Generated facade for schema `knowledgeDocument` owned by module `aiKnowledge`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner aiKnowledge
 * @schema knowledgeDocument
 * @model KnowledgeDocumentModel
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
        return SERVICE.DefaultKnowledgeDocumentService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultKnowledgeDocumentService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultKnowledgeDocumentService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultKnowledgeDocumentService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultKnowledgeDocumentService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultKnowledgeDocumentService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultKnowledgeDocumentService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultKnowledgeDocumentService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultKnowledgeDocumentService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultKnowledgeDocumentService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultKnowledgeDocumentService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultKnowledgeDocumentService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultKnowledgeDocumentService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultKnowledgeDocumentService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultKnowledgeDocumentService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultKnowledgeDocumentService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultKnowledgeDocumentService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultKnowledgeDocumentService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultKnowledgeDocumentService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultKnowledgeDocumentService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultKnowledgeDocumentService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultKnowledgeDocumentService.doIndexing(request);
    }
};