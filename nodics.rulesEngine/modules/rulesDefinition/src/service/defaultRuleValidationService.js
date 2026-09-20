/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module rulesDefinition/src/service/defaultRuleValidationService
 * @description Validates generic Rules Engine drafts against registered consumer property metadata before publication.
 * @layer service
 * @owner rulesDefinition
 */
module.exports = {
    addIssue: function (issues, code, path, message) {
        issues.push({ code: code, path: path, message: message });
    },

    propertyMap: function (catalogue) {
        let map = {};
        (catalogue && catalogue.properties || []).forEach(property => {
            if (property && property.code) map[property.code] = property;
        });
        return map;
    },

    validateCondition: function (condition, propertyMap, operatorService, issues, path) {
        if (!condition.propertyCode) this.addIssue(issues, 'PROPERTY_REQUIRED', path, 'Select a property.');
        let property = propertyMap[condition.propertyCode];
        if (!property) {
            this.addIssue(issues, 'PROPERTY_UNKNOWN', path, 'The selected property is not available in this policy context.');
            return;
        }
        let dataType = condition.dataType || property.dataType;
        if (condition.dataType && property.dataType && condition.dataType !== property.dataType)
            this.addIssue(issues, 'PROPERTY_TYPE_MISMATCH', path, 'The condition type does not match the property catalogue.');
        if (!operatorService.supports(condition.operatorCode, dataType))
            this.addIssue(issues, 'OPERATOR_INVALID', path, 'The selected comparison is not valid for this property.');
        if (Array.isArray(property.allowedOperators) && property.allowedOperators.indexOf(condition.operatorCode) < 0)
            this.addIssue(issues, 'OPERATOR_NOT_ALLOWED', path, 'This comparison is not enabled for the selected property.');
        if (['REQUIRED', 'OPTIONAL', 'FALLBACK_ALLOWED'].indexOf(condition.missingValueBehavior || 'REQUIRED') < 0)
            this.addIssue(issues, 'MISSING_BEHAVIOR_INVALID', path, 'Select a valid unavailable-value behavior.');
        if (condition.missingValueBehavior === 'FALLBACK_ALLOWED' && property.supportsFallback !== true)
            this.addIssue(issues, 'FALLBACK_UNSUPPORTED', path, 'The selected property does not provide an approved fallback.');
        if (condition.minimumConfidence !== undefined && condition.minimumConfidence !== null && condition.minimumConfidence !== '') {
            let confidence = Number(condition.minimumConfidence);
            if (!Number.isFinite(confidence) || confidence < 0 || confidence > 100)
                this.addIssue(issues, 'CONFIDENCE_INVALID', path, 'Confidence must be between 0 and 1, or a percentage up to 100.');
        }
    },

    validateGroup: function (group, propertyMap, operatorService, outcomeRegistry, issues, path, depth, maximumDepth) {
        if (depth > maximumDepth) {
            this.addIssue(issues, 'GROUP_DEPTH_EXCEEDED', path, 'The rule contains more nested groups than the configured limit.');
            return;
        }
        if (['ALL', 'ANY'].indexOf(group.operator) < 0)
            this.addIssue(issues, 'GROUP_OPERATOR_INVALID', path, 'Select whether ALL or ANY conditions must match.');
        let conditions = (group.conditions || []).filter(condition => condition.enabled !== false);
        let children = (group.childGroups || []).filter(child => child.enabled !== false);
        if (conditions.length + children.length === 0)
            this.addIssue(issues, 'GROUP_EMPTY', path, 'Add at least one condition or condition group.');
        if (!outcomeRegistry.validate(group.outcome))
            this.addIssue(issues, 'OUTCOME_INVALID', path, 'The rule result is not valid.');
        conditions.forEach((condition, index) =>
            this.validateCondition(condition, propertyMap, operatorService, issues, path + '.conditions[' + index + ']'));
        children.forEach((child, index) =>
            this.validateGroup(child, propertyMap, operatorService, outcomeRegistry, issues,
                path + '.childGroups[' + index + ']', depth + 1, maximumDepth));
    },

    validateBands: function (bandSet, issues) {
        if (!bandSet) return;
        let bands = (bandSet.bands || []).filter(band => band.enabled !== false)
            .slice().sort((left, right) => Number(left.minScore) - Number(right.minScore));
        let previousMaximum;
        bands.forEach((band, index) => {
            let minimum = Number(band.minScore);
            let maximum = band.maxScore === undefined || band.maxScore === null || band.maxScore === ''
                ? undefined : Number(band.maxScore);
            if (!Number.isFinite(minimum) || (maximum !== undefined && !Number.isFinite(maximum)) ||
                (maximum !== undefined && maximum < minimum))
                this.addIssue(issues, 'BAND_RANGE_INVALID', 'bands[' + index + ']', 'Enter a valid score range.');
            if (previousMaximum !== undefined && minimum <= previousMaximum)
                this.addIssue(issues, 'BAND_OVERLAP', 'bands[' + index + ']', 'Reward score ranges cannot overlap.');
            if (previousMaximum !== undefined && minimum > previousMaximum + 1 && bandSet.gapBehavior !== 'NO_OUTCOME')
                this.addIssue(issues, 'BAND_GAP', 'bands[' + index + ']', 'Reward score ranges contain an uncovered gap.');
            previousMaximum = maximum;
        });
    },

    validate: function (request) {
        request = request || {};
        let ruleSet = request.ruleSet || {};
        let catalogue = request.catalogue || {};
        let operatorService = request.operatorService || SERVICE.DefaultRuleOperatorService;
        let outcomeRegistry = request.outcomeRegistry || SERVICE.DefaultRuleOutcomeRegistryService;
        let limits = request.limits || ((CONFIG.get('rulesEngine') || {}).limits || {});
        let issues = [];
        let map = this.propertyMap(catalogue);

        if (!ruleSet.code) this.addIssue(issues, 'RULE_SET_CODE_REQUIRED', 'ruleSet.code', 'Rule policy code is required.');
        if (!ruleSet.propertyProviderCode) this.addIssue(issues, 'PROPERTY_PROVIDER_REQUIRED', 'ruleSet.propertyProviderCode', 'A property catalogue is required.');
        if (!Array.isArray(ruleSet.groups) || ruleSet.groups.length === 0)
            this.addIssue(issues, 'RULES_REQUIRED', 'ruleSet.groups', 'Add at least one business rule.');
        if (Array.isArray(ruleSet.groups) && Number(limits.maximumRuleGroupsPerSet) > 0 &&
            ruleSet.groups.length > Number(limits.maximumRuleGroupsPerSet))
            this.addIssue(issues, 'RULE_LIMIT_EXCEEDED', 'ruleSet.groups', 'The policy contains more rules than the configured limit.');

        (ruleSet.groups || []).forEach((group, index) =>
            this.validateGroup(group, map, operatorService, outcomeRegistry, issues,
                'ruleSet.groups[' + index + ']', 1, Number(limits.maximumGroupDepth || 5)));

        this.validateBands(request.bandSet, issues);

        return Object.freeze({
            valid: issues.length === 0,
            issues: Object.freeze(issues),
            propertyCatalogueVersion: catalogue.version
        });
    }
};
