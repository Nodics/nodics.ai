/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultWarehouseFacade
 * @description Generated facade for schema `warehouse` owned by module `inventory`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner inventory
 * @schema warehouse
 * @model WarehouseModel
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
        return SERVICE.DefaultWarehouseService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultWarehouseService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultWarehouseService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultWarehouseService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultWarehouseService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultWarehouseService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultWarehouseService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultWarehouseService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultWarehouseService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultWarehouseService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultWarehouseService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultWarehouseService.update(request);
    }
};