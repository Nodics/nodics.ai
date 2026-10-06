/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module dynamo/test/RuntimePropertyPersistence @description Covers durable approved property commits, recovery, concurrency, tenant isolation and customization using generated-service doubles. @layer test @owner dynamo */
const test = require('node:test');
const assert = require('node:assert/strict');
const _ = require('lodash');
const source = require('../src/service/audit/defaultRuntimePropertyPersistenceService');
const preview = require('../src/service/audit/defaultRuntimeConfigurationPreviewService');

test('runtime property uniqueness is scoped to governed rows and default control-plane scope is unchanged', (t) => {
    const previous = global.ENUMS;
    global.ENUMS = {
        ClassType: Object.fromEntries(
            ['SERVICE', 'FACADE', 'CONTROLLER', 'UTILS'].map((key) => [
                key,
                { key },
            ]),
        ),
    };
    t.after(() => {
        global.ENUMS = previous;
    });
    const schema = require('../src/schemas/schemas').dynamo;
    const value = schema.runtimeConfigurationValue;
    assert.deepEqual(value.tenants, ['default']);
    assert.deepEqual(schema.configurationActivationRequest.tenants, [
        'default',
    ]);
    assert.deepEqual(
        value.indexes.individual.runtimeGovernedPropertyIdentity.options,
        {
            unique: true,
            partialFilterExpression: {
                ownerModule: 'dynamo',
                schemaCode: 'tenantProperties',
            },
        },
    );
    assert.equal(value.router.enabled, false);
});

test('module restoration fails closed when opted-in owner or store is unavailable', async (t) => {
    const f = fixture(t);
    const system = require('../../nSystem/nodics');
    delete SERVICE.DefaultRuntimePropertyPersistenceService;
    await assert.rejects(system.postInit(), /persistence owner is required/);
    SERVICE.DefaultRuntimePropertyPersistenceService = f.owner;
    delete SERVICE.DefaultRuntimeConfigurationValueService;
    await assert.rejects(system.postInit(), /persistence is required/);
    f.config.persistence.enabled = false;
    assert.equal(await system.postInit(), true);
});

/** Creates isolated tenant runtimes and acknowledged generated persistence. @param {Object} t Test context. @returns {Object} Fixture. */
function fixture(t) {
    const old = {
        CONFIG: global.CONFIG,
        SERVICE: global.SERVICE,
        CLASSES: global.CLASSES,
        NODICS: global.NODICS,
    };
    const rows = new Map();
    const config = {
        persistence: {
            requireDurableJournal: true,
            enabled: true,
            maximumChanges: 10,
            maximumBytes: 1048576,
        },
        sensitivePathPatterns: ['secret', 'password'],
    };
    let effective = {
        tenant: { feature: { level: 1 }, unchanged: true },
        other: { feature: { level: 7 } },
    };
    let writes = 0,
        lose = false,
        events = [];
    const owner = { ...source, appliedRevisions: new Map() };
    global.CONFIG = {
        get: (key) =>
            key === 'runtimePropertyGovernance' ? config : undefined,
        getProperties: (tenant) => effective[tenant],
        setProperties: (value, tenant) => {
            effective[tenant] = value;
        },
    };
    global.CLASSES = {
        NodicsError: class extends Error {
            constructor(code, message) {
                super(message || code);
                this.code = code;
            }
        },
    };
    const store = {
        get: async ({ tenant, query }) => ({
            code: 'SUC_TEST',
            result: rows.has(tenant + ':' + query.code)
                ? [_.cloneDeep(rows.get(tenant + ':' + query.code))]
                : [],
        }),
        save: async ({ tenant, model, options }) => {
            assert.equal(options?.insertOnly, true);
            const key = tenant + ':' + model.code;
            if (rows.has(key)) throw new Error('duplicate');
            writes += 1;
            rows.set(key, _.cloneDeep(model));
            if (lose) throw new Error('unknown acknowledgement');
            return { code: 'SUC_TEST', result: _.cloneDeep(model) };
        },
        update: async ({ tenant, query, model }) => {
            const key = tenant + ':' + query.code,
                current = rows.get(key);
            const match =
                current &&
                current.revision === query.revision &&
                Object.entries(query)
                    .filter(([path]) => !['code', 'revision'].includes(path))
                    .every(([path, value]) =>
                        value === null
                            ? _.get(current, path) == null
                            : _.isEqual(_.get(current, path), value),
                    );
            if (match) {
                writes += 1;
                rows.set(key, { ...current, ..._.cloneDeep(model) });
            }
            if (lose) throw new Error('unknown acknowledgement');
            return {
                code: 'SUC_TEST',
                result: { acknowledged: true, matchedCount: match ? 1 : 0 },
            };
        },
    };
    global.SERVICE = {
        DefaultConfigurationBindingService: require('../../nConfig/src/service/defaultConfigurationBindingService'),
        DefaultRuntimeConfigurationValueService: store,
        DefaultRuntimeConfigurationPreviewService: preview,
        DefaultRuntimePropertyPersistenceService: owner,
        DefaultRuntimeConfigurationActivationPolicyService: {
            resolveApproval: async () => ({
                approved: true,
                approvedBy: 'reviewer',
                approvalReason: 'Reviewed change',
            }),
            resolveRequestedBy: (request) => request.authData.code,
        },
        DefaultEventService: {
            publish: async (event) => {
                events.push(event);
                return { code: 'SUC_TEST' };
            },
        },
    };
    global.NODICS = { getActiveTenants: () => ['tenant', 'other'] };
    t.after(() => Object.assign(global, old));
    const request = {
        tenant: 'tenant',
        authData: { code: 'operator' },
        activationRequestCode: 'approved-request',
    };
    return {
        owner,
        rows,
        store,
        request,
        config,
        events,
        writes: () => writes,
        current: () => effective,
        lose: () => {
            lose = true;
        },
        restart: () => {
            effective = {
                tenant: { feature: { level: 1 }, unrelated: 'new default' },
                other: {},
            };
            owner.appliedRevisions = new Map();
        },
        prepare: (configuration) =>
            owner.preview(request, {
                configurationType: 'propertyConfiguration',
                tenant: 'tenant',
                configuration,
            }),
    };
}

