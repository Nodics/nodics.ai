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
global.SERVICE = {
    DefaultProcessDefinitionService: { get: async () => ({ result: definition ? [definition] : [] }) },
    DefaultDataReleaseService: { execute: async () => { definitionInstallCount++; definition = { code: 'cmsPublicationApproval', status: 'PUBLISHED' }; } },
    DefaultProcessTaskService: { get: async () => ({ result: [{ code: 'approval-task', status: 'OPEN' }] }) },
    DefaultProcessInstanceService: { get: async () => ({ result: existing ? [existing] : [] }) },
    DefaultProcessRuntimeLifecycleService: { startInstance: async request => { startRequest = request;
        return { data: { instance: { code: request.runtimeOperation.instanceCode } } }; } }
};
const service = require('../src/service/operation/defaultProcessPublicationApprovalService');
const request = { tenant: 'default', publicationApproval: { publicationCode: 'home-v2', publicationRevision: 4,
    sourceVersion: 'v2', siteCode: 'site', catalogCode: 'catalog', correlationId: 'correlation-1' } };
(async () => {
    let result = await service.start(request);
    assert.strictEqual(result.data.instance.code, service.instanceCode('home-v2', 4));
    assert.strictEqual(startRequest.runtimeOperation.definitionCode, 'cmsPublicationApproval');
    assert.deepStrictEqual(Object.keys(startRequest.runtimeOperation.context).sort(), ['catalogCode', 'correlationId',
        'publicationCode', 'publicationRevision', 'siteCode', 'sourceVersion'].sort());
    definition = undefined;
    await service.ensureDefinition(request);
    assert.strictEqual(definitionInstallCount, 1, 'missing mandatory definition must install through nImport');
    existing = { code: service.instanceCode('home-v2', 4), status: 'WAITING' };
    let replay = await service.start(request);
    assert.strictEqual(replay.data.replay, true);
    assert.notStrictEqual(service.instanceCode('home-v2', 4), service.instanceCode('home-v2', 8),
        'a governed resubmission revision must create a distinct approval attempt');
    await assert.rejects(service.start({ publicationApproval: { publicationCode: 'bad code' } }), /request is invalid/);
    console.log('Process publication approval startup validated');
})().catch(error => { console.error(error); process.exit(1); });
