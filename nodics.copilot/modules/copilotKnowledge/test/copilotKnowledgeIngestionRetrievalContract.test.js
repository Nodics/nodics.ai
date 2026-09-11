/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @module copilotKnowledge/test/copilotKnowledgeIngestionRetrievalContract
 * @description Proves ingestion, indexing, scoped retrieval and negative knowledge access contracts using isolated test state.
 * @layer test
 * @owner copilotKnowledge
 * @override Extend provider fixtures while retaining owner filtering and ingestion/retrieval evidence.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const ingestion = require('../src/service/defaultCopilotKnowledgeIngestionService');
const retrieval = require('../src/service/defaultCopilotKnowledgeRetrievalService');
const repositoryProvider = require('../src/service/defaultCopilotRepositoryKnowledgeSourceProviderService');
const secretInspection = require('../src/service/defaultCopilotKnowledgeSecretInspectionService');
const chunks = require('../src/service/defaultCopilotKnowledgeChunkService');
const registryService = require('../src/service/defaultCopilotKnowledgeSourceRegistryService');
const knowledgeService = require('../src/service/defaultCopilotKnowledgeService');
const knowledgeConfiguration = require('../config/properties').copilot.knowledge;
const policy = require('../../copilotPolicy/src/service/defaultCopilotPolicyService');
const policyConfiguration = require('../../copilotPolicy/config/properties').copilot.policy;
const discoveryBuilder = require('../../../../nodics.discovery/modules/discoveryProjection/src/service/defaultDiscoveryDocumentBuilderService');

test('module lifecycle registers only non-public repository source types with Discovery', async () => {
    const registrations = [];
    global.SERVICE = {
        DefaultDiscoverySourceRegistryService: { register: (ownerType, sourceType, provider) => registrations.push({ ownerType, sourceType, provider }) },
        DefaultCopilotRepositoryKnowledgeSourceProviderService: repositoryProvider
    };
    try {
        await require('../nodics').postInit({});
        assert.deepEqual(registrations.map(item => item.sourceType), ['README', 'AGENTS_CONTRACT', 'LLM_CONTRACT', 'SOURCE_CODE', 'CUSTOMER_PROJECT', 'CURATED_MEMORY']);
        assert.equal(registrations.some(item => item.sourceType === 'PUBLISHED_DOCUMENTATION'), false);
        assert.equal(registrations.every(item => item.ownerType === 'COPILOT_KNOWLEDGE'), true);
    } finally {
        delete global.SERVICE;
    }
});

const source = overrides => Object.assign({
    code: 'framework-readmes', repository: 'test-repository', project: 'nodics', module: 'nodics.copilot', owner: 'nodics.copilot',
    version: 'commit-1', sourceType: 'README', classification: 'INTERNAL', paths: ['**/*.md'],
    allowedChannels: ['AXIS_EMPLOYEE'], requiredPermissions: ['copilot.knowledge.internal.read'],
    secretScanPolicy: 'REQUIRED', enabled: true
}, overrides || {});

