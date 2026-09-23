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

test('post-reset readiness report parses authenticated BackOffice bootstrap evidence', async () => {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-post-reset-live-'));
  try {
    writeJson(path.join(projectRoot, 'package.json'), { name: 'acme.live', private: true });
    writeEnvironment(path.join(projectRoot, 'envs', 'liveLocal'), {
      acceptance: {
        functionalJourney: { runtimes: { platform: { role: 'PLATFORM' } } },
      },
    });
    const platform = path.join(projectRoot, 'envs', 'liveLocal', 'platformServer');
    fs.mkdirSync(platform, { recursive: true });
    writeJson(path.join(platform, 'package.json'), {
      name: 'platformServer',
      index: '1000',
      nodics: { kind: 'server', runtimeModule: true, displayName: 'Platform Server' },
    });
    writeProperties(platform, {
      runtimeRole: { code: 'PLATFORM' },
      servers: { default: { endpoint: { httpPort: 4312 } } },
    });
    let requestedUrl = '';
    let authorization = '';
    const report = await buildPostResetReadinessReport(projectRoot, 'liveLocal', {
      live: true,
      accessToken: 'local-secret-token',
      fetchImpl: async (url, request) => {
        requestedUrl = String(url);
        authorization = request.headers.Authorization;
        return {
          ok: true,
          status: 200,
          async json() {
            return {
              code: 'SUCCESS',
              data: {
                startupValidation: {
                  state: 'READY',
                  checkedAt: '2026-09-23T00:00:00.000Z',
                  source: 'backoffice.startupValidation',
                  summary: { total: 1, errors: 0, warnings: 0, info: 0, dismissible: 0, acknowledged: 0 },
                  bootstrapChecks: { total: 1, ready: 1, missing: 0, needsAttention: 0, checks: [] },
                  findings: [],
                },
                modules: {
                  backoffice: [{ instanceId: 'platformServer:backoffice', server: 'platformServer', state: 'ACTIVE' }],
                  process: [{ instanceId: 'processServer:process', server: 'processServer', state: 'ACTIVE' }],
                },
                applicationInitializationProfiles: [
                  { code: 'circaewaste', title: 'Circa eWaste', requiredServers: ['platformServer'] },
                ],
                documentationSources: [
                  { id: 'framework.docs', label: 'Framework docs', type: 'CMS', route: '/docs/framework', readiness: 'READY' },
                ],
                importReadiness: { state: 'READY' },
                publicationReadiness: { state: 'READY' },
                approvalReadiness: { state: 'READY' },
                mediaReadiness: { state: 'READY' },
                searchReadiness: { state: 'READY' },
                assistantReadiness: { state: 'READY' },
                operationalReadiness: {
                  contractVersion: 1,
                  state: 'NEEDS_ATTENTION',
                  checkedAt: '2026-09-23T00:00:00.000Z',
                  source: 'backoffice.operationalReadiness',
                  summary: { total: 2, blockers: 1, READY: 1, NOT_EXPOSED: 1 },
                  sections: [
                    {
                      key: 'imports',
                      title: 'Data import releases',
                      businessStatus: 'NOT_EXPOSED',
                      ownerModule: 'import',
                      source: 'NIMPORT_RELEASE_READINESS',
                      route: '/operations/imports-exports',
                      summary: { exposed: false },
                      blockers: [{
                        blockerCode: 'IMPORTS_READINESS_NOT_EXPOSED',
                        code: 'IMPORTS_READINESS_NOT_EXPOSED',
                        suggestedAction: 'Open Data Releases',
                      }],
                      nextAction: 'Open Data Releases',
                    },
                    {
                      key: 'applications',
                      title: 'Customer application readiness',
                      businessStatus: 'READY',
                      ownerModule: 'backoffice',
                      source: 'BACKOFFICE_APPLICATION_INITIALIZATION',
                      route: '/publishing',
                      summary: { profileCount: 1 },
                      blockers: [],
                      nextAction: 'Application profiles are available.',
                    },
                  ],
                },
              },
            };
          },
        };
      },
    });

    assert.equal(requestedUrl, 'http://localhost:4312/nodics/backoffice/v0/bootstrap');
    assert.equal(authorization, 'Bearer local-secret-token');
    assert.equal(report.contractVersion, 2);
    assert.equal(report.exitCode, 1);
    assert.equal(report.sections.find(section => section.id === 'bootstrap').state, 'READY');
    assert.equal(report.sections.find(section => section.id === 'moduleRegistry').state, 'READY');
    assert.equal(report.sections.find(section => section.id === 'imports').state, 'NOT_READY');
    assert.equal(report.sections.find(section => section.id === 'imports').evidence.readiness.source, 'NIMPORT_RELEASE_READINESS');
    assert.equal(report.sections.find(section => section.id === 'applications').evidence.applications.total, 1);
    assert.equal(report.sections.find(section => section.id === 'documentation').evidence.documentation.total, 1);
    assert.doesNotMatch(JSON.stringify(report), /local-secret-token/);
  } finally {
    fs.rmSync(projectRoot, { recursive: true, force: true });
  }
});

test('post-reset readiness report classifies unauthorized live bootstrap without leaking token', async () => {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-post-reset-unauthorized-'));
  try {
    writeJson(path.join(projectRoot, 'package.json'), { name: 'acme.unauthorized', private: true });
    writeEnvironment(path.join(projectRoot, 'envs', 'unauthorizedLocal'), {
      acceptance: {
        functionalJourney: { runtimes: { platform: { role: 'PLATFORM' } } },
      },
    });
    const platform = path.join(projectRoot, 'envs', 'unauthorizedLocal', 'platformServer');
    fs.mkdirSync(platform, { recursive: true });
    writeJson(path.join(platform, 'package.json'), {
      name: 'platformServer',
      index: '1000',
      nodics: { kind: 'server', runtimeModule: true },
    });
    writeProperties(platform, {
      runtimeRole: { code: 'PLATFORM' },
      servers: { default: { endpoint: { httpPort: 4313 } } },
    });
    const report = await buildPostResetReadinessReport(projectRoot, 'unauthorizedLocal', {
      live: true,
      accessToken: 'denied-token',
      fetchImpl: async () => ({ ok: false, status: 403, async json() { return {}; } }),
    });

    assert.equal(report.exitCode, 2);
    assert.equal(report.sections.find(section => section.id === 'bootstrap').state, 'UNAUTHORIZED');
    assert.equal(report.summary.UNAUTHORIZED > 0, true);
    assert.doesNotMatch(JSON.stringify(report), /denied-token/);
  } finally {
    fs.rmSync(projectRoot, { recursive: true, force: true });
  }
});
