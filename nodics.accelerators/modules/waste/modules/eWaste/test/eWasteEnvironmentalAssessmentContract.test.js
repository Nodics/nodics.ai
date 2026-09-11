/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module eWaste/test/eWasteEnvironmentalAssessmentContract @description Verifies eWaste contributes environmental display mappings over generic impact calculations without supplying coefficients or issued credits. @layer test @owner eWaste */
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '../../../../../..');
const impact = require(path.join(root, 'nodics.waste/modules/wasteImpact/src/service/defaultWasteImpactCalculationService'));
const mock = require(path.join(root, 'nodics.waste/modules/wasteImpact/src/service/defaultWasteImpactMockProviderService'));
const defaults = require(path.join(root, 'nodics.waste/modules/wasteImpact/config/properties'));
const contribution = require('../config/properties');
const _ = require('lodash');
const effective = _.merge({}, defaults.wasteImpact, contribution.wasteImpact);
global.CONFIG = { get: () => effective };
global.SERVICE = { DefaultWasteImpactMockProviderService: mock };
(async () => {
  assert.equal(defaults.wasteImpact.calculation.environmentalAssessment.enabled, false);
  assert.equal(contribution.wasteImpact.calculation.mock, undefined);
  const result = await impact.calculate({ sourceRef: { module: 'wasteSubmission', schema: 'wasteSubmission', code: 'test' },
    profile: { code: 'test', formulaType: 'EXTERNAL_PROVIDER' }, facts: { weight: 2 } });
  const assessment = result.metadata.environmentalAssessment;
  assert.equal(assessment.indicators.length, 12);
  assert.equal(assessment.indicators.filter(item => item.value !== null).length, 1);
  assert.equal(assessment.indicators[0].status, 'ILLUSTRATIVE');
  assert.equal(assessment.carbonCredits.issuedQuantity, null);
  assert.equal(assessment.publicClaimAllowed, false);
  console.log('eWaste environmental mappings: 11 indicators, one illustrative value, no fabricated metrics or credits');
})().catch(error => { console.error(error); process.exitCode = 1; });
