/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module cart/src/service/defaultCartValidationService @description Performs non-mutating Cart validation before every customer-visible calculation. @layer service @owner cart */
module.exports = {
    /** Builds a validation reason. @param {string} code Reason code. @param {Object} entry Cart entry. @param {Object} details Additional details. @returns {Object} Reason. */
    reason: function (code, entry, details) {
        return Object.assign({ code, entryCode: entry && entry.code, productCode: entry && entry.productCode, sku: entry && entry.sku }, details || {});
    },
    /** Validates one cart entry without reserving stock or digital units. @param {Object} cart Cart. @param {Object} entry Cart entry. @param {Object} ports Owner read ports. @returns {Promise<Object>} Entry validation result. */
    validateEntry: async function (cart, entry, ports) {
        const blockingReasons = [];
        const quantity = Number(entry && entry.quantity || 0);
        if (!entry || !entry.productCode || !entry.sku) blockingReasons.push(this.reason('MISSING_PRODUCT_OR_SKU', entry));
        if (!Number.isFinite(quantity) || quantity <= 0) blockingReasons.push(this.reason('INVALID_QUANTITY', entry, { quantity: entry && entry.quantity }));
        let availability;
        if (blockingReasons.length === 0 && ports && typeof ports.inventory === 'function') {
            availability = await ports.inventory({ tenant: cart.tenant, enterpriseCode: cart.enterpriseCode, ownerId: cart.ownerId, cartCode: cart.code, entryCode: entry.code, productCode: entry.productCode, variantCode: entry.variantCode, sku: entry.sku, quantity: entry.quantity, storeCode: cart.storeCode });
            if (!availability || availability.available !== true) blockingReasons.push(this.reason('STOCK_UNAVAILABLE', entry, { inventoryStrategy: availability && (availability.inventoryStrategy || availability.strategy) }));
        }
        return {
            entryCode: entry && entry.code,
            status: blockingReasons.length ? 'BLOCKED' : 'VALID',
            blockingReasons,
            availability
        };
    },
    /** Validates a full cart without mutating inventory, coupon, promotion, or payment state. @param {Object} cart Cart with entries. @param {Object} ports Owner read ports. @returns {Promise<Object>} Cart validation result. */
    validate: async function (cart, ports) {
        if (!cart || !cart.tenant || !Array.isArray(cart.entries)) throw new Error('Complete tenant cart is required for validation');
        const entries = [];
        for (const entry of cart.entries) entries.push(await this.validateEntry(cart, entry, ports));
        const blockingReasons = entries.reduce((all, entry) => all.concat(entry.blockingReasons || []), []);
        return {
            tenant: cart.tenant,
            enterpriseCode: cart.enterpriseCode,
            cartCode: cart.code,
            revision: cart.revision,
            status: blockingReasons.length ? 'BLOCKED' : 'VALID',
            blockingReasons,
            entries,
            mutationPerformed: false,
            correlationId: cart.correlationId
        };
    }
};
