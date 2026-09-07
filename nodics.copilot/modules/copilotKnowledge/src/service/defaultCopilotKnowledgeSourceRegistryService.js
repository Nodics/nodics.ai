/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';

/** @module copilotKnowledge/src/service/defaultCopilotKnowledgeSourceRegistryService @description Builds an immutable, classified source registry and produces security-filtered pre-retrieval query scopes without scanning repositories or bypassing Discovery. @layer service @owner copilotKnowledge @override Projects may contribute stricter classified definitions through layered configuration. */
module.exports = {
    /** Returns a classification rank used to prevent weaker-than-default registration. @param {string} classification Classification. @returns {number} Rank. */
    classificationRank: function (classification) {
        return { PUBLIC: 0, CUSTOMER: 1, INTERNAL: 2, RESTRICTED: 3 }[String(classification || '').toUpperCase()];
    },
    /** Checks that a registered path remains repository-relative. @param {string} value Path or bounded glob. @returns {boolean} Valid state. */
    validRelativePath: function (value) {
        const candidate = String(value || '').replace(/\\/gu, '/');
        return Boolean(candidate) && !candidate.startsWith('/') && !candidate.includes('\0') && !candidate.split('/').includes('..');
    },
    /** Normalizes and validates one source definition. @param {Object} source Raw source definition. @param {Object} configuration Registry configuration. @param {Object} policyService Policy service. @returns {Object} Immutable definition. */
    normalize: function (source, configuration, policyService) {
        const input = source || {};
        const classifications = (configuration || {}).allowedClassifications || ['PUBLIC', 'CUSTOMER', 'INTERNAL', 'RESTRICTED'];
        const classification = String(input.classification || '').toUpperCase();
        const sourceType = String(input.sourceType || '').toUpperCase();
        const paths = Array.isArray(input.paths) ? input.paths.map(String).filter(Boolean) : [];
        const excludedPaths = Array.isArray(input.excludedPaths) ? input.excludedPaths.map(String).filter(Boolean) : [];
        const allowedExtensions = Array.isArray(input.allowedExtensions) ? input.allowedExtensions.map(value => String(value).toLowerCase()) : [];
        const limits = input.limits || {};
        if (!input.code || !/^[A-Za-z0-9][A-Za-z0-9._-]{1,127}$/u.test(String(input.code)) || !input.repository || !input.project || !input.module || !input.owner || !input.version || !sourceType || !classifications.includes(classification) || !paths.length || paths.some(value => !this.validRelativePath(value))) throw new Error('COPILOT_KNOWLEDGE_SOURCE_INVALID');
        if (excludedPaths.some(value => !this.validRelativePath(value))) throw new Error('COPILOT_KNOWLEDGE_SOURCE_EXCLUSION_INVALID');
        if (allowedExtensions.some(value => !/^\.[a-z0-9]+$/u.test(value))) throw new Error('COPILOT_KNOWLEDGE_SOURCE_EXTENSION_INVALID');
        if (['maximumFiles', 'maximumFileBytes', 'maximumSourceBytes'].some(key => limits[key] !== undefined && (!Number.isInteger(Number(limits[key])) || Number(limits[key]) < 1))) throw new Error('COPILOT_KNOWLEDGE_SOURCE_LIMIT_INVALID');
        const minimum = ((configuration || {}).minimumClassificationByType || {})[sourceType];
        if (minimum === undefined || this.classificationRank(classification) < this.classificationRank(minimum)) throw new Error('COPILOT_KNOWLEDGE_SOURCE_CLASSIFICATION_TOO_WEAK');
        if (!Array.isArray(input.allowedChannels) || !input.allowedChannels.length) throw new Error('COPILOT_KNOWLEDGE_SOURCE_CHANNEL_SCOPE_REQUIRED');
        if (classification === 'PUBLIC' && (sourceType !== 'PUBLISHED_DOCUMENTATION' || input.public !== true || String(input.lifecycle).toUpperCase() !== 'ONLINE')) throw new Error('COPILOT_PUBLIC_SOURCE_NOT_PUBLISHED');
        if (sourceType === 'CUSTOMER_PROJECT' && (!Array.isArray(input.customerProjectScopes) || !input.customerProjectScopes.length)) throw new Error('COPILOT_CUSTOMER_PROJECT_SCOPE_REQUIRED');
        if (classification === 'CUSTOMER' && (!Array.isArray(input.tenantScopes) || !input.tenantScopes.length || ![input.enterpriseScopes, input.customerScopes, input.customerProjectScopes].some(scopes => Array.isArray(scopes) && scopes.length))) throw new Error('COPILOT_CUSTOMER_SOURCE_SCOPE_REQUIRED');
        if (input.secretScanPolicy !== 'REQUIRED') throw new Error('COPILOT_KNOWLEDGE_SECRET_SCAN_REQUIRED');
        if (input.enabled === true && String(input.version).toUpperCase() === 'UNRESOLVED') throw new Error('COPILOT_KNOWLEDGE_SOURCE_VERSION_UNRESOLVED');
        const normalized = {
            code: String(input.code), repository: String(input.repository), project: String(input.project), module: String(input.module),
            sourceType: sourceType, classification: classification, owner: String(input.owner), version: String(input.version),
            paths: paths, excludedPaths: excludedPaths, allowedExtensions: allowedExtensions,
            limits: {
                maximumFiles: limits.maximumFiles === undefined ? null : Number(limits.maximumFiles),
                maximumFileBytes: limits.maximumFileBytes === undefined ? null : Number(limits.maximumFileBytes),
                maximumSourceBytes: limits.maximumSourceBytes === undefined ? null : Number(limits.maximumSourceBytes)
            },
            public: input.public === true, lifecycle: input.lifecycle ? String(input.lifecycle).toUpperCase() : null,
            allowedChannels: Array.isArray(input.allowedChannels) ? input.allowedChannels.map(value => String(value).toUpperCase()) : [],
            requiredPermissions: Array.isArray(input.requiredPermissions) ? input.requiredPermissions.map(String) : [],
            requiredRoles: Array.isArray(input.requiredRoles) ? input.requiredRoles.map(String) : [],
            requiredGroups: Array.isArray(input.requiredGroups) ? input.requiredGroups.map(String) : [],
            tenantScopes: Array.isArray(input.tenantScopes) ? input.tenantScopes.map(String) : [],
            enterpriseScopes: Array.isArray(input.enterpriseScopes) ? input.enterpriseScopes.map(String) : [],
            customerScopes: Array.isArray(input.customerScopes) ? input.customerScopes.map(String) : [],
            customerProjectScopes: Array.isArray(input.customerProjectScopes) ? input.customerProjectScopes.map(String) : [],
            environmentScopes: Array.isArray(input.environmentScopes) ? input.environmentScopes.map(String) : [],
            secretScanPolicy: 'REQUIRED', refreshPolicy: String(input.refreshPolicy || 'MANUAL'), enabled: input.enabled === true
        };
        return policyService.deepFreeze(normalized);
    },
    /** Builds a unique immutable registry. @param {Object[]} definitions Source definitions. @param {Object} configuration Registry configuration. @param {Object} policyService Policy service. @returns {Object} Registry. */
    createRegistry: function (definitions, configuration, policyService) {
        if (!configuration || configuration.enabled !== true) throw new Error('COPILOT_KNOWLEDGE_SOURCE_REGISTRY_DISABLED');
        if (!policyService || typeof policyService.deepFreeze !== 'function') throw new Error('COPILOT_POLICY_SERVICE_REQUIRED');
        const entries = (definitions || []).map(source => this.normalize(source, configuration, policyService));
        const codes = entries.map(item => item.code);
        if (new Set(codes).size !== codes.length) throw new Error('COPILOT_KNOWLEDGE_SOURCE_DUPLICATED');
        return policyService.deepFreeze({ revision: entries.map(item => item.code + '@' + item.version).sort().join('|'), sources: entries });
    },
    /** Lists only enabled definitions allowed for the current context. @param {Object} registry Registry. @param {Object} securityContext Security context. @param {Object} policyConfiguration Policy configuration. @param {Object} policyService Policy service. @returns {Object[]} Accessible definitions. */
    listAccessible: function (registry, securityContext, policyConfiguration, policyService) {
        if (!registry || !Array.isArray(registry.sources)) throw new Error('COPILOT_KNOWLEDGE_SOURCE_REGISTRY_INVALID');
        return registry.sources.filter(source => source.enabled && policyService.decideSourceAccess(source, securityContext, policyConfiguration).allowed);
    },
    /** Produces a bounded scope that Discovery must apply before retrieval. @param {Object} registry Registry. @param {Object} securityContext Security context. @param {Object} policyConfiguration Policy configuration. @param {Object} policyService Policy service. @returns {Object} Immutable query scope. */
    buildQueryScope: function (registry, securityContext, policyConfiguration, policyService) {
        const sources = this.listAccessible(registry, securityContext, policyConfiguration, policyService);
        return policyService.deepFreeze({
            registryRevision: registry.revision,
            sourceCodes: sources.map(source => source.code),
            classifications: Array.from(new Set(sources.map(source => source.classification))).sort(),
            tenant: securityContext.tenant, enterprise: securityContext.enterprise, customer: securityContext.customer,
            customerProject: securityContext.customerProject, channel: securityContext.channel
        });
    }
};
