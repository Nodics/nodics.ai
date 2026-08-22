/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultTestimonialConsentFacade
 * @description Generated facade for schema `testimonialConsent` owned by module `testimonial`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner testimonial
 * @schema testimonialConsent
 * @model TestimonialConsentModel
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
        return SERVICE.DefaultTestimonialConsentService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultTestimonialConsentService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultTestimonialConsentService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultTestimonialConsentService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultTestimonialConsentService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultTestimonialConsentService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultTestimonialConsentService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultTestimonialConsentService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultTestimonialConsentService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultTestimonialConsentService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultTestimonialConsentService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultTestimonialConsentService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultTestimonialConsentService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultTestimonialConsentService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultTestimonialConsentService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultTestimonialConsentService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultTestimonialConsentService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultTestimonialConsentService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultTestimonialConsentService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultTestimonialConsentService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultTestimonialConsentService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultTestimonialConsentService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultTestimonialConsentService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultTestimonialConsentService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultTestimonialConsentService.doIndexing(request);
    }
};