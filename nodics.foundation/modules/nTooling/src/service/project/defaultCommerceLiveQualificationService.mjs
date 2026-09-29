/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nTooling/project/defaultCommerceLiveQualificationService @description Composes immutable Commerce gates against an explicitly selected deployment. @owner nTooling @layer tooling */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readProjectEnvironmentConfiguration, projectRuntimeAcceptance, projectEndpointUrl } from './defaultProjectEnvironmentConfigurationService.mjs';

const tool = fileURLToPath(new URL('../../../bin/nodics-tool.js', import.meta.url));
const executeFile = promisify(execFile);

/** Customer fixtures select releases, never canonical commands or pass criteria. */
export function commerceQualificationPlan(selection = {}) {
  if (!Array.isArray(selection.releaseModules) || !selection.releaseModules.length ||
      selection.releaseModules.some(value => typeof value !== 'string' || !/^[a-zA-Z][\w.-]*$/.test(value))) {
    throw new Error('Select explicit Commerce releaseModules');
  }
  return [
    ['acceptance:staged-sample-data', '--target-role=COMMERCE_STAGED', '--release-modules=' + selection.releaseModules.join(','), '--execute-install'],
    ['acceptance:commerce-publication', '--execute', '--approve-publications'],
    ['acceptance:commerce-journey', '--execute'],
  ];
}

/** Executes only after explicit mutation/approval intent and readiness of every participating owner. */
export async function runCommerceLiveQualification({
  projectRoot = process.env.NODICS_PROJECT_ROOT || process.cwd(), environment = process.env,
  configuration, selection, execute = false, approvePublications = false,
  fetch: fetchRequest = globalThis.fetch, run = executeFile,
} = {}) {
  if (execute !== true || approvePublications !== true) throw new Error('Explicit --execute --approve-publications is required');
  const config = configuration || readProjectEnvironmentConfiguration(projectRoot, environment.NODICS_ENVIRONMENT || environment.ENV || '');
  const chosen = selection || projectRuntimeAcceptance(projectRoot, config, { role: 'PLATFORM' }).commerceLive;
  const plan = commerceQualificationPlan(chosen);
  for (const role of ['PLATFORM', 'WCMS_STAGED', 'WCMS_ONLINE', 'PROCESS', 'ENGAGEMENT', 'COMMERCE_STAGED', 'COMMERCE']) {
    const response = await fetchRequest(new URL('/nodics/system/v0/health/ready', projectEndpointUrl(config, { role })), {
      redirect: 'error', signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) throw new Error('Required runtime is not ready: ' + role + ' (HTTP ' + response.status + ')');
  }
  for (const args of plan) {
    const result = await run(process.execPath, [tool, ...args, '--home=' + projectRoot], {
      cwd: projectRoot, env: { ...environment, NODICS_PROJECT_ROOT: projectRoot },
      timeout: 600000, maxBuffer: 16 * 1024 * 1024,
    });
    if (result?.stdout) process.stdout.write(result.stdout);
    if (result?.stderr) process.stderr.write(result.stderr);
  }
  return { status: 'PASSED', scope: 'LIVE_BACKEND_COMMERCE', gates: plan.map(args => args[0]) };
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  if (process.argv.includes('--help')) console.log('Commerce backend qualification: running runtimes, explicit release fixtures, --execute --approve-publications. No frontend or runtime startup.');
  else console.log(JSON.stringify(await runCommerceLiveQualification({ execute: process.argv.includes('--execute'), approvePublications: process.argv.includes('--approve-publications') })));
}
