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
const placement = require('../src/service/defaultOrderPlacementService');

test('Order placement passes authenticated context into idempotency checkpoint lookup', async () => {
    const authData = { tenant: 'default', userGroups: ['customerUserGroup'] };
    let lookup;
    const existing = { code: 'order-1', status: 'COMPLETED' };
    const request = {
        tenant: 'default',
        ownerId: 'customer-1',
        authData,
        idempotencyKey: 'order-1:place'
    };
    const result = await placement.place(request, {
        findPlacement: async receivedRequest => {
            lookup = receivedRequest;
            return existing;
        }
    });
    assert.equal(result, existing);
    assert.equal(lookup, request);
});
