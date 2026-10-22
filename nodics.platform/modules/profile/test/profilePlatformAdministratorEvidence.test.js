/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module profile/test/profilePlatformAdministratorEvidence @description Real HTTP facade/service and identity-owner contracts using isolated generated storage and credential/stamp ports. @layer test @owner profile */
const test = require("node:test"), assert = require("node:assert/strict"), crypto = require("node:crypto");
const evidence = require("../src/service/identity/defaultProfilePlatformAdministratorEvidenceService");
const facade = require("../src/facade/identity/defaultProfilePlatformAdministratorEvidenceFacade");
const controller = require("../src/controller/identity/defaultProfilePlatformAdministratorEvidenceController");
const membership = require("../src/service/enterprise/defaultEnterpriseMembershipService");
const registration = require("../src/service/enterprise/defaultEnterpriseRegistrationService");
const principal = require("../src/service/identity/defaultPrincipalGovernanceService");
const catalogue = require("../src/service/identity/defaultIdentityCatalogueService");
const catalogueGovernance = require("../src/service/identity/defaultIdentityCatalogueGovernanceService");
const groups = require("../src/service/group/defaultUserGroupGovernanceService");
const inventory = require("../src/service/identity/defaultPrincipalSecurityStampGovernanceService");
const router = require("../../../../nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService");
const routes = require("../src/router/routers").profile;
const groupCode = "platformAdministratorUserGroup", permission = "loyalty.wallet.testCredit";
const copy = value => structuredClone(value);

function fixture(t) {
  const keys = ["CONFIG", "SERVICE", "FACADE", "CLASSES", "NODICS", "UTILS"];
  const previous = keys.map(key => [key, Object.getOwnPropertyDescriptor(global, key)]);
  t.after(() => previous.forEach(([key, descriptor]) => descriptor
    ? Object.defineProperty(global, key, descriptor) : delete global[key]));
  const defaults = require("../config/properties");
  const authDefaults = require("../../../../nodics.foundation/modules/nAuth/config/properties");
  const config = { ...defaults, defaultTenant: "authority", defaultEnterprise: "PLATFORM",
    profilePlatformAdministratorEvidence: copy(defaults.profilePlatformAdministratorEvidence),
    identityGovernance: { ...copy(authDefaults.identityGovernance), ...copy(defaults.identityGovernance) } };
  const rows = {
    Employee: [{ _id: "admin-id", code: "admin", loginId: "admin", active: true, principalType: "human",
      userGroups: [groupCode], authVersion: 7, password: "private-password-reference" }],
    Tenant: [{ _id: "tenant-id", code: "authority", active: true }],
    Enterprise: [{ _id: "enterprise-id", code: "PLATFORM", tenant: "authority", active: true }],
    UserGroup: [{ _id: "group-id", code: groupCode, active: true, parentGroups: ["adminGroup"], permissions: ["*"] },
      { _id: "parent-id", code: "adminGroup", active: true, parentGroups: [], permissions: [] }],
    Permission: [{ _id: "wildcard-id", code: "*", ownerModule: "profile", active: true },
      { _id: "command-id", code: permission, ownerModule: "loyaltyWallet", active: true }],
  };
  const state = { reads: [], stampChecks: 0, locked: false, headers: {}, sensitive: 0 };
  global.CONFIG = { get: key => key.split(".").reduce((value, part) => value?.[part], config) };
  global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
  global.UTILS = { isObject: value => value !== null && typeof value === "object" };
  global.NODICS = { getModels: () => ({ EmployeeModel: { dataBase: {} } }), getSelectedEnvironmentName: () => "isolated-test" };
  global.FACADE = { DefaultProfilePlatformAdministratorEvidenceFacade: facade };
  global.SERVICE = {
    DefaultProfilePlatformAdministratorEvidenceService: evidence,
    DefaultEnterpriseMembershipService: membership, DefaultEnterpriseRegistrationService: registration,
    DefaultPrincipalGovernanceService: principal, DefaultIdentityCatalogueService: catalogue,
    DefaultIdentityCatalogueGovernanceService: catalogueGovernance, DefaultUserGroupGovernanceService: groups,
    DefaultPrincipalSecurityStampGovernanceService: inventory, DefaultSecuredRequestPipelineService: router,
    DefaultProfileService: { getProfileModuleName: () => "profile" },
    DefaultDatabaseConfigurationService: { toObjectId: (_model, id) => id },
    DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ isSystem: true }) },
    DefaultLoggerService: { assertSensitiveRequest: () => { state.sensitive++; } },
    DefaultUserStateService: { findUserState: async () => ({ locked: state.locked }) },
    DefaultPrincipalSecurityStampService: { validate: async auth => {
      state.stampChecks++;
      state.onStamp?.(state.stampChecks);
      assert.equal(auth.principalType, "human", "actor validation must not be replaced by service authentication");
      if (state.revoked || rows.Employee[0]?.authVersion !== auth.authVersion) throw Error("private stamp diagnostic");
    } },
  };
  for (const name of Object.keys(rows)) SERVICE["Default" + name + "Service"] = {
    get: async r => {
      assert.equal(r.tenant, "authority");
      assert.equal(r.options.skipItemCache, true);
      assert.equal(r.options.recursive, false);
      assert.equal(r.authData.isSystem, true, "only existing Profile private generated read authority is used");
      if (name === "Permission") await catalogueGovernance.authorize(r);
      const result = rows[name].filter(row => Object.entries(r.query).every(([key, value]) =>
        value && Array.isArray(value.$in) ? value.$in.includes(row[key]) : row[key] === value));
      const start = (r.searchOptions.pageNumber - 1) * r.searchOptions.pageSize;
      const response = { code: "SUC_READ", count: result.length, result: copy(result.slice(start, start + r.searchOptions.pageSize)) };
      state.reads.push({ name, query: copy(r.query) });
      state.onRead?.(name, response);
      return response;
    },
    save: () => assert.fail("evidence endpoint cannot write"), update: () => assert.fail("evidence endpoint cannot update"),
  };
  const request = { tenant: "authority", authData: { tenant: "authority", entCode: "PLATFORM", principalType: "human",
    loginId: "admin", tokenType: "access", authenticationMethod: "PASSWORD", authVersion: 7,
    userGroups: [groupCode], permissions: ["*"] },
    httpRequest: { body: { permission, nonce: crypto.randomUUID() }, headers: { authorization: "Bearer original", "x-enterprise-code": "PLATFORM" } },
    httpResponse: { setHeader: (name, value) => { state.headers[name] = value; } } };
  return { config, rows, state, request, run: () => controller.evidence(request), service: () => evidence.evidence(request) };
}

