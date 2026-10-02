/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module profile/test/enterpriseDefaultAdministratorContract
 * @description Exercises canonical enterprise/default-admin composition and failure recovery through the actual owner.
 * @layer test @owner profile
 * Fixtures simulate generated storage; these checks do not qualify installed persistence or send mail.
 * Fixture maintenance is authored only; behavioral execution remains deferred.
 */
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const original = require("../src/service/enterprise/defaultEnterpriseManagementService");
const enterpriseSource = require("../src/service/enterprise/defaultEnterpriseService");
const properties = require("../config/properties");
const metadata = require("../../../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultSchemaUtilityService");
const setupSource = require("../src/service/enterprise/defaultEnterpriseSetupContinuationService");
const teamSource = require("../src/service/enterprise/defaultEnterpriseTeamAdministrationService");
const membershipSource = require("../src/service/enterprise/defaultEnterpriseMembershipService");
const tenantGuardSource = require("../src/service/enterprise/defaultTenantProvisioningGuardService");
const cloneDeep = require("lodash/cloneDeep");

function fixture() {
  const enterprises = new Map(),
    assignments = new Map(),
    contacts = new Map(),
    tenants = new Map();
  const count = { enterprises: 0, assignments: 0, tenants: 0, activations: 0 };
  const faults = {};
  const hierarchyReads = [];
  const systemAuth = {
    tokenType: "service",
    principalType: "service",
    isSystem: true,
  };
  const configuration = JSON.parse(
    JSON.stringify(properties.enterpriseManagement),
  );
  global.CONFIG = {
    get: (name) =>
      name === "enterpriseManagement"
        ? configuration
        : name === "defaultTenant" || name === "defaultEnterprise"
          ? "default"
          : undefined,
  };
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code, message) {
        super(message);
        this.code = code;
      }
    },
  };
  global.ENUMS = { ContactType: { EMAIL: { key: "EMAIL" } } };
  global.NODICS = { getModule: () => ({}) };
  const result = (rows) => ({
    code: "SUC_DBS_00000",
    result: rows,
    ...(Array.isArray(rows) ? { count: rows.length } : {}),
  });
  const matching = (map, query) =>
    [...map.values()].filter((row) =>
      Object.entries(query).every(([key, value]) => row[key] === value),
    );
  const owner = {
    ...original,
    ensureTenant: async (code) => {
      count.tenants++;
      tenants.set(code, { code, active: true });
    },
    activateEnterpriseRuntime: async () => {
      count.activations++;
      if (faults.activation) {
        faults.activation = false;
        throw new Error("activation interrupted");
      }
    },
  };
  global.SERVICE = {
    DefaultTenantProvisioningGuardService: { ...tenantGuardSource },
    DefaultEnterpriseSetupContinuationService: { ...setupSource },
    DefaultEnterpriseTeamAdministrationService: { ...teamSource },
    DefaultEnterpriseMembershipService: {
      ...membershipSource,
      digest: owner.commandDigest.bind(owner),
      permission: (command, permission) =>
        assert.ok(command.authData.permissions.includes(permission)),
    },
    DefaultEnterpriseManagementService: owner,
    DefaultSchemaUtilityService: {
      getIdempotencyKey: metadata.getIdempotencyKey,
      buildDescriptor: () => ({
        operations: ["create"],
        fields: [
          "code",
          "name",
          "active",
          "contacts",
          "adminEmail",
          "customerNumber",
        ].map((name) => ({ name, readOnly: false })),
      }),
    },
    DefaultEnterpriseService: {
      ...enterpriseSource,
      get: async (request) => {
        if (request.authData === systemAuth) {
          assertHierarchyRead("enterprise", request);
          if (faults.enterpriseHierarchy) return faults.enterpriseHierarchy;
        }
        const response = result(
          cloneDeep(matching(enterprises, request.query)),
        );
        SERVICE.DefaultEnterpriseTeamAdministrationService.redactEnterprise(
          request,
          response,
        );
        SERVICE.DefaultEnterpriseSetupContinuationService.redactEnterprise(
          request,
          response,
        );
        return response;
      },
      save: async (request) => {
        SERVICE.DefaultEnterpriseSetupContinuationService.protectMutation(
          request,
        );
        count.enterprises++;
        const saved = { ...request.model };
        enterprises.set(saved.code, saved);
        return result(saved);
      },
    },
    DefaultIdentityGovernanceService: { getSystemAuthData: () => systemAuth },
    DefaultTenantService: {
      get: async (request) => {
        assertHierarchyRead("tenant", request);
        if (faults.tenantHierarchy) return faults.tenantHierarchy;
        return result(matching(tenants, request.query));
      },
    },
    DefaultContactService: {
      get: async (request) => {
        assert.equal(request.tenant, "default");
        assert.equal(request.options.skipItemCache, true);
        if (faults.contacts) return { code: "ERR_DBS_00000", result: [] };
        return result(
          [...contacts.values()].filter((row) =>
            request.query.code.$in.includes(row.code),
          ),
        );
      },
    },
    DefaultEnterpriseAccessAssignmentService: {
      get: async (request) => {
        assert.equal(request.tenant, "default");
        if (faults.assignmentRead) return { code: "ERR_DBS_00000", result: [] };
        return result(matching(assignments, request.query));
      },
      save: async (request) => {
        count.assignments++;
        const saved = { ...request.model, revision: 1 };
        assignments.set(saved.code, saved);
        if (faults.assignmentSaveAfterCommit) {
          faults.assignmentSaveAfterCommit = false;
          throw new Error("assignment response lost");
        }
        return result(saved);
      },
    },
    DefaultEmployeeService: {
      save: () => {
        throw new Error("Enterprise setup must not create an employee");
      },
    },
    DefaultPasswordService: {
      save: () => {
        throw new Error("Enterprise setup must not create a password");
      },
    },
  };
  const authData = {
    tokenType: "access",
    principalType: "human",
    loginId: "platform-owner",
    entCode: "default",
    userGroups: ["adminGroup"],
    permissions: [
      "profile.enterprise.create",
      "profile.enterpriseAccess.assign",
    ],
  };
  const request = (model) => ({
    authData,
    idempotencyKey: "setup-default-admin-0001",
    payload: {
      model: { code: "example", name: "Example Enterprise", ...model },
    },
  });
  function assertHierarchyRead(kind, request) {
    assert.equal(request.tenant, "default");
    assert.equal(request.authData, systemAuth);
    assert.deepEqual(request.options, {
      recursive: false,
      skipItemCache: true,
    });
    assert.deepEqual(request.searchOptions, { pageSize: 2, pageNumber: 1 });
    assert.deepEqual(Object.keys(request.query), ["code"]);
    hierarchyReads.push({ kind, request });
  }
  return {
    owner,
    request,
    enterprises,
    assignments,
    contacts,
    tenants,
    hierarchyReads,
    count,
    faults,
    configuration,
  };
}

