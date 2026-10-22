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
const facade = require('../src/facade/defaultCheckoutCustomerFacade');

test('Checkout customer API resolves owner from authenticated customer login id', async () => {
    global.CONFIG = { get: key => key === 'cart' ? require('../../cart/config/properties').cart : undefined };
    global.FACADE = { DefaultCartCustomerFacade: require('../../cart/src/facade/defaultCartCustomerFacade') };
    let placed;
    global.SERVICE = {
        // This test isolates Profile admission; merchantScopeContract covers real partition recovery.
        DefaultCheckoutMerchantScopeService: { resolve: async request => request },
        DefaultSecuredRequestPipelineService: { getGrantedPermissions: () => ['commerce.checkout.place'], isPermissionGranted: () => true },
        DefaultModuleService: { invokeModule: async () => ({ contractVersion: 1, tenant: 'default', enterpriseCode: 'store',
            customer: { code: 'customer-code', loginId: 'storefront.customer@example.com' } }) },
        DefaultCheckoutOperationService: {
            place: async request => {
                placed = request;
                return { order: { code: request.payload.orderCode, ownerId: request.ownerId } };
            }
        }
    };
    const result = await facade.place({
        tenant: 'default',
        authData: { tenant: 'default', enterpriseCode: 'store', loginId: 'storefront.customer@example.com',
            principalType: 'customer', tokenType: 'access', userGroups: ['customerUserGroup'] },
        authorization: 'Bearer original',
        payload: { cartCode: 'cart-1', orderCode: 'order-1' },
        idempotencyKey: 'order-1:place',
        requestId: 'request-1'
    });
    assert.equal(placed.ownerId, 'storefront.customer@example.com');
    assert.equal(placed.correlationId, 'request-1');
    assert.deepEqual(placed.authData.userGroups, ['customerUserGroup']);
    assert.equal(placed.authData.groups, undefined);
    assert.deepEqual(placed.ownerRef, { module: 'profile', schema: 'customer', code: 'customer-code' });
    assert.equal(placed.authData.principalType, 'customer');
    assert.equal(result.order.ownerId, 'storefront.customer@example.com');
    delete global.CONFIG; delete global.FACADE; delete global.SERVICE;
});
