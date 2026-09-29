/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module backoffice/test/applicationBootstrapAcceptance @description Offline bootstrap invariants with independent customer fixtures and isolated API boundaries. @owner backoffice @layer test */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import { parse } from 'acorn';
import { runApplicationBootstrapAcceptance, validateBootstrapSelection } from '../src/service/acceptance/defaultApplicationBootstrapAcceptanceService.mjs';
import { projectEndpointUrl } from '../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectEnvironmentConfigurationService.mjs';

const require = createRequire(import.meta.url);
const source = readFileSync(new URL('../src/service/acceptance/defaultApplicationBootstrapAcceptanceService.mjs', import.meta.url), 'utf8');
const ast = parse(source, { ecmaVersion: 'latest', sourceType: 'module' });
const runner = ast.body.find(node => node.declaration?.id?.name === 'runApplicationBootstrapAcceptance').declaration;

// Compile the actual private function body with mocked dependencies, never its live entrypoint.
function isolated(name, context = {}) {
  const node = runner.body.body.find(node => node.type === 'FunctionDeclaration' && node.id.name === name);
  assert.ok(node, `Missing bootstrap function ${name}`);
  return new Function(...Object.keys(context), `return (${source.slice(node.start, node.end)})`)(...Object.values(context));
}

const selection = () => ({ platformInitializationProfile: 'partnerFoundation', publicOriginKey: 'partner' });
const pack = () => ({ code: 'partnerDocs', profileCode: 'partnerdocs', navigationComponent: 'partnerNavigation',
  site: 'partnerDocumentation', path: '/docs/partner', minimumRoutes: 0 });
const headers = { Authorization: 'Bearer fixture-only' };
const log = () => {};

test('import is inert and execution, publication and fresh startup intents are independent', async () => {
  for (const options of [{}, { execute: true }, { approvePublications: true }]) {
    await assert.rejects(runApplicationBootstrapAcceptance({ ...options, fetch: () => assert.fail('network before approval') }), /--execute --approve-publications/);
  }
  await assert.rejects(runApplicationBootstrapAcceptance({ execute: true, approvePublications: true, resetLocal: true,
    fetch: () => assert.fail('network before owned startup') }), /--start-runtimes/);
});

test('fixtures and LOCAL class are rejected before network or credential provisioning', async () => {
  const options = { execute: true, approvePublications: true, startRuntimes: true, environment: {},
    configuration: { topology: { groups: { backends: [{ role: 'PLATFORM', server: 'admin' }] } } },
    configurationProjection: { environment: { class: 'PRODUCTION' } },
    fetch: () => assert.fail('invalid input must never fetch') };
  await assert.rejects(runApplicationBootstrapAcceptance({ ...options, acceptanceConfiguration: { localBootstrap: {} } }), /Platform initialization profile/);
  await assert.rejects(runApplicationBootstrapAcceptance({ ...options, acceptanceConfiguration: { localBootstrap: {
    ...selection(), applicationBundles: [{ profileCode: 'partner' }],
  } } }), /Incomplete applicationBundles fixture/);
  await assert.rejects(runApplicationBootstrapAcceptance({ ...options, acceptanceConfiguration: { localBootstrap: selection() } }), /LOCAL environment class/);
});

test('customer bundle and update selections validate without requiring optional domains', () => {
  assert.deepEqual(validateBootstrapSelection(selection()), selection());
  for (const key of ['applicationBundles', 'applicationUpdates']) {
    const valid = { profileCode: 'partnerSite', deliveryProbe: { site: 'partner', path: '/' }, ...(key === 'applicationUpdates' ? { marker: 'partner-v2' } : {}) };
    assert.doesNotThrow(() => validateBootstrapSelection({ ...selection(), [key]: [valid] }));
    assert.throws(() => validateBootstrapSelection({ ...selection(), [key]: {} }), /must be an array/);
    for (const invalid of [{}, { ...valid, profileCode: '' }, { ...valid, deliveryProbe: { site: 'partner' } }]) {
      assert.throws(() => validateBootstrapSelection({ ...selection(), [key]: [invalid] }), /Incomplete/);
    }
  }
  assert.throws(() => validateBootstrapSelection({ ...selection(), applicationUpdates: [{ profileCode: 'partner', deliveryProbe: { site: 'partner', path: '/' }, marker: ' ' }] }), /Incomplete/);
});

