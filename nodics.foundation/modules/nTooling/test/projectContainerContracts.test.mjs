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
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import writeEnvironment from './helpers/environmentFixture.cjs';
import { readContainerEnvironmentConfiguration } from '../src/service/project/defaultProjectContainerConfigurationService.mjs';
import { qualifyContainerNetworkSeparation, acceptanceEnvironment } from '../src/service/project/defaultProjectContainerQualificationService.mjs';

const read = name => fs.readFileSync(new URL('../src/service/' + name, import.meta.url), 'utf8');
const containerEnvironmentService = read('project/defaultProjectContainerEnvironmentService.mjs');
const containerQualificationService = read('project/defaultProjectContainerQualificationService.mjs');
const lifecycle = read('project/defaultProjectContainerResilienceService.mjs');
const qualification = containerQualificationService;
const acceptance = qualification;
const soak = qualification;
const frameworkQualification = read('quality/defaultFrameworkQualificationEvidenceService.js');

test('backend network qualification requires isolation without inspecting external frontends', () => {
  const qualification = { containerPrefix: 'independent-', networkSeparation: {
    applicationContainers: ['authoring', 'delivery'],
    requiredNetworks: ['isolated-application', 'isolated-data'],
    forbiddenNetworks: ['external-public'],
  } };
  const inspected = [];
  const inspect = name => {
    inspected.push(name);
    return { NetworkSettings: { Networks: { 'isolated-application': {}, 'isolated-data': {} } } };
  };
  qualifyContainerNetworkSeparation(qualification, inspect);
  assert.deepEqual(inspected, ['independent-authoring-1', 'independent-delivery-1']);
  for (const memberships of [{ 'isolated-application': {} },
    { 'isolated-application': {}, 'isolated-data': {}, 'external-public': {} }]) {
    assert.throws(() => qualifyContainerNetworkSeparation(qualification,
      () => ({ NetworkSettings: { Networks: memberships } })), /violates/);
  }
  assert.throws(() => qualifyContainerNetworkSeparation(qualification, () => ({})), /unavailable/);
  assert.throws(() => qualifyContainerNetworkSeparation({ ...qualification, networkSeparation: {
    ...qualification.networkSeparation, applicationContainers: [],
  } }, inspect), /Invalid backend/);
  const subset = { ...qualification, networkSeparation: {
    ...qualification.networkSeparation, applicationContainers: ['delivery'],
  } };
  inspected.length = 0;
  qualifyContainerNetworkSeparation(subset, inspect);
  assert.deepEqual(inspected, ['independent-delivery-1']);
  const legacy = { networkSeparation: { applicationContainer: 'backend', publicContainer: 'external-ui' } };
  qualifyContainerNetworkSeparation(legacy, name => ({ NetworkSettings: {
    Networks: { [name === 'backend' ? 'isolated-application' : 'external-public']: {} },
  } }));
  assert.throws(() => qualifyContainerNetworkSeparation(legacy, () => ({ NetworkSettings: {
    Networks: { 'isolated-data': {} },
  } })), /boundaries overlap/);
});

test('acceptance preserves URL overrides and keeps frontend evidence optional', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'container-acceptance-inputs-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const environmentPath = path.join(root, 'fixture.env');
  fs.writeFileSync(environmentPath, 'BOOTSTRAP_SERVICE_API_KEY=isolated-fixture\n');
  const selected = { generatedRoot: root, environmentPath, environment: 'test', acceptance: {
    urls: { platform: 'http://published.test:8123', engagement: 'http://published.test:8124' },
    environmentUrls: { TEST_ACCEPTANCE_URL: 'platform' },
  } };
  const saved = Object.fromEntries(['AXIS_PLATFORM_URL', 'NODICS_ENGAGEMENT_URL', 'TEST_ACCEPTANCE_URL'].map(key => [key, process.env[key]]));
  try {
    for (const key of Object.keys(saved)) delete process.env[key];
    const defaults = acceptanceEnvironment(selected);
    assert.equal(defaults.AXIS_PLATFORM_URL, selected.acceptance.urls.platform);
    assert.equal(defaults.NODICS_ACCEPTANCE_BROWSER_VALIDATION_ENABLED, 'false');
    for (const key of Object.keys(saved)) process.env[key] = 'https://operator-override.test';
    const overridden = acceptanceEnvironment(selected);
    for (const key of Object.keys(saved)) assert.equal(overridden[key], 'https://operator-override.test');
  } finally {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
});

