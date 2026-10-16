/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module copilotKnowledge/test/copilotAcceptanceIdentityOwnership
 * @description Covers bounded disposable assignments and create-or-preserve owner delegation without starting a runtime.
 * @layer test @owner copilotKnowledge
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const bootstrap = require("./helpers/runtimeAcceptance/defaultCopilotAcceptanceBootstrapService");
const employee = require("./helpers/runtimeAcceptance/defaultEmployeeService");
const profileBootstrap = require("../../../../nodics.platform/modules/profile/src/service/identity/defaultMandatoryIdentityBootstrapService");
const runtime = require("../../../../nodics.platform/modules/profile/src/service/identity/defaultRuntimeAuthorizationService");
const catalogue = require("../../../../nodics.platform/modules/profile/src/service/identity/defaultIdentityCatalogueService");
const groups = require("../../../../nodics.platform/modules/profile/src/service/group/defaultUserGroupGovernanceService");
const identity = require("../../../../nodics.platform/modules/profile/test/helpers/identityCatalogueFixture");

function fixture(t, flags = {}) {
  const previous = { CONFIG: global.CONFIG, SERVICE: global.SERVICE, CLASSES: global.CLASSES };
  t.after(() => Object.assign(global, previous));
  const config = {
    databaseName: "nodics_erasure_test_" + "a".repeat(32),
    password: "disposable-password",
    runtimeDeployments: [{ projectCode: "nodics.repository-build", environmentCode: "acceptanceLocal",
      serverCode: "acceptance", instanceCode: "copilot-acceptance", modules: ["profile", "copilotApi"] }],
    ...flags,
  };
  global.CONFIG = { get: (key) => key === "copilotAcceptance" ? config : undefined };
  global.CLASSES = { NodicsError: class extends Error {} };
  global.SERVICE = { DefaultCopilotAcceptanceBootstrapService: bootstrap,
    DefaultMandatoryIdentityBootstrapService: profileBootstrap,
    DefaultIdentityCatalogueService: identity.catalogue(undefined, identity.records("Permission").map((row) => row.code)) };
  return config;
}

test("disposable runtime scopes are exact and optional workflows add only their independent grants", (t) => {
  const config = fixture(t);
  assert.deepEqual(bootstrap.runtimePermissions(), ["auth.internal.token.read", "profile.enterprise.search"]);
  config.withAxis = true;
  const base = ["auth.internal.token.read", "auth.internal.token.read.anyTenant", "profile.enterprise.search",
    "profile.customer.register", "profile.address.reference.read", "profile.enterprise.reference.read",
    "location.location.read", "loyalty.wallet.open", "loyalty.wallet.read", "media.evidence.read",
    "media.customer.upload", "media.customer.read", "import.release.validate", "import.core.run",
    "publish.lifecycle.create", "publish.lifecycle.view", "publish.lifecycle.validate", "publish.lifecycle.requestApproval"];
  assert.deepEqual(bootstrap.runtimePermissions(), base);
  config.withEnterpriseActions = true;
  assert.deepEqual(bootstrap.runtimePermissions(), [...base, "profile.tenant.namespace.bind"]);
  config.withRefresh = true;
  assert.deepEqual(bootstrap.runtimePermissions(), [...base, "profile.tenant.namespace.bind",
    "process.instance.start.internal", "copilot.knowledge.source.manage",
    "copilot.knowledge.source.notify", "copilot.knowledge.internal.read"]);
  assert.equal(bootstrap.runtimePermissions().some((code) => code.includes("*")), false);
  config.databaseName = "existing_database";
  assert.throws(() => bootstrap.runtimePermissions(), /Disposable/);
});

