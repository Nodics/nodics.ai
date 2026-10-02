/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module profile/test/enterpriseApplicationIntake @description Exercises actual intake, continuation, projection and permission owners with controlled generated-storage fixtures; not deployed database or browser acceptance. @layer test @owner profile */
const test = require("node:test");
const assert = require("node:assert/strict");
const Enum = require("../../../../nodics.foundation/modules/nConfig/bin/enum");
global.ENUMS = Object.fromEntries(
  Object.entries(require("../src/utils/enums")).map(([name, definition]) => [
    name,
    new Enum(definition.definition, definition._options),
  ]),
);
const source = require("../src/service/enterprise/defaultEnterpriseApplicationService");
const registrationSource = require("../src/service/enterprise/defaultEnterpriseRegistrationService");
const managementSource = require("../src/service/enterprise/defaultEnterpriseManagementService");
const enterpriseSource = require("../src/service/enterprise/defaultEnterpriseService");
const reviewSource = require("../src/service/enterprise/defaultEnterpriseApplicationReviewService");
const membershipSource = require("../src/service/enterprise/defaultEnterpriseMembershipService");
const permissionSource = require("../../../../nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService");
const properties = require("../config/properties");
function fixture() {
  const config = structuredClone(properties.enterpriseManagement);
  config.applications.enabled = true;
  config.registration = {
    ...config.registration,
    enabled: true,
    maximumPasswordLength: 256,
    inventoryQualified: true,
    assignmentClaimIndexQualified: true,
  };
  global.CONFIG = {
    get: (key) =>
      key === "enterpriseManagement"
        ? config
        : ["defaultTenant", "defaultEnterprise"].includes(key)
          ? "default"
          : undefined,
  };
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code, message) {
        super(message || code);
        this.code = code;
      }
    },
  };
  const rows = new Map(),
    enterprises = new Map(),
    identities = [];
  const faults = {},
    counts = { saved: 0, updated: 0, consumed: 0, identityWrites: 0 },
    consumed = new Set(),
    captured = new WeakSet();
  enterprises.set("company", {
    code: "company",
    name: "Example Company",
    active: true,
    tenant: "companyTenant",
    employeeApplicationPolicy: {
      enabled: true,
      method: "PASSWORD",
      roleCode: "OPERATOR",
    },
  });
  const ok = (result) => ({ code: "SUC_DBS_00000", result });
  const matches = (row, query) =>
    Object.entries(query).every(
      ([key, value]) =>
        key.split(".").reduce((item, part) => item && item[part], row) ===
        value,
    );
  const context = {
    tenant: "default",
    origin: "http://localhost:3100",
    enterpriseCode: "default",
    authData: { isSystem: true },
  };
  const base = {
    ...registrationSource,
    ownsContext: (value) => value === context,
    rate: async () => {},
    verifyRpc: async (ctx, session, operation, fields) => {
      assert.equal(ctx, context);
      assert.equal(fields.proof, session.proof);
      if (operation === "RECEIPT") {
        if (!consumed.has(fields.operationReference))
          throw new Error("No receipt");
        return { executionGranted: false };
      }
      assert.equal(operation, "CONSUME");
      if (faults.proofBefore) throw new Error("Proof unavailable");
      if (consumed.has(fields.operationReference))
        throw new Error("Already consumed");
      consumed.add(fields.operationReference);
      counts.consumed++;
      if (faults.proofAfter) {
        faults.proofAfter = false;
        throw new Error("Lost proof response");
      }
      return { executionGranted: true };
    },
  };
  const service = { ...source },
    management = { ...managementSource };
  global.SERVICE = {
    DefaultLoggerService: {
      runSensitiveOperation: async (request, operation) => {
        captured.add(request);
        try {
          return await operation();
        } finally {
          captured.delete(request);
        }
      },
      assertSensitiveRequest: (request) =>
        assert.equal(captured.has(request), true),
    },
    DefaultEnterpriseApplicationService: service,
    DefaultEnterpriseRegistrationService: base,
    DefaultEnterpriseManagementService: management,
    DefaultSecuredRequestPipelineService: { ...permissionSource },
    DefaultIdentityGovernanceService: {
      getSystemAuthData: () => ({ isSystem: true }),
    },
    DefaultEnterpriseService: {
      ...enterpriseSource,
      get: async ({ query }) =>
        ok([...enterprises.values()].filter((row) => matches(row, query))),
      retrieveEnterprise: async (code) => enterprises.get(code),
    },
    DefaultTenantService: {
      get: async ({ query }) =>
        ok(
          [...enterprises.values()].some((row) => row.tenant === query.code)
            ? [{ code: query.code, active: true }]
            : [],
        ),
    },
    DefaultEnterpriseAccessAssignmentService: {
      get: async ({ query, searchOptions }) => {
        if (faults.read) return { code: "ERR_DBS_00000", result: [] };
        let items = [...rows.values()].filter((row) => matches(row, query));
        if (faults.leak) items = [...rows.values()];
        const start =
          ((searchOptions?.pageNumber || 1) - 1) *
          (searchOptions?.pageSize || 100);
        return ok(
          structuredClone(
            items.slice(start, start + (searchOptions?.pageSize || 100)),
          ),
        );
      },
      save: async ({ model }) => {
        if (rows.has(model.code)) throw new Error("Duplicate");
        counts.saved++;
        const saved = { ...structuredClone(model), revision: 1 };
        rows.set(model.code, saved);
        return ok(saved);
      },
      update: async ({ query, model }) => {
        const old = rows.get(query.code);
        if (faults.updateBefore || !old || !matches(old, query))
          return ok({ matchedCount: 0 });
        counts.updated++;
        const saved = {
          ...old,
          ...structuredClone(model),
          revision: old.revision + 1,
        };
        rows.set(old.code, saved);
        if (faults.updateAfter) {
          faults.updateAfter = false;
          throw new Error("Lost update response");
        }
        return ok({ matchedCount: 1 });
      },
    },
  };
  for (const kind of [
    "Employee",
    "Customer",
    "Password",
    "PrincipalScopeAssignment",
  ]) {
    global.SERVICE["Default" + kind + "Service"] = {
      get: async ({ tenant, query }) =>
        ok(
          identities.filter(
            (row) =>
              row.kind === kind && row.tenant === tenant && matches(row, query),
          ),
        ),
      save: async () => {
        counts.identityWrites++;
        throw new Error("Intake must not provision");
      },
      update: async () => {
        counts.identityWrites++;
        throw new Error("Intake must not grant access");
      },
    };
  }
  const session = {
    tenant: "default",
    origin: context.origin,
    email: "applicant@example.test",
    proof: "controlled-proof",
    proofExpiresAt: Date.now() + 60000,
    stage: "RESOLVING",
    expiresAt: Date.now() + 120000,
    challenge: {
      challengeCode: "challenge",
      generation: 1,
      status: "VERIFIED",
      nextIssueAt: new Date().toISOString(),
    },
    deliveryStatus: "DELIVERED",
  };
  const input = {
    enterpriseCode: "company",
    firstName: "Maya",
    lastName: "Example",
    note: "Joining operations",
  };
  const admin = (enterpriseCode) => ({
    authData: {
      tokenType: "access",
      principalType: "human",
      loginId: "reviewer",
      entCode: enterpriseCode,
      userGroups: ["adminGroup"],
      permissions: ["profile.enterpriseAccess.search"],
    },
    query: {},
  });
  return {
    service,
    base,
    management,
    config,
    context,
    session,
    input,
    rows,
    enterprises,
    identities,
    counts,
    faults,
    admin,
  };
}
async function ready(f) {
  await f.service.resolve(f.context, f.session, []);
}

