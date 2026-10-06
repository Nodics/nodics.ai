/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module dynamo/test/RuntimeActivationConcurrency @description Verifies exact-revision lifecycle, claims, due dates and uncertain acknowledgements with isolated generated persistence. @layer test @owner dynamo */
const test = require('node:test');
const assert = require('node:assert/strict');
const owner = require('../src/service/audit/defaultRuntimeConfigurationActivationRequestService');
const policy = require('../src/service/audit/defaultRuntimeConfigurationActivationPolicyService');

/** Creates tenant-scoped generated persistence and an observable owning runtime. @param {Object} t Test context. @returns {Object} Isolated fixture. */
function fixture(t) {
    const old = {
        SERVICE: global.SERVICE,
        CONFIG: global.CONFIG,
        CLASSES: global.CLASSES,
    };
    const rows = new Map();
    let applied = 0,
        updates = 0,
        lostUpdate = 0;
    const storage = {
        save: async ({ tenant, model }) => {
            const key = tenant + ':' + model.code;
            if (rows.has(key)) throw new Error('duplicate');
            rows.set(key, structuredClone(model));
            return { code: 'SUC_TEST', result: structuredClone(model) };
        },
        get: async ({ tenant, query }) => ({
            code: 'SUC_TEST',
            result: rows.has(tenant + ':' + query.code)
                ? [structuredClone(rows.get(tenant + ':' + query.code))]
                : [],
        }),
        update: async ({ tenant, query, model }) => {
            updates += 1;
            const row = rows.get(tenant + ':' + query.code);
            const matched =
                row &&
                Object.entries(query).every(
                    ([key, value]) => row[key] === value,
                );
            if (matched)
                rows.set(tenant + ':' + query.code, {
                    ...row,
                    ...structuredClone(model),
                });
            if (lostUpdate === updates) throw new Error('lost acknowledgement');
            return {
                code: 'SUC_TEST',
                result: { matchedCount: matched ? 1 : 0 },
            };
        },
    };
    global.CONFIG = { get: () => ({}) };
    global.CLASSES = {
        NodicsError: class extends Error {
            constructor(code, message) {
                super(message || code);
                this.code = code;
            }
        },
    };
    global.SERVICE = {
        DefaultConfigurationActivationRequestService: storage,
        DefaultRuntimeConfigurationPreviewService: {
            previewActivation: async () => ({
                data: {
                    configurationCode: 'config',
                    moduleName: 'system',
                    destructive: true,
                },
            }),
        },
        DefaultRouterConfigurationService: {
            registerRoutersFromDatabase: async (request) => {
                const decision = await policy.resolveApproval(request, {
                    configurationType: 'routerConfiguration',
                    configurationCode: 'config',
                });
                assert.equal(decision.approved, true);
                applied += 1;
                return { applied: true };
            },
        },
    };
    t.after(() => Object.assign(global, old));
    const request = {
        tenant: 'tenant',
        authData: { loginId: 'operator' },
        activationRequest: { activationRequestCode: 'request' },
    };
    return {
        rows,
        request,
        storage,
        applied: () => applied,
        updates: () => updates,
        lose: (value) => {
            lostUpdate = value;
        },
        create: (notBefore) =>
            owner.createActivationRequest({
                ...request,
                activationRequest: {
                    code: 'request',
                    configurationType: 'routerConfiguration',
                    configurationCode: 'config',
                    notBefore,
                },
            }),
        approve: () => owner.approveActivationRequest(request),
    };
}

test('one concurrent decision and one activation win; completed requests cannot replay', async (t) => {
    const f = fixture(t);
    await f.create();
    const approvals = await Promise.allSettled([f.approve(), f.approve()]);
    assert.equal(
        approvals.filter((row) => row.status === 'fulfilled').length,
        1,
    );
    const activations = await Promise.allSettled([
        owner.activateApprovedRequest(f.request),
        owner.activateApprovedRequest(f.request),
    ]);
    assert.equal(
        activations.filter((row) => row.status === 'fulfilled').length,
        1,
    );
    assert.equal(f.applied(), 1);
    const row = f.rows.get('tenant:request');
    assert.equal(row.revision, 3);
    assert.deepEqual(
        row.lifecycle.map((item) => item.status),
        ['REQUESTED', 'APPROVED', 'ACTIVATING', 'ACTIVATED'],
    );
    await assert.rejects(
        () => owner.activateApprovedRequest(f.request),
        /unclaimed/,
    );
    await assert.rejects(
        () => owner.rejectActivationRequest(f.request),
        /pending request/,
    );
});

