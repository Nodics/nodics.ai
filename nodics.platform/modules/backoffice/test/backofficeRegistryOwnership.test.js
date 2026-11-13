/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module backoffice/test/BackofficeRegistryOwnership
 * @description Exercises atomic functional and schema ownership admission with isolated memory and distributed replicas.
 * @layer test
 * @owner backoffice
 * @override Store customizations must preserve these concurrency, scope, expiry and failure invariants.
 */
const assert = require('node:assert/strict');
const test = require('node:test');
const storeDefinition = require('../src/service/registry/defaultBackofficeRegistryStoreService');
const registryDefinition = require('../src/service/registry/defaultBackofficeRegistryService');
const contracts = require('../src/service/contract/defaultBackofficeContractService');

/** In-process provider double: EVAL executes without yielding, as one atomic Redis command. */
function provider() {
    const records = new Map();
    let conflicts = 0;
    const read = key => {
        const record = records.get(key);
        if (!record || record.expiresAt <= Date.now()) { records.delete(key); return null; }
        return record.value;
    };
    return {
        records,
        get conflicts() { return conflicts; },
        get: async key => read(key),
        del: async key => records.delete(key) ? 1 : 0,
        mGet: async keys => keys.map(read),
        scanIterator: async function* ({ MATCH }) {
            for (const key of [...records.keys()]) if (key.startsWith(MATCH.slice(0, -1)) && read(key)) yield key;
        },
        eval: async (script, { keys, arguments: args }) => {
            if (script.includes('-- backoffice-registry-admission')) {
                assert(script.includes('redis.call("GET", KEYS[2])'));
                assert(script.includes('redis.call("SET", KEYS[1], ARGV[2], "PX", ARGV[3])'));
                if (args[0] !== '*' && (read(keys[1]) || '') !== args[0]) { conflicts++; return 0; }
                records.set(keys[0], { value: args[1], expiresAt: Date.now() + Number(args[2]) });
                records.set(keys[1], { value: args[3], expiresAt: Infinity });
                return 1;
            }
            const value = read(keys[0]);
            if (!value) return 0;
            if (String(JSON.parse(value).expiresAt) !== args[0]) return -1;
            records.delete(keys[0]);
            return 1;
        },
    };
}

function fixture(mode) {
    const previousSource = global.NODICS?.getRawModule;
    global.NODICS = {...global.NODICS, getRawModule: name => name === 'cms'
        ? {metaData: {nodics: {runtime: {ownership: 'functional'}}}} : previousSource?.(name)};
    const client = provider();
    const instances = new Map();
    const config = { leaseTtlMs: 30000, allowedSchemes: ['http'],
        store: { mode, moduleName: 'backoffice', engineName: 'redis', keyPrefix: 'test:registry:' } };
    global.CONFIG = { get: key => key === 'backofficeRegistry' ? config : undefined };
    global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
    global.SERVICE = {
        DefaultCacheEngineService: { getEngineClient: () => client },
        DefaultBackofficeContractService: contracts,
        DefaultBackofficeAuditService: { record: async () => true },
    };
    function replica() {
        const store = { ...storeDefinition, _instances: instances, _metrics: { ...storeDefinition._metrics } };
        const registry = { ...registryDefinition, _store: store,
            _metrics: { registrations: 0, renewals: 0, rejected: 0, deregistrations: 0 },
            refreshRuntimeRegistrySnapshot: async () => true };
        return { store, registry };
    }
    function request(server, instance = server, publication = 'ONLINE', overrides = {}) {
        const { project = 'project', environment = 'local', role = server.toUpperCase(), ...body } = overrides;
        return {
            body: { moduleName: 'cms', canonicalIdentity: 'cms', displayName: 'CMS', instanceId: instance,
                clientCallable: true, endpoint: body.clientCallable === false ? undefined : 'http://localhost:4300', ...body },
            authData: { tokenType: 'service', runtimeInstanceId: instance, modules: [body.moduleName || 'cms'],
                runtimeScope: { assignmentCode: 'approved', projectCode: project, environmentCode: environment,
                    serverCode: server, instanceCode: instance } },
            _runtimeCoordinates: { runtimeRole: { code: role, publication } },
        };
    }
    return { client, replica, request };
}

