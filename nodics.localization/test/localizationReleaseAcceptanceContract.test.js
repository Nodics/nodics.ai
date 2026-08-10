/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const acceptance = JSON.parse(fs.readFileSync(path.join(root, 'qualification/release-acceptance.json'), 'utf8'));
const requiredAutomated = [
    'localizationCompositionContract', 'localizationCustomizationContract', 'localizationAdopterContributionContract',
    'localizationRegistryReleaseContract', 'localizationOperationsContract', 'localizationRuntimeBundleContract',
    'localizationManagementApiContract', 'localizationQualificationContract', 'AxisLocalizationContext',
    'LocalizationOperationsRoutePage'
];
assert.equal(acceptance.contractVersion, 1);
assert.equal(acceptance.capability, 'nodics.localization');
assert.deepEqual(acceptance.automatedEvidence, requiredAutomated);
assert.equal(acceptance.decision, 'CONDITIONALLY_READY', 'repository evidence must not impersonate production approval');
assert(acceptance.externalAcceptance.filter(item => item.status === 'REQUIRED').length >= 7);
assert(acceptance.externalAcceptance.every(item => item.id && item.owner && item.status && item.evidence));
assert.match(acceptance.rule, /forbidden/i);
console.log('localizationReleaseAcceptanceContract.test.js passed');