test("canonical setup prepares one pending administrator and no active credentials", async () => {
  const f = fixture();
  const record = await f.owner.createFromModel(
    f.request({ adminEmail: " Maya@Example.test " }),
  );
  assert.equal(record.adminEmail, "maya@example.test");
  const enterprise = f.enterprises.get("example");
  const assignment = f.assignments.get(enterprise.defaultAdminAssignmentCode);
  assert.equal(assignment.normalizedEmail, "maya@example.test");
  assert.equal(assignment.roleCode, "ENTERPRISE_ADMIN");
  assert.equal(assignment.status, "PENDING");
  assert.equal(assignment.scopeType, "ENTERPRISE");
  assert.equal(assignment.scopeCode, "example");
  assert.equal(assignment.tenantCode, "example");
  assert.equal(f.count.enterprises, 1);
  assert.equal(f.count.assignments, 1);
  assert.equal(record.defaultAdminAssignmentCode, undefined);
  assert.deepEqual(
    f.hierarchyReads.map(({ kind, request }) => [kind, request.query.code]),
    [
      ["enterprise", "example"],
      ["tenant", "example"],
    ],
  );
});

test("absent administrator email uses the unique persisted enterprise EMAIL contact", async () => {
  const f = fixture();
  f.contacts.set("business-email", {
    code: "business-email",
    type: "EMAIL",
    value: "Business@Example.test",
    active: true,
  });
  const record = await f.owner.createFromModel(
    f.request({ contacts: ["business-email"] }),
  );
  assert.equal(record.adminEmail, "business@example.test");
  assert.deepEqual(record.contacts, ["business-email"]);
});

