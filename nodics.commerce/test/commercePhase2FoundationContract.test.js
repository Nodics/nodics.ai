/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const base = path.resolve(__dirname, '../modules/baseCommerce/modules');
const exact = require(path.join(base, 'pricing/src/service/defaultExactAmountService'));
const pricing = require(path.join(base, 'pricing/src/service/defaultPricingDecisionService'));
const inventory = require(path.join(base, 'inventory/src/service/defaultInventoryReservationPolicyService'));
const stores = require(path.join(base, 'store/src/service/defaultStoreContextService'));
const publication = require(path.join(base, 'product/src/service/defaultProductPublicationPolicyService'));
const tax = require(path.join(base, 'tax/src/service/defaultTaxDecisionEngineService'));
const promotion = require(path.join(base, 'promotion/src/service/defaultPromotionDecisionService'));
const sourcing = require(path.join(base, 'inventory/src/service/defaultInventorySourcingService'));
assert.equal(exact.add('0.1', '0.2'), '0.3');
assert.equal(exact.multiply('19.99', '3'), '59.97');
assert.throws(() => exact.normalize(1.2), /decimal string/u);
const decision = pricing.decide({ tenant: 't1', productCode: 'p1', storeCode: 's1', quantity: '3', currency: 'USD', calculationVersion: '1', correlationId: 'c1' }, { tenant: 't1', code: 'r1', unitAmount: '19.99', currency: 'USD' }, exact);
assert.equal(decision.totalAmount, '59.97'); assert.equal(decision.sourceHash.length, 64);
assert.throws(() => pricing.decide({ tenant: 't2', currency: 'USD' }, { tenant: 't1', currency: 'USD' }, exact), /Tenant/u);
const reservation = inventory.prepare({ tenant: 't1', quantity: '2.000', ownerType: 'CART', ownerCode: 'c1', idempotencyKey: 'i1', correlationId: 'x1' }, { tenant: 't1', warehouseCode: 'w1', sku: 'sku1', revision: 7 }, exact);
assert.equal(reservation.quantity, '2'); assert.equal(reservation.expectedBalanceRevision, 7);
assert.throws(() => inventory.prepare({ tenant: 't1', quantity: '0' }, { tenant: 't1' }, exact), /positive/u);
assert.equal(stores.resolve({ tenant: 't1' }, { tenant: 't1', code: 's1', status: 'ACTIVE', defaultCurrency: 'USD', defaultLocale: 'en', timezone: 'UTC' }, { tenant: 't1', code: 'web', storeCode: 's1', status: 'ACTIVE' }).currency, 'USD');
assert.equal(publication.stage({ tenant: 't1', correlationId: 'c1' }, { tenant: 't1', code: 'p1', status: 'ACTIVE', catalogVersion: 'v1', revision: 2 }).sourceHash.length, 64);
assert.equal(tax.decide({ tenant: 't1', taxableAmount: '10.00', currency: 'USD', correlationId: 'c1' }, { tenant: 't1', status: 'ACTIVE', taxCode: 'VAT', jurisdiction: 'AE', rate: '0.05', revision: 1 }, exact).taxAmount, '0.5');
assert.equal(promotion.decide({ tenant: 't1', discountAmount: '2.50', targetType: 'CART', targetCode: 'c1', currency: 'USD', reasonCode: 'WELCOME', correlationId: 'x' }, { tenant: 't1', code: 'promo', status: 'ACTIVE', revision: 1 }, exact).discountAmount, '2.5');
assert.equal(sourcing.source({ tenant: 't1', sku: 'sku1' }, [{ tenant: 't2', sku: 'sku1', available: '9' }, { tenant: 't1', sku: 'sku1', warehouseCode: 'w1', available: '3', revision: 1 }]).length, 1);
console.log('Commerce foundation contract validated');