test('property read fences preserve approved policy and audit until exact owner release', async (t) => {
    const f = fixture(t);
    const fences = require('../src/service/audit/defaultRuntimePropertyReadFenceService');
    const patch = { feature: { level: 2 } };
    const initial = await f.owner.commit(
        f.request,
        patch,
        await f.prepare(patch),
    );
    f.config.readFence = {
        enabled: true,
        owners: { copilotConversation: true },
    };
    const intent = {
        ownerModule: 'copilotConversation',
        operationCode: 'retention:one',
        revision: initial.data.revision,
    };
    const before = _.cloneDeep([...f.rows.values()][0].governedProperties);
    const held = await fences.acquire(f.request, intent);
    assert.equal(held.ownerModule, intent.ownerModule);
    await assert.rejects(fences.acquire(f.request, intent));
    const next = { feature: { level: 3 } };
    await assert.rejects(
        f.owner.commit(f.request, next, await f.prepare(next)),
        /held by an owner operation/,
    );
    assert.deepEqual([...f.rows.values()][0].governedProperties, before);
    f.restart();
    await f.owner.restore();
    assert.equal(f.current().tenant.feature.level, 2);
    assert.equal((await fences.inspect(f.request, intent)).token, held.token);
    await assert.rejects(
        fences.release(
            f.request,
            intent,
            '00000000-0000-4000-8000-000000000000',
        ),
    );
    f.config.readFence.enabled = false;
    assert.deepEqual(await fences.release(f.request, intent, held.token), {
        released: true,
        revision: intent.revision,
    });
    assert.equal(await fences.inspect(f.request, intent), null);
    await f.owner.commit(f.request, next, await f.prepare(next));
    assert.equal(f.current().tenant.feature.level, 3);
    assert.equal([...f.rows.values()][0].governedProperties.sequence, 2);
});

