/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module discoveryRuntime/service/defaultDiscoveryRuntimeService @description Executes generic Discovery search through resolved configuration and generated nSearch-backed services. @layer service @owner discoveryRuntime */
module.exports = {
    /** Extracts records from generated service and nSearch responses. @param {*} response Service response. @returns {Array} Records. */
    records: function (response) {
        if (Array.isArray(response)) return response;
        if (response && Array.isArray(response.result)) return response.result;
        if (response && response.data && Array.isArray(response.data)) return response.data;
        if (response && response.data && Array.isArray(response.data.result)) return response.data.result;
        let hits = this.findHits(response, 0);
        if (hits) return hits.hits.map(hit => hit && (hit._source || hit.source || hit.fields || hit)).filter(Boolean);
        return [];
    },

    /** Finds an Elasticsearch-compatible hits envelope within wrapped nSearch responses. @param {*} value Candidate value. @param {number} depth Current recursion depth. @returns {Object|undefined} Hits envelope. */
    findHits: function (value, depth) {
        if (!value || depth > 6 || typeof value !== 'object') return undefined;
        if (value.hits && Array.isArray(value.hits.hits)) return value.hits;
        for (let key of ['result', 'data', 'body', 'response', 'payload']) {
            let found = this.findHits(value[key], depth + 1);
            if (found) return found;
        }
        return undefined;
    },

    /** Executes a configured discovery search. @param {Object} request Discovery search request. @returns {Promise<Array>} Records. */
    search: async function (request) {
        let configuration = request.indexConfiguration || await SERVICE.DefaultDiscoveryConfigurationResolverService.resolveIndexConfiguration(request);
        if (!configuration) throw new Error('Discovery index configuration is required');
        let service = request.searchService || SERVICE.DefaultDiscoveryDocumentProjectionService;
        if (!service || typeof service.doSearch !== 'function') throw new Error('Discovery search service is unavailable');
        return this.records(await service.doSearch({
            tenant: request.tenant,
            authData: request.authData,
            moduleName: request.moduleName || 'discoveryProjection',
            indexName: configuration.indexName,
            query: request.searchQuery || request.query || {},
            searchOptions: request.searchOptions || {},
            options: {}
        }));
    }
};
