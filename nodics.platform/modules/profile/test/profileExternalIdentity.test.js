/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module profile/test/profileExternalIdentity @description Exercises verified identity linking, isolation, conflicts, revocation and provider overrides through the owner service. @owner profile @layer test */
const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const identity = require('../src/service/identity/defaultExternalIdentityService');
const telegram = require('../src/service/authentication/defaultTelegramIdentityProviderService');
let policy, records, customers, locked, issued;
const token = '123456789:test-only-not-a-real-bot-credential';
function proof(id = 42, extra = {}) {
    const values = { auth_date: String(Math.floor(Date.now()/1000)), user: JSON.stringify({ id, first_name: 'Test', allows_write_to_pm: true }), ...extra };
    const p = new URLSearchParams(values);
    const check = [...p.entries()].sort(([a],[b]) => a < b ? -1 : a > b ? 1 : 0).map(([k,v]) => k+'='+v).join('\n');
    const secret = crypto.createHmac('sha256','WebAppData').update(token).digest();
    p.set('hash',crypto.createHmac('sha256',secret).update(check).digest('hex'));
    return p.toString();
}
function request(login = 'a', subject = 42) {
    return { entCode: 'enterprise-a', applicationCode: 'app-a', proof: proof(subject), authData: { loginId: login, principalType: 'customer', authVersion: 1, entCode: 'enterprise-a', tenant: 'tenant-a', tokenType: 'access' } };
}
beforeEach(() => {
    delete process.env.NODICS_TEST_EXTERNAL_SECRET;
    global.CLASSES = { NodicsError: class extends Error { constructor(code,message) { super(message || code); this.code=code; } } };
    policy = { enabled: true, maximumAssertionAgeSeconds: 300, clockSkewSeconds: 30, maximumAssertionCharacters: 16384, providers: { TELEGRAM: { service: 'DefaultTelegramIdentityProviderService' } }, applications: { 'app-a': { enabled: true, provider: 'TELEGRAM', enterpriseCode: 'enterprise-a', credentialReference: 'telegram.bot.local' } } };
    global.CONFIG = { get: key => key === 'profileExternalIdentity' ? policy : key === 'runtimeConfiguration' ? { credentials: { 'telegram.bot.local': { value: token } } } : undefined };
    records = new Map(); locked = false; issued = [];
    customers = Object.fromEntries(['a','b'].map(loginId => [loginId,{ loginId, _id: loginId, active: true, principalType: 'customer', authVersion: 1, password: { active: true } }]));
    global.SERVICE = {
        DefaultTelegramIdentityProviderService: telegram,
        DefaultEnterpriseService: { retrieveEnterprise: async code => ({ code, active: true, tenant: { code: 'tenant-a', active: true } }) },
        DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ principalType: 'service' }) },
        DefaultCustomerService: { findByLoginId: async ({loginId}) => customers[loginId], update: async ({query,model}) => Object.assign(customers[query.loginId],model.$set,{ authVersion: customers[query.loginId].authVersion + 1 }) },
        DefaultUserStateService: { findUserState: async () => ({ locked }) },
        DefaultExternalIdentityLinkService: {
            get: async ({tenant,query,options}) => { assert.equal(options.skipItemCache,true); const row = records.get(tenant+'|'+query.code); return { result: row ? [structuredClone(row)] : [] }; },
            save: async ({tenant,model}) => { const key=tenant+'|'+model.code; if(records.has(key)) throw Error('duplicate'); records.set(key,{...model,revision:1}); },
            update: async ({tenant,query,model}) => { const row=records.get(tenant+'|'+query.code); assert.equal(row.revision,query.revision); Object.assign(row,model,{revision:row.revision+1}); }
        },
        DefaultAuthenticationProviderService: { issueSession: async (options) => { issued.push(options); return {authToken:'access',refreshToken:'refresh'}; }, removeToken: async () => {}, recordAuthEvent: async () => true }
    };
});
test('signed launch verifies stable subject and bot without exposing profile/name/token', () => {
    const verified=telegram.verify({proof:proof(),application:policy.applications['app-a'],policy});
    assert.deepEqual(Object.keys(verified).sort(),['allowsWrite','applicationSubject','authenticatedAt','subject']);
    assert.equal(verified.subject,'42'); assert.equal(verified.applicationSubject,'123456789');
});
test('forged, duplicate, expired, future, malformed and bot assertions fail closed', () => {
    const bad=[proof().replace('42','43'),proof()+'&auth_date=3',proof(42,{auth_date:'1'}),proof(42,{auth_date:String(Math.floor(Date.now()/1000)+100)}),proof(42,{user:'{}'}),proof(42,{user:JSON.stringify({id:42,is_bot:true})})];
    for(const p of bad) assert.throws(()=>telegram.verify({proof:p,application:policy.applications['app-a'],policy}),{code:'ERR_PROFILE_EXTERNAL_ASSERTION'});
});
test('unlinked identity requires secure sign-in; explicit authenticated link permits session', async () => {
    assert.deepEqual(await identity.session(request()),{requiresProfileSession:true});
    assert.equal((await identity.link(request())).linked,true);
    const result=await identity.session(request());
    assert.equal(result.loginId,'a'); assert.equal(issued[0].person.loginId,'a'); assert.equal(records.size,1);
});
test('same-customer link retry is idempotent; a different customer cannot take it over', async () => {
    await identity.link(request()); await identity.link(request()); assert.equal(records.size,1);
    await assert.rejects(identity.link(request('b')),{code:'ERR_PROFILE_EXTERNAL_CONFLICT'});
});
test('concurrent conflicting link attempts leave exactly one canonical owner', async () => {
    const results=await Promise.allSettled([identity.link(request('a')),identity.link(request('b'))]);
    assert.equal(results.filter(r=>r.status==='fulfilled').length,1); assert.equal(records.size,1);
    assert.equal((await identity.session(request())).loginId,[...records.values()][0].principalCode);
});
test('body-supplied principal and provider service never replace verified context', async () => {
    await identity.link({...request(),principalCode:'b',service:'Untrusted',subject:'999'});
    assert.equal([...records.values()][0].principalCode,'a'); assert.equal([...records.values()][0].providerSubject,'42');
});
test('wrong enterprise, tenant, principal category and stale access stamp cannot link', async () => {
    for(const delta of [{tenant:'tenant-b'},{entCode:'enterprise-b'},{principalType:'service'},{authVersion:0}]) {
        const r=request(); Object.assign(r.authData,delta); await assert.rejects(identity.link(r),{code:'ERR_PROFILE_EXTERNAL_ASSERTION'});
    }
    await assert.rejects(identity.session({...request(),entCode:'enterprise-b'}),{code:'ERR_PROFILE_EXTERNAL_ASSERTION'});
    assert.equal(records.size,0);
});
test('locked/disabled accounts never receive a channel session', async () => {
    await identity.link(request()); locked=true;
    await assert.rejects(identity.session(request()),{code:'ERR_PROFILE_EXTERNAL_ASSERTION'});
    locked=false; customers.a.active=false;
    await assert.rejects(identity.session(request()),{code:'ERR_PROFILE_EXTERNAL_ASSERTION'}); assert.equal(issued.length,0);
});
test('changed password/security stamp requires account proof again', async () => {
    await identity.link(request()); customers.a.authVersion=2;
    assert.deepEqual(await identity.session(request()),{requiresProfileSession:true}); assert.equal(issued.length,0);
    const r=request();r.authData.authVersion=2;await identity.link(r);assert.equal((await identity.session(r)).loginId,'a');
});
test('unlink persists revocation and invalidates the existing principal stamp', async () => {
    await identity.link(request()); await identity.unlink(request());
    assert.equal(customers.a.authVersion,2); assert.equal([...records.values()][0].status,'REVOKED');
    assert.deepEqual(await identity.session(request()),{requiresProfileSession:true});
});
test('configured provider replacement preserves the owner link/session pipeline', async () => {
    policy.providers.OTHER={service:'PartnerIdentityVerifier'};policy.applications['app-a'].provider='OTHER';
    SERVICE.PartnerIdentityVerifier={verify:async ({proof:p})=>{assert.equal(p,'valid-provider-proof');return {subject:'opaque-subject',applicationSubject:'provider-app'};}};
    const r={...request(),proof:'valid-provider-proof'};await identity.link(r);assert.equal((await identity.session(r)).loginId,'a');
    assert.equal([...records.values()][0].provider,'OTHER');
});
test('missing Telegram credential reports unconfigured without process environment fallback', () => {
    process.env.NODICS_TEST_EXTERNAL_SECRET = token;
    CONFIG.get = key => key === 'profileExternalIdentity' ? policy : undefined;
    assert.throws(
        () => telegram.verify({proof:proof(),application:{...policy.applications['app-a'],secretEnvironmentVariable:'NODICS_TEST_EXTERNAL_SECRET'},policy}),
        error => error.code === 'ERR_PROFILE_EXTERNAL_UNAVAILABLE' &&
            error.runtimeConfigurationStatus === 'UNCONFIGURED' &&
            error.responseCode === 'TELEGRAM_CONFIGURATION_REQUIRED'
    );
});
test('unconfigured applications, invalid policy and unavailable verification remain closed', async () => {
    await assert.rejects(identity.session({...request(),applicationCode:'other'}),{code:'ERR_PROFILE_EXTERNAL_ASSERTION'});
    policy.maximumAssertionAgeSeconds=NaN;await assert.rejects(identity.session(request()),{code:'ERR_PROFILE_EXTERNAL_UNAVAILABLE'});
});

