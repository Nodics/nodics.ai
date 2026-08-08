/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultKnowledgeChunkFacade
 * @description Generated facade for schema `knowledgeChunk` owned by module `aiKnowledge`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner aiKnowledge
 * @schema knowledgeChunk
 * @model KnowledgeChunkModel
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
        return SERVICE.DefaultKnowledgeChunkService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultKnowledgeChunkService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultKnowledgeChunkService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultKnowledgeChunkService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultKnowledgeChunkService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultKnowledgeChunkService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultKnowledgeChunkService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultKnowledgeChunkService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultKnowledgeChunkService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultKnowledgeChunkService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultKnowledgeChunkService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultKnowledgeChunkService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultKnowledgeChunkService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultKnowledgeChunkService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultKnowledgeChunkService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultKnowledgeChunkService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultKnowledgeChunkService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultKnowledgeChunkService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultKnowledgeChunkService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultKnowledgeChunkService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultKnowledgeChunkService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultKnowledgeChunkService.doIndexing(request);
    }
};