/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */


import test from 'node:test';
import assert from 'node:assert/strict';
import contribution from '../data/backoffice/wasteCoreBackofficeCapabilityData.js';
import { runWasteBackofficeAcceptance, validateWasteBootstrap, main } from '../src/service/acceptance/defaultWasteBackofficeAcceptanceService.mjs';
/** @module wasteCore/test/wasteBackofficeAcceptance @description Verifies framework discovery invariants and denied states with no grant mutation. @layer test @owner wasteCore */
function bootstrap() {
  const navigation = contribution.navigation.map(item => ({ ...item, route: item.route || '/waste/' + item.id,
    requiredPermissions: ['waste.backoffice.view'], featureState: item.featureState || 'ACTIVE', group: contribution.defaults.group,
    workbenchTarget: { moduleName: item.moduleName || 'wasteCore', schemaName: item.schemaName } }));
  return { catalogue: { wasteCore: { ...contribution.capability, activeModuleLeases: 1, navigation } },
    effectiveNavigationComposition: { groups: [contribution.defaults.group],
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
test('authorization error propagates', async () => {
  await assert.rejects(runWasteBackofficeAcceptance({ project: 'partner', observedServer: 'server',
    authenticate: async () => { throw new Error('denied'); } }), /denied/);
});
