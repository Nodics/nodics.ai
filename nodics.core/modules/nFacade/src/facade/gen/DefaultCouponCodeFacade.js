/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultCouponCodeFacade
 * @description Generated facade for schema `couponCode` owned by module `promotion`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner promotion
 * @schema couponCode
 * @model CouponCodeModel
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
        return SERVICE.DefaultCouponCodeService.get(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultCouponCodeService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultCouponCodeService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultCouponCodeService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultCouponCodeService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultCouponCodeService.remove(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultCouponCodeService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultCouponCodeService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultCouponCodeService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultCouponCodeService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultCouponCodeService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultCouponCodeService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultCouponCodeService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultCouponCodeService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultCouponCodeService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultCouponCodeService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultCouponCodeService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultCouponCodeService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultCouponCodeService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultCouponCodeService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultCouponCodeService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultCouponCodeService.doIndexing(request);
    }
};