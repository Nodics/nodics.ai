/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module nPublish/test/publicationSetup @description Exercises complete owner setup, recovery and authority without a runtime. @layer test @owner nPublish */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const base = require('../src/service/defaultPublicationSetupService');

function fixture(t) {
    const previous = { SERVICE: global.SERVICE, CONFIG: global.CONFIG, CLASSES: global.CLASSES };
    t.after(() => { for (const [key, value] of Object.entries(previous)) value === undefined ? delete global[key] : global[key] = value; });
    const rows = [], writes = [], state = { allowed: true, failedRead: false, target: 'digest' };
    const input = { contractVersion: 1, items: ['first', 'second'].map(rootCode => ({
        code: 'setup-' + rootCode, domain: 'partner', rootType: 'record', rootCode, sourceVersion: 'v1',
        input: { publicationCode: 'setup-' + rootCode },
    })) };
    const request = { tenant: 'tenantA', authData: { tenant: 'tenantA', entCode: 'enterpriseA',
        principalId: 'operatorA', principalType: 'human', tokenType: 'access' } };
    const config = { setup: { maximumItems: 10, maximumBytes: 10000, permissions: { partner: 'partner.publish' } },
        providers: { versionProviders: { partner: 'PartnerProvider' }, domainAdapters: { partner: 'Adapter' }, workflowProviders: { partner: 'Workflow' } } };
    global.CONFIG = { get: key => key === 'runtimeRole' ? { publication: 'STAGED' } : key === 'publish' ? config : undefined };
    global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
    global.SERVICE = {
        DefaultSecuredRequestPipelineService: { getGrantedPermissions: () => [], isPermissionGranted: () => state.allowed },
        DefaultPublicationRequestService: { get: async r => state.failedRead ? { code: 'ERR_OWNER_READ', result: [] } :
            { result: rows.filter(row => Object.entries(r.query).every(([key, value]) => row[key] === value)) } },
        PartnerProvider: {
            getVersion() {}, getOnlineVersion: async () => ({ version: state.target }), validateSetup: async () => 'digest',
            isSetupReceiptCommitted: (publication, request, receipt) => receipt?.committed === true,
            prepareSetup: async (r, item) => {
                writes.push(['capture', item.rootCode]);
                const row = { ...item, state: 'STAGED', revision: 0 }; delete row.input;
                rows.push(row); return row;
            },
        },
        DefaultPublicationLifecycleService: {
            get: async r => rows.find(row => row.code === r.publicationCode),
            validate: async r => { const row = rows.find(row => row.code === r.publicationCode); assert.equal(r.expectedRevision, row.revision);
                writes.push(['validate', row.rootCode]); row.state = 'VALIDATED'; row.revision++; return row; },
            requestApproval: async r => { const row = rows.find(row => row.code === r.publicationCode); assert.equal(r.expectedRevision, row.revision);
                writes.push(['requestApproval', row.rootCode]); row.state = 'PENDING_APPROVAL'; row.revision++; row.workflowRef = 'task-' + row.code; return row; },
        },
    };
    const online = index => {
        const item = input.items[index], row = { ...item, state: 'ONLINE', revision: 4, targetVersion: 'digest',
            activationOperation: { key: 'activation-' + item.code }, auditTrail: [{ toState: 'APPROVED' }, { toState: 'ONLINE',
                details: { receipt: { committed: true, operationKey: 'activation-' + item.code,
                    publicationCode: item.code, sourceVersion: item.sourceVersion, targetVersion: 'digest' } } }] };
        delete row.input; rows.push(row); return row;
    };
    return { service: Object.create(base), input, request, rows, writes, state, online, config };
}

