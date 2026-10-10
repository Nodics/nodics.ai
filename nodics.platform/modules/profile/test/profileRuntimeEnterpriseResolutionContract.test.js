/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
'use strict';
/** @module profile/test/profileRuntimeEnterpriseResolutionContract @description Exercises real nService, secured-route, Profile placement and generated ACL owners with isolated verification/persistence ports, not installed qualification. @layer test @owner profile */
const test = require('node:test'), assert = require('node:assert/strict');
const foundation = '../../../..';
const provider = require(foundation + '/nodics.foundation/modules/nService/src/service/profile/defaultEnterpriseProviderService');
const runtime = require(foundation + '/nodics.foundation/modules/nAuth/src/service/identity/defaultServiceTokenService');
const secured = require(foundation + '/nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService');
const initializer = require(foundation + '/nodics.foundation/modules/nDatabase/database/src/service/procs/get/defaultModelsGetInitializerService');
const access = require(foundation + '/nodics.foundation/modules/nDatabase/database/src/service/schema/defaultSchemaAccessHandlerService');
const ownership = require(foundation + '/nodics.foundation/modules/nDatabase/database/src/service/access/defaultRecordOwnershipPolicyService');
const identity = require(foundation + '/nodics.foundation/modules/nAuth/src/service/identity/defaultIdentityGovernanceService');
const source = require('../src/service/enterprise/defaultEnterpriseService');
const facade = require('../src/facade/enterprise/defaultEnterpriseFacade');
const controller = require('../src/controller/enterprise/defaultEnterpriseController');
const route = require('../src/router/routers').profile.loadDefaults.resolveRuntimeEnterprise;

