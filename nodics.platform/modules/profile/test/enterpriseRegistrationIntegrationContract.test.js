/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module profile/test/enterpriseRegistrationIntegrationContract
 * @owner profile @layer test
 * Loads assembled source schemas, routes and controllers. This does not run
 * generated middleware, installed indexes, an HTTP server or a frontend.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
global.ENUMS = { ContactType: Object.fromEntries(['EMAIL', 'PHONE', 'FAX', 'PAGER'].map(key => [key, { key }])) };
const schemas = require('../src/schemas/schemas').profile;
const routes = require('../src/router/routers').profile;
const properties = require('../config/properties');
const controller = require('../src/controller/enterprise/defaultEnterpriseManagementController');
const endpoints = properties.enterpriseManagement.registration.endpoints;
const flat = Object.values(routes).flatMap(group => Object.values(group));

test('every advertised registration action resolves to exactly one assembled Profile controller operation', () => {
  for (const [action, endpoint] of Object.entries(endpoints)) {
    const key = endpoint.replace(/^\/nodics\/profile\/v0/, '');
    const matches = flat.filter(route => route.key === key && route.method === 'POST');
    assert.equal(matches.length, 1, action);
    assert.equal(matches[0].controller, 'DefaultEnterpriseManagementController');
    assert.equal(typeof controller[matches[0].operation], 'function');
    assert.equal(matches[0].apiExposure, 'profileRegistration');
  }
});
test('public commands do not accept verification authority or role fields', () => {
  for (const endpoint of Object.values(endpoints)) {
    const route = flat.find(item => item.key === endpoint.replace(/^\/nodics\/profile\/v0/, '') && item.method === 'POST');
    const schema = route.requestBody.content['application/json'].schema;
    assert.equal(schema.additionalProperties, false);
    for (const forbidden of ['authData', 'tenant', 'roleCode', 'groupCodes', 'proof', 'verified']) {
      assert.equal(schema.properties[forbidden], undefined);
    }
  }
});
test('legacy completion contract now requires continuation instead of a caller enterprise/email', () => {
  const schema = routes.loadDefaults.registerPreAssignedEnterpriseEmployee.requestBody.content['application/json'].schema;
  assert(schema.required.includes('continuation'));
  assert.equal(schema.properties.enterpriseCode, undefined);
  assert.equal(schema.properties.email, undefined);
});
test('private checkpoint remains on the existing assignment and generic routes are disabled', () => {
  const s = schemas.enterpriseAccessAssignment;
  assert.equal(s.router.enabled, false); assert.equal(s.cache.enabled, false);
  assert.equal(s.event.enabled, false); assert.equal(s.backoffice.enabled, false);
  assert.equal(s.definition.registration.type, 'object');
  assert.equal(s.backoffice.concurrency.managed, true); assert.equal(s.backoffice.concurrency.field, 'revision');
});
test('source claim index applies only to explicitly claimed identities', () => {
  const index = schemas.enterpriseAccessAssignment.indexes.individual.normalizedEmail;
  assert.equal(index.name, 'normalizedEmail'); assert.equal(index.options.unique, true);
  assert.deepEqual(index.options.partialFilterExpression, { identityClaimed: true });
});
test('employee registration metadata does not alter the existing customer credential relation', () => {
  assert.equal(schemas.employee.definition.registrationAssignmentCode.type, 'string');
  assert.equal(schemas.employee.definition.registrationSuspended.type, 'bool');
  assert.equal(schemas.customer.super, 'user'); assert.equal(schemas.user.definition.password.type, 'objectId');
  assert.equal(schemas.user.refSchema.password.propertyName, '_id');
});
test('onboarding remains disabled until separate runtime qualification', () => {
  const p = properties.enterpriseManagement.registration;
  assert.equal(p.enabled, false); assert.equal(p.inventoryQualified, false);
  assert.equal(p.assignmentClaimIndexQualified, false); assert.equal(p.requireDistributedRateLimit, true);
});
test('credential maximum and recovery guidance stay with the existing Profile configuration owner', () => {
  const p = properties.enterpriseManagement.registration;
  assert.deepEqual(p.maximumPasswordLength, { $config: 'ref', path: 'passwordLengthLimit' });
  assert.equal(typeof p.presentation.recoveryPasswordHelp, 'string');
  assert.equal(typeof p.presentation.recoveryPasswordLabel, 'string');
});
