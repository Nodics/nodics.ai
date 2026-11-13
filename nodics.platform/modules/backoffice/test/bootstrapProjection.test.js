/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @module backoffice/test/bootstrapProjection
 * @description Proves diagnostic projection never skips fresh admission gates or accepts invalid query values.
 * @layer test
 * @owner backoffice
 */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const registry = require('../src/service/registry/defaultBackofficeRegistryService');
/** Deferred gates expose ordering without asserting elapsed wall time. */
function deferred() { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; }
const flush = () => new Promise(resolve => setImmediate(resolve));
/** Isolated owner fixture retains the real bootstrap orchestrator and baseline admission. */
function fixture(value) {
    const gates = { documentation: deferred(), policy: deferred(), admission: deferred() };
    const calls = [];
    const request = { tenant: 'tenant-a', authData: { permissions: [] }, httpRequest: { query: value === undefined ? {} : { includeOperationalReadiness: value } } };
    global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
    global.CONFIG = { get: () => undefined };
    global.SERVICE = {
        DefaultFunctionalModuleCatalogueService: { getPresentationEligibility: async context => { assert.equal(context, request); calls.push('eligibility'); return 'fresh'; } },
        DefaultBackofficeCapabilityRegistryService: { applyFunctionalModuleEligibility: (modules, eligibility) => { assert.equal(eligibility, 'fresh'); return modules; } },
        DefaultBackofficeApplicationInitializationService: { profiles: () => [{ code: 'optional-app' }] },
        DefaultAxisExperiencePolicyService: { getEffective: async context => { assert.equal(context, request); calls.push('policy'); return gates.policy.promise; } },
        DefaultAxisInitializationService: { status: async context => { assert.equal(context, request); calls.push('admission'); return gates.admission.promise; } },
        DefaultBackofficeOperationalReadinessService: { startupValidationWithEvidence: () => ({ state: 'NOT_READY' }), operationalReadinessReport: async () => { calls.push('report'); return { state: 'NOT_READY' }; } },
    };
    const owner = Object.assign(Object.create(registry), {
        getClientContractVersion: () => 1, list: async () => { calls.push('registry'); return { data: { modules: {} } }; },
        buildCatalogue: () => ({}), getConfiguration: () => ({}), buildAvailability: () => ({}), buildDocumentationSources: () => [],
        applicationStatusReader: () => () => { throw new Error('Unexpected profile read'); },
        buildDocumentationPublicationState: async () => { calls.push('documentation'); return gates.documentation.promise; },
        buildEffectiveNavigationComposition: () => ({}), getOverallCompatibilityStatus: () => 'COMPATIBLE', selectUiComposition: () => ({}),
        documentationReaderSources: sources => sources,
        applicationStatusReport: async () => { calls.push('profile-report'); return { statuses: [], errors: [] }; },
    });
    return { owner, gates, request, calls };
}
test('lightweight bootstrap still awaits documentation, policy and non-ready baseline admission', async () => {
    const { owner, gates, request, calls } = fixture('false');
    let settled = false;
    const pending = owner.bootstrap(request).then(value => { settled = true; return value; });
    await flush(); assert.deepEqual(calls, ['registry', 'eligibility', 'documentation']); assert.equal(settled, false);
    gates.documentation.resolve({}); await flush(); assert.equal(calls.at(-1), 'policy'); assert.equal(settled, false);
    gates.policy.resolve({ screenLockEnabled: true }); await flush(); assert.equal(calls.at(-1), 'admission'); assert.equal(settled, false);
    gates.admission.resolve({ readiness: 'NOT_READY' });
    const result = (await pending).data;
    assert.equal(result.axisInitializationAdmission, 'NOT_READY'); assert.equal(result.startupValidation.state, 'NOT_READY');
    assert.equal(result.axisPolicy.screenLockEnabled, true); assert.equal(result.operationalReadiness, undefined);
    assert.deepEqual(result.operationalReadinessObservation, { contractVersion: 1, mode: 'ON_DEMAND' });
    assert(!calls.includes('report')); assert(!calls.includes('profile-report'));
});
test('omitted or true projection retains the full fresh report', async () => {
    for (const value of [undefined, true, 'true']) {
        const { owner, gates, request, calls } = fixture(value);
        Object.values(gates).forEach(gate => gate.resolve({ readiness: 'READY' }));
        const result = (await owner.bootstrap(request)).data;
        assert.equal(result.operationalReadiness.state, 'NOT_READY');
        assert.equal(result.operationalReadinessObservation, undefined);
        assert.deepEqual(calls.slice(-3), ['profile-report', 'report', 'admission']);
    }
});
test('invalid projection refuses before any owner read', async () => {
    for (const value of ['', '0', 'FALSE', 0, null, [], ['false'], {}]) {
        const { owner, gates, request, calls } = fixture(value);
        Object.values(gates).forEach(gate => gate.resolve({ readiness: 'READY' }));
        await assert.rejects(owner.bootstrap(request), /includeOperationalReadiness/);
        assert.deepEqual(calls, []);
    }
});

test('Axis transport projection preserves fresh non-ready admission and every client authority field', async () => {
 const { owner, gates, request, calls } = fixture('false');
 request.httpRequest.query.projection = 'axis-client-v1';
 const lease = { displayName:'CMS', instanceId:'cms-staged', environment:'local', server:'cms', clientCallable:true,
 endpoint:'http://localhost:4312/nodics/cms', runtimeRole:{code:'WCMS_STAGED',publication:'STAGED'}, state:'UP',
 canonicalIdentity:'nodics.wcms/modules/cms', moduleKind:'capability', parentModule:'wcms', capability:{navigation:['duplicate']} };
 owner.list = async () => { calls.push('registry'); return {data:{modules:{cms:[lease]}}}; };
 owner.buildCatalogue = () => ({ cms:{navigation:['duplicate']} });
 owner.buildEffectiveNavigationComposition = () => ({navigation:[{id:'authorized-route',requiredPermissions:['cms.read']}],checksum:'exact-owner'});
 Object.values(gates).forEach(gate => gate.resolve({readiness:'NOT_READY',screenLockEnabled:true}));
 const data = (await owner.bootstrap(request)).data;
 assert.equal(data.projection,'axis-client-v1'); assert.equal(data.catalogue,undefined);
 assert.equal(data.axisInitializationAdmission,'NOT_READY'); assert.equal(data.axisPolicy.screenLockEnabled,true);
 assert.deepEqual(data.modules.cms[0].runtimeRole,lease.runtimeRole); assert.equal(data.modules.cms[0].endpoint,lease.endpoint);
 assert.equal(data.modules.cms[0].capability,undefined); assert.deepEqual(lease.capability,{navigation:['duplicate']});
 assert.deepEqual(data.effectiveNavigationComposition.navigation[0].requiredPermissions,['cms.read']);
 assert.deepEqual(data.applicationInitializationProfiles,[{code:'optional-app'}]);
 assert(calls.includes('documentation')); assert(calls.includes('policy')); assert(calls.includes('admission'));
});
test('unsupported transport projections reject before owner reads and missing navigation cannot degrade silently', async () => {
 for (const value of ['',null,1,[],['axis-client-v1'],{},'axis-client-v2']) {
  const {owner,request,calls}=fixture('false'); request.httpRequest.query.projection=value;
  await assert.rejects(owner.bootstrap(request),/Unsupported bootstrap projection/); assert.deepEqual(calls,[]);
 }
 assert.throws(()=>registry.projectAxisBootstrap({modules:{}}),/navigation projection/);
});
