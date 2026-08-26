/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/facade/DefaultDiscoveryRankingProfileFacade
 * @description Generated facade for schema `discoveryRankingProfile` owned by module `discoveryConfig`. This file is recreated by clean/build from the effective schema and common facade template.
 * @layer facade
 * @owner discoveryConfig
 * @schema discoveryRankingProfile
 * @model DiscoveryRankingProfileModel
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
        return SERVICE.DefaultDiscoveryRankingProfileService.get(request);
    },
    safeSearch: function (request) {
        return SERVICE.DefaultDiscoveryRankingProfileService.safeSearch(request);
    },
    capabilities: function (request) {
        return SERVICE.DefaultDiscoveryRankingProfileService.capabilities(request);
    },
    getById: function (id, tenant) {
        return SERVICE.DefaultDiscoveryRankingProfileService.getById(id, tenant);
    },
    getByCode: function (code, tenant) {
        return SERVICE.DefaultDiscoveryRankingProfileService.getByCode(code, tenant);
    },
    save: function (request) {
        return SERVICE.DefaultDiscoveryRankingProfileService.save(request);
    },
    saveAll: function (request) {
        return SERVICE.DefaultDiscoveryRankingProfileService.saveAll(request);
    },
    remove: function (request) {
        return SERVICE.DefaultDiscoveryRankingProfileService.remove(request);
    },
    deleteImpact: function (request) {
        return SERVICE.DefaultDiscoveryRankingProfileService.deleteImpact(request);
    },
    removeById: function (request) {
        return SERVICE.DefaultDiscoveryRankingProfileService.remove(request);
    },
    removeByCode: function (request) {
        return SERVICE.DefaultDiscoveryRankingProfileService.remove(request);
    },
    update: function (request) {
        return SERVICE.DefaultDiscoveryRankingProfileService.update(request);
    }
};