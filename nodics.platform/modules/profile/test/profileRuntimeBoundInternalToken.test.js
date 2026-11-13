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
const coordinates = { projectCode: 'warehouse.project', environmentCode: 'qa', serverCode: 'jobs', instanceCode: 'jobs-1' };
const permissions = ['auth.internal.token.read', 'backoffice.registry.register'];
const principal = { code: 'apiAdmin', loginId: 'apiAdmin', principalType: 'service', active: true,
    apiKeyStatus: 'active', apiKeyScopes: permissions, authVersion: 3 };
function fixture() {
    const placements = [{...coordinates, modules: ['profile', 'workflow']}];
    const issued = [];
    global.CONFIG = { get: key => key === 'defaultAuthDetail' ? {entCode: 'warehouse'} :
        require('../../../../nodics.foundation/modules/nAuth/config/properties')[key] };
    global.SERVICE = { DefaultRuntimeAuthorizationService: authorization,
        DefaultMandatoryIdentityBootstrapService: require('../src/service/identity/defaultMandatoryIdentityBootstrapService'),
        DefaultDeploymentModuleOwnershipService: {runtimePlacements: () => placements},
        DefaultServiceTokenService: {issue: async options => {issued.push(options); return 'fixture';}} };
    const request = {tenant:'default', authData:{tenant:'default', entCode:'warehouse', person:structuredClone(principal),
        permissions: permissions.slice()}, headers:{'x-nodics-project':coordinates.projectCode,
        'x-nodics-environment':'qa','x-nodics-server':'jobs','x-nodics-runtime-instance':'jobs-1','x-nodics-modules':'workflow'}};
    return {request, placements, issued};
}
test('shared proof follows a moved module on renewal without a per-runtime assignment', async () => {
    const {request, placements, issued} = fixture();
    await issuer.getInternalAuthToken(request);
    placements[0].modules = ['profile'];
    placements.push({...coordinates, serverCode:'next', instanceCode:'next-1', modules:['workflow']});
    await assert.rejects(issuer.getInternalAuthToken(request));
    Object.assign(request.headers, {'x-nodics-server':'next','x-nodics-runtime-instance':'next-1'});
    await issuer.getInternalAuthToken(request);
    assert.equal(issued.length, 2);
    for (const token of issued) {
        assert.equal(token.serviceId, 'apiAdmin'); assert.deepEqual(token.permissions, permissions);
        assert.deepEqual(token.userGroups, []); assert.deepEqual(token.modules, ['workflow']);
        assert.equal(token.authVersion, 3);
    }
});
test('issuance rejects foreign proof, personas, bearer re-issuance, wildcard and invalid placement', async () => {
    for (const mutate of [r=>r.tenant='foreign', r=>r.authData.entCode='foreign', r=>r.authData.person.enterpriseCode='foreign', r=>r.authData.person.loginId='another',
        r=>r.authData.person.principalType='human', r=>r.authData.person.active=false, r=>r.authData.person.apiKeyStatus='revoked',
        r=>r.authData.person.apiKeyExpiresAt=new Date(0), r=>r.authData.person.apiKeyScopes=[], r=>r.authData.tokenType='service', r=>r.authData.permissions.push('*'),
        r=>r.headers['x-nodics-project']='other',r=>r.headers['x-nodics-runtime-instance']='other',
        r=>r.headers['x-nodics-modules']='workflow,workflow', r=>r.headers['x-nodics-modules']='alien']) {
        const {request,issued}=fixture(); mutate(request);
        await assert.rejects(issuer.getInternalAuthToken(request),{code:'ERR_AUTH_00003'});assert.equal(issued.length,0);
    }
});
test('startup and renewal use the same authenticated account for local and remote Profile ownership', async () => {
    const {placements, issued} = fixture();
    const transport = require('../../../../nodics.foundation/modules/nService/src/service/authentication/defaultInternalAuthenticationProviderService');
    const policy = require('../../../../nodics.foundation/modules/nAuth/config/properties');
    global.CONFIG = {get: key => ({...policy, defaultAuthDetail:{entCode:'warehouse',apiKey:'fixture-only'},
        runtimeIdentity:{instanceCode:'jobs-1'}, profileModuleName:'profile'})[key]};
    global.NODICS = {getActiveModules:()=>['workflow'],getServerName:()=> 'jobs',getSelectedEnvironmentName:()=> 'qa',
        getEnvironmentName:()=>coordinates.projectCode};
    let remote = false, authenticatedTenant = 'default', proofs = 0;
    SERVICE.DefaultAuthenticationProviderService = {authenticateAPIKey:async input => {
        assert.equal(input.apiKey,'fixture-only'); proofs++;
        return {person:{...principal,userGroupPermissions:['group.permission']},tenant:authenticatedTenant,enterprise:{code:'warehouse'}};
    }};
    SERVICE.DefaultModuleService = {isLocalModuleActive:()=>!remote,buildRequest:input=>input,fetch:async call=>{
        const proof=await SERVICE.DefaultAuthenticationProviderService.authenticateAPIKey({apiKey:call.header['x-api-key']});
        return issuer.getInternalAuthToken({tenant:'default',headers:call.header,authData:{person:proof.person,tenant:proof.tenant,
            entCode:proof.enterprise.code,permissions:[...proof.person.apiKeyScopes,...proof.person.userGroupPermissions]}});
    }};
    const provider={...transport,...issuer};
    await provider.fetchInternalAuthToken('default');
    remote=true;
    await provider.fetchInternalAuthToken('default');
    assert.deepEqual(issued[0],issued[1]);
    assert(issued[0].permissions.includes('group.permission'));
    authenticatedTenant='other'; await assert.rejects(provider.fetchInternalAuthToken('default'));
    remote=false; await assert.rejects(provider.fetchInternalAuthToken('default'));
    authenticatedTenant='default'; placements[0].modules=[];
    await assert.rejects(provider.fetchInternalAuthToken('default'));
    assert.equal(proofs,5); assert.equal(issued.length,2);
});
test('missing issuer policy refuses instead of installing local lifetime or module defaults', async () => {
    for (const key of ['maximumLifetimeSeconds','maxDeclaredModules','routePermission','moduleNamePattern']) {
        const {request,issued}=fixture();
        const policy={...CONFIG.get('authSecurity').internalToken}; delete policy[key];
        global.CONFIG={get:name=>name==='authSecurity'?{internalToken:policy}:{entCode:'warehouse'}};
        await assert.rejects(issuer.getInternalAuthToken(request),{code:'ERR_AUTH_00003'});
        assert.equal(issued.length,0);
    }
});
