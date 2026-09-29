/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { runCapabilityRegistryAcceptance } from '../src/service/acceptance/defaultCapabilityRegistryAcceptanceService.mjs';

function fixture(failBootstrap = false, denyActivation = false, technicalModules = ['workflow', 'cronjob']) {
  let state = { registrationState: 'DISCOVERED', enabled: false, catalogueRevision: 1,
    technicalModules, observedServers: ['partnerLocal:automation:default'] };
  const calls = [];
  const options = {
    execute: true, environment: { AXIS_PLATFORM_URL: 'https://platform.invalid', NODICS_ACCEPTANCE_ORIGIN: 'https://partner.invalid', AXIS_PASSWORD: 'fixture-only' },
    configuration: { environment: 'partnerLocal', projectCode: 'partner.store',
      acceptance: { capabilityRegistry: { runtime: { role: 'PROCESS' }, technicalModules } },
      topology: { groups: { backends: [{ role: 'PROCESS', server: 'automation' }] } } },
    log() {}, sleep: async () => {},
    fetch: async (url, request = {}) => {
      const route = new URL(url).pathname;
      calls.push({ route, request });
      if (route.endsWith('/authenticate')) return Response.json({ authToken: 'fixture-token' });
      if (route.endsWith('/registrations')) return Response.json({ items: [{ functionalModule: 'nodics.foundation' }] });
      if (route.endsWith('/bootstrap')) return Response.json({ catalogue: failBootstrap ? {} : Object.fromEntries(technicalModules.map(name => [name, {}])) });
      if (request.method === 'POST') {
        assert.equal(JSON.parse(request.body).project, 'partner.store');
        if (route.endsWith('/activate') && denyActivation) return Response.json({ message: 'denied' }, { status: 403 });
        if (route.endsWith('/register')) state.registrationState = 'REGISTERED';
        if (route.endsWith('/activate')) state.enabled = true;
        if (route.endsWith('/deactivate')) state.enabled = false;
        if (route.endsWith('/deregister')) state.registrationState = 'DISCOVERED';
        state.catalogueRevision++;
      }
      return Response.json(state);
    },
  };
  return { options, calls, state: () => state };
}

test('import is inert and mutation requires explicit execution intent', async () => {
  await assert.rejects(runCapabilityRegistryAcceptance({ fetch: () => assert.fail('must not call') }), /--execute/);
});

test('independent partner registration and activation restore their original state', async () => {
  const f = fixture();
  const result = await runCapabilityRegistryAcceptance(f.options);
  assert.equal(result.state, 'PASSED');
  assert.equal(f.state().registrationState, 'DISCOVERED');
  assert.equal(f.state().enabled, false);
  assert.deepEqual(f.calls.filter(c => c.request.method === 'POST' && !c.route.endsWith('/authenticate')).map(c => c.route.split('/').at(-1)),
    ['register', 'activate', 'deactivate', 'deregister']);
});

test('missing capability fails the suite and still restores test-owned changes', async () => {
  const f = fixture(true);
  await assert.rejects(runCapabilityRegistryAcceptance(f.options), /workflow capability/);
  assert.equal(f.state().enabled, false);
  assert.equal(f.state().registrationState, 'DISCOVERED');
});

test('authorization denial is not bypassed and registration is restored', async () => {
  const f = fixture(false, true);
  await assert.rejects(runCapabilityRegistryAcceptance(f.options), /HTTP 403/);
  assert.equal(f.state().registrationState, 'DISCOVERED');
  assert.equal(f.calls.filter(c => c.route.endsWith('/activate')).length, 1);
});

test('selection cannot disable all capability assertions', async () => {
  const f = fixture();
  f.options.configuration.acceptance.capabilityRegistry.technicalModules = [];
  await assert.rejects(runCapabilityRegistryAcceptance(f.options), /at least one/);
  assert.equal(f.calls.length, 0);
});

test('another domain uses the same invariant checks without a Process-specific fixture', async () => {
  const f = fixture(false, false, ['feedback']);
  const config = f.options.configuration;
  config.acceptance.capabilityRegistry.functionalModule = 'nodics.engagement';
  config.acceptance.capabilityRegistry.runtime.role = 'ENGAGEMENT';
  config.topology.groups.backends[0].role = 'ENGAGEMENT';
  assert.equal((await runCapabilityRegistryAcceptance(f.options)).state, 'PASSED');
  assert(f.calls.some(call => call.route.endsWith('/nodics.engagement/activate')));
  assert.equal(f.state().enabled, false);
});