test("secured route reaches real controller/facade/service and all fresh identity/catalogue owners without writes", async t => {
  const f = fixture(t), original = copy({ auth: f.request.authData, http: f.request.httpRequest }), before = copy(f.rows);
  const route = routes.platformAdministratorEvidence.evidence;
  assert.equal(route.key, "/identity/platform-administrator/evidence");
  assert.equal(route.method, "POST");
  assert.equal(route.secured, true);
  assert.deepEqual(route.authTokenTypes, ["access"]);
  assert.deepEqual(route.accessGroups, [groupCode]);
  assert.equal(route.permission, permission);
  assert.equal(route.controller, "DefaultProfilePlatformAdministratorEvidenceController");
  assert.equal(route.operation, "evidence");
  assert.equal(route.requestPrivacy.sensitive, true);
  assert.equal(route.cache.enabled, false);
  assert.equal(routes.participantDirectory.resolve.key, "/participants/resolve");
  const response = await f.run();
  assert.equal(response.code, "SUC_PRFL_00000");
  assert.deepEqual(response.data, { contractVersion: 1, nonce: f.request.httpRequest.body.nonce,
    tenant: "authority", enterpriseCode: "PLATFORM", actorCode: "admin", principalType: "human",
    platformAdministrator: true, permission, authVersion: 7 });
  assert.equal(f.state.headers["Cache-Control"], "no-store");
  assert.equal(f.state.stampChecks, 2);
  assert.equal(f.state.sensitive, 1);
  assert.deepEqual(f.rows, before);
  assert.deepEqual({ auth: f.request.authData, http: f.request.httpRequest }, original);
  for (const name of ["Employee", "Tenant", "Enterprise", "UserGroup", "Permission"])
    assert.ok(f.state.reads.some(read => read.name === name), name + " must be read freshly");
});

test("callback transport returns one envelope or one redacted owner error", async t => {
  const f = fixture(t); let calls = 0;
  await controller.evidence(f.request, (error, result) => { calls++; assert.equal(error, null); assert.equal(result.data.platformAdministrator, true); });
  f.state.revoked = true;
  await controller.evidence(f.request, error => { calls++; assert.equal(error.code, "ERR_AUTH_00003"); assert.equal(error.message, "ERR_AUTH_00003"); });
  assert.equal(calls, 2);
});

