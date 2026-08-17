/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
const assert = require('node:assert/strict'); const test = require('node:test'); const policy = require('../src/service/defaultMultiDomainCommercePolicyService');
const context = { tenant: 'default', correlationId: 'corr-1', idempotencyKey: 'checkout-1' };
test('Apparel and Electronics share one physical order partition', () => { const result = policy.compose({ ...context, entries: [{ domain: 'apparel', productCode: 'dress' }, { domain: 'electronics', productCode: 'phone' }] }); assert.equal(result.accepted, true); assert.deepEqual(result.partitions, [{ type: 'PHYSICAL_ORDER', entries: ['dress', 'phone'] }]); });
test('compatible device and Telco plan split physical fulfillment from activation', () => { const result = policy.compose({ ...context, entries: [{ domain: 'electronics', productCode: 'phone' }, { domain: 'telco', productCode: 'plan', deviceProductCode: 'phone', recurringCharge: { currency: 'AED', minorUnits: 25000, cycle: 'MONTH', intervalCount: 1 } }] }); assert.equal(result.accepted, true); assert.equal(result.policy, 'SPLIT_COMPATIBLE_BUNDLE'); assert.deepEqual(result.partitions.map(item => item.type), ['PHYSICAL_ORDER', 'TELCO_SERVICE_ORDER']); });
test('incompatible Telco bundles and imprecise recurring charges fail closed', () => { assert.equal(policy.compose({ ...context, entries: [{ domain: 'telco', productCode: 'plan', deviceProductCode: 'missing', recurringCharge: { currency: 'AED', minorUnits: 25000, cycle: 'MONTH', intervalCount: 1 } }] }).reasonCode, 'TELCO_COMPATIBLE_DEVICE_REQUIRED'); assert.equal(policy.compose({ ...context, entries: [{ domain: 'telco', productCode: 'plan', recurringCharge: { currency: 'AED', minorUnits: 25.5, cycle: 'MONTH', intervalCount: 1 } }] }).reasonCode, 'TELCO_RECURRING_CHARGE_INVALID'); });
test('tenant correlation and idempotency context are mandatory', () => { assert.throws(() => policy.compose({ entries: [] }), /MULTI_DOMAIN_CONTEXT_REQUIRED/); });