test("qualified withdrawal preserves immutable evidence and identical replay is read-only", async () => {
  const f = fixture();
  f.config.applications.lifecycle.qualified = true;
  await ready(f);
  await f.service.apply(f.context, f.session, f.input);
  const before = [...f.rows.values()][0];
  const command = {
    applicationCode: before.code,
    expectedRevision: String(before.revision),
  };
  f.faults.updateAfter = true;
  const result = await f.service.withdraw(f.context, f.session, command);
  assert.equal(result.stage, "APPLICATION_CLOSED");
  assert.equal(result.applications[0].status, "WITHDRAWN");
  assert.equal(
    f.rows.get(before.code).application.requestHash,
    before.application.requestHash,
  );
  const writes = f.counts.updated;
  await f.service.withdraw(f.context, f.session, command);
  assert.equal(f.counts.updated, writes);
  assert.equal(f.counts.identityWrites, 0);
});
test("withdrawal rejects a stale revision, another mailbox, approval and disabled qualification", async () => {
  const f = fixture();
  f.config.applications.lifecycle.qualified = true;
  await ready(f);
  await f.service.apply(f.context, f.session, f.input);
  const record = [...f.rows.values()][0],
    command = {
      applicationCode: record.code,
      expectedRevision: String(record.revision),
    };
  await assert.rejects(
    f.service.withdraw(f.context, f.session, {
      ...command,
      expectedRevision: "1",
    }),
  );
  await assert.rejects(
    f.service.withdraw(
      f.context,
      { ...f.session, email: "other@example.test" },
      command,
    ),
  );
  record.status = "APPROVED";
  await assert.rejects(f.service.withdraw(f.context, f.session, command));
  record.status = "AWAITING_REVIEW";
  f.config.applications.lifecycle.qualified = false;
  await assert.rejects(f.service.withdraw(f.context, f.session, command));
  assert.equal(f.counts.updated, 1);
});
test("fresh verification starts a new immutable attempt and never reuses consumed proof", async () => {
  const f = fixture();
  f.config.applications.lifecycle.qualified = true;
  await ready(f);
  await f.service.apply(f.context, f.session, f.input);
  const before = structuredClone([...f.rows.values()][0]);
  await f.service.withdraw(f.context, f.session, {
    applicationCode: before.code,
    expectedRevision: String(before.revision),
  });
  await f.service.resolve(f.context, f.session, [...f.rows.values()]);
  await assert.rejects(
    f.service.apply(f.context, f.session, {
      ...f.input,
      note: "Corrected details",
    }),
    /VERIFY_AGAIN/,
  );
  delete f.session.consumedApplication;
  await f.service.apply(f.context, f.session, {
    ...f.input,
    note: "Corrected details",
  });
  const current = f.rows.get(before.code);
  assert.equal(current.application.attempt, 2);
  assert.notEqual(
    current.application.requestHash,
    before.application.requestHash,
  );
  assert.equal(current.application.history[0].status, "WITHDRAWN");
  assert.equal(
    current.application.history[0].application.note,
    before.application.note,
  );
  assert.equal(f.counts.saved, 1);
  assert.equal(f.counts.consumed, 2);
  assert.deepEqual(
    f.base.project(f.session).applications.map((item) => item.status),
    ["WITHDRAWN", "AWAITING_REVIEW"],
  );
});
test("configured deadlines freeze at draft creation and expiry never changes approved access", async () => {
  const f = fixture();
  f.config.applications.lifecycle.qualified = true;
  f.config.applications.lifecycle.expiryDays = 2;
  let now = Date.now();
  f.base.now = () => now;
  await ready(f);
  await f.service.apply(f.context, f.session, f.input);
  const record = [...f.rows.values()][0],
    deadline = record.application.deadlineAt;
  f.config.applications.lifecycle.expiryDays = 10;
  now = Date.parse(deadline);
  const result = await f.service.expire(f.context, record);
  assert.equal(result.status, "EXPIRED");
  assert.equal(result.application.deadlineAt, deadline);
  assert.equal(
    (await f.service.expire(f.context, { ...record, status: "APPROVED" }))
      .status,
    "APPROVED",
  );
});
test("later layers can narrow attempt limits without changing closed history", async () => {
  const f = fixture();
  f.config.applications.lifecycle.qualified = true;
  f.config.applications.lifecycle.maximumAttempts = 1;
  await ready(f);
  await f.service.apply(f.context, f.session, f.input);
  const record = [...f.rows.values()][0];
  await f.service.withdraw(f.context, f.session, {
    applicationCode: record.code,
    expectedRevision: String(record.revision),
  });
  assert.equal(f.service.canResubmit(f.rows.get(record.code)), false);
  f.config.applications.lifecycle.maximumAttempts = 0;
  assert.throws(() => f.service.lifecyclePolicy(), /UNAVAILABLE/);
});
for (const terminal of ["WITHDRAWN", "EXPIRED"])
  test(
    "late claimed decision completes without approving " +
      terminal +
      " attempt",
    async () => {
      const f = fixture();
      f.config.applications.lifecycle.qualified = true;
      await ready(f);
      await f.service.apply(f.context, f.session, f.input);
      const record = [...f.rows.values()][0];
      record.status = terminal;
      record.application.review = {
        instanceCode: "original-instance",
        definitionCode: "definition",
        version: 1,
        requestHash: record.application.requestHash,
        enterpriseCode: record.enterpriseCode,
        tenantCode: record.tenantCode,
      };
      const execution = {
        instance: {
          code: "original-instance",
          definitionCode: "definition",
          version: 1,
          context: {
            applicationCode: record.code,
            requestHash: record.application.requestHash,
            enterpriseCode: record.enterpriseCode,
            requestedBy: record.normalizedEmail,
          },
        },
        actor: "reviewer@example.test",
        taskCode: "review-task",
        body: { decision: { approved: true } },
      };
      const review = { ...reviewSource, claim: async () => execution };
      const writes = f.counts.updated;
      const result = await review.applyDecision({
        tenant: record.tenantCode,
        authData: { entCode: record.enterpriseCode },
      });
      assert.equal(result.output.decision, terminal);
      assert.equal(result.output.registrationRequired, false);
      assert.equal(f.counts.updated, writes);
      assert.equal(f.counts.identityWrites, 0);
    },
  );