test("valid explicit administrator email wins without reading the fallback contact", async () => {
  const f = fixture();
  f.faults.contacts = true;
  await f.owner.createFromModel(
    f.request({ adminEmail: "admin@example.test", contacts: ["unavailable"] }),
  );
  assert.equal(f.enterprises.get("example").adminEmail, "admin@example.test");
});

for (const email of ["invalid", ["admin@example.test"], null, {}, 99]) {
  test(
    "invalid explicit administrator does not silently fall back: " +
      JSON.stringify(email),
    async () => {
      const f = fixture();
      f.contacts.set("c", {
        code: "c",
        type: "EMAIL",
        value: "valid@example.test",
      });
      await assert.rejects(
        f.owner.createFromModel(
          f.request({ adminEmail: email, contacts: ["c"] }),
        ),
      );
      assert.equal(f.count.enterprises, 0);
      assert.equal(f.count.tenants, 0);
      assert.equal(f.count.assignments, 0);
    },
  );
}

test("missing administrator/contact is rejected before any provisioning", async () => {
  const f = fixture();
  await assert.rejects(
    f.owner.createFromModel(f.request({})),
    /administrator email/i,
  );
  assert.equal(f.count.enterprises, 0);
  assert.equal(f.count.tenants, 0);
});

test("multiple contact emails require an explicit administrator, not the first row", async () => {
  const f = fixture();
  for (const name of ["a", "b"])
    f.contacts.set(name, {
      code: name,
      type: "EMAIL",
      value: name + "@example.test",
    });
  await assert.rejects(
    f.owner.createFromModel(f.request({ contacts: ["a", "b"] })),
    /unique email/,
  );
  assert.equal(f.count.enterprises, 0);
});

test("failed or incomplete contact lookup cannot become a usable fallback", async () => {
  const f = fixture();
  f.faults.contacts = true;
  await assert.rejects(
    f.owner.createFromModel(f.request({ contacts: ["missing"] })),
    /confirmed/,
  );
  f.faults.contacts = false;
  await assert.rejects(
    f.owner.createFromModel(f.request({ contacts: ["missing"] })),
    /confirmed/,
  );
  assert.equal(f.count.enterprises, 0);
});

test("replay preserves the exact existing invitation without extending expiry", async () => {
  const f = fixture(),
    request = f.request({ adminEmail: "admin@example.test" });
  await f.owner.createFromModel(request);
  const before = JSON.stringify([...f.assignments.values()]);
  await f.owner.createFromModel(request);
  assert.equal(f.count.enterprises, 1);
  assert.equal(f.count.assignments, 1);
  assert.equal(JSON.stringify([...f.assignments.values()]), before);
});

test("fresh-key duplicate is a declared definitive conflict with no provisioning or access writes", async () => {
  const f = fixture();
  await f.owner.createFromModel(f.request({ adminEmail: "maya@example.test" }));
  const before = {
    count: { ...f.count },
    enterprises: cloneDeep([...f.enterprises]),
    assignments: cloneDeep([...f.assignments]),
    tenants: cloneDeep([...f.tenants]),
  };
  const request = f.request({ adminEmail: "maya@example.test" });
  request.idempotencyKey = "setup-default-admin-fresh-0002";
  await assert.rejects(f.owner.createFromModel(request), {
    code: "ERR_PROFILE_ENTERPRISE_DUPLICATE",
  });
  assert.deepEqual(f.count, before.count);
  assert.deepEqual([...f.enterprises], before.enterprises);
  assert.deepEqual([...f.assignments], before.assignments);
  assert.deepEqual([...f.tenants], before.tenants);
  assert.deepEqual(
    require("../src/utils/statusDefinitions").ERR_PROFILE_ENTERPRISE_DUPLICATE,
    {
      code: "409",
      message: "Enterprise code already exists",
    },
  );
});

test("failed or nonexact duplicate lookup never emits definitive duplicate refusal or writes", async () => {
  for (const response of [
    { code: "ERR_DBS_00000", result: [{ code: "example" }] },
    { code: "SUC_DBS_00000", result: [{ code: "another" }] },
    {
      code: "SUC_DBS_00000",
      result: [{ code: "example" }, { code: "example" }],
    },
  ]) {
    const f = fixture();
    SERVICE.DefaultEnterpriseService.get = async () => response;
    await assert.rejects(
      f.owner.createFromModel(f.request({ adminEmail: "maya@example.test" })),
      (error) => error.code !== "ERR_PROFILE_ENTERPRISE_DUPLICATE",
    );
    assert.deepEqual(f.count, {
      enterprises: 0,
      assignments: 0,
      tenants: 0,
      activations: 0,
    });
  }
});

