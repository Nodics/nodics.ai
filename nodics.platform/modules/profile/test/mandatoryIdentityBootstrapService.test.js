/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module profile/test/mandatoryIdentityBootstrapService
 * @description Verifies governed Init ordering and persisted identity authority surviving restarts in every environment.
 * @layer test
 * @owner profile
 */
const assert = require("node:assert/strict");
const { test, beforeEach, afterEach } = require("node:test");
const service = require("../src/service/identity/defaultMandatoryIdentityBootstrapService");
const authentication = require("../src/service/authentication/defaultAuthenticationProviderService");
const inventory = require("../src/service/identity/defaultPrincipalSecurityStampGovernanceService");
const runtime = require("../src/service/identity/defaultRuntimeAuthorizationService");
const utils = require("../../../../nodics.foundation/modules/nCommon/src/utils/utils");
let previous;

beforeEach(() => {
  previous = Object.fromEntries(["CONFIG", "SERVICE", "NODICS", "CLASSES", "UTILS"].map(key => [key, global[key]]));
});
afterEach(() => {
  for (const [key, value] of Object.entries(previous)) {
    if (value === undefined) delete global[key];
    else global[key] = value;
  }
});

function fixture(environmentClass = "LOCAL") {
  const state = {
    groups: [{ code: "operator", active: true, parentGroups: ["auditor"], permissions: ["approved.read"] }],
    principal: { code: "apiAdmin", principalType: "service", apiKeyStatus: "revoked",
      apiKeyHash: "persisted-key-hash", apiKeyScopes: ["approved.read"], userGroups: ["operator"] },
    credential: { password: "changed-password-hash", active: false, revision: 7 },
    lockout: { locked: true, attempts: 5, active: false, lockedTime: "2026-10-13T01:00:00Z" },
    grants: [{ _id: "grant-id", code: "retained-grant", active: true, status: "ACTIVE", effect: "ALLOW",
      principalType: "service", principalCode: "apiAdmin", inheritanceMode: "DIRECT",
      scopeType: "RUNTIME_DEPLOYMENT", scopeCode: "retained-grant",
      tenantCode: "default", enterpriseCode: "default",
      runtimeScope: { projectCode: "partner.app", environmentCode: "reviewA", serverCode: "workerServer",
        instanceCode: "worker-1", modules: ["profile", "workflow"], permissions: ["approved.read", "revoked.write"] } }],
  };
  const writes = [], reads = [];
  const rejectWrite = () => { writes.push(true); throw new Error("Startup must not write identity state"); };
  global.CONFIG = { get: key => ({
    defaultTenant: "default", environment: { class: environmentClass },
    defaultAuthDetail: { apiKey: "fictional-new-proof-with-more-than-thirty-two-characters" },
    bootstrapIdentity: { adminPassword: "different-configured-password" },
    identityGovernance: { migration: {
      runtimeDeploymentBootstrapEnabled: true, reconcileMissingGroupsOnStartup: true,
      groupTargets: { operator: { parentGroups: ["adminGroup"], permissions: ["*"] }, deletedGroup: {} },
      servicePrincipalCodes: ["apiAdmin"], serviceGroup: "administrator",
      servicePrincipalScopes: { apiAdmin: ["*"] }, runtimeDeploymentGrantPermissions: ["*"],
      administratorCodes: ["admin"],
    } },
  })[key] };
  global.CLASSES = { NodicsError: class extends Error {
    constructor(code, message) { super(message || code); this.code = code; }
  } };
  global.UTILS = { ...utils, isObject: item => item !== null && typeof item === "object" };
  global.SERVICE = {
    DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ isSystem: true }) },
    DefaultPrincipalSecurityStampGovernanceService: inventory,
    DefaultRuntimeAuthorizationService: runtime,
    DefaultPrincipalScopeAssignmentService: {
      get: async request => {
        reads.push(request);
        return { code: "SUC_READ", count: state.grants.length, result: structuredClone(state.grants) };
      }, save: rejectWrite, update: rejectWrite, remove: rejectWrite,
    },
    DefaultUserGroupService: { save: rejectWrite, update: rejectWrite },
    DefaultEmployeeService: { save: rejectWrite, update: rejectWrite },
    DefaultPasswordService: { save: rejectWrite, update: rejectWrite },
    DefaultUserStateService: { save: rejectWrite, update: rejectWrite },
    DefaultIdentityMigrationAuditService: { save: rejectWrite },
  };
  return { state, writes, reads };
}