test('repository ingestion is bounded, rejects secrets, and projects only safe chunks through Discovery', async t => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-copilot-knowledge-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
    fs.mkdirSync(path.join(root, 'node_modules', 'ignored'), { recursive: true });
    fs.writeFileSync(path.join(root, 'README.md'), '# Nodics\n\nNodics framework overview.');
    fs.writeFileSync(path.join(root, 'docs', 'private.md'), '# Private\n\napi_key="1234567890abcdefghijklmnop"');
    fs.writeFileSync(path.join(root, 'node_modules', 'ignored', 'README.md'), '# Dependency\n\nMust not be indexed.');
    const registryConfig = knowledgeConfiguration.sourceRegistry;
    const normalized = registryService.normalize(source(), registryConfig, policy);
    const system = policy.normalizeSecurityContext({ channel: 'SYSTEM', actor: 'knowledge-indexer', permissions: ['copilot.knowledge.source.manage'] }, policyConfiguration);
    const projected = [];
    const report = await ingestion.ingestSource({
        source: normalized, securityContext: system, policyConfiguration: policyConfiguration,
        configuration: Object.assign({}, knowledgeConfiguration.ingestion, { enabled: true }),
        repositoryRoots: { 'test-repository': root }, indexTenant: 'default', indexVersion: 'test-1'
    }, {
        policyService: policy, sourceProviders: { REPOSITORY: repositoryProvider }, secretInspectionService: secretInspection,
        chunkService: chunks, discoveryDocumentBuilderService: discoveryBuilder,
        discoveryProjectionService: { doSave: async request => projected.push(request.model) }
    });
    assert.equal(report.state, 'PROJECTED');
    assert.equal(report.filesRead, 2);
    assert.equal(report.filesAccepted, 1);
    assert.equal(report.filesRejected, 1);
    assert.deepEqual(report.rejected[0].findingCodes, ['ASSIGNED_SECRET']);
    assert.equal(projected.length, 1);
    assert.equal(projected[0].payload.relativePath, 'README.md');
    assert.equal(projected[0].payload.content.includes('1234567890abcdefghijklmnop'), false);
    assert.equal(projected[0].payload.classification, 'INTERNAL');
});

test('repository provider refuses public source definitions', async () => {
    await assert.rejects(repositoryProvider.read(source({ sourceType: 'PUBLISHED_DOCUMENTATION', classification: 'PUBLIC' }), { repositoryRoots: {}, configuration: knowledgeConfiguration.ingestion }), /COPILOT_PUBLIC_REPOSITORY_SOURCE_FORBIDDEN/);
});

test('repository partitions narrow extensions, exclusions, and file limits without widening global policy', async t => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-copilot-partition-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    fs.mkdirSync(path.join(root, 'src', 'generated'), { recursive: true });
    fs.writeFileSync(path.join(root, 'src', 'allowed.js'), 'module.exports = true;');
    fs.writeFileSync(path.join(root, 'src', 'blocked.ts'), 'export const blocked = true;');
    fs.writeFileSync(path.join(root, 'src', 'generated', 'ignored.js'), 'module.exports = false;');
    const partition = source({
        sourceType: 'SOURCE_CODE', classification: 'RESTRICTED', paths: ['src/**/*.js', 'src/**/*.ts'],
        excludedPaths: ['src/generated'], allowedExtensions: ['.js', '.exe'], limits: { maximumFiles: 2, maximumFileBytes: 128, maximumSourceBytes: 256 }
    });
    const files = await repositoryProvider.read(partition, {
        repositoryRoots: { 'test-repository': root },
        configuration: Object.assign({}, knowledgeConfiguration.ingestion, { maximumFilesPerSource: 10, maximumFileBytes: 1024, maximumSourceBytes: 4096 })
    });
    assert.deepEqual(files.map(file => file.relativePath), ['src/allowed.js']);
    const effective = repositoryProvider.effectiveConfiguration(partition, knowledgeConfiguration.ingestion);
    assert.deepEqual(effective.allowedExtensions, ['.js']);
    assert.equal(effective.maximumFilesPerSource, 2);
    assert.equal(effective.maximumFileBytes, 128);
    assert.equal(effective.maximumSourceBytes, 256);
    assert.equal(repositoryProvider.matchesPattern('modules/core/test', '**/test'), true);
    assert.equal(repositoryProvider.matchesPattern('modules/core/llm/generated', '**/llm/generated'), true);
});

