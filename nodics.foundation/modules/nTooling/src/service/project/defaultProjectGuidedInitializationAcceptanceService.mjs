#!/usr/bin/env node
/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */

import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.env.NODICS_PROJECT_ROOT || process.cwd();
const manifestPath = path.join(projectRoot, 'nodics.project.json');
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : {};
const config = manifest.acceptance?.guidedInitialization || {};
const platformUrl = process.env.NODICS_PLATFORM_URL || 'http://127.0.0.1:4300';
const processUrl = process.env.NODICS_PROCESS_URL || 'http://127.0.0.1:4330';
const origin = process.env.AXIS_ORIGIN || 'http://localhost:3100';
const enterpriseCode = process.env.AXIS_ENTERPRISE_CODE || 'default';
const loginId = process.env.AXIS_LOGIN_ID || 'admin';
const password = process.env.AXIS_PASSWORD || 'adminPassword';
const profileCode = process.env.NODICS_INITIALIZATION_PROFILE || config.profileCode || 'localWcmsFoundation';

async function request(url, options = {}) {
  const response = await fetch(url, options);
  const value = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${url} returned ${String(response.status)}: ${String(value.message || 'request failed')}`);
  return value.data || value.result || value;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function importMandatoryProcessRelease(headers) {
  const releaseCode = 'cms:cmsPublicationApproval';
  const catalogue = await request(`${processUrl}/nodics/import/v0/init`, { headers });
  const releases = catalogue.data || catalogue.items || catalogue;
  const release = [].concat(releases || []).find(item => item.releaseCode === releaseCode);
  assert(release, `${releaseCode} is unavailable from Process nImport`);
  if (release.status === 'CURRENT') return;
  await request(`${processUrl}/nodics/import/v0/init/install`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ releaseCodes: [releaseCode], expectedReleases: { [releaseCode]: release.version } }),
  });
}

async function approvePublication(headers, publicationCode, reason) {
  const instances = await request(`${processUrl}/nodics/process/v0/instances?limit=100`, { headers });
  const instance = [].concat(instances.items || instances || []).find(item =>
    item.definitionCode === 'cmsPublicationApproval' &&
    item.context?.publicationCode === publicationCode &&
    item.status === 'WAITING');
  assert(instance, `Publication workflow instance is unavailable for ${publicationCode}`);
  const tasks = await request(`${processUrl}/nodics/process/v0/tasks?instanceCode=${encodeURIComponent(instance.code)}&limit=20`, { headers });
  const task = [].concat(tasks.items || tasks || []).find(item =>
    item.instanceCode === instance.code &&
    item.nodeCode === 'publicationReview' &&
    ['OPEN', 'CLAIMED'].includes(item.status));
  assert(task, `Publication approval task is unavailable for ${publicationCode}`);
  if (task.status === 'OPEN') {
    await request(`${processUrl}/nodics/process/v0/tasks/${encodeURIComponent(task.code)}/claim`, { method: 'POST', headers });
  }
  const completed = await request(`${processUrl}/nodics/process/v0/tasks/${encodeURIComponent(task.code)}/complete`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ decision: { approved: true, action: 'APPROVE', emergencyOverride: true, reason } }),
  });
  assert(completed.instance?.status === 'COMPLETED', `Publication workflow did not complete for ${publicationCode}`);
}

async function publishApplicationProfile(headers, code) {
  let status = await request(`${platformUrl}/nodics/backoffice/v0/applications/${code}/initialization`, { headers });
  if (status.readiness === 'READY' && status.publication?.state === 'ONLINE') return status;
  const reason = `Guided local initialization for ${code}`;
  const initiated = await request(`${platformUrl}/nodics/backoffice/v0/applications/${code}/initialization/initiate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ reason }),
  });
  const publicationCode = initiated.publication?.code;
  assert(publicationCode && initiated.publication?.state === 'PENDING_APPROVAL',
    `${code} did not enter publication approval`);
  await approvePublication(headers, publicationCode, reason);
  status = await request(`${platformUrl}/nodics/backoffice/v0/applications/${code}/initialization`, { headers });
  assert(status.readiness === 'READY' && status.publication?.state === 'ONLINE', `${code} is not READY Online`);
  return status;
}

const commonHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  Origin: origin,
  'x-enterprise-code': enterpriseCode,
};

const authentication = await request(`${platformUrl}/nodics/profile/v0/employee/browser/authenticate`, {
  method: 'POST', headers: commonHeaders, body: JSON.stringify({ loginId, password }),
});
assert(authentication.authToken, 'Employee authentication did not return an access token');
const headers = { ...commonHeaders, Authorization: `Bearer ${authentication.authToken}`,
  'x-nodics-client-contract-version': '1' };