for (const environmentClass of ["LOCAL", "QA", "PRODUCTION"]) {
  test(environmentClass + " restart preserves actual scope/group revocation, rotated credentials and lockouts", async () => {
    const f = fixture(environmentClass);
    await service.reconcile({ tenant: "default" });
    // Model a governed Axis removal between two restarts, not just an unchanged seed.
    f.state.grants[0].runtimeScope.modules = ["profile"];
    f.state.grants[0].runtimeScope.permissions = ["approved.read"];
    f.state.principal.apiKeyScopes = [];
    f.state.principal.userGroups = [];
    f.state.groups[0].parentGroups = [];
    f.state.groups[0].permissions = [];
    const retained = structuredClone(f.state);
    const result = await service.reconcile({ tenant: "default" });
    assert.equal(result.status, "NO_CHANGES");
    assert.deepEqual(f.state, retained);
    assert.equal(f.writes.length, 0);
    assert.equal(f.reads.length, 2);
    for (const read of f.reads) {
      assert.equal(read.tenant, "default");
      assert.equal(read.options.skipItemCache, true);
      assert.equal(read.options.recursive, false);
      assert.deepEqual(read.query, { scopeType: "RUNTIME_DEPLOYMENT" });
    }
  });

  test(environmentClass + " deleted and revoked grants are never regenerated from deployment configuration", async () => {
    const f = fixture(environmentClass);
    f.state.grants[0].status = "REVOKED";
    f.state.grants[0].active = false;
    const retained = structuredClone(f.state);
    await service.reconcile({ tenant: "default" });
    assert.deepEqual(f.state, retained);
    f.state.grants = [];
    await service.reconcile({ tenant: "default" });
    assert.deepEqual(f.state.grants, []);
    assert.equal(f.writes.length, 0);
  });
}

test("malformed active grants and failed/partial inventory reject without repairs", async () => {
  const f = fixture();
  f.state.grants[0].runtimeScope.modules = "profile";
  await assert.rejects(service.reconcile({ tenant: "default" }), { code: "ERR_AUTH_00003" });
  f.state.grants[0].runtimeScope.modules = ["profile"];
  f.state.grants[0].tenantCode = "foreign";
  await assert.rejects(service.reconcile({ tenant: "default" }), { code: "ERR_AUTH_00003" });
  for (const response of [
    { code: "ERR_READ", count: 0, result: [] },
    { code: "SUC_READ", count: 2, result: [] },
    { code: "SUC_READ", result: [] },
  ]) {
    SERVICE.DefaultPrincipalScopeAssignmentService.get = async () => response;
    await assert.rejects(service.reconcile({ tenant: "default" }), { code: "ERR_AUTH_00003" });
  }
  assert.equal(f.writes.length, 0);
});

test("session groups use persisted ancestry, skip inactive parents and survive parent revocation", () => {
  fixture();
  const parent = { code: "persistedParent", active: true, parentGroups: [] };
  const group = { code: "operator", active: true, parentGroups: [parent,
    { code: "inactiveParent", active: false, parentGroups: ["adminGroup"] }] };
  const person = { userGroups: [group], userGroupCodes: ["staleCode", "adminGroup"] };
  assert.deepEqual(authentication.resolveSessionUserGroups(person), ["operator", "persistedParent"]);
  group.parentGroups = [];
  assert.deepEqual(authentication.resolveSessionUserGroups(person), ["operator"]);
  group.active = false;
  assert.deepEqual(authentication.resolveSessionUserGroups(person), []);
  assert.deepEqual(authentication.resolveSessionUserGroups({ userGroupCodes: ["operator"] }), ["operator"]);
  assert.deepEqual(authentication.resolveSessionUserGroups({ userGroups: [] }), []);
});

test("tenant bootstrap awaits governed Init and never reconciles after a failed import", async () => {
  fixture();
  const calls = [];
  let finish;
  SERVICE.DefaultDataReleaseService = {
    installStartupReleases: request => {
      assert.equal(request.tenant, "other-tenant");
      assert.deepEqual(request.modules, ["profile"]);
      assert.equal(request.authData.isSystem, true);
      return new Promise(resolve => { finish = resolve; });
    },
  };
  const instance = { ...service, reconcile: async () => { calls.push("validate"); return { status: "NO_CHANGES" }; } };
  const pending = instance.prepareTenant({ tenant: "other-tenant", modules: ["profile"] });
  await Promise.resolve();
  assert.deepEqual(calls, []);
  finish();
  await pending;
  assert.deepEqual(calls, ["validate"]);
  SERVICE.DefaultDataReleaseService.installStartupReleases = async () => { throw new Error("Init is RUNNING"); };
  await assert.rejects(instance.prepareTenant({ tenant: "other-tenant" }), /Init is RUNNING/);
  assert.deepEqual(calls, ["validate"]);
});
