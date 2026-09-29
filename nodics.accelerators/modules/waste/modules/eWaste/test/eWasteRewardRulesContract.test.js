/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('assert');
const registry = require('../../../../../../nodics.rulesEngine/modules/rulesCore/src/service/defaultRulePropertyCatalogueRegistryService');
const evaluator = require('../../../../../../nodics.rulesEngine/modules/rulesEvaluation/src/service/defaultRuleEvaluationService');
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
assert(catalogue.properties.some(property => property.code === 'evidence.imageEvidenceType'));
assert(catalogue.properties.some(property => property.code === 'metadata.unknownFields'));

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

const descriptorContext = contextService.build({
    submission: { code: 'SUB-DESCRIPTOR', revision: 1, metadata: {} },
    descriptor: {
        contractVersion: 1,
        classification: {
            family: { code: 'ELECTRONICS' },
            category: { code: 'CABLE_OR_CHARGER' },
            itemType: { code: 'CHARGER' }
        },
        identity: { brand: null, model: null },
        condition: { value: 'UNKNOWN' },
        physical: {
            quantity: 1,
            size: { value: 'SMALL', basis: 'TAXONOMY_POLICY', confidence: 1 },
            weight: { value: null, unit: 'KG', basis: 'UNKNOWN' },
            weightEstimate: { min: 0.05, max: 0.2, unit: 'KG', basis: 'INFERRED', confidence: 0.74 },
            dimensionsEstimate: {
                length: { min: 4, max: 8, unit: 'CM', basis: 'INFERRED', confidence: 0.62 },
                width: { min: 3, max: 5, unit: 'CM', basis: 'INFERRED', confidence: 0.62 },
                height: { min: 2, max: 4, unit: 'CM', basis: 'INFERRED', confidence: 0.58 }
            }
        },
        materials: [{ ref: { code: 'PLASTIC' }, basis: 'OBSERVED', confidence: 0.8 }],
        components: [{ ref: { code: 'PCB_COMPONENT' }, basis: 'INFERRED', confidence: 0.55 }],
        environment: {
            observations: {
                recyclability: { value: 'POTENTIAL', basis: 'INFERRED', confidence: 0.65 },
                contamination: { value: 'NOT_VISIBLE', basis: 'OBSERVED', confidence: 0.7 },
                hazards: [{ code: 'EXPOSED_ELECTRONICS', basis: 'INFERRED', confidence: 0.5 }],
                recoveryPotential: { value: 'POTENTIAL', basis: 'INFERRED', confidence: 0.64 }
            }
        },
        evidenceReview: {
            sourceType: 'ITEM_PHOTOGRAPH',
            confidence: 0.93,
            manualApprovalRequired: false,
            qualityFlags: ['LABEL_UNREADABLE']
        },
        metadataQuality: {
            unknownFields: ['brand', 'model', 'conditionGrade'],
            lowConfidenceFields: ['components.0', 'physical.dimensionsEstimate.height'],
            manualVerificationRequired: false,
            completenessScore: 0.57
        }
    },
    assessmentType: 'ESTIMATED'
});
assert.strictEqual(descriptorContext.properties['asset.recordedWeight'].available, false, 'descriptor null measured weight must remain unavailable');
assert.strictEqual(descriptorContext.properties['asset.approximateWeight'].value, 0.125);
assert.deepStrictEqual(descriptorContext.properties.materials.value, ['PLASTIC']);
assert.deepStrictEqual(descriptorContext.properties.components.value, ['PCB_COMPONENT']);
assert.deepStrictEqual(descriptorContext.properties.hazards.value, ['EXPOSED_ELECTRONICS']);
assert.deepStrictEqual(descriptorContext.properties['metadata.lowConfidenceFields'].value, ['components.0', 'physical.dimensionsEstimate.height']);
assert.deepStrictEqual(descriptorContext.properties['evidence.qualityFlags'].value, ['LABEL_UNREADABLE']);
assert.strictEqual(descriptorContext.properties['metadata.completenessScore'].value, 0.57);

const fallback = provider.resolveFallback({
    propertyCode:'asset.recordedWeight',
    minimumInputQuality:'AI_INFERRED',
    minimumConfidence:0.7,
    context:{ fallbacks:{ 'asset.recordedWeight':[
        { available:true, value:0.22, quality:'REFERENCE_DEFAULT', confidence:1, source:'ITEM_TYPE_DEFAULT' },
        { available:true, value:0.21, quality:'AI_INFERRED', confidence:0.9, source:'IMAGE_AI' }
    ] } }
});
assert.strictEqual(fallback.source, 'IMAGE_AI', 'fallback must skip candidates below the configured quality floor');

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
SERVICE.DefaultWasteRewardAssessmentService = {
    get: async request => ({ result:saved.filter(row => row.code === request.query.code) }),
    save: async request => { saved.push(request.model); return { result:request.model }; }
};

(async () => {
    const estimated = await assessmentService.assessEstimated({
        tenant:'default',
        submission,
        facts:submission.confirmedFacts,
        impact,
        correlationId:'corr-estimated'
    });
    assert.strictEqual(estimated.assessmentType, 'ESTIMATED');
    assert.strictEqual(estimated.finalScore, 60);
    assert.strictEqual(estimated.scoreBandCode, 'HIGH');
    assert.strictEqual(saved.length, 1);

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
    assert.strictEqual(saved.length, 2);
    assert.notStrictEqual(estimated.code, assessment.code, 'estimated and confirmed assessments must remain separate evidence');

    const replay = await assessmentService.assessConfirmed({
        tenant:'default',
        submission,
        facts:submission.confirmedFacts,
        impact,
        verification:{ code:'VER-1', verificationStatus:'APPROVED' },
        correlationId:'corr-2'
    });
    assert.strictEqual(replay.code, assessment.code);
    assert.strictEqual(replay.sourceHash, assessment.sourceHash);
    assert.strictEqual(saved.length, 2, 'assessment replay must be idempotent across request correlation ids');

    await assert.rejects(() => assessmentService.assessConfirmed({
        tenant:'default',
        submission,
        facts:submission.confirmedFacts,
        impact:Object.assign({}, impact, { metrics:[{ metricCode:'ESTIMATED_CO2E_SAVED_KG', value:'3.1' }] }),
        verification:{ code:'VER-1', verificationStatus:'APPROVED' },
        correlationId:'corr-3'
    }), /Reward assessment replay conflicts/);
    assert.strictEqual(saved.length, 2, 'changed business inputs must not create duplicate immutable assessment evidence');

    console.log('eWaste Rules property and reward assessment contracts validated');
})().finally(() => {
    delete global.SERVICE;
    delete global.CONFIG;
}).catch(error => {
    console.error(error);
    process.exitCode = 1;
});