function fixture(t) {
    const previous = Object.fromEntries(['CONFIG', 'SERVICE', 'FACADE', 'CLASSES', 'NODICS', 'UTILS'].map(key => [key, global[key]]));
    t.after(() => Object.assign(global, previous));
    const grant = { tenant: 'default', principalEnterpriseCode: 'default', serviceId: 'apiAdmin',
        projectCode: 'reviewed-project', environmentCode: 'reviewed-local', serverCode: 'commerceServer',
        instanceCode: 'commerce-1', assignmentCode: 'reviewed-commerce', enterpriseCodes: ['BUSINESS_ONLINE'] };
    const policy = { enabled: true, runtimeRole: 'PLATFORM', callers: [grant] };
    const auth = { tenant: 'default', entCode: 'default', principalType: 'service', tokenType: 'service', serviceId: 'apiAdmin',
        runtimeInstanceId: grant.instanceCode, runtimeScope: Object.fromEntries(['projectCode', 'environmentCode', 'serverCode', 'instanceCode', 'assignmentCode'].map(k => [k, grant[k]])),
        modules: ['profile'], userGroups: [], permissions: ['profile.enterprise.search'] };
    const enterprise = { code: 'BUSINESS_ONLINE', active: true, tenant: { code: 'default', active: true }, revision: 4, privateData: 'excluded' };
    const tenant = { code: 'default', active: true, revision: 2, properties: { privateData: 'excluded' } };
    const settings = { defaultTenant: 'default', profileModuleName: 'profile', runtimeRole: { code: 'PLATFORM' },
        profileRuntimeEnterpriseResolution: policy, enterpriseResolution: { runtimeLookup: { enabled: true } },
        identityGovernance: { systemAccessGroups: ['serviceAccountUserGroup'] },
        authSecurity: { internalToken: { runtimeAccessGroups: ['serviceAccountUserGroup'] } },
        accessPoints: { readAccessPoint: 1, fullAccessPoint: 10 } };
    const state = { reads: [], calls: [], authorities: 0 };
    global.CONFIG = { get: key => settings[key] };
    global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
    global.UTILS = { isBlank: value => !value || typeof value === 'object' && !Object.keys(value).length };
    global.NODICS = { getSelectedEnvironmentName: () => grant.environmentCode, getServerState: () => 'started',
        getInternalAuthToken: selected => { assert.equal(selected, 'default'); return 'isolated-runtime-token'; } };
    global.SERVICE = {
        DefaultServiceTokenService: runtime, DefaultSchemaAccessHandlerService: access,
        DefaultRecordOwnershipPolicyService: ownership,
        DefaultIdentityGovernanceService: { ...identity, getSystemAuthData: function () {
            state.authorities++; return identity.getSystemAuthData.call(this);
        } },
        DefaultAuthorizationProviderService: { authorizeToken: async input => {
            assert.equal(input.authToken, 'isolated-runtime-token'); return { code: 'SUC_AUTH_00000', result: structuredClone(auth) };
        } },
        DefaultEnterpriseTenantProvisioningService: require('../src/service/enterprise/defaultEnterpriseTenantProvisioningService'),
        DefaultEnterpriseTeamAdministrationService: require('../src/service/enterprise/defaultEnterpriseTeamAdministrationService'),
        DefaultEnterpriseMembershipService: require('../src/service/enterprise/defaultEnterpriseMembershipService'),
        DefaultEnterpriseRegistrationService: require('../src/service/enterprise/defaultEnterpriseRegistrationService'),
        DefaultEnterpriseManagementService: require('../src/service/enterprise/defaultEnterpriseManagementService'),
        DefaultTenantProvisioningGuardService: require('../src/service/enterprise/defaultTenantProvisioningGuardService'),
        DefaultLoggerService: { runSensitiveOperation: (_request, action) => action() },
    };
    const generated = name => async input => {
        input.schemaModel = { moduleName: 'profile', schemaName: name,
            rawSchema: { accessGroups: require('../config/properties').schemaPolicies.profile.administrative.accessGroups } };
        await new Promise((resolve, reject) => initializer.checkAccess.call({ ...initializer, LOG: { debug() {} } }, input, {}, {
            nextSuccess: resolve, error: (_r, _s, error) => reject(error),
        }));
        state.reads.push(input);
        if (state.onRead) await state.onRead(input);
        const row = name === 'enterprise' ? enterprise : tenant;
        return { code: 'SUC_FIND_00000', result: Object.entries(input.query).every(([k,v]) => row[k] === v) ? [structuredClone(row)] : [] };
    };
    const owner = { ...source, get: generated('enterprise') };
    SERVICE.DefaultEnterpriseService = owner; SERVICE.DefaultTenantService = { get: generated('tenant') };
    global.FACADE = { DefaultEnterpriseFacade: facade };
    SERVICE.DefaultModuleService = { invokeModule: async invocation => {
        state.calls.push(invocation);
        assert.equal(invocation.local, false); assert.equal(invocation.connectionName, 'profile');
        assert.deepEqual(invocation.targetAuthority, { runtimeRole: 'PLATFORM' });
        assert.deepEqual(invocation.header, { 'x-enterprise-code': auth.entCode });
        assert.equal(invocation.authToken, 'isolated-runtime-token');
        const request = { tenant: auth.tenant, entCode: auth.entCode, authData: structuredClone(auth), moduleName: 'profile', router: route,
            httpRequest: { body: structuredClone(invocation.requestBody), headers: invocation.header } };
        await new Promise((resolve, reject) => secured.checkAccess(request, {}, {
            nextSuccess: resolve, error: (_r, _s, error) => reject(error),
        }));
        return controller.resolveRuntimeEnterprise(request);
    } };
    const request = () => ({ tenant: auth.tenant, entCode: auth.entCode, authData: structuredClone(auth),
        payload: { contractVersion: 1, enterpriseCode: enterprise.code } });
    return { owner, auth, grant, policy, settings, enterprise, tenant, state, request };
}

test('nService public namespace uses original group-free deployment through secured Profile and exact generated placement', async t => {
    const f = fixture(t), auth = structuredClone(f.auth);
    const incoming = { entCode: f.enterprise.code, authData: { principalType: 'customer', loginId: 'original-buyer' },
        payload: { tenant: 'untrusted' } }, before = structuredClone(incoming);
    assert.deepEqual(await provider.loadEnterprise(incoming), { code: f.enterprise.code, active: true, tenant: { code: 'default', active: true } });
    assert.equal(f.state.calls.length, 1); assert.equal(f.state.reads.length, 4);
    assert.deepEqual(f.state.calls[0].requestBody, { contractVersion: 1, enterpriseCode: f.enterprise.code });
    assert.equal(f.state.calls[0].apiName, '/internal/enterprise/resolve');
    assert.equal(f.state.calls[0].request.authData.isSystem, undefined);
    assert.deepEqual(f.state.calls[0].request.authData.userGroups, []);
    assert(f.state.reads.every(r => r.tenant === 'default' && r.authData.isSystem === true && r.options.skipItemCache === true));
    assert.deepEqual(incoming, before); assert.deepEqual(f.auth, auth);
});

test('strict runtime bootstrap enterprise lookup still refuses another business enterprise', async t => {
    const f = fixture(t);
    await assert.rejects(f.owner.getRuntimeEnterprise({ ...f.request(), entCode: f.enterprise.code }), { code: 'ERR_AUTH_00003' });
    assert.equal(f.state.reads.length, 0); assert.equal(f.state.authorities, 0);
});

