/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module profile/test/runtimeServiceScopeAdoption @description Proves exact release-only service credential scope adoption and drift refusal. @owner profile @layer test */
const test = require("node:test");
const assert = require("node:assert/strict");
const service = require("../src/service/employee/defaultEmployeeService");

global.CLASSES = { NodicsError: class NodicsError extends Error {
  constructor(code, message) { super(message || code); this.code = code; }
} };
global.CONFIG = { get: key => key === "identityGovernance" ?
  { principalPolicy: { serviceGroup: "serviceAccountUserGroup" } } : undefined };

const expected = ["auth.internal.token.read", "profile.enterprise.reference.read"];
const desired = [...expected, "profile.customer.reference.read"];
const instruction = { code: "apiAdmin", loginId: "apiAdmin",
  expectedScopeCodes: expected, scopeCodes: desired };

function fixture() {
  let person = { _id: "employee-1", code: "apiAdmin", loginId: "apiAdmin", active: true,
    principalType: "service", userGroups: ["serviceAccountUserGroup"], apiKeyHash: "digest",
    apiKeyStatus: "active", apiKeyScopes: [...expected], authVersion: 4 };
  let admitted = true, updates = 0, required;
  global.SERVICE = {
    DefaultDataReleaseService: { isIdentityAuthorityReleaseExecution: (tenant, schema, operation) =>
      admitted && tenant === "default" && schema === "employee" && operation === "adoptRuntimeServiceScopesAll" },
    DefaultIdentityCatalogueService: { requirePermissions: async scopes => { required = scopes; } },
  };
  const owner = Object.assign(Object.create(service), {
    get: async () => ({ code: "SUC_FIND_00000", count: 1, result: [structuredClone(person)] }),
    update: async request => {
      updates += 1;
      assert.deepEqual(request.query.apiKeyScopes, expected);
      assert.deepEqual(request.model.apiKeyScopes, desired);
      person = { ...person, apiKeyScopes: [...desired], authVersion: person.authVersion + 1 };
      return { code: "SUC_UPDATE_00000", result: { acknowledged: true, matchedCount: 1 } };
    },
  });
  return { owner, request: { tenant: "default", authData: { isSystem: true }, models: [structuredClone(instruction)] },
    person: () => person, updates: () => updates, required: () => required,
    deny: () => { admitted = false; }, drift: scopes => { person.apiKeyScopes = scopes; } };
}

test("private Init adoption applies one exact scope transition and is idempotent", async () => {
  const f = fixture();
  assert.deepEqual(await f.owner.adoptRuntimeServiceScopesAll(f.request), { result: [{ code: "apiAdmin" }] });
  assert.deepEqual(f.person().apiKeyScopes, desired);
  assert.equal(f.person().authVersion, 5);
  assert.equal(f.updates(), 1);
  assert.deepEqual(new Set(f.required()), new Set([...expected, ...desired]));
  assert.deepEqual(await f.owner.adoptRuntimeServiceScopesAll(f.request), { result: [{ code: "apiAdmin" }] });
  assert.equal(f.updates(), 1);
});

test("copied authority, drift and wildcard scopes are rejected without mutation", async () => {
  const denied = fixture();
  denied.deny();
  await assert.rejects(denied.owner.adoptRuntimeServiceScopesAll(denied.request), { code: "ERR_PROFILE_CREDENTIAL_OWNERSHIP" });
  const drifted = fixture();
  drifted.drift(["unreviewed.permission"]);
  await assert.rejects(drifted.owner.adoptRuntimeServiceScopesAll(drifted.request), { code: "ERR_PROFILE_CREDENTIAL_OWNERSHIP" });
  const wildcard = fixture();
  wildcard.request.models[0].scopeCodes = ["*"];
  await assert.rejects(wildcard.owner.adoptRuntimeServiceScopesAll(wildcard.request), { code: "ERR_PROFILE_CREDENTIAL_OWNERSHIP" });
  assert.equal(denied.updates() + drifted.updates() + wildcard.updates(), 0);
});
