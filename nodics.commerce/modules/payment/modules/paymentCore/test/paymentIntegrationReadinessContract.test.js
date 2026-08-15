/*
 *  Copyright (c) 2026 Nodics All rights reserved.
 *
 *  This source code is licensed under the license found in the
 *  LICENSE file in the root directory of this source tree.
 */

'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const readiness = require('../src/service/defaultPaymentIntegrationReadinessService');

test('Payment integration readiness requires webhook signatures idempotency and runtime secrets', () => {
    const contract = readiness.contract();
    assert.equal(contract.ownerModule, 'paymentCore');
    assert.equal(contract.secretPolicy, 'RUNTIME_CONFIGURATION_ONLY');
    assert.equal(contract.webhook.signatureValidationRequired, true);
    assert.equal(contract.webhook.replayProtectionRequired, true);
    assert(contract.webhook.requiredEvents.includes('REFUND_SUCCEEDED'));
    assert(contract.reconciliation.delayedStatuses.includes('REFUND_PENDING'));
    assert(contract.customerSafety.neverExpose.includes('rawCardNumber'));
    assert(!contract.customerSafety.exposeOnly.includes('providerSecret'));
});

test('Payment integration readiness rejects non-production provider declarations', () => {
    assert.deepEqual(readiness.validateAdapter({
        providerCode: 'stripe',
        supportedOperations: ['AUTHORIZE', 'CAPTURE', 'REFUND'],
        webhookSignatureValidation: true,
        idempotencyRequired: true,
        secretSource: 'RUNTIME_CONFIGURATION'
    }), { ready: true, missing: [] });
    assert.deepEqual(readiness.validateAdapter({
        providerCode: 'unsafe',
        supportedOperations: ['AUTHORIZE'],
        secretSource: 'SOURCE_CODE'
    }), {
        ready: false,
        missing: ['supportedOperations.REFUND', 'webhookSignatureValidation', 'idempotencyRequired', 'secretSource']
    });
});
