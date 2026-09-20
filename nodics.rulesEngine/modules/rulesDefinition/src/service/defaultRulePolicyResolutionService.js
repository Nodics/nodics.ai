/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module rulesDefinition/src/service/defaultRulePolicyResolutionService @description Resolves Platform→Domain→Enterprise→Campaign policy inheritance into one deterministic effective rule snapshot. @layer service @owner rulesDefinition */
module.exports = {
    rank: function (scopeType) {
        return { PLATFORM: 0, DOMAIN: 1, ENTERPRISE: 2, CAMPAIGN: 3 }[scopeType];
    },

    isEffective: function (version, now) {
        now = now || new Date();
        if (!version || version.status !== 'ACTIVE') return false;
        if (version.effectiveFrom && new Date(version.effectiveFrom) > now) return false;
        if (version.effectiveTo && new Date(version.effectiveTo) <= now) return false;
        return true;
    },

    scopeMatches: function (version, scope) {
        if (!scope || !version) return false;
        if (version.scopeType === 'PLATFORM') return version.scopeCode === scope.platformCode || version.scopeCode === 'DEFAULT';
        if (version.scopeType === 'DOMAIN') return version.scopeCode === scope.domainCode;
        if (version.scopeType === 'ENTERPRISE') return version.scopeCode === scope.enterpriseCode;
        if (version.scopeType === 'CAMPAIGN') return version.scopeCode === scope.campaignCode;
        return false;
    },

    latestPerScope: function (versions, scope, now) {
        let result = {};
        (versions || []).filter(version => this.isEffective(version, now) && this.scopeMatches(version, scope))
            .forEach(version => {
                let current = result[version.scopeType];
                if (!current || Number(version.version) > Number(current.version)) result[version.scopeType] = version;
            });
        return ['PLATFORM','DOMAIN','ENTERPRISE','CAMPAIGN'].map(type => result[type]).filter(Boolean);
    },

    mergeOverrides: function (effective, child) {
        let inherits = child.inheritsFrom;
        if (!inherits) return Object.assign({}, child, { lineage: (effective.lineage || []).concat([child.code]) });
        let allowed = effective.overridePolicy && Array.isArray(effective.overridePolicy.allowedFields)
            ? effective.overridePolicy.allowedFields
            : [];
        let overrides = child.metadata && child.metadata.overrides || {};
        let denied = Object.keys(overrides).filter(field => !allowed.includes(field));
        if (denied.length) throw new Error('Policy override is not permitted for fields: ' + denied.join(', '));
        let merged = Object.assign({}, effective);
        Object.keys(overrides).forEach(field => { merged[field] = overrides[field]; });
        merged.code = child.code;
        merged.ruleSetCode = child.ruleSetCode;
        merged.version = child.version;
        merged.scopeType = child.scopeType;
        merged.scopeCode = child.scopeCode;
        merged.overridePolicy = child.overridePolicy || effective.overridePolicy;
        merged.lineage = (effective.lineage || []).concat([child.code]);
        return merged;
    },

    materialize: function (versions, scope, now) {
        let chain = this.latestPerScope(versions, scope, now);
        if (!chain.length) throw new Error('No active rule policy applies to the requested scope');
        chain.sort((left, right) => this.rank(left.scopeType) - this.rank(right.scopeType));
        let effective = Object.assign({}, chain[0], { lineage: [chain[0].code] });
        for (let i = 1; i < chain.length; i += 1) {
            effective = this.mergeOverrides(effective, chain[i]);
        }
        effective.resolvedAt = (now || new Date()).toISOString();
        effective.sourceScopes = chain.map(item => ({ scopeType: item.scopeType, scopeCode: item.scopeCode, code: item.code, version: item.version }));
        return effective;
    },

    resolveEffective: async function (request) {
        let response = await SERVICE.DefaultRuleSetVersionService.get({
            tenant: request.tenant,
            authData: request.authData,
            query: {
                consumerModule: request.consumerModule,
                policyType: request.policyType
            },
            searchOptions: { limit: 1000 }
        });
        return this.materialize(response && response.result || [], request.scope || {}, request.now ? new Date(request.now) : new Date());
    }
};
