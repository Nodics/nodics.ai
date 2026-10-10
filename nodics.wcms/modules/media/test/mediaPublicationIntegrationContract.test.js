/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module media/test/MediaPublicationIntegrationContract @description Verifies authenticated target transport, fixed Process callback scope, explicit graph contribution and read-only retention reconciliation. */
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const transport = require('../src/service/publication/defaultMediaPublicationModuleTransportService');
const controller = require('../src/controller/storage/defaultMediaStorageController');
const facade = require('../src/facade/storage/defaultMediaStorageFacade');
const retained = require('../src/service/publication/defaultMediaRetainedPublicationService');
const cleanup = require('../src/service/storage/defaultMediaCleanupLifecycleService');
const tokenService = require('../../../../nodics.foundation/modules/nAuth/src/service/identity/defaultServiceTokenService');

/** Creates isolated configuration and scoped authenticated runtime fixtures. */
function fixture() {
    const policy = { versionProviderEnabled: true, runtimeRole: 'STAGED',
        target: { connectionName: 'onlineMedia', connectionType: 'abstract', timeoutMs: 1000, maxAttempts: 1 } };
    const auth = { tokenType: 'service', serviceId: 'runtime', entCode: 'enterprise', tenant: 'one',
        runtimeInstanceId: 'source', modules: ['media'], runtimeScope: { instanceCode: 'source',
            projectCode: 'partner', environmentCode: 'local', serverCode: 'staged', assignmentCode: 'media' } };
    global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
    global.CONFIG = { get: key => key === 'media' ? { publication: policy } : undefined };
    global.NODICS = { getInternalAuthToken: () => 'scoped-internal-token' };
    global.SERVICE = { DefaultMediaRetainedPublicationService: retained, DefaultServiceTokenService: tokenService };
    global.FACADE = { DefaultMediaStorageFacade: facade };
    return { policy, context: { tenant: 'one', authData: auth } };
}

test('transport uses explicit remote Media authority and internal token; missing authority and malformed replies fail', async () => {
    const f = fixture();
    const calls = [];
    const version = 'a'.repeat(64);
    const input = { operationKey: 'stable-op', publicationCode: 'pub', expectedVersion: null,
        manifest: { code: version }, manifestCode: version, mediaCode: 'hero' };
    SERVICE.DefaultModuleService = { invokeModule: async request => { calls.push(request);
        const result = request.apiName.endsWith('/status') ? null : request.apiName.endsWith('/reconcile') ?
            { manifestCode: version, mediaCode: 'hero', status: 'ACTIVE', repaired: false, version,
                operationKey: input.operationKey, publicationCode: 'pub',
                receipt: { operationKey: input.operationKey, publicationCode: 'pub', sourceVersion: version, targetVersion: version, previousOnlineVersion: null } } :
            { version, receipt: { operationKey: input.operationKey, publicationCode: 'pub', sourceVersion: version, targetVersion: version, previousOnlineVersion: null } };
        return request.responseSelector({ result });
    } };
    for (const method of ['deploy', 'getStatus', 'rollback', 'reconcile']) {
        await transport[method](input, f.context);
    }
    assert.deepEqual(calls.map(item => item.apiName), ['/publication/target/deploy', '/publication/target/status', '/publication/target/rollback', '/publication/target/reconcile']);
    for (const call of calls) {
        assert.equal(call.moduleName, 'media'); assert.equal(call.local, false);
        assert.deepEqual(call.targetAuthority, { runtimeRole: 'WCMS_ONLINE' });
        assert.equal(call.header.Authorization, 'Bearer scoped-internal-token'); assert.equal(call.header.tenant, 'one');
        assert.equal(call.idempotencyKey, 'stable-op');
    }
    f.policy.target.connectionName = 'default';
    await assert.rejects(transport.getStatus({}, f.context), /explicit/);
    f.policy.target.connectionName = 'onlineMedia'; NODICS.getInternalAuthToken = () => undefined;
    await assert.rejects(transport.getStatus({}, f.context), /runtime token/);
    NODICS.getInternalAuthToken = () => 'token';
    SERVICE.DefaultModuleService.invokeModule = async request => request.responseSelector({ data: 'wrong envelope' });
    await assert.rejects(transport.getStatus({}, f.context), /not acknowledged/);
    f.policy.runtimeRole = 'ONLINE'; await assert.rejects(transport.getStatus({}, f.context));
    for (const operation of ['deploy', 'rollback']) assert.throws(() => transport.validateResult(operation, input, null), /not acknowledged/);
});