test("native create retains immutable original snapshot but public projection never exposes it", async () => {
  const f = fixture(),
    request = f.request({ adminEmail: "admin@example.test" });
  const result = await f.owner.createFromModel(request);
  const enterprise = [...f.enterprises.values()][0];
  assert.equal(enterprise.setupContinuation.version, 1);
  assert.equal(
    enterprise.setupContinuation.intent.administrator.email,
    "admin@example.test",
  );
  assert.equal(
    enterprise.setupContinuation.intent.setupRequestHash,
    enterprise.setupRequestHash,
  );
  assert.equal(result.setupContinuation, undefined);
  assert.equal(result.setupRequestHash, undefined);
  assert.equal(f.configuration.setupContinuation.resumeQualified, false);
});

test("original-form replay cannot bypass a held Team setup fence with default recovery OFF", async () => {
  const f = fixture(),
    request = f.request({ adminEmail: "admin@example.test" });
  await f.owner.createFromModel(request);
  const enterprise = [...f.enterprises.values()][0];
  enterprise.teamOperation = {
    phase: "PENDING",
    operation: "SETUP_CONTINUATION",
  };
  const before = { ...f.count };
  await assert.rejects(f.owner.createFromModel(request));
  assert.deepEqual(f.count, before);
  assert.equal(enterprise.teamOperation.phase, "PENDING");
});

test("lost assignment-save response resumes without another invitation or credential", async () => {
  const f = fixture(),
    request = f.request({ adminEmail: "admin@example.test" });
  f.faults.assignmentSaveAfterCommit = true;
  await assert.rejects(f.owner.createFromModel(request), /response lost/);
  await f.owner.createFromModel(request);
  assert.equal(f.count.enterprises, 1);
  assert.equal(f.count.assignments, 1);
});

test("activation interruption reuses the enterprise before preparing the administrator", async () => {
  const f = fixture(),
    request = f.request({ adminEmail: "admin@example.test" });
  f.faults.activation = true;
  await assert.rejects(
    f.owner.createFromModel(request),
    /activation interrupted/,
  );
  assert.equal(f.count.assignments, 0);
  await f.owner.createFromModel(request);
  assert.equal(f.count.enterprises, 1);
  assert.equal(f.count.assignments, 1);
});

test("a completed default admin is retained even when the invitation expiry is old", async () => {
  const f = fixture(),
    request = f.request({ adminEmail: "admin@example.test" });
  await f.owner.createFromModel(request);
  const assignment = [...f.assignments.values()][0];
  assignment.status = "REGISTERED";
  assignment.expiresAt = "2000-01-01T00:00:00Z";
  await f.owner.createFromModel(request);
  assert.equal(assignment.status, "REGISTERED");
  assert.equal(f.count.assignments, 1);
});

test("a registration checkpoint is preserved during a setup retry", async () => {
  const f = fixture(),
    request = f.request({ adminEmail: "admin@example.test" });
  await f.owner.createFromModel(request);
  const assignment = [...f.assignments.values()][0];
  assignment.registration = { phase: "CREDENTIAL" };
  await f.owner.createFromModel(request);
  assert.deepEqual(assignment.registration, { phase: "CREDENTIAL" });
  assert.equal(f.count.assignments, 1);
});

for (const mutation of [
  { status: "REVOKED" },
  { roleCode: "OPERATOR" },
  { tenantCode: "other" },
  { scopeType: "GLOBAL" },
  { active: false },
]) {
  test(
    "a conflicting association cannot be overwritten on retry: " +
      JSON.stringify(mutation),
    async () => {
      const f = fixture(),
        request = f.request({ adminEmail: "admin@example.test" });
      await f.owner.createFromModel(request);
      Object.assign([...f.assignments.values()][0], mutation);
      await assert.rejects(f.owner.createFromModel(request), /review/);
      assert.equal(f.count.assignments, 1);
    },
  );
}

test("changed administrator input cannot retarget an existing setup operation", async () => {
  const f = fixture();
  await f.owner.createFromModel(f.request({ adminEmail: "one@example.test" }));
  await assert.rejects(
    f.owner.createFromModel(f.request({ adminEmail: "two@example.test" })),
    /request has changed/,
  );
  assert.equal(f.count.assignments, 1);
});

