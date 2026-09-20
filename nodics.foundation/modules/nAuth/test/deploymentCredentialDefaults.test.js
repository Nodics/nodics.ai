/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nAuth/test/deploymentCredentialDefaults @description Verifies deployment credential resolution, stable proof separation and strict inherited policy. @layer test @owner nAuth */
const test = require('node:test');
const assert = require('node:assert/strict');
const bindings = require('../../nConfig/src/service/defaultConfigurationBindingService');
const defaults = require('../config/properties');
const security = require('../src/service/security/defaultAuthSecurityService');
const facade = values => ({get:key => values[key]});

test('missing deployment credentials fail without a local or administrator fallback', () => {
  const values = bindings.resolve(defaults, {}, {environmentVariables:{}});
  assert.equal(values.defaultAuthDetail.apiKey, null);
  assert.throws(() => security.getJwtSecret(facade(values)), /strong JWT secret/);
  assert.throws(() => security.validateBootstrapIdentity(facade(values)), /adminPassword/);
  assert.equal(values.authSecurity.apiKey.requireScopes, true);
  assert.equal(values.authSecurity.compatibility.allowLocalBootstrapIdentity, false);
  assert.equal(values.authSecurity.securityStamp.failClosed, true);
  assert.equal(values.cache.auth.channels.auth.fallback, false);
});

test('bootstrap proof and current runtime proof remain independently supplied across restarts and overrides', () => {
  const variables = {
    NODICS_JWT_SECRET:'A1-opaque-signing-material-for-an-isolated-contract-check',
    NODICS_API_KEY_PEPPER:'B2-opaque-digest-material-for-an-isolated-contract-check',
    NODICS_BOOTSTRAP_ADMIN_PASSWORD:'C3-opaque-initial-human-password',
    NODICS_BOOTSTRAP_SERVICE_PASSWORD:'D4-opaque-initial-service-password',
    NODICS_BOOTSTRAP_SERVICE_API_KEY:'E5-opaque-initial-service-proof-for-contract-check',
    NODICS_RUNTIME_API_KEY:'F6-opaque-current-runtime-proof-for-contract-check',
  };
  const first = bindings.resolve(defaults, {}, {environmentVariables:variables});
  const restart = bindings.resolve(defaults, {}, {environmentVariables:variables});
  assert.equal(security.getJwtSecret(facade(first)), variables.NODICS_JWT_SECRET);
  assert.equal(security.validateBootstrapIdentity(facade(first)).serviceApiKey, variables.NODICS_BOOTSTRAP_SERVICE_API_KEY);
  assert.notEqual(first.defaultAuthDetail.apiKey, first.bootstrapIdentity.serviceApiKey);
  assert.deepEqual(first, restart);
  delete variables.NODICS_RUNTIME_API_KEY;
  assert.equal(bindings.resolve(defaults, {}, {environmentVariables:variables}).defaultAuthDetail.apiKey, null);
  const changed = bindings.merge(first, {defaultAuthDetail:{apiKey:'selected-node-retained-proof'}});
  assert.equal(changed.defaultAuthDetail.apiKey, 'selected-node-retained-proof');
  assert.equal(changed.bootstrapIdentity.serviceApiKey, first.bootstrapIdentity.serviceApiKey);
});
