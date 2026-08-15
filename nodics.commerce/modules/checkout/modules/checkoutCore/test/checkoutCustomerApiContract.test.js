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
const facade = require('../src/facade/defaultCheckoutApiFacade');

test('Checkout customer API resolves owner from authenticated customer login id', async () => {
    let placed;
    global.SERVICE = {
        DefaultCheckoutApiService: {
            place: async request => {
                placed = request;
                return { order: { code: request.payload.orderCode, ownerId: request.ownerId } };
            }
        }
    };
    const result = await facade.place({
        tenant: 'default',
        authData: { tenant: 'default', loginId: 'storefront.customer@example.com' },
        payload: { cartCode: 'cart-1', orderCode: 'order-1' },
        idempotencyKey: 'order-1:place',
        requestId: 'request-1'
    });
    assert.equal(placed.ownerId, 'storefront.customer@example.com');
    assert.equal(placed.correlationId, 'request-1');
    assert.deepEqual(placed.authData.userGroups, ['customerUserGroup']);
    assert.deepEqual(placed.authData.groups, ['customerUserGroup']);
    assert.equal(placed.authData.principalType, 'customer');
    assert.equal(result.order.ownerId, 'storefront.customer@example.com');
});