test('framework runner stays API-only and delegates canonical tooling without customer identity branches', () => {
  assert.doesNotMatch(source, /isReferenceKickoffProject|descriptor\?\.acceptance\?\.localBootstrap|axisRoot|runAxisSmoke|smoke:live|isExpectedAcceptanceBackendNoise/);
  assert.doesNotMatch(source, /MongoClient|mongoose|dropDatabase|deleteMany/);
  assert.match(source, /environment\.AXIS_PROJECT \|\| resolveProjectCode\(packageDescriptor\)/);
  assert.match(source, /await publishDocumentationBundles\(refreshedHeaders\)/);
  assert.match(source, /selection\.platformInitializationProfile, "Platform foundation"/);
  assert.match(source, /selection\.locationInitializationProfile, "Location foundation"/);
  assert.match(source, /selection\.verifyDefaultLocationMap === true/);
  assert.match(source, /finally \{ if \(!leaveStarted\) await stopManagedProcesses\(\); \}/);
  const command = require('../config/properties').tooling.commands['acceptance:local'];
  assert.equal(command.script, 'src/service/acceptance/defaultApplicationBootstrapAcceptanceService.mjs');
  assert.equal(command.acceptanceContract, true);
});

test('project identity is package-owned and arbitrary valid customer names are accepted', () => {
  const resolve = isolated('resolveProjectCode');
  assert.equal(resolve({ name: 'partner.store' }), 'partner.store');
  for (const name of ['', '../other', '9invalid', undefined]) assert.throws(() => resolve({ name }), /stable Nodics project name/);
});

test('selected documentation descriptors are owner-provided and validated completely', () => {
  const acceptance = { localBootstrap: { documentationPackCodes: ['partnerDocs'], documentationPacks: { partnerDocs: pack() } } };
  const defaults = isolated('defaultLocalBootstrapCapabilities', { acceptance });
  const validate = isolated('validateLocalBootstrapCapabilities');
  const assertValid = isolated('assertValidLocalBootstrapCapabilities', { validateLocalBootstrapCapabilities: validate });
  const load = isolated('loadLocalBootstrapCapabilities', { defaultLocalBootstrapCapabilities: defaults, assertValidLocalBootstrapCapabilities: assertValid });
  assert.deepEqual(load(), { documentationPacks: [pack()], contentPacks: [] });
  for (const field of ['code', 'profileCode', 'navigationComponent', 'site', 'path']) {
    assert.throws(() => assertValid({ documentationPacks: [{ ...pack(), [field]: '' }], contentPacks: [] }), /Invalid local bootstrap capabilities/);
  }
  for (const bad of [null, {}, { documentationPacks: [null], contentPacks: [] },
    { documentationPacks: [{ ...pack(), path: 'relative' }], contentPacks: [] },
    { documentationPacks: [{ ...pack(), minimumRoutes: -1 }], contentPacks: [] }]) assert.throws(() => assertValid(bad), /Invalid local bootstrap capabilities/);
  delete acceptance.localBootstrap.documentationPacks.partnerDocs;
  assert.throws(load, /descriptor is unavailable/);
  acceptance.localBootstrap.documentationPackCodes = [];
  assert.throws(load, /Select documentation pack codes/);
});

test('map gate preserves configured provider and explicitly authorized HTTPS fallback policy', async () => {
  const baseline = { providerCode: 'MAPBOX', styleUrl: 'mapbox://styles/mapbox/streets-v12', fallbackProviderCode: 'OSM', fallbackPolicy: 'ALLOW_BASIC_MAP' };
  let effective = { ...baseline, configured: true, setupStatus: 'ACTIVE', publicAccessToken: 'pk.contract-fixture' };
  const gate = isolated('verifyLocationMapDefaults', { requestJson: async (url, route, options) => {
    assert.match(route, /surfaceCode=AXIS&usageCode=COLLECTION_CENTRE_MAP/);
    assert.equal(options.headers, headers);
    return effective;
  }, locationUrl: 'https://location.invalid', log });
  await gate(headers);
  effective = { ...baseline, configured: false, setupStatus: 'SETUP_REQUIRED', fallbackAllowed: true,
    fallbackRenderer: { providerCode: 'OSM', rendererType: 'XYZ_TILE', tileUrlTemplate: 'https://tiles.invalid/{z}/{x}/{y}.png' } };
  await gate(headers);
  const fallback = structuredClone(effective);
  for (const change of [{ fallbackAllowed: false }, { fallbackRenderer: { ...fallback.fallbackRenderer, tileUrlTemplate: 'http://untrusted.invalid' } },
    { fallbackRenderer: undefined }, { providerCode: 'OTHER' }, { fallbackPolicy: 'DENY' }]) {
    effective = { ...fallback, ...change };
    await assert.rejects(gate(headers), /not effective/);
  }
});