test('pointer batches reuse authenticated target status and reject incomplete or foreign acknowledgments', async () => {
    const f = fixture();
    const input = { mediaCodes: ['hero', 'absent'] };
    const valid = { statuses: [{ mediaCode: 'hero', status: { version: 'a'.repeat(64), revision: 1 } },
        { mediaCode: 'absent', status: null }] };
    let calls = 0;
    SERVICE.DefaultModuleService = { invokeModule: async request => {
        calls++;
        assert.equal(request.apiName, '/publication/target/status');
        assert.equal(request.header.Authorization, 'Bearer scoped-internal-token');
        assert.deepEqual(request.requestBody, input);
        return request.responseSelector({ result: valid });
    } };
    assert.deepEqual(await transport.getStatuses(input, f.context), valid);
    assert.equal(calls, 1);
    for (const result of [null, { statuses: [] }, { statuses: [...valid.statuses].reverse() },
        { statuses: [valid.statuses[0], valid.statuses[0]] },
        { statuses: [{ mediaCode: 'hero', status: { version: 'a'.repeat(64), revision: 0 } }, valid.statuses[1]] }]) {
        assert.throws(() => transport.validateResult('getStatus', input, result), /not acknowledged/);
    }
});

test('integrity batches reuse scoped reconciliation and require complete ordered physical evidence', async () => {
    const f = fixture();
    const input = { assets: [{ mediaCode: 'hero', manifestCode: 'a'.repeat(64) }, { mediaCode: 'two', manifestCode: 'b'.repeat(64) }] };
    const valid = { results: input.assets.map(asset => ({ ...asset, intact: true, active: true, protected: true, repaired: false, deleted: false })) };
    SERVICE.DefaultModuleService = { invokeModule: async request => {
        assert.equal(request.apiName, '/publication/target/reconcile');
        assert.equal(request.header.Authorization, 'Bearer scoped-internal-token');
        assert.equal(request.header.tenant, 'one');
        assert.deepEqual(request.requestBody, input);
        return request.responseSelector({ result: valid });
    } };
    assert.deepEqual(await transport.reconcileVersions(input, f.context), valid);
    for (const result of [null, { results: [] }, { results: [...valid.results].reverse() },
        { results: [valid.results[0], valid.results[0]] },
        ...['intact', 'active', 'protected', 'repaired', 'deleted'].map(key => ({ results: [{ ...valid.results[0], [key]: undefined }, valid.results[1]] }))]) {
        assert.throws(() => transport.validateResult('reconcile', input, result), /not acknowledged/);
    }
    assert.doesNotThrow(() => transport.validateResult('reconcile', input, { results: [{ ...valid.results[0], intact: false }, valid.results[1]] }));
});

test('target controller uses trusted request context and target facade rejects human or foreign-tenant credentials', async () => {
    const f = fixture(); f.policy.runtimeRole = 'ONLINE'; let called = 0;
    SERVICE.DefaultMediaPublicationModuleTransportService = { authorize: async command => ({ authorized: true, fingerprint: retained.digest(command) }) };
    SERVICE.DefaultMediaPublicationTargetService = { deploy: async (input, request) => {
        called++; assert.equal(request.tenant, 'one'); assert.equal(request.authData.serviceId, 'runtime');
        assert.equal(request.transactionContext, undefined); return { version: 'exact' };
    } };
    const request = { ...f.context, httpRequest: { body: { tenant: 'other', authData: { serviceId: 'forged' }, transactionContext: { bad: true } } } };
    assert.deepEqual(await controller.deployRetainedPublication(request), { code: 'SUC_SYS_00000', result: { version: 'exact' } });
    await new Promise((resolve, reject) => controller.deployRetainedPublication(request, (error, result) => {
        if (error) return reject(error); assert.equal(result.result.version, 'exact'); resolve();
    }));
    await assert.rejects(controller.deployRetainedPublication({ ...request, authData: { ...f.context.authData, tokenType: 'employee' } }));
    await assert.rejects(controller.deployRetainedPublication({ ...request, tenant: 'other' }));
    await assert.rejects(facade.retainedPublication('remove', {}, f.context));
    assert.equal(called, 2);
});

