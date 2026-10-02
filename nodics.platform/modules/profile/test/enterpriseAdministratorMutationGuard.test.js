/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/**
 * @module profile/test/enterpriseAdministratorMutationGuard
 * @description Deferred generic administrator mutation and held historical credential-retirement fixtures.
 * @layer test
 * @owner profile
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const original = require("../src/service/enterprise/defaultEnterpriseTeamAdministrationService");

function fixture() {
  const p = {
    enabled: true,
    installedCoverageQualified: true,
    maximumRecords: 100,
    superAdministratorRoleCodes: ["ENTERPRISE_ADMIN"],
    nativeSuperAdministratorGroupCodes: ["adminGroup"],
  };
  const management = {
    teamAdministration: {
      genericMutationGuard: p,
      historicalLinkRetirementQualified: true,
    },
    accessAssignments: {
      roles: { ENTERPRISE_ADMIN: { groupCodes: ["adminGroup"] } },
    },
  };
  const person = {
    _id: "person-a",
    code: "person-a",
    loginId: "person@example.test",
    principalType: "human",
    active: true,
    userGroups: ["viewer"],
  };
  const enterprise = {
    code: "enterprise-a",
    tenant: "tenant-a",
    active: true,
    adminEmail: "default@example.test",
  };
  const identity = {
    tenantCode: "tenant-a",
    recordKind: "EMPLOYEE",
    recordId: "person-a",
  };
  const fingerprint = "a".repeat(64);
  const audit = {
    code: "canonical-link-" + "b".repeat(40),
    preview: { fingerprint },
    status: "LINK_APPLYING",
    snapshot: { canonicalHistoricalLink: { historical: { identity } } },
  };
  const calls = [],
    admitted = new WeakSet();
  global.CONFIG = {
    get: (key) => (key === "enterpriseManagement" ? management : undefined),
  };
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
  };
  global.SERVICE = {
    DefaultIdentityGovernanceService: {
      getSystemAuthData: () => ({ system: true }),
    },
  };
  const reader = (name, rows) => ({
    get: async (request) => {
      calls.push({ name, request });
      assert.equal(request.options.skipItemCache, true);
      assert.equal(request.options.recursive, false);
      return {
        code: "SUC_DBS_00000",
        result: structuredClone(
          typeof rows === "function" ? rows(request) : rows,
        ),
      };
    },
  });
  SERVICE.DefaultEmployeeService = reader("employee", () => [person]);
  SERVICE.DefaultEnterpriseService = reader("enterprise", () => [enterprise]);
  SERVICE.DefaultEnterpriseAccessAssignmentService = reader("assignment", []);
  SERVICE.DefaultUserGroupService = reader("group", (request) => [
    { code: request.query.code || "ordinary", active: true, parentGroups: [] },
  ]);
  SERVICE.DefaultPrincipalScopeAssignmentService = reader("scope", [
    { code: "scope-a", principalType: "service" },
  ]);
  SERVICE.DefaultCanonicalHistoricalIdentityLinkService = {
    operator: async () => ({}),
    audit: async () => structuredClone(audit),
    ownsWrite: (request) => admitted.has(request),
  };
  const digest = (value) =>
    crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
  const m = {
    identity: (value) => value,
    authority: () => "authority",
    digest,
    rows: (response) => {
      assert.match(response.code, /^SUC_/);
      assert.ok(Array.isArray(response.result));
      return response.result;
    },
    read: async (name) =>
      name === "DefaultEmployeeService"
        ? structuredClone(person)
        : structuredClone(enterprise),
  };
  const owner = {
    ...original,
    memberships: () => m,
    policy: () => {},
    begin: async (request, operation, input) => {
      enterprise.teamRevision = 1;
      enterprise.teamOperation = {
        id: input.operationId,
        phase: "PENDING",
        operation,
      };
      return structuredClone(enterprise);
    },
    finish: async (lease, result) => {
      enterprise.teamOperation.phase = "COMPLETE";
      return result;
    },
  };
  const request = {
    tenant: "tenant-a",
    query: { code: person.code },
    model: { $set: { active: false } },
  };
  return {
    owner,
    p,
    person,
    enterprise,
    identity,
    audit,
    fingerprint,
    calls,
    admitted,
    request,
    management,
    m,
  };
}

test("assignment permission alone is not a full superadministrator; native completed registration is counted", async () => {
  const f = fixture();
  const admin = {
    code: "admin-assignment",
    roleCode: "ENTERPRISE_ADMIN",
    enterpriseCode: f.enterprise.code,
    tenantCode: "tenant-a",
    registeredLoginId: f.person.loginId,
    registration: { phase: "COMPLETE", employeeCode: f.person.code },
  };
  const operator = {
    code: "operator-assignment",
    roleCode: "OPERATOR",
    enterpriseCode: f.enterprise.code,
  };
  f.person.userGroups = ["adminGroup"];
  f.m.inventory = async () => [operator, admin];
  f.m.assignment = async (code) => ({
    item: code === admin.code ? admin : operator,
    enterprise: f.enterprise,
  });
  f.m.sessionContext = async () => ({
    person: { userGroups: [{ code: "adminGroup" }] },
  });
  SERVICE.DefaultAuthenticationProviderService = {
    resolveSessionUserGroups: () => ["adminGroup"],
  };
  global.UTILS = {
    getUserGroupPermissions: () => ["profile.enterpriseAccess.assign"],
  };
  SERVICE.DefaultSecuredRequestPipelineService = {
    isPermissionGranted: () => true,
    getGrantedPermissions: () => ["profile.enterpriseAccess.assign"],
    getRouteActionAuthorizationConfig: () => ({}),
  };
  assert.deepEqual(
    (await f.owner.administrators(f.enterprise.code)).map((row) => row.code),
    [admin.code],
  );
});

test("later layers select explicit full group identity without using permission strings", async () => {
  const f = fixture();
  f.p.nativeSuperAdministratorGroupCodes = ["customFullAdmin"];
  f.person.userGroups = ["customFullAdmin"];
  await assert.rejects(
    f.owner.assertHistoricalLinkRetirement({}, { identity: f.identity }),
    { code: "ERR_PROFILE_TEAM_LAST_ADMIN" },
  );
});

for (const operation of ["Save", "Update", "Remove"]) {
  test(
    "native active human administrator cannot be removed or replaced by generic Employee " +
      operation,
    async () => {
      const f = fixture();
      f.person.userGroups = ["adminGroup"];
      await assert.rejects(
        f.owner["protectAdministratorEmployee" + operation](f.request),
        { code: "ERR_PROFILE_TEAM_LAST_ADMIN" },
      );
      assert.equal(f.person.active, true);
    },
  );
  test(
    "full administrator group cannot lose authority through generic " +
      operation,
    async () => {
      const f = fixture();
      SERVICE.DefaultUserGroupService.get = async (request) => ({
        code: "SUC_DBS_00000",
        result: [
          {
            code: request.query.code || "adminGroup",
            active: true,
            parentGroups: [],
          },
        ],
      });
      await assert.rejects(
        f.owner["protectAdministratorGroup" + operation]({
          tenant: "tenant-a",
          query: { code: "adminGroup" },
          model: { code: "adminGroup", permissions: [] },
        }),
      );
    },
  );
}

test("unrelated display/stamp changes preserve generic behavior without inventory", async () => {
  const f = fixture();
  for (const [method, model] of [
    [
      "protectAdministratorEmployeeUpdate",
      { $set: { name: { firstName: "Updated" }, authVersion: 2 } },
    ],
    ["protectAdministratorGroupUpdate", { $set: { name: "Display" } }],
    ["protectAdministratorScopeUpdate", { $set: { reasonCode: "Reviewed" } }],
  ])
    assert.equal(await f.owner[method]({ ...f.request, model }), true);
  assert.equal(f.calls.length, 0);
});

test("disabled generic hooks are inert before path parsing or owner lookup", async () => {
  const f = fixture();
  f.p.enabled = false;
  f.p.installedCoverageQualified = false;
  for (const method of [
    "protectAdministratorEmployeeUpdate",
    "protectAdministratorGroupUpdate",
    "protectAdministratorScopeUpdate",
  ])
    assert.equal(
      await f.owner[method]({ model: { $replaceWith: "not-this-guard" } }),
      true,
    );
  assert.equal(f.calls.length, 0);
});

test("unrelated service scopes retain an atomic typed exclusion fence", async () => {
  const f = fixture();
  const request = { ...f.request, model: { $set: { status: "INACTIVE" } } };
  assert.equal(await f.owner.protectAdministratorScopeUpdate(request), true);
  assert.deepEqual(request.query.$and[1].principalType, {
    $in: ["service", "customer"],
  });
});

test("display-only payload cannot conceal overwrite or upsert authority loss", async () => {
  const f = fixture();
  for (const method of [
    "protectAdministratorEmployeeUpdate",
    "protectAdministratorGroupUpdate",
    "protectAdministratorScopeUpdate",
  ]) {
    await assert.rejects(
      f.owner[method]({
        ...f.request,
        model: { $set: { name: "Display" } },
        options: { overwrite: true },
      }),
    );
    await assert.rejects(
      f.owner[method]({
        ...f.request,
        model: { $set: { name: "Display" } },
        options: { upsert: true },
      }),
    );
  }
});

test("new human DENY scope and existing group restriction cannot bypass the team owner", async () => {
  const f = fixture();
  SERVICE.DefaultPrincipalScopeAssignmentService.get = async () => ({
    code: "SUC_DBS_00000",
    result: [],
  });
  await assert.rejects(
    f.owner.protectAdministratorScopeSave({
      tenant: "tenant-a",
      model: { code: "deny-a", principalType: "human", effect: "DENY" },
    }),
  );
  SERVICE.DefaultPrincipalScopeAssignmentService.get = async () => ({
    code: "SUC_DBS_00000",
    result: [
      { code: "scope-a", principalType: "group", groupCode: "adminGroup" },
    ],
  });
  await assert.rejects(f.owner.protectAdministratorScopeRemove(f.request));
});

test("valid provisioning-shaped human ALLOW scope remains blocked until exact held-owner admission is integrated", async () => {
  const f = fixture();
  SERVICE.DefaultPrincipalScopeAssignmentService.get = async () => ({
    code: "SUC_DBS_00000",
    result: [],
  });
  const model = {
    code: "membershipScope_example",
    active: true,
    principalType: "human",
    principalCode: f.person.loginId,
    scopeType: "ENTERPRISE",
    scopeCode: f.enterprise.code,
    tenantCode: "tenant-a",
    enterpriseCode: f.enterprise.code,
    effect: "ALLOW",
    status: "ACTIVE",
    inheritanceMode: "DIRECT",
  };
  await assert.rejects(
    f.owner.protectAdministratorScopeSave({
      tenant: "tenant-a",
      model,
      authData: { system: true },
    }),
    { code: "ERR_PROFILE_TEAM_LAST_ADMIN" },
  );
});

test("uncertain, truncated or unqualified mutation coverage rejects", async () => {
  const f = fixture();
  f.p.installedCoverageQualified = false;
  await assert.rejects(f.owner.protectAdministratorEmployeeUpdate(f.request));
  f.p.installedCoverageQualified = true;
  for (const response of [
    { code: "ERR_DBS", result: [] },
    { code: "SUC_DBS", result: [], errors: {} },
    { code: "SUC_DBS", result: [], count: 101 },
    { code: "SUC_DBS", result: Array.from({ length: 101 }, () => ({})) },
  ]) {
    SERVICE.DefaultEmployeeService.get = async () => response;
    await assert.rejects(f.owner.protectAdministratorEmployeeRemove(f.request));
  }
});

test("source and destination identities are both inspected; unsupported operators reject", () => {
  const f = fixture();
  assert.deepEqual(
    f.owner.genericAdministratorLookup(
      { query: { code: "source" }, model: { $set: { code: "destination" } } },
      "update",
    ).$or,
    [{ code: "source" }, { code: "destination" }],
  );
  assert.throws(() =>
    f.owner.genericAdministratorPaths({
      model: { $replaceWith: { name: "hidden" } },
    }),
  );
});

test("historical default or explicit native superadministrator retirement always rejects", async () => {
  const f = fixture();
  f.person.userGroups = ["adminGroup"];
  await assert.rejects(
    f.owner.assertHistoricalLinkRetirement({}, { identity: f.identity }),
  );
  f.person.userGroups = ["viewer"];
  f.enterprise.adminEmail = f.person.loginId;
  await assert.rejects(
    f.owner.assertHistoricalLinkRetirement({}, { identity: f.identity }),
  );
});

test("reviewed native registration with no membership still protects default/full-role authority", async () => {
  const f = fixture();
  SERVICE.DefaultEnterpriseAccessAssignmentService.get = async () => ({
    code: "SUC_DBS_00000",
    result: [
      {
        code: "assignment-a",
        registeredLoginId: f.person.loginId,
        roleCode: "ENTERPRISE_ADMIN",
        registration: { phase: "COMPLETE", employeeCode: f.person.code },
      },
    ],
  });
  await assert.rejects(
    f.owner.assertHistoricalLinkRetirement({}, { identity: f.identity }),
  );
});

test("identity private write alone cannot bypass the required held retirement fence", async () => {
  const f = fixture();
  const write = { ...f.request, query: { _id: f.identity.recordId } };
  f.admitted.add(write);
  await assert.rejects(f.owner.protectAdministratorEmployeeUpdate(write));
});

test("historical linking holds exact retirement admission and completes only after owner evidence", async () => {
  const f = fixture();
  const input = {
    body: { auditCode: f.audit.code, fingerprint: f.fingerprint },
  };
  const write = { ...f.request, query: { _id: f.identity.recordId } };
  f.admitted.add(write);
  const result = {
    phase: "LINK_COMPLETE",
    auditCode: f.audit.code,
    fingerprint: f.fingerprint,
  };
  assert.deepEqual(
    await f.owner.withHistoricalLinkRetirement(input, f.identity, async () => {
      assert.equal(f.enterprise.teamOperation.phase, "PENDING");
      assert.equal(
        await f.owner.protectAdministratorEmployeeUpdate(write),
        true,
      );
      f.person.active = false;
      f.person.disabled = true;
      f.person.identityLinkRetirement = {
        auditCode: f.audit.code,
        fingerprint: f.fingerprint,
      };
      f.audit.status = "LINK_COMPLETE";
      return result;
    }),
    result,
  );
  assert.equal(f.enterprise.teamOperation.phase, "COMPLETE");
});

test("uncertain historical linking retains the existing operation fence and clears transient admission", async () => {
  const f = fixture();
  const write = { ...f.request, query: { _id: f.identity.recordId } };
  f.admitted.add(write);
  await assert.rejects(
    f.owner.withHistoricalLinkRetirement(
      { body: { auditCode: f.audit.code, fingerprint: f.fingerprint } },
      f.identity,
      async () => {
        throw new Error("lost response");
      },
    ),
  );
  assert.equal(f.enterprise.teamOperation.phase, "PENDING");
  await assert.rejects(f.owner.protectAdministratorEmployeeUpdate(write));
});
