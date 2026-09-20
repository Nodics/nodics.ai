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
const validator = require('../src/service/defaultRuleDefinitionValidationService');

global.CONFIG = { get: () => ({ limits: { maximumRuleGroupsPerSet: 20, maximumConditionsPerGroup: 10, maximumGroupDepth: 4 } }) };

registry.reset();
registry.registerProvider('sample', {
    getCatalogue: () => ({
        code: 'sample',
        properties: [
            { code: 'category', dataType: 'STRING', allowedOperators: ['EQUALS','IN'], supportsFallback: false },
            { code: 'weight', dataType: 'NUMBER', allowedOperators: ['GREATER_THAN_OR_EQUAL','BETWEEN'], supportsFallback: true }
        ]
    }),
    resolveProperty: () => ({ available: false })
});

let valid = validator.validateDefinition({
    propertyProviderCode: 'sample',
    definition: {
        groups: [{
            code: 'G1',
            operator: 'ALL',
            conditions: [
                { code: 'C1', propertyCode: 'category', operatorCode: 'EQUALS', value: 'PHONE', missingValueBehavior: 'REQUIRED' },
                { code: 'C2', propertyCode: 'weight', operatorCode: 'GREATER_THAN_OR_EQUAL', value: 1, missingValueBehavior: 'FALLBACK_ALLOWED', minimumConfidence: 0.8 }
            ],
            outcome: { outcomeType: 'ADD_SCORE', parameters: { score: 25 } }
        }]
    }
});
assert.strictEqual(valid.valid, true);

let badOperator = validator.validateDefinition({
    propertyProviderCode: 'sample',
    definition: {
        groups: [{
            code: 'G1',
            operator: 'ALL',
            conditions: [
                { code: 'C1', propertyCode: 'category', operatorCode: 'GREATER_THAN', value: 1, missingValueBehavior: 'REQUIRED' }
            ],
            outcome: { outcomeType: 'ADD_SCORE', parameters: { score: 5 } }
        }]
    }
});
assert(badOperator.issues.some(issue => ['OPERATOR_TYPE_INVALID','OPERATOR_NOT_ALLOWED_FOR_PROPERTY'].includes(issue.code)));

let bands = validator.validateBands([
    { code: 'A', minScore: 0, maxScore: 49, outcome: { amount: 10 } },
    { code: 'B', minScore: 50, maxScore: null, outcome: { amount: 20 } }
], 'REJECT');
assert.strictEqual(bands.valid, true);

let overlap = validator.validateBands([
    { code: 'A', minScore: 0, maxScore: 50, outcome: { amount: 10 } },
    { code: 'B', minScore: 50, maxScore: null, outcome: { amount: 20 } }
], 'REJECT');
assert(overlap.issues.some(issue => issue.code === 'BAND_OVERLAP'));

delete global.CONFIG;
console.log('Rules definition validation contracts validated');
