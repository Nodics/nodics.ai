/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module cart/src/service/defaultCommerceCalculationPortsService @description Resolves Pricing, Promotion, Tax, and Inventory owner evidence for Cart. @layer service @owner cart */
module.exports = {
    unwrap: response => response && Object.prototype.hasOwnProperty.call(response, 'result') ? response.result : response,
    /** Builds service authentication for calculation owner reads. @param {Object} cart Cart context. @returns {Object} Internal service auth data. */
    serviceAuthData: function (cart) {
        return {
            tenant: cart && cart.tenant,
            loginId: 'cartCalculation',
            principalType: 'service',
            userGroups: ['serviceAccountUserGroup'],
            groups: ['serviceAccountUserGroup']
        };
    },
    /** Reads a bounded owner projection. @param {Object} service Generated owner service. @param {string} tenant Tenant code. @param {Object} query Owner query. @param {number} limit Result limit. @returns {Promise<Array>} Matching records. */
    list: function (service, tenant, query, limit, authData) { return service.get({ tenant, authData, query: Object.assign({ tenant }, query), pageSize: limit || 20 }).then(this.unwrap).then(items => Array.isArray(items) ? items : items ? [items] : []); },
    /** Loads active Price Books through the Pricing owner boundary. @param {Object} request Pricing request. @param {Object} authData Internal auth data. @returns {Promise<Array>} Active Price Books. */
    loadPriceBooks: function (request, authData) {
        return this.list(SERVICE.DefaultPriceBookService, request.tenant, { currency: request.currency, status: 'ACTIVE' }, 100, authData);
    },
    /** Loads candidate Price Rows through the Pricing owner boundary. @param {Object} request Pricing request. @param {Object} authData Internal auth data. @returns {Promise<Array>} Candidate Price Rows. */
    loadPriceRows: function (request, authData) {
        return this.list(SERVICE.DefaultPriceRowService, request.tenant, { productCode: request.productCode, currency: request.currency }, 100, authData);
    },
    /** Selects a governed price row and returns replayable Pricing decision evidence. @param {Object} request Pricing request. @param {Object} cart Cart context. @param {Object} authData Internal auth data. @returns {Promise<Object>} Pricing decision. */
    price: async function (request, cart, authData) {
        if (!SERVICE.DefaultPriceSelectionService) throw new Error('Price selection service is required');
        const exact = SERVICE.DefaultExactAmountService;
        const books = await this.loadPriceBooks(request, authData);
        const rows = await this.loadPriceRows(request, authData);
        const selection = SERVICE.DefaultPriceSelectionService.select(request, books, rows, exact);
        if (!selection.selected) throw new Error('No eligible price row');
        return SERVICE.DefaultPricingDecisionService.decide(Object.assign({}, request, { calculationVersion: '1', correlationId: cart.correlationId }), selection.selected, exact);
    },
    /** Creates Cart calculation ports backed by domain owners. @param {Object} cart Cart context. @returns {Object} Pricing, Inventory, Promotion and Tax ports. */
    create: function (cart) {
        const self = this; const exact = SERVICE.DefaultExactAmountService;
        const authData = this.serviceAuthData(cart);
        return {
            exact,
            pricing: async request => {
                return self.price(request, cart, authData);
            },
            inventory: async request => {
                const balances = await self.list(SERVICE.DefaultInventoryBalanceService, request.tenant, { sku: request.sku }, 100, authData);
                const candidates = SERVICE.DefaultInventorySourcingService.source(request, balances);
                return { available: candidates.some(value => exact.compare(value.available, request.quantity) >= 0), candidates };
            },
            promotion: async request => {
                const values = await self.list(SERVICE.DefaultPromotionService, request.tenant, { status: 'ACTIVE' }, 100, authData);
                const selected = values.find(value => value.actions && value.actions.discountAmount && (!value.conditions || !value.conditions.minimumSubtotal || exact.compare(request.subtotal, value.conditions.minimumSubtotal) >= 0));
                if (!selected) return { discountAmount: '0', reasonCode: 'NO_APPLICABLE_PROMOTION', sourceHash: 'none' };
                return SERVICE.DefaultPromotionDecisionService.decide(Object.assign({}, request, { promotionCode: selected.code, targetType: 'CART', targetCode: cart.code, discountAmount: selected.actions.discountAmount, reasonCode: selected.actions.reasonCode || 'APPLIED', correlationId: cart.correlationId }), selected, exact);
            },
            tax: async request => {
                const values = await self.list(SERVICE.DefaultTaxPolicyService, request.tenant, { jurisdiction: cart.jurisdiction, status: 'ACTIVE' }, 10, authData);
                if (!values[0]) throw new Error('No active tax policy');
                return SERVICE.DefaultTaxDecisionEngineService.decide(Object.assign({}, request, { correlationId: cart.correlationId }), values[0], exact);
            }
        };
    }
};