test('reset count follows configured owners and rejects invalid counts', () => {
  const count = isolated('resolveExpectedResetProviderCount');
  for (const value of [1, 7, 13]) assert.equal(count({ providerCount: value }), value);
  for (const value of [undefined, 0, -1, 1.5, 'invalid']) assert.throws(() => count({ providerCount: value }), /valid provider count/);
});

test('reset is explicit, API-only and requires matching acknowledgement from every owner', async () => {
  for (const enabled of [false, true]) {
    const calls = [];
    let stopped = 0;
    let result = { acknowledged: true, providerCount: 7 };
    const reset = isolated('executeGovernedFreshReset', { dropLocalDb: enabled, platformUrl: 'https://platform.invalid', log,
      resolveExpectedResetProviderCount: isolated('resolveExpectedResetProviderCount'), stopManagedProcesses: async () => { stopped++; },
      requestJson: async (url, route, request) => { calls.push(request); return request.method === 'POST' ? result : { ready: true, apiOnly: true, providerCount: 7 }; } });
    assert.equal(await reset(headers), enabled);
    assert.equal(stopped, enabled ? 1 : 0);
    assert.equal(calls.length, enabled ? 2 : 0);
    if (enabled) {
      assert.equal(JSON.parse(calls[1].body).confirmation, 'RESET_LOCAL_NODICS_DATA');
      result = { acknowledged: true, providerCount: 6 };
      await assert.rejects(reset(headers), /not fully acknowledged/);
      assert.equal(stopped, 1);
    }
  }
});

test('cleanup receives only owned children, including empty ownership for external runtimes', async () => {
  for (const managedProcesses of [[], [{ child: { pid: 10001 }, active: true }, { child: { pid: 10002 }, active: true }]]) {
    let received;
    await isolated('stopManagedProcesses', { managedProcesses, stopAcceptanceChildren: async (children, options) => {
      received = children;
      assert.equal(options.timeoutMs, 5000);
    } })();
    assert.deepEqual(received, managedProcesses.map(entry => entry.child));
    assert.ok(managedProcesses.every(entry => entry.active === false));
  }
});

test('fresh reset refuses busy selected backend ports without stopping their listeners', async () => {
  const probes = [];
  let busy = true;
  const context = { dropLocalDb: true, localPorts: [{ label: 'Partner', port: 4567 }, { label: 'Maps', port: 4568 }],
    portListening: async port => { probes.push(port); return busy && port === 4568; } };
  const check = isolated('assertFreshResetPortsAvailable', context);
  await assert.rejects(check(), /Busy ports: Maps 4568/);
  assert.deepEqual(probes, [4567, 4568]);
  busy = false;
  await check();
  probes.length = 0;
  await isolated('assertFreshResetPortsAvailable', { ...context, dropLocalDb: false })();
  assert.deepEqual(probes, []);
});

test('managed startup is opt-in, preserves external listeners and uses declared commands', async () => {
  for (const [managedStartupEnabled, listening, expectedStarts] of [[false, false, 0], [true, true, 0], [true, false, 1]]) {
    const starts = [], waits = [];
    const ensure = isolated('ensureProcess', { managedStartupEnabled, portListening: async () => listening,
      environmentProfile: { topology: { groups: { backends: [{ port: 4567, script: 'start:partner' }] } } },
      projectRoot: '/fixture/partner', startProcess: (...args) => starts.push(args), waitForHttp: async (...args) => waits.push(args) });
    await ensure('Partner', 4567, '/ignored', 'ignored', 'https://partner.invalid', '/ready');
    assert.equal(starts.length, expectedStarts);
    assert.deepEqual(waits, [['https://partner.invalid', '/ready', 'Partner']]);
    if (expectedStarts) assert.deepEqual(starts[0], ['Partner', '/fixture/partner', 'npm', ['run', 'start:partner'], 4567]);
  }
});