test('explicit placement negatives refuse before any canonical authority or generated read', async t => {
    const mutations = {
        disabled: f => { f.policy.enabled = false; }, missingPolicy: f => { delete f.settings.profileRuntimeEnterpriseResolution; },
        targetRole: f => { f.settings.runtimeRole.code = 'COMMERCE'; }, permission: f => { f.auth.permissions = []; },
        human: f => { f.auth.principalType = 'human'; f.auth.tokenType = 'access'; },
        anonymous: f => { f.auth.principalType = 'anonymous'; f.auth.tokenType = undefined; },
        system: f => { f.auth.isSystem = true; }, module: f => { f.auth.modules = []; },
        tenant: f => { f.auth.tenant = 'foreign'; }, deploymentEnterprise: f => { f.auth.entCode = 'foreign'; },
        alias: f => { f.auth.enterpriseCode = 'foreign'; }, staleInstance: f => { f.auth.runtimeInstanceId = 'foreign'; },
        foreignProject: f => { f.auth.runtimeScope.projectCode = 'foreign'; },
        foreignServer: f => { f.auth.runtimeScope.serverCode = 'foreign'; }, foreignAssignment: f => { f.auth.runtimeScope.assignmentCode = 'foreign'; },
        foreignEnvironment: f => { f.auth.runtimeScope.environmentCode = 'foreign'; },
        service: f => { f.auth.serviceId = 'foreign'; }, business: f => { f.grant.enterpriseCodes = ['FOREIGN']; },
        duplicate: f => { f.policy.callers.push(structuredClone(f.grant)); }, wildcard: f => { f.grant.enterpriseCodes = ['*']; },
    };
    for (const [name, mutate] of Object.entries(mutations)) await t.test(name, async t => {
        const f = fixture(t); mutate(f);
        await assert.rejects(f.owner.resolveRuntimeEnterprise(f.request()), { code: 'ERR_AUTH_00003' });
        assert.equal(f.state.reads.length, 0); assert.equal(f.state.authorities, 0);
    });
});

test('caller body cannot supply tenant, arbitrary selectors or replacement authentication', async t => {
    const f = fixture(t);
    for (const extra of [{ tenant: 'foreign' }, { query: {} }, { authData: { isSystem: true } }, { options: {} }]) {
        const r = f.request(); Object.assign(r.payload, extra);
        await assert.rejects(f.owner.resolveRuntimeEnterprise(r), { code: 'ERR_AUTH_00003' });
    }
    const r = f.request(); r.enterpriseCode = f.enterprise.code;
    await assert.rejects(f.owner.resolveRuntimeEnterprise(r), { code: 'ERR_AUTH_00003' });
    assert.equal(f.state.reads.length, 0); assert.equal(f.state.authorities, 0);
});

test('canonical inactive, ambiguous, foreign placement and observed drift never become tenant binding', async t => {
    for (const kind of ['enterpriseInactive', 'foreignTenant', 'tenantInactive', 'drift', 'policyDrift', 'authDrift', 'selectorDrift', 'failedEnvelope'])
        await t.test(kind, async t => {
            const f = fixture(t), r = f.request();
            if (kind === 'enterpriseInactive') f.enterprise.active = false;
            if (kind === 'foreignTenant') f.enterprise.tenant.code = 'foreign';
            if (kind === 'tenantInactive') f.tenant.active = false;
            if (kind === 'failedEnvelope') SERVICE.DefaultTenantService.get = async () => ({ code: 'ERR_FIND', result: [f.tenant] });
            f.state.onRead = async () => {
                if (f.state.reads.length !== 2) return;
                if (kind === 'drift') f.enterprise.revision++;
                if (kind === 'policyDrift') f.policy.enabled = false;
                if (kind === 'authDrift') r.authData.entCode = 'foreign';
                if (kind === 'selectorDrift') r.payload.enterpriseCode = 'FOREIGN';
            };
            await assert.rejects(f.owner.resolveRuntimeEnterprise(r));
        });
});

test('nService independently rejects foreign or malformed remote owner evidence', async t => {
    const f = fixture(t);
    for (const result of [[], [{ code: 'FOREIGN', active: true, tenant: { code: 'default', active: true } }],
        [{ code: f.enterprise.code, active: true, tenant: { code: 'foreign', active: true } }],
        [{ code: f.enterprise.code, active: false, tenant: { code: 'default', active: true } }]]) {
        SERVICE.DefaultModuleService.invokeModule = async () => ({ code: 'SUC_FIND_00000', result });
        await assert.rejects(provider.loadEnterprise({ entCode: f.enterprise.code }), { code: 'ERR_ENT_00000' });
    }
});