test("generic CRUD cannot forge or remove application evidence, including system-looking payload flags", async () => {
  const f = fixture(),
    guard = { ...membershipSource };
  await assert.rejects(
    guard.protectAssignment({ model: { application: {}, isSystem: true } }),
    /FORBIDDEN/,
  );
  await assert.rejects(
    guard.protectAssignment({ model: { origin: "SELF_APPLICATION" } }),
    /FORBIDDEN/,
  );
  await ready(f);
  await f.service.apply(f.context, f.session, f.input);
  const record = [...f.rows.values()][0];
  await assert.rejects(
    guard.protectAssignment({
      tenant: f.context.tenant,
      query: { code: record.code },
      model: { status: "APPROVED" },
    }),
    /FORBIDDEN/,
  );
});

test("verified new person sees named eligible enterprises without tenant or role data", async () => {
  const f = fixture();
  await ready(f);
  const projected = f.base.project(f.session);
  assert.equal(projected.stage, "APPLICATION_DETAILS");
  assert.deepEqual(projected.applicationChoices, [
    { code: "company", name: "Example Company" },
  ]);
  for (const value of [
    "companyTenant",
    "controlled-proof",
    "groupCodes",
    "policyDigest",
  ])
    assert.ok(!JSON.stringify(projected).includes(value));
});
test("submission consumes proof once and saves pending data without credentials or access", async () => {
  const f = fixture();
  await ready(f);
  const result = await f.service.apply(f.context, f.session, f.input);
  assert.equal(result.stage, "APPLICATION_PENDING");
  assert.equal(result.applications[0].status, "AWAITING_REVIEW");
  assert.deepEqual(f.counts, {
    saved: 1,
    updated: 1,
    consumed: 1,
    identityWrites: 0,
  });
  const record = [...f.rows.values()][0];
  assert.equal(record.origin, "SELF_APPLICATION");
  assert.equal(record.identityClaimed, undefined);
  assert.equal(record.registration, undefined);
  assert.ok(!JSON.stringify(record).includes("controlled-proof"));
  assert.throws(
    () => f.base.assertAssignment(record, f.session.email),
    /ASSIGNMENT/,
  );
});
test("identical retry returns the same pending record without another consumption or write", async () => {
  const f = fixture();
  await ready(f);
  await f.service.apply(f.context, f.session, f.input);
  const before = { ...f.counts };
  await f.service.apply(f.context, f.session, f.input);
  assert.deepEqual(f.counts, before);
});
for (const field of [
  "roleCode",
  "tenantCode",
  "approved",
  "verified",
  "authData",
  "password",
])
  test("caller-owned authority is rejected: " + field, async () => {
    const f = fixture();
    await ready(f);
    await assert.rejects(
      f.service.apply(f.context, f.session, { ...f.input, [field]: "forged" }),
    );
    assert.equal(f.counts.saved, 0);
  });
for (const change of [
  { proof: undefined },
  { proofExpiresAt: 0 },
  { origin: "https://other.example.test" },
])
  test("missing/stale/mismatched proof does not expose choices", async () => {
    const f = fixture();
    Object.assign(f.session, change);
    await assert.rejects(ready(f));
    assert.equal(f.session.applicationChoices, undefined);
  });
