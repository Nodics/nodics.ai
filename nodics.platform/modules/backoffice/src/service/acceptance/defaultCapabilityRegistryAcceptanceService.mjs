/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

import { pathToFileURL } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import assert from 'node:assert/strict';
import { parseAcceptanceResponse } from '../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectAcceptanceService.mjs';
import { readProjectEnvironmentConfiguration, projectEndpointUrl, projectCorsOrigin, projectRuntime } from '../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectEnvironmentConfigurationService.mjs';

/** @module backoffice/acceptance/runCapabilityRegistryAcceptance @description Executes the owning capability's canonical API acceptance against an explicitly selected customer deployment. @owner backoffice @layer tooling */
export async function runCapabilityRegistryAcceptance({
  projectRoot = process.env.NODICS_PROJECT_ROOT || process.cwd(), environment = process.env,
  configuration, execute = false, fetch: fetchRequest = globalThis.fetch,
  log = console.log, sleep = delay,
} = {}) {
  if (!execute) throw new Error('Explicit --execute is required for mutating acceptance');
  const environmentProfile = configuration || readProjectEnvironmentConfiguration(projectRoot, environment.ENV || '');
  const config = environmentProfile.acceptance?.capabilityRegistry || {};
  const technicalModules = config.technicalModules;
  assert(Array.isArray(technicalModules) && technicalModules.length > 0 &&
    technicalModules.every(name => typeof name === 'string' && name.length > 0),
  'Select at least one technical capability for registry acceptance');
  const platformUrl = environment.AXIS_PLATFORM_URL || projectEndpointUrl(environmentProfile, { role: 'PLATFORM' });
  const requestOrigin = environment.NODICS_ACCEPTANCE_ORIGIN || projectCorsOrigin(environmentProfile, 'axis');
  const enterprise = environment.AXIS_ENTERPRISE || 'default';
  const project = environment.AXIS_PROJECT || environmentProfile.projectCode;
  const loginId = environment.AXIS_LOGIN_ID || 'admin';
  const password = environment.AXIS_PASSWORD || environment.NODICS_BOOTSTRAP_ADMIN_PASSWORD;
  const functionalModule = config.functionalModule || 'nodics.process';
  const expectedFoundationModule = 'nodics.foundation';
  const retiredModule = 'nodics.core';
  const observedRuntime = projectRuntime(environmentProfile, config.runtime);
  const observedServer = config.observedServer || [environmentProfile.environment, observedRuntime.server, 'default'].join(':');
  const unwrap = value => value?.result || value?.data || value;
  const restorableState = state => ({
    registrationState: state.registrationState,
    enabled: state.registrationState === 'REGISTERED' ? state.enabled : false,
  });

  async function request(path, token, options = {}) {
    const response = await fetchRequest(new URL(path, platformUrl), {
      signal: AbortSignal.timeout(30000),
      ...options,
      headers: {
        Accept: 'application/json',
        'x-enterprise-code': enterprise,
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
    return parseAcceptanceResponse(response, {
      route: path,
      errorLimit: 500,
      unwrap: body => unwrap(body),
    });
  }

  async function transition(token, action, revision) {
    return request(`/nodics/backoffice/v0/runtime/modules/registrations/${functionalModule}/${action}`, token, {
      method: 'POST',
      body: JSON.stringify({ project, expectedRevision: revision, reason: 'Capability Registry acceptance' }),
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
      await sleep(100);
    }
    return registration;
  }

  async function main() {
    const authentication = await request('/nodics/profile/v0/employee/browser/authenticate', undefined, {
      method: 'POST',
      body: JSON.stringify({ loginId, password }),
      headers: { Origin: requestOrigin },
    });
    const token = authentication.authToken;
    assert(token, 'Employee authentication must return an access token');
    const registrations = await request(`/nodics/backoffice/v0/runtime/modules/registrations?project=${project}`, token);
    const foundationRegistrations = registrations.items.filter(item => item.functionalModule === expectedFoundationModule);
    assert.equal(foundationRegistrations.length, 1, 'Foundation must appear exactly once in the Axis functional-module registry');
    assert(!registrations.items.some(item => item.functionalModule === retiredModule),
      'The retired framework identity must not be exposed by the Axis functional-module registry');
    let registration = await request(`/nodics/backoffice/v0/runtime/modules/registrations/${functionalModule}?project=${project}`, token);
    assert(registration.observedServers.includes(observedServer), 'Selected capability must be observed through the selected runtime');
    for (const name of technicalModules)
      assert(registration.technicalModules.includes(name), `Selected runtime must expose ${name} as a child module`);

    const original = { registrationState: registration.registrationState, enabled: registration.enabled };
    const expectedRestored = restorableState(original);
    let registeredByTest = false;
    let activatedByTest = false;
    try {
      if (registration.registrationState !== 'REGISTERED') {
        registration = await transition(token, 'register', registration.catalogueRevision);
        registeredByTest = true;
      }
      if (!registration.enabled) {
        registration = await transition(token, 'activate', registration.catalogueRevision);
        activatedByTest = true;
      }
      let bootstrap = await request('/nodics/backoffice/v0/bootstrap', token);
      for (const name of technicalModules)
        assert(bootstrap.catalogue[name], `${name} capability must enter Axis after registration and activation`);
    } finally {
      if (activatedByTest) registration = await transition(token, 'deactivate', registration.catalogueRevision);
      if (registeredByTest) registration = await transition(token, 'deregister', registration.catalogueRevision);
    }
    const restored = await waitForRegistrationState(token, expectedRestored);
    log(
      `Capability Registry restored state: original=${JSON.stringify(original)}, expected=${JSON.stringify(expectedRestored)}, restored=${JSON.stringify({ registrationState: restored.registrationState, enabled: restored.enabled })}`,
    );
    assert.equal(restored.registrationState, expectedRestored.registrationState);
    assert.equal(restored.enabled, expectedRestored.enabled);
    log('Capability Registry acceptance passed: consolidated runtime, activation projection, isolation, and state restoration');
  }

  await main();
  return { state: 'PASSED', suite: 'acceptance:capability-registry' };
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  if (process.argv.includes('--help')) console.log('Run through nodics project:run with --execute; this suite mutates only through authorized owner APIs.');
  else await runCapabilityRegistryAcceptance({ execute: process.argv.includes('--execute'), approvePublications: process.argv.includes('--approve-publications') });
}
