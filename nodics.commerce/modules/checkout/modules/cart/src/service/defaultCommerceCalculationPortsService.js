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
    /** Reads a bounded owner projection. @param {Object} service Generated owner service. @param {string} tenant Tenant code. @param {Object} query Owner query. @param {number} limit Result limit. @returns {Promise<Array>} Matching records. */
    list: function (service, tenant, query, limit) { return service.get({ tenant, query: Object.assign({ tenant }, query), pageSize: limit || 20 }).then(this.unwrap).then(items => Array.isArray(items) ? items : items ? [items] : []); },
    /** Creates Cart calculation ports backed by domain owners. @param {Object} cart Cart context. @returns {Object} Pricing, Inventory, Promotion and Tax ports. */
    create: function (cart) {
        const self = this; const exact = SERVICE.DefaultExactAmountService;
        return {
            exact,
            pricing: async request => {
                const rows = await self.list(SERVICE.DefaultPriceRowService, request.tenant, { productCode: request.productCode, currency: request.currency }, 100);
                const eligible = rows.filter(row => exact.compare(request.quantity, row.minQuantity) >= 0).sort((a, b) => exact.compare(b.minQuantity, a.minQuantity));
                if (!eligible[0]) throw new Error('No eligible price row');
                return SERVICE.DefaultPricingDecisionService.decide(Object.assign({}, request, { calculationVersion: '1', correlationId: cart.correlationId }), eligible[0], exact);
            },
            inventory: async request => {
                const balances = await self.list(SERVICE.DefaultInventoryBalanceService, request.tenant, { sku: request.sku }, 100);
                const candidates = SERVICE.DefaultInventorySourcingService.source(request, balances);
                return { available: candidates.some(value => exact.compare(value.available, request.quantity) >= 0), candidates };
            },
            promotion: async request => {
                const values = await self.list(SERVICE.DefaultPromotionService, request.tenant, { status: 'ACTIVE' }, 100);
                const selected = values.find(value => value.actions && value.actions.discountAmount && (!value.conditions || !value.conditions.minimumSubtotal || exact.compare(request.subtotal, value.conditions.minimumSubtotal) >= 0));
                if (!selected) return { discountAmount: '0', reasonCode: 'NO_APPLICABLE_PROMOTION', sourceHash: 'none' };
                return SERVICE.DefaultPromotionDecisionService.decide(Object.assign({}, request, { promotionCode: selected.code, targetType: 'CART', targetCode: cart.code, discountAmount: selected.actions.discountAmount, reasonCode: selected.actions.reasonCode || 'APPLIED', correlationId: cart.correlationId }), selected, exact);
            },
            tax: async request => {
                const values = await self.list(SERVICE.DefaultTaxPolicyService, request.tenant, { jurisdiction: cart.jurisdiction, status: 'ACTIVE' }, 10);
                if (!values[0]) throw new Error('No active tax policy');
                return SERVICE.DefaultTaxDecisionEngineService.decide(Object.assign({}, request, { correlationId: cart.correlationId }), values[0], exact);
            }
        };
    }
};
