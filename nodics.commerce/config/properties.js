/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module nodics.commerce/config/properties @description Publishes browser-safe Commerce capability and navigation projections. @layer config @owner nodics.commerce */
const navigationFactory = require('./navigationItem');
const item = navigationFactory.item;
const navigation = navigationFactory.lifecycle([
    item('catalog-and-products', undefined, 'Catalog & Products', '/commerce/catalog', 'product', 'product', 100, 'commerce.catalog.read', 'Manage Store and Product sellable truth; lifecycle reversals never start here.'),
    item('stores', 'catalog-and-products', 'Stores & Channels', '/commerce/catalog/stores', 'store', 'store', 110, 'commerce.store.read', 'Review tenant selling contexts, channels, locale, currency, and activation.'),
    item('products', 'catalog-and-products', 'Products', '/commerce/catalog/products', 'product', 'product', 120, 'commerce.product.read', 'Manage product identity, variants, categories, and staged publication.'),
    item('prices', 'catalog-and-products', 'Prices', '/commerce/catalog/prices', 'pricing', 'priceRow', 130, 'commerce.pricing.read', 'Inspect exact price rows and replayable Pricing decisions.'),
    item('tax-policies', 'catalog-and-products', 'Tax Policies', '/commerce/catalog/tax', 'tax', 'taxPolicy', 140, 'commerce.tax.read', 'Operate jurisdiction policy and exact Tax decision evidence.'),
    item('promotions', 'catalog-and-products', 'Promotions', '/commerce/catalog/promotions', 'promotion', 'promotion', 150, 'commerce.promotion.read', 'Manage promotion rules, coupons, and applied-discount evidence.'),
    item('inventory-operations', undefined, 'Inventory Operations', '/commerce/inventory', 'inventory', 'inventoryBalance', 200, 'commerce.inventory.read', 'Operate warehouse balances, reservations, allocations, and movements.'),
    item('inventory-reservations', 'inventory-operations', 'Reservations', '/commerce/inventory/reservations', 'inventory', 'inventoryReservation', 210, 'commerce.inventory.read', 'Diagnose tenant-scoped idempotent reservation evidence.'),
    item('checkout-and-orders', undefined, 'Checkout & Orders', '/commerce/checkout', 'order', 'commerceOrder', 300, 'commerce.order.read', 'Review calculated carts, placement checkpoints, immutable orders, and history.'),
    item('carts', 'checkout-and-orders', 'Carts & Calculation', '/commerce/checkout/carts', 'cart', 'cart', 310, 'commerce.cart.read', 'Inspect Cart entries, owner decisions, totals, and calculation diagnostics.'),
    item('orders', 'checkout-and-orders', 'Orders', '/commerce/checkout/orders', 'order', 'commerceOrder', 320, 'commerce.order.read', 'Inspect immutable Order projections and append-only history.'),
    item('order-cancellations', 'checkout-and-orders', 'Cancellations', '/commerce/checkout/cancellations', 'order', 'orderLifecycleRequest', 330, 'commerce.lifecycle.read', 'Operate cancellation intent through policy, approval, and owner actions.'),
    item('order-returns', 'checkout-and-orders', 'Returns', '/commerce/checkout/returns', 'order', 'orderLifecycleRequest', 340, 'commerce.lifecycle.read', 'Operate return intent, RMA logistics, receipt, inspection, and disposition.'),
    item('order-refunds', 'checkout-and-orders', 'Refunds', '/commerce/checkout/refunds', 'order', 'orderLifecycleRequest', 350, 'commerce.lifecycle.read', 'Operate maker-checker refund intent through Payment and reconciliation evidence.'),
    item('payment-operations', undefined, 'Payment Operations', '/commerce/payments', 'paymentCore', 'paymentTransaction', 400, 'commerce.payment.read', 'Operate method, provider, transaction, callback, refund, and reconciliation evidence.'),
    item('payment-reconciliation', 'payment-operations', 'Refunds & Reconciliation', '/commerce/payments/reconciliation', 'paymentCore', 'paymentReconciliation', 410, 'commerce.payment.reconcile', 'Reconcile provider outcomes without exposing tokens or secrets.'),
    item('fulfillment-operations', undefined, 'Fulfillment Operations', '/commerce/fulfillment', 'fulfillmentCore', 'consignment', 500, 'commerce.fulfillment.read', 'Operate consignments, shipments, tracking, warehouse tasks, and returns.'),
    item('shipments', 'fulfillment-operations', 'Shipments & Tracking', '/commerce/fulfillment/shipments', 'fulfillmentCore', 'shipment', 510, 'commerce.fulfillment.read', 'Inspect partial shipment and carrier-safe tracking evidence.'),
    item('return-receipts', 'fulfillment-operations', 'Return Receipt & Inspection', '/commerce/fulfillment/returns', 'fulfillmentCore', 'returnInspection', 520, 'commerce.fulfillment.return', 'Record returned-goods receipt and inspection before Inventory disposition.')
]);
module.exports = {
    backofficeCapabilities: { 'nodics.commerce': {
        enabled: true, capabilityId: 'commerce', displayName: 'Commerce', category: 'commerce', icon: 'commerce',
        contractVersion: 1, minimumClientContractVersion: 1, roles: ['FUNCTIONAL_CAPABILITY_PROVIDER'],
        navigation
    } },
    commerce: {
        capabilities: { baseCommerce: true, cart: true, order: true, payment: true, fulfillment: true, reverseLifecycle: true },
        operations: {
            budgetVersion: '1',
            limits: { maximumPageSize: 100, maximumCartEntries: 500, maximumBatchSize: 100, maximumConcurrentProviderRequests: 25 },
            retries: { maximumAttempts: 5, baseDelayMs: 250, maximumDelayMs: 30000 },
            referenceObjectives: { cartCalculationP95Ms: 250, checkoutPlacementP95Ms: 1500, operatorReadP95Ms: 500, recoveryPointMinutes: 15, recoveryTimeMinutes: 60 },
            deploymentApprovalRequired: true,
            note: 'Reference objectives require environment-specific load, soak, provider, backup, restore, failover, and owner acceptance evidence.'
        },
        compatibility: { aliasWindow: '2_MINOR_RELEASES_OR_180_DAYS', rejectUnknownMajor: true },
        migration: { defaultStrategy: 'DRY_RUN', requireTenantCounts: true, requireSourceHashes: true, quarantineFailures: true, rollbackRequired: true }
    }
};
