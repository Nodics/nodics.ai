/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/test/projectContainerAcceptanceEvidenceContract
 * @description Guards framework-owned browser-validation evidence emitted by container acceptance tooling.
 * @layer test
 * @owner nTooling
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  browserValidationEvidenceFile,
  platformAcceptanceEvidence,
  writePlatformAcceptanceEvidence,
} from '../src/service/project/defaultProjectContainerQualificationService.mjs';

test('container acceptance emits sanitized browser-validation evidence', () => {
  const generatedRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-acceptance-evidence-'));
  try {
    const selected = {
      generatedRoot,
      acceptance: {
        browserValidation: { enabled: true },
        urls: {
          axis: 'http://localhost:3100',
          circa: 'http://localhost:3600?token=local-secret-token',
        },
      },
    };
    const startedAt = new Date('2026-09-24T00:00:00.000Z');
    const evidence = platformAcceptanceEvidence(selected, { status: 0 }, ['run', 'acceptance:local'], startedAt);
    assert.equal(evidence.state, 'PASSED');
    assert.equal(evidence.runId, 'platform-acceptance-2026-09-24T00:00:00.000Z');
    assert.deepEqual(evidence.urls, ['http://localhost:3100', 'http://localhost:3600?token=[REDACTED]']);

    const filePath = writePlatformAcceptanceEvidence(selected, { status: 1 }, ['run', 'acceptance:local'], startedAt);
    assert.equal(filePath, browserValidationEvidenceFile(selected));
    const written = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    assert.equal(written.state, 'FAILED');
    assert.equal(written.failedStep, 'platformAcceptance');
    assert.match(written.nextAction, /rerun acceptance/);
    assert.doesNotMatch(JSON.stringify(written), /local-secret-token/i);
  } finally {
    fs.rmSync(generatedRoot, { recursive: true, force: true });
  }
});

test('container acceptance evidence is skipped when browser validation is disabled', () => {
  const selected = {
    generatedRoot: fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-acceptance-evidence-skip-')),
    acceptance: { browserValidation: { enabled: false }, urls: {} },
  };
  try {
    const evidence = platformAcceptanceEvidence(selected, { status: 0 }, ['run', 'acceptance:local'], new Date('2026-09-24T00:00:00.000Z'));
    assert.equal(evidence.state, 'SKIPPED');
    assert.match(evidence.message, /disabled/);
  } finally {
    fs.rmSync(selected.generatedRoot, { recursive: true, force: true });
  }
});
