/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/test/projectRuntimeStartDiscoveryContract
 * @description Verifies project runtime startup derives server facts from environment server package metadata.
 * @layer test
 * @owner nTooling
 */

'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const service = require('../src/service/project/defaultProjectRuntimeStartService');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-runtime-discovery-'));
const frameworkRoot = path.join(root, 'nodics.ai');
const projectRoot = path.join(root, 'customer.project');
const environmentRoot = path.join(projectRoot, 'envs', 'customerLocal');
const serverRoot = path.join(environmentRoot, 'loyaltyServer');
const retiredRoot = path.join(environmentRoot, 'legacyServer');

function writeJson(file, value) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
}

writeJson(path.join(frameworkRoot, 'package.json'), { name: 'nodics.ai' });
writeJson(path.join(frameworkRoot, 'nodics.foundation', 'package.json'), { name: 'nodics.foundation' });
writeJson(path.join(frameworkRoot, 'nodics.loyalty', 'package.json'), { name: 'nodics.loyalty' });
writeJson(path.join(frameworkRoot, 'nodics.waste', 'package.json'), { name: 'nodics.waste' });
writeJson(path.join(frameworkRoot, 'nodics.accelerators/modules/waste', 'package.json'), { name: 'waste' });
writeJson(path.join(projectRoot, 'package.json'), { name: 'customer' });
writeJson(path.join(serverRoot, 'package.json'), {
    name: 'loyaltyServer',
    nodics: { kind: 'server', extends: ['nodics.loyalty'] }
});
writeJson(path.join(environmentRoot, 'wasteServer', 'package.json'), {
    name: 'wasteServer',
    nodics: {
        kind: 'server',
        extends: ['nodics.waste'],
        runtimeModuleRoots: ['nodics.waste', 'nodics.accelerators/modules/waste']
    }
});
writeJson(path.join(retiredRoot, 'package.json'), {
    name: 'legacyServerRetired',
    nodics: { kind: 'server', retired: true, replacementServers: ['wcmsStagedServer', 'wcmsOnlineServer'] }
});

service.readManifest(projectRoot);
const server = service.resolveServer(projectRoot, 'loyalty', {});
assert.equal(server.environment, 'customerLocal');
assert.equal(server.server, 'loyaltyServer');
assert.deepEqual(server.moduleRoots, ['nodics.foundation', 'nodics.loyalty', '{project}']);

const moduleRoots = service.resolveModuleRoots(projectRoot, frameworkRoot, server);
assert.deepEqual(moduleRoots, [
    path.join(frameworkRoot, 'nodics.foundation'),
    path.join(frameworkRoot, 'nodics.loyalty'),
    projectRoot
]);

const dockerServer = service.resolveServer(projectRoot, 'loyalty', { ENV: 'customerLocal' });
assert.equal(dockerServer.server, 'loyaltyServer');

const wasteServer = service.resolveServer(projectRoot, 'waste', {});
assert.deepEqual(wasteServer.moduleRoots, [
    'nodics.foundation',
    'nodics.waste',
    'nodics.accelerators/modules/waste',
    '{project}'
]);
assert.deepEqual(service.resolveModuleRoots(projectRoot, frameworkRoot, wasteServer), [
    path.join(frameworkRoot, 'nodics.foundation'),
    path.join(frameworkRoot, 'nodics.waste'),
    path.join(frameworkRoot, 'nodics.accelerators/modules/waste'),
    projectRoot
]);

assert.throws(
    () => service.resolveServer(projectRoot, 'legacy', {}),
    /Project runtime server is retired: legacy/
);

const strictService = Object.assign({}, service, {
    readStartupTopology: async () => ({
        topology: { groups: { backends: [
            { code: 'platform', server: 'platformServer', label: 'Platform', port: 4300 },
            { code: 'process', server: 'processServer', label: 'Process', asyncServerStartup: false, dependsOn: ['platform'] },
            { code: 'waste', server: 'wasteServer', label: 'Waste', asyncServerStartup: true, dependsOn: ['platform'] }
        ] } }
    }),
    probeStartupDependency: async dependency => {
        if (dependency.code === 'platform') throw new Error('Runtime readiness is unreachable');
        return true;
    }
});

(async function () {
    assert.equal(service.runtimeOrigin({ protocol: 'https', host: '::1', port: 5890 }), 'https://[::1]:5890');
    assert.equal(service.runtimeOrigin({ host: '[::1]', port: 5890 }), 'http://[::1]:5890');
    const calls = [];
    const effective = Object.assign({}, service, {
        runtimeOrigin: function (runtime) { calls.push(['origin', runtime.code]); return 'https://dependency.example.test'; },
        boundedFetch: async function (url, options) { calls.push([url, options]); return { ok: true }; }
    });
    await effective.probeStartupDependency({ code: 'customAuthority', dependencyTimeoutMs: 123,
        readinessChecks: [{ path: '/admission', headers: { 'x-contract': 'fixture' } }] });
    assert.deepEqual(calls, [['origin', 'customAuthority'],
        ['https://dependency.example.test/nodics/system/v0/health/ready', { headers: {}, timeoutMs: 123 }],
        ['https://dependency.example.test/admission', { headers: { 'x-contract': 'fixture' }, timeoutMs: 123 }]]);
    const originalFetch = Object.getOwnPropertyDescriptor(global, 'fetch');
    try {
        global.fetch = async (url, options) => {
            assert.equal(url, 'https://dependency.example.test');
            assert.equal(options.method, 'GET');
            assert.equal(options.redirect, 'error');
            assert(options.signal instanceof AbortSignal);
            assert.deepEqual(options.headers, { 'x-contract': 'fixture' });
            return { ok: true };
        };
        assert.equal((await service.boundedFetch('https://dependency.example.test', { headers: { 'x-contract': 'fixture' }, timeoutMs: 123 })).ok, true);
    } finally {
        if (originalFetch) Object.defineProperty(global, 'fetch', originalFetch);
        else delete global.fetch;
    }
    await assert.rejects(
        () => strictService.enforceStartupDependencies(projectRoot, { environment: 'customerLocal', server: 'processServer' }),
        /processServer startup blocked because required runtime `Platform` is unavailable/,
        'strict runtime startup must fail fast when mandatory dependency admission is unavailable'
    );

    await assert.doesNotReject(
        () => strictService.enforceStartupDependencies(projectRoot, { environment: 'customerLocal', server: 'wasteServer' }),
        'async runtime startup must not block process startup when dependency admission is still retrying'
    );

    console.log('nTooling project runtime start discovery contract validated');
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
}).finally(() => fs.rmSync(root, { recursive: true, force: true }));
