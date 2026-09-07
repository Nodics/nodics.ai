/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';

/** @module copilotKnowledge/src/service/defaultCopilotKnowledgeRuntimeService @description Exposes the loader-visible governed entrypoints for configured Copilot knowledge ingestion and authorization-scoped Discovery retrieval. @layer service @owner copilotKnowledge @override Projects may add source definitions and adapters through configuration without bypassing policy or Discovery. */
module.exports = {
    state: { reports: new Map(), lastRefreshAt: null },
    /** Resolves effective Copilot configuration. @returns {Object} Configuration. */
    configuration: function () {
        return CONFIG.get('copilot') || {};
    },
    /** Builds the immutable effective source registry. @param {Object} configuration Copilot configuration. @returns {Object} Registry. */
    registry: function (configuration) {
        const knowledge = (configuration || {}).knowledge || {};
        const registryConfiguration = knowledge.sourceRegistry || {};
        return SERVICE.DefaultCopilotKnowledgeSourceRegistryService.createRegistry(registryConfiguration.definitions || [], registryConfiguration, SERVICE.DefaultCopilotPolicyService);
    },
    /** Normalizes trusted API or service identity context. @param {Object} request Request. @param {Object} configuration Copilot configuration. @returns {Object} Security context. */
    securityContext: function (request, configuration) {
        if (!request || !request.securityContext) throw new Error('COPILOT_SECURITY_CONTEXT_REQUIRED');
        return SERVICE.DefaultCopilotPolicyService.normalizeSecurityContext(request.securityContext, (configuration || {}).policy || {});
    },
    /** Ingests one configured source by code. @param {Object} request System ingestion request. @returns {Promise<Object>} Safe ingestion report. */
    ingest: async function (request) {
        const configuration = this.configuration();
        const knowledge = configuration.knowledge || {};
        const registry = this.registry(configuration);
        const source = registry.sources.find(item => item.code === request.sourceCode);
        if (!source) return Promise.reject(new Error('COPILOT_KNOWLEDGE_SOURCE_NOT_REGISTERED'));
        try {
            const report = await SERVICE.DefaultCopilotKnowledgeIngestionService.ingestSource({
                source: source, securityContext: this.securityContext(request, configuration), policyConfiguration: configuration.policy || {},
                configuration: knowledge.ingestion || {}, repositoryRoots: knowledge.repositoryRoots || {},
                indexTenant: request.indexTenant, indexVersion: request.indexVersion, locale: request.locale,
                authData: request.authData, dryRun: request.dryRun === true
            });
            this.state.reports.set(source.code, Object.assign({}, report, { refreshedAt: new Date().toISOString() }));
            this.state.lastRefreshAt = new Date().toISOString();
            return report;
        } catch (error) {
            this.state.reports.set(source.code, { sourceCode: source.code, state: 'FAILED', failureCode: error.code || error.message || 'COPILOT_KNOWLEDGE_INGESTION_FAILED', refreshedAt: new Date().toISOString() });
            throw error;
        }
    },
    /** Returns only knowledge-source status visible to the authenticated caller. */
    status: function (request) {
        const configuration = this.configuration();
        const knowledge = configuration.knowledge || {};
        const context = this.securityContext(request, configuration);
        const registry = this.registry(configuration);
        const sources = SERVICE.DefaultCopilotKnowledgeSourceRegistryService.listAccessible(registry, context, configuration.policy || {}, SERVICE.DefaultCopilotPolicyService);
        return {
            enabled: knowledge.retrieval && knowledge.retrieval.enabled === true,
            ingestionEnabled: knowledge.ingestion && knowledge.ingestion.enabled === true,
            lastRefreshAt: this.state.lastRefreshAt,
            sources: sources.map(source => Object.assign({
                code: source.code, repository: source.repository, sourceType: source.sourceType,
                classification: source.classification, version: source.version, refreshPolicy: source.refreshPolicy
            }, this.state.reports.get(source.code) || { state: 'NOT_INDEXED' }))
        };
    },
    /** Reindexes one registered source through a bounded service identity after explicit administrator authorization. */
    refresh: function (request) {
        const permissions = request && request.authData && request.authData.permissions || [];
        if (!permissions.includes('*') && !permissions.includes('copilot.knowledge.source.manage')) return Promise.reject(new Error('COPILOT_KNOWLEDGE_REFRESH_FORBIDDEN'));
        const configuration = this.configuration();
        const source = this.registry(configuration).sources.find(item => item.code === request.sourceCode && item.enabled === true);
        if (!source) return Promise.reject(new Error('COPILOT_KNOWLEDGE_SOURCE_NOT_REGISTERED'));
        return this.ingest({
            sourceCode: source.code, indexTenant: request.tenant, indexVersion: source.version, locale: request.locale || 'en',
            securityContext: { channel: 'SYSTEM', actor: 'copilot-knowledge-refresh', principalType: 'SERVICE', permissions: ['copilot.knowledge.source.manage'], environment: configuration.core && configuration.core.environment },
            authData: { isSystem: true, serviceId: 'copilot-knowledge-refresh', requestedBy: request.authData && request.authData.loginId, permissions: ['copilot.knowledge.source.manage'] }
        });
    },
    /** Searches only sources permitted for the trusted caller context. @param {Object} request Retrieval request. @returns {Promise<Object>} Cited evidence context. */
    search: function (request) {
        const configuration = this.configuration();
        const knowledge = configuration.knowledge || {};
        return SERVICE.DefaultCopilotKnowledgeRetrievalService.search({
            query: request.query, size: request.size, indexTenant: request.indexTenant,
            registry: this.registry(configuration), securityContext: this.securityContext(request, configuration),
            policyConfiguration: configuration.policy || {}, configuration: knowledge.retrieval || {},
            indexConfiguration: { indexName: (knowledge.ingestion || {}).indexName || 'discoveryDocumentProjection' },
            authData: request.authData
        });
    }
};
