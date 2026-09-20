/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('assert');
const registry = require('../../../../../nodics.rulesEngine/modules/rulesCore/src/service/defaultRulePropertyCatalogueRegistryService');
const evaluator = require('../../../../../nodics.rulesEngine/modules/rulesEvaluation/src/service/defaultRuleEvaluationService');
const provider = require('../src/service/defaultEWasteRulePropertyCatalogueService');
const contextService = require('../src/service/defaultEWasteRewardContextService');
const assessmentService = require('../src/service/defaultEWasteRewardAssessmentOperationService');

registry.reset();
global.SERVICE = {
    DefaultRulePropertyCatalogueRegistryService: registry,
    DefaultEWasteRulePropertyCatalogueService: provider,
    DefaultEWasteRewardContextService: contextService,
    DefaultRuleEvaluationService: evaluator,
};
provider.init();

const catalogue = provider.getCatalogue();
assert.strictEqual(catalogue.code, 'EWASTE_REWARD_PROPERTIES');
assert(catalogue.properties.some(property => property.code === 'environment.carbonImpact'));
assert(catalogue.properties.some(property => property.code === 'asset.recordedWeight' && property.supportsFallback));

const submission = {
    code: 'SUB-1',
    revision: 4,
    confirmedFacts: {
        categoryCode: 'MOBILE_DEVICE',
        itemTypeCode: 'SMARTPHONE',
        quantity: 1,
        brand: 'Apple',
        weight: '0.2',
        weightProvenance: { basis: 'OPERATOR_MEASURED' }
    },
    metadata: {
        suggestion: {
            confidence: 0.91,
            materials: ['ALUMINIUM'],
            environmental: { recoveryPotential: 'HIGH' }
        }
    }
};
const impact = {
    code: 'IMPACT-1',
    calculationStatus: 'CONFIRMED',
    confidence: '0.9',
    metrics: [{ metricCode: 'ESTIMATED_CO2E_SAVED_KG', value: '14.6' }]
};
const normalized = contextService.build({
    submission,
    facts: submission.confirmedFacts,
    impact,
    assessmentType: 'CONFIRMED',
    verification: { verificationStatus: 'APPROVED' }
});
assert.strictEqual(normalized.properties['asset.recordedWeight'].quality, 'VERIFIED_MEASUREMENT');
assert.strictEqual(normalized.properties['environment.carbonImpact'].value, 14.6);
assert.strictEqual(normalized.properties['environment.carbonImpact'].quality, 'OPERATOR_VERIFIED');

const saved = [];
global.CONFIG = {
    get: name => name === 'eWaste'
        ? { rewardRules: { propertyProviderCode:'eWaste.reward', policyType:'REWARD_SCORING', defaultPlatformScopeCode:'DEFAULT', domainScopeCode:'ELECTRONICS' } }
        : {}
};
SERVICE.DefaultRulePolicyResolutionService = {
    resolveEffective: async () => ({
        code:'EWASTE_DOMAIN_v1', ruleSetCode:'EWASTE_DOMAIN', version:1,
        minimumScore:0, maximumScore:100, lineage:['EWASTE_DOMAIN_v1'],
        scoreBandSetCode:'EWASTE_BANDS', scoreBandSetVersion:1,
        definition:{ groups:[
            { code:'CARBON', operator:'ALL', conditions:[
                { code:'C1', propertyCode:'environment.carbonImpact', operatorCode:'GREATER_THAN_OR_EQUAL',
                  value:10, missingValueBehavior:'REQUIRED', minimumInputQuality:'AI_INFERRED' }
            ], outcome:{ outcomeType:'ADD_SCORE', parameters:{ score:60 } } }
        ] }
    })
};
SERVICE.DefaultScoreBandSetVersionService = {
    get: async () => ({ result:[{
        bandSetCode:'EWASTE_BANDS', version:1,
        bands:[
            { code:'LOW', minScore:0, maxScore:49, outcome:{ rewardTypeCode:'SUSTAINABILITY_REWARD', amount:'50' } },
            { code:'HIGH', minScore:50, maxScore:null, outcome:{ rewardTypeCode:'SUSTAINABILITY_REWARD', amount:'200' } }
        ]
    }] })
};
SERVICE.DefaultEWasteRewardAssessmentService = {
    get: async request => ({ result:saved.filter(row => row.code === request.query.code) }),
    save: async request => { saved.push(request.model); return { result:request.model }; }
};

(async () => {
    const assessment = await assessmentService.assessConfirmed({
        tenant:'default',
        submission,
        facts:submission.confirmedFacts,
        impact,
        verification:{ code:'VER-1', verificationStatus:'APPROVED' },
        correlationId:'corr-1'
    });
    assert.strictEqual(assessment.assessmentType, 'CONFIRMED');
    assert.strictEqual(assessment.finalScore, 60);
    assert.strictEqual(assessment.scoreBandCode, 'HIGH');
    assert.strictEqual(assessment.rewardAmount, '200');
    assert.strictEqual(assessment.policyVersion, 1);
    assert.strictEqual(assessment.bandSetVersion, 1);
    assert.strictEqual(saved.length, 1);

    const replay = await assessmentService.assessConfirmed({
        tenant:'default',
        submission,
        facts:submission.confirmedFacts,
        impact,
        verification:{ code:'VER-1', verificationStatus:'APPROVED' },
        correlationId:'corr-1'
    });
    assert.strictEqual(replay.code, assessment.code);
    assert.strictEqual(saved.length, 1, 'assessment replay must be idempotent');

    console.log('eWaste Rules property and reward assessment contracts validated');
})().finally(() => {
    delete global.SERVICE;
    delete global.CONFIG;
}).catch(error => {
    console.error(error);
    process.exitCode = 1;
});
