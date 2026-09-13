/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nConfig/test/startupFailureCleanupContract
 * @description Exercises awaited startup and acquired-resource cleanup using the existing lifecycle owner.
 * @layer test
 * @owner nConfig
 */
const assert = require('node:assert/strict');
const test = require('node:test');
const framework = require('../../../nodics');
const lifecycle = require('../src/service/DefaultRuntimeLifecycleService');

function fixture() {
    lifecycle.reset();
    let state = 'starting';
    const calls = [];
    lifecycle.LOG = { error: error => calls.push(error.message) };
    global.CONFIG = { get: name => name === 'runtimeLifecycle' ? {
        installSignalHandlers: false, contributorTimeoutMs: 15, shutdownTimeoutMs: 150
    } : undefined };
    global.NODICS = { getServerState: () => state, setServerState: value => { state = value; },
        setEndTime() {}, getStartDuration: () => 1, LOG: { info() {} } };
    global.SERVICE = { DefaultRuntimeLifecycleService: lifecycle,
        DefaultRouterService: { startServers: async () => { calls.push('listen'); } } };
    const runtime = Object.assign({}, framework, { initFramework: async () => { calls.push('init'); } });
    return { runtime, calls, state: () => state };
}

test('startup promise waits for initialization and listener completion', async () => {
    const f = fixture();
    let release;
    f.runtime.initFramework = () => new Promise(resolve => { release = resolve; });
    const started = f.runtime.start({});
    await Promise.resolve();
    assert.deepEqual(f.calls, []);
    assert.equal(f.state(), 'starting');
    release();
    assert.equal(await started, true);
    assert.deepEqual(f.calls, ['listen']);
    assert.equal(f.state(), 'started');
});

test('partial initialization closes acquired resources before rejecting the original error', async () => {
    const f = fixture();
    const original = new Error('required import failed');
    let close;
    f.runtime.initFramework = async () => {
        lifecycle.registerContributor('openedDatabase', { shutdown: () => new Promise(resolve => { close = resolve; }) });
        throw original;
    };
    let rejected = false;
    const started = f.runtime.start({}).catch(error => { rejected = true; assert.equal(error, original); });
    while (!close) await new Promise(resolve => setImmediate(resolve));
    assert.equal(rejected, false);
    assert.equal(f.state(), 'stopping');
    close();
    await started;
    assert.equal(f.state(), 'stopped');
    assert.deepEqual(f.calls, []);
});

test('listener failure drains in owner order, tolerates a cleanup failure and timeout, and retains the first error', async () => {
    const f = fixture();
    const original = new Error('listener occupied');
    SERVICE.DefaultRouterService.startServers = async () => { throw original; };
    lifecycle.registerContributor('http', { order: 100, drain: () => f.calls.push('http:drain'),
        shutdown: () => { f.calls.push('http:close'); throw new Error('close failed'); } });
    lifecycle.registerContributor('hung', { order: 200, timeoutMs: 2, shutdown: () => new Promise(() => {}) });
    lifecycle.registerContributor('database', { order: 600, shutdown: () => f.calls.push('database:close') });
    await assert.rejects(f.runtime.start({}), error => error === original);
    assert.equal(f.state(), 'stopped');
    assert(f.calls.indexOf('http:drain') < f.calls.indexOf('http:close'));
    assert(f.calls.indexOf('http:close') < f.calls.indexOf('database:close'));
    assert(f.calls.some(value => value.includes('timed out')));
    assert(f.calls.includes('close failed'));
    lifecycle.reset();
});


test('initial runtime credentials use the same approved provider path before enterprise loading', async t => {
    const config = require('..');
    const originals = {};
    for (const key of ['start', 'initUtilities', 'loadModules', 'initEntities', 'finalizeEntities', 'finalizeModules']) {
        originals[key] = config[key];
        config[key] = async () => true;
    }
    t.after(() => Object.assign(config, originals));
    const calls = [];
    global.CONFIG = { get: key => key === 'defaultTenant' ? 'company-tenant' : undefined };
    global.NODICS = { getActiveModules: () => ['profile'], isInitRequired: () => false,
        addInternalAuthToken: (tenant, token) => { assert.equal(tenant, 'company-tenant'); assert.equal(token, 'approved'); calls.push('token'); } };
    global.SERVICE = {
        DefaultScriptsHandlerService: { executePostScripts: async () => calls.push('scripts') },
        DefaultDataReleaseService: { installStartupReleases: async () => calls.push('init') },
        DefaultInternalAuthenticationProviderService: {
            fetchInternalAuthToken: async tenant => { assert.equal(tenant, 'company-tenant'); calls.push('proof-and-grant'); return { authToken: 'approved' }; },
            scheduleInternalAuthTokenRefresh: () => calls.push('renewal')
        },
        DefaultEnterpriseHandlerService: { buildEnterprises: async () => calls.push('enterprises') },
        DefaultServiceTokenService: { issue: () => assert.fail('startup must not bypass runtime approval') }
    };
    const runtime = { ...framework, executeMandatoryBootstrapServices: async () => calls.push('reconcile') };
    await runtime.initFramework({});
    assert.deepEqual(calls, ['scripts', 'init', 'reconcile', 'proof-and-grant', 'token', 'enterprises', 'renewal']);
    calls.length = 0;
    const denied = new Error('runtime grant missing');
    SERVICE.DefaultInternalAuthenticationProviderService.fetchInternalAuthToken = async () => { throw denied; };
    await assert.rejects(runtime.initFramework({}), error => error === denied);
    assert.deepEqual(calls, ['scripts', 'init', 'reconcile']);
});
