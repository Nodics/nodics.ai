/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/**
 * @module profile/test/enterpriseTeamNativeAdministrator
 * @description Composes real Team, canonical identity, native registration and group owners with read-only storage doubles.
 * @layer test
 * @owner profile
 * No installed identity, permission, stamp or qualification changes are performed.
 */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const crypto = require("node:crypto");
const teamDefinition = require("../src/service/enterprise/defaultEnterpriseTeamAdministrationService");
const membershipDefinition = require("../src/service/enterprise/defaultEnterpriseMembershipService");
const registrationDefinition = require("../src/service/enterprise/defaultEnterpriseRegistrationService");
const authentication = require("../src/service/authentication/defaultAuthenticationProviderService");
const security = require("../../../../nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService");

/**
 * Creates a completed native registration without managed membership and no write collaborators.
 * @returns {Object} Owner and mutable read fixtures for independent refusal cases.
 */
function fixture() {
  const enterprise = {
    code: "business",
    active: true,
    tenant: { code: "staff" },
  };
  const person = {
    _id: "person-id",
    code: "employee",
    loginId: "admin@example.test",
    active: true,
    principalType: "human",
    authVersion: 1,
    password: "password-id",
    registrationAssignmentCode: "invitation",
    userGroups: ["adminGroup"],
    userGroupPermissions: ["*"],
    userGroupCodes: ["untrusted-stale-group"],
  };
  const item = {
    code: "invitation",
    revision: 2,
    roleCode: "ENTERPRISE_ADMIN",
    active: true,
    status: "REGISTERED",
    normalizedEmail: person.loginId,
    registeredLoginId: person.loginId,
    enterpriseCode: enterprise.code,
    tenantCode: "staff",
    groupCodes: ["adminGroup"],
    scopeType: "ENTERPRISE",
    scopeCode: enterprise.code,
    registration: {
      phase: "COMPLETE",
      employeeCode: person.code,
      passwordId: person.password,
      scopeCode: "registration-scope",
    },
  };
  const scope = {
    code: "registration-scope",
    active: true,
    status: "ACTIVE",
    effect: "ALLOW",
    principalType: "human",
    principalCode: person.loginId,
    tenantCode: "staff",
    enterpriseCode: enterprise.code,
    scopeType: "ENTERPRISE",
    scopeCode: enterprise.code,
    inheritanceMode: "DIRECT",
  };
  const group = {
    code: "adminGroup",
    active: true,
    permissions: ["profile.enterpriseAccess.assign"],
  };
  const state = { locked: false };
  const effective = {
    scopes: [{ scopeType: "ENTERPRISE", scopeCode: enterprise.code }],
    deniedScopes: [],
  };
  const calls = [];
  const management = {
    memberships: {
      enabled: true,
      inventoryQualified: true,
      sessionBindingQualified: true,
      assignmentClaimIndexQualified: true,
      pageSize: 50,
      maximumInventoryPages: 100,
    },
    accessAssignments: {
      roles: { ENTERPRISE_ADMIN: { groupCodes: ["adminGroup"] } },
    },
  };
  global.CONFIG = {
    get: (key) =>
      key === "enterpriseManagement"
        ? management
        : key === "defaultTenant"
          ? "authority"
          : undefined,
  };
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
  };
  global.ENUMS = {
    ProfileEmployeeApplicationStatus: {
      APPROVED: { key: "APPROVED" },
      REGISTERED: { key: "REGISTERED" },
    },
    ProfileRegistrationPhase: { COMPLETE: { key: "COMPLETE" } },
  };
  global.UTILS = {
    getUserGroupCodes: (groups) =>
      (groups || []).map((group) =>
        typeof group === "string" ? group : group.code,
      ),
    getUserGroupPermissions: (groups) =>
      (groups || []).flatMap((group) => group.permissions || []),
  };
  const read = async (owner, tenant, query) => {
    calls.push({ owner, tenant, query });
    const value =
      owner === "DefaultEmployeeService"
        ? person
        : owner === "DefaultEnterpriseAccessAssignmentService"
          ? item
          : scope;
    assert.equal(
      tenant,
      owner === "DefaultEnterpriseAccessAssignmentService"
        ? "authority"
        : "staff",
    );
    return Object.entries(query).every(
      ([key, valueInQuery]) => value[key] === valueInQuery,
    )
      ? structuredClone(value)
      : null;
  };
  const registration = { ...registrationDefinition, read };
  const membership = {
    ...membershipDefinition,
    read,
    authority: () => "authority",
    inventory: async (_owner, _tenant, query) =>
      query.status === "REGISTERED" ? [structuredClone(item)] : [],
  };
  global.SERVICE = {
    DefaultEnterpriseRegistrationService: registration,
    DefaultEnterpriseMembershipService: membership,
    DefaultEnterpriseManagementService: {
      rolePolicy: (code) => management.accessAssignments.roles[code],
      commandDigest: (value) =>
        crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex"),
    },
    DefaultUserStateService: { findUserState: async () => state },
    DefaultIdentityGovernanceService: {
      getSystemAuthData: () => ({ isSystem: true }),
    },
    DefaultUserGroupService: {
      get: async (request) => {
        assert.equal(request.tenant, "staff");
        assert.equal(request.options.skipItemCache, true);
        assert.deepEqual(request.query, { code: { $in: ["adminGroup"] } });
        return { code: "SUC_DBS_00000", result: [structuredClone(group)] };
      },
    },
    DefaultPrincipalScopeGovernanceService: {
      getEffectiveScopes: async (request) => {
        assert.equal(request.tenant, "staff");
        assert.deepEqual(request.authData, {
          principalType: "human",
          loginId: person.loginId,
          userGroups: ["adminGroup"],
        });
        return effective;
      },
    },
    DefaultAuthenticationProviderService: authentication,
    DefaultSecuredRequestPipelineService: security,
  };
  item.registration.assignmentDigest = registration.assignmentDigest(item);
  const owner = {
    ...teamDefinition,
    assignment: async () => ({
      item: structuredClone(item),
      enterprise: structuredClone(enterprise),
    }),
  };
  return {
    owner,
    membership,
    person,
    item,
    scope,
    group,
    state,
    effective,
    calls,
  };
}