for (const mode of ['memory', 'distributed']) {
    test(`${mode}: concurrent distinct servers admit one owner; same-server replicas and renewals survive`, async () => {
        const f = fixture(mode);
        const a = f.replica(), b = f.replica();
        const results = await Promise.allSettled([
            a.registry.register(f.request('a')), b.registry.register(f.request('b')),
        ]);
        assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
        const loser = results.find(result => result.status === 'rejected');
        assert.match(loser.reason.message, /Duplicate functional module owner/);
        const winner = (await a.store.values())[0].value.server;
        await Promise.all(Array.from({ length: 16 }, (_, i) => (i % 2 ? a : b).registry.register(
            f.request(winner, 'replica-' + i, 'ONLINE', { role: 'DIFFERENT_LABEL' }))));
        await a.registry.register(f.request(winner, 'replica-0'));
        assert.equal((await a.store.values()).length, 17);
        if (mode === 'distributed') assert(f.client.conflicts > 0, 'must exercise revision contention, not sequential writes');
    });

    test(`${mode}: publication, project and environment scope ownership; loaded source creates no owner`, async () => {
        const f = fixture(mode), a = f.replica(), b = f.replica();
        await a.registry.register(f.request('online'));
        await b.registry.register(f.request('staged', 'staged', 'STAGED'));
        await b.registry.register(f.request('operational', 'operational', 'OPERATIONAL'));
        for (const publication of ['ONLINE', 'STAGED', 'OPERATIONAL']) {
            await assert.rejects(b.registry.register(f.request('other', 'other-' + publication, publication)), /Duplicate functional/);
        }
        await b.registry.register(f.request('otherProject', 'online', 'ONLINE', { project: 'other' }));
        await b.registry.register(f.request('otherEnvironment', 'online', 'ONLINE', { environment: 'qa' }));
        await b.registry.register(f.request('source', 'online', undefined, { moduleName: 'sourceHelper', canonicalIdentity: 'sourceHelper', clientCallable: false, capabilities: ['schema', 'service'], authorityClaims: [] }));
        const sourceWithoutContext = f.request('anotherSource', 'source-2', 'ONLINE', { moduleName: 'sourceHelper', canonicalIdentity: 'sourceHelper', clientCallable: false });
        delete sourceWithoutContext._runtimeCoordinates;
        await b.registry.register(sourceWithoutContext);
        for (const publication of [undefined, '', 'UNKNOWN']) {
            const invalid = f.request('missing', 'missing');
            invalid._runtimeCoordinates.runtimeRole.publication = publication;
            await assert.rejects(b.registry.register(invalid), /explicit project, environment, module and publication/);
        }
        assert.equal((await a.store.values()).length, 7);
        await a.registry.deregister({ params: { instanceId: 'online' }, authData: f.request('online').authData });
        assert.equal((await a.store.values()).length, 6, 'drain cannot delete matching replica IDs in other signed scopes');
        await b.registry.register(f.request('replacement'));
    });

    test(`${mode}: default materialized schema and service claims coexist across publication, never across same-context servers`, async () => {
        const f = fixture(mode), a = f.replica();
        const agent = require('../../../../nodics.foundation/modules/nService/src/service/module/defaultModuleRegistrationAgentService');
        const materialized = { rawSchema: { cmsPage: { model: true, service: { enabled: true } } } };
        const claims = agent.buildAuthorityClaims('cms', materialized);
        assert.deepEqual(claims.map(claim => [claim.kind, claim.claimName, claim.authorityContext]), [
            ['schema', 'cmsPage', 'cms.cmsPage'], ['service', 'cmsPage', 'cms.cmsPage'],
        ]);
        await Promise.all([
            a.registry.register(f.request('online', 'online', 'ONLINE', { clientCallable: false, authorityClaims: claims })),
            a.registry.register(f.request('staged', 'staged', 'STAGED', { clientCallable: false, authorityClaims: claims })),
        ]);
        for (const publication of ['ONLINE', 'STAGED']) {
            await assert.rejects(a.registry.register(f.request('duplicate', 'duplicate-' + publication, publication, {
                clientCallable: false, authorityClaims: claims,
            })), /Duplicate functional/);
            await assert.rejects(a.registry.register(f.request('relabeled', 'relabeled-' + publication, publication, {
                clientCallable: false, authorityClaims: claims.map(claim => ({ ...claim, authorityContext: 'another.label' })),
                role: 'UNRELATED',
            })), /Duplicate functional/);
        }
        assert.equal((await a.store.values()).length, 2);
        // An explicitly configured semantic label carries no physical database identity either.
        const explicitClaims = agent.buildAuthorityClaims('cms', { rawSchema: {
            cmsPage: { model: true, authorityContext: 'explicit.shared.label' },
        } });
        await a.registry.register(f.request('online', 'online', 'ONLINE', { clientCallable: false, authorityClaims: explicitClaims }));
        await a.registry.register(f.request('staged', 'staged', 'STAGED', { clientCallable: false, authorityClaims: explicitClaims }));
        const invalidClaim = f.request('invalid', 'invalid', 'ONLINE', { clientCallable: false, authorityClaims: [{}] });
        await assert.rejects(a.registry.register(invalidClaim), /Invalid module registration/);
    });

    test(`${mode}: expired owners release admission and stale cleanup cannot delete renewed leases`, async () => {
        const f = fixture(mode), a = f.replica(), b = f.replica();
        await a.registry.register(f.request('a'));
        let [entry] = await a.store.values();
        const staleExpiry = entry.value.expiresAt;
        const renewed = { ...entry.value, expiresAt: staleExpiry + 10000 };
        await b.store.set(entry.key, renewed, 40000, entries => b.registry.assertAuthorityClaimsAvailable(renewed, entries));
        assert.equal(await a.store.deleteIfExpiresAt(entry.key, staleExpiry), false);
        await assert.rejects(b.registry.register(f.request('b')), /Duplicate functional/);
        if (mode === 'memory') a.store._instances.get(entry.key).expiresAt = Date.now() - 1;
        else f.client.records.get(a.store.getStorageKey(entry.key)).value = JSON.stringify({ ...renewed, expiresAt: Date.now() - 1 });
        await b.registry.register(f.request('b'));
        assert((await b.store.values()).some(item => item.value.server === 'b'));
    });
}

