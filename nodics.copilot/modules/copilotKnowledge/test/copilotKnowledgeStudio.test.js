/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';

/** @module copilotKnowledge/test/copilotKnowledgeStudio @description Proves authorized inventory, preview non-mutation and tenant/version diagnostics using real registry and policy owners. @layer test @owner copilotKnowledge */
const test = require('node:test');
const assert = require('node:assert/strict');
const runtime = require('../src/service/defaultCopilotKnowledgeRuntimeService');
const registry = require('../src/service/defaultCopilotKnowledgeSourceRegistryService');
const policy = require('../../copilotPolicy/src/service/defaultCopilotPolicyService');
const defaults = require('../config/properties').copilot;
const policyDefaults = require('../../copilotPolicy/config/properties').copilot.policy;

/** Installs isolated framework dependencies and preserves process globals. @param {Object} t Test context. @returns {Object} Fixture. */
function fixture(t) {
    const previous = { SERVICE: global.SERVICE, CLASSES: global.CLASSES };
    t.after(() => { global.SERVICE = previous.SERVICE; global.CLASSES = previous.CLASSES; });
    const configuration = structuredClone(defaults);
    configuration.policy = policyDefaults;
    configuration.knowledge.ingestion.enabled = true;
    configuration.knowledge.sourceRegistry.definitions = [{
        code: 'allowed-source', repository: 'repo', project: 'project', module: 'module', owner: 'module',
        version: 'v2', sourceType: 'README', classification: 'INTERNAL', paths: ['README.md'],
        allowedChannels: ['EMPLOYEE'], requiredPermissions: ['copilot.knowledge.internal.read'],
        enterpriseScopes: ['enterprise-a'], secretScanPolicy: 'REQUIRED', enabled: true
    }];
    const calls = [];
    global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
    global.SERVICE = {
        DefaultCopilotKnowledgeSourceRegistryService: registry,
        DefaultCopilotPolicyService: policy,
        DefaultCopilotKnowledgeIngestionService: { ingestSource: async request => {
            calls.push(request);
            return { sourceVersion: request.source.version, state: request.dryRun ? 'PREPARED' : 'PROJECTED',
                filesRead: 2, filesAccepted: 1, filesRejected: 1, chunksProjected: 3, rejected: [{ relativePath: 'private-path', findingCodes: ['SECRET'] }] };
        } }
    };
    const service = { ...runtime, configuration: () => configuration, state: { reports: new Map(), lastRefreshAt: null } };
    const context = { channel: 'EMPLOYEE', actor: 'employee', tenant: 'tenant-a', enterprise: 'enterprise-a',
        permissions: ['copilot.knowledge.internal.read', 'copilot.knowledge.source.manage'] };
    const request = { tenant: context.tenant, sourceCode: 'allowed-source', securityContext: context, authData: { loginId: context.actor } };
    return { service, configuration, request, calls };
}

test('management cannot bypass source scope and denied sources are not read', async t => {
    const f = fixture(t);
    for (const patch of [{ enterprise: 'other' }, { permissions: ['copilot.knowledge.source.manage'] }, { channel: 'SYSTEM' }]) {
        const denied = { ...f.request, securityContext: { ...f.request.securityContext, ...patch } };
        await assert.rejects(f.service.preview(denied));
        assert.throws(() => f.service.refresh(denied));
    }
    assert.equal(f.calls.length, 0);
    await assert.rejects(f.service.preview({ ...f.request, tenant: 'other' }), { code: 'ERR_CPK_00004' });
    assert.deepEqual(f.service.inventory({ ...f.request, securityContext: { ...f.request.securityContext, enterprise: 'other' } }).sources, []);
});
test('source schedule surface is owner-declared, default-disabled and requires current source management', t => {
    const f = fixture(t);
    assert.equal(f.service.inventory(f.request).sourceSchedules, null);
    f.configuration.knowledge.studio.sourceScheduleDraftsEnabled = true;
    assert.deepEqual(f.service.inventory(f.request).sourceSchedules, { ownerModule: 'cronjob', enabled: true });
    f.request.securityContext.permissions = ['copilot.knowledge.internal.read'];
    assert.equal(f.service.inventory(f.request).sourceSchedules, null);
    assert.equal(f.calls.length, 0);
});