test('lost claim or final acknowledgement never invokes the owner twice', async (t) => {
    for (const transition of [2, 3]) {
        const f = fixture(t);
        await f.create();
        await f.approve();
        f.lose(transition);
        await assert.rejects(
            () => owner.activateApprovedRequest(f.request),
            /lost acknowledgement/,
        );
        assert.equal(f.applied(), transition === 2 ? 0 : 1);
        const updates = f.updates();
        await assert.rejects(
            () => owner.activateApprovedRequest(f.request),
            /unclaimed/,
        );
        assert.equal(f.updates(), updates);
    }
});

test('future activation, foreign tenant and legacy records fail before dispatch', async (t) => {
    const f = fixture(t);
    for (const invalid of [
        'tomorrow',
        '2026-02-30T00:00:00Z',
        '2026-10-03',
        '2026-10-03T00:00:00+04:00',
    ]) {
        await assert.rejects(() => f.create(invalid), /valid UTC ISO/);
    }
    await f.create('2099-01-01T00:00:00.000Z');
    await f.approve();
    await assert.rejects(
        () => owner.activateApprovedRequest(f.request),
        /not due/,
    );
    await assert.rejects(
        () =>
            owner.activateApprovedRequest({ ...f.request, tenant: 'foreign' }),
        /not found/,
    );
    const row = f.rows.get('tenant:request');
    delete row.notBefore;
    delete row.revision;
    await assert.rejects(
        () => owner.activateApprovedRequest(f.request),
        /legacy requests/,
    );
    assert.equal(f.applied(), 0);
});

test('later-layer claim customization is honored and stale actor/revision is denied', async (t) => {
    const f = fixture(t);
    await f.create();
    await f.approve();
    let observed = 0;
    const custom = {
        ...owner,
        updateRequestState: function (...args) {
            observed += 1;
            return owner.updateRequestState.apply(this, args);
        },
    };
    await custom.activateApprovedRequest(f.request);
    assert.equal(observed, 2);
    const row = f.rows.get('tenant:request');
    row.status = 'ACTIVATING';
    const request = {
        ...f.request,
        runtimeActivationSource: 'approvedRequest',
        trustedRuntimeActivation: true,
        activationRequestCode: 'request',
        activationRevision: row.revision,
    };
    assert.equal(
        (
            await policy.resolveApproval(
                { ...request, activationRevision: 99 },
                row,
            )
        ).approved,
        false,
    );
    assert.equal(
        (
            await policy.resolveApproval(
                { ...request, authData: { loginId: 'other' } },
                row,
            )
        ).approved,
        false,
    );
});

