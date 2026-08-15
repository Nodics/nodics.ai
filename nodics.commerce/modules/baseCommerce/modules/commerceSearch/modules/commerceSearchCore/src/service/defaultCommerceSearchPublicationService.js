/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module commerceSearchCore/service/defaultCommerceSearchPublicationService @description Publishes approved Commerce Search rules into nSearch projections. @layer service @owner commerceSearchCore */
module.exports = {
    /**
     * Initializes Commerce Search publication.
     *
     * @returns {Promise<boolean>} Resolves when initialization completes.
     */
    init: function () { return Promise.resolve(true); },
    /**
     * Runs post-initialization for Commerce Search publication.
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
     * Normalizes model service responses into Commerce Search rule records.
     *
     * @param {*} response Model service response.
     * @returns {Object[]} Rule records.
     */
    records: function (response) {
        if (Array.isArray(response)) return response;
        if (response && Array.isArray(response.result)) return response.result;
        if (response && response.data && Array.isArray(response.data.result)) return response.data.result;
        if (response && response.data && Array.isArray(response.data)) return response.data;
        return [];
    },

    /**
     * Builds the staged rule publication query.
     *
     * @param {Object} request Publication request.
     * @param {Object} input Operator payload.
     * @returns {Object} Query object.
     */
    query: function (request, input) {
        let query = { tenant: request.tenant, status: { $in: ['APPROVED', 'PUBLISHED'] } };
        if (input.storeCode) query.storeCode = input.storeCode;
        if (input.locale) query.locale = input.locale;
        if (Array.isArray(input.ruleCodes) && input.ruleCodes.length > 0) query.code = { $in: input.ruleCodes };
        return query;
    },

    /**
     * Loads approved staged rules for publication.
     *
     * @param {Object} request Publication request.
     * @param {Object} input Operator payload.
     * @returns {Promise<Object[]>} Approved rule records.
     */
    loadRules: async function (request, input) {
        let maximum = Number(this.policy().maximumRulesPerRequest || 50);
        let response = await SERVICE.DefaultCommerceSearchRuleService.get({
            tenant: request.tenant,
            authData: request.authData,
            query: this.query(request, input || {}),
            searchOptions: { pageSize: maximum + 1, pageNumber: 1 }
        });
        let rules = this.records(response);
        if (rules.length > maximum) throw new Error('Commerce Search publication batch exceeds configured limit');
        return rules;
    },

    /**
     * Publishes approved rules into online projections and the search index.
     *
     * @param {Object} request Publication request.
     * @param {Object} input Operator payload.
     * @returns {Promise<Object>} Publication summary.
     */
    publish: async function (request, input) {
        if (!request || !request.tenant) throw new Error('Tenant is required for Commerce Search publication');
        let rules = await this.loadRules(request, input || {});
        let projections = [];
        for (let rule of rules) {
            let model = SERVICE.DefaultCommerceSearchProjectionBuilderService.build(request, rule);
            await SERVICE.DefaultCommerceSearchRuleProjectionService.save({ tenant: request.tenant, authData: request.authData, model: model });
            await SERVICE.DefaultCommerceSearchRuleProjectionService.doSave({
                tenant: request.tenant,
                moduleName: 'commerceSearchCore',
                indexName: this.policy().searchIndexName || 'commerceSearchRuleProjection',
                model: model,
                searchOptions: {}
            });
            projections.push(model);
        }
        return {
            tenant: request.tenant,
            requested: rules.length,
            published: projections.length,
            projectionCount: projections.length,
            rules: projections.map(projection => ({ ruleCode: projection.code, status: projection.status }))
        };
    }
};
