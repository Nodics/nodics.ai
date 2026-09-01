/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module cart/src/service/defaultCartCalculationEngineService @description Coordinates owner decisions into exact Cart evidence without taking ownership. @layer service @owner cart */
module.exports = {
    calculate: async function (cart, ports) {
        if (!cart || !cart.tenant || !Array.isArray(cart.entries) || !ports || !ports.pricing || !ports.tax || !ports.promotion || !ports.inventory || !ports.exact) throw new Error('Complete tenant cart and owner ports are required');
        let subtotal = '0'; const entries = [];
        for (const entry of cart.entries) {
            const availability = await ports.inventory({ tenant: cart.tenant, enterpriseCode: cart.enterpriseCode, ownerId: cart.ownerId, cartCode: cart.code, entryCode: entry.code, productCode: entry.productCode, variantCode: entry.variantCode, storeCode: cart.storeCode, sku: entry.sku, quantity: entry.quantity });
            if (!availability || availability.available !== true) throw new Error('Inventory unavailable');
            const price = await ports.pricing({ tenant: cart.tenant, enterpriseCode: cart.enterpriseCode, storeCode: cart.storeCode, productCode: entry.productCode, quantity: entry.quantity, currency: cart.currency });
            subtotal = ports.exact.add(subtotal, price.totalAmount);
            entries.push({ code: entry.code, productCode: entry.productCode, variantCode: entry.variantCode, sku: entry.sku, quantity: entry.quantity, priceDecision: price, availability });
        }
        if (entries.length === 0) {
            return Object.freeze({
                tenant: cart.tenant,
                enterpriseCode: cart.enterpriseCode,
                cartCode: cart.code,
                revision: cart.revision,
                entries,
                subtotal: ports.exact.normalize('0'),
                discountAmount: ports.exact.normalize('0'),
                taxAmount: ports.exact.normalize('0'),
                totalAmount: ports.exact.normalize('0'),
                currency: cart.currency,
                decisions: { discount: { discountAmount: ports.exact.normalize('0'), reasonCode: 'EMPTY_CART', mutationPerformed: false }, tax: { taxAmount: ports.exact.normalize('0'), reasonCode: 'EMPTY_CART' } },
                correlationId: cart.correlationId
            });
        }
        const discount = await ports.promotion({ tenant: cart.tenant, enterpriseCode: cart.enterpriseCode, ownerId: cart.ownerId, cartCode: cart.code, subtotal, currency: cart.currency, productCodes: entries.map(entry => entry.productCode), customerGroup: cart.customerGroup, couponCode: cart.couponCode, idempotencyKey: cart.idempotencyKey });
        const taxable = ports.exact.add(subtotal, '-' + ports.exact.normalize(discount.discountAmount || '0'));
        const tax = await ports.tax({ tenant: cart.tenant, taxableAmount: taxable, currency: cart.currency });
        return Object.freeze({ tenant: cart.tenant, enterpriseCode: cart.enterpriseCode, cartCode: cart.code, revision: cart.revision, entries, subtotal, discountAmount: ports.exact.normalize(discount.discountAmount || '0'), taxAmount: tax.taxAmount, totalAmount: ports.exact.add(taxable, tax.taxAmount), currency: cart.currency, decisions: { discount, tax }, correlationId: cart.correlationId });
    }
};