test('scheduled dispatch is bounded, tenant-scoped, opt-in and delegates each due request only once', async (t) => {
    const f = fixture(t);
    const settings = {
        scheduledActivation: { enabled: true, maximumBatch: 2 },
    };
    CONFIG.get = () => settings;
    SERVICE.DefaultRuntimePropertyPersistenceService = {
        policy: () => ({ enabled: true }),
        scope: (request) => {
            assert.equal(request.tenant, 'tenant');
        },
    };
    const due = (code) => ({
        code,
        tenant: 'tenant',
        active: true,
        configurationType: 'propertyConfiguration',
        approvalStatus: 'APPROVED',
        status: 'APPROVED',
        notBefore: '2020-01-01T00:00:00.000Z',
    });
    let rows = [due('first'), due('uncertain')],
        reads = 0;
    f.storage.get = async (request) => {
        reads += 1;
        assert.equal(request.tenant, 'tenant');
        assert.equal(request.query.status, 'APPROVED');
        assert.equal(request.query.configurationType, 'propertyConfiguration');
        assert.ok(request.query.notBefore.$lte instanceof Date);
        assert.equal(request.searchOptions.pageSize, 2);
        return { code: 'SUC_TEST', result: rows };
    };
    const calls = [];
    const service = {
        ...owner,
        activateApprovedRequest: async (request) => {
            calls.push(request.activationRequest.activationRequestCode);
            assert.equal(request.authData.loginId, 'operator');
            if (calls.length === 2)
                throw new Error('secret transport diagnostic');
        },
    };
    const request = {
        tenant: 'tenant',
        authData: f.request.authData,
        httpRequest: { body: {} },
    };
    const result = await service.activateDueRequests(request);
    assert.deepEqual(calls, ['first', 'uncertain']);
    assert.equal(result.data.limited, true);
    assert.equal(result.data.results[1].requiresReview, true);
    assert.equal(JSON.stringify(result).includes('secret'), false);
    assert.equal(
        owner.isDueActivation(new Date('2020-01-01'), result.data.checkedAt),
        true,
    );
    assert.equal(
        owner.isDueActivation(new Date('invalid'), result.data.checkedAt),
        false,
    );
    for (const invalidRows of [
        [due('one'), due('one')],
        [{ ...due('one'), tenant: 'foreign' }],
        [{ ...due('one'), notBefore: '2099-01-01T00:00:00.000Z' }],
        [{ ...due('one'), status: 'ACTIVATING' }],
    ]) {
        rows = invalidRows;
        await assert.rejects(
            () => service.activateDueRequests(request),
            /inventory/,
        );
    }
    assert.equal(calls.length, 2);
    const previousReads = reads;
    await assert.rejects(
        () =>
            service.activateDueRequests({
                ...request,
                httpRequest: { body: { query: {} } },
            }),
        /overrides/,
    );
    await assert.rejects(
        () => service.activateDueRequests({ ...request, authData: {} }),
        /authenticated/,
    );
    settings.scheduledActivation.enabled = false;
    await assert.rejects(
        () => service.activateDueRequests(request),
        /unavailable/,
    );
    assert.equal(reads, previousReads);
});

test('scheduled route preserves exposure and activation permission', () => {
    const routers = require('../../nSystem/src/router/routers');
    const routes = Object.values(routers.system).flatMap((group) =>
        Object.values(group),
    );
    const route = routes.find(
        (item) => item.operation === 'activateDueRuntimeConfigurationRequests',
    );
    assert.ok(route);
    assert.equal(route.secured, true);
    assert.equal(route.permission, 'runtime.config.request.activate');
    assert.equal(route.apiExposure, 'runtimeConfiguration');
    assert.equal(route.key, '/config/runtime/request/activate-due');
    assert.equal(route.method, 'POST');
});

test('scheduled eligibility is rechecked after inventory and malformed lookups cannot claim a request', async (t) => {
    const f = fixture(t);
    await f.create('2020-01-01T00:00:00.000Z');
    await f.approve();
    const row = f.rows.get('tenant:request');
    row.configurationType = 'propertyConfiguration';
    row.active = false;
    await assert.rejects(
        () =>
            owner.activateApprovedRequest({
                ...f.request,
                scheduledActivation: true,
            }),
        /no longer eligible/,
    );
    row.active = true;
    delete row.notBefore;
    await assert.rejects(
        () =>
            owner.activateApprovedRequest({
                ...f.request,
                scheduledActivation: true,
            }),
        /no longer eligible/,
    );
    assert.equal(f.updates(), 1);
    for (const result of [
        { result: [row] },
        { code: 'ERR_READ', result: [row] },
        { code: 'SUC_TEST', result: [row, row] },
        { code: 'SUC_TEST', result: [{ ...row, code: 'foreign' }] },
        { code: 'SUC_TEST', result: [{ ...row, tenant: 'foreign' }] },
    ]) {
        f.storage.get = async () => result;
        await assert.rejects(
            () => owner.resolveActivationRequest(f.request),
            /invalid or unacknowledged/,
        );
    }
    f.storage.get = async () =>
        assert.fail('Invalid identity must fail before storage');
    await assert.rejects(
        () =>
            owner.resolveActivationRequest({
                ...f.request,
                activationRequest: { code: { $ne: null } },
            }),
        /activationRequestCode is required/,
    );
    assert.equal(f.updates(), 1);
});
