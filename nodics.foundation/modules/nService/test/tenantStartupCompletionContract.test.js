/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nService/test/tenantStartupCompletionContract
 * @description Checks that required tenant preparation completes before advancing and token rotation drains without overlapping work.
 * @layer test
 * @owner nService
 */
const assert = require('node:assert/strict');
const test = require('node:test');
const enterprise = require('../src/service/enterprise/defaultEnterpriseHandlerService');
const auth = require('../src/service/authentication/defaultInternalAuthenticationProviderService');

test('tenant search setup is awaited and failure prevents dependent jobs and identity', async () => {
    const calls = [];
    global.NODICS = { addActiveEnterprise() {}, removeActiveEnterprise() {}, getActiveTenants: () => [], addActiveTenant() {}, removeActiveTenant() {},
        isModuleActive: () => false, getModules: () => ({}), addInternalAuthToken: () => calls.push('token') };
    global.CONFIG = { get: name => name === 'cronjob' ? { runOnStartup: true } : undefined,
        getProperties: () => ({}), setProperties() {} };
    let release;
    const failure = new Error('search unavailable');
    global.SERVICE = { DefaultDatabaseConnectionHandlerService: { createDatabaseConnection: async () => {} },
        DefaultDatabaseConfigurationService: { getDatabaseActiveModules: () => [], getDatabaseConfiguration() {} },
        DefaultDatabaseModelHandlerService: { buildModelsForTenant: async () => {} },
        DefaultSearchEngineConnectionHandlerService: { createTenantsSearchEngines: () => new Promise((resolve, reject) => { release = reject; }) },
        DefaultCronJobService: { createAllJobs: async () => calls.push('jobs') },
        DefaultInternalAuthenticationProviderService: { fetchInternalAuthToken: async () => { calls.push('auth'); return { authToken: 'test' }; } } };
    const record = { code: 'enterprise', active: true, tenant: { code: 'tenant', active: true, properties: {} } };
    let settled = false;
    const pending = enterprise.buildEnterprise([record]).finally(() => { settled = true; });
    while (!release) await new Promise(resolve => setImmediate(resolve));
    assert.equal(settled, false);
    assert.deepEqual(calls, []);
    release(failure);
    await assert.rejects(pending, error => error === failure);
    assert.deepEqual(calls, []);
    delete SERVICE.DefaultSearchEngineConnectionHandlerService;
    await enterprise.buildEnterprise([record]);
    assert.deepEqual(calls, ['jobs', 'auth', 'token']);
    const owner = Object.assign({}, enterprise, { fetchEnterprise: async () => { throw failure; } });
    await assert.rejects(owner.buildEnterprises(), error => error === failure);
});

test('failed preparation removes provisional activation and the same enterprise resumes without duplicate readiness', async () => {
    const tenants = new Set(), enterprises = new Set(), calls = [];
    global.NODICS = {
        addActiveEnterprise: code => enterprises.add(code), removeActiveEnterprise: code => enterprises.delete(code),
        getActiveTenants: () => [...tenants], addActiveTenant: tenant => tenants.add(tenant),
        removeActiveTenant: tenant => tenants.delete(tenant), isModuleActive: () => true,
        getActiveModules: () => ['import', 'profile'], addInternalAuthToken: () => calls.push('token')
    };
    global.CONFIG = { get: () => undefined, getProperties: () => ({}), setProperties() {} };
    const failure = new Error('receipt model unavailable');
    let fail = true;
    global.SERVICE = {
        DefaultDatabaseConfigurationService: { getDatabaseActiveModules: () => [], getDatabaseConfiguration() {} },
        DefaultEnterpriseTenantProvisioningService: { prepare: async value => value.tenant },
        DefaultDatabaseConnectionHandlerService: { createDatabaseConnection: async () => calls.push('connection') },
        DefaultDatabaseModelHandlerService: { buildModelsForTenant: async () => calls.push('models') },
        DefaultMandatoryIdentityBootstrapService: { prepareTenant: async () => { calls.push('identity'); if (fail) throw failure; } },
        DefaultInternalAuthenticationProviderService: { fetchInternalAuthToken: async () => { calls.push('auth'); return { authToken: 'fixture' }; } }
    };
    const owner = { ...enterprise, _tenantPreparations: new Map() };
    const record = { code: 'existing-partial', active: true, tenant: { code: 'new-tenant', active: true, properties: {} } };
    await assert.rejects(owner.buildEnterprise([record]), error => error === failure);
    assert.equal(tenants.size, 0); assert.equal(enterprises.size, 0); assert.equal(owner._tenantPreparations.size, 0);
    assert.deepEqual(calls, ['connection', 'models', 'identity']);
    fail = false;
    await owner.buildEnterprise([record]);
    assert.deepEqual(calls, ['connection', 'models', 'identity', 'connection', 'models', 'identity', 'auth', 'token']);
    assert.deepEqual([...tenants], ['new-tenant']); assert.deepEqual([...enterprises], ['existing-partial']);
    await owner.buildEnterprise([record]);
    assert.equal(calls.length, 8);
});