test('container operations retain credential, resilience and owner qualification boundaries', () => {
  assert.match(
    containerEnvironmentService,
    /BOOTSTRAP_ADMIN_PASSWORD: process\.env\.NODICS_DOCKER_ADMIN_PASSWORD \|\| profile\.bootstrapAdminPassword/,
  );
  assert.match(containerEnvironmentService, /readContainerEnvironmentConfiguration/);
  assert.match(
    containerQualificationService,
    /NODICS_ENGAGEMENT_URL: process\.env\.NODICS_ENGAGEMENT_URL \|\| urls\.engagement/,
  );
  assert.match(
    containerQualificationService,
    /NODICS_COMMERCE_STAGED_URL: process\.env\.NODICS_COMMERCE_STAGED_URL \|\| urls\.commerceStaged/,
  );
  assert.match(
    containerQualificationService,
    /NODICS_SERVICE_API_KEY: process\.env\.NODICS_SERVICE_API_KEY \|\| values\.BOOTSTRAP_SERVICE_API_KEY/,
  );
  assert.match(
    containerQualificationService,
    /selected\.acceptance\.commerceDataCommand/,
  );
  assert.match(
    containerQualificationService,
    /args: \['--', '--execute-install'\]/,
  );
  assert.match(
    containerQualificationService,
    /selected\.acceptance\.commercePublicationCommand/,
  );
  assert.match(lifecycle, /mongodump/);
  assert.match(lifecycle, /mongorestore/);
  assert.match(lifecycle, /sha256/);
  assert.match(qualification, /recovery-point-objective/);
  assert.match(qualification, /recovery-time-objective/);
  assert.match(qualification, /unpublished-staged-isolation/);
  assert.match(acceptance, /--expect-documentation-not-installed/);
  assert.match(acceptance, /--qualify-documentation-rollback/);
  assert.match(qualification, /redis-sentinel-promotion-observed/);
  assert.match(qualification, /CLIENT', 'PAUSE'/);
  assert.match(soak, /NODICS_DOCKER_SOAK_SECONDS/);
  assert.match(soak, /NODICS_DOCKER_SOAK_REQUEST_INTERVAL_MS/);
  assert.match(
    frameworkQualification,
    /cmsPublicationManifestContract\.test\.js/,
  );
  assert.match(
    frameworkQualification,
    /cmsPublicationOutboxReliability\.test\.js/,
  );
  assert.match(frameworkQualification, /directBusinessDatabaseCrud: false/);
  assert.match(qualification, /BOOTSTRAP_ADMIN_PASSWORD/);
  assert.doesNotMatch(qualification, /set -a|(?:^|\s)source\s+\S*docker\.env|\\. env/);
});

for (const [environment, code] of [['qualityEast', 'containersEast'], ['qualityWest', 'containersWest']]) {
  test('container selection and offline backup integrity: ' + environment, t => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'container-contract-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ name: 'independent.containers' }));
    writeEnvironment(path.join(root, 'envs', environment), {
      profileCode: code, qualificationClass: 'QA',
      resilience: { restoreConfirmationToken: '--confirm-fixture-restore' },
      acceptance: { urls: { commerce: 'http://commerce.example.test:5812' } },
    });
    const profile = readContainerEnvironmentConfiguration(root, code);
    assert.equal(profile.environment, environment);
    assert.equal(profile.qualificationClass, 'QA');
    assert.equal(profile.acceptance.urls.commerce, 'http://commerce.example.test:5812');
    assert.equal(profile.environmentPath, path.join(root, 'envs', environment, 'generated', 'docker.env'));
    assert.throws(() => readContainerEnvironmentConfiguration(root, 'absent'), /Select an available environment/);
    const backup = path.join(profile.generatedRoot, 'backups', 'snapshot');
    fs.mkdirSync(backup, { recursive: true });
    const content = Buffer.from('independent backup fixture');
    const file = path.join(backup, 'sample.archive');
    fs.writeFileSync(file, content);
    fs.writeFileSync(path.join(backup, 'manifest.json'), JSON.stringify({
      environment, backupId: 'snapshot', files: [{
        name: 'sample.archive', bytes: content.length,
        sha256: crypto.createHash('sha256').update(content).digest('hex'),
      }],
    }));
    const run = (...args) => spawnSync(process.execPath, [
      fileURLToPath(new URL('../src/service/project/defaultProjectContainerResilienceService.mjs', import.meta.url)),
      code, ...args,
    ], { cwd: root, encoding: 'utf8', timeout: 10000, env: { PATH: process.env.PATH, HOME: process.env.HOME } });
    const verified = run('verify', 'snapshot');
    assert.equal(verified.status, 0, verified.stderr);
    assert.equal(JSON.parse(verified.stdout).backupId, 'snapshot');
    // Denial happens before any environment read or Docker command.
    const denied = run('restore', 'snapshot');
    assert.notEqual(denied.status, 0);
    assert.match(denied.stderr, /Restore requires --confirm-fixture-restore/);
    fs.writeFileSync(file, Buffer.alloc(content.length, 120));
    const corrupted = run('verify', 'snapshot');
    assert.notEqual(corrupted.status, 0);
    assert.match(corrupted.stderr, /Backup integrity check failed/);
    fs.unlinkSync(file);
    assert.match(run('verify', 'snapshot').stderr, /Backup integrity check failed/);
    fs.writeFileSync(path.join(root, 'nodics.project.json'), '{}');
    assert.throws(() => readContainerEnvironmentConfiguration(root, code), /Unsupported nodics.project.json/);
  });
}