test("runtime assignment creation uses Profile and restart retains revoked and narrowed grants without a save", async (t) => {
  const config = fixture(t), rows = [], writes = [];
  const authData = { principalType: "human", loginId: "fixture-admin" };
  SERVICE.DefaultIdentityCatalogueGovernanceService = {
    async authorizeSeed(request) { assert.equal(request.authData, authData); },
  };
  const owner = {
    async get(request) {
      assert.equal(request.options.skipItemCache, true);
      const result = rows.filter((row) => row.code === request.query.$or[0].code);
      return { code: "SUC_READ", count: result.length, result: structuredClone(result) };
    },
    async save(request) {
      assert.equal(request.query, undefined);
      assert.deepEqual(request.options, { insertOnly: true });
      writes.push(structuredClone(request.model));
      rows.push({ ...structuredClone(request.model), _id: "fixture-grant" });
      return { code: "SUC_SAVE" };
    },
    ensureDeploymentAll(request) { return runtime.ensureDeploymentAll(this, request); },
  };
  SERVICE.DefaultPrincipalScopeAssignmentService = owner;
  const request = { tenant: "default", authData };
  await bootstrap.ensureRuntimeAssignments(request);
  assert.equal(writes.length, 1);
  assert.deepEqual(rows[0].runtimeScope, { ...config.runtimeDeployments[0], permissions: bootstrap.runtimePermissions() });
  Object.assign(rows[0], { active: false, status: "REVOKED", effect: "DENY" });
  rows[0].runtimeScope.permissions = ["auth.internal.token.read"];
  rows[0].runtimeScope.modules = ["profile"];
  const retained = structuredClone(rows);
  await bootstrap.ensureRuntimeAssignments(request);
  assert.deepEqual(rows, retained);
  assert.equal(writes.length, 1);
  config.runtimeDeployments[0].modules = ["*"];
  await assert.rejects(() => bootstrap.ensureRuntimeAssignments(request));
  assert.equal(writes.length, 1);
});

test("each selected peer retains its exact deployment coordinates and module ceiling", async (t) => {
  const config = fixture(t, { withAxis: true, withRefresh: true });
  config.runtimeDeployments.push({ ...config.runtimeDeployments[0], serverCode: "acceptanceProcess",
    instanceCode: "copilot-acceptanceProcess", modules: ["workflow", "copilotApi"] });
  let calls = 0;
  SERVICE.DefaultPrincipalScopeAssignmentService = {
    async ensureDeploymentAll(request) {
      calls++;
      assert.equal(request.models.length, 2);
      for (const [index, model] of request.models.entries()) {
        assert.deepEqual(model.runtimeScope, { ...config.runtimeDeployments[index], permissions: bootstrap.runtimePermissions() });
        assert.equal(model.principalCode, "apiAdmin");
        assert.equal(model.tenantCode, "default");
        assert.equal(model.enterpriseCode, "default");
        assert.equal(model.groupCode, undefined);
      }
      assert.notEqual(request.models[0].code, request.models[1].code);
      return { result: request.models.map(({ code }) => ({ code })) };
    },
  };
  await bootstrap.ensureRuntimeAssignments({ tenant: "default", authData: {} });
  config.runtimeDeployments = [];
  await assert.rejects(() => bootstrap.ensureRuntimeAssignments({}), /Explicit disposable/);
  assert.equal(calls, 1);
});

test("fixture group authority requires password authentication, verified access and Profile authorization", async (t) => {
  fixture(t);
  const authData = { principalType: "human", loginId: "admin", tokenType: "access" };
  const calls = [];
  SERVICE.DefaultAuthSecurityService = { validateBootstrapIdentity: () => ({ adminPassword: "fixture-password" }) };
  SERVICE.DefaultAuthenticationProviderService = {
    async authenticateEmployee(request) {
      assert.deepEqual(request, { entCode: "default", loginId: "admin", password: "fixture-password" });
      calls.push("password");
      return { code: "SUC_AUTH", result: { authToken: "fixture-access", refreshToken: "fixture-refresh" } };
    },
    async removeToken(moduleName, token) {
      assert.equal(moduleName, "profile");
      assert.equal(token, "fixture-refresh");
      calls.push("remove-refresh");
    },
  };
  SERVICE.DefaultAuthorizationProviderService = {
    async authorizeToken(request) {
      assert.deepEqual(request, { authToken: "fixture-access" });
      calls.push("verify");
      return { code: "SUC_AUTH", result: authData };
    },
  };
  SERVICE.DefaultIdentityCatalogueGovernanceService = {
    async authorize(request) { assert.equal(request.authData, authData); calls.push("profile"); },
  };
  assert.deepEqual(await bootstrap.administratorRequest(), { tenant: "default", authData });
  assert.deepEqual(calls, ["password", "verify", "profile", "remove-refresh"]);
  SERVICE.DefaultIdentityCatalogueGovernanceService.authorize = async () => { throw new Error("not an administrator"); };
  await assert.rejects(() => bootstrap.administratorRequest(), /not an administrator/);
  assert.equal(calls.at(-1), "remove-refresh");
});

