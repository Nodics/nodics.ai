/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module rulesDefinition/src/service/defaultRuleDefinitionValidationService @description Validates generic RuleGroup graphs, consumer property/operator compatibility, score bands and policy dates before publication. @layer service @owner rulesDefinition */
module.exports = {
    limits: function () {
        let config = typeof CONFIG !== 'undefined' && CONFIG.get ? CONFIG.get('rulesEngine') : {};
        return (config && config.limits) || {
            maximumRuleGroupsPerSet: 250,
            maximumConditionsPerGroup: 50,
            maximumGroupDepth: 5
        };
    },

    providerRegistry: function () {
        return typeof SERVICE !== 'undefined' && SERVICE.DefaultRulePropertyCatalogueRegistryService
            ? SERVICE.DefaultRulePropertyCatalogueRegistryService
            : require('../../../rulesCore/src/service/defaultRulePropertyCatalogueRegistryService');
    },

    operatorService: function () {
        return typeof SERVICE !== 'undefined' && SERVICE.DefaultRuleOperatorService
            ? SERVICE.DefaultRuleOperatorService
            : require('../../../rulesCore/src/service/defaultRuleOperatorService');
    },

    outcomeRegistry: function () {
        return typeof SERVICE !== 'undefined' && SERVICE.DefaultRuleOutcomeRegistryService
            ? SERVICE.DefaultRuleOutcomeRegistryService
            : require('../../../rulesCore/src/service/defaultRuleOutcomeRegistryService');
    },

    propertyMap: function (providerCode, context) {
        let catalogue = this.providerRegistry().getCatalogue(providerCode, context || {});
        let properties = catalogue && catalogue.properties || [];
        return properties.reduce((map, property) => {
            map[property.code] = property;
            return map;
        }, {});
    },

    validateCondition: function (condition, propertyMap, issues, path) {
        if (!condition || !condition.code) issues.push({ path: path, code: 'CONDITION_CODE_REQUIRED' });
        if (!condition || !condition.propertyCode || !propertyMap[condition.propertyCode]) {
            issues.push({ path: path, code: 'PROPERTY_UNAVAILABLE', propertyCode: condition && condition.propertyCode });
            return;
        }
        let property = propertyMap[condition.propertyCode];
        if (!this.operatorService().operators().includes(condition.operatorCode)) {
            issues.push({ path: path, code: 'OPERATOR_UNSUPPORTED', operatorCode: condition.operatorCode });
        } else if (property.dataType && !this.operatorService().supports(condition.operatorCode, property.dataType)) {
            issues.push({
                path: path,
                code: 'OPERATOR_TYPE_INVALID',
                operatorCode: condition.operatorCode,
                dataType: property.dataType
            });
        } else if (Array.isArray(property.allowedOperators) && !property.allowedOperators.includes(condition.operatorCode)) {
            issues.push({ path: path, code: 'OPERATOR_NOT_ALLOWED_FOR_PROPERTY', operatorCode: condition.operatorCode });
        }
        if (!['REQUIRED','OPTIONAL','FALLBACK_ALLOWED'].includes(condition.missingValueBehavior)) {
            issues.push({ path: path, code: 'MISSING_VALUE_BEHAVIOR_INVALID' });
        }
        if (condition.missingValueBehavior === 'FALLBACK_ALLOWED' && property.supportsFallback !== true) {
            issues.push({ path: path, code: 'PROPERTY_FALLBACK_UNSUPPORTED' });
        }
        if (condition.minimumConfidence !== undefined && condition.minimumConfidence !== null) {
            let confidence = Number(condition.minimumConfidence);
            if (!Number.isFinite(confidence) || confidence < 0 || confidence > 100) {
                issues.push({ path: path, code: 'MINIMUM_CONFIDENCE_INVALID' });
            }
        }
    },

    validateGroup: function (group, propertyMap, issues, path, depth, seenCodes) {
        let limits = this.limits();
        if (depth > Number(limits.maximumGroupDepth || 5)) {
            issues.push({ path: path, code: 'GROUP_DEPTH_EXCEEDED' });
            return;
        }
        if (!group || !group.code) issues.push({ path: path, code: 'GROUP_CODE_REQUIRED' });
        if (group && group.code) {
            if (seenCodes.has(group.code)) issues.push({ path: path, code: 'GROUP_CODE_DUPLICATE', groupCode: group.code });
            seenCodes.add(group.code);
        }
        if (!group || !['ALL','ANY'].includes(group.operator)) issues.push({ path: path, code: 'GROUP_OPERATOR_INVALID' });
        let conditions = group && group.conditions || [];
        let children = group && group.childGroups || [];
        if (conditions.length + children.length === 0) issues.push({ path: path, code: 'GROUP_EMPTY' });
        if (conditions.length > Number(limits.maximumConditionsPerGroup || 50)) issues.push({ path: path, code: 'CONDITION_LIMIT_EXCEEDED' });
        conditions.forEach((condition, index) => this.validateCondition(condition, propertyMap, issues, path + '.conditions[' + index + ']'));
        children.forEach((child, index) => this.validateGroup(child, propertyMap, issues, path + '.childGroups[' + index + ']', depth + 1, seenCodes));
        if (!group || !group.outcome || !group.outcome.outcomeType) {
            if (depth === 1) issues.push({ path: path, code: 'TOP_LEVEL_OUTCOME_REQUIRED' });
        } else {
            let outcomeValidation = this.outcomeRegistry().validate(group.outcome);
            (outcomeValidation.issues || []).forEach(issue => issues.push(Object.assign({ path: path + '.outcome' }, issue)));
        }
    },

    validateDefinition: function (request) {
        let definition = request && request.definition || {};
        let groups = definition.groups || [];
        let limits = this.limits();
        let issues = [];
        if (!Array.isArray(groups) || groups.length === 0) issues.push({ path: 'definition.groups', code: 'RULE_GROUPS_REQUIRED' });
        if (groups.length > Number(limits.maximumRuleGroupsPerSet || 250)) issues.push({ path: 'definition.groups', code: 'RULE_GROUP_LIMIT_EXCEEDED' });
        let propertyMap = this.propertyMap(request.propertyProviderCode, request.context);
        let seenCodes = new Set();
        groups.forEach((group, index) => this.validateGroup(group, propertyMap, issues, 'definition.groups[' + index + ']', 1, seenCodes));
        return { valid: issues.length === 0, issues: issues };
    },

    validateBands: function (bands, gapBehavior) {
        let issues = [];
        if (!Array.isArray(bands) || bands.length === 0) return { valid: false, issues: [{ path: 'bands', code: 'BANDS_REQUIRED' }] };
        let normalized = bands.filter(band => band.enabled !== false).map((band, index) => {
            let min = Number(band.minScore);
            let open = band.maxScore === undefined || band.maxScore === null || band.maxScore === '';
            let max = open ? null : Number(band.maxScore);
            if (!Number.isFinite(min) || (!open && !Number.isFinite(max)) || (!open && max < min)) {
                issues.push({ path: 'bands[' + index + ']', code: 'BAND_RANGE_INVALID' });
            }
            if (!band.code) issues.push({ path: 'bands[' + index + ']', code: 'BAND_CODE_REQUIRED' });
            if (!band.outcome) issues.push({ path: 'bands[' + index + ']', code: 'BAND_OUTCOME_REQUIRED' });
            return { band: band, min: min, max: max, index: index };
        }).sort((a, b) => a.min - b.min);
        for (let i = 1; i < normalized.length; i += 1) {
            let previous = normalized[i - 1], current = normalized[i];
            if (previous.max === null || current.min <= previous.max) {
                issues.push({ path: 'bands[' + current.index + ']', code: 'BAND_OVERLAP' });
            } else if (gapBehavior === 'REJECT' && current.min > previous.max + 1) {
                issues.push({ path: 'bands[' + current.index + ']', code: 'BAND_GAP' });
            }
        }
        if (gapBehavior === 'REJECT' && normalized.length && normalized[normalized.length - 1].max !== null) {
            issues.push({ path: 'bands', code: 'OPEN_FINAL_BAND_REQUIRED' });
        }
        return { valid: issues.length === 0, issues: issues };
    },

    validateDates: function (effectiveFrom, effectiveTo) {
        if (!effectiveFrom || !effectiveTo) return { valid: true, issues: [] };
        let from = new Date(effectiveFrom), to = new Date(effectiveTo);
        return from < to
            ? { valid: true, issues: [] }
            : { valid: false, issues: [{ path: 'effectiveTo', code: 'EFFECTIVE_RANGE_INVALID' }] };
    }
};
