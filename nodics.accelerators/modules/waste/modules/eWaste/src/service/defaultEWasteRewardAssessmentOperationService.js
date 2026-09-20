/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const crypto = require('node:crypto');

/**
 * @module eWaste/src/service/defaultEWasteRewardAssessmentOperationService
 * @description Produces immutable ESTIMATED/CONFIRMED eWaste reward assessments through nodics.rulesEngine without settling the Loyalty wallet.
 * @layer service
 * @owner eWaste
 * @override Partner projects may select policy scope/defaults while preserving Rules evaluation and Loyalty ownership.
 */
module.exports = {
    settings: function () {
        return (CONFIG.get('eWaste') || {}).rewardRules || {};
    },

    serviceRequest: function (request, additions) {
        return Object.assign({
            tenant: request.tenant,
            authData: request.authData,
            options: { recursive: false }
        }, additions || {});
    },

    scope: function (request) {
        let settings = this.settings();
        let submission = request.submission || {};
        let source = submission.sourceContext || {};
        return Object.assign({
            platformCode: settings.defaultPlatformScopeCode || 'DEFAULT',
            domainCode: settings.domainScopeCode || 'ELECTRONICS',
            enterpriseCode: request.enterpriseCode || source.enterpriseCode,
            campaignCode: request.campaignCode
        }, request.scope || {});
    },

    resolvePolicy: function (request) {
        let settings = this.settings();
        return SERVICE.DefaultRulePolicyResolutionService.resolveEffective({
            tenant: request.tenant,
            authData: request.authData,
            consumerModule: 'eWaste',
            policyType: settings.policyType || 'REWARD_SCORING',
            scope: this.scope(request),
            now: request.now
        });
    },

    loadBandVersion: async function (request, policy) {
        if (!policy.scoreBandSetCode || !policy.scoreBandSetVersion) {
            throw new Error('Effective eWaste reward policy must bind an immutable score-band version');
        }
        let response = await SERVICE.DefaultScoreBandSetVersionService.get(this.serviceRequest(request, {
            query: {
                bandSetCode: policy.scoreBandSetCode,
                version: Number(policy.scoreBandSetVersion)
            },
            searchOptions: { limit: 1 }
        }));
        let result = response && response.result;
        let version = Array.isArray(result) ? result[0] : result;
        if (!version) throw new Error('Configured eWaste reward score-band version was not found');
        return version;
    },

    normalizedAmount: function (outcome) {
        let amount = outcome && (outcome.amount !== undefined ? outcome.amount : outcome.rewardAmount);
        if (amount === undefined || amount === null || amount === '') throw new Error('Reward outcome amount is required');
        let numeric = Number(amount);
        if (!Number.isFinite(numeric) || numeric < 0) throw new Error('Reward outcome amount must be a non-negative number');
        return String(amount);
    },

    collectExplanation: function (groupResults) {
        let fallbackInputs = [];
        let qualityExcludedInputs = [];
        let visit = function (group) {
            (group.conditionResults || []).forEach(result => {
                if (result.fallbackUsed) fallbackInputs.push({
                    propertyCode: result.propertyCode,
                    source: result.resolution && result.resolution.source,
                    quality: result.resolution && result.resolution.quality
                });
                if (result.reason === 'INPUT_UNAVAILABLE_OR_BELOW_QUALITY') {
                    qualityExcludedInputs.push({
                        propertyCode: result.propertyCode,
                        missingValueBehavior: result.applicable === false ? 'OPTIONAL' : 'REQUIRED_OR_FALLBACK_EXHAUSTED',
                        quality: result.resolution && result.resolution.quality,
                        confidence: result.resolution && result.resolution.confidence
                    });
                }
            });
            (group.childGroups || []).forEach(visit);
        };
        (groupResults || []).forEach(visit);
        return { fallbackInputs: fallbackInputs, qualityExcludedInputs: qualityExcludedInputs };
    },

    assessmentCode: function (request, assessmentType, policy) {
        let submission = request.submission || {};
        let sourceRevision = Number(request.sourceRevision !== undefined ? request.sourceRevision : submission.revision || 0);
        return [
            submission.code,
            'REWARD',
            assessmentType,
            String(policy.ruleSetCode || policy.code),
            'V' + String(policy.version),
            'R' + String(sourceRevision)
        ].join('_');
    },

    existing: async function (request, code) {
        let response = await SERVICE.DefaultWasteRewardAssessmentService.get(this.serviceRequest(request, {
            query: { code: code },
            searchOptions: { limit: 1 }
        }));
        let result = response && response.result;
        return Array.isArray(result) ? result[0] : result;
    },

    assess: async function (request, assessmentType) {
        if (!request || !request.submission || !request.submission.code) throw new Error('Reward assessment requires a waste submission');
        if (!['ESTIMATED','CONFIRMED','RECALCULATED'].includes(assessmentType)) throw new Error('Unsupported reward assessment type');

        let policy = await this.resolvePolicy(request);
        let bands = await this.loadBandVersion(request, policy);
        let context = SERVICE.DefaultEWasteRewardContextService.build(Object.assign({}, request, {
            assessmentType: assessmentType
        }));
        let provider = SERVICE.DefaultRulePropertyCatalogueRegistryService.getProvider(
            this.settings().propertyProviderCode || 'eWaste.reward'
        );
        let catalogue = provider.getCatalogue({
            tenant: request.tenant,
            assessmentType: assessmentType
        });

        let evaluation = SERVICE.DefaultRuleEvaluationService.evaluate({
            ruleSet: {
                code: policy.ruleSetCode || policy.code,
                version: policy.version,
                minimumScore: policy.minimumScore,
                maximumScore: policy.maximumScore,
                groups: policy.definition && policy.definition.groups || [],
                scoreBands: bands.bands
            },
            propertyProviderCode: this.settings().propertyProviderCode || 'eWaste.reward',
            propertyCatalogueCode: catalogue.code,
            propertyCatalogueVersion: catalogue.version,
            bandSetCode: bands.bandSetCode,
            bandSetVersion: bands.version,
            input: context,
            correlationId: request.correlationId || request.requestId
        });

        let rewardOutcome = evaluation.rewardOutcome || {};
        let rewardTypeCode = rewardOutcome.rewardTypeCode || rewardOutcome.typeCode;
        if (!rewardTypeCode) throw new Error('Reward score band must define rewardTypeCode');
        let explanation = this.collectExplanation(evaluation.groupResults);
        let code = this.assessmentCode(request, assessmentType, policy);
        let existing = await this.existing(request, code);
        if (existing) return existing;

        let submission = request.submission;
        let sourceRevision = Number(request.sourceRevision !== undefined ? request.sourceRevision : submission.revision || 0);
        let idempotencyKey = request.idempotencyKey || crypto.createHash('sha256')
            .update([code, evaluation.sourceHash].join(':')).digest('hex');

        let model = {
            code: code,
            active: true,
            name: { en: assessmentType + ' reward assessment ' + submission.code },
            submissionCode: submission.code,
            assetCode: request.asset && request.asset.code,
            assessmentType: assessmentType,
            calculatedScore: evaluation.calculatedScore,
            finalScore: evaluation.finalScore,
            scoreBandCode: evaluation.scoreBandCode,
            rewardTypeCode: rewardTypeCode,
            rewardAmount: this.normalizedAmount(rewardOutcome),
            rewardOutcome: rewardOutcome,
            policyCode: policy.ruleSetCode || policy.code,
            policyVersion: Number(policy.version),
            policyLineage: policy.lineage || [],
            bandSetCode: bands.bandSetCode,
            bandSetVersion: Number(bands.version),
            propertyCatalogueCode: catalogue.code,
            propertyCatalogueVersion: String(catalogue.version),
            matchedRules: evaluation.matchedRules,
            skippedRules: evaluation.skippedRules,
            fallbackInputs: explanation.fallbackInputs,
            qualityExcludedInputs: explanation.qualityExcludedInputs,
            calculationBreakdown: {
                groupResults: evaluation.groupResults,
                calculatedScore: evaluation.calculatedScore,
                finalScore: evaluation.finalScore,
                scoreBandCode: evaluation.scoreBandCode
            },
            inputSnapshot: context,
            sourceImpactRef: request.impact && request.impact.code ? {
                module: 'wasteImpact', schema: 'wasteImpactResult', code: request.impact.code
            } : undefined,
            sourceVerificationRef: request.verification && request.verification.code ? {
                module: 'wasteVerification', schema: 'wasteVerification', code: request.verification.code
            } : undefined,
            sourceRevision: sourceRevision,
            calculatedAt: new Date(),
            correlationId: request.correlationId,
            idempotencyKey: idempotencyKey,
            sourceHash: evaluation.sourceHash,
            revision: 0
        };
        let response = await SERVICE.DefaultWasteRewardAssessmentService.save(this.serviceRequest(request, { model: model }));
        return response && response.result || response;
    },

    assessEstimated: function (request) {
        return this.assess(request, 'ESTIMATED');
    },

    assessConfirmed: function (request) {
        return this.assess(request, 'CONFIRMED');
    },

    reassessConfirmed: function (request) {
        return this.assess(request, 'RECALCULATED');
    }
};