test("native completed administrator is counted through real null-context and registration owners without adoption", async () => {
  const f = fixture();
  const before = structuredClone({ person: f.person, item: f.item });
  assert.deepEqual(
    (await f.owner.administrators("business")).map((item) => item.code),
    ["invitation"],
  );
  assert.deepEqual({ person: f.person, item: f.item }, before);
  assert(
    f.calls.some(
      (call) =>
        call.owner === "DefaultEmployeeService" &&
        call.query._id === "person-id",
    ),
  );
  assert(
    f.calls.some(
      (call) => call.owner === "DefaultPrincipalScopeAssignmentService",
    ),
  );
});

for (const [label, mutate] of [
  [
    "locked canonical identity",
    (f) => {
      f.state.locked = true;
    },
  ],
  [
    "disabled identity",
    (f) => {
      f.person.disabled = true;
    },
  ],
  [
    "customer identity",
    (f) => {
      f.person.principalType = "customer";
    },
  ],
  [
    "foreign registration binding",
    (f) => {
      f.person.registrationAssignmentCode = "other";
    },
  ],
  [
    "password checkpoint mismatch",
    (f) => {
      f.item.registration.passwordId = "other";
    },
  ],
  [
    "incomplete registration",
    (f) => {
      f.item.registration.phase = "PREPARED";
    },
  ],
  [
    "partial membership",
    (f) => {
      f.item.membership = { phase: "PREPARED" };
    },
  ],
  [
    "linked identity without membership",
    (f) => {
      f.person.authenticationIdentity = {
        tenantCode: "staff",
        recordKind: "EMPLOYEE",
        recordId: "person-id",
      };
    },
  ],
  [
    "revoked direct grant",
    (f) => {
      f.scope.active = false;
    },
  ],
  [
    "foreign direct grant",
    (f) => {
      f.scope.enterpriseCode = "other";
    },
  ],
  [
    "expired direct grant",
    (f) => {
      f.scope.effectiveTo = "2000-01-01T00:00:00Z";
    },
  ],
  [
    "inactive persisted group",
    (f) => {
      f.group.active = false;
    },
  ],
  [
    "missing effective grant",
    (f) => {
      f.effective.scopes = [];
    },
  ],
  [
    "global deny",
    (f) => {
      f.effective.deniedScopes = [{ scopeType: "GLOBAL", scopeCode: "*" }];
    },
  ],
  [
    "tenant deny",
    (f) => {
      f.effective.deniedScopes = [{ scopeType: "TENANT", scopeCode: "staff" }];
    },
  ],
  [
    "enterprise deny",
    (f) => {
      f.effective.deniedScopes = [
        { scopeType: "ENTERPRISE", scopeCode: "business" },
      ];
    },
  ],
  [
    "missing registration owner",
    () => {
      delete SERVICE.DefaultEnterpriseRegistrationService.assertSessionEligible;
    },
  ],
  [
    "missing scope owner",
    () => {
      delete SERVICE.DefaultPrincipalScopeGovernanceService;
    },
  ],
])
  test(`${label} rejects with a structured owner error instead of counting a native administrator`, async () => {
    const f = fixture();
    mutate(f);
    await assert.rejects(f.owner.administrators("business"), (error) =>
      /^ERR_PROFILE_/.test(error.code),
    );
  });

test("stale embedded permissions cannot replace current persisted group grants", async () => {
  const f = fixture();
  f.group.permissions = [];
  assert.deepEqual(await f.owner.administrators("business"), []);
});

test("the only native administrator remains protected from restriction", async () => {
  const f = fixture();
  await assert.rejects(
    f.owner.assertMayRestrict(f.item, { code: "business" }),
    { code: "ERR_PROFILE_TEAM_LAST_ADMIN" },
  );
});

test("unavailable native scope reads propagate without permission fallback", async () => {
  const f = fixture();
  SERVICE.DefaultPrincipalScopeGovernanceService.getEffectiveScopes =
    async () => {
      throw new Error("scope read unavailable");
    };
  await assert.rejects(
    f.owner.administrators("business"),
    /scope read unavailable/,
  );
});

test("managed context remains authoritative and native fallback cannot swallow failures or malformed results", async () => {
  const f = fixture();
  f.owner.nativeAdministratorPerson = () =>
    assert.fail("managed path must never use native authority");
  f.membership.sessionContext = async () => ({
    person: { userGroups: [{ code: "adminGroup", permissions: [] }] },
  });
  assert.deepEqual(await f.owner.administrators("business"), []);
  f.membership.sessionContext = async () => undefined;
  await assert.rejects(f.owner.administrators("business"), {
    code: "ERR_PROFILE_TEAM_UNAVAILABLE",
  });
  f.membership.sessionContext = async () => {
    throw new Error("owner read unavailable");
  };
  await assert.rejects(
    f.owner.administrators("business"),
    /owner read unavailable/,
  );
});
