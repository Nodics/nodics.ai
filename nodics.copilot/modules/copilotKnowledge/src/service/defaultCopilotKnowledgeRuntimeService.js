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
    /** Returns operator-safe assistant knowledge readiness without widening source access. */
    readiness: function () {
        const configuration = this.configuration();
        const knowledge = configuration.knowledge || {};
        const providers = configuration.providers || {};
        const adapters = providers.adapters || {};
        const defaultAdapter = providers.defaultAdapter || providers.adapter || providers.default;
        const enabledAdapters = Object.entries(adapters).filter(entry => entry[1] && entry[1].enabled === true);
        const selectedAdapter = defaultAdapter ? adapters[defaultAdapter] : enabledAdapters[0] && enabledAdapters[0][1];
        const modelConfigured = !!(selectedAdapter && selectedAdapter.model && selectedAdapter.model.name);
        const providerConfigured = !!(selectedAdapter || enabledAdapters.length);
        const retrievalEnabled = knowledge.retrieval && knowledge.retrieval.enabled === true;
        const ingestionEnabled = knowledge.ingestion && knowledge.ingestion.enabled === true;
        const registryConfiguration = knowledge.sourceRegistry || {};
        const blockers = [];
        let registry;
        try {
            registry = this.registry(configuration);
        } catch (error) {
            blockers.push({
                code: 'COPILOT_KNOWLEDGE_REGISTRY_INVALID',
                severity: 'NEEDS_ATTENTION',
                source: 'COPILOT_KNOWLEDGE_SOURCE_REGISTRY',
                action: 'Open Assistant Knowledge',
                message: 'Assistant knowledge source registry is invalid: ' + String(error.code || error.message || 'UNKNOWN'),
                repair: { available: true, operation: 'copilotKnowledge.sourceRegistry.repair',
                    action: 'REPAIR_KNOWLEDGE_SOURCE_REGISTRY', eligibility: 'MANUAL', label: 'Repair knowledge source registry' }
            });
            registry = { sources: [] };
        }
        const sources = registry.sources || [];
        const enabledSources = sources.filter(source => source.enabled === true);
        const reports = enabledSources.map(source => this.state.reports.get(source.code) ||
            { sourceCode: source.code, sourceVersion: source.version, state: 'NOT_INDEXED' });
        const indexed = reports.filter(report => String(report.state) === 'PROJECTED').length;
        const failed = reports.filter(report => String(report.state) === 'FAILED').length;
        const notIndexed = Math.max(0, enabledSources.length - indexed - failed);
        if (knowledge.retrieval && knowledge.retrieval.enabled === true && enabledSources.length === 0) blockers.push({
            code: 'COPILOT_KNOWLEDGE_SOURCES_MISSING',
            severity: 'NEEDS_ATTENTION',
            source: 'COPILOT_KNOWLEDGE_SOURCE_REGISTRY',
            action: 'Open Assistant Knowledge',
            message: 'Assistant retrieval is enabled but no enabled knowledge source is registered.',
            repair: { available: true, operation: 'copilotKnowledge.sourceRegistry.update',
                action: 'REGISTER_KNOWLEDGE_SOURCE', eligibility: 'MANUAL', label: 'Register knowledge source' }
        });
        if (notIndexed > 0) blockers.push({
            code: 'COPILOT_KNOWLEDGE_SOURCES_NOT_INDEXED',
            severity: 'NEEDS_ATTENTION',
            source: 'COPILOT_KNOWLEDGE_INGESTION',
            action: 'Refresh Assistant Knowledge',
            message: 'One or more assistant knowledge sources have not been indexed.',
            repair: { available: true, operation: 'copilotKnowledge.refresh',
                action: 'REFRESH_KNOWLEDGE_SOURCE', eligibility: 'MANUAL', label: 'Refresh knowledge source' }
        });
        if (failed > 0) blockers.push({
            code: 'COPILOT_KNOWLEDGE_SOURCE_INDEX_FAILED',
            severity: 'NEEDS_ATTENTION',
            source: 'COPILOT_KNOWLEDGE_INGESTION',
            action: 'Refresh Assistant Knowledge',
            message: 'One or more assistant knowledge sources failed during indexing.',
            repair: { available: true, operation: 'copilotKnowledge.refresh',
                action: 'RETRY_KNOWLEDGE_SOURCE', eligibility: 'MANUAL', label: 'Retry knowledge indexing' }
        });
        if (retrievalEnabled && !providerConfigured) blockers.push({
            code: 'COPILOT_PROVIDER_NOT_CONFIGURED',
            severity: 'NEEDS_ATTENTION',
            source: 'COPILOT_PROVIDER_CONFIGURATION',
            action: 'Open Assistant configuration',
            message: 'Assistant retrieval is enabled but no Copilot model provider is configured.',
            repair: { available: true, operation: 'copilotProvider.configure',
                action: 'CONFIGURE_COPILOT_PROVIDER', eligibility: 'MANUAL', label: 'Configure Copilot provider' }
        });
        if (retrievalEnabled && providerConfigured && !modelConfigured) blockers.push({
            code: 'COPILOT_MODEL_NOT_CONFIGURED',
            severity: 'NEEDS_ATTENTION',
            source: 'COPILOT_PROVIDER_CONFIGURATION',
            action: 'Open Assistant configuration',
            message: 'Assistant retrieval is enabled but the selected Copilot provider has no configured model.',
            repair: { available: true, operation: 'copilotProvider.configureModel',
                action: 'CONFIGURE_COPILOT_MODEL', eligibility: 'MANUAL', label: 'Configure Copilot model' }
        });
        const businessStatus = blockers.length ? 'NEEDS_ATTENTION' :
            retrievalEnabled && enabledSources.length > 0 ? 'READY' : 'NOT_CONFIGURED';
        return {
            businessStatus: businessStatus,
            enabled: retrievalEnabled,
            retrievalEnabled: retrievalEnabled,
            ingestionEnabled: ingestionEnabled,
            sourceRegistryEnabled: registryConfiguration.enabled === true,
            sourceCount: sources.length,
            enabledSourceCount: enabledSources.length,
            indexedSourceCount: indexed,
            notIndexedSourceCount: notIndexed,
            failedSourceCount: failed,
            lastRefreshAt: this.state.lastRefreshAt,
            providerConfigured: providerConfigured,
            enabledProviderCount: enabledAdapters.length,
            selectedProviderCode: defaultAdapter || (enabledAdapters[0] && enabledAdapters[0][0]),
            modelConfigured: modelConfigured,
            modelName: selectedAdapter && selectedAdapter.model ? selectedAdapter.model.name : undefined,
            blockers: blockers
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
