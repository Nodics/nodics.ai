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
    const manifest = { code: 'a'.repeat(64), artifacts: { asset: { code: 'hero', versionId: 2 } } };
    SERVICE.DefaultMediaRetainedPublicationService = { ...retained, capture: async identity => {
        captures++; assert.deepEqual(identity, { code: 'hero', versionId: 2 }); return manifest;
    }, load: async () => manifest };
    SERVICE.DefaultMediaPublicationVersionProviderService = provider;
    SERVICE.DefaultPublicationLifecycleService = {
        getWorkflowProvider: () => ({}), getDomainAdapter: () => provider, getVersionProvider: () => provider,
        getRepository: () => ({ get: async code => publications.get(code) }),
        create: async request => { calls.push('create'); assert.equal(request.publication.domain, 'media');
            assert.equal(request.publication.rootType, 'media'); assert.equal(request.publication.sourceVersion, manifest.code);
            const result = { ...request.publication, state: 'STAGED', revision: 1 }; publications.set(result.code, result); return result;
        },
        validate: async request => { calls.push('validate'); assert.equal(request.expectedRevision, 1);
            const result = publications.get(request.publicationCode); Object.assign(result, { state: 'VALIDATED', revision: 2 }); return result; },
        requestApproval: async request => { calls.push('approval'); assert.equal(request.expectedRevision, 2);
            const result = publications.get(request.publicationCode); Object.assign(result, { state: 'PENDING_APPROVAL', revision: 3 }); return result; }
    };
    const input = { publicationCode: 'media-proof', mediaCode: 'hero', versionId: 2, domain: 'forged', sourceVersion: 'forged' };
    const request = { tenant: 'one', authData: { tenant: 'one', tokenType: 'access' }, httpRequest: { body: input } };
    const first = await controller.createRetainedPublication(request);
    assert.equal(first.result.state, 'PENDING_APPROVAL');
    await controller.createRetainedPublication(request);
    assert.equal(captures, 1); assert.deepEqual(calls, ['create', 'validate', 'approval']);
    await assert.rejects(provider.createGoverned({ ...input, versionId: 3 }, request), /retry identity conflict/);
    await assert.rejects(provider.createGoverned({ ...input, mediaCode: 'other' }, request), /retry identity conflict/);
    await assert.rejects(controller.createRetainedPublication({ ...request, tenant: 'other' }));
    await assert.rejects(controller.createRetainedPublication({ ...request, authData: f.context.authData }));
    f.policy.runtimeRole = 'ONLINE'; await assert.rejects(controller.createRetainedPublication(request));
    f.policy.runtimeRole = 'STAGED'; SERVICE.DefaultPublicationLifecycleService.getWorkflowProvider = () => null;
    await assert.rejects(controller.createRetainedPublication(request), /providers are not installed/);
    assert.equal(captures, 1);
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
