/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */


import test from 'node:test';
import assert from 'node:assert/strict';
import capabilityProvider from '../src/service/defaultWasteBackofficeCapabilityService.js';
import capabilityDefinitionService from '../../../../nodics.foundation/modules/nService/src/service/module/defaultBackofficeCapabilityDefinitionService.js';
import capabilityDataService from '../../../../nodics.foundation/modules/nService/src/service/module/defaultBackofficeCapabilityDataService.js';
import { runWasteBackofficeAcceptance, validateWasteBootstrap, main } from '../src/service/acceptance/defaultWasteBackofficeAcceptanceService.mjs';
/** @module wasteCore/test/wasteBackofficeAcceptance @description Verifies framework discovery invariants and denied states with no grant mutation. @layer test @owner wasteCore */
function effectiveCapability() {
  const originalService = globalThis.SERVICE;
  try {
    globalThis.SERVICE = {
      ...(originalService || {}),
      DefaultBackofficeCapabilityDefinitionService: capabilityDefinitionService,
      DefaultBackofficeCapabilityDataService: capabilityDataService,
    };
    return capabilityProvider.getCapability();
  } finally {
    globalThis.SERVICE = originalService;
  }
}
function bootstrap() {
  const capability = effectiveCapability();
  const group = capability.navigation.find(item => item.id === 'waste-management').group;
  return { catalogue: { wasteCore: { ...capability, activeModuleLeases: 1 } },
    effectiveNavigationComposition: { groups: [group],
      navigation: [{ moduleName: 'wasteCore', id: 'waste-management', routeOwner: { ownerType: 'WORKBENCH' } }] } };
}
function registration() {
  return { functionalModule: 'nodics.waste', registrationState: 'REGISTERED', enabled: true, runtimeState: 'ACTIVE',
    observedServers: ['PartnerLocal:recycling:default'], technicalModules: ['wasteCore', 'wasteApi', 'wasteMaterial', 'wasteCollection', 'wasteSubmission'] };
}
test('help is inert', async () => assert.match((await main(['--help'])).usage, /read-only/));
test('alternate topology validates authorized metadata without writes', async () => {
  const calls = [];
  const result = await runWasteBackofficeAcceptance({ project: 'partner', observedServer: 'PartnerLocal:recycling:default',
    authenticate: async () => ({ Authorization: 'Bearer employee' }),
    request: async (role, route, options) => { calls.push(options); assert.equal(role, 'PLATFORM'); return route.includes('registrations') ? registration() : bootstrap(); } });
  assert.equal(result.state, 'PASSED');
  assert.equal(calls.length, 2);
  assert(calls.every(options => !options.method));
});
test('inactive registration rejects without repairing', async () => {
  await assert.rejects(runWasteBackofficeAcceptance({ project: 'partner', observedServer: 'other',
    authenticate: async () => ({}), request: async () => ({ ...registration(), enabled: false }) }), /normal governed setup/);
});
test('wrong observed runtime rejects', async () => {
  await assert.rejects(runWasteBackofficeAcceptance({ project: 'partner', observedServer: 'wrong',
    authenticate: async () => ({}), request: async () => registration() }), /observed through/);
});
test('missing navigation and permission filtering reject', () => {
  const data = bootstrap();
  data.catalogue.wasteCore.navigation = [];
  assert.throws(() => validateWasteBootstrap(data), /navigation is missing/);
  const denied = bootstrap();
  denied.catalogue.wasteCore.requiredPermissions = [];
  assert.throws(() => validateWasteBootstrap(denied), /must require/);
});
test('submission navigation rejects the physical schema owner instead of the secured Waste API workbench', () => {
  const data = bootstrap();
  data.catalogue.wasteCore.navigation.find(item => item.id === 'waste-submissions').workbenchTarget.moduleName = 'wasteSubmission';
  assert.throws(() => validateWasteBootstrap(data), /generic Waste submission schema workbench/);
});
test('authorization error propagates', async () => {
  await assert.rejects(runWasteBackofficeAcceptance({ project: 'partner', observedServer: 'server',
    authenticate: async () => { throw new Error('denied'); } }), /denied/);
});
