/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const UTILS = require('../../../wasteCore/src/utils/utils');

/** @module wasteCollection/src/service/defaultWasteAcceptancePolicyService @description Evaluates whether submitted waste facts satisfy collection acceptance rules. @layer service @owner wasteCollection @override Partner modules may add stricter policy while preserving rule-owned authority. */
module.exports = {
    /** Initializes this service. */
    init: function () { return Promise.resolve(true); },

    /** Completes this service startup. */
    postInit: function () { return Promise.resolve(true); },

    /** Normalizes a value as an array. */
    array: function (value) {
        if (value === undefined || value === null) return [];
        return Array.isArray(value) ? value : [value];
    },

    /** Returns true when a rule is active. */
    isActiveRule: function (rule) {
        return !!rule && rule.status === 'ACTIVE';
    },

    /** Returns true when a candidate matches an optional scalar rule field. */
    matchesScalar: function (ruleValue, candidateValue) {
        return !UTILS.normalizeString(ruleValue) || UTILS.normalizeCode(ruleValue) === UTILS.normalizeCode(candidateValue);
    },

    /** Returns true when a candidate array contains an optional scalar rule field. */
    matchesArray: function (ruleValue, candidateValues) {
        if (!UTILS.normalizeString(ruleValue)) return true;
        return this.array(candidateValues).map(function (item) { return UTILS.normalizeCode(item); }).indexOf(UTILS.normalizeCode(ruleValue)) >= 0;
    },

    /** Returns true when condition constraints allow the submitted condition. */
    matchesCondition: function (rule, facts) {
        let grades = this.array(rule.conditionGrades);
        if (!grades.length) return true;
        return grades.map(function (item) { return UTILS.normalizeCode(item); }).indexOf(UTILS.normalizeCode(facts.conditionGrade)) >= 0;
    },

    /** Returns true when quantity and weight constraints allow the submitted values. */
    matchesMeasure: function (rule, facts) {
        let quantity = facts.quantity === undefined || facts.quantity === null ? undefined : Number(facts.quantity);
        let weight = facts.weight === undefined || facts.weight === null ? undefined : Number(facts.weight);
        if (rule.minQuantity !== undefined && !(quantity >= Number(rule.minQuantity))) return false;
        if (rule.maxQuantity !== undefined && !(quantity <= Number(rule.maxQuantity))) return false;
        if (rule.minWeight !== undefined && !(weight >= Number(rule.minWeight))) return false;
        if (rule.maxWeight !== undefined && !(weight <= Number(rule.maxWeight))) return false;
        return true;
    },

    /** Returns true when a rule applies to the collection point and submitted facts. */
    matchesRule: function (rule, collectionPoint, facts) {
        return this.isActiveRule(rule)
            && this.matchesScalar(rule.collectionPointCode, collectionPoint && collectionPoint.code)
            && this.matchesScalar(rule.collectionPointType, collectionPoint && collectionPoint.collectionPointType)
            && this.matchesScalar(rule.familyCode, facts.familyCode)
            && this.matchesScalar(rule.categoryCode, facts.categoryCode)
            && this.matchesScalar(rule.itemTypeCode, facts.itemTypeCode)
            && this.matchesArray(rule.materialTypeCode, facts.materialTypeCodes)
            && this.matchesCondition(rule, facts)
            && this.matchesMeasure(rule, facts);
    },

    /** Evaluates authoritative acceptance rules for a collection point and submitted waste facts. */
    evaluate: function (request) {
        request = request || {};
        let collectionPoint = request.collectionPoint || {};
        let facts = request.facts || request.submission || {};
        let matchingRules = this.array(request.rules).filter(function (rule) {
            return this.matchesRule(rule, collectionPoint, facts);
        }, this);
        let rejectRules = matchingRules.filter(function (rule) { return rule.decision === 'REJECT'; });
        if (rejectRules.length) {
            return { accepted: false, reasonCode: 'WASTE_ACCEPTANCE_REJECTED', matchedRules: rejectRules };
        }
        let acceptRules = matchingRules.filter(function (rule) { return rule.decision === 'ACCEPT'; });
        if (acceptRules.length) {
            return {
                accepted: true,
                reasonCode: 'WASTE_ACCEPTANCE_ALLOWED',
                matchedRules: acceptRules,
                requiresPreApproval: acceptRules.some(function (rule) { return !!rule.requiresPreApproval; }),
                requiresReceipt: acceptRules.some(function (rule) { return !!rule.requiresReceipt; })
            };
        }
        return { accepted: false, reasonCode: 'WASTE_ACCEPTANCE_NO_ACTIVE_RULE', matchedRules: [] };
    }
};
