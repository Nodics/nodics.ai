/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const crypto = require('node:crypto');
const { isDeepStrictEqual } = require('node:util');
const reviewDiagnostics = require('../utils/reviewDiagnostics');

/**
 * @module eWaste/src/service/defaultEWasteRewardAssessmentOperationService
 * @description Produces immutable ESTIMATED/CONFIRMED eWaste reward assessments through nodics.rulesEngine without settling the Loyalty wallet.
 * @layer service
 * @owner eWaste
 * @override Partner projects may select policy scope/defaults while preserving Rules evaluation and Loyalty ownership.
 */
module.exports = {
    /** Throws the unchanged public error category with a content-free, registered local qualification check. */
    failQualification: function (check, code = 'ERR_EWASTE_REWARD_RECOVERY_CONFLICT') {
        try {
            SERVICE.DefaultWastePersistenceService.fail(code, 'Saved reward evidence could not be qualified');
        } catch (error) {
            if (Object.hasOwn(reviewDiagnostics.recoveryChecks, check)) error.rewardRecoveryCheck = check;
            throw error;
        }
    },
    /** Implements settings as an overrideable service operation. */
    settings: function () {
        return (CONFIG.get('eWaste') || {}).rewardRules || {};
    },

    /** Implements serviceRequest as an overrideable service operation. */
    serviceRequest: function (request, additions) {
        return Object.assign({
            tenant: request.tenant,
            authData: request.authData,
            options: { recursive: false }
        }, additions || {});
    },

    /** Implements scope as an overrideable service operation. */
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

    /** Implements resolvePolicy as an overrideable service operation. */
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

    /** Implements loadBandVersion as an overrideable service operation. */
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

    /** Implements normalizedAmount as an overrideable service operation. */
    normalizedAmount: function (outcome) {
        let amount = outcome && (outcome.amount !== undefined ? outcome.amount : outcome.rewardAmount);
        if (amount === undefined || amount === null || amount === '') throw new Error('Reward outcome amount is required');
        let numeric = Number(amount);
        if (!Number.isFinite(numeric) || numeric < 0) throw new Error('Reward outcome amount must be a non-negative number');
        return String(amount);
    },

    /** Captures effective settlement choices at creation, separately from the exact hashed Rules outcome. */
    settlementTerms: function (outcome) {
        const settings = this.settings();
        const terms = {
            contractVersion: 1,
            programCode: outcome.programCode || settings.loyaltyProgramCode || 'default',
            scale: outcome.scale === undefined ? settings.rewardScale : outcome.scale
        };
        return this.recordedSettlementTerms({ rewardOutcome: outcome, metadata: { settlementTerms: terms } });
    },

    /** Reads immutable settlement terms or fully specified historical outcome terms; never consults current configuration. */
    recordedSettlementTerms: function (assessment) {
        const outcome = assessment.rewardOutcome || {};
        const captured = assessment.metadata?.settlementTerms;
        const terms = captured === undefined ? { contractVersion: 1, programCode: outcome.programCode, scale: outcome.scale } : captured;
        if (!terms || terms.contractVersion !== 1 || typeof terms.programCode !== 'string' || !terms.programCode.trim() ||
            !Number.isSafeInteger(terms.scale) || terms.scale < 0 ||
            (outcome.programCode && terms.programCode !== outcome.programCode) ||
            (outcome.scale !== undefined && terms.scale !== outcome.scale))
            SERVICE.DefaultWastePersistenceService.fail('ERR_EWASTE_REWARD_RECOVERY_TERMS_REQUIRED', 'Original settlement terms were not captured');
        return { contractVersion: 1, programCode: terms.programCode, scale: terms.scale };
    },

    /** Resolves the original approval beneficiary, never the current transferable asset owner. */
    settlementBeneficiary: async function (request, asset, assessment) {
        const store = SERVICE.DefaultWastePersistenceService, tenant = request.authData?.tenant;
        const fail = () => store.fail('ERR_EWASTE_REWARD_ASSESSMENT_CONFLICT', 'Original approval beneficiary evidence does not match');
        const sameRef = (left, right) => left?.module === right?.module && left?.schema === right?.schema &&
            typeof left?.code === 'string' && !!left.code && left.code === right?.code;
        const tenantMatches = record => ![record?.tenant, record?.tenantCode].some(value => value !== undefined && value !== tenant);
        if (typeof tenant !== 'string' || !tenant || request.tenant !== tenant || !tenantMatches(request) ||
            !tenantMatches(request.authData) || !tenantMatches(asset) || !tenantMatches(assessment) ||
            asset.active === false || assessment.active === false || assessment.assetCode !== asset.code ||
            typeof asset.sourceSubmissionCode !== 'string' || !asset.sourceSubmissionCode ||
            assessment.submissionCode !== asset.sourceSubmissionCode ||
            asset.originalOwnerRef?.module !== 'profile' || asset.originalOwnerRef.schema !== 'customer') fail();
        const rows = await store.list('wasteSubmission', request, { code: asset.sourceSubmissionCode }, 2);
        if (!Array.isArray(rows) || rows.length !== 1) fail();
        const source = rows[0];
        if (!source || request.authData?.tenant !== tenant || request.tenant !== tenant ||
            !tenantMatches(request) || !tenantMatches(request.authData) || !tenantMatches(source) ||
            source.code !== asset.sourceSubmissionCode || source.active === false || source.submissionStatus !== 'APPROVED' ||
            !sameRef(source.submitterRef, asset.originalOwnerRef) ||
            source.verificationRef?.module !== 'wasteVerification' || source.verificationRef.schema !== 'wasteVerification' ||
            !sameRef(source.verificationRef, asset.verificationRef) || !sameRef(source.verificationRef, assessment.sourceVerificationRef)) fail();
        return { module: 'profile', schema: 'customer', code: source.submitterRef.code };
    },

    /** Normalizes supported generated save envelopes and rejects absent, ambiguous or mismatched evidence. */
    savedAssessment: function (response, model) {
        const store = SERVICE.DefaultWastePersistenceService;
        const rows = store.records(response);
        const saved = rows[0];
        if (response?.success === false || response?.errors?.length || String(response?.code || '').startsWith('ERR_') ||
            rows.length !== 1 || saved?.code !== model.code || saved.sourceHash !== model.sourceHash ||
            saved.assessmentType !== model.assessmentType || saved.submissionCode !== model.submissionCode ||
            saved.assetCode !== model.assetCode || !isDeepStrictEqual(saved.metadata?.settlementTerms, model.metadata?.settlementTerms))
            store.fail('ERR_EWASTE_REWARD_ASSESSMENT_UNCONFIRMED', 'Saved confirmed reward evidence was not returned unambiguously');
        return saved;
    },

    /** Implements collectExplanation as an overrideable service operation. */
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

    /** Implements assessmentCode as an overrideable service operation. */
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

    /** Implements existing as an overrideable service operation. */
    existing: async function (request, code) {
        let response = await SERVICE.DefaultWasteRewardAssessmentService.get(this.serviceRequest(request, {
            query: { code: code },
            searchOptions: { limit: 1 }
        }));
        let result = response && response.result;
        return Array.isArray(result) ? result[0] : result;
    },

    /** Checks saved evaluation evidence using Rules' hash serializer, never policy resolution or evaluation. */
    assertSavedEvaluation: function (assessment) {
        const store = SERVICE.DefaultWastePersistenceService;
        const conflict = check => this.failQualification(check);
        const rules = SERVICE.DefaultRuleEvaluationService;
        const breakdown = assessment.calculationBreakdown;
        if (!rules?.sourceHashEvidence || !rules?.flattenGroups || !breakdown ||
            !Array.isArray(breakdown.groupResults) || !Array.isArray(assessment.matchedRules) ||
            !Array.isArray(assessment.skippedRules) || !/^[a-f0-9]{64}$/.test(assessment.sourceHash || '') ||
            !Number.isFinite(breakdown.calculatedScore) || !Number.isFinite(breakdown.finalScore) ||
            Number(assessment.calculatedScore) !== breakdown.calculatedScore ||
            Number(assessment.finalScore) !== breakdown.finalScore ||
            assessment.scoreBandCode !== breakdown.scoreBandCode) conflict('EVALUATION_SHAPE');
        const groups = rules.flattenGroups(breakdown.groupResults);
        const matched = groups.filter(group => group.matched && group.outcome);
        const evidence = rules.sourceHashEvidence({
            ruleSetCode: assessment.policyCode, ruleSetVersion: assessment.policyVersion,
            propertyCatalogueCode: assessment.propertyCatalogueCode,
            propertyCatalogueVersion: assessment.propertyCatalogueVersion,
            bandSetCode: assessment.bandSetCode, bandSetVersion: assessment.bandSetVersion,
            calculatedScore: breakdown.calculatedScore, finalScore: breakdown.finalScore,
            scoreBandCode: breakdown.scoreBandCode, rewardOutcome: assessment.rewardOutcome,
            outcomes: matched.map(group => ({ groupCode: group.groupCode, outcome: group.outcome })),
            groupResults: breakdown.groupResults, matchedRules: assessment.matchedRules,
            skippedRules: assessment.skippedRules
        });
        const hash = crypto.createHash('sha256').update(JSON.stringify(evidence)).digest('hex');
        const outcome = assessment.rewardOutcome || {};
        if (hash !== assessment.sourceHash ||
            JSON.stringify(assessment.matchedRules) !== JSON.stringify(matched.map(group => group.groupCode)) ||
            JSON.stringify(assessment.skippedRules) !== JSON.stringify(groups.filter(group => !group.matched && group.outcome).map(group => group.groupCode))) conflict('EVALUATION_HASH');
        if (assessment.rewardTypeCode !== (outcome.rewardTypeCode || outcome.typeCode) ||
            assessment.rewardAmount !== this.normalizedAmount(outcome)) conflict('EVALUATION_OUTCOME');
        if (Number(assessment.rewardAmount) > 0) {
            try { this.recordedSettlementTerms(assessment); }
            catch (error) { error.rewardRecoveryCheck = 'SETTLEMENT_TERMS'; throw error; }
        }
    },

    /** Allows only untouched creation intents, never receipts or uncertain prior settlement evidence. */
    assertRecoverySettlementEvidence: async function (request, submission, asset) {
        const conflict = check => this.failQualification(check);
        if (asset.metadata?.rewardSettlement !== undefined || asset.metadata?.confirmedRewardRecovery !== undefined)
            conflict('SOURCE_SETTLEMENT_EVIDENCE');
        const refs = asset.rewardSettlementRefs;
        if (refs === undefined || (Array.isArray(refs) && refs.length === 0)) return;
        if (!Array.isArray(refs) || refs.length !== 1 || !refs[0] ||
            typeof refs[0].policyCode !== 'string' || !refs[0].policyCode ||
            asset.idempotencyKey !== submission.code + '_ASSET' ||
            !isDeepStrictEqual(asset.originalOwnerRef, submission.submitterRef) ||
            !isDeepStrictEqual(asset.ownerRef, asset.originalOwnerRef) ||
            asset.policyContextRef?.module !== 'wasteCore' || asset.policyContextRef.schema !== 'wasteAssetCreationPolicy' ||
            typeof asset.policyContextRef.code !== 'string' || !asset.policyContextRef.code ||
            typeof SERVICE.DefaultWasteAssetCreationService?.settlementRefs !== 'function') conflict('SOURCE_SETTLEMENT_INTENT');
        const expected = SERVICE.DefaultWasteAssetCreationService.settlementRefs('reward', asset.code,
            asset.originalOwnerRef, refs[0].policyCode, { correlationId: asset.correlationId, idempotencyKey: asset.idempotencyKey });
        // Persistence drops undefined optional fields; every persisted field must still be canonical.
        const compact = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
        if (!isDeepStrictEqual(compact(refs), compact(expected))) conflict('SOURCE_SETTLEMENT_INTENT');
        let events;
        try {
            events = await SERVICE.DefaultWastePersistenceService.list('wasteAssetOwnershipEvent', request,
                { code: asset.code + '_OWNERSHIP_CREATE' }, 2);
        } catch (error) { error.rewardRecoveryCheck = 'SOURCE_CREATION_READ'; throw error; }
        if (!Array.isArray(events) || events.length !== 1) conflict('SOURCE_CREATION_READ');
        const event = events[0], tenant = request.authData?.tenant;
        if (!tenant || request.tenant !== tenant ||
            [event.tenant, event.tenantCode].some(value => value !== undefined && value !== tenant) ||
            event.active === false || event.revision !== 0 || event.assetCode !== asset.code ||
            event.code !== asset.code + '_OWNERSHIP_CREATE' || event.transferType !== 'CREATE' || event.transferStatus !== 'COMPLETED' ||
            event.policyCode !== asset.policyContextRef.code || event.idempotencyKey !== asset.idempotencyKey ||
            event.correlationId !== asset.correlationId || !isDeepStrictEqual(event.toOwnerRef, asset.originalOwnerRef) ||
            !isDeepStrictEqual(event.triggerRef, { module: 'wasteSubmission', schema: 'wasteSubmission', code: submission.code }) ||
            !isDeepStrictEqual(compact(event.rewardSettlementRefs), compact(expected)) ||
            ['fromOwnerRef', 'commerceProjectionRef', 'commerceOrderRef', 'paymentRef', 'couponEntitlementRef', 'movementRef', 'complianceEvidenceRef']
                .some(key => event[key] !== undefined) ||
            (event.metadata !== undefined && !isDeepStrictEqual(event.metadata, {}))) conflict('SOURCE_CREATION_BINDING');
    },

    /** Qualifies one immutable original CONFIRMED assessment in the authenticated tenant. No writes or Rules evaluation. */
    savedConfirmed: async function (request, submission, asset) {
        const store = SERVICE.DefaultWastePersistenceService;
        const access = SERVICE.DefaultWasteOperationalAccessService;
        await access.authorize(request, 'waste.review.approve');
        await access.assertRecord(request, 'waste.review.approve', submission);
        const conflict = check => this.failQualification(check);
        const tenant = request.authData?.tenant;
        const checkTenant = (record, check = 'SOURCE_TENANT') => {
            if (!tenant || typeof tenant !== 'string' || request.tenant !== tenant || request.authData?.tenant !== tenant ||
                [request.tenantCode, request.authData?.tenantCode, record?.tenant, record?.tenantCode]
                    .some(value => value !== undefined && value !== tenant)) conflict(check);
        };
        const sameRef = (left, right) => left?.module === right?.module &&
            left?.schema === right?.schema && typeof left?.code === 'string' && left.code === right?.code;
        checkTenant(submission);
        checkTenant(asset);
        try { store.revision(submission, request.expectedRevision); }
        catch (error) { error.rewardRecoveryCheck = 'SOURCE_REVISION'; throw error; }
        if (request.authData?.principalType !== 'human' || !request.authData.loginId) conflict('SOURCE_HUMAN');
        if (submission.code !== request.code || submission.submissionStatus !== 'APPROVED' || submission.active === false) conflict('SOURCE_APPROVAL');
        if (asset.active === false || asset.sourceSubmissionCode !== submission.code) conflict('SOURCE_ASSET');
        if (!sameRef(asset.verificationRef, submission.verificationRef) ||
            submission.verificationRef?.module !== 'wasteVerification' || submission.verificationRef.schema !== 'wasteVerification') conflict('SOURCE_VERIFICATION');
        if (!sameRef(asset.ownerRef, submission.submitterRef) || asset.ownerRef?.module !== 'profile' || asset.ownerRef.schema !== 'customer') conflict('SOURCE_OWNER');
        if (asset.metadata?.confirmedRewardAssessmentRef !== undefined) conflict('SOURCE_REFERENCE_PRESENT');
        if (asset.metadata?.settlementStatus !== 'PENDING') conflict('SOURCE_SETTLEMENT_STATE');
        await this.assertRecoverySettlementEvidence(request, submission, asset);
        let rows;
        try {
            rows = await store.list('wasteRewardAssessment', request, {
                submissionCode: submission.code, assetCode: asset.code, assessmentType: 'CONFIRMED'
            }, 2);
        } catch (error) { error.rewardRecoveryCheck = 'ASSESSMENT_READ'; throw error; }
        if (!Array.isArray(rows)) conflict('ASSESSMENT_READ');
        if (!rows.length) this.failQualification('ASSESSMENT_ABSENT', 'ERR_EWASTE_REWARD_RECOVERY_NOT_FOUND');
        if (rows.length !== 1) conflict('ASSESSMENT_MULTIPLE');
        const assessment = rows[0];
        checkTenant(assessment, 'ASSESSMENT_TENANT');
        let decisions;
        try { decisions = await store.list('wasteVerification', request, { code: submission.verificationRef.code }, 2); }
        catch (error) { error.rewardRecoveryCheck = 'APPROVAL_READ'; throw error; }
        if (!Array.isArray(decisions) || decisions.length !== 1) conflict('APPROVAL_READ');
        const decision = decisions[0];
        checkTenant(decision, 'APPROVAL_TENANT');
        const metadata = submission.metadata || {}, command = metadata.reviewCommand;
        const source = assessment.inputSnapshot?.metadata;
        const status = assessment.inputSnapshot?.properties?.['verification.status'];
        if (!command || command.decision !== 'APPROVED' || !Number.isSafeInteger(command.expectedRevision) ||
            typeof metadata.reviewKey !== 'string' || !metadata.reviewKey || !metadata.reviewDigest) conflict('APPROVAL_COMMAND');
        if (metadata.reviewDigest !== SERVICE.DefaultWasteVerificationOperationService.commandDigest({
                code: submission.code, expectedRevision: command.expectedRevision, payload: command
            })) conflict('APPROVAL_DIGEST');
        if (decision.code !== submission.verificationRef.code || decision.active === false || decision.submissionCode !== submission.code ||
            decision.verificationStatus !== 'APPROVED') conflict('APPROVAL_DECISION');
        if (!sameRef(decision.verifiedBy, metadata.reviewPrincipal) || !sameRef(decision.verifiedBy, metadata.approvedBy)) conflict('APPROVAL_ACTOR');
        if (assessment.active === false || assessment.revision !== 0 || assessment.assessmentType !== 'CONFIRMED' ||
            assessment.submissionCode !== submission.code || assessment.assetCode !== asset.code) conflict('ASSESSMENT_IDENTITY');
        if (!sameRef(assessment.sourceVerificationRef, submission.verificationRef)) conflict('ASSESSMENT_VERIFICATION');
        if (submission.impactRef && !sameRef(assessment.sourceImpactRef, submission.impactRef)) conflict('ASSESSMENT_IMPACT');
        if (!Number.isSafeInteger(assessment.sourceRevision) || assessment.sourceRevision <= command.expectedRevision ||
            assessment.sourceRevision > submission.revision) conflict('ASSESSMENT_REVISION');
        if (source?.submissionRevision !== assessment.sourceRevision || source?.submissionCode !== submission.code || source?.assessmentType !== 'CONFIRMED') conflict('INPUT_SOURCE');
        if (status?.available !== true || status.value !== 'APPROVED' || status.source !== 'WASTE_VERIFICATION' || status.quality !== 'OPERATOR_VERIFIED') conflict('INPUT_VERIFICATION');
        if (assessment.idempotencyKey !== metadata.reviewKey + ':confirmed-reward') conflict('ASSESSMENT_KEY');
        if (!Number.isSafeInteger(assessment.policyVersion) || assessment.policyVersion < 1 ||
            !Number.isSafeInteger(assessment.bandSetVersion) || assessment.bandSetVersion < 1 ||
            !assessment.policyCode || !assessment.bandSetCode || !assessment.propertyCatalogueCode || !assessment.propertyCatalogueVersion) conflict('POLICY_PINS');
        if (assessment.code !== this.assessmentCode({ submission, sourceRevision: assessment.sourceRevision }, 'CONFIRMED', {
                ruleSetCode: assessment.policyCode, version: assessment.policyVersion
            })) conflict('ASSESSMENT_CODE');
        if (!Number.isFinite(Date.parse(assessment.calculatedAt)) || !Number.isFinite(Date.parse(metadata.reviewedAt)) ||
            Date.parse(assessment.calculatedAt) < Date.parse(metadata.reviewedAt)) conflict('ASSESSMENT_TIME');
        const facts = metadata.reviewedFacts;
        if (!facts || !isDeepStrictEqual(facts, decision.verifiedFacts)) conflict('ORIGINAL_FACTS');
        for (const [field, property] of Object.entries({
            itemTypeCode: 'asset.itemType', categoryCode: 'asset.category', quantity: 'asset.quantity',
            conditionGrade: 'asset.condition', weight: 'asset.recordedWeight'
        })) {
            if (facts[field] === undefined || facts[field] === null) continue;
            const saved = assessment.inputSnapshot.properties[property];
            const expected = field === 'weight' ? Number(facts[field]) : facts[field];
            if (saved?.available !== true || saved.value !== expected) conflict('INPUT_FACTS');
        }
        if (asset.metadata.confirmedReward && asset.metadata.confirmedReward.assessmentCode !== assessment.code) conflict('SAVED_SUMMARY');
        this.assertSavedEvaluation(assessment);
        return assessment;
    },

    /** Implements assess as an overrideable service operation. */
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
        if (policy.propertyCatalogueVersion !== undefined &&
            policy.propertyCatalogueVersion !== null &&
            String(policy.propertyCatalogueVersion) !== String(catalogue.version)) {
            throw new Error('Effective eWaste reward policy references a different property-catalogue version');
        }

        let evaluation = SERVICE.DefaultRuleEvaluationService.evaluate({
            ruleSet: {
                code: policy.ruleSetCode || policy.code,
                version: policy.version,
                minimumScore: policy.minimumScore,
                maximumScore: policy.maximumScore,
                groups: policy.definition && policy.definition.groups || [],
                scoreBands: bands.bands,
                gapBehavior: bands.gapBehavior || 'REJECT'
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
        if (existing) {
            if (existing.sourceHash !== evaluation.sourceHash)
                throw new Error('Reward assessment replay conflicts with previously recorded evaluation evidence');
            return existing;
        }

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
            metadata: { settlementTerms: this.settlementTerms(rewardOutcome) },
            revision: 0
        };
        let response = await SERVICE.DefaultWasteRewardAssessmentService.save(this.serviceRequest(request, { model: model }));
        return this.savedAssessment(response, model);
    },

    /** Implements assessEstimated as an overrideable service operation. */
    assessEstimated: function (request) {
        return this.assess(request, 'ESTIMATED');
    },

    /** Implements assessConfirmed as an overrideable service operation. */
    assessConfirmed: function (request) {
        return this.assess(request, 'CONFIRMED');
    },

    /** Implements reassessConfirmed as an overrideable service operation. */
    reassessConfirmed: function (request) {
        return this.assess(request, 'RECALCULATED');
    }
};
