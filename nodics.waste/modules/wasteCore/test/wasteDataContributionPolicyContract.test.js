/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module wasteCore/test/wasteDataContributionPolicyContract @description Verifies accelerator and partner Waste data contribution boundaries. @layer test @owner wasteCore */
const assert = require('assert');
const policy = require('../src/service/defaultWasteDataContributionPolicyService');

const validHeader = {
    wasteMaterial: {
        partnerCategoryData: {
            options: { enabled: true, schemaName: 'wasteCategory', operation: 'saveAll', dataFilePrefix: 'partnerCategoryData' },
            query: { code: '$code' }
        }
    },
    wasteCollection: {
        partnerCollectionPresetData: {
            options: { enabled: true, schemaName: 'wasteCollectionPreset', operation: 'saveAll', dataFilePrefix: 'partnerCollectionPresetData' },
            query: { code: '$code' }
        }
    }
};

assert(policy.allowedSchemaNames.includes('wasteFamily'));
assert(policy.allowedSchemaNames.includes('wasteCategory'));
assert(policy.allowedSchemaNames.includes('wasteMaterialType'));
assert(policy.allowedSchemaNames.includes('wasteEvidencePolicy'));
assert(policy.allowedSchemaNames.includes('wasteCollectionPreset'));
assert(policy.allowedSchemaNames.includes('wasteImpactMetric'));
assert(policy.allowedSchemaNames.includes('wasteImpactProfile'));
assert(policy.allowedSchemaNames.includes('wasteAssetMarketplaceProjection'));
assert(policy.layerPrecedence.indexOf('SCENARIO_ACCELERATOR') < policy.layerPrecedence.indexOf('PROJECT'));

assert.strictEqual(policy.validateHeader(validHeader).length, 2);
assert.strictEqual(policy.validateManifestSection({
    kind: 'DATA_RELEASE',
    destinationRole: 'WASTE',
    dataType: 'project'
}).destinationRole, 'WASTE');
assert.strictEqual(policy.validateRecord({
    code: 'PARTNER_EWASTE_DROP_OFF',
    collectionPointType: 'E_WASTE_DROP_OFF',
    acceptanceRuleCodes: ['EWASTE_DROP_OFF_MOBILE_DEVICE']
}, 'PROJECT').code, 'PARTNER_EWASTE_DROP_OFF');
assert.strictEqual(policy.resolveByCode([
    { moduleName: 'eWaste', layerKind: 'SCENARIO_ACCELERATOR', records: [{ code: 'EWASTE_DROP_OFF_STANDARD', name: { en: 'Base' } }] },
    { moduleName: 'partnerWaste', layerKind: 'PROJECT', records: [{ code: 'EWASTE_DROP_OFF_STANDARD', name: { en: 'Partner' } }] }
]).EWASTE_DROP_OFF_STANDARD.name.en, 'Partner');

assert.throws(function () {
    policy.validateHeader({
        rewards: {
            partnerRewardData: {
                options: { enabled: true, schemaName: 'loyaltyProgram', operation: 'saveAll', dataFilePrefix: 'partnerRewardData' },
                query: { code: '$code' }
            }
        }
    });
}, function (error) {
    return error.code === 'ERR_WASTE_DATA_CONTRIBUTION_SCHEMA';
});

assert.throws(function () {
    policy.validateHeader({
        wasteMaterial: {
            tenantCategoryData: {
                options: { enabled: true, schemaName: 'wasteCategory', operation: 'saveAll', dataFilePrefix: 'tenantCategoryData' },
                query: { tenant: '$tenant', code: '$code' }
            }
        }
    });
}, function (error) {
    return error.code === 'ERR_WASTE_DATA_CONTRIBUTION_SCOPE';
});

assert.throws(function () {
    policy.validateRecord({
        code: 'PARTNER_REWARD_POLICY',
        rewardFormula: { points: 10 }
    }, 'PROJECT');
}, function (error) {
    return error.code === 'ERR_WASTE_DATA_RECORD_FIELD';
});

// Generic policy failures stay with the owner; customers supply real contributions.
for (const [changes, code] of [
    [{ kind: 'SOURCE_CONTRIBUTION' }, 'ERR_WASTE_DATA_MANIFEST_KIND'],
    [{ destinationRole: 'LOYALTY' }, 'ERR_WASTE_DATA_MANIFEST_DESTINATION'],
    [{ dataType: 'unknown' }, 'ERR_WASTE_DATA_MANIFEST_TYPE']
]) {
    assert.throws(() => policy.validateManifestSection({
        kind: 'DATA_RELEASE', destinationRole: 'WASTE', dataType: 'core', ...changes
    }), error => error.code === code);
}
assert.throws(() => policy.validateHeader({}),
    error => error.code === 'ERR_WASTE_DATA_CONTRIBUTION_EMPTY');
for (const [changes, code] of [
    [{ enabled: false }, 'ERR_WASTE_DATA_CONTRIBUTION_DISABLED'],
    [{ operation: 'deleteAll' }, 'ERR_WASTE_DATA_CONTRIBUTION_OPERATION']
]) {
    const header = structuredClone(validHeader);
    Object.assign(header.wasteMaterial.partnerCategoryData.options, changes);
    assert.throws(() => policy.validateHeader(header), error => error.code === code);
}
const invalidQuery = structuredClone(validHeader);
invalidQuery.wasteMaterial.partnerCategoryData.query = { code: '$name' };
assert.throws(() => policy.validateHeader(invalidQuery),
    error => error.code === 'ERR_WASTE_DATA_CONTRIBUTION_QUERY');
assert.throws(() => policy.validateRecord({}, 'PROJECT'),
    error => error.code === 'ERR_WASTE_DATA_RECORD_CODE');
assert.throws(() => policy.validateRecord({ code: 'partner' }, 'UNKNOWN'),
    error => error.code === 'ERR_WASTE_DATA_LAYER_KIND');
for (const field of ['tenant', 'tenantCode', 'enterpriseCode', 'rewardEligibility',
    'rewardFormula', 'couponCode', 'mapProvider', 'mapboxToken', 'vendorCode',
    'vendorRef', 'recyclerAdapter', 'logisticsAdapter']) {
    assert.throws(() => policy.validateRecord({ code: 'partner', [field]: 'foreign' }, 'PROJECT'),
        error => error.code === 'ERR_WASTE_DATA_RECORD_FIELD', field);
}
// Input order cannot invert project-over-accelerator precedence or erase provenance.
const override = policy.resolveByCode([
    { moduleName: 'partner', layerKind: 'PROJECT', records: [{ code: 'shared', name: 'Partner' }] },
    { moduleName: 'domain', layerKind: 'SCENARIO_ACCELERATOR', records: [{ code: 'shared', name: 'Domain' }] }
]).shared;
assert.strictEqual(override.name, 'Partner');
assert.strictEqual(override._contributionModule, 'partner');
assert.strictEqual(override._contributionLayer, 'PROJECT');

console.log('Waste data contribution policy contract validated');