test("Wallet original-token proof transport interoperates with the actual Profile endpoint", async t => {
  const f = fixture(t);
  const wallet = require("../../../../nodics.loyalty/modules/loyaltyWallet/src/service/defaultLoyaltyEnterpriseTestCreditService");
  SERVICE.DefaultLoyaltyParticipantService = require("../../../../nodics.loyalty/modules/loyaltyWallet/src/service/defaultLoyaltyParticipantService");
  f.config.loyalty = copy(require("../../../../nodics.loyalty/modules/loyaltyWallet/config/properties").loyalty);
  f.config.loyalty.enterpriseTestCredits = { ...f.config.loyalty.enterpriseTestCredits, enabled: true, allowedEnvironments: ["isolated-test"] };
  f.config.runtimeRole = { code: "LOYALTY" };
  const source = { tenant: "authority", authData: copy(f.request.authData), authorization: "Bearer original",
    payload: { walletCode: "wallet", programCode: "program", rewardTypeCode: "point", amount: "10.00", reason: "Test allocation", idempotencyKey: "key", confirmed: true } };
  SERVICE.DefaultModuleService = { invokeModule: async call => {
    assert.equal(call.apiName, routes.platformAdministratorEvidence.evidence.key);
    assert.equal(call.header.Authorization, source.authorization);
    assert.equal(call.header["X-Enterprise-Code"], source.authData.entCode);
    assert.equal(call.tenant, source.tenant);
    assert.equal(call.methodName, "POST");
    f.request.httpRequest.body = call.requestBody;
    return controller.evidence(f.request);
  } };
  const before = copy(source);
  assert.deepEqual(await wallet.platformAdministrator(wallet.context(source)), {
    actorCode: "admin", authVersion: 7, authorityTenant: "authority", authorityEnterpriseCode: "PLATFORM" });
  assert.deepEqual(source, before);
  f.rows.UserGroup[0].active = false;
  await assert.rejects(wallet.platformAdministrator(wallet.context(source)), { code: "ERR_AUTH_00003" });
});

test("framework defaults are complete; missing, disabled or malformed policy never recreates fallback authority", async t => {
  const f = fixture(t), original = copy(f.config.profilePlatformAdministratorEvidence);
  for (const value of [undefined, { ...original, enabled: false }, { ...original, allowedPermissions: ["*"] },
    { ...original, maximumGroups: 0 }, { ...original, allowedPermissions: [permission, permission] }]) {
    f.config.profilePlatformAdministratorEvidence = value;
    await assert.rejects(f.run(), { code: "ERR_AUTH_00003" });
  }
  assert.equal(f.state.reads.length, 0);
});

test("unknown permissions, malformed nonces, arbitrary selectors and contradictory body sources refuse before reads", async t => {
  const f = fixture(t), original = copy(f.request.httpRequest.body);
  for (const body of [{ ...original, permission: "loyalty.wallet.read" }, { ...original, nonce: "cached" },
    { ...original, nonce: "1".repeat(500) }, { ...original, tenant: "authority" }, { ...original, platformAdministrator: true }]) {
    f.request.httpRequest.body = body;
    await assert.rejects(f.run(), { code: "ERR_AUTH_00003" });
  }
  f.request.httpRequest.body = original;
  f.request.payload = { ...original, nonce: crypto.randomUUID() };
  await assert.rejects(f.run(), { code: "ERR_AUTH_00003" });
  assert.equal(f.state.reads.length, 0);
});

test("native human access and exact authority scope cannot be replaced by group names, enterprise admin or system flags", async t => {
  const f = fixture(t), original = copy(f.request.authData);
  for (const patch of [{ principalType: "service" }, { principalType: "customer" }, { isSystem: true },
    { tokenType: "service" }, { tokenType: "refresh" }, { authenticationMethod: "LINKED" }, { sessionContext: {} },
    { runtimeScope: {} }, { externalIdentityLinkCode: "link" }, { tenant: "business" }, { entCode: "BUSINESS" },
    { enterpriseCode: "BUSINESS" }, { userGroups: ["adminGroup"] }, { permissions: [permission] }, { authVersion: 0 }]) {
    f.request.authData = { ...original, ...patch };
    await assert.rejects(f.run(), { code: "ERR_AUTH_00003" });
  }
  assert.equal(f.state.reads.length, 0);
});

test("request partition and Enterprise headers cannot select a different authority", async t => {
  const f = fixture(t);
  f.request.tenant = "business";
  await assert.rejects(f.run(), { code: "ERR_AUTH_00003" });
  f.request.tenant = "authority";
  f.request.httpRequest.headers["x-enterprise-code"] = "BUSINESS";
  await assert.rejects(f.run(), { code: "ERR_AUTH_00003" });
  assert.equal(f.state.reads.length, 0);
});

test("fresh persisted principal, native placement, lockout and current authVersion are mandatory", async t => {
  const f = fixture(t), original = copy(f.rows.Employee[0]);
  for (const patch of [{ active: false }, { disabled: true }, { registrationSuspended: true }, { authVersion: 8 },
    { principalType: "service" }, { authenticationIdentity: {} }, { identityLinkRetirement: true },
    { registrationAssignmentCode: "invited" }, { enterpriseCode: "BUSINESS" }, { apiKeyHash: "credential" },
    { userGroups: ["adminGroup"] }]) {
    f.rows.Employee[0] = { ...original, ...patch };
    await assert.rejects(f.run(), { code: "ERR_AUTH_00003" });
  }
  f.rows.Employee[0] = original; f.state.locked = true;
  await assert.rejects(f.run(), { code: "ERR_AUTH_00003" });
});

