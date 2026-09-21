/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('assert');
const schemas = require('../src/schemas/schemas').wasteReward;
const assessment = schemas.wasteRewardAssessment;

assert(assessment, 'wasteRewardAssessment must be modeled by Waste');
assert.deepStrictEqual(assessment.backoffice, { mutationMode: 'READ_ONLY', operations: ['search', 'read'] });
assert.strictEqual(assessment.definition.assessmentType.required, true);
assert.deepStrictEqual(assessment.definition.assessmentType.enum, ['ESTIMATED','CONFIRMED','RECALCULATED']);
assert(assessment.definition.policyVersion, 'assessment must bind the exact Rules policy version');
assert(assessment.definition.bandSetVersion, 'assessment must bind the exact score-band version');
assert(assessment.definition.propertyCatalogueVersion, 'assessment must bind the consumer property-catalogue version');
assert(assessment.definition.calculationBreakdown, 'assessment must retain explainable calculation evidence');
assert(assessment.definition.inputSnapshot, 'assessment must retain the normalized input snapshot');
assert.strictEqual(assessment.definition.tenant, undefined, 'runtime tenant must not be stored as ordinary assessment data');
assert.strictEqual(assessment.definition.enterpriseCode, undefined, 'business scope belongs to policy/input references, not generic data ownership');
assert.strictEqual(assessment.definition.walletBalance, undefined, 'Waste reward assessment must not own Loyalty balances');

console.log('Waste reward assessment contract validated');