test("a cloned request context cannot manufacture admission", async () => {
  const f = fixture();
  await assert.rejects(f.service.resolve({ ...f.context }, f.session, []));
});
test("disabled intake preserves the existing invite-only resolution", async () => {
  const f = fixture();
  f.config.applications.enabled = false;
  assert.equal(await f.service.resolve(f.context, f.session, []), false);
});
for (const change of [
  { active: false },
  { employeeApplicationPolicy: undefined },
  { employeeApplicationPolicy: { enabled: false } },
  {
    employeeApplicationPolicy: {
      enabled: true,
      method: "UNSUPPORTED",
      roleCode: "OPERATOR",
    },
  },
])
  test("ineligible enterprise is not offered", async () => {
    const f = fixture();
    Object.assign(f.enterprises.get("company"), change);
    await ready(f);
    assert.equal(f.session.stage, "NO_INVITATION");
  });
test("eligibility is rechecked when submitting rather than trusted from the earlier list", async () => {
  const f = fixture();
  await ready(f);
  f.enterprises.get("company").employeeApplicationPolicy.enabled = false;
  await assert.rejects(f.service.apply(f.context, f.session, f.input));
  assert.equal(f.counts.saved, 0);
});
test("existing employee/customer identity cannot obtain another identity through intake", async () => {
  const f = fixture();
  await ready(f);
  f.identities.push({
    kind: "Customer",
    tenant: "default",
    code: "person",
    loginId: f.session.email,
  });
  await assert.rejects(
    f.service.apply(f.context, f.session, f.input),
    /EXISTING/,
  );
  assert.equal(f.counts.saved, 0);
});
for (const status of ["PENDING", "REGISTERED", "REVOKED"])
  test(
    "existing " + status + " invitation is never replaced by an application",
    async () => {
      const f = fixture();
      await ready(f);
      const code = f.management.assignmentCode("company", f.session.email);
      f.rows.set(code, { code, status, active: true });
      await assert.rejects(
        f.service.apply(f.context, f.session, f.input),
        /CONFLICT/,
      );
      assert.equal(f.counts.saved, 0);
      assert.equal(f.rows.get(code).status, status);
    },
  );
test("changed submission data cannot overwrite an existing application", async () => {
  const f = fixture();
  await ready(f);
  await f.service.apply(f.context, f.session, f.input);
  await assert.rejects(
    f.service.apply(f.context, f.session, { ...f.input, note: "Changed" }),
    /CONFLICT/,
  );
  assert.equal(f.counts.updated, 1);
});
test("failed verification leaves a draft out of the review queue and unable to register", async () => {
  const f = fixture();
  await ready(f);
  f.faults.proofBefore = true;
  await assert.rejects(f.service.apply(f.context, f.session, f.input));
  assert.equal([...f.rows.values()][0].status, "APPLICATION_DRAFT");
  assert.equal((await f.service.search(f.admin("company"))).count, 0);
  f.faults.proofBefore = false;
  await f.service.apply(f.context, f.session, f.input);
  assert.equal(f.counts.saved, 1);
});
for (const fault of ["proofAfter", "updateAfter"])
  test(
    "lost " + fault + " response reconciles the exact original operation",
    async () => {
      const f = fixture();
      await ready(f);
      f.faults[fault] = true;
      const result = await f.service.apply(f.context, f.session, f.input);
      assert.equal(result.stage, "APPLICATION_PENDING");
      assert.equal(f.counts.consumed, 1);
      assert.equal(f.counts.updated, 1);
    },
  );
test("zero-match submission never becomes review-ready", async () => {
  const f = fixture();
  await ready(f);
  f.faults.updateBefore = true;
  await assert.rejects(f.service.apply(f.context, f.session, f.input));
  assert.equal([...f.rows.values()][0].status, "APPLICATION_DRAFT");
  assert.equal(f.counts.identityWrites, 0);
});
test("administrator review is scoped and never returns proofs or internal provisioning data", async () => {
  const f = fixture();
  await ready(f);
  await f.service.apply(f.context, f.session, f.input);
  const result = await f.service.search(f.admin("company"));
  assert.equal(result.items[0].name, "Maya Example");
  assert.equal(result.count, 1);
  for (const value of [
    "requestHash",
    "policyDigest",
    "controlled-proof",
    "companyTenant",
  ])
    assert.ok(!JSON.stringify(result).includes(value));
  assert.equal((await f.service.search(f.admin("other"))).count, 0);
  await assert.rejects(
    f.service.search({
      ...f.admin("other"),
      query: { enterpriseCode: "company" },
    }),
  );
  assert.equal((await f.service.search(f.admin("default"))).count, 1);
});
for (const change of [
  { principalType: "customer" },
  { principalType: "service" },
  { tokenType: "service" },
  { permissions: [] },
  { isSystem: true },
])
  test(
    "ineligible actor cannot read the application queue: " +
      JSON.stringify(change),
    async () => {
      const f = fixture();
      const request = f.admin("company");
      Object.assign(request.authData, change);
      await assert.rejects(f.service.search(request));
    },
  );