test('callback fixes Media domain/action scope and forwards original Process handles to shared claimed-decision authority', async () => {
    const f = fixture(); let count = 0;
    SERVICE.DefaultPublicationApprovalCallbackService = { applyDecision: async (request, scope) => {
        count++; assert.deepEqual(scope, { domain: 'media', actionKey: 'media.applyPublicationDecision' });
        assert.equal(request.httpRequest.body.domain, 'forged');
        return { status: 'COMPLETED' };
    } };
    const request = { ...f.context, httpRequest: { body: { domain: 'forged', actionKey: 'cms.applyPublicationDecision' } } };
    assert.equal((await controller.applyPublicationDecision(request)).result.status, 'COMPLETED');
    f.policy.runtimeRole = 'ONLINE'; await assert.rejects(controller.applyPublicationDecision(request));
    assert.equal(count, 1);
});

test('target and callback routes require service tokens; Media Process release is explicit, checksummed and uses completed-task action', () => {
    fixture();
    const routes = require('../src/router/routers').media.storagePolicy;
    for (const key of ['authorizeRetainedPublication', 'deployRetainedPublication', 'retainedPublicationStatus', 'rollbackRetainedPublication', 'reconcileRetainedPublication', 'applyPublicationDecision']) {
        assert.equal(routes[key].secured, true); assert.deepEqual(routes[key].authTokenTypes, ['service']);
        assert.equal(routes[key].permissionConfig, 'authSecurity.internalToken.routePermission');
        assert.equal(routes[key].apiExposure, 'moduleInternal'); assert.equal(routes[key].method, 'POST');
    }
    const props = require('../config/properties');
    assert.equal(props.media.publication.versionProviderEnabled, false);
    assert.equal(props.publish.providers, undefined);
    const release = require('../data/manifest.json').sections.mediaPublicationWorkflow;
    assert.equal(release.selectionPolicy, 'EXPLICIT'); assert.equal(release.destinationRole, 'PROCESS');
    assert.equal(release.installer, 'PROCESS_DEFINITION');
    const [file, checksum] = Object.entries(release.files)[0];
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname, '../data', file))).digest('hex'), checksum);
    const graph = require('../data/' + file).definitions[0];
    const validator = require('../../../../nodics.process/modules/workflow/src/service/designer/defaultProcessGraphValidationService');
    validator.assertValidGraph(graph.graph);
    assert.equal(graph.ownerModule, 'media');
    assert.equal(graph.code, props.publish.approvalWorkflow.domains.media.definitionCode);
    const action = props.process.actionAdapters.definitions['media.applyPublicationDecision'];
    assert.equal(action.remote.requiresCompletedTask, true);
    assert.equal(action.remote.apiName, routes.applyPublicationDecision.key);
    assert.equal(action.remote.runtimeRole, 'WCMS_STAGED');
});

test('same-code forward Media release uses existing installer upgrade and preserves immutable v1 source', async () => {
    fixture();
    const installer = require('../../../../nodics.process/modules/workflow/src/service/definition/defaultProcessDefinitionContributionService');
    const oldPath = path.join(__dirname, 'fixtures/compatibility/mediaPublicationBeforeApproval.js');
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(oldPath)).digest('hex'), '44355063df521b219094703cee293b65df954352e5ced7b77b8b6153acbb5fe9');
    const release = require('../data/manifest.json').sections.mediaPublicationWorkflow;
    assert.equal(release.version, '0.0.1');
    const definition = require('../data/' + Object.keys(release.files)[0]).definitions[0];
    const existing = { ...require(oldPath).definitions[0], status: 'PUBLISHED', currentVersion: 1,
        contributionOwner: 'media', contributionCode: 'media:mediaPublicationWorkflow',
        contributionVersion: '1.0.0', contributionChecksum: 'a'.repeat(64) };
    const before = structuredClone(existing);
    const calls = [];
    SERVICE.DefaultProcessDefinitionLifecycleService = {
        findDefinition: async () => existing,
        prepareNextDraft: async request => calls.push(['draft', request.definitionCode]),
        updateDraft: async request => calls.push(['update', request.processDefinition]),
        publishDraft: async request => { calls.push(['publish', request.definitionCode]); return { data: { version: 2 } }; }
    };
    const contribution = { moduleName: 'media', releaseCode: 'media:mediaPublicationWorkflow', version: '1.0.1', checksum: 'b'.repeat(64) };
    assert.equal((await installer.planDefinition({}, definition, contribution)).action, 'UPDATE');
    assert.equal((await installer.reconcileDefinition({}, definition, contribution)).data.version, 2);
    assert.deepEqual(calls.map(call => call[0]), ['draft', 'update', 'publish']);
    assert.equal(calls[1][1].code, existing.code);
    assert.deepEqual(existing, before);
});

