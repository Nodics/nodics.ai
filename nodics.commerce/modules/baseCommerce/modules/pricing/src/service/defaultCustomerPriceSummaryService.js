/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module pricing/src/service/defaultCustomerPriceSummaryService
 * @description Produces customer-safe Product price summaries for browse/search projections without exposing price-row internals.
 * @layer service
 * @owner pricing
 * @override Later pricing modules may add channel, segment, promotion, or contract price inputs while retaining Pricing authority.
 */
module.exports = {
    /** Initializes the service lifecycle. @returns {Promise<boolean>} Initialization result. */
    init: function () { return Promise.resolve(true); },
    /** Completes the service lifecycle. @returns {Promise<boolean>} Initialization result. */
    postInit: function () { return Promise.resolve(true); },

    /** Returns the effective customer summary policy. @returns {Object} Policy. */
    policy: function () { return (((CONFIG.get('pricing') || {}).customerSummary) || {}); },

    /** Extracts generated-service records. @param {*} response Service response. @returns {Array} Records. */
    records: function (response) {
        if (Array.isArray(response)) return response;
        if (response && Array.isArray(response.result)) return response.result;
        if (response && response.data && Array.isArray(response.data.result)) return response.data.result;
        if (response && response.data && Array.isArray(response.data)) return response.data;
        return [];
    },

    /** Returns bounded unique Product codes. @param {Array} productCodes Requested Product codes. @returns {Array} Product codes. */
    productCodes: function (productCodes) {
        let maximum = Number(this.policy().maximumProductsPerRequest || 100);
        return Array.from(new Set((productCodes || []).filter(Boolean).map(String))).slice(0, maximum);
    },

    /** Returns service account auth data for internal Pricing reads. @param {Object} request Request. @returns {Object} Auth data. */
    serviceAuthData: function (request) {
        return Object.assign({}, request.authData || {}, {
            tenant: request.tenant,
            loginId: 'productSearchPublication',
            principalType: 'service',
            groups: ['serviceAccountUserGroup']
        });
    },

    /** Loads active Price Books for a currency. @param {Object} request Request. @param {string} currency Currency. @returns {Promise<Array>} Price books. */
    loadPriceBooks: async function (request, currency) {
        if (!SERVICE.DefaultPriceBookService || typeof SERVICE.DefaultPriceBookService.get !== 'function') return [];
        return this.records(await SERVICE.DefaultPriceBookService.get({
            tenant: request.tenant,
            authData: this.serviceAuthData(request),
            query: { tenant: request.tenant, currency: currency, status: 'ACTIVE' },
            searchOptions: { pageSize: 100, pageNumber: 1 }
        }));
    },

    /** Loads Price Rows for requested Product codes. @param {Object} request Request. @param {Array} productCodes Product codes. @param {string} currency Currency. @returns {Promise<Array>} Price rows. */
    loadPriceRows: async function (request, productCodes, currency) {
        if (!SERVICE.DefaultPriceRowService || typeof SERVICE.DefaultPriceRowService.get !== 'function' || productCodes.length === 0) return [];
        return this.records(await SERVICE.DefaultPriceRowService.get({
            tenant: request.tenant,
            authData: this.serviceAuthData(request),
            query: { tenant: request.tenant, productCode: { $in: productCodes }, currency: currency },
            searchOptions: { pageSize: productCodes.length * 20, pageNumber: 1 }
        }));
    },

    /** Summarizes customer-safe Product prices keyed by Product code. @param {Object} request Request. @returns {Promise<Object>} Summary by Product code. */
    summarize: async function (request) {
        let policy = this.policy();
        if (policy.enabled === false) return {};
        if (!request || !request.tenant) throw new Error('Tenant is required for customer price summary');
        let productCodes = this.productCodes(request.productCodes);
        if (productCodes.length === 0) return {};
        if (!SERVICE.DefaultPriceSelectionService || !SERVICE.DefaultExactAmountService) return {};

        let currency = request.currency || policy.defaultCurrency || 'USD';
        let quantity = request.quantity || policy.defaultQuantity || '1';
        let books = await this.loadPriceBooks(request, currency);
        let rows = await this.loadPriceRows(request, productCodes, currency);
        let result = {};
        for (let productCode of productCodes) {
            let decision = SERVICE.DefaultPriceSelectionService.select(Object.assign({}, request, {
                productCode: productCode,
                currency: currency,
                quantity: quantity
            }), books, rows, SERVICE.DefaultExactAmountService);
            if (!decision.selected) continue;
            let summary = {
                currency: decision.selected.currency,
                unitAmount: SERVICE.DefaultExactAmountService.normalize(decision.selected.unitAmount)
            };
            if (policy.includeEvidence === true) summary.priceRowCode = decision.selected.code;
            result[productCode] = summary;
        }
        return result;
    }
};