test("out-of-scope rows returned by a faulty persistence adapter fail closed", async () => {
  const f = fixture();
  await ready(f);
  await f.service.apply(f.context, f.session, f.input);
  f.faults.leak = true;
  await assert.rejects(f.service.search(f.admin("other")), /CONFLICT/);
});
test("storage errors cannot become a successful empty review queue", async () => {
  const f = fixture();
  f.faults.read = true;
  await assert.rejects(f.service.search(f.admin("company")), /STORAGE/);
});
test("ordinary invitation preparation preserves application history even after intake is disabled", async () => {
  const f = fixture();
  await ready(f);
  await f.service.apply(f.context, f.session, f.input);
  f.config.applications.enabled = false;
  await assert.rejects(
    f.service.assertNoApplication("company", f.session.email),
    /CONFLICT/,
  );
});
test("configured role selection is an explicit later-layer extension", async () => {
  const f = fixture();
  f.config.accessAssignments.roles.CUSTOM = {
    groupCodes: ["axisViewerUserGroup"],
    scopeType: "ENTERPRISE",
    delegable: true,
    assignmentPermissions: [],
  };
  f.config.applications.allowedRoleCodes = ["CUSTOM"];
  f.enterprises.get("company").employeeApplicationPolicy.roleCode = "CUSTOM";
  await ready(f);
  await f.service.apply(f.context, f.session, f.input);
  assert.equal([...f.rows.values()][0].roleCode, "CUSTOM");
});
test("application route is finite and no approval/credential field is accepted", () => {
  const f = fixture(),
    routes = require("../src/router/routers").profile.loadDefaults;
  const schema =
    routes.applyForEnterprise.requestBody.content["application/json"].schema;
  assert.equal(schema.additionalProperties, false);
  assert.equal(schema.properties.password, undefined);
  assert.equal(schema.properties.approved, undefined);
  assert.equal(routes.searchEmployeeApplications.secured, true);
  assert.deepEqual(routes.searchEmployeeApplications.authTokenTypes, [
    "access",
  ]);
  assert.equal(
    f.base.workspace().applications.submitPath,
    routes.applyForEnterprise.key.replace(/^/, "/nodics/profile/v0"),
  );
});
test("application deadline label uses the existing owner presentation without exposing lifecycle policy or enabling intake", () => {
  const f = fixture();
  const workspace = f.base.workspace();
  assert.equal(workspace.applications.presentation.deadlineLabel, "Deadline");
  assert.equal(workspace.applications.lifecycle, undefined);
  assert.equal(workspace.applications.deadlineAt, undefined);
  assert.equal(workspace.applications.withdrawPath, undefined);
  assert.equal(f.config.applications.lifecycle.qualified, false);
  f.config.applications.presentation.deadlineLabel = "Review Deadline";
  assert.equal(
    f.base.workspace().applications.presentation.deadlineLabel,
    "Review Deadline",
  );
  f.config.applications.enabled = false;
  assert.equal(f.base.workspace().applications, undefined);
});
test("existing Profile provisioning still refuses a submitted self-application", async () => {
  const f = fixture();
  await ready(f);
  await f.service.apply(f.context, f.session, f.input);
  const item = [...f.rows.values()][0];
  assert.throws(
    () =>
      f.base.assertAssignment({ ...item, status: "PENDING" }, f.session.email),
    /ASSIGNMENT/,
  );
  assert.equal(f.counts.identityWrites, 0);
});
test("public controller and existing registration dispatcher execute the same application owner", async () => {
  const f = fixture();
  await ready(f);
  f.base.context = async () => f.context;
  f.base.session = async (ctx, token, work) => work(f.session);
  global.FACADE = {
    DefaultEnterpriseManagementFacade: require("../src/facade/enterprise/defaultEnterpriseManagementFacade"),
  };
  const controller = require("../src/controller/enterprise/defaultEnterpriseManagementController");
  const result = await controller.applyForEnterprise({
    body: { continuation: "fixture", ...f.input },
  });
  assert.equal(result.data.stage, "APPLICATION_PENDING");
  assert.equal(f.counts.identityWrites, 0);
});
test("review controller does not disclose private persistence diagnostics", async () => {
  fixture();
  global.FACADE = {
    DefaultEnterpriseManagementFacade: {
      searchEmployeeApplications: async () => {
        throw new Error("private-storage-value");
      },
    },
  };
  const controller = require("../src/controller/enterprise/defaultEnterpriseManagementController");
  await assert.rejects(
    controller.searchEmployeeApplications({ query: {} }),
    (error) =>
      error.code === "ERR_PROFILE_APP_STORAGE" &&
      !error.message.includes("private-storage-value"),
  );
});
test("source workspace publishes the opt-in review list without changing the inherited workspace", () => {
  const f = fixture(),
    provider = require("../src/service/defaultProfileBackofficeCapabilityService");
  const before = JSON.stringify(f.config.workspace);
  const capability = provider.getCapability();
  const workspace = capability.navigation.find(
    (item) => item.id === "enterprises",
  ).backendWorkspace;
  assert(workspace.tabs.some((tab) => tab.id === "employee-applications"));
  assert.equal(JSON.stringify(f.config.workspace), before);
  f.config.applications.enabled = false;
  assert(
    !provider
      .getCapability()
      .navigation.find((item) => item.id === "enterprises")
      .backendWorkspace.tabs.some((tab) => tab.id === "employee-applications"),
  );
});
test("ordinary administrator invitation command cannot reset a pending application", async () => {
  const f = fixture();
  await ready(f);
  await f.service.apply(f.context, f.session, f.input);
  await assert.rejects(
    f.management.preAssignAccess({
      ...f.admin("company"),
      params: { enterpriseCode: "company" },
      body: { email: f.session.email, roleCode: "OPERATOR" },
    }),
    /CONFLICT/,
  );
  assert.equal(f.counts.saved, 1);
  assert.equal([...f.rows.values()][0].status, "AWAITING_REVIEW");
});
test("disappeared or revoked pending request cannot be shown as still saved", async () => {
  const f = fixture();
  await ready(f);
  await f.service.apply(f.context, f.session, f.input);
  [...f.rows.values()][0].active = false;
  await assert.rejects(f.service.status(f.context, f.session), /CONFLICT/);
});