test('status inspects every required root without writes and one Online root does not qualify the set', async t => {
    const f = fixture(t); f.online(0);
    const result = await f.service.status(f.request, f.input);
    assert.equal(result.ready, false); assert.deepEqual(result.items.map(row => row.status), ['CURRENT', 'NOT_REQUESTED']);
    assert.deepEqual(f.writes, []);
});
test('submit captures only missing roots and requests existing approvals without approving or activating', async t => {
    const f = fixture(t); f.online(0);
    const result = await f.service.submit(f.request, f.input);
    assert.equal(result.ready, false); assert.equal(result.items[1].status, 'PENDING_APPROVAL');
    assert.deepEqual(f.writes, [['capture', 'second'], ['validate', 'second'], ['requestApproval', 'second']]);
    await f.service.submit(f.request, f.input); assert.equal(f.writes.length, 3);
});
test('source capture response loss resumes original STAGED and VALIDATED requests rather than recapturing', async t => {
    const f = fixture(t);
    for (const item of f.input.items) f.rows.push({ ...item, state: item.rootCode === 'first' ? 'STAGED' : 'VALIDATED', revision: 1 });
    await f.service.submit(f.request, f.input);
    assert.deepEqual(f.writes, [['validate', 'first'], ['requestApproval', 'first'], ['requestApproval', 'second']]);
});
test('ready requires exact approved activation receipt and current owner target for every root', async t => {
    const f = fixture(t); f.online(0); const second = f.online(1);
    assert.equal((await f.service.status(f.request, f.input)).ready, true);
    f.state.target = 'different'; assert.equal((await f.service.status(f.request, f.input)).ready, false);
    f.state.target = 'digest'; second.auditTrail[1].details.receipt.committed = false;
    assert.equal((await f.service.status(f.request, f.input)).ready, false);
});
test('failed reads and ambiguous Online roots reject without treating them as absence', async t => {
    const f = fixture(t); f.state.failedRead = true;
    await assert.rejects(f.service.submit(f.request, f.input), { code: 'ERR_PUB_SETUP_INVALID' });
    f.state.failedRead = false; f.online(0); f.online(0);
    await assert.rejects(f.service.status(f.request, f.input), { code: 'ERR_PUB_SETUP_INVALID' }); assert.deepEqual(f.writes, []);
});
test('scope, role, complete-domain permissions and bounded unique input reject before mutation', async t => {
    const f = fixture(t); f.state.allowed = false;
    await assert.rejects(f.service.submit(f.request, f.input)); f.state.allowed = true;
    await assert.rejects(f.service.submit({ ...f.request, tenant: 'foreign' }, f.input));
    f.input.items.push({ ...f.input.items[0] }); await assert.rejects(f.service.submit(f.request, f.input));
    assert.deepEqual(f.writes, []);
});
test('failed/rejected and uncertain activation requests are not implicitly retried or reapproved', async t => {
    const f = fixture(t);
    f.rows.push(...f.input.items.map(item => ({ ...item, state: 'FAILED', revision: 3 })));
    const result = await f.service.submit(f.request, f.input);
    assert.equal(result.ready, false); assert(result.items.every(row => row.status === 'REVIEW_REQUIRED')); assert.deepEqual(f.writes, []);
});
test('later-layer inspection override is honored and input is detached across an awaited read', async t => {
    const f = fixture(t); let seen;
    f.service.inspect = async (request, item) => { f.input.items[1].rootCode = 'changed'; seen = item.rootCode;
        return { code: item.code, rootCode: item.rootCode, domain: item.domain, status: 'CURRENT' }; };
    assert.equal((await f.service.status(f.request, f.input)).ready, true); assert.equal(seen, 'second');
});

test('setup status and submit refuse service principals and inconsistent signed scope before owner reads', async t => {
    const f = fixture(t);
    let reads = 0;
    global.SERVICE.DefaultPublicationRequestService.get = async () => { reads++; return { result: [] }; };
    for (const change of [
        { tokenType: 'service', principalType: 'service', serviceId: 'runtime',
            runtimeScope: { assignmentCode: 'approved-deployment' }, permissions: ['*'] },
        { tokenType: 'refresh' }, { principalType: 'customer' }, { isSystem: true },
        { principalId: undefined }, { tenant: 'foreign' }, { enterpriseCode: 'foreign' },
    ]) {
        const request = { ...f.request, authData: { ...f.request.authData, ...change } };
        for (const operation of ['status', 'submit'])
            await assert.rejects(f.service[operation](request, f.input), { code: 'ERR_PUB_SETUP_INVALID' });
    }
    for (const change of [{ tenant: 'foreign' }, { enterpriseCode: 'foreign' }, { entCode: 'foreign' }])
        await assert.rejects(f.service.status({ ...f.request, ...change }, f.input), { code: 'ERR_PUB_SETUP_INVALID' });
    assert.equal(reads, 0);
    assert.deepEqual(f.writes, []);
});

test('setup status freshly reads every publication, retained source and target rather than reusing prior CURRENT claims', async t => {
    const f = fixture(t); f.online(0); const second = f.online(1);
    const reads = [], sourceReads = [], targetReads = [];
    const get = global.SERVICE.DefaultPublicationRequestService.get;
    global.SERVICE.DefaultPublicationRequestService.get = async request => {
        assert.equal(request.options.skipItemCache, true);
        assert.equal(request.tenant, f.request.tenant);
        assert.equal(request.authData.principalId, f.request.authData.principalId);
        reads.push(request.query.rootCode);
        return structuredClone(await get(request));
    };
    const provider = global.SERVICE.PartnerProvider;
    const validate = provider.validateSetup, target = provider.getOnlineVersion;
    provider.validateSetup = async (...args) => { sourceReads.push(args[0].rootCode); return validate(...args); };
    provider.getOnlineVersion = async (...args) => { targetReads.push(args[0].rootCode); return target(...args); };
    const prior = await f.service.status(f.request, f.input);
    assert.equal(prior.ready, true);
    second.revision++;
    second.auditTrail[1].details.receipt.operationKey = 'superseded-operation';
    const refreshed = await f.service.status(f.request, f.input);
    assert.equal(refreshed.ready, false);
    assert.equal(refreshed.items[1].revision, second.revision);
    assert.equal(refreshed.items[1].status, 'REVIEW_REQUIRED');
    assert.equal(prior.ready, true);
    for (const values of [reads, sourceReads, targetReads])
        assert.deepEqual(values, ['first', 'second', 'first', 'second']);
    const otherPlan = structuredClone(f.input);
    otherPlan.items[1].sourceVersion = 'v2';
    assert.equal((await f.service.status(f.request, otherPlan)).ready, false);
    assert.deepEqual(f.writes, []);
});

