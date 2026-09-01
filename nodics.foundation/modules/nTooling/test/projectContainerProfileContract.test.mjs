/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

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
  conventionalEnvironmentName,
  readContainerEnvironmentProfile,
} from '../src/service/project/defaultProjectContainerProfileService.mjs';

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + '\n');
}

test('container profile resolves from environment-owned nodics.environment.json', () => {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-container-profile-'));
  writeJson(path.join(projectRoot, 'package.json'), {
    name: 'acme.startio',
  });
  writeJson(path.join(projectRoot, 'envs', 'startioDockerLocal', 'nodics.environment.json'), {
    contractVersion: 1,
    profileCode: 'dockerLocal',
    environment: 'startioDockerLocal',
    composeFile: 'envs/startioDockerLocal/docker/compose.yaml',
    generatedDirectory: 'envs/startioDockerLocal/generated',
    environmentFile: 'docker.env',
    acceptance: { urls: { platform: 'http://127.0.0.1:5300' } },
  });

  const profile = readContainerEnvironmentProfile(projectRoot, 'dockerLocal');

  assert.equal(conventionalEnvironmentName({}, 'dockerLocal', projectRoot), 'startioDockerLocal');
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
    () => readContainerEnvironmentProfile(projectRoot, 'dockerLocal'),
    /Unsupported nodics\.project\.json property `containerEnvironments`/
  );
});