test("inactive application is not revived or presented as a new application choice", async () => {
  const f = fixture();
  await ready(f);
  await f.service.apply(f.context, f.session, f.input);
  const record = [...f.rows.values()][0];
  record.active = false;
  f.session.stage = "RESOLVING";
  await f.service.resolve(f.context, f.session, [record]);
  assert.equal(f.session.stage, "APPLICATION_CLOSED");
  assert.equal(f.session.applications.length, 1);
  assert.equal(f.session.applications[0].canWithdraw, false);
  assert.equal(record.active, false);
  assert.deepEqual(f.session.applicationChoices, []);
});
test("one consumed proof cannot create a second unfinishable application draft", async () => {
  const f = fixture();
  f.enterprises.set("second", {
    ...f.enterprises.get("company"),
    code: "second",
    tenant: "secondTenant",
    name: "Second Company",
  });
  await ready(f);
  await f.service.apply(f.context, f.session, f.input);
  await assert.rejects(
    f.service.apply(f.context, f.session, {
      ...f.input,
      enterpriseCode: "second",
    }),
  );
  assert.equal(f.rows.size, 1);
  assert.equal(f.counts.saved, 1);
  assert.equal(f.counts.consumed, 1);
});

const processSource = require("../../../../nodics.process/modules/workflow/src/service/operation/defaultProcessRuntimeLifecycleService");
const claimSource = require("../../../../nodics.process/modules/workflow/src/service/operation/defaultProcessRemoteActionAdapterService");
const runtimeAuthority = require("../../../../nodics.foundation/modules/nAuth/src/service/identity/defaultServiceTokenService");
const scopeSource = require("../src/service/identity/defaultPrincipalScopeGovernanceService");
const authSource = require("../src/service/authentication/defaultAuthenticationProviderService");
const definitionSource =
  require("../data/init-v006/records/process/profileEmployeeApplicationReviewDefinitionData")
    .definitions[0];