test('durable mode reaches every governed read and write and fence admission rejects ordinary mode', async (t) => {
    const f = fixture(t);
    const calls = [];
    for (const method of ['get', 'save', 'update']) {
        const original = f.store[method];
        f.store[method] = async (request) => {
            calls.push({ method, mode: request.internalPersistence });
            return original(request);
        };
    }
    const patch = { feature: { level: 2 } };
    const committed = await f.owner.commit(
        f.request,
        patch,
        await f.prepare(patch),
    );
    const fences = require('../src/service/audit/defaultRuntimePropertyReadFenceService');
    const intent = {
        ownerModule: 'copilotConversation',
        operationCode: 'retention:durable',
        revision: committed.data.revision,
    };
    f.config.readFence = {
        enabled: true,
        owners: { copilotConversation: true },
    };
    const held = await fences.acquire(f.request, intent);
    await fences.release(f.request, intent, held.token);
    assert(calls.some((call) => call.method === 'save'));
    assert(calls.some((call) => call.method === 'update'));
    assert(calls.every((call) => call.mode === 'DURABLE_JOURNAL'));
    f.config.persistence.requireDurableJournal = false;
    await assert.rejects(fences.acquire(f.request, intent));
    assert.deepEqual(f.owner.persistenceOptions(), {});
});

test('fences reject missing durable state, unadmitted consumers, altered identity and uncertain acknowledgements', async (t) => {
    const f = fixture(t);
    const fences = require('../src/service/audit/defaultRuntimePropertyReadFenceService');
    const intent = {
        ownerModule: 'copilotConversation',
        operationCode: 'retention:one',
        revision: 'a'.repeat(64),
    };
    await assert.rejects(fences.acquire(f.request, intent));
    f.config.readFence = {
        enabled: true,
        owners: { copilotConversation: true },
    };
    await assert.rejects(fences.acquire(f.request, intent));
    const patch = { feature: { level: 2 } };
    intent.revision = (
        await f.owner.commit(f.request, patch, await f.prepare(patch))
    ).data.revision;
    for (const changed of [
        { ownerModule: 'unadmitted' },
        { ownerModule: ['copilotConversation'] },
        { revision: 'b'.repeat(64) },
        { extra: true },
    ])
        await assert.rejects(
            fences.acquire(f.request, { ...intent, ...changed }),
        );
    const update = f.store.update;
    f.store.update = async (request) => {
        await update(request);
        throw new Error('Lost write acknowledgement');
    };
    await assert.rejects(fences.acquire(f.request, intent));
    f.store.update = update;
    const held = await fences.inspect(f.request, intent);
    assert.ok(held);
    await assert.rejects(
        fences.inspect({ ...f.request, tenant: 'other' }, intent),
    );
    await assert.rejects(
        fences.inspect(
            { ...f.request, authData: { code: 'another-operator' } },
            intent,
        ),
    );
    await assert.rejects(
        fences.inspect(f.request, { ...intent, operationCode: 'different' }),
    );
    await assert.rejects(fences.acquire(f.request, intent));
    assert.equal((await f.owner.read(f.request)).revision, intent.revision);
});

test('atomic commit excludes a fence acquired after its policy refresh', async (t) => {
    const f = fixture(t);
    const fences = require('../src/service/audit/defaultRuntimePropertyReadFenceService');
    const initialPatch = { feature: { level: 2 } };
    const initial = await f.owner.commit(
        f.request,
        initialPatch,
        await f.prepare(initialPatch),
    );
    f.config.readFence = {
        enabled: true,
        owners: { copilotConversation: true },
    };
    const intent = {
        ownerModule: 'copilotConversation',
        operationCode: 'retention:race',
        revision: initial.data.revision,
    };
    const patch = { feature: { level: 3 } };
    const reviewed = await f.prepare(patch);
    const update = f.store.update;
    let held;
    f.store.update = async (request) => {
        if (request.model.governedProperties) {
            held = await fences.acquire(f.request, intent);
        }
        return update(request);
    };
    await assert.rejects(
        f.owner.commit(f.request, patch, reviewed),
        /stale or uncertain/,
    );
    assert.ok(held);
    assert.equal(f.current().tenant.feature.level, 2);
    assert.equal(
        (await f.owner.read(f.request)).propertyReadFence.token,
        held.token,
    );
});

