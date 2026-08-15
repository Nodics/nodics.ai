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
const service = require('../src/service/defaultInventoryPublicationService');

test('Inventory exposes only internal operational publication restoration', () => {
    const route = routers.inventory.operator.restoreOperational;
    assert.equal(route.key, '/internal/inventory/publication/operational/restore');
    assert.equal(route.apiExposure, 'commercePublicationIngestion');
    assert.equal(route.secured, true);
});

test('Inventory operational restoration saves tenant-bound warehouses and balances', async () => {
    const saves = [];
    global.SERVICE = {
        DefaultWarehouseService: { save: async request => { saves.push({ service: 'warehouse', request }); return { result: request.model }; } },
        DefaultInventoryBalanceService: { save: async request => { saves.push({ service: 'balance', request }); return { result: request.model }; } }
    };
    const result = await service.restoreOperational({ tenant: 'default', authData: { tenant: 'default' } }, {
        warehouses: [{ code: 'main', tenant: 'default', name: 'Main', status: 'ACTIVE', priority: 1, revision: 1 }],
        inventoryBalances: [{ code: 'main|sku', tenant: 'default', warehouseCode: 'main', sku: 'SKU-1', onHand: '10', reserved: '0', allocated: '0', available: '10', revision: 1 }]
    });
    assert.equal(result.restored, 2);
    assert.deepEqual(saves.map(item => item.service), ['warehouse', 'balance']);
    assert(saves.every(item => item.request.model.active === true));
});
