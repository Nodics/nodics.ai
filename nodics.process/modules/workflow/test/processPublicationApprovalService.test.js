/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** Validates fixed workflow binding, bounded context, deterministic identity, and replay behavior. */
const assert = require('assert');
class NodicsError extends Error { constructor(code, message) { super(message); this.code = code; } }
global.CLASSES = { NodicsError: NodicsError };
let existing;
let startRequest;
let definition = { code: 'cmsPublicationApproval', status: 'PUBLISHED' };
let definitionInstallCount = 0;
let releaseVersion = require('../../../../nodics.wcms/modules/cms/data/manifest.json').sections.cmsPublicationApproval.version;
let catalogue;
let catalogueRequest;
let installError;
let installRequest;
let tasks = [{ code: 'approval-task', status: 'OPEN' }];
global.SERVICE = {
    DefaultProcessDefinitionService: { get: async () => ({ result: definition ? [definition] : [] }) },
    DefaultDataReleaseService: {
        getCatalogue: async request => { catalogueRequest = request;
            return catalogue || { data: [{ releaseCode: 'cms:cmsPublicationApproval', version: releaseVersion }] }; },
        execute: async request => { installRequest = request;
            if (installError) throw installError;
            definitionInstallCount++; definition = { code: 'cmsPublicationApproval', status: 'PUBLISHED' }; }
    },
    DefaultProcessTaskService: { get: async request => {
        let query = request.query || {};
        let values = [].concat(tasks || []).filter(task => !query.status || !query.status.$in ||
            query.status.$in.includes(task.status));
        return { result: values };
    } },
    DefaultProcessInstanceService: { get: async () => ({ result: existing ? [existing] : [] }) },
    DefaultProcessRuntimeLifecycleService: { startInstance: async request => { startRequest = request;
        return { data: { instance: { code: request.runtimeOperation.instanceCode } } }; } }
};
const service = require('../src/service/operation/defaultProcessPublicationApprovalService');
const request = { tenant: 'default', publicationApproval: { publicationCode: 'home-v2', publicationRevision: 4,
    sourceVersion: '0', tenantCode: 'default', enterpriseCode: 'enterprise-a', environmentCode: 'local',
    profileCode: 'nexus', siteCode: 'site', catalogCode: 'catalog', requestedBy: 'creator-a',
    correlationId: 'correlation-1' } };
(async () => {
    let result = await service.start(request);
    assert.strictEqual(result.data.instance.code, service.instanceCode('home-v2', 4));
    assert.strictEqual(startRequest.runtimeOperation.definitionCode, 'cmsPublicationApproval');
    assert.deepStrictEqual(Object.keys(startRequest.runtimeOperation.context).sort(), ['catalogCode', 'correlationId',
        'enterpriseCode', 'environmentCode', 'profileCode', 'publicationCode', 'publicationRevision', 'requestedBy',
        'siteCode', 'sourceVersion', 'tenantCode'].sort());
    assert.strictEqual(startRequest.runtimeOperation.context.tenantCode, 'default');
    assert.strictEqual(startRequest.runtimeOperation.context.enterpriseCode, 'enterprise-a');
    definition = undefined;
    await service.ensureDefinition(request);
    assert.strictEqual(definitionInstallCount, 1, 'missing mandatory definition must install through nImport');
    assert.strictEqual(catalogueRequest.tenant, request.tenant);
    assert.strictEqual(catalogueRequest.dataType, 'init');
    assert.deepStrictEqual(installRequest.releaseRequest.expectedReleases, { 'cms:cmsPublicationApproval': releaseVersion });
    definition = undefined;
    releaseVersion = '2.3.4';
    await service.ensureDefinition(request);
    assert.strictEqual(installRequest.releaseRequest.expectedReleases['cms:cmsPublicationApproval'], '2.3.4',
        'later manifests must not require another source pin change');
    for (const data of [[], [{ releaseCode: 'other:approval', version: '0.0.1' }],
        [{ releaseCode: 'cms:cmsPublicationApproval' }],
        [{ releaseCode: 'cms:cmsPublicationApproval', version: '0.0.1' },
            { releaseCode: 'cms:cmsPublicationApproval', version: '0.0.2' }]]) {
        definition = undefined;
        catalogue = { data };
        await assert.rejects(service.ensureDefinition(request), /release is unavailable/);
        assert.strictEqual(definitionInstallCount, 2, 'unavailable or ambiguous releases must not execute');
    }
    catalogue = undefined;
    installError = new NodicsError('ERR_IMP_00003', 'Data release changed after selection');
    await assert.rejects(service.ensureDefinition(request), error => error === installError);
    assert.strictEqual(definition, undefined, 'release drift must not be bypassed');
    installError = undefined;
    await service.ensureDefinition(request);
    existing = { code: service.instanceCode('home-v2', 4), status: 'WAITING' };
    let replay = await service.start(request);
    assert.strictEqual(replay.data.replay, true);
    let diagnostic = await service.diagnose({ tenant: 'default', authData: {}, runtimeOperation: {
        publicationCode: 'home-v2', publicationRevision: 4 } });
    assert.strictEqual(diagnostic.data.status, 'WAITING_REVIEWER');
    assert.strictEqual(diagnostic.data.workflowRef, service.instanceCode('home-v2', 4));
    tasks = [{ code: 'approval-task', status: 'OPEN', requiresAssignee: true }];
    diagnostic = await service.diagnose({ tenant: 'default', authData: {}, runtimeOperation: {
        workflowRef: service.instanceCode('home-v2', 4) } });
    assert.strictEqual(diagnostic.data.status, 'TASK_ASSIGNEE_MISSING');
    tasks = [{ code: 'approval-task', status: 'COMPLETED' }];
    diagnostic = await service.diagnose({ tenant: 'default', authData: {}, runtimeOperation: {
        publicationCode: 'home-v2', publicationRevision: 4 } });
    assert.strictEqual(diagnostic.data.status, 'TASK_NOT_ACTIONABLE');
    tasks = [];
    diagnostic = await service.diagnose({ tenant: 'default', authData: {}, runtimeOperation: {
        publicationCode: 'home-v2', publicationRevision: 4 } });
    assert.strictEqual(diagnostic.data.status, 'TASK_REFERENCE_MISSING');
    existing = undefined;
    diagnostic = await service.diagnose({ tenant: 'default', authData: {}, runtimeOperation: {
        publicationCode: 'home-v2', publicationRevision: 4 } });
    assert.strictEqual(diagnostic.data.status, 'TASK_REFERENCE_MISSING');
    definition = undefined;
    diagnostic = await service.diagnose({ tenant: 'default', authData: {}, runtimeOperation: {
        publicationCode: 'home-v2', publicationRevision: 4 } });
    assert.strictEqual(diagnostic.data.status, 'WORKFLOW_DEFINITION_MISSING');
    assert.notStrictEqual(service.instanceCode('home-v2', 4), service.instanceCode('home-v2', 8),
        'a governed resubmission revision must create a distinct approval attempt');
    await assert.rejects(service.start({ publicationApproval: { publicationCode: 'bad code' } }), /request is invalid/);
    console.log('Process publication approval startup validated');
})().catch(error => { console.error(error); process.exit(1); });
