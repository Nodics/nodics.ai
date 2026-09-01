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

console.log('Waste data contribution policy contract validated');
