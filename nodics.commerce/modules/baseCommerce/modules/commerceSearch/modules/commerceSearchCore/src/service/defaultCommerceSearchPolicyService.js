/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/**
 * @module commerceSearchCore/service/policy
 * @description Validates effective owner defaults and staged ranking rules.
 * @layer service
 * @owner commerceSearchCore
 * @remarks Search policy is defined only in implementing properties. Validation preserves explicit
 * zero scores/priority and independently retained publication timing; it is not authorization to
 * publish.
 * Inputs and outputs are specified on each exported member below.
 * Effects and failures remain in the existing owner flow; missing evidence is never synthetic success.
 * Exported members: policy, priority, validate.
 * @override Customize through the existing loader-visible module members, preserving private
 * authority.
 */
module.exports = {
    /**
     * Requires complete framework policy and preserves explicit zero weights.
     * @returns {Object} Complete validated effective Search policy.
     * @remarks Effects: Reads CONFIG; never supplies local fallback defaults.
     * Failure behavior: Rejects missing, invalid, inverted or unsafe bounds/weights.
     * @override Override through the effective module member; retain the original owner, scope and
     * evidence checks described above.
     */
    policy: function () {
        const policy = CONFIG.get('commerceSearch')?.ranking;
        if (!policy || typeof policy.enabled !== 'boolean' || typeof policy.searchIndexName !== 'string' || !policy.searchIndexName ||
            ['maximumRulesPerRequest', 'maximumActionsPerRule', 'maximumRuleScan', 'rulePageSize', 'maximumCandidateProducts'].some(key =>
                !Number.isSafeInteger(policy[key]) || policy[key] < 1) ||
            policy.maximumRulesPerRequest > policy.maximumRuleScan || policy.rulePageSize > policy.maximumRuleScan ||
            !Number.isSafeInteger(policy.defaultRulePriority) ||
            !Number.isFinite(policy.actionWeights?.BOOST) || policy.actionWeights.BOOST < 0 ||
            !Number.isFinite(policy.actionWeights?.BURY) || policy.actionWeights.BURY > 0 ||
            !Array.isArray(policy.supportedActionTypes) || !policy.supportedActionTypes.length ||
            policy.supportedActionTypes.some(type => !['PIN', 'BOOST', 'BURY'].includes(type)) ||
            !Array.isArray(policy.supportedScopeTypes) || !policy.supportedScopeTypes.length ||
            policy.supportedScopeTypes.some(type => !['GLOBAL', 'CATEGORY', 'SEARCH_TERM'].includes(type)))
            throw new Error('Commerce Search ranking configuration is invalid');
        return policy;
    },
    /**
     * Resolves omitted priority from the owner baseline without replacing explicit zero.
     * @param {Object} rule Validated Search rule including scope, timing and benefit identity.
     * @returns {number} Explicit rule priority or validated owner default.
     * @remarks Effects: Pure effective policy resolution; preserves zero.
     * Failure behavior: Rejects invalid explicit/default priority.
     * @override Override through the effective module member; retain the original owner, scope and
     * evidence checks described above.
     */
    priority: function (rule) {
        const value = rule.priority === undefined ? this.policy().defaultRulePriority : rule.priority;
        if (!Number.isSafeInteger(value)) throw new Error('Commerce Search priority is invalid');
        return value;
    },
    /**
     * Validates timing, query scopes and ranking actions before publication.
     * @param {Object} rule Validated Search rule including scope, timing and benefit identity.
     * @returns {Object} Unchanged rule after scope/action/window validation.
     * @remarks Effects: No persistence or publication effects.
     * Failure behavior: Rejects unsupported actions, incomplete scope, malformed timing or exceeded
     * configured bounds.
     * @override Override through the effective module member; retain the original owner, scope and
     * evidence checks described above.
     */
    validate: function (rule) {
        const policy = this.policy();
        if (!policy.supportedScopeTypes.includes(rule.scopeType) || !Array.isArray(rule.actions) ||
            rule.actions.length > policy.maximumActionsPerRule ||
            rule.scopeType === 'CATEGORY' && !rule.categoryCode || rule.scopeType === 'SEARCH_TERM' && !rule.searchTerm)
            throw new Error('Commerce Search rule scope or actions are invalid');
        for (const key of ['validFrom', 'validTo']) if (rule[key] !== undefined) {
            const value = rule[key];
            if (!(value instanceof Date) && (typeof value !== 'string' || !/T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value)) ||
                !Number.isFinite(new Date(value).getTime())) throw new Error('Commerce Search rule window is invalid');
        }
        if (rule.validFrom !== undefined && rule.validTo !== undefined && new Date(rule.validFrom) >= new Date(rule.validTo))
            throw new Error('Commerce Search rule window is invalid');
        for (const action of rule.actions) {
            if (!policy.supportedActionTypes.includes(action.actionType) || typeof action.productCode !== 'string' || !action.productCode ||
                action.actionType === 'PIN' && (!Number.isSafeInteger(action.position) || action.position < 1) ||
                action.weight !== undefined && (!Number.isFinite(action.weight) || action.actionType === 'BOOST' && action.weight < 0 || action.actionType === 'BURY' && action.weight > 0))
                throw new Error('Commerce Search action is invalid');
        }
        if (rule.benefitRef && rule.actions.length) throw new Error('Agreement-backed boosts cannot include independently selected actions');
        if (rule.priority !== undefined && !Number.isSafeInteger(rule.priority)) throw new Error('Commerce Search priority is invalid');
        return rule;
    }
};
