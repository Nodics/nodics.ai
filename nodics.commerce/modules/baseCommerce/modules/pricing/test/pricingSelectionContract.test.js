/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
const assert = require('assert');
const exact = require('../src/service/defaultExactAmountService');
const selector = require('../src/service/defaultPriceSelectionService');
const now = new Date('2026-08-10T00:00:00Z');
const books = [{ code: 'retail', tenant: 't1', currency: 'USD', status: 'ACTIVE' }, { code: 'other', tenant: 't2', currency: 'USD', status: 'ACTIVE' }];
const rows = [
    { code: 'base', tenant: 't1', priceBookCode: 'retail', productCode: 'p1', currency: 'USD', minQuantity: '1', unitAmount: '10.00' },
    { code: 'tier10', tenant: 't1', priceBookCode: 'retail', productCode: 'p1', currency: 'USD', minQuantity: '10', unitAmount: '8.00' },
    { code: 'tier10-conflict', tenant: 't1', priceBookCode: 'retail', productCode: 'p1', currency: 'USD', minQuantity: '10', unitAmount: '7.50' },
    { code: 'foreign', tenant: 't2', priceBookCode: 'other', productCode: 'p1', currency: 'USD', minQuantity: '1', unitAmount: '1.00' }
];
let result = selector.select({ tenant: 't1', productCode: 'p1', currency: 'USD', quantity: '12', now: now }, books, rows, exact);
assert.strictEqual(result.selected.code, 'tier10');
assert.deepStrictEqual(result.conflicts, ['tier10-conflict']);
assert.strictEqual(result.explanation.find(item => item.rowCode === 'foreign'), undefined);
result = selector.select({ tenant: 't1', productCode: 'p1', currency: 'USD', quantity: '0.5', now: now }, books, rows, exact);
assert.strictEqual(result.selected, undefined);
console.log('Pricing tier selection and conflict contract passed');
