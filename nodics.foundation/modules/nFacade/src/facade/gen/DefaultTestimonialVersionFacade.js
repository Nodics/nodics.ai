/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultTestimonialVersionFacade
 * @description Generated facade for schema `testimonialVersion` owned by module `testimonial`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner testimonial
 * @schema testimonialVersion
 * @model TestimonialVersionModel
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
        return SERVICE.DefaultTestimonialVersionService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultTestimonialVersionService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultTestimonialVersionService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultTestimonialVersionService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultTestimonialVersionService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultTestimonialVersionService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultTestimonialVersionService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultTestimonialVersionService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultTestimonialVersionService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultTestimonialVersionService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultTestimonialVersionService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultTestimonialVersionService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultTestimonialVersionService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultTestimonialVersionService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultTestimonialVersionService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultTestimonialVersionService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultTestimonialVersionService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultTestimonialVersionService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultTestimonialVersionService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultTestimonialVersionService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultTestimonialVersionService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultTestimonialVersionService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultTestimonialVersionService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultTestimonialVersionService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultTestimonialVersionService.doIndexing(request);
    }
};