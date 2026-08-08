/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultKnowledgeSourceFacade
 * @description Generated facade for schema `knowledgeSource` owned by module `aiKnowledge`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner aiKnowledge
 * @schema knowledgeSource
 * @model KnowledgeSourceModel
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
        return SERVICE.DefaultKnowledgeSourceService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultKnowledgeSourceService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultKnowledgeSourceService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultKnowledgeSourceService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultKnowledgeSourceService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultKnowledgeSourceService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultKnowledgeSourceService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultKnowledgeSourceService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultKnowledgeSourceService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultKnowledgeSourceService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultKnowledgeSourceService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultKnowledgeSourceService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultKnowledgeSourceService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultKnowledgeSourceService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultKnowledgeSourceService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultKnowledgeSourceService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultKnowledgeSourceService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultKnowledgeSourceService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultKnowledgeSourceService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultKnowledgeSourceService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultKnowledgeSourceService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultKnowledgeSourceService.doIndexing(request);
    }
};