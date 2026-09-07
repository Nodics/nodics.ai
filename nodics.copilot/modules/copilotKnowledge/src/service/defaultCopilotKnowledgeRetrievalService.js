/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';

/** @module copilotKnowledge/src/service/defaultCopilotKnowledgeRetrievalService @description Executes Discovery retrieval only within a freshly policy-derived source scope, revalidates every result, and returns allowlisted cited evidence. @layer service @owner copilotKnowledge @override Projects may customize ranking or query profiles while preserving pre-query scope and post-query authorization. */
module.exports = {
    /** Resolves loader-visible runtime dependencies while allowing focused test overrides. @param {Object} overrides Dependency overrides. @returns {Object} Dependencies. */
    runtimeDependencies: function (overrides) {
        if (overrides) return overrides;
        return {
            registryService: SERVICE.DefaultCopilotKnowledgeSourceRegistryService,
            policyService: SERVICE.DefaultCopilotPolicyService,
            knowledgeService: SERVICE.DefaultCopilotKnowledgeService,
            discoveryRuntimeService: SERVICE.DefaultDiscoveryRuntimeService
        };
    },
    /** Validates and bounds one retrieval request. @param {Object} request Request. @param {Object} configuration Retrieval configuration. @returns {Object} Normalized input. */
    normalizeRequest: function (request, configuration) {
        const query = String((request || {}).query || '').trim();
        const maximumCharacters = Number((configuration || {}).maximumQueryCharacters || 2000);
        if (!query || query.length > maximumCharacters || !(request && request.indexTenant)) throw new Error('COPILOT_KNOWLEDGE_QUERY_INVALID');
        const requestedSize = Number(request.size || configuration.defaultSize || 10);
        if (!Number.isInteger(requestedSize) || requestedSize < 1) throw new Error('COPILOT_KNOWLEDGE_QUERY_SIZE_INVALID');
        return { query: query, size: Math.min(requestedSize, Number(configuration.maximumSize || 20)), indexTenant: String(request.indexTenant) };
    },
    /** Builds provider-neutral Discovery filters from the policy-produced scope. @param {Object} input Normalized input. @param {Object} scope Authorized scope. @param {Object} configuration Retrieval configuration. @returns {Object} Search request. */
    buildSearchRequest: function (input, scope, configuration) {
        return {
            mode: String(configuration.mode || 'LEXICAL').toUpperCase(), text: input.query,
            fields: (configuration.fields || []).slice(), size: input.size,
            filters: {
                ownerType: 'COPILOT_KNOWLEDGE',
                indexConfigurationCode: configuration.indexConfigurationCode || 'copilotKnowledge',
                'payload.sourceCode.keyword': scope.sourceCodes.slice(),
                'payload.classification.keyword': scope.classifications.slice(),
                'payload.allowedChannels.keyword': scope.channel
            }
        };
    },
    /** Extracts the safe payload from one Discovery record. @param {Object} record Discovery result. @returns {Object} Payload. */
    payload: function (record) {
        return record && record.payload && typeof record.payload === 'object' ? record.payload : {};
    },
    /** Revalidates one result against its current registry definition and security context. @param {Object} record Discovery record. @param {Object} registry Registry. @param {Object} context Security context. @param {Object} policyConfiguration Policy configuration. @param {Object} policy Policy service. @returns {boolean} Authorized result. */
    resultAllowed: function (record, registry, context, policyConfiguration, policy) {
        const payload = this.payload(record);
        const source = registry.sources.find(item => item.code === payload.sourceCode);
        if (!source || source.enabled !== true || (record.ownerType && record.ownerType !== 'COPILOT_KNOWLEDGE') || payload.classification !== source.classification || payload.version !== source.version) return false;
        if (payload.repository !== source.repository || payload.project !== source.project || payload.module !== source.module || payload.owner !== source.owner) return false;
        if (!/^[a-f0-9]{64}$/u.test(String(payload.contentDigest || '')) || !String(payload.code || '').startsWith(source.code + '|')) return false;
        return policy.decideSourceAccess(source, context, policyConfiguration).allowed;
    },
    /** Maps one authorized result to the evidence allowlist. @param {Object} record Discovery record. @param {Object} configuration Retrieval configuration. @returns {Object} Evidence candidate. */
    toEvidence: function (record, configuration) {
        const payload = this.payload(record);
        const maximum = Number(configuration.maximumExcerptCharacters || 4000);
        return {
            id: payload.code,
            title: payload.title,
            excerpt: String(payload.content || '').slice(0, maximum),
            sourceType: payload.sourceType,
            source: [payload.repository, payload.relativePath].filter(Boolean).join(':'),
            score: Number(record.score || record._score || 0),
            provenance: {
                sourceCode: payload.sourceCode, repository: payload.repository, project: payload.project,
                module: payload.module, relativePath: payload.relativePath, version: payload.version,
                contentDigest: payload.contentDigest, classification: payload.classification
            }
        };
    },
    /** Executes an authorized search and builds cited context. @param {Object} request Retrieval request. @param {Object} dependencies Runtime dependencies. @returns {Promise<Object>} Scoped evidence context. */
    search: async function (request, dependencies) {
        dependencies = this.runtimeDependencies(dependencies);
        const configuration = request.configuration || {};
        if (configuration.enabled !== true) throw new Error('COPILOT_KNOWLEDGE_RETRIEVAL_DISABLED');
        const input = this.normalizeRequest(request, configuration);
        const scope = dependencies.registryService.buildQueryScope(request.registry, request.securityContext, request.policyConfiguration || {}, dependencies.policyService);
        if (!scope.sourceCodes.length) return dependencies.policyService.deepFreeze({ queryScope: scope, evidence: [], citations: [], insufficientEvidence: true });
        const searchRequest = this.buildSearchRequest(input, scope, configuration);
        const records = await dependencies.discoveryRuntimeService.search({
            tenant: input.indexTenant, authData: request.authData,
            indexConfiguration: request.indexConfiguration,
            searchQuery: searchRequest,
            searchOptions: { limit: input.size },
            searchService: request.searchService
        });
        const allowed = records.filter(record => this.resultAllowed(record, request.registry, request.securityContext, request.policyConfiguration || {}, dependencies.policyService)).slice(0, input.size);
        const context = dependencies.knowledgeService.buildContext(allowed.map(record => this.toEvidence(record, configuration)), { maximumEvidenceItems: input.size });
        return dependencies.policyService.deepFreeze(Object.assign({ queryScope: scope, insufficientEvidence: context.evidence.length === 0 }, context));
    }
};
