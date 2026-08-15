/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module inventory/src/service/defaultCustomerAvailabilitySummaryService
 * @description Produces customer-safe availability summaries without exposing SKU, warehouse, or stock quantities.
 * @layer service
 * @owner inventory
 * @override Later inventory modules may add sourcing zones, ATP, or reservation-aware availability while preserving Inventory authority.
 */
module.exports = {
    /** Initializes the service lifecycle. @returns {Promise<boolean>} Initialization result. */
    init: function () { return Promise.resolve(true); },
    /** Completes the service lifecycle. @returns {Promise<boolean>} Initialization result. */
    postInit: function () { return Promise.resolve(true); },

    /** Returns the effective customer summary policy. @returns {Object} Policy. */
    policy: function () { return (((CONFIG.get('inventory') || {}).customerSummary) || {}); },

    /** Extracts generated-service records. @param {*} response Service response. @returns {Array} Records. */
    records: function (response) {
        if (Array.isArray(response)) return response;
        if (response && Array.isArray(response.result)) return response.result;
        if (response && response.data && Array.isArray(response.data.result)) return response.data.result;
        if (response && response.data && Array.isArray(response.data)) return response.data;
        return [];
    },

    /** Returns service account auth data for internal Inventory reads. @param {Object} request Request. @returns {Object} Auth data. */
    serviceAuthData: function (request) {
        return Object.assign({}, request.authData || {}, {
            tenant: request.tenant,
            loginId: 'productSearchPublication',
            principalType: 'service',
            userGroups: ['serviceAccountUserGroup'],
            groups: ['serviceAccountUserGroup']
        });
    },

    /** Returns bounded Product inputs with unique SKUs. @param {Array} products Products. @returns {Array} Normalized inputs. */
    products: function (products) {
        let maximum = Number(this.policy().maximumProductsPerRequest || 100);
        return (products || []).filter(item => item && item.productCode).slice(0, maximum).map(item => ({
            productCode: String(item.productCode),
            skus: Array.from(new Set((item.skus || []).filter(Boolean).map(String)))
        }));
    },

    /** Loads inventory balances for SKUs. @param {Object} request Request. @param {Array} skus SKUs. @returns {Promise<Array>} Balances. */
    loadBalances: async function (request, skus) {
        if (!SERVICE.DefaultInventoryBalanceService || typeof SERVICE.DefaultInventoryBalanceService.get !== 'function' || skus.length === 0) return [];
        return this.records(await SERVICE.DefaultInventoryBalanceService.get({
            tenant: request.tenant,
            authData: this.serviceAuthData(request),
            query: { tenant: request.tenant, sku: { $in: skus } },
            searchOptions: { pageSize: skus.length * 10, pageNumber: 1 }
        }));
    },

    /** Summarizes customer-safe availability keyed by Product code. @param {Object} request Request. @returns {Promise<Object>} Summary by Product code. */
    summarize: async function (request) {
        let policy = this.policy();
        if (policy.enabled === false) return {};
        if (!request || !request.tenant) throw new Error('Tenant is required for customer availability summary');
        let products = this.products(request.products);
        if (products.length === 0) return {};
        if (!SERVICE.DefaultInventorySourcingService || !SERVICE.DefaultInventoryBalanceService) return {};

        let skus = Array.from(new Set(products.flatMap(item => item.skus)));
        let balances = await this.loadBalances(request, skus);
        let result = {};
        for (let product of products) {
            let candidates = product.skus.flatMap(sku => SERVICE.DefaultInventorySourcingService.source({
                tenant: request.tenant,
                sku: sku
            }, balances));
            let available = candidates.length > 0;
            let summary = { available: available, status: available ? (policy.inStockStatus || 'IN_STOCK') : (policy.outOfStockStatus || 'OUT_OF_STOCK') };
            if (policy.includeQuantity === true) {
                summary.availableQuantity = String(candidates.reduce((sum, item) => sum + Number(item.available || 0), 0));
            }
            result[product.productCode] = summary;
        }
        return result;
    }
};
