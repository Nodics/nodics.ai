/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const crypto = require('node:crypto');

/** @module rulesEvaluation/src/service/defaultRuleEvaluationService @description Evaluates a complete immutable rule-set snapshot into deterministic generic outcomes and explainable score-band evidence. @layer service @owner rulesEvaluation */
module.exports = {
    groupService: function () {
        return typeof SERVICE !== 'undefined' && SERVICE.DefaultRuleGroupEvaluationService
            ? SERVICE.DefaultRuleGroupEvaluationService
            : require('./defaultRuleGroupEvaluationService');
    },

    number: function (value, fallback) {
        let parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    },

    scoreFromOutcome: function (outcome) {
        if (!outcome || outcome.outcomeType !== 'ADD_SCORE') return 0;
        let score = Number(outcome.parameters && outcome.parameters.score);
        if (!Number.isFinite(score)) throw new Error('ADD_SCORE outcome requires numeric score');
        return score;
    },

    clamp: function (score, minimum, maximum) {
        let result = score;
        if (Number.isFinite(Number(minimum))) result = Math.max(result, Number(minimum));
        if (Number.isFinite(Number(maximum))) result = Math.min(result, Number(maximum));
        return result;
    },

    resolveBand: function (score, bands) {
        let matches = (bands || []).filter(band => band.enabled !== false)
            .filter(band => score >= Number(band.minScore) &&
                (band.maxScore === undefined || band.maxScore === null || band.maxScore === '' || score <= Number(band.maxScore)));
        if (matches.length !== 1) {
            throw new Error(matches.length === 0
                ? 'No score band matches the calculated score'
                : 'More than one score band matches the calculated score');
        }
        return matches[0];
    },

    evaluate: function (request) {
        if (!request || !request.ruleSet || !request.propertyProviderCode) {
            throw new Error('Rule-set snapshot and property provider are required');
        }
        let ruleSet = request.ruleSet;
        let evaluationContext = {
            propertyProviderCode: request.propertyProviderCode,
            input: request.input || {},
            maximumGroupDepth: request.maximumGroupDepth || 5,
            correlationId: request.correlationId
        };
        let groupResults = (ruleSet.groups || []).filter(group => group.enabled !== false)
            .sort((left, right) => (left.sequence || 0) - (right.sequence || 0))
            .map(group => this.groupService().evaluate(group, evaluationContext, 1));

        let calculatedScore = groupResults
            .filter(result => result.matched)
            .reduce((total, result) => total + this.scoreFromOutcome(result.outcome), 0);
        let finalScore = this.clamp(calculatedScore, ruleSet.minimumScore, ruleSet.maximumScore);
        let scoreBand = this.resolveBand(finalScore, ruleSet.scoreBands || []);

        let evidence = {
            ruleSetCode: ruleSet.code,
            ruleSetVersion: ruleSet.version,
            propertyCatalogueCode: request.propertyCatalogueCode,
            propertyCatalogueVersion: request.propertyCatalogueVersion,
            calculatedScore: calculatedScore,
            finalScore: finalScore,
            scoreBandCode: scoreBand.code,
            rewardOutcome: scoreBand.outcome || null,
            groupResults: groupResults,
            matchedRules: groupResults.filter(result => result.matched).map(result => result.groupCode),
            skippedRules: groupResults.filter(result => !result.matched).map(result => result.groupCode),
            correlationId: request.correlationId || null
        };
        evidence.sourceHash = crypto.createHash('sha256').update(JSON.stringify(evidence)).digest('hex');
        return Object.freeze(evidence);
    }
};
