/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module eWaste/test/eWasteReferenceCompatibility @description Qualifies neutral forward reference candidates without importing or rewriting installed data. @owner eWaste @layer test */
const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const successor = {
    profiles: Object.values(require('../data/core-v002/records/waste/eWasteImpactProfileData')),
    categories: Object.values(require('../data/core-v002/records/waste/eWasteCategoryData')),
    itemTypes: Object.values(require('../data/core-v002/records/waste/eWasteItemTypeData'))
};
const policy = require('../../../../../../nodics.waste/modules/wasteCore/src/service/defaultWasteDataContributionPolicyService');
const dataRoot = path.resolve(__dirname, '../data');
const records = name => Object.values(require(path.join(dataRoot, 'core-v001/records/waste', name)));

test('retained eWaste reference bytes still match the published manifest', () => {
    const section = require('../data/manifest.json').retainedRoots['core-v001'].sections['core-reference'];
    for (const [file, hash] of Object.entries(section.files)) {
        assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(dataRoot, file))).digest('hex'), hash, file);
    }
    assert.equal(records('eWasteImpactProfileData').find(record => record.code === 'CIRCA_EWASTE_ESTIMATE').name.en,
        'Circa e-waste environmental estimate');
});

test('neutral successor is application-independent and keeps advisory semantics', () => {
    assert.doesNotMatch(JSON.stringify(successor), /CIRCA|Circa|sample/);
    assert.equal(successor.categories.length, 10);
    assert.equal(successor.itemTypes.length, 14);
    assert.equal(successor.profiles.length, 4);
    const neutral = successor.profiles.find(record => record.code === 'EWASTE_ENVIRONMENTAL_ESTIMATE');
    assert.equal(neutral.formulaType, 'EXTERNAL_PROVIDER');
    assert.deepEqual(neutral.metadata, { publicClaimAllowed: false, assessmentUse: 'ADVISORY_SUBMISSION_GATE' });
    Object.values(successor).flat().forEach(record => policy.validateRecord(record, 'SCENARIO_ACCELERATOR'));
});

test('only the twenty historical environmental-profile references change', () => {
    let changed = 0;
    for (const [key, file] of [['categories', 'eWasteCategoryData'], ['itemTypes', 'eWasteItemTypeData']]) {
        for (const old of records(file)) {
            const next = successor[key].find(record => record.code === old.code);
            const expected = structuredClone(old);
            if (old.impactProfileCode === 'CIRCA_EWASTE_ESTIMATE') {
                expected.impactProfileCode = 'EWASTE_ENVIRONMENTAL_ESTIMATE';
                changed++;
            }
            assert.deepEqual(next, expected);
        }
    }
    assert.equal(changed, 20);
    for (const old of records('eWasteImpactProfileData').filter(record => record.code !== 'CIRCA_EWASTE_ESTIMATE')) {
        assert.deepEqual(successor.profiles.find(record => record.code === old.code), old);
    }
});

test('independent successor has closed profile and taxonomy references; missing profile fails qualification', () => {
    const profileCodes = new Set(successor.profiles.map(record => record.code));
    const categoryCodes = new Set(successor.categories.map(record => record.code));
    const itemCodes = new Set(successor.itemTypes.map(record => record.code));
    for (const record of [...successor.categories, ...successor.itemTypes]) assert(profileCodes.has(record.impactProfileCode));
    for (const record of successor.categories) record.itemTypeCodes.forEach(code => assert(itemCodes.has(code)));
    for (const record of successor.itemTypes) assert(categoryCodes.has(record.categoryCode));
    profileCodes.delete('EWASTE_ENVIRONMENTAL_ESTIMATE');
    assert.throws(() => successor.itemTypes.forEach(record => assert(profileCodes.has(record.impactProfileCode))), assert.AssertionError);
});

test('later independent customer overrides use the existing resolver and do not mutate defaults', () => {
    const before = structuredClone(successor);
    const custom = { ...successor.categories[0], name: { en: 'Partner mobile devices' }, revision: 2 };
    const effective = policy.resolveByCode([
        { moduleName: 'independentCustomer', layerKind: 'PROJECT', records: [custom] },
        { moduleName: 'eWaste', layerKind: 'SCENARIO_ACCELERATOR', records: successor.categories }
    ]);
    assert.equal(effective[custom.code].name.en, 'Partner mobile devices');
    assert.equal(effective[custom.code]._contributionModule, 'independentCustomer');
    assert.equal(effective[custom.code].impactProfileCode, 'EWASTE_ENVIRONMENTAL_ESTIMATE');
    assert.deepEqual(successor, before);
});
