/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

import writeEnvironment from './helpers/environmentFixture.cjs';
/**
 * @module nTooling/test/projectEnvironmentProfileContract
 * @description Guards environment-owned local topology and acceptance profile discovery.
 * @layer test
 * @owner nTooling
 */

import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  projectEndpointUrl,
  projectRuntime,
  projectInitializationProfile,
  projectCorsOrigin,
  readProjectEnvironmentComposition,
  readProjectEnvironmentConfiguration,
  resolveDomainComposition,
} from '../src/service/project/defaultProjectEnvironmentConfigurationService.mjs';

function writeJson(filePath, value) {
  if (filePath.endsWith('/config/properties.js')) return writeEnvironment(path.dirname(path.dirname(filePath)), value);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + '\n');
}

test('project environment profile resolves local topology from env-owned file', () => {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-env-profile-'));
  writeJson(path.join(projectRoot, 'package.json'), {
    name: 'acme.startio',
  });
  writeJson(path.join(projectRoot, 'envs', 'startioLocal', 'config/properties.js'), {
    contractVersion: 1,
    environment: 'startioLocal',
    topology: {
      stateDirectory: 'envs/startioLocal/generated/local-topology',
      groups: {
        backends: [{ code: 'platform', label: 'Platform', script: 'start:platform', port: 4300 }],
      },
    },
    acceptance: {
      guidedInitialization: { profileCode: 'localWcmsFoundation' },
    },
    composition: {
      agora: {
        selection: 'all',
        domains: [
          {
            code: 'apparel',
            frameworkGroup: 'apparel',
            projectPack: 'agora.apparel',
            productSearchContributor: {
              serviceName: 'DefaultApparelProductSearchEnrichmentService',
              required: true,
            },
          },
          {
            code: 'telco',
            frameworkGroup: 'telco',
            projectPack: 'agora.telco',
            impliedProductSearchContributorDomains: ['electronics'],
            productSearchContributor: {
              serviceName: 'DefaultTelcoProductSearchEnrichmentService',
              required: true,
            },
          },
          {
            code: 'electronics',
            frameworkGroup: 'electronics',
            projectPack: 'agora.electronics',
            productSearchContributor: {
              serviceName: 'DefaultElectronicsProductSearchEnrichmentService',
              required: true,
            },
          },
        ],
        sharedModules: [{ module: 'domainCommerceCore', minSelectedDomains: 2 }],
      },
    },
  });

  const profile = readProjectEnvironmentConfiguration(projectRoot);
  const composition = readProjectEnvironmentComposition(projectRoot);

  assert.equal(profile.environment, 'startioLocal');
  assert.equal(profile.stateDirectory, path.join(projectRoot, 'envs/startioLocal/generated/local-topology'));
  assert.equal(profile.topology.groups.backends[0].code, 'platform');
  assert.equal(profile.acceptance.guidedInitialization.profileCode, 'localWcmsFoundation');
  assert.deepEqual(composition.domains, ['apparel', 'telco', 'electronics']);
  assert.deepEqual(composition.frameworkGroups, ['apparel', 'telco', 'electronics']);
  assert.deepEqual(composition.sharedModules, ['domainCommerceCore']);
  assert.deepEqual(composition.projectPacks, ['agora.apparel', 'agora.telco', 'agora.electronics']);
  assert.deepEqual(Object.keys(composition.productSearchContributors), ['apparel', 'electronics', 'telco']);
});

test('domain composition resolver supports environment selections without project config files', () => {
  const compositionConfig = {
    emptySelections: ['none', 'commerce'],
    selection: 'all',
    domains: [
      { code: 'apparel', frameworkGroup: 'apparel', projectPack: 'agora.apparel', productSearchContributor: { serviceName: 'DefaultApparelProductSearchEnrichmentService', required: true } },
      { code: 'electronics', frameworkGroup: 'electronics', projectPack: 'agora.electronics', productSearchContributor: { serviceName: 'DefaultElectronicsProductSearchEnrichmentService', required: true } },
      { code: 'telco', frameworkGroup: 'telco', projectPack: 'agora.telco', impliedProductSearchContributorDomains: ['electronics'], productSearchContributor: { serviceName: 'DefaultTelcoProductSearchEnrichmentService', required: true } },
    ],
    sharedModules: [{ module: 'domainCommerceCore', minSelectedDomains: 2 }],
  };

  assert.deepEqual(resolveDomainComposition(compositionConfig, 'commerce'), {
    domains: [],
    frameworkGroups: [],
    sharedModules: [],
    projectPacks: [],
    productSearchContributors: {},
  });
  assert.deepEqual(resolveDomainComposition(compositionConfig, 'telco'), {
    domains: ['telco'],
    frameworkGroups: ['telco'],
    sharedModules: [],
    projectPacks: ['agora.telco'],
    productSearchContributors: {
      electronics: { serviceName: 'DefaultElectronicsProductSearchEnrichmentService', required: true },
      telco: { serviceName: 'DefaultTelcoProductSearchEnrichmentService', required: true },
    },
  });
});