test('retrieval filters before Discovery and reauthorizes every returned result', async () => {
    const registry = registryService.createRegistry([
        source({ code: 'public-docs', repository: 'nodics.docs', sourceType: 'PUBLISHED_DOCUMENTATION', classification: 'PUBLIC', paths: ['online'], public: true, lifecycle: 'ONLINE', allowedChannels: ['NEXUS_PUBLIC', 'AXIS_EMPLOYEE'], requiredPermissions: [] }),
        source(),
        source({ code: 'framework-agents', sourceType: 'AGENTS_CONTRACT', classification: 'RESTRICTED', paths: ['**/AGENTS.md'], requiredPermissions: ['copilot.knowledge.restricted.read'] })
    ], knowledgeConfiguration.sourceRegistry, policy);
    const records = registry.sources.map((item, index) => ({
        score: 1 - index / 10,
        payload: {
            code: item.code + '|chunk-1', sourceCode: item.code, sourceType: item.sourceType, classification: item.classification,
            repository: item.repository, project: item.project, module: item.module, owner: item.owner, relativePath: item.paths[0], version: item.version,
            title: item.code, content: 'Evidence for ' + item.code, contentDigest: 'a'.repeat(64)
        }
    }));
    const searches = [];
    const dependencies = {
        registryService: registryService, policyService: policy, knowledgeService: knowledgeService,
        discoveryRuntimeService: { search: async request => { searches.push(request); return records; } }
    };
    const retrievalConfig = Object.assign({}, knowledgeConfiguration.retrieval, { enabled: true });
    const publicContext = policy.normalizeSecurityContext({ channel: 'NEXUS_PUBLIC' }, policyConfiguration);
    const publicResult = await retrieval.search({ query: 'What is Nodics?', indexTenant: 'default', registry: registry, securityContext: publicContext, policyConfiguration: policyConfiguration, configuration: retrievalConfig, indexConfiguration: { indexName: 'copilotKnowledge' } }, dependencies);
    assert.deepEqual(searches[0].searchQuery.filters['payload.sourceCode.keyword'], ['public-docs']);
    assert.deepEqual(publicResult.evidence.map(item => item.provenance.sourceCode), ['public-docs']);
    assert.equal(publicResult.evidence.some(item => item.provenance.sourceCode === 'framework-agents'), false);
    const axisContext = policy.normalizeSecurityContext({ channel: 'AXIS_EMPLOYEE', actor: 'admin', tenant: 'default', permissions: ['copilot.knowledge.internal.read'] }, policyConfiguration);
    const axisResult = await retrieval.search({ query: 'Explain the framework', indexTenant: 'default', registry: registry, securityContext: axisContext, policyConfiguration: policyConfiguration, configuration: retrievalConfig, indexConfiguration: { indexName: 'copilotKnowledge' } }, dependencies);
    assert.deepEqual(searches[1].searchQuery.filters['payload.sourceCode.keyword'], ['public-docs', 'framework-readmes']);
    assert.deepEqual(axisResult.evidence.map(item => item.provenance.sourceCode), ['public-docs', 'framework-readmes']);
    assert.equal(axisResult.citations.every(item => item.provenance.contentDigest), true);
    assert.equal(axisResult.citations.every(item => item.citationId && item.locator && item.navigationType === 'NONE'), true);
});

test('retrieval does not call Discovery when no source is authorized', async () => {
    const registry = registryService.createRegistry([source()], knowledgeConfiguration.sourceRegistry, policy);
    const publicContext = policy.normalizeSecurityContext({ channel: 'NEXUS_PUBLIC' }, policyConfiguration);
    let called = false;
    const result = await retrieval.search({ query: 'internal details', indexTenant: 'default', registry: registry, securityContext: publicContext, policyConfiguration: policyConfiguration, configuration: Object.assign({}, knowledgeConfiguration.retrieval, { enabled: true }), indexConfiguration: { indexName: 'copilotKnowledge' } }, {
        registryService: registryService, policyService: policy, knowledgeService: knowledgeService,
        discoveryRuntimeService: { search: async () => { called = true; return []; } }
    });
    assert.equal(called, false);
    assert.equal(result.insufficientEvidence, true);
    assert.deepEqual(result.evidence, []);
});
