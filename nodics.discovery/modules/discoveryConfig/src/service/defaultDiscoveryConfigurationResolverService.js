/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module discoveryConfig/service/defaultDiscoveryConfigurationResolverService @description Resolves active Discovery configurations from generated services or layered properties. @layer service @owner discoveryConfig */
module.exports = {
    /** Extracts generated service records. @param {*} response Service response. @returns {Array} Records. */
    records: function (response) {
        if (Array.isArray(response)) return response;
        if (response && Array.isArray(response.result)) return response.result;
        if (response && response.data && Array.isArray(response.data)) return response.data;
        if (response && response.data && Array.isArray(response.data.result)) return response.data.result;
        return [];
    },

    /** Returns configured fallback profiles. @returns {Object} Fallback config map. */
    fallback: function () {
        return (((CONFIG.get('discovery') || {}).runtime) || {}).profiles || {};
    },

    /** Resolves an active index configuration. @param {Object} request Tenant and owner context. @returns {Promise<Object|undefined>} Configuration. */
    resolveIndexConfiguration: async function (request) {
        if (request.indexConfiguration) return request.indexConfiguration;
        let service = SERVICE.DefaultDiscoveryIndexConfigurationService;
        if (service && typeof service.get === 'function') {
            let query = { tenant: request.tenant, ownerType: request.ownerType, status: 'CURRENT' };
            if (request.indexCode) query.code = request.indexCode;
            let records = this.records(await service.get({ tenant: request.tenant, authData: request.authData, query, pageSize: 1 }));
            if (records[0]) return records[0];
        }
        let fallback = this.fallback()[request.indexCode || request.ownerType];
        return fallback && fallback.indexConfiguration;
    },

    /** Resolves a query profile. @param {Object} request Tenant and profile context. @returns {Promise<Object|undefined>} Query profile. */
    resolveQueryProfile: async function (request) {
        if (request.queryProfile) return request.queryProfile;
        let service = SERVICE.DefaultDiscoveryQueryProfileService;
        if (service && typeof service.get === 'function' && request.queryProfileCode) {
            let records = this.records(await service.get({ tenant: request.tenant, authData: request.authData, query: { tenant: request.tenant, code: request.queryProfileCode, status: 'CURRENT' }, pageSize: 1 }));
            if (records[0]) return records[0];
        }
        let fallback = this.fallback()[request.queryProfileCode || request.ownerType];
        return fallback && fallback.queryProfile;
    }
};
