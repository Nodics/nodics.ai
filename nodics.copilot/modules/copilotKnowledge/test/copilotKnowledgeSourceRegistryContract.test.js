/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const registryService = require('../src/service/defaultCopilotKnowledgeSourceRegistryService');
const knowledgeConfiguration = require('../config/properties').copilot.knowledge.sourceRegistry;
const policy = require('../../copilotPolicy/src/service/defaultCopilotPolicyService');
const policyConfiguration = require('../../copilotPolicy/config/properties').copilot.policy;

const definition = overrides => Object.assign({
    code: 'nodics-public-docs', repository: 'nodics.docs', project: 'nodics', module: 'nodics.docs', owner: 'nodics.docs',
    version: 'main', sourceType: 'PUBLISHED_DOCUMENTATION', classification: 'PUBLIC', paths: ['data/online'],
    public: true, lifecycle: 'ONLINE', allowedChannels: ['NEXUS_PUBLIC', 'NEXUS_CUSTOMER', 'AXIS_EMPLOYEE'],
    secretScanPolicy: 'REQUIRED', enabled: true
}, overrides || {});

test('registry rejects missing classification, weak classification, unpublished public content, and missing secret policy', () => {
    assert.throws(() => registryService.normalize(definition({ classification: undefined }), knowledgeConfiguration, policy), /COPILOT_KNOWLEDGE_SOURCE_INVALID/);
    assert.throws(() => registryService.normalize(definition({ sourceType: 'README' }), knowledgeConfiguration, policy), /COPILOT_KNOWLEDGE_SOURCE_CLASSIFICATION_TOO_WEAK/);
    assert.throws(() => registryService.normalize(definition({ lifecycle: 'STAGED' }), knowledgeConfiguration, policy), /COPILOT_PUBLIC_SOURCE_NOT_PUBLISHED/);
    assert.throws(() => registryService.normalize(definition({ secretScanPolicy: undefined }), knowledgeConfiguration, policy), /COPILOT_KNOWLEDGE_SECRET_SCAN_REQUIRED/);
    assert.throws(() => registryService.normalize(definition({ allowedChannels: [] }), knowledgeConfiguration, policy), /COPILOT_KNOWLEDGE_SOURCE_CHANNEL_SCOPE_REQUIRED/);
    assert.throws(() => registryService.normalize(definition({ code: 'customer-data', sourceType: 'CUSTOMER_PROJECT', classification: 'CUSTOMER', public: false, lifecycle: null, customerProjectScopes: ['acme'] }), knowledgeConfiguration, policy), /COPILOT_CUSTOMER_SOURCE_SCOPE_REQUIRED/);
    assert.throws(() => registryService.normalize(definition({ paths: ['../secrets'] }), knowledgeConfiguration, policy), /COPILOT_KNOWLEDGE_SOURCE_INVALID/);
    assert.throws(() => registryService.normalize(definition({ excludedPaths: ['../secrets'] }), knowledgeConfiguration, policy), /COPILOT_KNOWLEDGE_SOURCE_EXCLUSION_INVALID/);
    assert.throws(() => registryService.normalize(definition({ allowedExtensions: ['js'] }), knowledgeConfiguration, policy), /COPILOT_KNOWLEDGE_SOURCE_EXTENSION_INVALID/);
    assert.throws(() => registryService.normalize(definition({ limits: { maximumFiles: 0 } }), knowledgeConfiguration, policy), /COPILOT_KNOWLEDGE_SOURCE_LIMIT_INVALID/);
    assert.throws(() => registryService.normalize(definition({ version: 'UNRESOLVED' }), knowledgeConfiguration, policy), /COPILOT_KNOWLEDGE_SOURCE_VERSION_UNRESOLVED/);
});

test('registry is immutable, unique, and requires customer-project scope', () => {
    const registry = registryService.createRegistry([definition()], knowledgeConfiguration, policy);
    assert.equal(Object.isFrozen(registry), true);
    assert.equal(Object.isFrozen(registry.sources[0]), true);
    assert.throws(() => registryService.createRegistry([definition(), definition()], knowledgeConfiguration, policy), /COPILOT_KNOWLEDGE_SOURCE_DUPLICATED/);
    assert.throws(() => registryService.normalize(definition({ code: 'customer', sourceType: 'CUSTOMER_PROJECT', classification: 'CUSTOMER', public: false, lifecycle: null }), knowledgeConfiguration, policy), /COPILOT_CUSTOMER_PROJECT_SCOPE_REQUIRED/);
});

test('pre-retrieval scopes expose only sources authorized for the current channel and identity', () => {
    const sources = [
        definition(),
        definition({ code: 'framework-readmes', sourceType: 'README', classification: 'INTERNAL', public: false, lifecycle: null, paths: ['**/README.md'], allowedChannels: ['AXIS_EMPLOYEE'], requiredPermissions: ['copilot.knowledge.internal.read'] }),
        definition({ code: 'framework-agents', sourceType: 'AGENTS_CONTRACT', classification: 'RESTRICTED', public: false, lifecycle: null, paths: ['**/AGENTS.md'], allowedChannels: ['AXIS_EMPLOYEE'], requiredPermissions: ['copilot.knowledge.restricted.read'] }),
        definition({ code: 'acme-project', sourceType: 'CUSTOMER_PROJECT', classification: 'CUSTOMER', public: false, lifecycle: null, project: 'acme', module: 'acme.platform', paths: ['README.md'], allowedChannels: ['NEXUS_CUSTOMER', 'AXIS_EMPLOYEE'], customerProjectScopes: ['acme'], tenantScopes: ['acmeTenant'], customerScopes: ['customer-1'] })
    ];
    const registry = registryService.createRegistry(sources, knowledgeConfiguration, policy);
    const publicContext = policy.normalizeSecurityContext({ channel: 'NEXUS_PUBLIC' }, policyConfiguration);
    const publicScope = registryService.buildQueryScope(registry, publicContext, policyConfiguration, policy);
    assert.deepEqual(publicScope.sourceCodes, ['nodics-public-docs']);
    const axisAdmin = policy.normalizeSecurityContext({ channel: 'AXIS_EMPLOYEE', actor: 'admin', tenant: 'default', permissions: ['copilot.knowledge.internal.read', 'copilot.knowledge.restricted.read'] }, policyConfiguration);
    assert.deepEqual(registryService.buildQueryScope(registry, axisAdmin, policyConfiguration, policy).sourceCodes, ['nodics-public-docs', 'framework-readmes', 'framework-agents']);
    const customer = policy.normalizeSecurityContext({ channel: 'NEXUS_CUSTOMER', actor: 'customer-1', customer: 'customer-1', tenant: 'acmeTenant', customerProject: 'acme' }, policyConfiguration);
    assert.deepEqual(registryService.buildQueryScope(registry, customer, policyConfiguration, policy).sourceCodes, ['nodics-public-docs', 'acme-project']);
});
