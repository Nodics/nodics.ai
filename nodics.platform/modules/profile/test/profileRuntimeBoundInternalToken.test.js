/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module profile/test/profileRuntimeBoundInternalToken @description Proves deployment-bound issuance and renewal through the actual Profile issuer and scope owner. @layer test @owner profile */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const authorization = require('../src/service/identity/defaultRuntimeAuthorizationService');
const issuer = require('../src/service/authentication/defaultInternalAuthenticationProviderService');
global.CLASSES = { NodicsError: class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } } };
global.CONFIG = { get: key => key === 'authSecurity' ? { internalToken: { maximumLifetimeSeconds: 300 } } : undefined };
const scope = { projectCode: 'warehouse.project', environmentCode: 'qa', serverCode: 'jobs', instanceCode: 'jobs-replica-1', modules: ['cronjob', 'nodics.process'], permissions: ['backoffice.registry.register'] };
const assignment = { code: 'warehouse-jobs-1', scopeType: 'RUNTIME_DEPLOYMENT', scopeCode: 'warehouse-qa-jobs', principalType: 'service', principalCode: 'jobs-1', inheritanceMode: 'DIRECT', tenantCode: 'default', enterpriseCode: 'warehouse', status: 'ACTIVE', effect: 'ALLOW', runtimeScope: scope };
const request = { tenant: 'default', authData: { tenant: 'default', entCode: 'warehouse', person: { loginId: 'jobs-1', principalType: 'service', authVersion: 3 }, permissions: ['*'], userGroups: ['adminGroup'] }, headers: { 'x-nodics-project': scope.projectCode, 'x-nodics-environment': scope.environmentCode, 'x-nodics-server': scope.serverCode, 'x-nodics-runtime-instance': scope.instanceCode, 'x-nodics-modules': scope.modules.join(',') } };
let rows, issued, reads;
function setup() {
    rows = [structuredClone(assignment)]; issued = []; reads = 0;
    global.SERVICE = { DefaultRuntimeAuthorizationService: authorization,
        DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ isSystem: true }) },
        DefaultPrincipalScopeAssignmentService: { get: async () => { reads++; return { code: 'SUC_FIND_00000', result: structuredClone(rows) }; } },
        DefaultServiceTokenService: { issue: async options => { issued.push(options); return 'signed-runtime-token'; } } };
}
test('actual local runtime provider cannot reuse a default-tenant API-key proof as a newly provisioned tenant identity', async t => {
    const provider = require('../../../../nodics.foundation/modules/nService/src/service/authentication/defaultInternalAuthenticationProviderService');
    const authentication = require('../src/service/authentication/defaultAuthenticationProviderService');
    const previous = { CONFIG: global.CONFIG, NODICS: global.NODICS };
    t.after(() => {
        global.CONFIG = previous.CONFIG;
        if (previous.NODICS === undefined) delete global.NODICS; else global.NODICS = previous.NODICS;
    });
    setup();
    const baseConfig = previous.CONFIG;
    global.CONFIG = { get: (key, tenant) => {
        if (key === 'defaultAuthDetail') return { apiKey: 'fictional-provider-proof', entCode: 'warehouse' };
        if (key === 'runtimeIdentity') return { instanceCode: scope.instanceCode };
        return baseConfig.get(key, tenant);
    } };
    global.NODICS = {
        getEnvironmentName: () => scope.projectCode,
        getSelectedEnvironmentName: () => scope.environmentCode,
        getServerName: () => scope.serverCode,
        getActiveModules: () => scope.modules,
        isModuleActive: () => true,
    };
    const proofReads = [];
    SERVICE.DefaultEnterpriseService = { retrieveEnterprise: async code => {
        proofReads.push(['enterprise', code]);
        return { code: 'warehouse', active: true, tenant: { code: 'default', active: true } };
    } };
    SERVICE.DefaultEmployeeService = { findByAPIKey: async request => {
        proofReads.push(['principal', request.tenant]);
        return { ...structuredClone(requestFixturePrincipal()), apiKeyScopes: scope.permissions };
    } };
    SERVICE.DefaultAuthenticationProviderService = Object.assign(Object.create(authentication), {
        recordAuthEvent: async () => true,
    });
    const local = Object.assign(Object.create(provider), {
        getInternalAuthToken: issuer.getInternalAuthToken,
    });
    await assert.rejects(local.fetchInternalAuthToken('new-enterprise-tenant'), error =>
        error.code === 'ERR_AUTH_00003' && /authenticated service principal in the requested tenant/.test(error.message));
    assert.deepEqual(proofReads, [['enterprise', 'warehouse'], ['principal', 'default']]);
    assert.equal(reads, 0, 'A wrong-tenant proof cannot reach deployment-grant admission');
    assert.equal(issued.length, 0, 'No relabelled or default-tenant fallback token may be issued');
});
function requestFixturePrincipal() {
    return request.authData.person;
}
test('approved runtime receives only explicit permissions and renewed credentials re-read the grant', async () => {
    setup(); const first = await issuer.getInternalAuthToken(structuredClone(request));
    assert.equal(first.result.authToken, 'signed-runtime-token');
    assert.deepEqual(issued[0].permissions, ['backoffice.registry.register']);
    assert.deepEqual(issued[0].userGroups, []); assert.equal(issued[0].serviceId, 'jobs-1');
    assert.equal(issued[0].tokenLife, 300); assert.equal(issued[0].runtimeScope.assignmentCode, assignment.code);
    rows[0].status = 'INACTIVE';
    await assert.rejects(issuer.getInternalAuthToken(structuredClone(request)), /approved runtime/);
    assert.equal(reads, 2); assert.equal(issued.length, 1);
});
test('unapproved modules, deployment changes, duplicate claims and another replica are denied', async () => {
    setup();
    for (const [key, value] of [['x-nodics-modules', 'cronjob,inventory'], ['x-nodics-modules', 'cronjob,cronjob'], ['x-nodics-server', 'inventory'], ['x-nodics-environment', 'production'], ['x-nodics-project', 'another.project'], ['x-nodics-runtime-instance', 'jobs-replica-2']]) {
        const changed = structuredClone(request); changed.headers[key] = value;
        await assert.rejects(issuer.getInternalAuthToken(changed));
    }
    assert.equal(issued.length, 0);
});
for (const environmentCode of ['qa', 'kickoffLocal', 'productionLocal']) {
    test(`${environmentCode} issuance rejects excess modules independently of the caller strict flag`, async () => {
        for (const strictFlag of [undefined, false, true]) {
            setup();
            rows[0].runtimeScope.environmentCode = environmentCode;
            const changed = structuredClone(request);
            changed.headers['x-nodics-environment'] = environmentCode;
            changed.headers['x-nodics-modules'] = 'cronjob,inventory';
            if (strictFlag !== undefined) changed.requireExactModules = strictFlag;
            await assert.rejects(issuer.getInternalAuthToken(changed), error =>
                error.code === 'ERR_AUTH_00003' && error.message === 'Requested modules exceed approved runtime deployment scope');
            assert.equal(reads, 1);
            assert.equal(issued.length, 0);
        }
    });
    test(`${environmentCode} issuance accepts only requested approved modules`, async () => {
        for (const modules of [scope.modules, ['cronjob']]) {
            setup();
            rows[0].runtimeScope.environmentCode = environmentCode;
            const approved = structuredClone(request);
            approved.headers['x-nodics-environment'] = environmentCode;
            approved.headers['x-nodics-modules'] = modules.join(',');
            approved.requireExactModules = false;
            const result = await issuer.getInternalAuthToken(approved);
            assert.equal(result.result.authToken, 'signed-runtime-token');
            assert.equal(reads, 1);
            assert.equal(issued.length, 1);
            assert.deepEqual(issued[0].modules, modules);
            assert(issued[0].modules.every(module => rows[0].runtimeScope.modules.includes(module)));
            assert.deepEqual(issued[0].permissions, scope.permissions);
            assert.deepEqual(issued[0].userGroups, []);
        }
    });
}
test('native local runtimes may share the generated local service principal while matching one grant', async () => {
    setup();
    const localScope = { ...scope, environmentCode: 'kickoffLocal', serverCode: 'wasteServer', instanceCode: 'kickoff-local-waste-1' };
    const peerScope = { ...scope, environmentCode: 'kickoffLocal', serverCode: 'locationServer', instanceCode: 'kickoff-local-location-1' };
    rows = [
        { ...assignment, code: 'kickoff-local-waste-runtime-deployment', principalCode: 'apiAdmin', runtimeScope: localScope },
        { ...assignment, code: 'kickoff-local-location-runtime-deployment', principalCode: 'apiAdmin', runtimeScope: peerScope }
    ];
    const localRequest = structuredClone(request);
    localRequest.authData.person.loginId = 'apiAdmin';
    localRequest.headers['x-nodics-environment'] = localScope.environmentCode;
    localRequest.headers['x-nodics-server'] = localScope.serverCode;
    localRequest.headers['x-nodics-runtime-instance'] = localScope.instanceCode;
    localRequest.headers['x-nodics-modules'] = localScope.modules.join(',');
    const result = await issuer.getInternalAuthToken(localRequest);
    assert.equal(result.result.authToken, 'signed-runtime-token');
    assert.equal(issued[0].runtimeScope.assignmentCode, 'kickoff-local-waste-runtime-deployment');
});
test('missing, expired, ambiguous or denied grants and unavailable storage never issue a credential', async () => {
    setup();
    for (const values of [[], [{ ...assignment, effectiveTo: new Date(Date.now() - 1000).toISOString() }], [assignment, { ...assignment, code: 'duplicate' }], [assignment, { ...assignment, code: 'deny', effect: 'DENY' }]]) {
        rows = structuredClone(values); await assert.rejects(issuer.getInternalAuthToken(structuredClone(request)));
    }
    SERVICE.DefaultPrincipalScopeAssignmentService.get = async () => ({ success: false, result: [assignment] });
    await assert.rejects(issuer.getInternalAuthToken(structuredClone(request)), /authority/);
    assert.equal(issued.length, 0);
});
test('human identity, tenant substitution and permission escalation are rejected', async () => {
    setup();
    for (const update of [r => { r.authData.person.principalType = 'human'; }, r => { r.tenant = 'other'; }, r => { r.authData.permissions = ['unrelated.read']; }]) {
        const changed = structuredClone(request); update(changed); await assert.rejects(issuer.getInternalAuthToken(changed));
    }
    rows[0].runtimeScope.permissions = ['*'];
    await assert.rejects(issuer.getInternalAuthToken(structuredClone(request)), /authorization/);
    assert.equal(issued.length, 0);
});
test('grant expiry bounds token lifetime and invalid scope data rejects before persistence', async () => {
    setup(); rows[0].effectiveTo = new Date(Date.now() + 45000).toISOString();
    await issuer.getInternalAuthToken(structuredClone(request));
    assert(issued[0].tokenLife > 0 && issued[0].tokenLife <= 45);
    for (const mutation of [a => { a.inheritanceMode = 'GROUP'; }, a => { a.runtimeScope.projectCode = '../escape'; }, a => { a.runtimeScope.permissions = ['*']; }, a => { a.effectiveTo = 'invalid'; }]) {
        const invalid = structuredClone(assignment); mutation(invalid); assert.throws(() => authorization.validateAssignment(invalid));
    }
});