test('concurrent consumers cannot acquire the same revision and contradictory reads/writes stay unknown', async (t) => {
    const f = fixture(t);
    const fences = require('../src/service/audit/defaultRuntimePropertyReadFenceService');
    const patch = { feature: { level: 2 } };
    const receipt = await f.owner.commit(
        f.request,
        patch,
        await f.prepare(patch),
    );
    f.config.readFence = {
        enabled: true,
        owners: { copilotConversation: true },
    };
    const intent = {
        ownerModule: 'copilotConversation',
        operationCode: 'retention:one',
        revision: receipt.data.revision,
    };
    const results = await Promise.allSettled([
        fences.acquire(f.request, intent),
        fences.acquire(f.request, {
            ...intent,
            operationCode: 'retention:two',
        }),
    ]);
    assert.equal(
        results.filter((value) => value.status === 'fulfilled').length,
        1,
    );
    const read = f.store.get;
    f.store.get = async (request) => ({
        ...(await read(request)),
        errors: ['partial'],
    });
    await assert.rejects(f.owner.read(f.request));
    for (const response of [
        { code: 'SUC_TEST', error: 'failed', result: { matchedCount: 1 } },
        { code: 'SUC_TEST', result: { matchedCount: 1, errors: ['partial'] } },
        { code: 'SUC_TEST', result: { matchedCount: 0 } },
        { code: 'SUC_TEST', result: { matchedCount: 1, acknowledged: false } },
    ])
        assert.throws(() => fences.acknowledge(response));
});

test('durable values and audit commit together and restore after restart without touching another tenant', async (t) => {
    const f = fixture(t),
        patch = { feature: { level: 2 } };
    const receipt = await f.owner.commit(
        f.request,
        patch,
        await f.prepare(patch),
    );
    assert.equal(receipt.data.durable, true);
    assert.equal(receipt.data.propagation, 'PUBLISHED');
    assert.equal(f.current().tenant.feature.level, 2);
    assert.equal(f.current().other.feature.level, 7);
    assert.equal(
        [...f.rows.values()][0].governedProperties.audit[0].actor,
        'operator',
    );
    assert.deepEqual(Object.keys(f.events[0].data).sort(), [
        'code',
        'revision',
        'schemaCode',
    ]);
    f.restart();
    await f.owner.restore();
    assert.equal(f.current().tenant.feature.level, 2);
    assert.equal(f.current().tenant.unrelated, 'new default');
});

test('competing or stale reviewed changes cannot replace a committed revision', async (t) => {
    const f = fixture(t),
        patch = { feature: { level: 2 } },
        reviewed = await f.prepare(patch);
    const results = await Promise.allSettled([
        f.owner.commit(f.request, patch, reviewed),
        f.owner.commit(f.request, patch, reviewed),
    ]);
    assert.equal(
        results.filter((value) => value.status === 'fulfilled').length,
        1,
    );
    assert.equal(f.writes(), 1);
    await assert.rejects(
        () => f.owner.commit(f.request, patch, reviewed),
        /stale/,
    );
});

test('uncertain insert does not apply locally or retry; authoritative refresh recovers it', async (t) => {
    const f = fixture(t),
        patch = { feature: { level: 2 } },
        reviewed = await f.prepare(patch);
    f.lose();
    await assert.rejects(
        () => f.owner.commit(f.request, patch, reviewed),
        /unknown acknowledgement/,
    );
    assert.equal(f.writes(), 1);
    assert.equal(f.current().tenant.feature.level, 1);
    await f.owner.refresh(f.request);
    assert.equal(f.current().tenant.feature.level, 2);
});

test('failed publication remains pending and a metadata-only event refreshes another runtime', async (t) => {
    const f = fixture(t),
        patch = { feature: { level: 2 } };
    SERVICE.DefaultEventService.publish = async () => {
        throw new Error('unavailable');
    };
    const result = await f.owner.commit(
        f.request,
        patch,
        await f.prepare(patch),
    );
    assert.equal(result.data.propagation, 'PENDING');
    f.restart();
    const system = require('../../nSystem/src/service/config/defaultConfigurationService');
    await system.handleRuntimeConfigurationChangedEvent({
        ...f.request,
        event: {
            data: {
                schemaCode: 'tenantProperties',
                configuration: { feature: { level: 99 } },
            },
        },
    });
    assert.equal(f.current().tenant.feature.level, 2);
});

test('foreign, malformed, disabled and unavailable storage never produce a ready configuration', async (t) => {
    const f = fixture(t),
        patch = { feature: { level: 2 } };
    await f.owner.commit(f.request, patch, await f.prepare(patch));
    const row = [...f.rows.values()][0];
    row.tenant = 'foreign';
    await assert.rejects(() => f.owner.refresh(f.request), /Invalid persisted/);
    row.tenant = 'tenant';
    row.governedProperties.values[0].path = 'constructor.prototype.permission';
    await assert.rejects(() => f.owner.refresh(f.request), /Invalid persisted/);
    f.config.persistence.enabled = false;
    assert.equal(await f.owner.restore(), true);
    f.config.persistence.enabled = true;
    delete SERVICE.DefaultRuntimeConfigurationValueService;
    await assert.rejects(() => f.owner.restore(), /persistence is required/);
});