test('project environment profile rejects root descriptor topology facts', () => {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-env-profile-'));
  writeJson(path.join(projectRoot, 'package.json'), {
    name: 'acme.startio',
  });
  writeJson(path.join(projectRoot, 'nodics.project.json'), {
    topology: {
      environment: 'legacyLocal',
      groups: {
        backends: [{ code: 'platform', label: 'Platform', script: 'start:platform', port: 4300 }],
      },
    },
    acceptance: {
      capabilityRegistry: { functionalModule: 'nodics.process' },
    },
  });

  assert.throws(
    () => readProjectEnvironmentConfiguration(projectRoot),
    /Unsupported nodics\.project\.json property `topology`/
  );
});


test('composition selection uses only its declared environment variable and rejects ambiguous names', () => {
  const config = { selection: 'all', environmentVariable: 'NODICS_TEST_COMPOSITION', domains: [
    { code: 'warehouse', frameworkGroup: 'inventory', projectPack: 'example.warehouse' }
  ] };
  const before = process.env.NODICS_TEST_COMPOSITION;
  try {
    process.env.NODICS_TEST_COMPOSITION = 'none';
    assert.deepEqual(resolveDomainComposition(config).domains, []);
    assert.deepEqual(resolveDomainComposition({ ...config, environmentVariable: undefined }).domains, ['warehouse']);
    assert.throws(() => resolveDomainComposition({ ...config, environmentVariable: 'invalid-name' }), /environmentVariable/);
  } finally {
    if (before === undefined) delete process.env.NODICS_TEST_COMPOSITION;
    else process.env.NODICS_TEST_COMPOSITION = before;
  }
});

test('an explicitly missing environment never falls back to a local profile', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-profile-selection-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  writeJson(path.join(root, 'package.json'), { name: 'customer.application' });
  writeJson(path.join(root, 'envs/applicationLocal/config/properties.js'), { environment: 'applicationLocal' });
  assert.throws(() => readProjectEnvironmentConfiguration(root, 'production'), /Select an available environment/);
});


test('acceptance coordinates and origins follow the owning endpoint without a second port declaration', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-endpoint-owner-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  writeJson(path.join(root, 'package.json'), { name: 'independent.application' });
  const env = path.join(root, 'envs/qa');
  writeEnvironment(env, {
    topology: { groups: {
      backends: [{ code: 'api', port: 5490, host: 'api.example.test' }],
      frontends: [{ code: 'editor', port: 3443, host: 'editor.example.test', protocol: 'https' }],
    } },
    acceptance: { check: { port: { $config: 'runtime', name: 'api', path: 'servers.default.endpoint.httpPort' } } },
  });
  const first = readProjectEnvironmentConfiguration(root, 'qa');
  assert.equal(first.acceptance.check.port, 5490);
  assert.equal(projectEndpointUrl(first, 'api'), 'http://api.example.test:5490');
  assert.equal(first.topology.groups.frontends, undefined);
  assert.throws(() => projectEndpointUrl(first, 'editor', 'frontends'), /valid endpoint group/);
  const file = path.join(env, 'api/config/properties.js');
  fs.writeFileSync(file, 'module.exports = {servers:{default:{endpoint:{httpHost:"::1",httpPort:5491}}}};');
  delete require.cache[require.resolve(file)];
  const changed = readProjectEnvironmentConfiguration(root, 'qa');
  assert.equal(changed.acceptance.check.port, 5491);
  assert.equal(changed.topology.groups.backends[0].port, 5491);
  assert.equal(projectEndpointUrl(changed, 'api'), 'http://[::1]:5491');
  assert.equal(first.acceptance.check.port, 5490);
  assert.throws(() => projectEndpointUrl(changed, 'missing'), /one configured endpoint/);
  assert.throws(() => projectEndpointUrl(changed, 'api', 'invalid'), /valid endpoint group/);
  changed.topology.groups.backends.push({ ...changed.topology.groups.backends[0] });
  assert.throws(() => projectEndpointUrl(changed, 'api'), /one configured endpoint/);
  changed.topology.groups.backends.pop();
  for (const invalid of [{ host: 'user@host' }, { host: '0.0.0.0' }, { host: '::' }, { protocol: 'file' }, { port: 70000 }]) {
    const copy = structuredClone(changed);
    Object.assign(copy.topology.groups.backends[0], invalid);
    assert.throws(() => projectEndpointUrl(copy, 'api'), /Invalid configured endpoint/);
  }
});


test('API acceptance uses explicit CORS security policy with inherited defaults and denies missing or disabled origins', () => {
  const cors = { enabled: true, originDefaults: { protocol: 'http', host: 'localhost' }, originEndpoints: { editor: { port: 3443 } } };
  assert.equal(projectCorsOrigin({ cors }, 'editor'), 'http://localhost:3443');
  assert.throws(() => projectCorsOrigin({ cors: { ...cors, enabled: false } }, 'editor'), /enabled CORS/);
  assert.throws(() => projectCorsOrigin({ cors }, 'missing'), /enabled CORS/);
  assert.throws(() => projectCorsOrigin({ cors: { ...cors, originEndpointOverrides: { editor: false } } }, 'editor'), /enabled CORS/);
  assert.throws(() => projectCorsOrigin({ cors: { ...cors, deniedOrigins: ['http://localhost:3443'] } }, 'editor'), /denies origin/);
});


