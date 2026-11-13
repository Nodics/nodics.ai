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

    /** Resolves owner-defined pins through the canonical DMS selector contract.
     * @returns {Object} Explicit publication and non-null deployment pins.
     * @throws {Error} For missing publication, retired fields or invalid pins.
     */
    targetAuthority: function () {
        const authority = ((CONFIG.get('discovery') || {}).config || {}).targetAuthority;
        if (!authority || !['STAGED','ONLINE','OPERATIONAL'].includes(authority.publication)) throw new Error('Discovery configuration requires explicit publication authority');
        const selected = Object.fromEntries(Object.entries(authority).filter(([key,value]) =>
            !(['server','environment'].includes(key) && value === null)));
        return require('../../../../../nodics.foundation/modules/nService/src/service/module/defaultModuleService').normalizeTargetAuthority(selected);
    },

    /** Reads one fixed generated schema contract through the existing qualified transport.
     * @param {Object} request Original tenant and actor context.
     * @param {string} schema Fixed supported configuration schema.
     * @param {Object} query Bounded selector constructed by this owner.
     * @returns {Promise<Array>} Matching records; an empty result permits configured fallback.
     * @throws {Error} For missing qualification, transport or owner authorization failure.
     */
    readConfiguration: async function (request, schema, query) {
        const services = {
            discoveryIndexConfiguration: 'readIndex',
            discoveryQueryProfile: 'readQueryProfile'
        };
        if (!Object.prototype.hasOwnProperty.call(services, schema)) throw new Error('Unsupported Discovery configuration read');
        const targetAuthority = this.targetAuthority();
        const body = {tenant: request.tenant, query, pageSize: 1};
        const response = await SERVICE.DefaultModuleService.invokeModule({
            moduleName: 'discoveryConfig', targetAuthority,
            serviceName: 'DefaultDiscoveryConfigurationReadService', operationName: services[schema],
            apiName: '/internal/configuration/' + (schema === 'discoveryIndexConfiguration' ? 'index' : 'query-profile'), methodName: 'POST', tenant: request.tenant,
            request: {...body, authData: request.authData}, requestBody: body,
        });
        return this.records(response);
    },

    /** Resolves an active index configuration. @param {Object} request Tenant and owner context. @returns {Promise<Object|undefined>} Configuration. */
    resolveIndexConfiguration: async function (request) {
        if (request.indexConfiguration) return request.indexConfiguration;
        const query = {tenant: request.tenant, status: 'CURRENT'};
        if (request.ownerType) query.ownerType = request.ownerType;
        if (request.indexCode) query.code = request.indexCode;
        const records = await this.readConfiguration(request, 'discoveryIndexConfiguration', query);
        if (records[0]) return records[0];
        const fallback = this.fallback()[request.indexCode || request.ownerType];
        return fallback && fallback.indexConfiguration;
    },

    /** Resolves a query profile. @param {Object} request Tenant and profile context. @returns {Promise<Object|undefined>} Query profile. */
    resolveQueryProfile: async function (request) {
        if (request.queryProfile) return request.queryProfile;
        if (request.queryProfileCode) {
            const records = await this.readConfiguration(request, 'discoveryQueryProfile', {
                tenant: request.tenant, code: request.queryProfileCode, status: 'CURRENT'
            });
            if (records[0]) return records[0];
        }
        const fallback = this.fallback()[request.queryProfileCode || request.ownerType];
        return fallback && fallback.queryProfile;
    }
};