test("caller cannot nominate the managed default-assignment reference", async () => {
  const f = fixture();
  await assert.rejects(
    f.owner.createFromModel(
      f.request({
        adminEmail: "one@example.test",
        defaultAdminAssignmentCode: "other",
      }),
    ),
    /managed or unavailable/,
  );
  assert.equal(f.count.enterprises, 0);
});

test("owner lookup failures do not fabricate administrator readiness", async () => {
  const f = fixture();
  f.faults.assignmentRead = true;
  await assert.rejects(
    f.owner.createFromModel(f.request({ adminEmail: "one@example.test" })),
    /confirmed/,
  );
  assert.equal(f.count.assignments, 0);
});

test("later layers can configure a delegable enterprise admin responsibility", async () => {
  const f = fixture();
  f.configuration.create.defaultAdministrator.roleCode = "CUSTOM_ADMIN";
  f.configuration.accessAssignments.roles.CUSTOM_ADMIN = {
    groupCodes: ["customAdmin"],
    scopeType: "ENTERPRISE",
    delegable: true,
  };
  await f.owner.createFromModel(
    f.request({ adminEmail: "admin@example.test" }),
  );
  assert.deepEqual([...f.assignments.values()][0].groupCodes, ["customAdmin"]);
});

test("non-enterprise default roles are refused before tenant/enterprise creation", async () => {
  const f = fixture();
  f.configuration.accessAssignments.roles.ENTERPRISE_ADMIN.scopeType = "GLOBAL";
  await assert.rejects(
    f.owner.createFromModel(f.request({ adminEmail: "admin@example.test" })),
    /delegable enterprise/,
  );
  assert.equal(f.count.tenants, 0);
});

for (const kind of ["enterprise", "tenant"]) {
  for (const failure of [
    "failed",
    "empty",
    "duplicate",
    "inactive",
    "wrong-code",
    "missing-success-code",
  ]) {
    test(
      "fresh " +
        kind +
        " hierarchy read rejects " +
        failure +
        " without provisioning",
      async () => {
        const f = fixture();
        f.enterprises.set("example", {
          code: "example",
          active: true,
          tenant: "example",
        });
        f.tenants.set("example", { code: "example", active: true });
        const row =
          kind === "enterprise"
            ? f.enterprises.get("example")
            : f.tenants.get("example");
        f.faults[kind + "Hierarchy"] = {
          code:
            failure === "failed"
              ? "ERR_DBS_00000"
              : failure === "missing-success-code"
                ? undefined
                : "SUC_DBS_00000",
          result:
            failure === "empty"
              ? []
              : failure === "duplicate"
                ? [row, { ...row }]
                : [
                    {
                      ...row,
                      ...(failure === "inactive"
                        ? { active: false }
                        : failure === "wrong-code"
                          ? { code: "other" }
                          : {}),
                    },
                  ],
        };
        await assert.rejects(
          f.owner.retrieveEnterpriseForAccess("example"),
          (error) =>
            error.code === "ERR_PRFL_00003" &&
            /unavailable or ambiguous/.test(error.message),
        );
        assert.equal(f.count.enterprises, 0);
        assert.equal(f.count.tenants, 0);
        assert.equal(f.count.assignments, 0);
        assert.equal(f.hierarchyReads.length, kind === "enterprise" ? 1 : 2);
      },
    );
  }
}

test("default administrator setup rejects non-human/system/service-account claims before provisioning", async () => {
  const f = fixture();
  for (const claims of [
    { principalType: undefined },
    { principalType: "service" },
    { principalType: "customer" },
    { tokenType: "service" },
    { isSystem: true },
    { userGroups: ["adminGroup", "serviceAccountUserGroup"] },
    { allUserGroupCodes: ["serviceAccountUserGroup"] },
  ]) {
    const request = f.request({ adminEmail: "admin@example.test" });
    request.authData = { ...request.authData, ...claims };
    await assert.rejects(
      f.owner.createFromModel(request),
      (error) =>
        error.code === "ERR_PRFL_00003" &&
        /authenticated human employee/.test(error.message),
    );
  }
  assert.equal(f.count.enterprises, 0);
  assert.equal(f.count.tenants, 0);
  assert.equal(f.count.assignments, 0);
  assert.equal(f.hierarchyReads.length, 0);
});
