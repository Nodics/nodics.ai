/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module nService/test/runtimeCredentialLifecycleContract @description Verifies explicit runtime identities, bounded tenant renewal, expiry-aware scheduling and drain completion. @layer test @owner nService */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const source = require('../src/service/authentication/defaultInternalAuthenticationProviderService');
global.CLASSES = { NodicsError: class NodicsError extends Error { constructor(code, message) { super(message || code); } } };
const configuration = { runtimeIdentity: { instanceCode: 'jobs-1' }, authSecurity: { internalToken: { maximumLifetimeSeconds: 300, renewalConcurrency: 2 }, jwt: { serviceTokenRefreshIntervalMs: 600000 } } };
global.CONFIG = { get: key => configuration[key] };
global.NODICS = { getEnvironmentName: () => 'warehouse.project', getSelectedEnvironmentName: () => 'qa', getServerName: () => 'jobs', getActiveModules: () => ['cronjob'] };
test('runtime declaration uses configured identity and refuses process-derived fallback', () => {
    assert.equal(source.buildRuntimeIdentityHeaders()['x-nodics-runtime-instance'], 'jobs-1');
    assert.equal(source.buildRuntimeIdentityHeaders()['x-nodics-project'], 'warehouse.project');
    configuration.runtimeIdentity = {}; assert.throws(() => source.buildRuntimeIdentityHeaders(), /approved instanceCode/);
    configuration.runtimeIdentity = { instanceCode: 'jobs-1' };
});
test('tenant renewal is bounded and waits for all started work before reporting a failure', async () => {
    const tokens = Object.fromEntries(Array.from({ length: 9 }, (_, i) => ['tenant-' + i, 'old']));
    NODICS.getInternalAuthTokens = () => tokens; NODICS.addInternalAuthToken = (tenant, token) => { tokens[tenant] = token; };
    let active = 0, maximum = 0, completed = 0;
    const instance = { ...source, fetchInternalAuthToken: async tenant => {
        active++; maximum = Math.max(maximum, active); await new Promise(setImmediate); active--; completed++;
        if (tenant === 'tenant-1') throw new Error('renewal-denied'); return { authToken: 'new' };
    } };
    await assert.rejects(instance.refreshInternalAuthTokens(), /renewal-denied/);
    assert.equal(maximum, 2); assert.equal(active, 0); assert.equal(completed, 9); assert.equal(tokens['tenant-1'], 'old');
});
test('renewal runs before expiry and stopping drains the in-flight batch without rescheduling', async t => {
    const originalSet = global.setTimeout, originalClear = global.clearTimeout;
    const timers = []; global.setTimeout = (fn, delay) => { const timer = { fn, delay, unref() {} }; timers.push(timer); return timer; };
    global.clearTimeout = timer => { timer.cleared = true; };
    t.after(() => { global.setTimeout = originalSet; global.clearTimeout = originalClear; });
    const token = ['e30', Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 30 })).toString('base64url'), 'signature'].join('.');
    NODICS.getInternalAuthTokens = () => ({ tenant: token });
    let release; const instance = { ...source, LOG: { error() {} }, refreshInternalAuthTokens: () => new Promise(resolve => { release = resolve; }) };
    instance.scheduleInternalAuthTokenRefresh(); assert(timers[0].delay >= 1000 && timers[0].delay <= 15000);
    timers[0].fn(); let drained = false; const stopped = instance.stopInternalAuthTokenRefresh().then(() => { drained = true; });
    await Promise.resolve(); assert.equal(drained, false); release(); await stopped; assert.equal(timers.length, 1);
    instance._refreshFailures = 10; assert.equal(instance.getInternalTokenRefreshDelay(), 30000);
});


test('revocation lookup distinguishes absent markers from unavailable or malformed authority responses', async () => {
    const authentication = require('../src/service/authentication/defaultAuthenticationProviderService');
    assert.equal(await authentication.isTokenRevoked(null), true);
    const owner = { ...authentication, findToken: async () => ({ revoked: true }) };
    assert.equal(await owner.isTokenRevoked('identifier'), true);
    owner.findToken = async () => { throw Object.assign(new Error('missing'), { code: 'ERR_CACHE_00001' }); };
    assert.equal(await owner.isTokenRevoked('identifier'), false);
    for (const failure of [new Error('provider unavailable'), new SyntaxError('invalid cached JSON'), Object.assign(new Error('channel disabled'), { code: 'ERR_CACHE_00008' })]) {
        owner.findToken = async () => { throw failure; };
        await assert.rejects(owner.isTokenRevoked('identifier'), error => error === failure);
    }
});

test('explicit remote capability requests preserve local composition and remain bounded', () => {
    configuration.runtimeIdentity = { instanceCode: 'jobs-1', remoteModules: ['profile', 'inventory', 'cronjob'] };
    assert.equal(source.buildRuntimeIdentityHeaders()['x-nodics-modules'], 'cronjob,profile,inventory');
    assert.deepEqual(NODICS.getActiveModules(), ['cronjob'], 'Remote API requests never activate source modules');
    for (const remoteModules of ['profile', ['bad/code'], Array(513).fill('profile')]) {
        configuration.runtimeIdentity.remoteModules = remoteModules;
        assert.throws(() => source.buildRuntimeIdentityHeaders(), /bounded module codes/);
    }
    configuration.runtimeIdentity = { instanceCode: 'jobs-1' };
});

test('revocation reads and writes share the configured security-stamp namespace without changing Profile ownership', async () => {
    const authentication = require('../src/service/authentication/defaultAuthenticationProviderService');
    configuration.authSecurity.securityStamp = { cacheModuleName: 'auth' };
    const namespaces = [];
    const owner = { ...authentication, findToken: async module => { namespaces.push(module); }, addToken: async module => { namespaces.push(module); } };
    assert.equal(await owner.isTokenRevoked('identifier'), true);
    await owner.revokeAccessToken({ jti: 'identifier', tenant: 'tenant-a' });
    assert.deepEqual(namespaces, ['auth', 'auth']);
    delete configuration.authSecurity.securityStamp;
    assert.equal(owner.getAuthStateCacheModuleName(), 'profile');
});