async function reviewFixture() {
  const f = fixture();
  await ready(f);
  await f.service.apply(f.context, f.session, f.input);
  f.config.applications.review.enabled = true;
  f.config.applications.review.connectionName = "process";
  f.review = { ...reviewSource };
  global.SERVICE.DefaultEnterpriseApplicationReviewService = f.review;
  const originalGet = global.CONFIG.get;
  global.CONFIG.get = (key) =>
    key === "process"
      ? {
          runtime: {
            internalStarts: {
              enabled: true,
              permission: "process.instance.start.internal",
              allowedDefinitions: [definitionSource.code],
              maximumContextBytes: 16384,
            },
          },
        }
      : key === "principalAuthorizationScopes"
        ? properties.principalAuthorizationScopes
        : key === "identityGovernance"
          ? {
              migration: {
                groupTargets: {
                  reviewers: {
                    permissions: ["profile.enterpriseAccess.assign"],
                  },
                },
              },
            }
          : originalGet(key);
  const runtime = (name) => ({
    tokenType: "service",
    principalType: "service",
    serviceId: name,
    tenant: "companyTenant",
    entCode: "company",
    runtimeInstanceId: name,
    modules: ["profile", "workflow"],
    permissions: [
      "process.instance.start.internal",
      "profile.enterpriseAccess.applyDecision",
    ],
    runtimeScope: {
      instanceCode: name,
      projectCode: "project",
      environmentCode: "test",
      serverCode: name,
      assignmentCode: "grant",
    },
  });
  f.profileRuntime = runtime("profile-runtime");
  f.processRuntime = runtime("process-runtime");
  global.SERVICE.DefaultServiceTokenService = runtimeAuthority;
  f.reviewer = {
    kind: "Employee",
    tenant: "companyTenant",
    code: "reviewer",
    loginId: "reviewer@example.test",
    principalType: "human",
    active: true,
    _id: "reviewer-id",
    userGroups: ["reviewers"],
    userGroupCodes: ["reviewers"],
  };
  f.identities.push(f.reviewer);
  f.state = { locked: false };
  global.SERVICE.DefaultUserStateService = {
    findUserState: async () => f.state,
  };
  global.SERVICE.DefaultAuthenticationProviderService = { ...authSource };
  f.scopeRows = [
    {
      code: "reviewer-scope",
      principalType: "human",
      principalCode: f.reviewer.loginId,
      scopeType: "ENTERPRISE",
      scopeCode: "company",
      enterpriseCode: "company",
      tenantCode: "companyTenant",
      effect: "ALLOW",
      status: "ACTIVE",
      active: true,
      inheritanceMode: "DIRECT",
    },
  ];
  global.SERVICE.DefaultPrincipalScopeGovernanceService = { ...scopeSource };
  global.SERVICE.DefaultPrincipalScopeAssignmentService.get = async () => ({
    code: "SUC_DBS_00000",
    result: f.scopeRows,
  });
  f.instances = new Map();
  f.processWrites = 0;
  f.startCalls = 0;
  const field = (row, key) =>
    key.split(".").reduce((value, part) => value && value[part], row);
  const match = (row, query) =>
    Object.entries(query).every(([key, value]) =>
      value && typeof value === "object"
        ? Object.hasOwn(value, "$gt") && field(row, key) > value.$gt
        : field(row, key) === value,
    );
  const persistence = {
    get: async ({ query }) => ({
      code: "SUC_DBS_00000",
      result: [...f.instances.values()]
        .filter((row) => match(row, query))
        .map((row) => structuredClone(row)),
    }),
    save: async ({ model }) => {
      if (f.instances.has(model.code)) throw new Error("Duplicate");
      f.processWrites++;
      f.instances.set(model.code, structuredClone(model));
      return { result: structuredClone(model) };
    },
    update: async ({ query, model }) => {
      const row = f.instances.get(query.code);
      if (!row || !match(row, query)) return { result: { modifiedCount: 0 } };
      for (const [key, value] of Object.entries(model.$set)) {
        const parts = key.split(".");
        const last = parts.pop();
        let object = row;
        for (const part of parts) object = object[part];
        object[last] = value;
      }
      return { result: { modifiedCount: 1 } };
    },
  };
  const version = {
    definitionCode: definitionSource.code,
    version: 1,
    status: "PUBLISHED",
    policy: definitionSource.policy,
    graph: definitionSource.graph,
  };
  f.process = {
    ...processSource,
    definitionService: () => ({
      get: async () => ({
        code: "SUC_DBS_00000",
        result: [
          { ...definitionSource, status: "PUBLISHED", currentVersion: 1 },
        ],
      }),
    }),
    versionService: () => ({
      get: async () => ({ code: "SUC_DBS_00000", result: [version] }),
    }),
    instanceService: () => persistence,
    audit: async () => {},
    enterNode: async (request, instance) => {
      const current = f.instances.get(instance.code);
      current.status = "WAITING";
      current.currentNode = "review";
      return { instance: structuredClone(current) };
    },
  };
  global.SERVICE.DefaultProcessRuntimeLifecycleService = f.process;
  global.SERVICE.DefaultProcessInstanceService = persistence;
  global.SERVICE.DefaultModelsUpdateInitializerService = {
    getAffectedCount: (result) => result.result.modifiedCount,
  };
  global.SERVICE.DefaultModuleRegistrationAgentService = {
    assertModuleOperational: async () => {},
  };
  f.prepareDecision = (approved = true) => {
    const instance = [...f.instances.values()][0];
    const code = require("node:crypto").randomUUID();
    instance.activeRemoteAction = {
      code,
      status: "READY",
      actionKey: "profile.applyEmployeeApplicationDecision",
      runtimeInstanceId: "process-runtime",
      runtimeScope: f.processRuntime.runtimeScope,
      moduleName: "profile",
      enterpriseCode: "company",
      expiresAt: Date.now() + 60000,
      nodeCode: "applyDecision",
      taskCode: "review-task",
      context: structuredClone(instance.context),
      actor: f.reviewer.loginId,
      decision: { approved, reason: approved ? "" : "Not a team member" },
    };
    return {
      tenant: "companyTenant",
      authData: f.processRuntime,
      httpRequest: {
        body: { instanceCode: instance.code, executionCode: code },
      },
    };
  };
  global.SERVICE.DefaultModuleService = {
    invokeModule: async (command) => {
      assert.equal(command.local, false);
      assert.equal(command.maxAttempts, 1);
      assert.equal(command.requireInternalAuth, true);
      if (command.apiName === "/internal/instances") {
        f.startCalls++;
        const result = await f.process.startOwnedInstance({
          tenant: command.tenant,
          authData: f.profileRuntime,
          runtimeOperation: command.requestBody,
        });
        if (f.faults.startAfter) {
          f.faults.startAfter = false;
          throw new Error("Start response lost");
        }
        return result;
      }
      if (command.apiName.endsWith("/actions/claim"))
        return claimSource.claim({
          tenant: command.tenant,
          authData: f.profileRuntime,
          instanceCode: decodeURIComponent(command.apiName.split("/")[2]),
          runtimeOperation: command.requestBody,
        });
      if (command.apiName === "/internal/communications") {
        SERVICE.DefaultLoggerService.assertSensitiveRequest(command.request);
        assert.throws(() =>
          SERVICE.DefaultLoggerService.assertSensitiveRequest({
            ...command.request,
          }),
        );
        assert.equal(command.secureTransport.required, true);
        assert.equal(command.followRedirects, false);
        f.mailCommand = command;
        if (f.faults.mail) throw new Error("Provider unavailable");
        return { intentCode: "intent", status: "ACCEPTED" };
      }
      throw new Error("Unexpected module operation");
    },
  };
  f.record = () => [...f.rows.values()][0];
  return f;
}
test("review start composes actual internal admission and Process start with one immutable instance", async () => {
  const f = await reviewFixture();
  await f.review.start(f.context, f.session, f.record());
  await f.review.start(f.context, f.session, f.record());
  assert.equal(f.processWrites, 1);
  assert.equal(f.startCalls, 1);
  assert.equal(f.record().application.review.started, true);
  assert.equal(f.counts.identityWrites, 0);
});
test("lost Process start acknowledgement replays the same instance without another creation", async () => {
  const f = await reviewFixture();
  f.faults.startAfter = true;
  await assert.rejects(f.review.start(f.context, f.session, f.record()));
  await f.review.start(f.context, f.session, f.record());
  assert.equal(f.processWrites, 1);
  assert.equal(f.startCalls, 2);
});
for (const approved of [true, false])
  test(
    "authoritative " +
      (approved ? "approval" : "rejection") +
      " changes only application state",
    async () => {
      const f = await reviewFixture();
      await f.review.start(f.context, f.session, f.record());
      const result = await f.review.applyDecision(f.prepareDecision(approved));
      assert.equal(result.status, "COMPLETED");
      assert.equal(f.record().status, approved ? "APPROVED" : "REJECTED");
      assert.equal(f.counts.identityWrites, 0);
      assert.equal(f.record().registration, undefined);
      assert.equal(f.record().identityClaimed, undefined);
      if (approved)
        assert.equal(f.review.assertApprovedAssignment(f.record()), true);
      else
        assert.throws(() =>
          f.base.assertAssignment(f.record(), f.session.email),
        );
    },
  );
test("consumed Process handle cannot be replayed; a new claim for the same task does not repeat the decision write", async () => {
  const f = await reviewFixture();
  await f.review.start(f.context, f.session, f.record());
  const request = f.prepareDecision();
  await f.review.applyDecision(request);
  const writes = f.counts.updated;
  await assert.rejects(f.review.applyDecision(request));
  const replay = await f.review.applyDecision(f.prepareDecision());
  assert.equal(replay.output.replay, true);
  assert.equal(f.counts.updated, writes);
});
test("conflicting retry cannot reverse an already recorded decision", async () => {
  const f = await reviewFixture();
  await f.review.start(f.context, f.session, f.record());
  await f.review.applyDecision(f.prepareDecision());
  await assert.rejects(f.review.applyDecision(f.prepareDecision(false)));
  assert.equal(f.record().status, "APPROVED");
});
for (const fault of ["updateAfter", "updateBefore"])
  test(
    "decision " + fault + " respects exact saved-write evidence",
    async () => {
      const f = await reviewFixture();
      await f.review.start(f.context, f.session, f.record());
      const request = f.prepareDecision();
      f.faults[fault] = true;
      if (fault === "updateAfter") {
        await f.review.applyDecision(request);
        assert.equal(f.record().status, "APPROVED");
      } else {
        await assert.rejects(f.review.applyDecision(request));
        assert.equal(f.record().status, "AWAITING_REVIEW");
      }
    },
  );