test('Profile activation joins in-flight preparation instead of mistaking provisional activation for readiness', async () => {
    const profile = require('../../../../nodics.platform/modules/profile/src/service/enterprise/defaultEnterpriseManagementService');
    const tenants = new Set();
    let finish, tokens = 0, connections = 0;
    global.NODICS = { addActiveEnterprise() {}, removeActiveEnterprise() {},
        getActiveTenants: () => [...tenants], addActiveTenant: tenant => tenants.add(tenant), removeActiveTenant: tenant => tenants.delete(tenant),
        isModuleActive: () => false, addInternalAuthToken: () => tokens++ };
    global.CONFIG = { get: () => undefined, getProperties: () => ({}), setProperties() {} };
    const owner = { ...enterprise, _tenantPreparations: new Map() };
    global.SERVICE = { DefaultEnterpriseHandlerService: owner,
        DefaultDatabaseConfigurationService: { getDatabaseActiveModules: () => [], getDatabaseConfiguration() {} },
        DefaultDatabaseConnectionHandlerService: { createDatabaseConnection: () => { connections++; return new Promise(resolve => { finish = resolve; }); } },
        DefaultDatabaseModelHandlerService: { buildModelsForTenant: async () => {} },
        DefaultInternalAuthenticationProviderService: { fetchInternalAuthToken: async () => ({ authToken: 'fixture' }) } };
    const record = { code: 'partial', active: true, tenant: { code: 'new-tenant', active: true, properties: {} } };
    const first = owner.buildEnterprise([record]);
    let settled = false;
    const joined = profile.activateEnterpriseRuntime(record, record.tenant.code).then(() => { settled = true; });
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(settled, false); assert.equal(connections, 1); assert.equal(tokens, 0);
    finish(); await Promise.all([first, joined]);
    assert.equal(settled, true); assert.equal(tokens, 1);
});

test('token rotation admits one refresh at a time and drain waits for it after clearing the timer', async () => {
    let contributor;
    let tick;
    let cleared = 0;
    let calls = 0;
    let finish;
    const set = global.setTimeout, clear = global.clearTimeout;
    const service = Object.assign({}, auth, { _refreshTimer: null, _refreshPromise: null,
        LOG: { error() {} }, refreshInternalAuthTokens: () => { calls++; return new Promise(resolve => { finish = resolve; }); } });
    global.SERVICE = { DefaultRuntimeLifecycleService: { registerContributor: (name, value) => { contributor = value; } } };
    global.CONFIG = { get: () => ({ jwt: { serviceTokenRefreshIntervalMs: 1000 } }) };
    NODICS.getInternalAuthTokens = () => ({});
    global.setTimeout = callback => { tick = callback; return { unref() {} }; };
    global.clearTimeout = () => { cleared++; };
    try {
        await service.init();
        service.scheduleInternalAuthTokenRefresh();
        tick();
        assert.equal(calls, 1);
        let drained = false;
        const draining = contributor.drain().then(() => { drained = true; });
        await Promise.resolve();
        assert.equal(service._refreshTimer, null);
        assert.equal(cleared, 0);
        assert.equal(drained, false);
        finish();
        await draining;
        assert.equal(drained, true);
        assert.equal(service._refreshPromise, null);
    } finally { global.setTimeout = set; global.clearTimeout = clear; }
});

