/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultAiTokenReservationFacade
 * @description Generated facade for schema `aiTokenReservation` owned by module `aiProviders`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner aiProviders
 * @schema aiTokenReservation
 * @model AiTokenReservationModel
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
        return SERVICE.DefaultAiTokenReservationService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultAiTokenReservationService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultAiTokenReservationService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultAiTokenReservationService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultAiTokenReservationService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultAiTokenReservationService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultAiTokenReservationService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultAiTokenReservationService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultAiTokenReservationService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultAiTokenReservationService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultAiTokenReservationService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultAiTokenReservationService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultAiTokenReservationService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultAiTokenReservationService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultAiTokenReservationService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultAiTokenReservationService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultAiTokenReservationService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultAiTokenReservationService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultAiTokenReservationService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultAiTokenReservationService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultAiTokenReservationService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultAiTokenReservationService.doIndexing(request);
    }
};