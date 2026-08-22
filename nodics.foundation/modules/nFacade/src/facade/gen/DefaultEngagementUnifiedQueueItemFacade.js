/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultEngagementUnifiedQueueItemFacade
 * @description Generated facade for schema `engagementUnifiedQueueItem` owned by module `engagementCore`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner engagementCore
 * @schema engagementUnifiedQueueItem
 * @model EngagementUnifiedQueueItemModel
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
        return SERVICE.DefaultEngagementUnifiedQueueItemService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultEngagementUnifiedQueueItemService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultEngagementUnifiedQueueItemService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultEngagementUnifiedQueueItemService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultEngagementUnifiedQueueItemService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultEngagementUnifiedQueueItemService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultEngagementUnifiedQueueItemService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultEngagementUnifiedQueueItemService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultEngagementUnifiedQueueItemService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultEngagementUnifiedQueueItemService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultEngagementUnifiedQueueItemService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultEngagementUnifiedQueueItemService.update(request);
    },
    doRefresh: function (request) {
        return SERVICE.DefaultEngagementUnifiedQueueItemService.doRefresh(request);
    },
    doCheckHealth: function (request) {
        return SERVICE.DefaultEngagementUnifiedQueueItemService.doCheckHealth(request);
    },
    doExists: function (request) {
        return SERVICE.DefaultEngagementUnifiedQueueItemService.doExists(request);
    },
    doGet: function (request) {
        return SERVICE.DefaultEngagementUnifiedQueueItemService.doGet(request);
    },
    doSearch: function (request) {
        return SERVICE.DefaultEngagementUnifiedQueueItemService.doSearch(request);
    },
    doSave: function (request) {
        return SERVICE.DefaultEngagementUnifiedQueueItemService.doSave(request);
    },
    doBulk: function (request) {
        return SERVICE.DefaultEngagementUnifiedQueueItemService.doBulk(request);
    },
    doRemove: function (request) {
        return SERVICE.DefaultEngagementUnifiedQueueItemService.doRemove(request);
    },
    doRemoveByQuery: function (request) {
        return SERVICE.DefaultEngagementUnifiedQueueItemService.doRemoveByQuery(request);
    },
    doGetSchema: function (request) {
        return SERVICE.DefaultEngagementUnifiedQueueItemService.doGetSchema(request);
    },
    doUpdateSchema: function (request) {
        return SERVICE.DefaultEngagementUnifiedQueueItemService.doUpdateSchema(request);
    },
    doRemoveIndex: function (request) {
        return SERVICE.DefaultEngagementUnifiedQueueItemService.doRemoveIndex(request);
    },
    doIndexing: function (request) {
        return SERVICE.DefaultEngagementUnifiedQueueItemService.doIndexing(request);
    }
};