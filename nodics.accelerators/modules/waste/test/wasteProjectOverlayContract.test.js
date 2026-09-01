/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module waste/test/wasteProjectOverlayContract @description Verifies partner projects can extend and override eWaste presets through later-loaded Waste data. @layer test @owner waste */
const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const contributionPolicy = require('../../../../nodics.waste/modules/wasteCore/src/service/defaultWasteDataContributionPolicyService');

const acceleratorRoot = path.resolve(__dirname, '..');
const eWasteRoot = path.join(acceleratorRoot, 'modules/eWaste');
const fixtureRoot = path.join(__dirname, 'fixtures/partnerOverlay');
const fixtureDataRoot = path.join(fixtureRoot, 'data');
const fixturePackage = require(path.join(fixtureRoot, 'package.json'));
const fixtureManifest = require(path.join(fixtureDataRoot, 'manifest.json'));
const fixtureHeader = require(path.join(fixtureDataRoot, 'project-v001/headers/waste/partnerWasteOverlayHeader'));
const eWasteCategories = Object.values(require(path.join(eWasteRoot, 'data/core-v001/records/waste/eWasteCategoryData')));
const eWastePresets = Object.values(require(path.join(eWasteRoot, 'data/core-v001/records/waste/eWasteCollectionPresetData')));
const partnerCategories = Object.values(require(path.join(fixtureDataRoot, 'project-v001/records/waste/partnerWasteCategoryData')));
const partnerPresets = Object.values(require(path.join(fixtureDataRoot, 'project-v001/records/waste/partnerWasteCollectionPresetData')));
const partnerRules = Object.values(require(path.join(fixtureDataRoot, 'project-v001/records/waste/partnerWasteAcceptanceRuleData')));
const partnerImpactProfiles = Object.values(require(path.join(fixtureDataRoot, 'project-v001/records/waste/partnerWasteImpactProfileData')));
const section = fixtureManifest.sections['project-reference'];

assert.strictEqual(fixturePackage.nodics.kind, 'capability');
assert.deepStrictEqual(fixturePackage.nodics.extends, ['eWaste']);
assert.strictEqual(fixturePackage.nodics.runtime.router, false);
assert(!fs.existsSync(path.join(fixtureRoot, 'src')), 'Project overlay fixture must not copy Waste or eWaste runtime source');

assert.strictEqual(fixtureManifest.contractVersion, 2);
assert.strictEqual(fixtureManifest.module, 'partnerWasteOverlay');
assert.strictEqual(section.dataType, 'project');
assert.strictEqual(section.sourceRoot, 'project-v001');
assert.strictEqual(contributionPolicy.validateManifestSection(section).destinationRole, 'WASTE');
assert.strictEqual(contributionPolicy.validateHeader(fixtureHeader).length, 4);

Object.keys(section.files).forEach(function (relativeFilePath) {
    let absoluteFilePath = path.join(fixtureDataRoot, relativeFilePath);
    let actualHash = crypto.createHash('sha256').update(fs.readFileSync(absoluteFilePath)).digest('hex');
    assert.strictEqual(actualHash, section.files[relativeFilePath], relativeFilePath + ' checksum must match manifest');
});

partnerCategories.concat(partnerPresets).concat(partnerRules).concat(partnerImpactProfiles).forEach(function (record) {
    contributionPolicy.validateRecord(record, 'PROJECT');
});

const effectiveCategories = contributionPolicy.resolveByCode([
    { moduleName: 'eWaste', layerKind: 'SCENARIO_ACCELERATOR', records: eWasteCategories },
    { moduleName: 'partnerWasteOverlay', layerKind: 'PROJECT', records: partnerCategories }
]);
const effectivePresets = contributionPolicy.resolveByCode([
    { moduleName: 'eWaste', layerKind: 'SCENARIO_ACCELERATOR', records: eWastePresets },
    { moduleName: 'partnerWasteOverlay', layerKind: 'PROJECT', records: partnerPresets }
]);

assert.strictEqual(effectiveCategories.MOBILE_DEVICE.name.en, 'Partner Mobile Device');
assert.strictEqual(effectiveCategories.MOBILE_DEVICE._contributionLayer, 'PROJECT');
assert.strictEqual(effectiveCategories.SMART_HOME_DEVICE.familyCode, 'ELECTRONICS');
assert.strictEqual(effectivePresets.EWASTE_DROP_OFF_STANDARD.name.en, 'Partner E-Waste Drop-Off');
assert(effectivePresets.EWASTE_DROP_OFF_STANDARD.acceptanceRuleCodes.includes('PARTNER_DROP_OFF_SMART_HOME'));
assert.strictEqual(effectivePresets.PARTNER_MALL_DROP_OFF.operatingMode, 'DROP_OFF');

assert.throws(function () {
    contributionPolicy.validateRecord({
        code: 'BAD_PARTNER_WASTE_REWARD',
        rewardFormula: { value: 10 }
    }, 'PROJECT');
}, function (error) {
    return error.code === 'ERR_WASTE_DATA_RECORD_FIELD';
});

console.log('Waste project overlay contract validated');