test('successor policy uses native Process access rights and typed rejection guards', () => {
    fixture();
    const runtime = require('../../../../nodics.process/modules/workflow/src/service/operation/defaultProcessRuntimeLifecycleService');
    const definition = require('../data/init-v001/records/process/mediaPublicationWorkflowDefinitionData').definitions[0];
    const policy = { ...definition.policy, ...definition.graph.nodes[1].policy };
    SERVICE.DefaultSecuredRequestPipelineService = {
        isPermissionGranted: (permission, grants) => grants.includes(permission),
        getGrantedPermissions: request => request.authData.permissions,
        getRouteActionAuthorizationConfig: () => ({})
    };
    const instance = { context: { enterpriseCode: 'owner', requestedBy: 'maker@example.invalid' } };
    const request = { tenant: 'one', authData: { tenant: 'one', entCode: 'owner', tokenType: 'access', principalType: 'human',
        principalId: 'different-native-id', loginId: 'maker@example.invalid', permissions: ['publish.lifecycle.approve'] } };
    runtime.assertTaskActor(request, instance, policy);
    request.authData.permissions = [];
    assert.throws(() => runtime.assertTaskActor(request, instance, policy));
    request.authData.permissions = ['publish.lifecycle.approve'];
    request.authData.loginId = 'reviewer@example.invalid';
    runtime.assertTaskActor(request, instance, policy);
    assert.throws(() => runtime.assertTaskActorPolicy(request, instance, policy, { approved: false, reason: '' }));
    assert.throws(() => runtime.assertTaskActorPolicy(request, instance, policy, { approved: false, reason: 'x'.repeat(1001) }));
    runtime.assertTaskActorPolicy(request, instance, policy, { approved: false, reason: 'Not approved for delivery' });
    assert.equal(runtime.taskDecisionContract(policy).kind, 'APPROVAL');
});

test('source authorization binds stored nPublish intent and rejects invented operations before target mutation', async () => {
    const f = fixture();
    const provider = require('../src/service/publication/defaultMediaPublicationVersionProviderService');
    const target = require('../src/service/publication/defaultMediaPublicationTargetService');
    const version = 'a'.repeat(64), previous = 'b'.repeat(64);
    const publication = { code: 'pub', domain: 'media', rootType: 'media', rootCode: 'hero', sourceVersion: version,
        state: 'ACTIVATING', activationOperation: { key: 'stored-key', previousOnlineVersion: previous } };
    SERVICE.DefaultMediaPublicationTargetService = target;
    SERVICE.DefaultMediaPublicationVersionProviderService = provider;
    SERVICE.DefaultPublicationLifecycleService = { get: async request => request.publicationCode === 'pub' ? publication : null };
    SERVICE.DefaultMediaRetainedPublicationService = { ...retained, load: async () => ({ code: version }) };
    const command = { operation: 'deploy', publicationCode: 'pub', sourceVersion: version, manifestCode: version,
        mediaCode: 'hero', operationKey: 'stored-key', expectedVersion: previous };
    assert.equal((await provider.authorizeTarget(command, f.context)).fingerprint, retained.digest(command));
    for (const patch of [{ publicationCode: 'invented' }, { operationKey: 'invented' }, { mediaCode: 'other' },
        { sourceVersion: previous }, { manifestCode: previous }, { expectedVersion: null }, { operation: 'withdraw' }]) {
        await assert.rejects(provider.authorizeTarget({ ...command, ...patch }, f.context));
    }
    for (const state of ['DRAFT', 'PENDING_APPROVAL', 'FAILED', 'ONLINE']) {
        publication.state = state; await assert.rejects(provider.authorizeTarget(command, f.context));
    }
    publication.state = 'ROLLING_BACK'; publication.targetVersion = version; publication.previousOnlineVersion = previous;
    const rollback = { ...command, operation: 'rollback', manifestCode: previous, expectedVersion: version,
        operationKey: 'pub:rollback:' + version + ':' + previous };
    assert.equal((await provider.authorizeTarget(rollback, f.context)).authorized, true);
    await assert.rejects(provider.authorizeTarget({ ...rollback, manifestCode: version }, f.context));
    f.policy.runtimeRole = 'ONLINE';
    f.policy.source = { connectionName: 'stagedMedia', connectionType: 'abstract' };
    SERVICE.DefaultModuleService = { invokeModule: async request => {
        assert.equal(request.apiName, '/publication/authorize-target');
        assert.deepEqual(request.targetAuthority, { runtimeRole: 'WCMS_STAGED' });
        assert.equal(request.header.Authorization, 'Bearer scoped-internal-token');
        return { authorized: true, fingerprint: retained.digest(command) };
    } };
    assert.equal((await transport.authorize(command, f.context)).authorized, true);
    SERVICE.DefaultMediaPublicationModuleTransportService = transport;
    let writes = 0;
    SERVICE.DefaultMediaPublicationTargetService = { deploy: async () => { writes++; } };
    SERVICE.DefaultModuleService.invokeModule = async () => ({ authorized: true, fingerprint: 'forged' });
    await assert.rejects(facade.retainedPublication('deploy', { manifest: { code: version, asset: { code: 'hero' } } }, f.context));
    assert.equal(writes, 0);
    f.policy.source.connectionName = '';
    await assert.rejects(transport.authorize(command, f.context), /explicit/);
});

