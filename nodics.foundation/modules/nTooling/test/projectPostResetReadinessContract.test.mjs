/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/test/projectPostResetReadinessContract
 * @description Guards post-reset readiness evidence generation without adding project-owned topology descriptors.
 * @layer test
 * @owner nTooling
 */

import writeEnvironment from './helpers/environmentFixture.cjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  buildPostResetReadinessReport,
  formatPostResetReadinessReport,
} from '../src/service/project/defaultProjectPostResetReadinessService.mjs';

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + '\n');
}

function writeProperties(root, value) {
  fs.mkdirSync(path.join(root, 'config'), { recursive: true });
  fs.writeFileSync(path.join(root, 'config', 'properties.js'), 'module.exports = ' + JSON.stringify(value) + ';\n');
}

test('post-reset readiness report derives recovery evidence from environment topology', async () => {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-post-reset-'));
  try {
    writeJson(path.join(projectRoot, 'package.json'), { name: 'acme.recovery', private: true });
    writeEnvironment(path.join(projectRoot, 'envs', 'recoveryLocal'), {
      acceptance: {
        browserValidation: { enabled: true },
        functionalJourney: { runtimes: { platform: { role: 'PLATFORM' } } },
        guidedInitialization: { publicationProfiles: ['circaewaste', 'nexusdocs'] },
      },
    });
    const platform = path.join(projectRoot, 'envs', 'recoveryLocal', 'platformServer');
    fs.mkdirSync(platform, { recursive: true });
    writeJson(path.join(platform, 'package.json'), {
      name: 'platformServer',
      index: '1000',
      nodics: { kind: 'server', runtimeModule: true, displayName: 'Platform Server' },
    });
    writeProperties(platform, {
      runtimeRole: { code: 'PLATFORM' },
      servers: { default: { endpoint: { httpPort: 4310 } } },
    });

    const report = await buildPostResetReadinessReport(projectRoot, 'recoveryLocal');
    assert.equal(report.projectCode, 'acme.recovery');
    assert.equal(report.environment, 'recoveryLocal');
    assert.equal(report.live, false);
    assert.equal(report.sections.length, 15);
    assert(report.sections.some(section => section.id === 'bootstrap'));
    assert(report.sections.some(section => section.id === 'runtimeCommunication'));
    assert(report.sections.some(section => section.id === 'documentation'));
    assert(report.sections.some(section => section.id === 'assistant'));
    assert.equal(report.sections.find(section => section.id === 'browserValidation').state, 'NEEDS_ATTENTION');
    assert.equal(report.sections.find(section => section.id === 'runtimes').evidence.runtimes[0].server, 'platformServer');
    assert.equal(report.sections.find(section => section.id === 'publishing').evidence.publicationProfiles[0], 'circaewaste');
    assert(report.commands.some(command => command.command === 'project:data-manifests'));
    assert.match(formatPostResetReadinessReport(report), /Post-reset readiness: acme\.recovery \/ recoveryLocal/);
  } finally {
    fs.rmSync(projectRoot, { recursive: true, force: true });
  }
});

test('post-reset readiness report skips browser validation by framework default', async () => {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-post-reset-skip-'));
  try {
    writeJson(path.join(projectRoot, 'package.json'), { name: 'acme.skip', private: true });
    writeEnvironment(path.join(projectRoot, 'envs', 'skipLocal'), {});
    const server = path.join(projectRoot, 'envs', 'skipLocal', 'platformServer');
    fs.mkdirSync(server, { recursive: true });
    writeJson(path.join(server, 'package.json'), {
      name: 'platformServer',
      index: '1000',
      nodics: { kind: 'server', runtimeModule: true },
    });
    writeProperties(server, {
      runtimeRole: { code: 'PLATFORM' },
      servers: { default: { endpoint: { httpPort: 4311 } } },
    });
    const report = await buildPostResetReadinessReport(projectRoot, 'skipLocal');
    assert.equal(report.sections.find(section => section.id === 'browserValidation').state, 'SKIPPED');
    assert.equal(report.sections.find(section => section.id === 'browserValidation').evidence.enabled, false);
  } finally {
    fs.rmSync(projectRoot, { recursive: true, force: true });
  }
});