test("fixture employee extension delegates initial scopes to Profile's private create-or-preserve owner", async (t) => {
  fixture(t, { withAxis: true, withRefresh: true });
  const original = { tenant: "default", authData: {}, models: [
    { code: "apiAdmin", apiKeyScopes: ["auth.internal.token.read"] },
    { code: "admin", userGroups: ["platformAdministratorUserGroup"] },
  ] };
  const before = structuredClone(original);
  const generated = { ...employee };
  SERVICE.DefaultMandatoryIdentityBootstrapService = {
    async ensureBootstrapAll(owner, schema, request) {
      assert.equal(owner, generated);
      assert.equal(schema, "employee");
      assert.equal(request.authData, original.authData);
      assert.deepEqual(request.models[0].apiKeyScopes, bootstrap.runtimePermissions());
      assert.deepEqual(request.models[1], original.models[1]);
      throw new Error("private release admission required");
    },
  };
  await assert.rejects(() => generated.ensureBootstrapAll(original), /private release admission/);
  assert.deepEqual(original, before);
});

test("operator fixture groups retain negative role scopes and existing mappings on replay", async (t) => {
  fixture(t, { withOllama: true, withRegistration: true });
  const rows = [], writes = [];
  SERVICE.DefaultIdentityCatalogueService = { ...catalogue,
    async requirePermissions(values) {
      return identity.catalogue(undefined, identity.records("Permission").map((row) => row.code)).requirePermissions(values);
    },
  };
  SERVICE.DefaultIdentityCatalogueGovernanceService = {
    async authorizeSeed() {},
    async read(owner, request) { return owner.get(request); },
    async createReference(owner, request) { return owner.save(request); },
  };
  SERVICE.DefaultUserGroupService = {
    async get(request) {
      const result = rows.filter((row) => row.code === request.query.code);
      return { code: "SUC_READ", count: result.length, result: structuredClone(result) };
    },
    async save(request) {
      assert.deepEqual(request.options, { insertOnly: true });
      assert.equal(request.query, undefined);
      await groups.validatePermissions([request.model]);
      writes.push(request.model.code);
      rows.push({ ...structuredClone(request.model), _id: request.model.code });
      return { code: "SUC_SAVE" };
    },
    ensureReferenceAll(request) { return catalogue.ensureReferenceAll(this, request); },
  };
  SERVICE.DefaultEmployeeService = { async get() { return { code: "SUC_READ", result: [{ code: "retained" }] }; } };
  const scoped = { ...bootstrap, async administratorRequest() { return { tenant: "default", authData: {} }; },
    async ensureRuntimeAssignments() {} };
  await scoped.reconcile();
  const role = (name) => rows.find((row) => row.code === "copilot_acceptance_" + name);
  assert(role("operator").permissions.includes("copilot.knowledge.migration.erase"));
  for (const permission of ["copilot.knowledge.migration.execute", "copilot.knowledge.migration.erase", "copilot.usage.read"])
    assert.equal(role("reader").permissions.includes(permission), false);
  assert.equal(role("noerase").permissions.includes("copilot.knowledge.migration.erase"), false);
  assert.equal(role("nosource").permissions.includes("copilot.knowledge.internal.read"), false);
  for (const row of rows) {
    assert.equal(row.permissions.some((code) => code.includes("*")), false);
    if (row.code !== "copilot_acceptance_operator")
      assert.equal(row.permissions.includes("backoffice.functionalModule.activate"), false);
  }
  role("operator").permissions = [];
  role("operator").active = false;
  const retained = structuredClone(rows), count = writes.length;
  await scoped.reconcile();
  assert.deepEqual(rows, retained);
  assert.equal(writes.length, count);
});
