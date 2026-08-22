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
 * @module order/test/orderCustomerApiContract
 * @description Verifies customer Order read APIs stay Order-owned and customer-scoped.
 * @layer test
 * @owner order
 */

const routers = require('../src/router/routers');
const controller = require('../src/controller/defaultOrderCustomerController');
const facade = require('../src/facade/defaultOrderCustomerFacade');
const service = require('../src/service/defaultOrderOperationService');

let calls;

function installGlobals() {
    calls = [];
    delete global.CLASSES;
    global.FACADE = { DefaultOrderCustomerFacade: facade };
    global.SERVICE = {
        DefaultOrderOperationService: service,
        DefaultCommerceOrderService: {
            get: async request => {
                calls.push({ service: 'order', request });
                return { result: [
                    { code: 'order-1', tenant: request.tenant, ownerId: 'customer-1', cartCode: 'cart-1', status: 'PLACED', revision: 0, currency: 'USD', totalAmount: '141.00', correlationId: 'corr-1' },
                    { code: 'order-2', tenant: request.tenant, ownerId: 'customer-2', cartCode: 'cart-2', status: 'PLACED', revision: 0, currency: 'USD', totalAmount: '50.00', correlationId: 'corr-2' }
                ].filter(item => item.ownerId === request.query.ownerId && (!request.query.code || item.code === request.query.code)) };
            }
        },
        DefaultCommerceOrderEntryService: {
            get: async request => {
                calls.push({ service: 'entry', request });
                return { result: [{ code: 'order-1:entry-1', tenant: request.tenant, ownerId: request.query.ownerId, orderCode: request.query.orderCode, productCode: 'agoraLinenWrapDress', quantity: '1', status: 'PLACED' }] };
            }
        },
        DefaultOrderLifecycleRequestService: {
            get: async request => {
                calls.push({ service: 'lifecycle', request });
                return { result: [{ code: 'order-1:CANCELLATION', tenant: request.tenant, ownerId: request.query.ownerId, orderCode: request.query.orderCode, requestType: 'CANCELLATION', status: 'SUBMITTED' }] };
            }
        }
    };
}

test.beforeEach(installGlobals);

test('Order customer routes expose customer-owned order read without catalog lifecycle leakage', () => {
    assert.equal(routers.order.customer.read.key, '/customer/orders/:orderCode');
    assert.equal(routers.order.customer.read.controller, 'DefaultOrderCustomerController');
    assert.equal(routers.order.customer.read.permission, 'commerce.order.own.read');
    assert.equal(routers.order.customer.listOwnOrders.key, '/customer/orders');
    assert(!routers.order.customer.read.key.includes('/catalog'));
});

test('Order customer API returns order detail with entries and lifecycle for authenticated owner', async () => {
    const response = await controller.read({ authData: { tenant: 'default', principalId: 'customer-1' }, httpRequest: { params: { orderCode: 'order-1' } } });
    assert.equal(response.data.order.code, 'order-1');
    assert.equal(response.data.entries[0].productCode, 'agoraLinenWrapDress');
    assert.equal(response.data.lifecycle[0].requestType, 'CANCELLATION');
    assert(calls.every(call => call.request.query.ownerId === 'customer-1'));
    assert(calls.every(call => call.request.authData.groups.includes('serviceAccountUserGroup')));
    assert(calls.every(call => call.request.authData.userGroups.includes('serviceAccountUserGroup')));
});

test('Order customer API rejects missing authenticated owner and non-owned orders', async () => {
    await assert.rejects(() => controller.read({ httpRequest: { params: { orderCode: 'order-1' } } }), /Authenticated tenant and customer/);
    await assert.rejects(() => controller.read({ authData: { tenant: 'default', principalId: 'customer-1' }, httpRequest: { params: { orderCode: 'order-2' } } }), /Customer Order not found/);
});

test('Order customer API maps non-owned order reads to access denied when Nodics errors are available', async () => {
    global.CLASSES = {
        NodicsError: class NodicsError extends Error {
            constructor(code, message) {
                super(message);
                this.code = code;
            }
        }
    };

    await assert.rejects(
        () => controller.read({ authData: { tenant: 'default', principalId: 'customer-1' }, httpRequest: { params: { orderCode: 'order-2' } } }),
        error => error.code === 'ERR_AUTH_00003'
    );
});
