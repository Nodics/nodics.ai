/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

import writeEnvironment from './helpers/environmentFixture.cjs';
/**
 * @module nTooling/test/projectContainerProfileContract
 * @description Guards environment-owned container profile discovery and rejects misplaced root descriptor facts.
 * @layer test
 * @owner nTooling
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  readContainerEnvironmentConfiguration,
} from '../src/service/project/defaultProjectContainerConfigurationService.mjs';

function writeJson(filePath, value) {
  if (filePath.endsWith('/config/properties.js')) return writeEnvironment(path.dirname(path.dirname(filePath)), value);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + '\n');
}

test('container profile resolves from environment-owned config/properties.js', () => {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-container-profile-'));
  writeJson(path.join(projectRoot, 'package.json'), {
    name: 'acme.startio',
  });
  writeJson(path.join(projectRoot, 'envs', 'startioDockerLocal', 'config/properties.js'), {
    contractVersion: 1,
    profileCode: 'dockerLocal',
    environment: 'startioDockerLocal',
    composeFile: 'envs/startioDockerLocal/docker/compose.yaml',
    generatedDirectory: 'envs/startioDockerLocal/generated',
    environmentFile: 'docker.env',
    acceptance: { urls: { platform: 'http://127.0.0.1:5300' } },
  });

  const profile = readContainerEnvironmentConfiguration(projectRoot, 'dockerLocal');

  assert.equal(profile.code, 'dockerLocal');
  assert.equal(profile.environment, 'startioDockerLocal');
  assert.equal(profile.composePath, path.join(projectRoot, 'envs/startioDockerLocal/docker/compose.yaml'));
  assert.equal(profile.environmentPath, path.join(projectRoot, 'envs/startioDockerLocal/generated/docker.env'));
  assert.equal(profile.acceptance.urls.platform, 'http://127.0.0.1:5300');
});

test('container profile rejects root descriptor container facts', () => {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-container-profile-'));
  writeJson(path.join(projectRoot, 'package.json'), {
    name: 'acme.startio',
  });
  writeJson(path.join(projectRoot, 'nodics.project.json'), {
    containerEnvironments: {
      dockerLocal: {
        environment: 'legacyDockerLocal',
        composeFile: 'envs/legacyDockerLocal/docker/compose.yaml',
        generatedDirectory: 'envs/legacyDockerLocal/generated',
        acceptance: { urls: { platform: 'http://127.0.0.1:5300' } },
      },
    },
  });

  assert.throws(
    () => readContainerEnvironmentConfiguration(projectRoot, 'dockerLocal'),
    /Unsupported nodics\.project\.json property `containerEnvironments`/
  );
});
