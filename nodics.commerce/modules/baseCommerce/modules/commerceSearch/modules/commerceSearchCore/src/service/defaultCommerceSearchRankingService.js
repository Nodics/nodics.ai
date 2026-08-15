/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module commerceSearchCore/service/defaultCommerceSearchRankingService
 * @description Applies published Commerce Search PIN, BOOST, and BURY rules to Product discovery results.
 * @layer service
 * @owner commerceSearchCore
 * @override Later modules may push these rules into provider-specific query composition while preserving customer-safe output.
 */
module.exports = {
    /**
     * Initializes the Commerce Search ranking service.
     *
     * @returns {Promise<boolean>} Resolves when initialization completes.
     */
    init: function () { return Promise.resolve(true); },
    /**
     * Runs post-initialization for the Commerce Search ranking service.
     *
     * @returns {Promise<boolean>} Resolves when post-initialization completes.
     */
    postInit: function () { return Promise.resolve(true); },

    /**
     * Returns Commerce Search ranking policy from effective configuration.
     *
     * @returns {Object} Ranking policy.
     */
    policy: function () { return (((CONFIG.get('commerceSearch') || {}).ranking) || {}); },

    /**
     * Builds service-account authorization context for internal rule projection lookup.
     *
     * @param {Object} request Discovery request.
     * @returns {Object} Service authorization data.
     */
    serviceAuthData: function (request) {
        return Object.assign({}, request.authData || {}, {
            tenant: request.tenant,
            loginId: 'commerceSearchRanking',
            principalType: 'service',
            groups: ['serviceAccountUserGroup']
        });
    },

    /**
     * Normalizes generated service or search-engine responses into projection records.
     *
     * @param {*} response Search or model-service response.
     * @returns {Object[]} Projection records.
     */
    records: function (response) {
        if (Array.isArray(response)) return response;
        if (response && Array.isArray(response.result)) return response.result;
        if (response && response.data && Array.isArray(response.data.result)) return response.data.result;
        if (response && response.data && Array.isArray(response.data)) return response.data;
        let hits = this.findHits(response, 0);
        if (hits) return hits.hits.map(hit => hit._source || hit.source || hit);
        return [];
    },

    /**
     * Finds nested Elasticsearch-style hits in a wrapped response object.
     *
     * @param {*} value Response fragment.
     * @param {number} depth Current recursion depth.
     * @returns {Object|undefined} Hits wrapper when found.
     */
    findHits: function (value, depth) {
        if (!value || depth > 6 || typeof value !== 'object') return undefined;
        if (value.hits && Array.isArray(value.hits.hits)) return value.hits;
        for (let key of ['result', 'data', 'body', 'response', 'payload']) {
            let found = this.findHits(value[key], depth + 1);
            if (found) return found;
        }
        return undefined;
    },

    /**
     * Determines whether a rule is active for the request time.
     *
     * @param {Object} record Rule projection.
     * @param {Date|string|number} now Request time.
     * @returns {boolean} True when effective.
     */
    effective: function (record, now) {
        let time = now instanceof Date ? now.getTime() : now ? new Date(now).getTime() : new Date().getTime();
        return (!record.validFrom || new Date(record.validFrom).getTime() <= time) && (!record.validTo || new Date(record.validTo).getTime() > time);
    },

    /**
     * Builds the rule projection lookup query for a discovery request.
     *
     * @param {Object} request Discovery request.
     * @returns {Object} Query object.
     */
    query: function (request) {
        let query = { tenant: request.tenant, storeCode: request.storeCode, status: 'CURRENT' };
        if (request.locale) query.locale = request.locale;
        return query;
    },

    /**
     * Loads applicable current rule projections for a discovery request.
     *
     * @param {Object} request Discovery request.
     * @returns {Promise<Object[]>} Applicable rule projections.
     */
    loadRules: async function (request) {
        if (this.policy().enabled === false) return [];
        if (!SERVICE.DefaultCommerceSearchRuleProjectionService) return [];
        let maximum = Number(this.policy().maximumRulesPerRequest || 50);
        let searchRequest = {
            tenant: request.tenant,
            authData: this.serviceAuthData(request),
            moduleName: 'commerceSearchCore',
            indexName: this.policy().searchIndexName || 'commerceSearchRuleProjection',
            query: this.query(request),
            searchOptions: { pageSize: maximum + 1, pageNumber: 1 }
        };
        let response = typeof SERVICE.DefaultCommerceSearchRuleProjectionService.doSearch === 'function'
            ? await SERVICE.DefaultCommerceSearchRuleProjectionService.doSearch(searchRequest)
            : typeof SERVICE.DefaultCommerceSearchRuleProjectionService.get === 'function'
                ? await SERVICE.DefaultCommerceSearchRuleProjectionService.get(searchRequest) : [];
        return this.records(response).slice(0, maximum).filter(rule => this.applies(request, rule));
    },

    /**
     * Checks if a published rule applies to the current discovery scope.
     *
     * @param {Object} request Discovery request.
     * @param {Object} rule Rule projection.
     * @returns {boolean} True when the rule applies.
     */
    applies: function (request, rule) {
        if (!rule || rule.tenant !== request.tenant || rule.storeCode !== request.storeCode || rule.status !== 'CURRENT') return false;
        if (rule.locale && request.locale && rule.locale !== request.locale) return false;
        if (!this.effective(rule, request.now)) return false;
        if (rule.scopeType === 'GLOBAL') return true;
        if (rule.scopeType === 'CATEGORY') return !!request.query && rule.categoryCode === request.query.categoryCode;
        if (rule.scopeType === 'SEARCH_TERM') return !!request.query && String(rule.searchTerm || '').toLowerCase() === String(request.query.q || '').toLowerCase();
        return false;
    },

    /**
     * Converts BOOST and BURY actions into a sortable ranking score.
     *
     * @param {Object} action Rule action.
     * @returns {number} Score delta.
     */
    actionScore: function (action) {
        let weights = this.policy().actionWeights || {};
        if (action.actionType === 'BOOST') return Number(action.weight || weights.BOOST || 1000);
        if (action.actionType === 'BURY') return Number(action.weight || weights.BURY || -1000);
        return 0;
    },

    /**
     * Applies PIN, BOOST, and BURY actions while preserving stable ordering fallback.
     *
     * @param {Object[]} products Product cards.
     * @param {Object[]} rules Applicable rule projections.
     * @returns {Object[]} Ranked product cards.
     */
    ranked: function (products, rules) {
        if (SERVICE.DefaultDiscoveryRankingEngineService && typeof SERVICE.DefaultDiscoveryRankingEngineService.apply === 'function') {
            let actions = [];
            let priorityRules = (rules || []).slice().sort((left, right) => Number(right.priority || 0) - Number(left.priority || 0));
            for (let rule of priorityRules) {
                for (let action of rule.actions || []) {
                    actions.push(Object.assign({}, action, { targetCode: action.productCode }));
                }
            }
            return SERVICE.DefaultDiscoveryRankingEngineService.apply(products || [], actions, { codeProperty: 'productCode' });
        }
        let original = new Map((products || []).map((product, index) => [product.productCode, index]));
        let scores = new Map();
        let pins = new Map();
        let priorityRules = (rules || []).slice().sort((left, right) => Number(right.priority || 0) - Number(left.priority || 0));
        for (let rule of priorityRules) {
            for (let action of rule.actions || []) {
                if (!original.has(action.productCode)) continue;
                if (action.actionType === 'PIN' && Number.isInteger(Number(action.position)) && !pins.has(action.productCode)) {
                    pins.set(action.productCode, Math.max(1, Number(action.position)));
                }
                scores.set(action.productCode, (scores.get(action.productCode) || 0) + this.actionScore(action));
            }
        }
        let sorted = (products || []).slice().sort((left, right) => {
            let leftPin = pins.get(left.productCode), rightPin = pins.get(right.productCode);
            if (leftPin && rightPin && leftPin !== rightPin) return leftPin - rightPin;
            if (leftPin && !rightPin) return -1;
            if (!leftPin && rightPin) return 1;
            let score = (scores.get(right.productCode) || 0) - (scores.get(left.productCode) || 0);
            if (score !== 0) return score;
            return (original.get(left.productCode) || 0) - (original.get(right.productCode) || 0);
        });
        return sorted;
    },

    /**
     * Ranks customer-safe product cards for Product discovery.
     *
     * @param {Object} request Discovery request.
     * @param {Object[]} products Product cards.
     * @returns {Promise<Object[]>} Ranked product cards.
     */
    rank: async function (request, products) {
        if (!Array.isArray(products) || products.length < 2) return products || [];
        let rules = await this.loadRules(request);
        if (rules.length === 0) return products;
        return this.ranked(products, rules);
    }
};
