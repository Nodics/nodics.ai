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
    policy: function () { return SERVICE.DefaultCommerceSearchPolicyService.policy(); },

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
            userGroups: ['serviceAccountUserGroup'],
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
        throw new Error('Commerce Search projection response is invalid');
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
        let time = now === undefined ? Date.now() : new Date(now).getTime();
        if (!Number.isFinite(time)) throw new Error('Commerce Search ranking time is invalid');
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
        if (request.locale) query.$or = [{ locale: request.locale }, { locale: { $exists: false } }, { locale: null }];
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
        let policy = this.policy();
        let maximum = policy.maximumRulesPerRequest;
        let searchRequest = {
            tenant: request.tenant,
            authData: this.serviceAuthData(request),
            moduleName: 'commerceSearchCore',
            indexName: policy.searchIndexName,
            query: this.query(request),
            searchOptions: { pageSize: policy.rulePageSize, limit: policy.rulePageSize, pageNumber: 1, sort: { code: 1 } }
        };
        const service = SERVICE.DefaultCommerceSearchRuleProjectionService;
        const method = typeof service.doSearch === 'function' ? 'doSearch' : 'get';
        if (typeof service[method] !== 'function') throw new Error('Commerce Search projection reader is unavailable');
        const applicable = [], seen = new Set();
        for (let scanned = 0; scanned < policy.maximumRuleScan;) {
            searchRequest.searchOptions.pageNumber = Math.floor(scanned / policy.rulePageSize) + 1;
            searchRequest.searchOptions.skip = scanned;
            const rows = this.records(await service[method](searchRequest));
            if (rows.length > policy.rulePageSize) throw new Error('Commerce Search provider exceeded the requested bound');
            if (scanned + rows.length > policy.maximumRuleScan) throw new Error('Commerce Search complete rule scan exceeds configured limit');
            for (const rule of rows) {
                if (!rule.code || seen.has(rule.code)) throw new Error('Commerce Search rule paging is incomplete');
                seen.add(rule.code);
                if (this.applies(request, rule)) applicable.push(rule);
                if (applicable.length > maximum) throw new Error('Commerce Search applicable rule limit exceeded');
            }
            scanned += rows.length;
            if (rows.length < policy.rulePageSize) return applicable;
        }
        throw new Error('Commerce Search complete rule scan exceeds configured limit');
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
        if (rule.locale && rule.locale !== request.locale) return false;
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
        let weights = this.policy().actionWeights;
        if (action.actionType === 'BOOST') return action.weight === undefined ? weights.BOOST : action.weight;
        if (action.actionType === 'BURY') return action.weight === undefined ? weights.BURY : action.weight;
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
        const actions = [], pinned = new Set();
        const priorityRules = (rules || []).slice().sort((left, right) =>
            SERVICE.DefaultCommerceSearchPolicyService.priority(right) - SERVICE.DefaultCommerceSearchPolicyService.priority(left) ||
            String(left.code).localeCompare(String(right.code)));
        for (const rule of priorityRules) {
            SERVICE.DefaultCommerceSearchPolicyService.validate(rule);
            for (const action of rule.actions || []) {
                if (action.actionType === 'PIN') {
                    if (pinned.has(action.productCode)) continue;
                    pinned.add(action.productCode);
                }
                const score = this.actionScore(action);
                // Discovery's legacy zero fallback must not change an explicit no-op weight.
                if (action.actionType !== 'PIN' && score === 0) continue;
                actions.push({ ...action, targetCode: action.productCode, score });
            }
        }
        if (SERVICE.DefaultDiscoveryRankingEngineService && typeof SERVICE.DefaultDiscoveryRankingEngineService.apply === 'function') {
            return SERVICE.DefaultDiscoveryRankingEngineService.apply(products || [], actions, { codeProperty: 'productCode' });
        }
        let original = new Map((products || []).map((product, index) => [product.productCode, index]));
        let scores = new Map();
        let pins = new Map();
        for (let action of actions) {
                if (!original.has(action.productCode)) continue;
                if (action.actionType === 'PIN' && Number.isInteger(Number(action.position)) && !pins.has(action.productCode)) {
                    pins.set(action.productCode, Math.max(1, Number(action.position)));
                }
                scores.set(action.productCode, (scores.get(action.productCode) || 0) + this.actionScore(action));
        }
        let sorted = (products || []).slice().sort((left, right) => {
            let score = (scores.get(right.productCode) || 0) - (scores.get(left.productCode) || 0);
            if (score !== 0) return score;
            return (original.get(left.productCode) || 0) - (original.get(right.productCode) || 0);
        });
        [...pins].sort((left, right) => left[1] - right[1]).forEach(([code, position]) => {
            const index = sorted.findIndex(product => product.productCode === code);
            const item = sorted.splice(index, 1)[0];
            sorted.splice(Math.max(0, position - 1), 0, item);
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
        if (request.query?.sort && !['recommended', 'relevance'].includes(request.query.sort)) return products;
        if (products.length > this.policy().maximumCandidateProducts) throw new Error('Commerce Search candidate bound exceeded');
        if (products.some(product => typeof product?.productCode !== 'string' || !product.productCode) ||
            new Set(products.map(product => product.productCode)).size !== products.length)
            throw new Error('Commerce Search candidates must have unique Product identities');
        request = { ...request, now: request.now === undefined ? new Date().toISOString() : request.now };
        let rules = await this.loadRules(request);
        if (rules.length === 0) return products;
        if (rules.some(rule => rule.benefitRef)) {
            if (!SERVICE.DefaultCommerceSearchBenefitService) throw new Error('Commercial benefit owner is unavailable');
            rules = await SERVICE.DefaultCommerceSearchBenefitService.expand(request, products, rules);
        }
        return this.ranked(products, rules);
    }
};
