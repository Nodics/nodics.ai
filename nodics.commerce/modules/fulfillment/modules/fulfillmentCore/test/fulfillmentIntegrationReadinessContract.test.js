/*
 *  Copyright (c) 2026 Nodics All rights reserved.
 *
 *  This source code is licensed under the license found in the
 *  LICENSE file in the root directory of this source tree.
 */

'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const readiness = require('../src/service/defaultFulfillmentIntegrationReadinessService');

test('Fulfillment integration readiness requires carrier warehouse and disposition controls', () => {
    const contract = readiness.contract();
    assert.equal(contract.ownerModule, 'fulfillmentCore');
    assert.equal(contract.secretPolicy, 'RUNTIME_CONFIGURATION_ONLY');
    assert(contract.returnMethods.includes('PICKUP'));
    assert(contract.carrierEvents.includes('LABEL_CREATED'));
    assert(contract.warehouseEvents.includes('DISPOSITION_RECORDED'));
    assert(contract.disposition.allowedValues.includes('REJECT_RETURN'));
    assert(contract.customerSafety.neverExpose.includes('warehouseBin'));
    assert(!contract.customerSafety.exposeOnly.includes('supplierCost'));
});

test('Fulfillment integration readiness rejects carrier declarations without secured webhook and idempotency controls', () => {
    assert.deepEqual(readiness.validateAdapter({
        providerCode: 'carrier',
        supportedReturnMethods: ['PICKUP', 'DROP_OFF', 'STORE_RETURN'],
        supportedEvents: ['LABEL_CREATED', 'DELIVERED'],
        webhookSignatureValidation: true,
        idempotencyRequired: true,
        secretSource: 'RUNTIME_CONFIGURATION'
    }), { ready: true, missing: [] });
    assert.deepEqual(readiness.validateAdapter({
        providerCode: 'unsafe',
        supportedReturnMethods: ['PICKUP'],
        supportedEvents: ['LABEL_CREATED'],
        secretSource: 'SOURCE_CODE'
    }), {
        ready: false,
        missing: ['supportedReturnMethods.DROP_OFF', 'supportedEvents.DELIVERED', 'webhookSignatureValidation', 'idempotencyRequired', 'secretSource']
    });
});