test("missing or ambiguous principal and inactive or foreign authority entities refuse", async t => {
  const f = fixture(t), person = copy(f.rows.Employee[0]);
  f.rows.Employee.length = 0;
  await assert.rejects(f.run(), { code: "ERR_AUTH_00003" });
  f.rows.Employee.push(person, { ...person, _id: "duplicate" });
  await assert.rejects(f.run(), { code: "ERR_AUTH_00003" });
  f.rows.Employee.pop();
  f.rows.Tenant[0].active = false;
  await assert.rejects(f.run(), { code: "ERR_AUTH_00003" });
  f.rows.Tenant[0].active = true; f.rows.Enterprise[0].tenant = "business";
  await assert.rejects(f.run(), { code: "ERR_AUTH_00003" });
});

test("persisted reserved grant and active requested/wildcard vocabulary are checked independently of token claims", async t => {
  const f = fixture(t), originalGroups = copy(f.rows.UserGroup), originalPermissions = copy(f.rows.Permission);
  for (const change of [
    () => { f.rows.UserGroup[0].active = false; },
    () => { f.rows.UserGroup[0].permissions = [permission]; },
    () => { f.rows.Permission[0].active = false; },
    () => { f.rows.Permission[0].ownerModule = "other"; },
    () => { f.rows.Permission[1].active = false; },
    () => { f.rows.UserGroup[1].permissions = ["*"]; },
  ]) {
    f.rows.UserGroup = copy(originalGroups); f.rows.Permission = copy(originalPermissions); change();
    await assert.rejects(f.run(), { code: "ERR_AUTH_00003" });
  }
});

test("fresh ancestor reads reject service ancestry, missing/inactive parents, inherited platform authority and cycles", async t => {
  const f = fixture(t), original = copy(f.rows.UserGroup);
  for (const change of [
    () => { f.rows.UserGroup[1].active = false; },
    () => { f.rows.UserGroup[1].parentGroups = ["missing"]; },
    () => { f.rows.UserGroup[1].parentGroups = [groupCode]; },
    () => { f.rows.UserGroup[1].parentGroups = ["adminGroup"]; },
    () => { f.rows.UserGroup[1].parentGroups = ["serviceAccountUserGroup"]; f.rows.UserGroup.push({ _id: "service", code: "serviceAccountUserGroup", active: true, permissions: [] }); },
  ]) {
    f.rows.UserGroup = copy(original); change();
    await assert.rejects(f.run(), { code: "ERR_AUTH_00003" });
  }
});

test("bounded group resolution and failed/truncated/duplicate inventories cannot produce proof", async t => {
  const f = fixture(t);
  f.config.profilePlatformAdministratorEvidence.maximumGroups = 1;
  await assert.rejects(f.run(), { code: "ERR_AUTH_00003" });
  f.config.profilePlatformAdministratorEvidence.maximumGroups = 100;
  for (const change of [r => { r.code = "ERR_READ"; }, r => { r.count++; }, r => { r.result.push(copy(r.result[0])); r.count++; }]) {
    f.state.onRead = (name, r) => { if (name === "UserGroup") change(r); };
    await assert.rejects(f.run(), { code: "ERR_AUTH_00003" });
  }
});

test("post-read revocation and original request or policy mutation fail closed with no partial proof", async t => {
  const f = fixture(t);
  f.state.onStamp = count => { if (count === 2) f.state.revoked = true; };
  await assert.rejects(f.run(), { code: "ERR_AUTH_00003" });
  f.state.revoked = false; f.state.onStamp = undefined;
  f.state.onRead = name => { if (name === "UserGroup") f.request.httpRequest.headers.authorization = "Bearer substituted"; };
  await assert.rejects(f.run(), { code: "ERR_AUTH_00003" });
  f.state.onRead = name => { if (name === "UserGroup") f.config.profilePlatformAdministratorEvidence.enabled = false; };
  await assert.rejects(f.run(), { code: "ERR_AUTH_00003" });
});

test("later owner customization may narrow the command without replacing existing authority and transport", async t => {
  const f = fixture(t);
  SERVICE.DefaultProfilePlatformAdministratorEvidenceService = { ...evidence, groups: async function () { this.fail(); } };
  await assert.rejects(f.run(), { code: "ERR_AUTH_00003" });
  SERVICE.DefaultProfilePlatformAdministratorEvidenceService = evidence;
  assert.equal((await f.run()).data.platformAdministrator, true);
});