test('cleanup control requires both grants and never offers writer takeover', async t => {
    const f = fixture(t);
    f.configuration.knowledge.generationPublication.enabled = true;
    let inspectionRequired = false;
    SERVICE.DefaultCopilotKnowledgePublicationService = { inspect: async () => ({ state: 'PROJECTED', evidence: 'DURABLE_GENERATION', indexedVersion: 'v2', refreshedAt: null, cleanupPending: true, inspectionRequired }) };
    assert.equal((await f.service.inventory(f.request)).sources[0].canCleanup, false);
    f.request.securityContext.permissions.push('copilot.knowledge.cleanup.execute');
    assert.equal((await f.service.inventory(f.request)).sources[0].canCleanup, true);
    inspectionRequired = true;
    assert.equal((await f.service.inventory(f.request)).sources[0].canCleanup, false);
    inspectionRequired = false;
    f.request.securityContext.permissions = ['copilot.knowledge.internal.read', 'copilot.knowledge.cleanup.execute'];
    assert.equal((await f.service.inventory(f.request)).sources[0].canCleanup, false);
});

test('refresh rechecks the original employee and configured index binding before publication', async t => {
    const f = fixture(t);
    SERVICE.DefaultCopilotKnowledgeIngestionService.ingestSource = async request => {
        request.assertCurrent();
        f.request.securityContext.permissions = ['copilot.knowledge.internal.read'];
        request.assertCurrent();
    };
    await assert.rejects(f.service.refresh(f.request), { code: 'ERR_CPK_00012' });
    f.request.securityContext.permissions.push('copilot.knowledge.source.manage');
    SERVICE.DefaultCopilotKnowledgeIngestionService.ingestSource = async request => {
        request.assertCurrent();
        f.configuration.knowledge.ingestion.indexName = 'changed-index';
        request.assertCurrent();
    };
    await assert.rejects(f.service.refresh(f.request), { code: 'ERR_CPK_00012' });
});

test('retrieval freshness checks visible sources only, but denies current revocation or routing changes', async t => {
    const f = fixture(t);
    f.configuration.knowledge.sourceRegistry.definitions.push({
        ...f.configuration.knowledge.sourceRegistry.definitions[0],
        code: 'hidden-source', enterpriseScopes: ['other'],
    });
    let change = () => {};
    SERVICE.DefaultCopilotKnowledgeRetrievalService = { search: async request => {
        request.assertCurrent();
        change();
        request.assertCurrent();
        return { evidence: [] };
    } };
    const request = { ...f.request, indexTenant: f.request.tenant, query: 'question' };
    assert.deepEqual(await f.service.search(request), { evidence: [] });
    change = () => { f.configuration.knowledge.sourceRegistry.definitions[0].enabled = false; };
    await assert.rejects(f.service.search(request), { code: 'ERR_CPK_00014' });
    f.configuration.knowledge.sourceRegistry.definitions[0].enabled = true;
    change = () => { f.configuration.knowledge.retrieval.indexConfigurationCode = 'changed'; };
    await assert.rejects(f.service.search(request), { code: 'ERR_CPK_00014' });
});

test('durable inventory is discarded when management configuration changes during the index probe', async t => {
    const f = fixture(t);
    f.configuration.knowledge.generationPublication = { enabled: true };
    SERVICE.DefaultCopilotKnowledgePublicationService = { inspect: async () => {
        f.configuration.knowledge.ingestion.indexName = 'new-index';
        return { state: 'PROJECTED', evidence: 'DURABLE_GENERATION' };
    } };
    await assert.rejects(f.service.inventory(f.request), { code: 'ERR_CPK_00014' });
});