test('later-layer methods are used and obsolete reads cannot downgrade a runtime', async (t) => {
    const f = fixture(t);
    let customized = 0;
    f.owner.mergeOverrides = function (...args) {
        customized += 1;
        return source.mergeOverrides.apply(this, args);
    };
    const first = { feature: { level: 2 } };
    await f.owner.commit(f.request, first, await f.prepare(first));
    const stale = await f.owner.read(f.request);
    const second = { feature: { level: 3 } };
    await f.owner.commit(f.request, second, await f.prepare(second));
    assert.equal(customized, 2);
    assert.throws(() => f.owner.apply(f.request, stale), /obsolete/);
    assert.equal(f.current().tenant.feature.level, 3);
});

test('unapproved commits, self-disabling policy and audit overflow fail before a write', async (t) => {
    const f = fixture(t);
    const patch = { feature: { level: 2 } },
        reviewed = await f.prepare(patch);
    SERVICE.DefaultRuntimeConfigurationActivationPolicyService.resolveApproval =
        async () => ({ approved: false });
    await assert.rejects(
        () => f.owner.commit(f.request, patch, reviewed),
        /claimed property approval/,
    );
    SERVICE.DefaultRuntimeConfigurationActivationPolicyService.resolveApproval =
        async () => ({ approved: true, approvedBy: 'reviewer' });
    const bypass = {
        runtimePropertyGovernance: { persistence: { enabled: false } },
    };
    await assert.rejects(
        async () => f.owner.commit(f.request, bypass, await f.prepare(bypass)),
        /deployment configuration/,
    );
    assert.equal(f.writes(), 0);
    f.config.persistence.maximumChanges = 1;
    await f.owner.commit(f.request, patch, await f.prepare(patch));
    const next = { feature: { level: 3 } };
    await assert.rejects(
        async () => f.owner.commit(f.request, next, await f.prepare(next)),
        /audit capacity/,
    );
    assert.equal(f.writes(), 1);
});

test('arrays replace atomically, including empty selection, in previews and durable recovery', async (t) => {
    const f = fixture(t);
    for (const allowed of [['one', 'two'], ['one'], []]) {
        const patch = { knowledge: { allowed } };
        await f.owner.commit(f.request, patch, await f.prepare(patch));
        assert.deepEqual(f.current().tenant.knowledge.allowed, allowed);
    }
    f.restart();
    await f.owner.restore();
    assert.deepEqual(f.current().tenant.knowledge.allowed, []);
});

test('nested arrays cannot smuggle secrets, unsafe keys or non-JSON values into approval', (t) => {
    fixture(t);
    for (const patch of [
        { providers: [{ secret: 'denied' }] },
        JSON.parse('{"providers":[{"__proto__":{"unsafe":true}}]}'),
        { 'feature.level': 2 },
        { entries: [undefined] },
        { entries: [new Date()] },
        { value: Infinity },
    ])
        assert.throws(() => preview.validatePropertyConfiguration(patch));
    const cyclic = { entries: [] };
    cyclic.entries.push(cyclic);
    assert.throws(
        () => preview.validatePropertyConfiguration(cyclic),
        /structural bounds/,
    );
});

test('missing state, damaged audit and overlapping persisted paths fail without applying', async (t) => {
    const f = fixture(t),
        patch = { feature: { level: 2 } };
    await f.owner.commit(f.request, patch, await f.prepare(patch));
    const key = [...f.rows.keys()][0],
        original = _.cloneDeep(f.rows.get(key));
    for (const mutate of [
        (row) => {
            row.governedProperties.audit[0].actor = '';
        },
        (row) => {
            row.governedProperties.audit[0].revision = 'a'.repeat(64);
        },
        (row) => {
            row.governedProperties.sequence += 1;
        },
        (row) => {
            row.governedProperties.values.push({ path: 'feature', value: {} });
        },
    ]) {
        const row = _.cloneDeep(original);
        mutate(row);
        f.rows.set(key, row);
        await assert.rejects(
            () => f.owner.refresh(f.request),
            /Invalid persisted/,
        );
        assert.equal(f.current().tenant.feature.level, 2);
    }
    f.rows.delete(key);
    await assert.rejects(() => f.owner.refresh(f.request), /state is missing/);
});

