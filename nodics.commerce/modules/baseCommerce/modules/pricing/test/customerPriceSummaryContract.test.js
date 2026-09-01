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
 * @module pricing/test/customerPriceSummaryContract
 * @description Verifies customer-safe price summaries retain Pricing authority and hide price-row internals by default.
 * @layer test
 * @owner pricing
 */

const properties = require('../config/properties');
const summary = require('../src/service/defaultCustomerPriceSummaryService');
const selection = require('../src/service/defaultPriceSelectionService');
const exact = require('../src/service/defaultExactAmountService');

const books = [
    { code: 'retailUsd', tenant: 'default', enterpriseCode: 'enterprise-a', currency: 'USD', status: 'ACTIVE' },
    { code: 'otherEnterpriseUsd', tenant: 'default', enterpriseCode: 'enterprise-b', currency: 'USD', status: 'ACTIVE' },
    { code: 'otherUsd', tenant: 'other', enterpriseCode: 'enterprise-a', currency: 'USD', status: 'ACTIVE' }
];
const rows = [
    { code: 'dressBase', tenant: 'default', enterpriseCode: 'enterprise-a', priceBookCode: 'retailUsd', productCode: 'agoraDress', unitAmount: '129.00', currency: 'USD', minQuantity: '1' },
    { code: 'dressBulk', tenant: 'default', enterpriseCode: 'enterprise-a', priceBookCode: 'retailUsd', productCode: 'agoraDress', unitAmount: '119.00', currency: 'USD', minQuantity: '5' },
    { code: 'otherEnterpriseDress', tenant: 'default', enterpriseCode: 'enterprise-b', priceBookCode: 'otherEnterpriseUsd', productCode: 'agoraDress', unitAmount: '1.00', currency: 'USD', minQuantity: '1' },
    { code: 'otherTenantDress', tenant: 'other', enterpriseCode: 'enterprise-a', priceBookCode: 'otherUsd', productCode: 'agoraDress', unitAmount: '1.00', currency: 'USD', minQuantity: '1' }
];
let bookRequests;
let rowRequests;

test.beforeEach(() => {
    bookRequests = [];
    rowRequests = [];
    global.CONFIG = { get: key => key === 'pricing' ? properties.pricing : undefined };
    global.SERVICE = {
        DefaultCustomerPriceSummaryService: summary,
        DefaultPriceSelectionService: selection,
        DefaultExactAmountService: exact,
        DefaultPriceBookService: { get: async request => { bookRequests.push(request); return { result: books }; } },
        DefaultPriceRowService: { get: async request => { rowRequests.push(request); return { result: rows }; } }
    };
});

test('customer price summary selects effective tenant price and hides price-row evidence by default', async () => {
    let result = await summary.summarize({
        tenant: 'default',
        enterpriseCode: 'enterprise-a',
        productCodes: ['agoraDress'],
        currency: 'USD',
        quantity: '1',
        authData: { groups: ['customerUserGroup'] }
    });

    assert.deepEqual(result.agoraDress, { currency: 'USD', unitAmount: '129' });
    assert.equal(result.agoraDress.priceRowCode, undefined);
    assert.deepEqual(bookRequests[0].authData.groups, ['serviceAccountUserGroup']);
    assert.equal(bookRequests[0].authData.enterpriseCode, 'enterprise-a');
    assert.equal(bookRequests[0].query.enterpriseCode, 'enterprise-a');
    assert.equal(rowRequests[0].query.enterpriseCode, 'enterprise-a');
    assert.deepEqual(rowRequests[0].query.productCode, { $in: ['agoraDress'] });
});

test('customer price summary applies quantity tier without leaking other tenants', async () => {
    let result = await summary.summarize({
        tenant: 'default',
        enterpriseCode: 'enterprise-a',
        productCodes: ['agoraDress'],
        currency: 'USD',
        quantity: '5'
    });

    assert.deepEqual(result.agoraDress, { currency: 'USD', unitAmount: '119' });
});

test('customer price summary fails open when generated price services are unavailable', async () => {
    global.SERVICE = {
        DefaultCustomerPriceSummaryService: summary,
        DefaultPriceSelectionService: selection,
        DefaultExactAmountService: exact
    };

    let result = await summary.summarize({ tenant: 'default', productCodes: ['agoraDress'], currency: 'USD' });

    assert.deepEqual(result, {});
});
