/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/test/projectEnvironmentProfileContract
 * @description Guards environment-owned local topology and acceptance profile discovery.
 * @layer test
 * @owner nTooling
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  readProjectEnvironmentComposition,
  readProjectEnvironmentProfile,
  resolveDomainComposition,
} from '../src/service/project/defaultProjectEnvironmentProfileService.mjs';

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + '\n');
}

test('project environment profile resolves local topology from env-owned file', () => {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-env-profile-'));
  writeJson(path.join(projectRoot, 'package.json'), {
    name: 'acme.startio',
  });
  writeJson(path.join(projectRoot, 'envs', 'startioLocal', 'nodics.environment.json'), {
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

  const profile = readProjectEnvironmentProfile(projectRoot);
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
    () => readProjectEnvironmentProfile(projectRoot),
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
  writeJson(path.join(root, 'envs/applicationLocal/nodics.environment.json'), { environment: 'applicationLocal' });
  assert.throws(() => readProjectEnvironmentProfile(root, 'production'), /Unknown project environment profile: production/);
});