test('dashboard durable status probes only its bounded authorized window and ignores process reports', async t => {
    const f = fixture(t);
    f.configuration.knowledge.generationPublication = { enabled: true };
    f.configuration.knowledge.sourceRegistry.definitions.push({ ...f.configuration.knowledge.sourceRegistry.definitions[0], code: 'second' });
    const inspected = [];
    SERVICE.DefaultCopilotKnowledgePublicationService = { inspect: async (_request, source) => {
        inspected.push(source.code);
        return { state: 'PROJECTED', evidence: 'DURABLE_GENERATION', refreshedAt: '2026-10-03T00:00:00.000Z', inspectionRequired: true, cleanupPending: false };
    } };
    const result = await f.service.status({ ...f.request, statusLimit: 1 });
    assert.deepEqual(inspected, ['allowed-source']);
    assert.equal(result.hasMore, true);
    assert.equal(result.sources[0].state, 'PROJECTED');
    assert.equal(result.sources[0].evidence, 'DURABLE_GENERATION');
    assert.equal(result.sources[0].inspectionRequired, true);
    assert.equal(result.lastRefreshAt, '2026-10-03T00:00:00.000Z');
    await assert.rejects(f.service.status({ ...f.request, statusLimit: 101 }));
});

test('preview returns safe counts without changing successful status or index mode', async t => {
    const f = fixture(t);
    await f.service.refresh(f.request);
    const before = JSON.stringify([...f.service.state.reports]);
    const lastRefreshAt = f.service.state.lastRefreshAt;
    const result = await f.service.preview(f.request);
    assert.equal(result.chunksPrepared, 3);
    assert.equal(f.calls.at(-1).dryRun, true);
    assert.equal(JSON.stringify([...f.service.state.reports]), before);
    assert.equal(f.service.state.lastRefreshAt, lastRefreshAt);
    assert.doesNotMatch(JSON.stringify(result), /private-path|findingCodes|authData/);
    global.SERVICE.DefaultCopilotKnowledgeIngestionService.ingestSource = async () => { throw new Error('private-provider-message'); };
    await assert.rejects(f.service.preview(f.request), { code: 'ERR_CPK_00012' });
    assert.equal(JSON.stringify([...f.service.state.reports]), before);
});

test('inventory respects tenant status, version drift, disabled state and customized bounds', async t => {
    const f = fixture(t);
    const source = f.configuration.knowledge.sourceRegistry.definitions[0];
    const key = f.service.reportKey('tenant-a', source.code);
    f.service.state.reports.set(key, { state: 'PROJECTED', sourceVersion: 'v1', refreshedAt: '2026-10-02T00:00:00.000Z' });
    assert.equal(f.service.inventory(f.request).sources[0].status.state, 'STALE');
    assert.equal(f.service.inventory({ ...f.request, securityContext: { ...f.request.securityContext, tenant: 'tenant-b' } }).sources[0].status.state, 'UNKNOWN');
    source.enabled = false;
    assert.equal(f.service.inventory(f.request).sources[0].canPreview, false);
    f.configuration.knowledge.sourceRegistry.definitions.push({ ...source, code: 'second-source' });
    f.configuration.knowledge.studio.maximumSources = 1;
    const limited = f.service.inventory(f.request);
    assert.equal(limited.hasMore, true);
    assert.equal(limited.sources.length, 1);
    assert.equal(f.calls.length, 0);
    const second = f.service.inventory({ ...f.request, query: { page: '2' } });
    assert.equal(second.page, 2);
    assert.equal(second.sources[0].code, 'second-source');
    assert.equal(second.hasMore, false);
    source.enterpriseScopes = ['other'];
    assert.equal(f.service.inventory(f.request).sources[0].code, 'second-source');
    assert.equal(f.service.inventory({ ...f.request, query: { page: '2' } }).sources.length, 0);
    for (const page of [0, -1, '1.5', '01', 1001, {}]) assert.throws(() => f.service.inventory({ ...f.request, query: { page } }));
    f.configuration.knowledge.studio.maximumSources = 101;
    assert.throws(() => f.service.inventory(f.request), { code: 'ERR_CPK_00011' });
});

test('failed refresh diagnostics contain no raw provider failure and do not cross tenants', async t => {
    const f = fixture(t);
    global.SERVICE.DefaultCopilotKnowledgeIngestionService.ingestSource = async () => { throw new Error('secret-host-token'); };
    await assert.rejects(f.service.refresh(f.request));
    assert.doesNotMatch(JSON.stringify([...f.service.state.reports]), /secret-host-token/);
    assert.equal(f.service.inventory(f.request).sources[0].status.state, 'FAILED');
    assert.equal(f.service.status({ ...f.request, securityContext: { ...f.request.securityContext, tenant: 'tenant-b' } }).lastRefreshAt, null);
});