test('selected backend topology starts Location or custom roles without resolving unselected domains', async () => {
  const backends = [{ role: 'PLATFORM', server: 'admin' }, { role: 'LOCATION', server: 'maps', port: 4567, label: 'Maps', script: 'start:maps' },
    { role: 'CUSTOM', server: 'custom', port: 4568, label: 'Custom', script: 'start:custom' }, { role: 'COMMERCE', server: 'disabled', enabled: false }];
  const calls = [];
  await isolated('startSplitRuntimes', { environmentProfile: { topology: { groups: { backends } } }, projectRoot: '/fixture/partner',
    projectEndpointUrl: (profile, selected) => `http://localhost:${backends.find(item => item.server === selected.server).port}`,
    urlPort: value => Number(new URL(value).port), ensureProcess: async (...args) => calls.push(args) })();
  assert.deepEqual(calls.map(args => args[3]), ['start:maps', 'start:custom']);
});

test('fresh reset port inventory is derived only from enabled selected backends', () => {
  const declaration = runner.body.body.filter(node => node.type === 'VariableDeclaration')
    .flatMap(node => node.declarations).find(node => node.id.name === 'localPorts');
  assert.ok(declaration);
  const environmentProfile = { topology: { groups: { backends: [
    { code: 'partnerAdmin', server: 'admin', role: 'PLATFORM', port: 4567, host: 'localhost' },
    { code: 'partnerMaps', label: 'Maps', server: 'maps', role: 'LOCATION', port: 4568, host: 'localhost' },
    { code: 'inactive', server: 'inactive', enabled: false, port: 9999 },
  ] } } };
  const ports = new Function('environmentProfile', 'projectEndpointUrl', 'urlPort',
    `return (${source.slice(declaration.init.start, declaration.init.end)})`)(environmentProfile, projectEndpointUrl, value => Number(new URL(value).port));
  assert.deepEqual(ports, [{ label: 'partnerAdmin', port: 4567 }, { label: 'Maps', port: 4568 }]);
});

function publicationFixture({ initialReady = false, replay = { code: 'publication-1', state: 'ONLINE' }, delivered = { page: {} } } = {}) {
  let ready = initialReady;
  const calls = [], decisions = [], deliveries = [];
  const publish = isolated('publishApplicationProfileBundle', { platformUrl: 'https://platform.invalid', log,
    requestJson: async (url, route, request) => {
      calls.push({ route, request });
      if (route.endsWith('/initiate')) return { publication: ready ? replay : { code: 'publication-1', state: 'PENDING_APPROVAL' } };
      return { readiness: ready ? 'READY' : 'SETUP_REQUIRED', publication: { code: 'publication-1', state: ready ? 'ONLINE' : 'DRAFT' } };
    },
    decidePublication: async (...args) => { decisions.push(args); ready = true; },
    requestPublicDeliveryJson: async route => { deliveries.push(route); return delivered; } });
  return { run: () => publish(headers, 'partner/site', 'Fixture approval', { site: 'partnerSite', path: '/welcome', locale: 'ar', channel: 'mobile' }), calls, decisions, deliveries };
}

test('application publication approves once, repeats initiate and verifies identical Online publication and delivery', async () => {
  for (const initialReady of [false, true]) {
    const fixture = publicationFixture({ initialReady });
    await fixture.run();
    assert.equal(fixture.decisions.length, initialReady ? 0 : 1);
    assert.equal(fixture.calls.filter(call => call.route.endsWith('/initiate')).length, initialReady ? 1 : 2);
    assert.ok(fixture.calls.every(call => call.route.includes('partner%2Fsite')));
    assert.ok(fixture.calls.every(call => call.request.headers === headers));
    if (!initialReady) assert.deepEqual(fixture.decisions[0], [headers, 'publication-1', true, 'Fixture approval']);
    const query = new URL(fixture.deliveries[0], 'https://online.invalid').searchParams;
    assert.equal(query.get('site'), 'partnerSite');
    assert.equal(query.get('locale'), 'ar');
    assert.equal(query.get('channel'), 'mobile');
  }
});

test('replay publication identity or Online state drift fails before delivery', async () => {
  for (const replay of [{ code: 'different', state: 'ONLINE' }, { code: 'publication-1', state: 'PENDING_APPROVAL' }, {}]) {
    const fixture = publicationFixture({ initialReady: true, replay });
    await assert.rejects(fixture.run(), /repeat initialization did not retain/);
    assert.equal(fixture.deliveries.length, 0);
  }
  await assert.rejects(publicationFixture({ delivered: {} }).run(), /Online delivery probe failed/);
});

