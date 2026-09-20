/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('assert');
const registry = require('../../rulesCore/src/service/defaultRulePropertyCatalogueRegistryService');
const evaluator = require('../src/service/defaultRuleEvaluationService');

registry.reset();
registry.registerProvider('sample', {
    getCatalogue: () => ({ code: 'sample', version: 1 }),
    resolveProperty: request => {
        const row = request.context[request.propertyCode];
        return row || { available: false, quality: 'UNAVAILABLE' };
    },
    resolveFallback: request => {
        const row = request.context.fallback && request.context.fallback[request.propertyCode];
        return row || { available: false, quality: 'UNAVAILABLE' };
    }
});

const base = {
    code: 'TEST',
    version: 1,
    minimumScore: 0,
    maximumScore: 100,
    groups: [
        {
            code: 'BASE',
            operator: 'ALL',
            conditions: [
                { code: 'C1', propertyCode: 'domain', operatorCode: 'EQUALS', value: 'ELECTRONICS', missingValueBehavior: 'REQUIRED' },
                { code: 'C2', propertyCode: 'brand', operatorCode: 'IN', value: ['APPLE','SAMSUNG'], missingValueBehavior: 'OPTIONAL' }
            ],
            outcome: { outcomeType: 'ADD_SCORE', parameters: { score: 40 } }
        },
        {
            code: 'CARBON',
            operator: 'ALL',
            conditions: [
                { code: 'C3', propertyCode: 'carbon', operatorCode: 'GREATER_THAN_OR_EQUAL', value: 10, missingValueBehavior: 'FALLBACK_ALLOWED', minimumInputQuality: 'AI_INFERRED' }
            ],
            outcome: { outcomeType: 'ADD_SCORE', parameters: { score: 30 } }
        },
        {
            code: 'RECOVERY',
            operator: 'ALL',
            conditions: [],
            childGroups: [
                {
                    code: 'RECOVERY_ANY',
                    operator: 'ANY',
                    conditions: [
                        { code: 'C4', propertyCode: 'recovery', operatorCode: 'EQUALS', value: 'HIGH', missingValueBehavior: 'REQUIRED' },
                        { code: 'C5', propertyCode: 'reuse', operatorCode: 'EQUALS', value: 'HIGH', missingValueBehavior: 'REQUIRED' }
                    ]
                }
            ],
            outcome: { outcomeType: 'ADD_SCORE', parameters: { score: 20 } }
        },
        {
            code: 'HAZARD',
            operator: 'ANY',
            conditions: [
                { code: 'C6', propertyCode: 'hazards', operatorCode: 'CONTAINS', value: 'SWOLLEN_BATTERY', missingValueBehavior: 'OPTIONAL' }
            ],
            outcome: { outcomeType: 'ADD_SCORE', parameters: { score: -10 } }
        }
    ],
    scoreBands: [
        { code: 'LOW', minScore: 0, maxScore: 39, outcome: { rewardTypeCode: 'POINTS', amount: 20 } },
        { code: 'MID', minScore: 40, maxScore: 79, outcome: { rewardTypeCode: 'POINTS', amount: 200 } },
        { code: 'HIGH', minScore: 80, maxScore: null, outcome: { rewardTypeCode: 'POINTS', amount: 500 } }
    ]
};

const input = {
    domain: { available: true, value: 'ELECTRONICS', quality: 'CUSTOMER_CONFIRMED', confidence: 1 },
    recovery: { available: true, value: 'HIGH', quality: 'AI_OBSERVED', confidence: 0.9 },
    reuse: { available: true, value: 'LOW', quality: 'AI_OBSERVED', confidence: 0.9 },
    hazards: { available: true, value: ['SWOLLEN_BATTERY'], quality: 'AI_OBSERVED', confidence: 0.9 },
    fallback: {
        carbon: { available: true, value: 14.6, quality: 'AI_INFERRED', confidence: 0.8 }
    }
};

const result = evaluator.evaluate({
    ruleSet: base,
    propertyProviderCode: 'sample',
    propertyCatalogueCode: 'sample',
    propertyCatalogueVersion: 1,
    input: input,
    correlationId: 'corr-001'
});

assert.strictEqual(result.calculatedScore, 80);
assert.strictEqual(result.finalScore, 80);
assert.strictEqual(result.scoreBandCode, 'HIGH');
assert.deepStrictEqual(result.matchedRules, ['BASE','CARBON','RECOVERY','HAZARD']);
assert.strictEqual(result.groupResults[0].conditionResults[1].result, 'IGNORED');
assert.strictEqual(result.groupResults[1].conditionResults[0].fallbackUsed, true);
assert.strictEqual(evaluator.evaluate({
    ruleSet: Object.assign({}, base, { maximumScore: 60 }),
    propertyProviderCode: 'sample',
    propertyCatalogueCode: 'sample',
    propertyCatalogueVersion: 1,
    input: input
}).finalScore, 60);

console.log('Rules Evaluation recursive, fallback, quality and scoring contracts validated');
