#!/usr/bin/env node
/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */


import assert from 'node:assert/strict';
import { pathToFileURL, fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import commands from '../../../../../../nodics.foundation/modules/nTooling/src/service/defaultToolingCommandService.js';
import { createAcceptanceContext } from '../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectAcceptanceService.mjs';
import { projectRuntimeAcceptance } from '../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectEnvironmentConfigurationService.mjs';
/** @module wasteApi/service/acceptance/defaultWasteManagementAcceptanceService @description Runs the generic secured Waste API contract using selected application fixtures. @layer tooling @owner wasteApi */
const require = createRequire(import.meta.url);
const frameworkRoot = fileURLToPath(new URL('../../../../../../', import.meta.url));

/** Materializes trusted module data references; properties remain declarative. */
export function resolveWasteFixture({ fixture, modules }) {
  const owners = (modules || []).filter(module => module.name === fixture?.dataModule);
  assert(typeof fixture?.dataModule === 'string' && owners.length === 1, 'Select one Waste fixture data owner');
  const root = fs.realpathSync(owners[0].path);
  const records = relative => {
    assert(typeof relative === 'string' && relative && !path.isAbsolute(relative) &&
      !path.win32.isAbsolute(relative) && !relative.split(/[\\/]/u).includes('..'), 'Fixture path must be owner-relative');
    const file = fs.realpathSync(path.join(root, relative));
    const remainder = path.relative(root, file);
    assert(remainder && remainder !== '..' && !remainder.startsWith('..' + path.sep) &&
      !path.isAbsolute(remainder), 'Fixture path escapes its owner');
    assert(fs.statSync(file).isFile() && ['.js', '.json'].includes(path.extname(file)), 'Fixture records must be a JS or JSON file');
    const exported = require(file);
    assert(exported && typeof exported === 'object', 'Fixture records must export an object or array');
    const values = Object.values(exported);
    assert(values.length && values.every(record => record && typeof record.code === 'string' && record.code),
      'Fixture records must be nonempty coded records');
    assert(new Set(values.map(record => record.code)).size === values.length, 'Fixture record codes must be unique');
    return values;
  };
  const rules = records(fixture.ruleRecordsPath);
  const profiles = records(fixture.impactProfileRecordsPath);
  const selected = profiles.filter(profile => profile.code === fixture.impactProfileCode);
  assert(selected.length === 1, 'Select one fixture impact profile code');
  return validateWasteFixture({ ...fixture, rules, impactProfile: selected[0] });
}

/** Validates explicit fixture inputs before authentication or any API request. */
export function validateWasteFixture(fixture) {
  assert(fixture?.collectionPoint?.code, 'Waste fixture requires collectionPoint.code');
  assert(Array.isArray(fixture.rules) && fixture.rules.length, 'Waste fixture requires acceptance rules');
  assert(fixture.facts?.categoryCode && fixture.facts?.familyCode, 'Waste fixture requires category/family facts');
  assert(fixture.impactProfile?.code, 'Waste fixture requires impactProfile');
  assert(Array.isArray(fixture.expectedMetrics) && fixture.expectedMetrics.length, 'Waste fixture requires expectedMetrics');
  assert(fixture.expectedMetrics.every(metric => metric.metricCode && typeof metric.value === 'string'), 'Expected metrics require code and string value');
  assert(fixture.submissionCode && fixture.resultCode && fixture.runId, 'Waste fixture requires submissionCode, resultCode and runId');
  assert.equal(typeof fixture.requiresReceipt, 'boolean', 'Waste fixture requires receipt expectation');
  return fixture;
}

/** Executes secured API operations; never fabricates authority or claims database persistence. */
export async function runWasteManagementAcceptance({ execute = false, fixture, request, authenticate, serviceHeaders } = {}) {
  validateWasteFixture(fixture);
  if (!execute) return { state: 'PLANNED', evidence: 'NONE', operations: ['acceptance-check', 'submit', 'review', 'approve', 'impact'] };
  assert(/^Bearer\s+\S+$/u.test(serviceHeaders?.Authorization || ''), 'Supply an authorized service bearer for the service-only impact route');
  const headers = await authenticate();
  const post = (route, body, step, auth = headers) => request('WASTE', '/nodics/wasteApi/v0' + route, {
    method: 'POST', headers: { ...auth, 'Idempotency-Key': fixture.runId + ':' + step, 'X-Correlation-Id': fixture.runId },
    body: JSON.stringify(body),
  });
  const accepted = await post('/waste/collection-points/' + encodeURIComponent(fixture.collectionPoint.code) + '/acceptance-check',
    { collectionPoint: fixture.collectionPoint, rules: fixture.rules, facts: fixture.facts }, 'acceptance');
  assert.equal(accepted.accepted, true, 'Waste facts must be accepted');
  assert.equal(accepted.requiresReceipt, fixture.requiresReceipt, 'Receipt policy mismatch');
  const submitted = await post('/waste/submissions', { ...fixture.facts, code: fixture.submissionCode,
    preferredCollectionPointCode: fixture.collectionPoint.code }, 'submit');
  assert.equal(submitted.code, fixture.submissionCode, 'Submission identity mismatch');
  assert.equal(submitted.submissionStatus, 'SUBMITTED');
  assert.equal(submitted.tenant, undefined, 'Waste business response must not own tenant isolation');
  assert.equal(submitted.rewardEligibility, undefined, 'Waste submission must not own reward eligibility');
  const transition = (submission, targetStatus, step) => post('/waste/submissions/' + encodeURIComponent(submission.code) + '/transitions',
    { submission, targetStatus, ...(fixture.now ? { now: fixture.now } : {}) }, step);
  const reviewed = await transition(submitted, 'UNDER_REVIEW', 'review');
  assert.equal(reviewed.submissionStatus, 'UNDER_REVIEW');
  assert.equal(reviewed.code, submitted.code);
  const approved = await transition(reviewed, 'APPROVED', 'approve');
  assert.equal(approved.submissionStatus, 'APPROVED');
  assert.equal(approved.code, submitted.code);
  const impact = await post('/waste/impact-results', { resultCode: fixture.resultCode,
    sourceRef: { module: 'wasteSubmission', schema: 'wasteSubmission', code: approved.code },
    profile: fixture.impactProfile, facts: fixture.facts, calculationStatus: 'ESTIMATED',
    ...(fixture.now ? { now: fixture.now } : {}) }, 'impact', serviceHeaders);
  assert.equal(impact.profileCode, fixture.impactProfile.code);
  assert.deepEqual(impact.metrics.map(({ metricCode, value }) => ({ metricCode, value })), fixture.expectedMetrics);
  assert.equal(impact.rewardFormula, undefined, 'Waste impact must not own reward formula');
  return { state: 'PASSED', evidence: 'SECURED_WASTE_API_CONTRACT', submissionStatus: approved.submissionStatus,
    impactProfileCode: impact.profileCode, persistenceVerified: false, importVerified: false };
}

/** Resolves fixtures through effective WASTE nConfig; --execute is required for API operations. */
export async function main(args = process.argv.slice(2), options = {}) {
  if (args.includes('--help')) return { usage: 'acceptance:waste-management [--execute]; tooling.acceptance.wasteManagement.fixture; NODICS_WASTE_IMPACT_SERVICE_TOKEN for service-only impact. Does not install data or prove persistence.' };
  if (args.some(arg => arg !== '--execute')) throw new Error('Unknown Waste management option');
  const context = await createAcceptanceContext(options);
  const config = projectRuntimeAcceptance(context.projectRoot, context.configuration, { role: 'WASTE' }).wasteManagement;
  const token = context.environment.NODICS_WASTE_IMPACT_SERVICE_TOKEN;
  const fixture = resolveWasteFixture({ fixture: config?.fixture,
    modules: commands.collectModules(context.projectRoot, commands.collectModules(frameworkRoot, [])) });
  return runWasteManagementAcceptance({ ...context, execute: args.includes('--execute'), fixture,
    serviceHeaders: token ? { Authorization: 'Bearer ' + token } : undefined });
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  main().then(result => console.log(JSON.stringify(result, null, 2))).catch(error => { console.error(error.message); process.exitCode = 1; });
