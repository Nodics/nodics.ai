/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const verify = require('../../nodics.foundation/modules/nTooling/test/helpers/generatedRuntime.cjs');

test('Waste schemas materialize governed services including service-only reward assessments', () => {
    const schemas = {};
    const requiredSchemas = {
        wasteCore: ['wasteLifecyclePolicy'],
        wasteMaterial: ['wasteFamily', 'wasteCategory', 'wasteItemType', 'wasteMaterialType', 'wasteConditionGrade', 'wasteEvidencePolicy'],
        wasteCollection: ['wasteCollectionPointType', 'wasteCollectionPoint', 'wasteCollectionAcceptanceRule', 'wasteCollectionPreset', 'wasteReceiptPolicy'],
        wasteSubmission: ['wasteSubmission', 'wasteEvidence', 'wasteMetadataSuggestion'],
        wasteVerification: ['wasteVerificationPolicy', 'wasteVerification'], wasteReceipt: ['wasteReceipt'],
        wasteImpact: ['wasteImpactMetric', 'wasteImpactProfile', 'wasteImpactResult'],
        wasteReward: ['wasteRewardAssessment'], wasteMovement: ['wasteBatch', 'wasteMovement'],
        wasteCompliance: ['wasteComplianceProfile', 'wasteComplianceEvidence'],
    };
    for (const moduleName of ['wasteCore', 'wasteMaterial', 'wasteCollection', 'wasteSubmission',
        'wasteVerification', 'wasteReceipt', 'wasteImpact', 'wasteReward', 'wasteMovement', 'wasteCompliance']) {
        const source = require('../modules/' + moduleName + '/src/schemas/schemas')[moduleName];
        for (const name of requiredSchemas[moduleName]) assert(source[name], moduleName + '.' + name);
        schemas[moduleName] = Object.fromEntries(Object.keys(source).map(name => [name, name !== 'wasteRewardAssessment']));
    }
    verify({ moduleRoots: ['nodics.waste'], activeModules: ['nodics.waste'], role: 'WASTE', schemas,
        entities: { SERVICE: ['DefaultWasteDataContributionPolicyService', 'DefaultWasteAcceptancePolicyService',
            'DefaultWasteSubmissionLifecycleService', 'DefaultWasteImpactCalculationService', 'DefaultWasteBackofficeCapabilityService'],
        FACADE: ['DefaultWasteInternalFacade'], CONTROLLER: ['DefaultWasteInternalController'] },
    });
});