test('distributed: provider without atomic admission fails closed and never writes', async () => {
    const f = fixture('distributed'), a = f.replica();
    f.client.eval = undefined;
    await assert.rejects(a.registry.register(f.request('a')), /atomic admission support/);
    assert.equal((await a.store.values()).length, 0);
});


test('later-layer admission override runs inside the existing atomic store boundary', async () => {
    const f = fixture('memory'), a = f.replica();
    let checks = 0;
    a.registry.assertAuthorityClaimsAvailable = function (candidate, entries) {
        checks++;
        registryDefinition.assertAuthorityClaimsAvailable.call(this, candidate, entries);
        if (candidate.server === 'restricted') throw new Error('Layered admission policy');
    };
    await assert.rejects(a.registry.register(f.request('restricted')), /Layered admission policy/);
    assert.equal((await a.store.values()).length, 0);
    await a.registry.register(f.request('allowed'));
    assert.equal(checks, 2);
});

test('distributed contention never extends the original lease expiry or acknowledges an unwritten lease', async () => {
    const f = fixture('distributed'), a = f.replica();
    const originalNow = Date.now;
    let now = originalNow();
    const request = f.request('a');
    request.body.leaseTtlMs = 1000;
    Date.now = () => now;
    f.client.eval = async () => { now += 1001; return 0; };
    try {
        await assert.rejects(a.registry.register(request), /lease expired during contention/);
        assert.equal((await a.store.values()).length, 0);
    } finally { Date.now = originalNow; }
});


for (const mode of ['memory','distributed']) {
  test(mode + ': canonical runtime-local metadata permits repeated mechanical claims without exempting functional owners', async t => {
    const previous = global.NODICS;
    t.after(()=>{global.NODICS=previous;});
    const system = require('../../../../nodics.foundation/modules/nSystem/package.json');
    global.NODICS={getRawModule:name=>name==='system'?{metaData:system}:undefined};
    const f=fixture(mode), a=f.replica(), b=f.replica();
    const claim={kind:'schema',moduleName:'system',claimName:'configuration',authorityContext:'system.configuration'};
    const body={moduleName:'system',canonicalIdentity:'system',authorityClaims:[claim]};
    await a.registry.register(f.request('a','a','OPERATIONAL',body));
    await b.registry.register(f.request('b','b','OPERATIONAL',body));
    assert.equal((await a.store.values()).length,2);
    await a.registry.register(f.request('functional-a','fa','ONLINE'));
    await assert.rejects(b.registry.register(f.request('functional-b','fb','ONLINE')),/Duplicate functional/);
    const candidate={projectCode:'project',environment:'local',server:'x',moduleName:'unknown',
      runtimeRole:{publication:'ONLINE'},clientCallable:true,ownershipScope:'runtimeLocal',authorityClaims:[]};
    assert.throws(()=>a.registry.assertAuthorityClaimsAvailable(candidate,[{value:{...candidate,server:'y',expiresAt:Date.now()+10000}}]),/Duplicate functional/);
  });
}


for (const mode of ['memory','distributed']) {
 test(mode+': explicit service-only functional authority remains exclusive',async t=>{
  const previous=global.NODICS;t.after(()=>{global.NODICS=previous;});
  global.NODICS={getRawModule:name=>name==='serviceOnlyOwner'?{metaData:{nodics:{runtime:{ownership:'functional'}}}}:undefined};
  const f=fixture(mode),a=f.replica(),b=f.replica();
  const body={moduleName:'serviceOnlyOwner',canonicalIdentity:'serviceOnlyOwner',clientCallable:false,authorityClaims:[]};
  await a.registry.register(f.request('a','a','OPERATIONAL',body));
  await assert.rejects(b.registry.register(f.request('b','b','OPERATIONAL',body)),/Duplicate functional/);
 });
}