test('capability acceptance defaults resolve renamed deployments without customer identities or activation', () => {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-acceptance-defaults-'));
  const writeProperties = (directory, properties) => {
    fs.mkdirSync(path.join(directory, 'config'), { recursive: true });
    fs.writeFileSync(path.join(directory, 'config/properties.js'), 'module.exports = ' + JSON.stringify(properties));
  };
  try {
    writeJson(path.join(projectRoot, 'package.json'), { name: 'example.recycling' });
    writeProperties(projectRoot, { tooling: { acceptance: { functionalJourney: { reason: 'Project acceptance' }, guidedInitialization: { publicationProfiles: { $config: 'replace', value: ['customSite'] } } } } });
    const environment = path.join(projectRoot, 'envs', 'acceptanceEast');
    writeJson(path.join(environment, 'package.json'), { name: 'acceptanceEast', index: '1000', nodics: { kind: 'group', runtimeModule: true } });
    writeProperties(environment, { environment: { class: 'QA' }, tooling: { acceptance: { functionalJourney: { reason: 'Deployment acceptance' } } } });
    const server = path.join(environment, 'recyclingApi');
    writeJson(path.join(server, 'package.json'), { name: 'recyclingApi', index: '1001', nodics: { kind: 'server', runtimeModule: true, displayName: 'Recycling API' } });
    writeProperties(server, { runtimeRole: { code: 'WASTE' }, servers: { default: { endpoint: { httpPort: 4881 } } },
      data: { dataReleases: { initializationProfiles: {
        recyclingFoundation: { template: 'foundation', privateValue: 'must-not-project' },
        obsolete: { enabled: false }
      } } } });
    const profile = readProjectEnvironmentConfiguration(projectRoot, 'acceptanceEast');
    assert.equal(profile.acceptance.functionalJourney.reason, 'Deployment acceptance');
    assert.deepEqual(profile.acceptance.guidedInitialization.publicationProfiles, ['customSite'], 'Project replacement must not retain framework publication targets');
    assert.deepEqual(profile.acceptance.functionalJourney.runtimes.platform, { role: 'PLATFORM' });
    assert.equal(profile.acceptance.wasteBackofficeDiscovery.providerModule, 'wasteCore');
    assert.equal(profile.acceptance.capabilityRegistry.foundationModule, 'nodics.foundation');
    assert.equal(profile.acceptance.guidedInitialization.profileTemplate, 'foundation');
    assert.doesNotMatch(JSON.stringify(profile.acceptance), /kickoff|localWasteFoundation/i);
    const runtime = projectRuntime(profile, profile.acceptance.wasteManagement.runtime);
    assert.equal(runtime.server, 'recyclingApi');
    assert.equal(runtime.label, 'Recycling API');
    assert.equal(projectEndpointUrl(profile, { role: 'WASTE' }), 'http://localhost:4881');
    assert.deepEqual(runtime.args, ['start', '--environment=acceptanceEast', '--server=recyclingApi']);
    assert.equal(projectInitializationProfile(runtime), 'recyclingFoundation');
    assert.equal(projectInitializationProfile(runtime, '', 'foundation'), 'recyclingFoundation');
    assert.doesNotMatch(JSON.stringify(runtime.initializationProfiles), /privateValue|must-not-project|obsolete/);
    assert.throws(() => projectInitializationProfile(runtime, 'obsolete'), /Select one enabled/);
    assert.throws(() => projectRuntime(profile, { role: 'PLATFORM' }), /Select one configured endpoint/);
    assert.throws(() => projectRuntime(profile, {}), /Select one configured endpoint/);
    assert.equal(profile.topology.groups.backends.length, 1, 'Default tooling must not activate absent runtimes');
    const ambiguous = { ...profile, topology: { groups: { backends: [runtime, { ...runtime, code: 'secondApi', server: 'secondApi' }] } } };
    assert.throws(() => projectRuntime(ambiguous, { role: 'WASTE' }), /Select one configured endpoint/);
    assert.equal(projectRuntime(ambiguous, 'recyclingApi'), runtime, 'Explicit server resolves an ambiguous role');
    assert.throws(() => projectInitializationProfile({ ...runtime, initializationProfiles: [ ...runtime.initializationProfiles, { code: 'secondProfile' } ] }), /Select one enabled/);
    assert.equal(require('../src/service/defaultToolingCommandService').loadFrameworkToolingDefaults('acceptance').functionalJourney.reason, 'Functional acceptance');
  } finally { fs.rmSync(projectRoot, { recursive: true, force: true }); }
});
