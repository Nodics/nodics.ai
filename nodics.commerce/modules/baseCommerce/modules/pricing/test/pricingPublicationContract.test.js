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
const routers = require('../src/router/routers');
const service = require('../src/service/defaultPricingPublicationService');

test('Pricing exposes only internal operational publication restoration', () => {
    const route = routers.pricing.operator.restoreOperational;
    assert.equal(route.key, '/internal/pricing/publication/operational/restore');
    assert.equal(route.apiExposure, 'commercePublicationIngestion');
    assert.equal(route.secured, true);
});

test('Pricing operational restoration saves tenant-bound price books and rows', async () => {
    const saves = [];
    global.SERVICE = {
        DefaultPriceBookService: { save: async request => { saves.push({ service: 'book', request }); return { result: request.model }; } },
        DefaultPriceRowService: { save: async request => { saves.push({ service: 'row', request }); return { result: request.model }; } }
    };
    const result = await service.restoreOperational({ tenant: 'default', authData: { tenant: 'default' } }, {
        priceBooks: [{ code: 'retail', tenant: 'default', currency: 'USD', status: 'ACTIVE', validFrom: '2026-01-01T00:00:00.000Z', revision: 1 }],
        priceRows: [{ code: 'dress', tenant: 'default', priceBookCode: 'retail', productCode: 'agoraDress', unitAmount: '129.00', currency: 'USD', minQuantity: '1', validFrom: '2026-01-01T00:00:00.000Z', revision: 1 }]
    });
    assert.equal(result.restored, 2);
    assert.deepEqual(saves.map(item => item.service), ['book', 'row']);
    assert(saves.every(item => item.request.model.active === true));
    assert(saves.every(item => item.request.model.created instanceof Date));
    assert(saves.every(item => item.request.model.updated instanceof Date));
    assert(saves.every(item => item.request.model.validFrom instanceof Date));
});