/** Composes the real database registry validator with in-memory runtime handles; no provider or application storage is used. */
function tenantCleanupFixture() {
    const tenants = new Set(['tenant-a']), modules = { one:{models:{'tenant-a':{}},searchModels:{'tenant-a':{}}},two:{models:{'tenant-a':{}},searchModels:{'tenant-a':{}}} },calls=[];
    global.NODICS={getModules:()=>modules,getModule:name=>modules[name],isModuleActive:name=>name==='search'||!!modules[name],getActiveTenants:()=>[...tenants],removeActiveTenant:tenant=>{calls.push('inactive');tenants.delete(tenant);}};
    global.CONFIG={get:name=>name==='defaultTenant'?'default':undefined};
    global.CLASSES={NodicsError:class extends Error {constructor(code,message){super(message);this.code=code;}}};
    const database={...require('../../nDatabase/database/src/service/config/defaultDatabaseConfigurationService'),dbs:{one:{'tenant-a':{}},two:{'tenant-a':{}}}};
    const connections={...require('../../nDatabase/database/src/service/connection/defaultDatabaseConnectionHandlerService')};
    const models={...require('../../nDatabase/database/src/service/model/defaultDatabaseModelHandlerService'),LOG:{debug(){}}};
    global.SERVICE={DefaultDatabaseConfigurationService:database,DefaultDatabaseConnectionHandlerService:connections,DefaultDatabaseModelHandlerService:models,DefaultCronJobService:{getCronJobRuntimeService:()=>({removeAllJobs:async()=>{calls.push('jobs');}})},DefaultSearchConfigurationService:{removeTenantSearchEngine:()=>calls.push('search'),removeTenantRawSearchSchema:()=>calls.push('schema')}};
    return {owner:{...require('../src/service/tenant/defaultTenantHandlerService'),LOG:{info(){},error(){}}},tenants,modules,calls,database,models};
}
test('tenant cleanup composes actual database guard before inactive marker and awaits every resource', async()=>{
    const f=tenantCleanupFixture();const response=await f.owner.removeTenants(['tenant-a']);
    assert.equal(response.code,'SUC_SYS_00000');assert.equal(f.tenants.size,0);assert.deepEqual(f.database.dbs,{one:{},two:{}});
    assert.equal(f.modules.one.models['tenant-a'],undefined);assert.equal(f.modules.two.models['tenant-a'],undefined);assert.equal(f.calls.at(-1),'inactive');assert.equal(f.calls.filter(x=>x==='schema').length,2);
});
test('tenant cleanup cannot acknowledge before a later module finishes',async()=>{
    const f=tenantCleanupFixture();let release,settled=false;const original=f.models.removeModelsForTenant;
    f.models.removeModelsForTenant=async function(name,tenant){if(name==='two')await new Promise(resolve=>{release=resolve;});return original.call(this,name,tenant);};
    const pending=f.owner.removeTenants(['tenant-a']).finally(()=>{settled=true;});
    while(!release)await new Promise(resolve=>setImmediate(resolve));assert.equal(settled,false);assert(f.tenants.has('tenant-a'));release();await pending;assert.equal(f.tenants.size,0);
});
test('tenant cleanup failure retains active marker and does not claim completion',async()=>{
    const f=tenantCleanupFixture(),failure=new Error('fixture cleanup held');f.models.removeModelsForTenant=async()=>{throw failure;};
    await assert.rejects(f.owner.removeTenants(['tenant-a']),error=>error===failure);assert(f.tenants.has('tenant-a'));assert(!f.calls.includes('inactive'));
});
test('empty tenant cleanup resolves without resource changes',async()=>{
    const f=tenantCleanupFixture();assert.equal((await f.owner.removeTenants([])).code,'SUC_SYS_00000');assert.deepEqual(f.calls,[]);assert(f.tenants.has('tenant-a'));
});

test('tenant cleanup awaits all selected tenants and tolerates absent search registries',async()=>{
    const f=tenantCleanupFixture();f.tenants.add('tenant-b');
    for(const name of Object.keys(f.modules)){f.database.dbs[name]['tenant-b']={};f.modules[name].models['tenant-b']={};delete f.modules[name].searchModels;}
    await f.owner.removeTenants(['tenant-a','tenant-b']);assert.equal(f.tenants.size,0);assert.equal(f.calls.filter(x=>x==='inactive').length,2);assert.deepEqual(f.database.dbs,{one:{},two:{}});
});
test('Cron cleanup failure is awaited and holds resource retirement',async()=>{
    const f=tenantCleanupFixture(),failure=new Error('fixture jobs held');SERVICE.DefaultCronJobService.getCronJobRuntimeService=()=>({removeAllJobs:async()=>{throw failure;}});
    await assert.rejects(f.owner.removeTenants(['tenant-a']),error=>error===failure);assert(f.tenants.has('tenant-a'));assert(f.database.dbs.one['tenant-a']);assert.deepEqual(f.calls,[]);
});
