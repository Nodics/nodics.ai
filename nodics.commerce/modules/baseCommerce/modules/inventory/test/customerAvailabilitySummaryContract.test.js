/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

/**
 * @module inventory/test/customerAvailabilitySummaryContract
 * @description Verifies customer-safe availability summaries retain Inventory authority and hide stock internals.
 * @layer test
 * @owner inventory
 */

const properties = require('../config/properties');
const summary = require('../src/service/defaultCustomerAvailabilitySummaryService');
const sourcing = require('../src/service/defaultInventorySourcingService');

const balances = [
    { tenant: 'default', enterpriseCode: 'enterprise-a', warehouseCode: 'main', sku: 'SKU-1', available: '3', priority: 1, revision: 7 },
    { tenant: 'default', enterpriseCode: 'enterprise-a', warehouseCode: 'main', sku: 'SKU-2', available: '0', priority: 1, revision: 3 },
    { tenant: 'default', enterpriseCode: 'enterprise-b', warehouseCode: 'other-enterprise', sku: 'SKU-1', available: '99', priority: 1, revision: 1 },
    { tenant: 'other', enterpriseCode: 'enterprise-a', warehouseCode: 'other', sku: 'SKU-1', available: '99', priority: 1, revision: 1 }
];
let balanceRequests;

test.beforeEach(() => {
    balanceRequests = [];
    global.CONFIG = { get: key => key === 'inventory' ? properties.inventory : undefined };
    global.SERVICE = {
        DefaultCustomerAvailabilitySummaryService: summary,
        DefaultInventorySourcingService: sourcing,
        DefaultInventoryBalanceService: { get: async request => { balanceRequests.push(request); return { result: balances }; } }
    };
});

test('customer availability summary exposes status only and hides SKU warehouse and quantity by default', async () => {
    let result = await summary.summarize({
        tenant: 'default',
        enterpriseCode: 'enterprise-a',
        products: [{ productCode: 'agoraDress', skus: ['SKU-1', 'SKU-2'] }],
        authData: { groups: ['customerUserGroup'] }
    });

    assert.deepEqual(result.agoraDress, { available: true, status: 'IN_STOCK' });
    assert.equal(result.agoraDress.sku, undefined);
    assert.equal(result.agoraDress.warehouseCode, undefined);
    assert.equal(result.agoraDress.availableQuantity, undefined);
    assert.deepEqual(balanceRequests[0].authData.groups, ['serviceAccountUserGroup']);
    assert.equal(balanceRequests[0].authData.enterpriseCode, 'enterprise-a');
    assert.equal(balanceRequests[0].query.enterpriseCode, 'enterprise-a');
    assert.deepEqual(balanceRequests[0].query.sku, { $in: ['SKU-1', 'SKU-2'] });
});

test('customer availability summary returns out of stock when no SKU can be sourced', async () => {
    let result = await summary.summarize({
        tenant: 'default',
        enterpriseCode: 'enterprise-a',
        products: [{ productCode: 'agoraBelt', skus: ['SKU-2'] }]
    });

    assert.deepEqual(result.agoraBelt, { available: false, status: 'OUT_OF_STOCK' });
});

test('customer availability summary fails open when generated inventory service is unavailable', async () => {
    global.SERVICE = {
        DefaultCustomerAvailabilitySummaryService: summary,
        DefaultInventorySourcingService: sourcing
    };

    let result = await summary.summarize({ tenant: 'default', products: [{ productCode: 'agoraDress', skus: ['SKU-1'] }] });

    assert.deepEqual(result, {});
});
