/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultCmsComponentMediaFacade
 * @description Generated facade for schema `cmsComponentMedia` owned by module `cms`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner cms
 * @schema cmsComponentMedia
 * @model CmsComponentMediaModel
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
        return SERVICE.DefaultCmsComponentMediaService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultCmsComponentMediaService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultCmsComponentMediaService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultCmsComponentMediaService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultCmsComponentMediaService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultCmsComponentMediaService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultCmsComponentMediaService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultCmsComponentMediaService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultCmsComponentMediaService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultCmsComponentMediaService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultCmsComponentMediaService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultCmsComponentMediaService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultCmsComponentMediaService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultCmsComponentMediaService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultCmsComponentMediaService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultCmsComponentMediaService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultCmsComponentMediaService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultCmsComponentMediaService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultCmsComponentMediaService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultCmsComponentMediaService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultCmsComponentMediaService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultCmsComponentMediaService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultCmsComponentMediaService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultCmsComponentMediaService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultCmsComponentMediaService.doIndexing(request);
    }
};