test('provider reconciliation preserves in-flight identity without targetVersion and transport rejects incomplete recovery evidence', async () => {
    const f = fixture(); const provider = require('../src/service/publication/defaultMediaPublicationVersionProviderService');
    f.policy.targetTransportProvider = 'RecoveryTransport';
    let sent;
    SERVICE.RecoveryTransport = { deploy() {}, rollback() {}, getStatus() {}, reconcile: async input => { sent = input; return { status: 'ACTIVE' }; } };
    const publication = { code: 'pub', rootCode: 'hero', sourceVersion: 'a'.repeat(64), state: 'FAILED',
        activationOperation: { key: 'original-key', previousOnlineVersion: null } };
    await provider.reconcile(publication, f.context);
    assert.equal(sent.manifestCode, publication.sourceVersion); assert.equal(sent.operationKey, 'original-key');
    assert.equal(sent.expectedVersion, null); assert.equal(sent.operation, 'DEPLOY');
    assert.throws(() => transport.validateResult('reconcile', sent, { ...sent, status: 'ACTIVE', repaired: false }), /not acknowledged/);
    assert.throws(() => provider.reconcile({ ...publication, state: 'ACTIVATING', activationOperation: undefined }, f.context), /missing/);
});

test('governed operator entry captures once and delegates fixed-domain publication and approval with safe retries', async () => {
    const f = fixture();
    const provider = require('../src/service/publication/defaultMediaPublicationVersionProviderService');
    const publications = new Map(); const calls = []; let captures = 0;
    const manifest = { code: 'a'.repeat(64), artifacts: { asset: { code: 'hero', versionId: 2, checksum: 'b'.repeat(64) } } };
    SERVICE.DefaultMediaRetainedPublicationService = { ...retained, capture: async identity => {
        captures++; assert.deepEqual(identity, { code: 'hero', versionId: 2 }); return manifest;
    }, load: async () => manifest };
    SERVICE.DefaultMediaPublicationVersionProviderService = provider;
    SERVICE.DefaultPublicationLifecycleService = {
        getWorkflowProvider: () => ({ policy: () => ({ definitionCode: 'mediaPublicationApproval', ownerModule: 'media', requesterBinding: 'NATIVE_ACTOR', reviewNodeCode: 'mediaReview', reviewPermission: 'publish.lifecycle.approve' }),
            assertSource: () => true, target: () => ({ runtimeRole: 'PROCESS', connectionName: 'processServer', connectionType: 'abstract' }) }), getDomainAdapter: () => provider, getVersionProvider: () => provider,
        getRepository: () => ({ get: async code => publications.get(code) }),
        create: async request => { calls.push('create'); assert.equal(request.publication.domain, 'media');
            assert.equal(request.publication.rootType, 'media'); assert.equal(request.publication.sourceVersion, manifest.code);
            const result = { ...request.publication, state: 'STAGED', revision: 1 }; publications.set(result.code, result); return result;
        },
        validate: async request => { calls.push('validate'); assert.equal(request.expectedRevision, 1);
            const result = publications.get(request.publicationCode); Object.assign(result, { state: 'VALIDATED', revision: 2 }); return result; },
        requestApproval: async request => { calls.push('approval');
            const result = publications.get(request.publicationCode);
            assert.equal(request.expectedRevision, result.revision);
            assert.equal(request.httpRequest.headers.authorization, 'Bearer fixture-starter');
            if (result.state === 'VALIDATED') Object.assign(result, { state: 'PENDING_APPROVAL', revision: 3,
                workflowRef: 'publicationApproval-' + 'd'.repeat(64) });
            else assert.equal(result.state, 'PENDING_APPROVAL');
            return result; }
    };
    SERVICE.DefaultMediaLibraryService = require('../src/service/defaultMediaLibraryService');
    SERVICE.DefaultModuleService = { invokeModule: async request => request.responseSelector({ data:
        request.apiName.endsWith('/versions') ? [{ ...require('../data/init-v001/records/process/mediaPublicationWorkflowDefinitionData').definitions[0], definitionCode: 'mediaPublicationApproval', active: true, status: 'PUBLISHED', version: 1 }] :
            { code: 'mediaPublicationApproval', active: true, status: 'PUBLISHED', ownerModule: 'media', currentVersion: 1 } }) };
    FACADE.DefaultMediaLibraryFacade = require('../src/facade/defaultMediaLibraryFacade');
    SERVICE.DefaultSecuredRequestPipelineService = require('../../../../nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService');
    SERVICE.DefaultDatabaseTransactionService = { capabilities: () => ({ multiRecordAtomic: true, contextPropagation: true }) };
    global.UTILS = { createModelName: () => 'MediaModel' };
    global.NODICS.getModels = () => ({ MediaModel: { versioned: true, rawSchema: { versionedReadMode: 'CURRENT' } } });
    SERVICE.DefaultMediaService = { get: async request => {
        assert.equal(request.tenant, 'one'); assert.equal(request.skipcache, true);
        assert.deepEqual(request.query.$or[0], { enterpriseCode: 'owner' });
        return { result: [{ code: 'hero', versionId: 2, checksum: 'b'.repeat(64), active: true, status: 'READY', enterpriseCode: 'owner' }] };
    } };
    const input = { publicationCode: 'media-proof', mediaCode: 'hero', versionId: 2, expectedChecksum: 'b'.repeat(64) };
    const request = { tenant: 'one', authData: { tenant: 'one', entCode: 'owner', tokenType: 'access',
        permissions: ['media.storage.policy.view', 'publish.lifecycle.create', 'publish.lifecycle.validate', 'publish.lifecycle.requestApproval', 'process.instance.start', 'process.definition.read'] },
        httpRequest: { body: input, headers: { authorization: 'Bearer fixture-starter' } } };
    await assert.rejects(controller.createRetainedPublication({ ...request, httpRequest: { body: { ...input, domain: 'forged', sourceVersion: 'forged' } } }));
    const first = await controller.createRetainedPublication(request);
    assert.equal(first.result.state, 'PENDING_APPROVAL');
    assert.equal(first.result.workflowRef, 'publicationApproval-' + 'd'.repeat(64));
    const retried = await controller.createRetainedPublication(request);
    assert.equal(retried.result.revision, 3);
    assert.equal(captures, 1); assert.deepEqual(calls, ['create', 'validate', 'approval', 'approval']);
    for (const patch of [{ versionId: 3 }, { mediaCode: 'other' }]) {
        await assert.rejects(provider.createGoverned({ ...input, ...patch }, request), error => {
            assert.equal(error.code, 'ERR_MED_00023');
            assert.equal(error.mediaPublicationStage, 'INSPECT');
            assert.equal(error.message.includes('retry identity conflict'), false);
            return true;
        });
    }
    assert.deepEqual(calls, ['create', 'validate', 'approval', 'approval']);
    await assert.rejects(controller.createRetainedPublication({ ...request, httpRequest: {
        ...request.httpRequest, body: { ...input, expectedChecksum: 'c'.repeat(64) }
    } }));
    assert.deepEqual(calls, ['create', 'validate', 'approval', 'approval'], 'checksum mismatch must fail before publication effects');
    await assert.rejects(provider.createGoverned({ ...input, publicationCode: 'new-checksum-mismatch', expectedChecksum: 'c'.repeat(64) }, request));
    assert.equal(publications.has('new-checksum-mismatch'), false, 'capture mismatch must never create a publication');
    await assert.rejects(provider.createGoverned({ ...input, expectedChecksum: 'c'.repeat(64) }, request));
    await assert.rejects(controller.createRetainedPublication({ ...request, tenant: 'other' }));
    await assert.rejects(controller.createRetainedPublication({ ...request, authData: f.context.authData }));
    f.policy.runtimeRole = 'ONLINE'; await assert.rejects(controller.createRetainedPublication(request));
    f.policy.runtimeRole = 'STAGED'; SERVICE.DefaultPublicationLifecycleService.getWorkflowProvider = () => null;
    await assert.rejects(controller.createRetainedPublication(request), error => error.code === 'ERR_MED_00023');
    assert.equal(captures, 2);
    const route = require('../src/router/routers').media.storagePolicy.createRetainedPublication;
    assert.deepEqual(route.authTokenTypes, ['access']); assert.equal(route.permission, 'publish.lifecycle.create');
    assert.equal(route.apiExposure, 'mediaManagement'); assert.equal(route.secured, true);
});

