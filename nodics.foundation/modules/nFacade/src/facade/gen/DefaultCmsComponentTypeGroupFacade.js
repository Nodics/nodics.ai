/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultCmsComponentTypeGroupFacade
 * @description Generated facade for schema `cmsComponentTypeGroup` owned by module `cms`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner cms
 * @schema cmsComponentTypeGroup
 * @model CmsComponentTypeGroupModel
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
        return SERVICE.DefaultCmsComponentTypeGroupService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultCmsComponentTypeGroupService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultCmsComponentTypeGroupService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultCmsComponentTypeGroupService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultCmsComponentTypeGroupService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultCmsComponentTypeGroupService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultCmsComponentTypeGroupService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultCmsComponentTypeGroupService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultCmsComponentTypeGroupService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultCmsComponentTypeGroupService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultCmsComponentTypeGroupService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultCmsComponentTypeGroupService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultCmsComponentTypeGroupService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultCmsComponentTypeGroupService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultCmsComponentTypeGroupService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultCmsComponentTypeGroupService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultCmsComponentTypeGroupService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultCmsComponentTypeGroupService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultCmsComponentTypeGroupService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultCmsComponentTypeGroupService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultCmsComponentTypeGroupService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultCmsComponentTypeGroupService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultCmsComponentTypeGroupService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultCmsComponentTypeGroupService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultCmsComponentTypeGroupService.doIndexing(request);
    }
};