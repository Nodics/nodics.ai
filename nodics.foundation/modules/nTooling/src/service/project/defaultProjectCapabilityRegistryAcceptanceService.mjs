#!/usr/bin/env node
/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.env.NODICS_PROJECT_ROOT || process.cwd();
const manifestPath = path.join(projectRoot, 'nodics.project.json');
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : {};
const config = manifest.acceptance?.capabilityRegistry || {};
const platformUrl = process.env.AXIS_PLATFORM_URL || 'http://127.0.0.1:4300';
const axisUrl = process.env.AXIS_URL || 'http://127.0.0.1:3100';
const enterprise = process.env.AXIS_ENTERPRISE || 'default';
const project = process.env.AXIS_PROJECT || manifest.projectCode || 'nodics.kickoff';
const loginId = process.env.AXIS_LOGIN_ID || 'admin';
const password = process.env.AXIS_PASSWORD || 'adminPassword';
const functionalModule = config.functionalModule || 'nodics.process';
const expectedFoundationModule = config.foundationModule || 'nodics.foundation';
const retiredModule = config.retiredModule || 'nodics.core';
const observedServer = config.observedServer || 'kickoffLocal:processServer:default';
const optionalModule = config.optionalModule || 'nodics.cron';
const optionalObservedServers = config.optionalObservedServers || ['kickoffLocal:processServer:default'];
const unwrap = value => value?.result || value?.data || value;
const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const restorableState = state => ({
  registrationState: state.registrationState,
  enabled: state.registrationState === 'REGISTERED' ? state.enabled : false,
});

async function request(path, token, options = {}) {
  const response = await fetch(new URL(path, platformUrl), {
    ...options,
    headers: {
      Accept: 'application/json',
      'x-enterprise-code': enterprise,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : undefined;
  if (!response.ok) throw new Error(`${path} returned HTTP ${response.status}: ${text.slice(0, 500)}`);
  return unwrap(body);
}

async function transition(token, action, revision) {
  return request(`/nodics/backoffice/v0/runtime/modules/registrations/${functionalModule}/${action}`, token, {
    method: 'POST',
    body: JSON.stringify({ project, expectedRevision: revision, reason: 'Kickoff Capability Registry acceptance' }),
  });
}

async function waitForRegistrationState(token, expected) {
  let registration;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    registration = await request(
      `/nodics/backoffice/v0/runtime/modules/registrations/${functionalModule}?project=${project}`,
      token,
    );
    if (
      registration.registrationState === expected.registrationState &&
      registration.enabled === expected.enabled
    ) {
      return registration;
    }
    await delay(100);
  }
  return registration;
}

async function main() {
  const authentication = await request('/nodics/profile/v0/employee/browser/authenticate', undefined, {
    method: 'POST',
    body: JSON.stringify({ loginId, password }),
    headers: { Origin: axisUrl },
  });
  const token = authentication.authToken;
  assert(token, 'Employee authentication must return an access token');
  const registrations = await request(`/nodics/backoffice/v0/runtime/modules/registrations?project=${project}`, token);
  const foundationRegistrations = registrations.items.filter(item => item.functionalModule === expectedFoundationModule);
  assert.equal(foundationRegistrations.length, 1, 'Foundation must appear exactly once in the Axis functional-module registry');
  assert(!registrations.items.some(item => item.functionalModule === retiredModule),
    'The retired framework identity must not be exposed by the Axis functional-module registry');
  let process = await request(`/nodics/backoffice/v0/runtime/modules/registrations/${functionalModule}?project=${project}`, token);
  assert(process.observedServers.includes(observedServer), 'Process must be observed through processServer');
  const available = await request(`/nodics/backoffice/v0/runtime/modules/available?project=${project}`, token);
  const cron = available.items.find(item => item.functionalModule === optionalModule);
  assert(cron, 'Cron must be observed as an optional functional module');
  assert.deepEqual(cron.observedServers, optionalObservedServers, 'Cron must not require standalone cronServer');

  const original = { registrationState: process.registrationState, enabled: process.enabled };
  const expectedRestored = restorableState(original);
  let registeredByTest = false;
  let activatedByTest = false;
  try {
    if (process.registrationState !== 'REGISTERED') {
      process = await transition(token, 'register', process.catalogueRevision);
      registeredByTest = true;
    }
    if (!process.enabled) {
      process = await transition(token, 'activate', process.catalogueRevision);
      activatedByTest = true;
    }
    let bootstrap = await request('/nodics/backoffice/v0/bootstrap', token);
    assert(bootstrap.catalogue.flowCore, 'Process capability must enter Axis after registration and activation');
    assert(!bootstrap.catalogue.cronjob, 'Disabled Cron must not enter Axis merely because it shares processServer');
  } finally {
    if (activatedByTest) process = await transition(token, 'deactivate', process.catalogueRevision);
    if (registeredByTest) process = await transition(token, 'deregister', process.catalogueRevision);
  }
  const restored = await waitForRegistrationState(token, expectedRestored);
  console.log(
    `Capability Registry restored state: original=${JSON.stringify(original)}, expected=${JSON.stringify(expectedRestored)}, restored=${JSON.stringify({ registrationState: restored.registrationState, enabled: restored.enabled })}`,
  );
  assert.equal(restored.registrationState, expectedRestored.registrationState);
  assert.equal(restored.enabled, expectedRestored.enabled);
  console.log('Capability Registry acceptance passed: consolidated runtime, activation projection, isolation, and state restoration');
}

main().catch(error => {
  console.error(`Capability Registry acceptance failed: ${error.message}`);
  process.exitCode = 1;
});