test('foreign or mismatched publication source evidence refuses even when a provider would report CURRENT', async t => {
    const f = fixture(t); const row = f.online(0);
    for (const change of [{ tenantCode: 'foreign' }, { enterpriseCode: 'foreign' },
        { sourceVersion: 'foreign' }, { rootCode: 'foreign' }, { rootType: 'foreign' }, { domain: 'foreign' }]) {
        global.SERVICE.DefaultPublicationRequestService.get = async () => ({ result: [{ ...row, ...change }] });
        await assert.rejects(f.service.status(f.request, f.input), { code: 'ERR_PUB_SETUP_INVALID' });
    }
    assert.deepEqual(f.writes, []);
});

test('existing setup routes keep access-token authority even for read-only status', () => {
    const routes = require('../src/router/routers');
    const security = require('../../nRouter/src/service/request/defaultSecuredRequestPipelineService');
    const entries = Object.values(routes.publish.publicationLifecycle);
    const setup = entries.filter(route => /^\/publications\/setup\/(status|submit)$/.test(route.key || ''));
    assert.equal(setup.length, 2);
    for (const router of setup) {
        assert.equal(router.secured, true);
        assert.deepEqual(router.authTokenTypes, ['access']);
        assert.equal(security.hasAcceptedTokenType({ router, authData: { tokenType: 'service' } }), false);
        assert.equal(security.hasAcceptedTokenType({ router, authData: { tokenType: 'access' } }), true);
    }
});

test('Commerce publisher admission retains granular human permissions and excludes service decisions and recovery', t => {
    fixture(t);
    const lifecycle = require('../src/router/routers').publish.publicationLifecycle;
    const security = Object.assign(Object.create(require('../../nRouter/src/service/request/defaultSecuredRequestPipelineService')),
        { getRouteActionAuthorizationConfig: () => ({ enabled: true, strict: true }) });
    const expected = { setupStatus: 'view', setupSubmit: 'create', create: 'create', get: 'view',
        validate: 'validate', requestApproval: 'requestApproval' };
    for (const [operation, permission] of Object.entries(expected)) {
        const router = lifecycle[operation];
        assert.deepEqual(router.accessGroups, ['runtimeConfigAdminUserGroup', 'commerceSetupPublisherUserGroup']);
        assert.equal(router.permission, 'publish.lifecycle.' + permission);
        assert.deepEqual(router.authTokenTypes, ['access']);
        const request = { router, authData: { tokenType: 'access', userGroups: ['commerceSetupPublisherUserGroup'], permissions: [] } };
        assert.equal(security.hasAccessGroup(request), true);
        assert.equal(security.hasRoutePermission(request), false);
        request.authData.permissions.push(router.permission);
        assert.equal(security.hasRoutePermission(request), true);
        request.authData.userGroups = ['commerceCouponIssuerUserGroup'];
        assert.equal(security.hasAccessGroup(request), false);
    }
    for (const operation of ['approve', 'reject', 'activate', 'retry', 'rollback', 'withdraw']) {
        const router = lifecycle[operation];
        assert.deepEqual(router.accessGroups, ['runtimeConfigAdminUserGroup']);
        assert.equal(security.hasAccessGroup({ router, authData: { userGroups: ['commerceSetupPublisherUserGroup'], permissions: ['*'] } }), false);
    }
    for (const operation of ['approve', 'reject', 'activate'])
        assert.deepEqual(lifecycle[operation].authTokenTypes, ['service']);
});

test('Commerce publisher setup still requires the domain grant and original signed enterprise', async t => {
    const f = fixture(t); f.online(0); f.online(1);
    global.SERVICE.DefaultSecuredRequestPipelineService = require('../../nRouter/src/service/request/defaultSecuredRequestPipelineService');
    f.request.authData.userGroups = ['commerceSetupPublisherUserGroup'];
    f.request.authData.permissions = ['publish.lifecycle.view', 'publish.lifecycle.create', 'publish.lifecycle.validate',
        'publish.lifecycle.requestApproval', 'partner.publish'];
    assert.equal((await f.service.status(f.request, f.input)).ready, true);
    assert.equal((await f.service.submit(f.request, f.input)).ready, true);
    f.request.authData.permissions = f.request.authData.permissions.filter(permission => permission !== 'partner.publish');
    for (const operation of ['status', 'submit'])
        await assert.rejects(f.service[operation](f.request, f.input), { code: 'ERR_PUB_SETUP_INVALID' });
    f.request.authData.permissions.push('partner.publish');
    await assert.rejects(f.service.status({ ...f.request, enterpriseCode: 'foreign' }, f.input), { code: 'ERR_PUB_SETUP_INVALID' });
    assert.deepEqual(f.writes, []);
});