const bootstrap = await request(`${platformUrl}/nodics/backoffice/v0/bootstrap`, { headers });
const imports = bootstrap.modules?.import || [];
const staged = imports.find(item => item.runtimeRole?.publication === 'STAGED');
const online = imports.find(item => item.runtimeRole?.publication === 'ONLINE');
assert(staged, 'Authenticated bootstrap does not advertise a semantic STAGED import connection');
assert(online, 'Authenticated bootstrap does not advertise a semantic ONLINE import connection');

const catalogueUrl = `${staged.endpoint}/v0/initialization-profiles`;
let profiles = await request(catalogueUrl, { headers });
let profile = profiles.find(item => item.profileCode === profileCode);
assert(profile, `Initialization profile is unavailable: ${profileCode}`);
assert(profile.destinationRole === staged.runtimeRole.code,
  `Initialization profile is not bound to the ${staged.runtimeRole.code} destination`);
assert(profile.steps.map(item => item.dataType).join(',') === 'init,core', 'Initialization step order drifted');

const validation = await request(`${staged.endpoint}/v0/initialization-profiles/${profileCode}/validate`, {
  method: 'POST', headers, body: '{}',
});
assert(validation.mode === 'VALIDATE', 'Profile validation did not use validation-only mode');

const installation = await request(`${staged.endpoint}/v0/initialization-profiles/${profileCode}/install`, {
  method: 'POST', headers, body: '{}',
});
assert(installation.mode === 'INSTALL', 'Profile installation response mode is invalid');
assert(installation.profile?.status === 'CURRENT', 'Initialization profile did not become CURRENT');
assert(installation.profile.steps.flatMap(item => item.releases).every(item => item.status === 'CURRENT'),
  'At least one guided initialization release is not CURRENT');

profiles = await request(catalogueUrl, { headers });
profile = profiles.find(item => item.profileCode === profileCode);
assert(profile?.status === 'CURRENT', 'CURRENT initialization state did not persist after reconciliation');
const noOp = await request(`${staged.endpoint}/v0/initialization-profiles/${profileCode}/install`, {
  method: 'POST', headers, body: '{}',
});
assert(noOp.results.every(item => item.skipped === true), 'Repeated installation was not an idempotent no-op');

const history = await request(`${staged.endpoint}/v0/run/history?limit=50&skip=0`, { headers });
assert(Array.isArray(history), 'Import history contract did not return a list');
assert(history.some(run => ['init', 'core'].includes(run.dataType)), 'Guided execution is missing from import run history');

const onlineResponse = await fetch(`${online.endpoint}/v0/initialization-profiles`, { headers });
const onlineBody = await onlineResponse.json().catch(() => ({}));
assert(onlineResponse.status === 403 && String(onlineBody.message || '').includes('dataImport'),
  'Online runtime must reject data-import administration');

const publicationProfiles = config.publicationProfiles || ['nexus', 'nexusupdate'];
const publicationEvidence = [];
await importMandatoryProcessRelease(headers);
for (const code of publicationProfiles) {
  const status = await publishApplicationProfile(headers, code);
  assert(status.lineage?.publication?.transitions?.some(item => item.toState === 'PENDING_APPROVAL'),
    `${code} publication lineage does not contain Process approval`);
  publicationEvidence.push({ code, publication: status.publication.code, state: status.publication.state });
}
const deliveryTarget = config.deliveryProbe || { site: 'nexusCorporateSite', path: '/', locale: 'en', channel: 'web' };
const delivery = await request(`${online.endpoint.replace('/nodics/import', '/nodics/cms')}/v0/delivery/pages/resolve?site=${encodeURIComponent(deliveryTarget.site)}&path=${encodeURIComponent(deliveryTarget.path)}&locale=${encodeURIComponent(deliveryTarget.locale)}&channel=${encodeURIComponent(deliveryTarget.channel)}`, { headers });
assert(delivery.page, 'Nexus Online delivery is unavailable after governed publication');

console.log(JSON.stringify({
  profileCode, status: profile.status, destinationRole: profile.destinationRole,
  steps: profile.steps.map(step => ({ dataType: step.dataType, releases: step.releases.length })),
  validationMode: validation.mode, repeatedInstall: 'SKIPPED_CURRENT',
  historyRuns: history.length, onlineDataImport: 'DISABLED',
  publicationEvidence, onlineDelivery: 'AVAILABLE',
}, null, 2));
