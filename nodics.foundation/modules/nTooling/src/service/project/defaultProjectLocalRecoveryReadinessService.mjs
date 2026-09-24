#!/usr/bin/env node
/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/service/project/defaultProjectLocalRecoveryReadinessService
 * @description Produces the operator-facing local recovery readiness snapshot from canonical post-reset readiness evidence.
 * @layer tooling
 * @owner nTooling
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import {
  buildPostResetReadinessReport,
  formatPostResetReadinessReport,
} from './defaultProjectPostResetReadinessService.mjs';

function optionValue(args, name, fallback = '') {
  const prefix = `--${name}=`;
  const inline = args.find(argument => argument.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const index = args.indexOf(`--${name}`);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

function snapshotPath(projectRoot, environment, args) {
  const explicit = optionValue(args, 'snapshot-file', '');
  if (explicit) return path.resolve(projectRoot, explicit);
  return path.resolve(projectRoot, 'envs', environment, 'generated', 'acceptance', 'local-recovery-readiness-snapshot.json');
}

function blockersFromSections(sections) {
  return sections.flatMap(section => (section.blockers || []).map(blocker => ({
    section: section.id || section.key || section.title,
    code: blocker.code || blocker.blockerCode,
    severity: blocker.severity,
    ownerType: blocker.ownerType,
    action: blocker.suggestedAction || blocker.action || section.nextAction,
  })));
}

export function localRecoverySnapshot(report, filePath) {
  const blockers = blockersFromSections(report.sections || []);
  return {
    contractVersion: 1,
    source: 'nTooling.localRecoveryReadiness',
    projectCode: report.projectCode,
    environment: report.environment,
    generatedAt: report.generatedAt,
    live: report.live === true,
    state: report.exitCode === 0 ? 'READY' : 'NEEDS_ATTENTION',
    exitCode: report.exitCode,
    summary: report.summary,
    snapshotFile: filePath,
    blockerCount: blockers.length,
    blockers: blockers.slice(0, 25),
    sections: (report.sections || []).map(section => ({
      id: section.id,
      title: section.title,
      state: section.state,
      nextAction: section.nextAction,
      blockerCount: (section.blockers || []).length,
    })),
  };
}

async function writeSnapshot(filePath, snapshot) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(snapshot, null, 2) + '\n', 'utf8');
}

async function main() {
  const args = process.argv.slice(2);
  const projectRoot = process.env.NODICS_PROJECT_ROOT || process.env.NODICS_HOME || process.cwd();
  const environmentCode = optionValue(args, 'environment', optionValue(args, 'env', ''));
  const report = await buildPostResetReadinessReport(projectRoot, environmentCode, {
    live: args.includes('--live'),
    timeoutMs: Number(optionValue(args, 'timeout-ms', '2000')),
    accessToken: optionValue(args, 'access-token', ''),
    accessTokenFile: optionValue(args, 'access-token-file', ''),
    browserValidationEvidenceFile: optionValue(args, 'browser-validation-evidence-file', ''),
    clientContractVersion: Number(optionValue(args, 'client-contract-version', '1')),
  });
  const filePath = snapshotPath(projectRoot, report.environment, args);
  const snapshot = localRecoverySnapshot(report, filePath);
  if (!args.includes('--dry-run')) await writeSnapshot(filePath, snapshot);
  if (args.includes('--json')) console.log(JSON.stringify({ report, snapshot }, null, 2));
  else {
    console.log(formatPostResetReadinessReport(report));
    console.log('');
    console.log(`Snapshot: ${filePath}`);
  }
  process.exitCode = args.includes('--fail-on-not-ready') ? report.exitCode : 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(error && error.stack || error);
    process.exitCode = 1;
  });
}