test('multipart upload maps one canonical versionId and rejects ambiguous or unsafe versions before facade dispatch', async () => {
    const f = fixture(); const inputs = [];
    FACADE.DefaultMediaStorageFacade = { uploadMedia: async input => { inputs.push(input); return { data: input }; } };
    for (const [value, expected] of [[undefined, undefined], ['0', 0], ['12', 12], [3, 3], [String(Number.MAX_SAFE_INTEGER), Number.MAX_SAFE_INTEGER]]) {
        const result = await controller.uploadMedia({ ...f.context, httpRequest: { body: { versionId: value, tenant: 'forged' }, files: [] } });
        assert.equal(result.data.versionId, expected); assert.equal(result.data.tenant, 'one');
        assert.equal(result.data.authData, f.context.authData);
    }
    for (const value of [['0', '1'], '-1', '1.2', '1e2', '01', ' 1', '', null, {}, Number.MAX_SAFE_INTEGER + 1, '9007199254740992']) {
        await assert.rejects(controller.uploadMedia({ ...f.context, httpRequest: { body: { versionId: value } } }), /nonnegative safe integer/);
    }
    await new Promise(resolve => controller.uploadMedia({ ...f.context, httpRequest: { body: { versionId: ['0'] } } }, error => {
        assert.match(error.message, /nonnegative safe integer/); resolve();
    }));
    assert.equal(inputs.length, 5);
});

test('manifest reconciliation protects retained versions and reports corruption without repair, path leaks or deletion', async () => {
    const f = fixture(); f.policy.runtimeRole = 'ONLINE';
    const code = 'a'.repeat(64); let broken = false;
    SERVICE.DefaultMediaRetainedPublicationService = { ...retained,
        one: async () => ({ code, artifacts: { asset: { code: 'hero' } } }),
        readBytes: async () => { if (broken) throw new Error('/secret/path corrupt'); return Buffer.from('ok'); }
    };
    SERVICE.DefaultMediaPublicationTargetService = { pointer: async () => ({ manifestCode: code }) };
    const input = { mediaCode: 'hero', manifestCode: code };
    let result = await cleanup.reconcileRetainedPublication(input, f.context);
    assert.equal(result.intact, true); assert.equal(result.active, true); assert.equal(result.protected, true);
    broken = true; result = await cleanup.reconcileRetainedPublication(input, f.context);
    assert.equal(result.intact, false); assert.equal(result.repaired, false); assert.equal(result.deleted, false);
    assert.equal(JSON.stringify(result).includes('secret'), false);
    await assert.rejects(cleanup.reconcileRetainedPublication({ ...input, mediaCode: 'other' }, f.context));
});
