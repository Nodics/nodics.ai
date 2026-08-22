/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultProcessIncidentFacade
 * @description Generated facade for schema `processIncident` owned by module `flowSchema`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner flowSchema
 * @schema processIncident
 * @model ProcessIncidentModel
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
        return SERVICE.DefaultProcessIncidentService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultProcessIncidentService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultProcessIncidentService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultProcessIncidentService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultProcessIncidentService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultProcessIncidentService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultProcessIncidentService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultProcessIncidentService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultProcessIncidentService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultProcessIncidentService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultProcessIncidentService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultProcessIncidentService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultProcessIncidentService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultProcessIncidentService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultProcessIncidentService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultProcessIncidentService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultProcessIncidentService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultProcessIncidentService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultProcessIncidentService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultProcessIncidentService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultProcessIncidentService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultProcessIncidentService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultProcessIncidentService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultProcessIncidentService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultProcessIncidentService.doIndexing(request);
    }
};