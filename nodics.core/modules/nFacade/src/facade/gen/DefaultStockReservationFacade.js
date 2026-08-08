/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultStockReservationFacade
 * @description Generated facade for schema `stockReservation` owned by module `inventory`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner inventory
 * @schema stockReservation
 * @model StockReservationModel
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
        return SERVICE.DefaultStockReservationService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultStockReservationService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultStockReservationService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultStockReservationService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultStockReservationService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultStockReservationService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultStockReservationService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultStockReservationService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultStockReservationService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultStockReservationService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultStockReservationService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultStockReservationService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultStockReservationService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultStockReservationService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultStockReservationService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultStockReservationService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultStockReservationService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultStockReservationService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultStockReservationService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultStockReservationService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultStockReservationService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultStockReservationService.doIndexing(request);
    }
};