test('a resolved publisher rejection is pending, not a propagation success', async (t) => {
    const f = fixture(t),
        patch = { feature: { level: 2 } };
    SERVICE.DefaultEventService.publish = async () => ({ code: 'ERR_EVENT' });
    assert.equal(
        (await f.owner.commit(f.request, patch, await f.prepare(patch))).data
            .propagation,
        'PENDING',
    );
});

test('replacing an object with a scalar and back never resurrects removed descendants after restart', async (t) => {
    const f = fixture(t);
    for (const patch of [
        { feature: null },
        { feature: { selected: true } },
        { feature: { selected: false } },
    ]) {
        await f.owner.commit(f.request, patch, await f.prepare(patch));
    }
    assert.deepEqual(f.current().tenant.feature, { selected: false });
    f.restart();
    await f.owner.restore();
    assert.deepEqual(f.current().tenant.feature, { selected: false });
});

test('reviewed deletion persists tombstones and later child updates preserve the deleted subtree boundary', async (t) => {
    const f = fixture(t);
    const remove = {
        $propertyPatch: { version: 1, values: [], missingPaths: ['feature'] },
    };
    const review = await f.prepare(remove);
    assert.deepEqual(review.nextSnapshot.missingPaths, ['feature']);
    await f.owner.commit(f.request, remove, review);
    assert.equal(Object.hasOwn(f.current().tenant, 'feature'), false);
    f.restart();
    await f.owner.restore();
    assert.equal(Object.hasOwn(f.current().tenant, 'feature'), false);
    const patch = { feature: { selected: true } };
    await f.owner.commit(f.request, patch, await f.prepare(patch));
    f.restart();
    await f.owner.restore();
    assert.deepEqual(f.current().tenant.feature, { selected: true });
});

test('rollback prepares a new reviewed inverse including deletion and rejects changed or forged targets', async (t) => {
    const f = fixture(t);
    const patch = { feature: { level: 2 }, introduced: true };
    const receipt = await f.owner.commit(
        f.request,
        patch,
        await f.prepare(patch),
    );
    const inverse = await f.owner.prepareRollback(
        f.request,
        receipt.data.revision,
    );
    assert.equal(f.writes(), 1);
    assert.deepEqual(inverse.$propertyPatch.missingPaths, ['introduced']);
    const forged = _.cloneDeep(inverse);
    forged.$propertyPatch.values[0].value = 99;
    await assert.rejects(() => f.prepare(forged), /recorded evidence/);
    await f.owner.commit(f.request, inverse, await f.prepare(inverse));
    assert.equal(f.writes(), 2);
    f.restart();
    await f.owner.restore();
    assert.equal(f.current().tenant.feature.level, 1);
    assert.equal(Object.hasOwn(f.current().tenant, 'introduced'), false);
    await assert.rejects(
        () => f.owner.prepareRollback(f.request, receipt.data.revision),
        /stale/,
    );
});

test('path commands reject unsafe, secret, overlapping, array-member and non-durable changes before writes', async (t) => {
    const f = fixture(t);
    for (const missingPaths of [
        ['constructor.prototype.x'],
        ['feature', 'feature.level'],
        ['password'],
        ['runtimePropertyGovernance'],
        ['feature', 'feature'],
    ]) {
        await assert.rejects(() =>
            f.prepare({
                $propertyPatch: { version: 1, values: [], missingPaths },
            }),
        );
    }
    f.current().tenant.list = ['one', 'two'];
    await assert.rejects(
        () =>
            f.prepare({
                $propertyPatch: {
                    version: 1,
                    values: [],
                    missingPaths: ['list.0'],
                },
            }),
        /entire array/,
    );
    await assert.rejects(
        () =>
            f.prepare({
                $propertyPatch: {
                    version: 1,
                    values: [{ path: 'list.0', value: 'change' }],
                    missingPaths: [],
                },
            }),
        /entire array/,
    );
    f.current().tenant.connection = { secret: 'must-not-enter-audit' };
    await assert.rejects(
        () =>
            f.prepare({
                $propertyPatch: {
                    version: 1,
                    values: [],
                    missingPaths: ['connection'],
                },
            }),
        /Sensitive properties/,
    );
    f.config.persistence.enabled = false;
    await assert.rejects(
        () =>
            f.prepare({
                $propertyPatch: {
                    version: 1,
                    values: [],
                    missingPaths: ['feature'],
                },
            }),
        /durable persistence/,
    );
    assert.equal(f.writes(), 0);
});

