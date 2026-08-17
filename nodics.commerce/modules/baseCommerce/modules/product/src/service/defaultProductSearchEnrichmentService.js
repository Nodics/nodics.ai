/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module product/service/defaultProductSearchEnrichmentService
 * @description Orchestrates customer-safe Pricing and Inventory summaries for Product search projections.
 * @layer service
 * @owner product
 * @override Later projects may override enrichment orchestration while Pricing and Inventory retain source-of-truth ownership.
 */
module.exports = {
    /** Initializes the service lifecycle. @returns {Promise<boolean>} Initialization result. */
    init: function () { return Promise.resolve(true); },
    /** Completes the service lifecycle. @returns {Promise<boolean>} Initialization result. */
    postInit: function () { return Promise.resolve(true); },

    /** Returns Product publication policy. @returns {Object} Policy. */
    policy: function () { return ((CONFIG.get('product') || {}).publication) || {}; },

    /** Returns one enrichment policy. @param {string} kind Enrichment kind. @returns {Object} Policy. */
    enrichmentPolicy: function (kind) { return (((this.policy().searchEnrichment || {})[kind]) || {}); },

    /** Returns service account auth data for cross-domain summary calls. @param {Object} request Request. @returns {Object} Auth data. */
    serviceAuthData: function (request) {
        return Object.assign({}, request.authData || {}, {
            tenant: request.tenant,
            loginId: 'productSearchPublication',
            principalType: 'service',
            groups: ['serviceAccountUserGroup']
        });
    },

    /** Returns Product variant SKUs for internal summary calls. @param {Array} variants Product variants. @returns {Array} SKUs. */
    variantSkus: function (variants) {
        return Array.from(new Set((variants || []).map(variant => variant && variant.sku).filter(Boolean).map(String)));
    },

    /** Resolves one Product customer price summary. @param {Object} request Request. @param {Object} input Publication input. @returns {Promise<Object|undefined>} Price. */
    price: async function (request, input) {
        let policy = this.enrichmentPolicy('pricing');
        if (policy.enabled === false) return undefined;
        let service = SERVICE[policy.serviceName || 'DefaultCustomerPriceSummaryService'];
        if (!service || typeof service.summarize !== 'function') return undefined;
        let result = await service.summarize({
            tenant: request.tenant,
            authData: this.serviceAuthData(request),
            productCodes: [input.product.code],
            storeCode: input.storeCode,
            currency: input.currency || policy.defaultCurrency,
            quantity: input.quantity || policy.defaultQuantity || '1',
            now: request.now,
            correlationId: request.correlationId
        });
        return result[input.product.code];
    },

    /** Resolves one Product customer availability summary. @param {Object} request Request. @param {Object} input Publication input. @returns {Promise<Object|undefined>} Availability. */
    availability: async function (request, input) {
        let policy = this.enrichmentPolicy('inventory');
        if (policy.enabled === false) return undefined;
        let service = SERVICE[policy.serviceName || 'DefaultCustomerAvailabilitySummaryService'];
        if (!service || typeof service.summarize !== 'function') return undefined;
        let skus = this.variantSkus(input.variants);
        if (skus.length === 0) return undefined;
        let result = await service.summarize({
            tenant: request.tenant,
            authData: this.serviceAuthData(request),
            products: [{ productCode: input.product.code, skus: skus }],
            storeCode: input.storeCode,
            now: request.now,
            correlationId: request.correlationId
        });
        return result[input.product.code];
    },

    /** Resolves active module-contributed domain projection enrichments without Product depending on any accelerator. */
    domains: async function (request, input) {
        let policy = this.enrichmentPolicy('domains');
        if (policy.enabled === false) return {};
        let result = {};
        for (let code of Object.keys(policy.contributors || {}).sort()) {
            let contribution = policy.contributors[code] || {}, service = SERVICE[contribution.serviceName];
            if (!service || typeof service.enrich !== 'function') {
                if (contribution.required === true) throw new Error('Missing Product domain enrichment service: ' + contribution.serviceName);
                continue;
            }
            Object.assign(result, await service.enrich(request, input));
        }
        return result;
    },

    /** Returns customer-safe summaries for search projection payload. @param {Object} request Request. @param {Object} input Publication input. @returns {Promise<Object>} Enrichment. */
    enrich: async function (request, input) {
        let result = {};
        try {
            let price = await this.price(request, input);
            if (price) result.price = price;
        } catch (error) {
            if (this.enrichmentPolicy('pricing').missingBehavior === 'error') throw error;
        }
        try {
            let availability = await this.availability(request, input);
            if (availability) result.availability = availability;
        } catch (error) {
            if (this.enrichmentPolicy('inventory').missingBehavior === 'error') throw error;
        }
        try { Object.assign(result, await this.domains(request, input)); } catch (error) {
            if (this.enrichmentPolicy('domains').missingBehavior === 'error') throw error;
        }
        return result;
    }
};
