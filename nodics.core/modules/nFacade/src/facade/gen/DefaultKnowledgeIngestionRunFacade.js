/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultKnowledgeIngestionRunFacade
 * @description Generated facade for schema `knowledgeIngestionRun` owned by module `aiKnowledge`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner aiKnowledge
 * @schema knowledgeIngestionRun
 * @model KnowledgeIngestionRunModel
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
        return SERVICE.DefaultKnowledgeIngestionRunService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultKnowledgeIngestionRunService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultKnowledgeIngestionRunService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultKnowledgeIngestionRunService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultKnowledgeIngestionRunService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultKnowledgeIngestionRunService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultKnowledgeIngestionRunService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultKnowledgeIngestionRunService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultKnowledgeIngestionRunService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultKnowledgeIngestionRunService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultKnowledgeIngestionRunService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultKnowledgeIngestionRunService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultKnowledgeIngestionRunService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultKnowledgeIngestionRunService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultKnowledgeIngestionRunService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultKnowledgeIngestionRunService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultKnowledgeIngestionRunService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultKnowledgeIngestionRunService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultKnowledgeIngestionRunService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultKnowledgeIngestionRunService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultKnowledgeIngestionRunService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultKnowledgeIngestionRunService.doIndexing(request);
    }
};