test('fresh documentation must be uninstalled and public installation denied', async () => {
  let status = 'NOT_INSTALLED', publicStatus = 403;
  const verify = isolated('verifyDocumentationInitiallyNotInstalled', { expectDocumentationNotInstalled: true, documentationPacks: [pack()],
    wcmsUrl: 'https://staged.invalid', publicOrigin: 'https://partner.invalid', log,
    requestJson: async () => ({ state: status }), requestJsonResponse: async () => ({ status: publicStatus }) });
  await verify(headers);
  publicStatus = 200;
  await assert.rejects(verify(headers), /installation request returned HTTP 200/);
  status = 'CURRENT';
  await assert.rejects(verify(headers), /must be NOT_INSTALLED/);
});

test('documentation publication uses selected profiles, Process approval and Online delivery', async () => {
  for (const initialReady of [false, true]) {
    let ready = initialReady;
    const calls = [];
    const publish = isolated('publishDocumentationBundles', {
      documentationPacks: [pack()], platformUrl: 'https://platform.invalid', processUrl: 'https://process.invalid', log,
      requestJson: async (url, route, request) => {
        calls.push({ url, route, request });
        assert.equal(request.headers, headers);
        if (route.endsWith('/initialization')) return { readiness: ready ? 'READY' : 'SETUP_REQUIRED', publication: { state: ready ? 'ONLINE' : 'DRAFT' } };
        if (route.endsWith('/initiate')) return { publication: { code: 'docs-publication', state: 'PENDING_APPROVAL' } };
        if (route.startsWith('/nodics/process/v0/instances?')) return { items: [{ code: 'review', definitionCode: 'cmsPublicationApproval', context: { publicationCode: 'docs-publication' }, status: 'WAITING' }] };
        if (route.startsWith('/nodics/process/v0/tasks?')) return { items: [{ code: 'task', instanceCode: 'review', nodeCode: 'publicationReview', status: 'OPEN' }] };
        if (route.endsWith('/claim')) return {};
        if (route.endsWith('/complete')) {
          assert.equal(JSON.parse(request.body).decision.approved, true);
          ready = true;
          return {};
        }
        assert.fail(`Unexpected API ${route}`);
      },
      requestPublicDeliveryJson: async route => {
        assert.equal(ready, true);
        const query = new URL(route, 'https://online.invalid').searchParams;
        assert.equal(query.get('site'), pack().site);
        assert.equal(query.get('path'), pack().path);
        return { page: {} };
      },
    });
    await publish(headers);
    assert.equal(calls.filter(call => call.route.endsWith('/complete')).length, initialReady ? 0 : 1);
    assert.ok(calls.some(call => call.route.includes('/applications/partnerdocs/')));
  }
});

test('documentation import alone must not expose pages Online before approval', async () => {
  let delivered = { status: 404 };
  const verify = isolated('verifyDocumentationNotOnlineBeforePublication', { expectDocumentationNotInstalled: true,
    documentationPacks: [pack()], wcmsOnlineUrl: 'https://online.invalid', log,
    requestJsonResponse: async () => delivered });
  await verify();
  delivered = { status: 200, body: { page: {} } };
  await assert.rejects(verify(), /became visible Online before publication approval/);
});

test('documentation rollback requires prior Online receipt and republishes selected profiles', async () => {
  let result = { readiness: 'ROLLED_BACK', publication: { state: 'ROLLED_BACK' }, lineage: { target: { receipts: [{ operation: 'DEPLOY', previousOnlineVersion: 'v1' }] } } };
  let published = 0;
  const calls = [];
  const rollback = isolated('qualifyDocumentationReleaseRollback', { qualifyDocumentationRollback: true,
    selection: { rollbackDocumentationProfiles: ['partnerdocs'] }, platformUrl: 'https://platform.invalid', log,
    requestJson: async (url, route) => { calls.push(route); return result; }, publishDocumentationBundles: async () => { published++; } });
  await rollback(headers);
  assert.deepEqual(calls, ['/nodics/backoffice/v0/applications/partnerdocs/initialization/rollback']);
  assert.equal(published, 1);
  result = { ...result, lineage: {} };
  await assert.rejects(rollback(headers), /rollback evidence is incomplete/);
  assert.equal(published, 1);
});

test('readiness requests retain the client contract and enterprise headers', async () => {
  let received;
  await isolated('expectHttpOk', { enterpriseCode: 'partnerTenant', clientContractVersion: '2', endpoint: (base, route) => new URL(route, base).href,
    fetch: async (url, options) => { received = { url, options }; return { ok: true }; } })('https://platform.invalid', '/ready');
  assert.deepEqual(received.options.headers, { 'x-enterprise-code': 'partnerTenant', 'x-nodics-client-contract-version': '2' });
});