test('source recipient requires both signed proof and matching active customer link', async () => {
    await identity.link(request());
    const origin=await identity.origin(request());assert.equal(origin.providerSubject,'42');assert.equal(origin.identityLinkCode,[...records.values()][0].code);
    await assert.rejects(identity.origin(request('b')),{code:'ERR_PROFILE_EXTERNAL_ASSERTION'});
    customers.a.authVersion=2;await assert.rejects(identity.origin(request()),{code:'ERR_PROFILE_EXTERNAL_ASSERTION'});
});

test('Communication destination resolves canonical customer code and respects revocation',async()=>{customers.a.code='CUSTOMER_A';await identity.link(request());const link=[...records.values()][0];const input={tenant:'tenant-a',entCode:'enterprise-a',authData:{principalType:'service'},linkCode:link.code,recipientId:'CUSTOMER_A'};const destination=await identity.destination(input);assert.equal(destination.subject,'42');assert.equal(destination.credentialReference,'telegram.bot.local');assert.equal((await identity.destination({...input,recipientId:'a'})).allowed,false);await assert.rejects(identity.destination({...input,authData:{principalType:'customer'}}));link.status='REVOKED';records.set('tenant-a|'+link.code,link);assert.equal((await identity.destination(input)).allowed,false);});


test('external identity routes enter bearer authentication before owner controller dispatch', async () => {
    const routes = require('../src/router/routers').profile.authenticate;
    const handler = require('../../../../nodics.foundation/modules/nRouter/src/service/defaultRequestHandlerService');
    const pipeline = Object.assign({}, require('../../../../nodics.foundation/modules/nRouter/src/service/request/defaultRequestHandlerPipelineService'), { LOG: { debug() {} } });
    const inputs = [];
    CONFIG.get = key => key === 'responseHandler' ? { jsonResponseHandler: 'TestResponse' } : undefined;
    global.UTILS = { generateUniqueCode: () => 'test-request' };
    SERVICE.TestResponse = { handleSuccess() {}, handleError(error) { throw error; } };
    SERVICE.DefaultPipelineService = { start: async (name, input) => { inputs.push(input); return {}; } };
    for (const name of ['linkExternalCustomer', 'unlinkExternalCustomer', 'externalCustomerOrigin', 'externalDestination']) {
        const route = routes[name];
        handler.startRequestHandler({ get() {}, method: 'POST', body: {}, originalUrl: route.key }, {}, route);
        const input = inputs.at(-1), response = {};
        assert.equal(input.special, false, name + ' must not bypass bearer authentication');
        assert.equal(input.secured, true);
        let advanced = false;
        pipeline.handleSpecialRequest(input, response, { nextSuccess() { advanced = true; } });
        assert.equal(advanced, true);
        pipeline.redirectRequest(input, response, { nextSuccess() {} });
        assert.equal(response.targetNode, 'securedRequest');
        assert.deepEqual(route.authTokenTypes, [name === 'externalDestination' ? 'service' : 'access']);
    }
    assert.equal(routes.externalDestination.permission, 'communication.request');
    assert.deepEqual(routes.externalDestination.accessGroups, ['serviceAccountUserGroup']);
    await Promise.resolve();
});


