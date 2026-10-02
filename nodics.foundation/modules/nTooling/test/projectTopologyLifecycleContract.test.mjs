/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import writeEnvironment from './helpers/environmentFixture.cjs';

/**
 * @description Tests topology selection, readiness and ownership with isolated fixtures.
 * Terminal-exit cases inject nSystem contributor diagnostics. Default Local public
 * /health/ready has no data.checks, so these cases do not qualify live early exit
 * in that composition; registration can stop retrying while readiness times out.
 */
test('independent topology selection, dependency failures and supervisor ownership', async () => {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'topology-contract-')));
  const previous = { cwd: process.cwd(), env: process.env.ENV, framework: process.env.NODICS_FRAMEWORK_ROOT };
  try {
    fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ name: 'independent.topology' }));
    writeEnvironment(path.join(root, 'envs', 'qa'), { topology: { groups: { backends: [
      { code: 'authority', port: 5810 }, { code: 'worker', port: 5811, dependsOn: ['authority'] },
    ] } } });
    writeEnvironment(path.join(root, 'envs', 'empty'), {});
    process.chdir(root);
    process.env.ENV = 'qa';
    process.env.NODICS_FRAMEWORK_ROOT = fileURLToPath(new URL('../../../../', import.meta.url));
    const topology = await import('../src/service/project/defaultProjectTopologyService.mjs');
    const selected = topology.selectRuntimes();
    assert.deepEqual(selected.map(runtime => runtime.code), ['authority', 'worker']);
    assert.equal(selected[0].readyPath, '/nodics/system/v0/health/ready');
    assert.deepEqual(topology.selectRuntimes(true), selected);
    const outage = { runtimes: selected, probePort: async () => false, readProcesses: () => '1 /sbin/launchd' };
    assert.deepEqual((await topology.verifyMaintenanceOutage(outage)).runtimeCodes, ['authority', 'worker']);
    await assert.rejects(topology.verifyMaintenanceOutage({ ...outage, runtimes: [] }), /complete explicit/);
    await assert.rejects(topology.verifyMaintenanceOutage({ ...outage, probePort: async () => true }), /listening runtime/);
    await assert.rejects(topology.verifyMaintenanceOutage({ ...outage, probePort: async () => undefined }), /inconclusive/);
    await assert.rejects(topology.verifyMaintenanceOutage({ ...outage, probePort: async () => { throw new Error('probe timeout'); } }), /probe timeout/);
    await assert.rejects(topology.verifyMaintenanceOutage({ ...outage, readProcesses: () => '' }), /inventory unavailable/);
    await assert.rejects(topology.verifyMaintenanceOutage({ ...outage, readProcesses: () => '999999 node defaultProjectTopologyService.mjs start' }), /active runtime/);
    await assert.rejects(topology.verifyMaintenanceOutage({ ...outage, readProcesses: () => '999999 node nodics start --server=worker' }), /active runtime/);
    await assert.rejects(topology.verifyMaintenanceOutage({ ...outage, readProcesses: () => { throw new Error('inspection denied'); } }), /inspection denied/);
    assert.deepEqual(topology.runtimeDependencyViolations(selected), []);
    for (const [runtimes, message] of [
      [[{ code: 'worker', dependsOn: ['missing'] }], /unknown runtime missing/],
      [[...selected].reverse(), /must be declared after dependency/],
      [[{ code: 'worker', dependsOn: ['worker'] }], /must be declared after dependency/],
    ]) assert.match(topology.runtimeDependencyViolations(runtimes).join('\n'), message);
    const state = { supervisorPid: 123, projectRoot: root };
    assert.equal(topology.isOwnedSupervisor(state, () => 'node defaultProjectTopologyService.mjs start'), true);
    for (const invalid of [null, { ...state, supervisorPid: '123' }, { ...state, projectRoot: '/other' }])
      assert.equal(topology.isOwnedSupervisor(invalid, () => assert.fail('must not inspect unrelated PID')), false);
    assert.equal(topology.isOwnedSupervisor(state, () => 'node unrelated.js'), false);
    assert.equal(topology.isOwnedSupervisor(state, () => { throw new Error('PID gone'); }), false);
    const ownedState = { ...state, children: [{ code: 'authority', pid: 201 }, { code: 'worker', pid: 202 }] };
    const calls = [];
    const dependencies = { runtimes: selected, state: ownedState, owned: () => true,
      probe: async runtime => { calls.push(runtime.code); return { data: { status: 'UP' } }; } };
    assert.deepEqual((await topology.assertTopologyReadiness(['authority', 'worker'], dependencies)).map(item => item.code), ['authority', 'worker']);
    assert.deepEqual(calls, ['authority', 'worker']);
    for (const [codes, changes, message] of [
      [[], {}, /explicit runtime codes/],
      [['authority', 'authority'], {}, /distinct/],
      [['unknown'], {}, /Unknown topology runtime/],
      [['worker'], {}, /unknown runtime authority/],
      [['authority'], { owned: () => false }, /topology supervisor/],
      [['worker', 'authority'], {}, /must be declared after dependency/],
      [['authority', 'worker'], { state: { ...ownedState, children: [{ code: 'authority', pid: 201 }] } }, /not an active child/],
      [['authority'], { state: { ...ownedState, children: [{ code: 'authority', pid: 201, exited: true }] } }, /not an active child/],
    ]) await assert.rejects(topology.assertTopologyReadiness(codes, { ...dependencies, ...changes,
      probe: () => assert.fail('invalid ownership/selection must fail before HTTP') }), message);
    await assert.rejects(topology.assertTopologyReadiness(['authority'], { ...dependencies,
      probe: async () => { throw new Error('transport unavailable'); } }), /transport unavailable/);

    const response = (body, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => body });
    const requested = [];
    const withCheck = { ...selected[0], readinessChecks: [{ label: 'protected capability', path: '/protected', expectedStatuses: [403] }] };
    await topology.checkRuntimeReadiness(withCheck, { fetchResponse: async (url, options) => {
      requested.push(url);
      assert.equal(options.redirect, 'error');
      assert(options.signal instanceof AbortSignal);
      return url.endsWith('/protected') ? response({}, 403) : response({ data: { status: 'UP' } });
    } });
    assert.deepEqual(requested, ['http://127.0.0.1:5810/nodics/system/v0/health/ready', 'http://127.0.0.1:5810/protected']);
    for (const body of [{ success: true }, { ready: true }, { status: 'UP' }, { data: { status: 'DOWN' } }])
      await assert.rejects(topology.checkRuntimeReadiness(selected[0], { fetchResponse: async () => response(body) }), /not UP/);
    await assert.rejects(topology.checkRuntimeReadiness(selected[0], { fetchResponse: async () => response({ data: { status: 'UP' } }, 503) }), /HTTP 503/);
    await assert.rejects(topology.checkRuntimeReadiness(selected[0], { fetchResponse: async () => ({ ok: true, json: async () => { throw new Error('invalid JSON'); } }) }), /invalid JSON/);
    await assert.rejects(topology.checkRuntimeReadiness(withCheck, { fetchResponse: async () => response({ data: { status: 'UP' } }) }), /protected capability HTTP 200/);
    const terminal = { name: 'backofficeRegistration', required: true, status: 'DOWN',
      reasonCode: 'BACKOFFICE_REGISTRATION_REPAIR_REQUIRED', suggestedAction: 'private-sentinel' };
    for (const status of [200, 503]) {
      let probes = 0;
      await assert.rejects(topology.waitUntilReady(selected[0], 90000, undefined, {
        probe: runtime => { probes++; return topology.checkRuntimeReadiness(runtime, {
          fetchResponse: async () => response({ data: { status: 'DOWN', checks: [terminal] } }, status) }); },
        pause: () => assert.fail('terminal registration must fail before polling delay'),
      }), error => error.code === 'BACKOFFICE_REGISTRATION_REPAIR_REQUIRED' && !error.message.includes('private-sentinel'));
      assert.equal(probes, 1);
    }
    for (const check of [{ ...terminal, required: false }, { ...terminal, name: 'other' },
      { ...terminal, status: 'UP' }, { ...terminal, reasonCode: 'BACKOFFICE_OPERATIONAL_STATE_MISSING' }]) {
      await assert.rejects(topology.checkRuntimeReadiness(selected[0], { fetchResponse: async () =>
        response({ data: { status: 'DOWN', checks: [check] } }) }), error => error.code === undefined && /not UP/.test(error.message));
    }
    let recoverProbes = 0, pauses = 0;
    await topology.waitUntilReady(selected[0], 90000, undefined, {
      probe: async runtime => {
        recoverProbes++;
        if (recoverProbes === 1) throw Object.assign(new Error('connection unavailable'), { code: 'ECONNREFUSED' });
        return topology.checkRuntimeReadiness(runtime, { fetchResponse: async () =>
          response({ data: { status: recoverProbes === 2 ? 'DOWN' : 'UP' } }, recoverProbes === 2 ? 503 : 200) });
      }, pause: async () => { pauses++; },
    });
    assert.equal(recoverProbes, 3);
    assert.equal(pauses, 2);
    // An empty declaration exercises preflight without touching any live port.
    process.env.ENV = 'empty';
    const result = await topology.preflight();
    for (const [id, status] of [['runtime-dependencies', 'PASSED'], ['framework-root', 'PASSED'], ['database-authority', 'DEFERRED_TO_RUNTIME_READINESS']])
      assert.equal(result.checks.find(check => check.id === id)?.state, status);
    process.env.NODICS_FRAMEWORK_ROOT = path.join(root, 'missing-framework');
    assert.equal((await topology.preflight()).ready, false);
    const source = fs.readFileSync(new URL('../src/service/project/defaultProjectTopologyService.mjs', import.meta.url), 'utf8');
    assert.match(source, /other runtimes remain running/);
    assert.match(source, /Refusing to start because required ports are busy/);
  } finally {
    process.chdir(previous.cwd);
    for (const [key, value] of [['ENV', previous.env], ['NODICS_FRAMEWORK_ROOT', previous.framework]]) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
    fs.rmSync(root, { recursive: true, force: true });
  }
});