for (const patch of [
  { active: false },
  { principalType: "customer" },
  { disabled: true },
  { registrationSuspended: true },
  { userGroups: [], userGroupCodes: [] },
])
  test(
    "live reviewer eligibility is rechecked: " + JSON.stringify(patch),
    async () => {
      const f = await reviewFixture();
      await f.review.start(f.context, f.session, f.record());
      const request = f.prepareDecision();
      Object.assign(f.reviewer, patch);
      await assert.rejects(f.review.applyDecision(request));
      assert.equal(f.record().status, "AWAITING_REVIEW");
    },
  );
for (const mode of [
  "locked",
  "missing-scope",
  "denied",
  "expired",
  "self-review",
])
  test("decision refuses " + mode, async () => {
    const f = await reviewFixture();
    await f.review.start(f.context, f.session, f.record());
    if (mode === "locked") f.state.locked = true;
    if (mode === "missing-scope") f.scopeRows = [];
    if (mode === "denied")
      f.scopeRows.push({ ...f.scopeRows[0], code: "deny", effect: "DENY" });
    if (mode === "expired") f.scopeRows[0].effectiveTo = "2000-01-01T00:00:00Z";
    const request = f.prepareDecision();
    if (mode === "self-review")
      [...f.instances.values()][0].activeRemoteAction.actor = f.session.email;
    await assert.rejects(f.review.applyDecision(request));
    assert.equal(f.record().status, "AWAITING_REVIEW");
  });
for (const field of ["approved", "roleCode", "tenantCode", "decision"])
  test("callback body cannot supply " + field, async () => {
    const f = await reviewFixture();
    await f.review.start(f.context, f.session, f.record());
    const request = f.prepareDecision();
    request.httpRequest.body[field] = true;
    await assert.rejects(f.review.applyDecision(request));
    assert.equal(f.record().status, "AWAITING_REVIEW");
  });
for (const field of ["requestHash", "enterpriseCode", "requestedBy"])
  test("Process context must match application " + field, async () => {
    const f = await reviewFixture();
    await f.review.start(f.context, f.session, f.record());
    const request = f.prepareDecision();
    [...f.instances.values()][0].activeRemoteAction.context[field] =
      "different";
    await assert.rejects(f.review.applyDecision(request));
    assert.equal(f.record().status, "AWAITING_REVIEW");
  });
test("changed enterprise policy blocks a previously started review", async () => {
  const f = await reviewFixture();
  await f.review.start(f.context, f.session, f.record());
  const request = f.prepareDecision();
  f.enterprises.get("company").employeeApplicationPolicy.enabled = false;
  await assert.rejects(f.review.applyDecision(request));
});
test("approval does not consume the application proof again for registration", async () => {
  const f = await reviewFixture();
  await f.review.start(f.context, f.session, f.record());
  await f.review.applyDecision(f.prepareDecision());
  const result = await f.service.status(f.context, f.session);
  assert.equal(result.stage, "APPLICATION_APPROVED");
  assert.equal(f.counts.consumed, 1);
  assert.doesNotThrow(() =>
    f.base.assertAssignment(f.record(), f.session.email),
  );
});
test("application intake can be disabled without invalidating an already recorded approval", async () => {
  const f = await reviewFixture();
  await f.review.start(f.context, f.session, f.record());
  await f.review.applyDecision(f.prepareDecision());
  f.config.applications.enabled = false;
  f.config.applications.review.enabled = false;
  assert.doesNotThrow(() =>
    f.base.assertAssignment(f.record(), f.session.email),
  );
});
for (const fault of [false, true])
  test(
    "decision notification " +
      (fault
        ? "failure preserves approval"
        : "uses existing idempotent Communication transport"),
    async () => {
      const f = await reviewFixture();
      f.config.applications.review.mail.enabled = true;
      f.faults.mail = fault;
      await f.review.start(f.context, f.session, f.record());
      const result = await f.review.applyDecision(f.prepareDecision());
      assert.equal(f.record().status, "APPROVED");
      assert.equal(
        result.output.notification,
        fault ? "UNCONFIRMED" : "ACCEPTED",
      );
      assert.equal(
        f.mailCommand.requestBody.purpose,
        "EMPLOYEE_APPLICATION_OUTCOME",
      );
      assert.equal(
        f.mailCommand.requestBody.recipientAddressReference,
        f.session.email,
      );
      assert.equal(f.mailCommand.requestBody.variables.decision, "APPROVED");
      assert.ok(
        !JSON.stringify(f.mailCommand.requestBody).includes("controlled-proof"),
      );
      assert.equal(f.counts.identityWrites, 0);
    },
  );
test("callback route admits service handles only and no caller-owned approval fields", () => {
  const route = require("../src/router/routers").profile.loadDefaults
    .applyEmployeeApplicationDecision;
  assert.deepEqual(route.authTokenTypes, ["service"]);
  assert.equal(route.secured, true);
  assert.deepEqual(
    Object.keys(
      route.requestBody.content["application/json"].schema.properties,
    ).sort(),
    ["executionCode", "instanceCode"],
  );
  const manifest = require("../data/manifest.json").sections
    .employeeApplicationReview;
  assert.equal(manifest.installer, "PROCESS_DEFINITION");
  assert.equal(manifest.destinationRole, "PROCESS");
});
