/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module wasteImpact/test/wasteImpactCalculationContract @description Verifies profile-driven Waste impact calculation result shape. @layer test @owner wasteImpact */
const assert = require('assert');
const impact = require('../src/service/defaultWasteImpactCalculationService');

let result = impact.calculate({
    resultCode: 'impact-001',
    sourceRef: { module: 'wasteReceipt', schema: 'wasteReceipt', code: 'receipt-001' },
    profile: {
        code: 'impact-profile-001',
        formulaType: 'WEIGHT_FACTOR',
        revision: 4,
        metricRules: [
            { metricCode: 'DIVERTED_FROM_LANDFILL_KG', factor: 1, unitOfMeasure: 'KG' },
            { metricCode: 'ESTIMATED_CO2E_SAVED_KG', factor: 1.5, unitOfMeasure: 'KG' }
        ]
    },
    facts: { receivedWeight: '10' },
    calculationStatus: 'CONFIRMED',
    idempotencyKey: 'impact-001',
    correlationId: 'corr-impact-001',
    now: new Date('2026-09-01T11:00:00.000Z')
});

assert.strictEqual(result.profileCode, 'impact-profile-001');
assert.strictEqual(result.calculationStatus, 'CONFIRMED');
assert.strictEqual(result.formulaVersion, '4');
assert.deepStrictEqual(result.sourceRef, { module: 'wasteReceipt', schema: 'wasteReceipt', code: 'receipt-001' });
assert.deepStrictEqual(result.metrics.map(function (metric) { return metric.value; }), ['10', '15']);
assert.throws(function () { impact.calculate({ profile: { code: 'custom', formulaType: 'CUSTOM_POLICY' }, sourceRef: { module: 'x', schema: 'y', code: 'z' }, facts: {} }); }, /requires partner\/provider implementation/);
assert.throws(function () { impact.calculate({ profile: { code: 'missing', formulaType: 'STATIC_FACTOR' }, sourceRef: { module: 'x' } }); }, /source reference requires module, schema, and code/);

console.log('Waste impact calculation contract validated');
