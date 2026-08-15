/*
 *  Copyright (c) 2026 Nodics All rights reserved.
 *
 *  This source code is licensed under the license found in the
 *  LICENSE file in the root directory of this source tree.
 */

'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const readiness = require('../src/service/defaultOrderLifecycleOperationalReadinessService');

test('Order lifecycle operational readiness covers audit security SLA observability and release gates', () => {
    const contract = readiness.contract();
    assert.equal(contract.ownerModule, 'order');
    assert.deepEqual(contract.lifecycleTypes, ['CANCELLATION', 'RETURN', 'REFUND', 'EXCHANGE', 'REPLACEMENT', 'APPEAL']);
    assert(contract.automationPlan.ownerSteps.includes('replacement-reservation'));
    assert(contract.automationPlan.ownerSteps.includes('appeal-sla-review'));
    assert(contract.automationPlan.customerSafeFields.includes('customerVisibleState'));
    assert(contract.audit.requiredFields.includes('beforeStatus'));
    assert.equal(contract.audit.downstreamEvidenceRequired, true);
    assert.equal(contract.security.customerOwnsOnly, true);
    assert(contract.security.forbiddenCustomerFields.includes('providerSecret'));
    assert.equal(contract.sla.refundReconciliationHours, 72);
    assert(contract.observability.metrics.includes('refund.reconciliation_required'));
    assert(contract.releaseGates.includes('liveQualification'));
});

test('Order lifecycle release readiness reports missing qualification gates', () => {
    assert.deepEqual(readiness.releaseGateResult({
        customerOwnership: true,
        operatorActionMetadata: true,
        paymentRefundExecution: true,
        fulfillmentReturnExecution: true,
        ciCommerceSuite: true,
        liveQualification: true
    }), { ready: true, missing: [] });
    assert.deepEqual(readiness.releaseGateResult({ customerOwnership: true }), {
        ready: false,
        missing: ['operatorActionMetadata', 'paymentRefundExecution', 'fulfillmentReturnExecution', 'ciCommerceSuite', 'liveQualification']
    });
});