test('channel-bound session resolves origin after launch expiry while fresh sign-in still rejects that proof', async () => {
    await identity.link(request());
    await identity.session(request());
    const binding = issued.at(-1).externalIdentityLinkCode;
    assert.equal(binding, [...records.values()][0].code);
    const aged = {...request(), proof: proof(42, {auth_date: String(Math.floor(Date.now()/1000)-900)})};
    await assert.rejects(identity.origin(aged), {code: 'ERR_PROFILE_EXTERNAL_ASSERTION'});
    await assert.rejects(identity.session(aged), {code: 'ERR_PROFILE_EXTERNAL_ASSERTION'});
    await assert.rejects(identity.link(aged), {code: 'ERR_PROFILE_EXTERNAL_ASSERTION'});
    const bound = {...aged, authData: {...aged.authData, externalIdentityLinkCode: binding}};
    const origin = await identity.origin(bound);
    assert.equal(origin.providerSubject, '42');
    assert.equal(origin.identityLinkCode, binding);
    assert.equal(origin.allowsWrite, true);
    assert.deepEqual(await identity.origin({...bound, proof: undefined}), origin);
});

test('session binding remains scoped to the active account, enterprise, application and identity link', async () => {
    await identity.link(request());
    const link = [...records.values()][0];
    const bound = {...request(), proof: undefined, authData: {...request().authData, externalIdentityLinkCode: link.code}};
    for (const delta of [{loginId: 'b'}, {tenant: 'other'}, {entCode: 'other'}, {principalType: 'service'}, {authVersion: 0}, {tokenType: 'refresh'}, {externalIdentityLinkCode: 'EID_'+'0'.repeat(64)}]) {
      await assert.rejects(identity.origin({...bound, authData: {...bound.authData, ...delta}}), {code:'ERR_PROFILE_EXTERNAL_ASSERTION'});
    }
    await assert.rejects(identity.origin({...bound, applicationCode:'other'}), {code:'ERR_PROFILE_EXTERNAL_ASSERTION'});
    await assert.rejects(identity.origin({...bound, entCode:'other'}), {code:'ERR_PROFILE_EXTERNAL_ASSERTION'});
    // Body-level fields cannot turn an ordinary password session into a channel session.
    await assert.rejects(identity.origin({...request(), proof:undefined, externalIdentityLinkCode:link.code}), {code:'ERR_PROFILE_EXTERNAL_ASSERTION'});
    locked=true; await assert.rejects(identity.origin(bound), {code:'ERR_PROFILE_EXTERNAL_ASSERTION'}); locked=false;
    policy.applications['app-a'].enabled=false; await assert.rejects(identity.origin(bound), {code:'ERR_PROFILE_EXTERNAL_ASSERTION'}); policy.applications['app-a'].enabled=true;
    link.status='REVOKED'; await assert.rejects(identity.origin(bound), {code:'ERR_PROFILE_EXTERNAL_ASSERTION'});
});