test('rollback request preparation uses the owner and refuses mixed client patches', async (t) => {
    const f = fixture(t);
    const requests = require('../src/service/audit/defaultRuntimeConfigurationActivationRequestService');
    const patch = { feature: { level: 2 } };
    const receipt = await f.owner.commit(
        f.request,
        patch,
        await f.prepare(patch),
    );
    const input = {
        configurationType: 'propertyConfiguration',
        rollbackRevision: receipt.data.revision,
        reason: 'Undo reviewed change',
    };
    const prepared = await requests.prepareRequestPayload(f.request, input);
    assert.equal(
        prepared.configuration.$propertyPatch.rollbackRevision,
        receipt.data.revision,
    );
    assert.equal(input.configuration, undefined);
    await assert.rejects(
        () =>
            requests.prepareRequestPayload(f.request, {
                ...input,
                configuration: patch,
            }),
        /without a caller-supplied patch/,
    );
    assert.equal(f.writes(), 1);
});

test('evidence-only recovery closes a committed claim without replay and rejects mismatched evidence', async (t) => {
    const f = fixture(t);
    const requests = require('../src/service/audit/defaultRuntimeConfigurationActivationRequestService');
    const patch = { feature: { level: 2 } },
        review = await f.prepare(patch);
    const activation = {
        code: f.request.activationRequestCode,
        configurationType: 'propertyConfiguration',
        configuration: patch,
        configurationDigest: requests.createConfigurationDigest(patch),
        preview: review,
        status: 'ACTIVATING',
        approvalStatus: 'APPROVED',
        approvedBy: 'reviewer',
        activatedBy: 'operator',
        revision: 2,
        lifecycle: [],
    };
    let transitions = 0;
    const service = {
        ...requests,
        resolveActivationRequest: async () => _.cloneDeep(activation),
        updateRequestState: async (request, current, change) => {
            assert.equal(current.revision, activation.revision);
            assert.equal(request.authData.code, 'recovery-operator');
            transitions += 1;
            Object.assign(activation, change, {
                revision: activation.revision + 1,
            });
            return _.cloneDeep(activation);
        },
        activateConfiguration: async () => {
            assert.fail('Recovery must never execute configuration');
        },
    };
    const recovery = { ...f.request, authData: { code: 'recovery-operator' } };
    await assert.rejects(
        () => service.reconcilePropertyActivation(recovery),
        /No exact committed/,
    );
    assert.equal(transitions, 0);
    await f.owner.commit(f.request, patch, review);
    const result = await service.reconcilePropertyActivation(recovery);
    assert.equal(result.data.status, 'ACTIVATED');
    assert.equal(result.data.replayed, false);
    await service.reconcilePropertyActivation(recovery);
    assert.equal(transitions, 1);
    assert.equal(f.writes(), 1);
    activation.activatedBy = 'different';
    await assert.rejects(
        () => service.reconcilePropertyActivation(recovery),
        /No exact committed/,
    );
    activation.activatedBy = 'operator';
    activation.preview.nextSnapshot.values[0].value = 99;
    await assert.rejects(
        () => service.reconcilePropertyActivation(recovery),
        /No exact committed/,
    );
    await assert.rejects(
        () =>
            service.reconcilePropertyActivation({ ...recovery, authData: {} }),
        /authenticated recovery/,
    );
});

test('two runtime application watermarks restore tombstones and reject out-of-order refreshes', async (t) => {
    const f = fixture(t);
    const otherNode = { ...source, appliedRevisions: new Map() };
    const patch = { feature: { level: 2 } };
    await f.owner.commit(f.request, patch, await f.prepare(patch));
    const stale = await otherNode.refresh(f.request);
    const remove = {
        $propertyPatch: { version: 1, values: [], missingPaths: ['feature'] },
    };
    await f.owner.commit(f.request, remove, await f.prepare(remove));
    await otherNode.refresh(f.request);
    assert.throws(() => otherNode.apply(f.request, stale), /obsolete/);
    assert.equal(Object.hasOwn(f.current().tenant, 'feature'), false);
    assert.equal(f.writes(), 2);
});
