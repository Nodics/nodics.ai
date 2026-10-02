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
 * @module profile/test/enterpriseAdministrationConsentContract
 * @description Deferred static-owned fixtures for explicit consent ceilings, private read/write admission, redaction and stale authority rejection.
 * @layer test
 * @owner profile
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const source = require("../src/service/enterprise/defaultEnterpriseAdministrationConsentService");
const crypto = require("node:crypto");

// These fixtures are authored for joint acceptance; this source session does not execute them.

function fixture() {
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
  };
  const policy = {
    enabled: true,
    enforcementQualified: true,
    maximumGrants: 2,
    maximumLifetimeDays: 30,
    permission: "manage",
    allowedRoleCodes: ["VIEWER"],
    creationDefault: false,
    administratorRoleCodes: ["ENTERPRISE_ADMIN"],
    onwardQualified: false,
    maximumDelegationDepth: 4,
  };
  const epoch = { enabled: true, qualified: true, version: 2 };
  const m = {
    policy: () => ({}),
    paths: (model) => Object.keys(model),
    digest: (value) =>
      crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex"),
    authority: () => "authority",
    base: () => ({
      input: (value, keys) => {
        assert.ok(Object.keys(value).every((key) => keys.includes(key)));
        return value;
      },
    }),
  };
  global.CONFIG = {
    get: (key) =>
      key === "enterpriseManagement.administrationConsent"
        ? policy
        : key === "enterpriseManagement.administrationConsent.enabled"
          ? policy.enabled
          : undefined,
  };
  global.SERVICE = {
    DefaultEnterpriseMembershipService: m,
    DefaultAuthSecurityService: {
      getAuthorizationPolicyVersion: () => {
        if (!epoch.enabled) return undefined;
        if (!epoch.qualified) throw new CLASSES.NodicsError("ERR_AUTH_00001");
        return epoch.version;
      },
    },
  };
  return { owner: { ...source }, policy, m, epoch };
}
test("consent qualification is independent from creation default and a parent field", () => {
  const f = fixture();
  f.policy.enforcementQualified = false;
  assert.throws(() => f.owner.policy(), {
    code: "ERR_PROFILE_CONSENT_UNAVAILABLE",
  });
});

test("stamp registration requires exact typed readback, not a truthy or failed cache response", async () => {
  const { owner } = fixture();
  const writes = [],
    reads = [];
  SERVICE.DefaultPrincipalSecurityStampService = {
    register: async (...args) => {
      writes.push(args);
      return false;
    },
    validateBindings: async (bindings) => {
      reads.push(bindings);
      return false;
    },
  };
  await assert.rejects(
    owner.register("child", { code: "grant", revision: 3 }),
    { code: "ERR_PROFILE_CONSENT_CONFLICT" },
  );
  assert.equal(writes.length, 1);
  assert.equal(reads[0][0].authVersion, 3);
  SERVICE.DefaultPrincipalSecurityStampService.register = async () => {
    throw new Error("lost cache acknowledgement");
  };
  SERVICE.DefaultPrincipalSecurityStampService.validateBindings = async () =>
    true;
  await owner.register("child", { code: "grant", revision: 3 });
});

test("external dependency invalidation revokes exact source plus onward children and preserves independent grants", async () => {
  const { owner } = fixture();
  const original = {
    code: "child",
    active: false,
    administrationConsent: {
      version: 1,
      revision: 5,
      grants: [
        {
          code: "origin",
          revision: 2,
          status: "ACTIVE",
          sourceEnterpriseCode: "parent",
        },
        {
          code: "derived",
          revision: 4,
          status: "ACTIVE",
          parentProof: { code: "origin", revision: 2 },
        },
        {
          code: "independent",
          revision: 8,
          status: "ACTIVE",
          sourceEnterpriseCode: "other",
        },
      ],
    },
  };
  owner.dependencyRows = async () => [structuredClone(original)];
  let committed;
  owner.persist = async (target, state, inactive) => {
    assert.equal(inactive, true);
    assert.equal(target.active, false);
    committed = state;
    return { ...target, administrationConsent: state };
  };
  const stamps = [];
  owner.register = async (target, grant) =>
    stamps.push([target, grant.code, grant.revision]);
  await owner.invalidateMutationDependencies(
    { enterprises: ["parent"], assignments: [], identities: [] },
    {
      id: "a".repeat(48),
      schema: "enterprise",
      at: "2026-10-01T00:00:00.000Z",
    },
  );
  assert.equal(committed.revision, 6);
  assert.deepEqual(
    committed.grants.map((grant) => [grant.code, grant.status, grant.revision]),
    [
      ["origin", "REVOKED", 3],
      ["derived", "REVOKED", 5],
      ["independent", "ACTIVE", 8],
    ],
  );
  assert.deepEqual(stamps, [
    ["child", "origin", 3],
    ["child", "derived", 5],
  ]);
  assert.equal(original.administrationConsent.grants[0].status, "ACTIVE");
});

test("generated mutation capture is private, default-off and reconciles newly saved rows", async () => {
  const { owner, policy } = fixture();
  SERVICE.DefaultEmployeeService = {};
  const request = {
    tenant: "staff",
    schemaModel: { schemaName: "employee" },
    model: { code: "new-admin" },
  };
  owner.dependencyRows = async () =>
    assert.fail("unqualified hook must not read/write");
  await assert.rejects(owner.prepareExternalMutation(request), {
    code: "ERR_PROFILE_CONSENT_UNAVAILABLE",
  });
  policy.externalInvalidationQualified = true;
  const queries = [],
    subjects = [];
  let stored = false;
  owner.dependencyRows = async (service, tenant, query) => {
    queries.push(structuredClone(query));
    return stored ? [{ _id: "fresh", code: "new-admin" }] : [];
  };
  owner.mutationDependencies = async (input, before, after = []) => {
    subjects.push({ before, after });
    return { enterprises: [], assignments: [], identities: [] };
  };
  owner.invalidateMutationDependencies = async () => {};
  await owner.prepareExternalMutation(request);
  await assert.rejects(
    owner.finalizeExternalMutation({ ...request, receipt: "forged" }),
    { code: "ERR_PROFILE_CONSENT_CONFLICT" },
  );
  stored = true;
  await owner.finalizeExternalMutation(request);
  assert.deepEqual(queries[1], { code: { $in: ["new-admin"] } });
  assert.equal(subjects[1].after[0]._id, "fresh");
  await assert.rejects(owner.finalizeExternalMutation(request), {
    code: "ERR_PROFILE_CONSENT_CONFLICT",
  });
});

test("external hooks retain pre-invalidation when source write fails and never manufacture source success", async () => {
  const { owner, policy } = fixture();
  policy.externalInvalidationQualified = true;
  SERVICE.DefaultEmployeeService = {};
  owner.dependencyRows = async () => [{ _id: "old", code: "admin" }];
  owner.mutationDependencies = async () => ({
    enterprises: [],
    assignments: [],
    identities: [],
  });
  let revoked = false;
  owner.invalidateMutationDependencies = async () => {
    revoked = true;
  };
  const request = {
    tenant: "staff",
    schemaModel: { schemaName: "employee" },
    query: { code: "admin" },
    model: { active: false },
  };
  await owner.prepareExternalMutation(request);
  // Simulate a generated writer failing before the post hook, without replaying it.
  assert.equal(revoked, true);
  assert.equal(request.receipt, undefined);
});

test("external mutation hook refuses versioned, empty and malformed selectors before dependency reads or writes", async () => {
  for (const variant of [
    { schemaModel: { schemaName: "employee", versioned: true } },
    {
      schemaModel: {
        schemaName: "employee",
        rawSchema: { isVersionedEnabled: true },
      },
    },
    { schemaModel: { schemaName: "employee", versioned: "true" } },
    { query: {} },
    { query: [] },
    { query: null },
  ]) {
    const f = fixture();
    f.policy.externalInvalidationQualified = true;
    SERVICE.DefaultEmployeeService = {};
    f.owner.dependencyRows = async () =>
      assert.fail("unsupported source must not inventory or invalidate rights");
    f.owner.invalidateMutationDependencies = async () =>
      assert.fail("unsupported source must not write");
    await assert.rejects(
      f.owner.prepareExternalMutation({
        tenant: "staff",
        schemaModel: { schemaName: "employee" },
        query: { code: "admin" },
        model: { code: "admin" },
        ...variant,
      }),
      {
        code: variant.schemaModel
          ? "ERR_PROFILE_CONSENT_UNAVAILABLE"
          : "ERR_PROFILE_CONSENT_CONFLICT",
      },
    );
  }
});

test("generated save child capture reconciles non-versioned replacement IDs through original selector", async () => {
  const f = fixture();
  f.policy.externalInvalidationQualified = true;
  SERVICE.DefaultEmployeeService = {};
  const request = {
    tenant: "staff",
    schemaModel: { schemaName: "employee" },
    query: { code: "admin" },
    model: { code: "admin" },
  };
  let stored = false;
  const queries = [],
    observed = [];
  f.owner.dependencyRows = async (owner, tenant, query) => {
    queries.push(query);
    return [{ _id: stored ? "new-id" : "old-id", code: "admin" }];
  };
  f.owner.mutationDependencies = async (input, before, after = []) => {
    observed.push({ before, after });
    return { enterprises: [], assignments: [], identities: [] };
  };
  f.owner.invalidateMutationDependencies = async () => {};
  await f.owner.prepareExternalMutation(request);
  stored = true;
  await f.owner.finalizeExternalMutation(request);
  assert.deepEqual(queries[1], {
    $or: [{ _id: { $in: ["old-id"] } }, { code: "admin" }],
  });
  assert.equal(observed[1].before[0]._id, "old-id");
  assert.equal(observed[1].after[0]._id, "new-id");
});

test("post mutation rechecks qualification/version metadata and does not accept a changed bulk child request", async () => {
  for (const defect of ["qualification", "version", "clone"]) {
    const f = fixture();
    f.policy.externalInvalidationQualified = true;
    SERVICE.DefaultEmployeeService = {};
    f.owner.dependencyRows = async () => [{ _id: "old", code: "admin" }];
    f.owner.mutationDependencies = async () => ({
      enterprises: [],
      assignments: [],
      identities: [],
    });
    let invalidations = 0;
    f.owner.invalidateMutationDependencies = async () => {
      invalidations++;
    };
    const request = {
      tenant: "staff",
      schemaModel: { schemaName: "employee" },
      query: { code: "admin" },
      model: { active: false },
    };
    await f.owner.prepareExternalMutation(request);
    if (defect === "qualification")
      f.policy.externalInvalidationQualified = false;
    if (defect === "version") request.schemaModel.versioned = true;
    await assert.rejects(
      f.owner.finalizeExternalMutation(
        defect === "clone" ? { ...request } : request,
      ),
      {
        code:
          defect === "clone"
            ? "ERR_PROFILE_CONSENT_CONFLICT"
            : "ERR_PROFILE_CONSENT_UNAVAILABLE",
      },
    );
    assert.equal(invalidations, 1);
  }
});

test("bounded inventory composes Enterprise private read admission and refuses oversized evidence", async () => {
  const { owner } = fixture();
  const enterprise = (SERVICE.DefaultEnterpriseService = {
    get: async () => ({ code: "SUC_GET", result: [], count: 101 }),
  });
  let admitted = 0;
  SERVICE.DefaultEnterpriseTeamAdministrationService = {
    readEnterpriseEnvelope: async (selected, request, execute) => {
      assert.equal(selected, enterprise);
      admitted++;
      return execute();
    },
  };
  SERVICE.DefaultPrincipalSecurityStampGovernanceService = {
    inventory: async (selected, tenant, query) =>
      (await selected.get({ tenant, query })).result,
  };
  await assert.rejects(owner.dependencyRows(enterprise, "authority", {}), {
    code: "ERR_PROFILE_CONSENT_UNAVAILABLE",
  });
  assert.equal(admitted, 1);
});

test("mutation subject capture includes old/new credential references, scopes and inherited groups", async () => {
  const { owner, m } = fixture();
  Object.assign(m, {
    identity: (value) => value,
    locator: (tenant, kind, person) => ({
      tenantCode: tenant,
      recordKind: kind,
      recordId: person._id,
    }),
    recordId: (value) => value,
  });
  const employees = (SERVICE.DefaultEmployeeService = {}),
    passwords = (SERVICE.DefaultPasswordService = {}),
    assignments = (SERVICE.DefaultEnterpriseAccessAssignmentService = {}),
    groups = (SERVICE.DefaultUserGroupService = {}),
    scopes = (SERVICE.DefaultPrincipalScopeAssignmentService = {});
  SERVICE.DefaultPrincipalSecurityStampGovernanceService = {
    getAffectedGroupCodes: (rows, code) => [code, "inherited"],
  };
  const lookups = [];
  owner.dependencyRows = async (selected, tenant, query) => {
    lookups.push({ selected, tenant, query });
    if (selected === employees) return [{ _id: "admin", loginId: "current" }];
    if (selected === assignments) return [{ code: "assignment" }];
    if (selected === groups) return [{ code: "changed" }];
    return [];
  };
  const credential = await owner.mutationDependencies(
    {
      tenant: "staff",
      schemaModel: { schemaName: "password" },
      model: { loginId: "new-login" },
    },
    [{ _id: "old-password", loginId: "old-login" }],
  );
  assert.deepEqual(lookups[0].query.$or, [
    { loginId: { $in: ["old-login", "new-login"] } },
    { password: { $in: ["old-password"] } },
  ]);
  assert.equal(credential.identities[0].recordId, "admin");
  const scope = await owner.mutationDependencies(
    {
      tenant: "staff",
      schemaModel: { schemaName: "principalScopeAssignment" },
      model: { principalType: "human", principalCode: "new-admin" },
    },
    [{ principalType: "group", groupCode: "changed" }],
  );
  assert.deepEqual(scope.groups, ["changed", "inherited"]);
  assert.deepEqual(scope.assignments, ["assignment"]);
  assert.ok(passwords && scopes);
});

/** Creates exact committed revocation evidence with independently qualified repair authority for deferred recovery fixtures. @returns {Object} Isolated source fixture and inspected request. */
function repairFixture() {
  const f = fixture(),
    { owner, policy, m } = f;
  Object.assign(policy, {
    stampRepairQualified: true,
    stampRepairPermission: "repair",
    stampRepairPresentation: Object.fromEntries(
      [
        "title",
        "inspectLabel",
        "emptyMessage",
        "workingLabel",
        "reviewTitle",
        "confirmLabel",
        "cancelLabel",
        "uncertainMessage",
        "unavailableMessage",
        "recordedMessage",
        "grantLabel",
        "revisionLabel",
        "statusLabel",
      ].map((key) => [key, "Custom repair " + key]),
    ),
  });
  m.permission = () => {};
  SERVICE.DefaultEnterpriseService = { hierarchyReferenceCode: (code) => code };
  let target = {
    code: "child",
    active: true,
    administrationConsent: {
      version: 1,
      revision: 7,
      grants: [
        {
          code: "revoked",
          revision: 3,
          status: "REVOKED",
          revokedAt: "2026-10-01T00:00:00.000Z",
          revokedBy: { recordId: "lost-original-actor" },
        },
      ],
    },
  };
  const calls = { access: 0, stamps: [], audits: [] };
  owner.recoveryRecord = async () => structuredClone(target);
  owner.platformActor = async () => ({
    identity: { recordId: "fresh-platform-admin" },
  });
  owner.targetActor = async () => ({
    identity: { recordId: "fresh-target-admin" },
  });
  owner.command = async () => {
    calls.access++;
    assert.fail("stamp recovery must not replay access mutation");
  };
  owner.reparent = owner.command;
  owner.register = async (code, grant) =>
    calls.stamps.push([code, grant.code, grant.revision]);
  owner.persist = async (record, state, inactive) => {
    assert.equal(inactive, true);
    assert.equal(
      record.administrationConsent.revision,
      target.administrationConsent.revision,
    );
    calls.audits.push(structuredClone(state));
    target = { ...target, administrationConsent: structuredClone(state) };
    return structuredClone(target);
  };
  SERVICE.DefaultPrincipalSecurityStampService = {
    validateBindings: async () => true,
  };
  const request = {
    authData: { entCode: "default" },
    body: {
      enterpriseCode: "child",
      revision: 7,
      operationId: "repair_1",
      grantCodes: ["revoked"],
    },
  };
  return {
    ...f,
    request,
    calls,
    current: () => target,
    replace: (value) => {
      target = value;
    },
  };
}

test("repair inspection is bounded/redacted and platform can inspect committed invalidation on an inactive held child", async () => {
  const f = repairFixture();
  f.current().active = false;
  f.current().administrationHierarchyOperation = {
    phase: "PENDING",
    actor: { recordId: "lost" },
    hash: "private",
  };
  f.current().administrationConsent.grants[0].revokedBy = undefined;
  f.current().administrationConsent.grants[0].invalidation = {
    owner: "profile.administrationConsent",
    reason: "SOURCE_MUTATION",
    mutationId: "a".repeat(48),
  };
  const inspection = await f.owner.inspectCommittedStamps({
    authData: f.request.authData,
    params: { enterpriseCode: "child" },
  });
  assert.deepEqual(inspection.grants, [
    { code: "revoked", revision: 3, status: "REVOKED", canRepair: true },
  ]);
  assert.equal(inspection.revision, 7);
  assert.equal(JSON.stringify(inspection).includes("private"), false);
  assert.equal(JSON.stringify(inspection).includes("mutationId"), false);
  await f.owner.repairCommittedStamps(f.request);
  assert.equal(f.current().active, false);
  assert.equal(f.current().administrationHierarchyOperation.phase, "PENDING");
  assert.equal(f.calls.access, 0);
});

test("fresh actor loss after stamping cannot create a completion audit or clear a hierarchy fence", async () => {
  const f = repairFixture();
  f.current().administrationHierarchyOperation = {
    phase: "PENDING",
    id: "held",
  };
  f.owner.register = async () => {
    f.owner.platformActor = async () => {
      throw new CLASSES.NodicsError("ACTOR_LOST");
    };
  };
  await assert.rejects(f.owner.repairCommittedStamps(f.request), {
    code: "ACTOR_LOST",
  });
  assert.equal(f.calls.audits.length, 0);
  assert.equal(f.current().administrationHierarchyOperation.id, "held");
  assert.equal(f.current().administrationConsent.grants[0].status, "REVOKED");
});

test("fresh platform or target administration repairs committed stamps after original actor loss without altering rights", async () => {
  for (const context of ["default", "child"]) {
    const f = repairFixture();
    f.request.authData.entCode = context;
    const before = structuredClone(f.current().administrationConsent.grants);
    const result = await f.owner.repairCommittedStamps(f.request);
    assert.equal(result.status, "COMPLETE");
    assert.equal(result.revision, 8);
    assert.deepEqual(f.current().administrationConsent.grants, before);
    assert.equal(
      f.current().administrationConsent.stampRepair.completedBy.recordId,
      context === "child" ? "fresh-target-admin" : "fresh-platform-admin",
    );
    assert.equal(f.calls.access, 0);
    assert.deepEqual(f.calls.stamps, [["child", "revoked", 3]]);
    const again = await f.owner.repairCommittedStamps(f.request);
    assert.equal(again.revision, 8);
    assert.equal(f.calls.audits.length, 1);
    assert.equal(JSON.stringify(result).includes("recordId"), false);
  }
});

test("repair qualification, explicit permission and non-ancestor admission remain separate", async () => {
  const f = repairFixture();
  f.policy.stampRepairQualified = false;
  await assert.rejects(f.owner.repairCommittedStamps(f.request), {
    code: "ERR_PROFILE_CONSENT_UNAVAILABLE",
  });
  f.policy.stampRepairQualified = true;
  f.m.permission = () => {
    throw new CLASSES.NodicsError("DENIED");
  };
  await assert.rejects(f.owner.repairCommittedStamps(f.request), {
    code: "DENIED",
  });
  f.m.permission = () => {};
  f.request.authData.entCode = "parent";
  f.owner.platformActor = async () => {
    throw new CLASSES.NodicsError("NOT_PLATFORM");
  };
  f.owner.targetActor = async () =>
    assert.fail("ancestor must not enter target admission");
  await assert.rejects(f.owner.repairCommittedStamps(f.request), {
    code: "NOT_PLATFORM",
  });
  assert.equal(f.calls.stamps.length, 0);
});

test("later explicit repairs retain completed audit and never overwrite an unresolved marker or truncate history", async () => {
  const f = repairFixture();
  await f.owner.repairCommittedStamps(f.request);
  const previous = structuredClone(
    f.current().administrationConsent.stampRepair,
  );
  f.request.body.revision = 8;
  f.request.body.operationId = "repair_2";
  await f.owner.repairCommittedStamps(f.request);
  assert.deepEqual(f.current().administrationConsent.stampRepairHistory, [
    previous,
  ]);
  f.current().administrationConsent.stampRepair.phase = "PENDING";
  f.request.body.revision = 9;
  f.request.body.operationId = "repair_3";
  const count = f.calls.stamps.length;
  await assert.rejects(f.owner.repairCommittedStamps(f.request), {
    code: "ERR_PROFILE_CONSENT_CONFLICT",
  });
  assert.equal(f.calls.stamps.length, count);
  f.current().administrationConsent.stampRepair.phase = "COMPLETE";
  f.current().administrationConsent.stampRepairHistory = Array.from(
    { length: 100 },
    () => structuredClone(previous),
  );
  await assert.rejects(f.owner.repairCommittedStamps(f.request), {
    code: "ERR_PROFILE_CONSENT_CONFLICT",
  });
  assert.equal(
    f.current().administrationConsent.stampRepairHistory.length,
    100,
  );
  assert.equal(f.calls.stamps.length, count);
});

test("repair refuses stale active authority and accepts no browser-supplied security version", async () => {
  const f = repairFixture();
  f.current().administrationConsent.grants[0].status = "ACTIVE";
  f.owner.validate = async () => {
    throw new CLASSES.NodicsError("STALE_EPOCH");
  };
  await assert.rejects(f.owner.repairCommittedStamps(f.request), {
    code: "STALE_EPOCH",
  });
  assert.equal(f.calls.stamps.length, 0);
  f.request.body.authVersion = 99;
  await assert.rejects(f.owner.repairCommittedStamps(f.request));
  assert.equal(f.calls.audits.length, 0);
});

test("public repair command refuses mismatched targets and malformed exact DTO before owner reads or writes", async () => {
  const variants = [
    { params: { enterpriseCode: "other" } },
    { params: { enterpriseCode: "" } },
    { body: { enterpriseCode: { code: "child" } } },
    { body: { revision: 0 } },
    { body: { revision: 2147483648 } },
    { body: { revision: 7.5 } },
    { body: { operationId: 123 } },
    { body: { operationId: "invalid command" } },
    { body: { operationId: "a".repeat(129) } },
    { body: { grantCodes: [] } },
    { body: { grantCodes: ["revoked", "revoked"] } },
    { body: { grantCodes: ["bad selector*"] } },
    { body: { grantCodes: ["a".repeat(321)] } },
    {
      body: {
        grantCodes: Array.from({ length: 101 }, (_, index) => "grant_" + index),
      },
    },
    { body: { identity: { recordId: "canonical" } } },
    { body: { authVersion: 3 } },
    { query: { tenant: "other" } },
  ];
  for (const variant of variants) {
    const f = repairFixture();
    const request = {
      ...f.request,
      ...variant,
      body: { ...f.request.body, ...variant.body },
    };
    f.owner.recoveryRecord = async () =>
      assert.fail("invalid public DTO must not read retained owner evidence");
    await assert.rejects(f.owner.repairCommittedStamps(request));
    assert.equal(f.calls.stamps.length, 0);
    assert.equal(f.calls.audits.length, 0);
  }
});

test("repair inspection exact DTO retains stored status and refuses query/body locators", async () => {
  const f = repairFixture();
  f.current().administrationConsent.grants.push({
    code: "expired-active",
    revision: 2,
    status: "ACTIVE",
    expiresAt: "2000-01-01T00:00:00.000Z",
    identity: { recordId: "private" },
    actions: ["MANAGE_ACCESS"],
    grantingAuthority: { authorizationPolicyVersion: 1 },
  });
  f.owner.validate = async () => {
    throw new CLASSES.NodicsError("EXPIRED");
  };
  const request = {
    authData: f.request.authData,
    params: { enterpriseCode: "child" },
  };
  const result = await f.owner.inspectCommittedStamps(request);
  assert.deepEqual(Object.keys(result).sort(), [
    "enterpriseCode",
    "grants",
    "kind",
    "presentation",
    "revision",
    "version",
  ]);
  assert.equal(result.kind, "ENTERPRISE_ADMINISTRATION_STAMP_REPAIR");
  assert.equal(result.grants[1].status, "ACTIVE");
  assert.equal(result.grants[1].canRepair, false);
  assert.deepEqual(Object.keys(result.grants[1]).sort(), [
    "canRepair",
    "code",
    "revision",
    "status",
  ]);
  assert.equal(JSON.stringify(result).includes("private"), false);
  for (const extra of [
    { body: { identity: "private" } },
    { query: { enterpriseCode: "other" } },
    { params: {} },
  ]) {
    await assert.rejects(
      f.owner.inspectCommittedStamps({ ...request, ...extra }),
    );
  }
  assert.equal(f.calls.stamps.length, 0);
});

test("repair-specific presentation projects exact configured text without mutating or retaining the policy object", async () => {
  const f = repairFixture();
  const result = await f.owner.inspectCommittedStamps({
    authData: f.request.authData,
    params: { enterpriseCode: "child" },
  });
  assert.deepEqual(result.presentation, f.policy.stampRepairPresentation);
  assert.notEqual(result.presentation, f.policy.stampRepairPresentation);
  result.presentation.title = "Changed consumer copy";
  assert.equal(f.policy.stampRepairPresentation.title, "Custom repair title");
  f.policy.stampRepairPresentation.title = "Project repair override";
  assert.equal(
    f.owner.stampRepairPresentation().title,
    "Project repair override",
  );
  f.policy.stampRepairPresentation.title = "t".repeat(160);
  f.policy.stampRepairPresentation.statusLabel = "s".repeat(500);
  assert.equal(f.owner.stampRepairPresentation().title.length, 160);
  assert.equal(f.owner.stampRepairPresentation().statusLabel.length, 500);
  assert.equal(f.calls.stamps.length, 0);
});

test("repair presentation rejects missing, unknown, blank, non-string and oversized configuration before owner reads", async () => {
  const keys = [
    "title",
    "inspectLabel",
    "emptyMessage",
    "workingLabel",
    "reviewTitle",
    "confirmLabel",
    "cancelLabel",
    "uncertainMessage",
    "unavailableMessage",
    "recordedMessage",
    "grantLabel",
    "revisionLabel",
    "statusLabel",
  ];
  const variants = [
    undefined,
    null,
    [],
    {},
    ...keys.flatMap((key) => [
      key,
      key + ":undefined",
      key + ":null",
      key + ":number",
      key + ":blank",
      key + ":oversize",
    ]),
    "html",
    "permission",
    "extra",
  ];
  for (const variant of variants) {
    const f = repairFixture();
    if (typeof variant !== "string") f.policy.stampRepairPresentation = variant;
    else if (["html", "permission", "extra"].includes(variant))
      f.policy.stampRepairPresentation[variant] = "Unapproved field";
    else {
      const [key, defect] = variant.split(":");
      if (!defect) delete f.policy.stampRepairPresentation[key];
      else
        f.policy.stampRepairPresentation[key] =
          defect === "undefined"
            ? undefined
            : defect === "null"
              ? null
              : defect === "number"
                ? 1
                : defect === "blank"
                  ? " \t "
                  : "x".repeat(key === "title" ? 161 : 501);
    }
    f.owner.recoveryRecord = async () =>
      assert.fail(
        "invalid display configuration must refuse before private record reads",
      );
    await assert.rejects(
      f.owner.inspectCommittedStamps({
        authData: f.request.authData,
        params: { enterpriseCode: "child" },
      }),
      { code: "ERR_PROFILE_CONSENT_UNAVAILABLE" },
    );
    assert.equal(f.calls.stamps.length, 0);
    assert.equal(f.calls.audits.length, 0);
  }
});

test("repair copy refuses accessor and hidden/symbol extensions without evaluating dynamic presentation", () => {
  for (const defect of ["accessor", "hidden", "symbol", "nonenumerable"]) {
    const f = repairFixture(),
      copy = f.policy.stampRepairPresentation;
    if (defect === "accessor")
      Object.defineProperty(copy, "title", {
        enumerable: true,
        get: () => assert.fail("presentation getters must never execute"),
      });
    if (defect === "hidden")
      Object.defineProperty(copy, "html", {
        value: "Hidden extension",
        enumerable: false,
      });
    if (defect === "symbol")
      copy[Symbol("authority")] = "Not a presentation field";
    if (defect === "nonenumerable")
      Object.defineProperty(copy, "title", {
        value: "Hidden title",
        enumerable: false,
      });
    assert.throws(() => f.owner.stampRepairPresentation(), {
      code: "ERR_PROFILE_CONSENT_UNAVAILABLE",
    });
  }
});

test("interrupted stamp repair remains explicitly recoverable without held lease or synthetic completion", async () => {
  const f = repairFixture();
  f.owner.register = async () => {
    throw new Error("cache unavailable");
  };
  await assert.rejects(
    f.owner.repairCommittedStamps(f.request),
    /cache unavailable/,
  );
  assert.equal(f.current().administrationConsent.revision, 7);
  assert.equal(f.current().administrationConsent.stampRepair, undefined);
  f.owner.register = async (code, grant) =>
    f.calls.stamps.push([code, grant.code, grant.revision]);
  f.owner.platformActor = async () => ({
    identity: { recordId: "different-fresh-admin" },
  });
  await f.owner.repairCommittedStamps(f.request);
  assert.equal(
    f.current().administrationConsent.stampRepair.completedBy.recordId,
    "different-fresh-admin",
  );
  assert.equal(f.calls.access, 0);
});

test("repair rejects concurrent state/epoch changes and never reports completed without cache confirmation", async () => {
  for (const defect of ["state", "epoch", "cache"]) {
    const f = repairFixture();
    if (defect === "cache")
      SERVICE.DefaultPrincipalSecurityStampService.validateBindings =
        async () => false;
    f.owner.register = async () => {
      if (defect === "state") f.current().administrationConsent.revision++;
      if (defect === "epoch") f.epoch.version++;
    };
    await assert.rejects(f.owner.repairCommittedStamps(f.request), {
      code: "ERR_PROFILE_CONSENT_CONFLICT",
    });
    assert.equal(f.calls.access, 0);
    if (defect !== "cache") assert.equal(f.calls.audits.length, 0);
  }
});
test("consent policy refuses absent, disabled, unqualified or malformed nAuth policy epochs", () => {
  for (const defect of [
    "owner",
    "disabled",
    "unqualified",
    "missing",
    "zero",
    "overflow",
  ]) {
    const { owner, epoch } = fixture();
    if (defect === "owner") delete SERVICE.DefaultAuthSecurityService;
    if (defect === "disabled") epoch.enabled = false;
    if (defect === "unqualified") epoch.qualified = false;
    if (defect === "missing") epoch.version = undefined;
    if (defect === "zero") epoch.version = 0;
    if (defect === "overflow") epoch.version = 2147483648;
    assert.throws(() => owner.policy(), {
      code:
        defect === "unqualified"
          ? "ERR_AUTH_00001"
          : "ERR_PROFILE_CONSENT_UNAVAILABLE",
    });
  }
});
test("unqualified epoch rejects consent persistence before any generated write", async () => {
  const { owner, epoch } = fixture();
  epoch.enabled = false;
  SERVICE.DefaultEnterpriseService = {
    update: async () => assert.fail("must not write without governed epoch"),
  };
  await assert.rejects(
    owner.persist({ code: "child" }, { revision: 1, grants: [] }),
    { code: "ERR_PROFILE_CONSENT_UNAVAILABLE" },
  );
  await assert.rejects(owner.persistHierarchy({ code: "child" }, {}, {}), {
    code: "ERR_PROFILE_CONSENT_UNAVAILABLE",
  });
  await assert.rejects(owner.sourceAuthority("parent", {}), {
    code: "ERR_PROFILE_CONSENT_UNAVAILABLE",
  });
});
test("native source policy changes and role restoration never revive grants retained under an older governed epoch", async () => {
  const { owner, epoch, m } = fixture();
  const identity = {
    tenantCode: "tenant",
    recordKind: "EMPLOYEE",
    recordId: "native",
  };
  const grantingAuthority = {
    code: "target-admin",
    authorizationPolicyVersion: 2,
    roleDigest: "ADMIN",
  };
  const recipientAuthority = {
    code: "source-admin",
    authorizationPolicyVersion: 2,
    roleDigest: "ADMIN",
  };
  const grant = {
    code: "retained-grant",
    revision: 1,
    status: "ACTIVE",
    expiresAt: new Date(Date.now() + 600000).toISOString(),
    sourceEnterpriseCode: "parent",
    grantingEnterpriseCode: "child",
    grantingAuthVersion: 1,
    grantedBy: identity,
    identity,
    grantingAuthority,
    recipientAuthority,
    roleCodes: ["VIEWER"],
    actions: ["VIEW"],
    recipients: ["approved@example.invalid"],
    relationship: [],
  };
  owner.enterprise = async () => ({
    code: "child",
    administrationConsent: { version: 1, revision: 1, grants: [grant] },
  });
  owner.relationship = async () => [];
  m.anchor = async () => ({ identity, person: { authVersion: 1 } });
  let currentRole = "ADMIN";
  owner.sourceAuthority = async (code) => ({
    ...(code === "child" ? grantingAuthority : recipientAuthority),
    authorizationPolicyVersion: epoch.version,
    roleDigest: currentRole,
  });
  SERVICE.DefaultEnterpriseManagementService = {
    rolePolicy: () => ({ delegable: true }),
    normalizeEmail: (value) => value,
  };
  const proof = {
    owner: "profile.administrationConsent",
    code: grant.code,
    revision: 1,
  };
  assert.equal((await owner.validate("child", proof)).code, grant.code);
  epoch.version = 3;
  currentRole = "RESTRICTED";
  await assert.rejects(owner.validate("child", proof), {
    code: "ERR_PROFILE_CONSENT_FORBIDDEN",
  });
  currentRole = "ADMIN";
  epoch.version = 4;
  await assert.rejects(owner.validate("child", proof), {
    code: "ERR_PROFILE_CONSENT_FORBIDDEN",
  });
  assert.equal(grant.recipientAuthority.authorizationPolicyVersion, 2);
  assert.equal(grant.grantingAuthority.authorizationPolicyVersion, 2);
  assert.equal(grant.status, "ACTIVE");
});
test("legacy proofs without either source or granting epoch are refused, never upgraded from current config", async () => {
  for (const missing of ["recipientAuthority", "grantingAuthority"]) {
    const { owner } = fixture();
    const grant = {
      code: "legacy",
      revision: 1,
      status: "ACTIVE",
      expiresAt: new Date(Date.now() + 600000).toISOString(),
      recipientAuthority: { authorizationPolicyVersion: 2 },
      grantingAuthority: { authorizationPolicyVersion: 2 },
    };
    delete grant[missing].authorizationPolicyVersion;
    owner.enterprise = async () => ({
      code: "child",
      administrationConsent: { version: 1, revision: 1, grants: [grant] },
    });
    owner.relationship = async () =>
      assert.fail("missing epoch must fail before resolving authority");
    await assert.rejects(
      owner.validate("child", {
        owner: "profile.administrationConsent",
        code: "legacy",
        revision: 1,
      }),
      { code: "ERR_PROFILE_CONSENT_FORBIDDEN" },
    );
  }
});
test("explicit ceilings reject wildcards, duplicate recipients and unbounded selections", () => {
  const { owner } = fixture();
  for (const values of [
    ["*"],
    ["VIEW", "VIEW"],
    [],
    ["VIEW", "INVITE", "MANAGE"],
  ])
    assert.throws(() => owner.selections(values, 2), {
      code: "ERR_PROFILE_CONSENT_CONFLICT",
    });
  assert.deepEqual(owner.selections(["VIEW", "INVITE"], 2), ["VIEW", "INVITE"]);
});
test("generic mutation flags never confer private write admission", () => {
  const { owner } = fixture();
  assert.throws(
    () =>
      owner.protect({
        isConsentOwner: true,
        model: { administrationConsent: {} },
      }),
    { code: "ERR_PROFILE_CONSENT_FORBIDDEN" },
  );
  assert.throws(
    () => owner.protect({ model: { superEnterprise: "new-parent" } }),
    { code: "ERR_PROFILE_CONSENT_FORBIDDEN" },
  );
});
test("public generated reads redact private provenance while exact transient owner reads retain it", async () => {
  const { owner } = fixture();
  const publicResponse = {
    success: {
      result: [
        {
          code: "child",
          administrationConsent: { secret: true },
          administrationHierarchyEpoch: 3,
        },
      ],
    },
  };
  owner.redact({}, publicResponse);
  assert.deepEqual(publicResponse.success.result, [{ code: "child" }]);
  const request = {},
    response = {
      success: { result: [{ administrationConsent: { revision: 1 } }] },
    };
  const retainedRow = response.success.result[0],
    retainedSuccess = response.success;
  await owner.read(
    {
      get: async (observed) => {
        assert.equal(observed, request);
        owner.redact(observed, response);
        return response;
      },
    },
    request,
  );
  assert.equal(response.success.result[0].administrationConsent.revision, 1);
  owner.redact(request, response);
  assert.equal(response.success.result[0].administrationConsent, undefined);
  assert.equal(retainedRow.administrationConsent.revision, 1);
  assert.equal(retainedSuccess.result[0], retainedRow);
  assert.notEqual(response.success, retainedSuccess);
  assert.notEqual(response.success.result[0], retainedRow);
});
test("absent state is not consent; projections never reveal identity or command hashes", () => {
  const { owner } = fixture();
  assert.deepEqual(owner.state({}), { revision: 0, grants: [] });
  const result = owner.project({
    code: "child",
    administrationConsent: {
      version: 1,
      revision: 1,
      command: { hash: "private" },
      grants: [
        {
          code: "grant",
          revision: 1,
          status: "ACTIVE",
          identity: { recordId: "private" },
          recipients: ["private"],
          grantedBy: "private",
        },
      ],
    },
  });
  assert.ok(!JSON.stringify(result).includes("private"));
});
test("failed private reads release exact admission and public redaction preserves the retained record", async () => {
  const { owner } = fixture(),
    request = {};
  const record = { code: "child", administrationConsent: { revision: 4 } };
  const response = { success: { result: [record] } };
  await assert.rejects(
    owner.read(
      {
        get: async (observed) => {
          owner.redact(observed, response);
          throw new Error("provider failure");
        },
      },
      request,
    ),
    /provider failure/,
  );
  owner.redact(request, response);
  assert.equal(response.success.result[0].administrationConsent, undefined);
  assert.equal(record.administrationConsent.revision, 4);
  assert.notEqual(response.success.result[0], record);
});
test("later member overrides remain effective in private read admission", async () => {
  const { owner } = fixture();
  let called = false;
  owner.enterprise = async () => {
    called = true;
    return { code: "child" };
  };
  owner.commandActor = async () => ({});
  assert.deepEqual(await owner.inspect({ authData: { entCode: "child" } }), {
    enterpriseCode: "child",
    revision: 0,
    grants: [],
  });
  assert.equal(called, true);
});
test("creation captures false once and refuses unapproved positive initialization before owner reads", async () => {
  const { owner, policy } = fixture();
  const created = await owner.prepareCreation({ code: "child" });
  assert.equal(created.administrationConsent.creationDefault, false);
  policy.creationDefault = true;
  assert.equal(created.administrationConsent.creationDefault, false);
  await assert.rejects(owner.prepareCreation({ code: "other" }), {
    code: "ERR_PROFILE_CONSENT_UNAVAILABLE",
  });
  await assert.rejects(
    owner.prepareCreation({ code: "other", administrationHierarchyEpoch: 0 }),
    { code: "ERR_PROFILE_CONSENT_FORBIDDEN" },
  );
});
test("appointed administrators need explicit configured classification, not a business role or permission", () => {
  const { owner, policy } = fixture();
  SERVICE.DefaultEnterpriseManagementService = {
    rolePolicy: () => ({ administrationClass: "ENTERPRISE_ADMIN" }),
  };
  const enterprise = { defaultAdminAssignmentCode: "designated" };
  assert.equal(
    owner.classifiedAdministrator(enterprise, { code: "designated" }),
    true,
  );
  assert.equal(
    owner.classifiedAdministrator(enterprise, {
      code: "appointed",
      roleCode: "ENTERPRISE_ADMIN",
    }),
    true,
  );
  assert.equal(
    owner.classifiedAdministrator(enterprise, {
      code: "business",
      roleCode: "PLATFORM_OWNER",
    }),
    false,
  );
  policy.administratorRoleCodes = [];
  assert.equal(
    owner.classifiedAdministrator(enterprise, {
      code: "appointed",
      roleCode: "ENTERPRISE_ADMIN",
    }),
    false,
  );
  policy.administratorRoleCodes = ["ENTERPRISE_ADMIN"];
  SERVICE.DefaultEnterpriseManagementService.rolePolicy = () => ({
    administrationClass: "OPERATOR",
  });
  assert.equal(
    owner.classifiedAdministrator(enterprise, {
      code: "appointed",
      roleCode: "ENTERPRISE_ADMIN",
    }),
    false,
  );
});
test("derived administrator assignment cannot appoint itself as an independent source administrator", () => {
  const { owner } = fixture();
  SERVICE.DefaultEnterpriseManagementService = {
    rolePolicy: () => ({ administrationClass: "ENTERPRISE_ADMIN" }),
  };
  assert.equal(
    owner.classifiedAdministrator(
      {},
      {
        code: "appointed",
        roleCode: "ENTERPRISE_ADMIN",
        invitationAuthority: { administrationConsent: { code: "dependent" } },
      },
    ),
    false,
  );
});
test("MANAGE_ACCESS is independently qualified and super-administrator roles cannot be delegated", () => {
  const { owner, policy } = fixture();
  SERVICE.DefaultEnterpriseManagementService = {
    rolePolicy: () => ({ delegable: true }),
    normalizeEmail: (value) => value.toLowerCase(),
  };
  const input = {
    roleCodes: ["VIEWER"],
    actions: ["MANAGE_ACCESS"],
    recipients: ["approved@example.invalid"],
  };
  assert.throws(() => owner.ceilings(input), {
    code: "ERR_PROFILE_CONSENT_FORBIDDEN",
  });
  policy.onwardQualified = true;
  assert.deepEqual(owner.ceilings(input).actions, ["MANAGE_ACCESS"]);
  SERVICE.DefaultEnterpriseManagementService.rolePolicy = () => ({
    delegable: true,
    administrationClass: "ENTERPRISE_ADMIN",
  });
  assert.throws(() => owner.ceilings(input), {
    code: "ERR_PROFILE_CONSENT_FORBIDDEN",
  });
});
test("explicit route target dispatch is effective and does not derive authority from the target name", async () => {
  const { owner } = fixture();
  owner.enterprise = async (code) => ({ code });
  assert.deepEqual(
    await owner.target({
      params: { enterpriseCode: "child" },
      authData: { entCode: "parent" },
    }),
    { code: "child" },
  );
  assert.deepEqual(await owner.target({ authData: { entCode: "self" } }), {
    code: "self",
  });
});
test("ancestor inspection excludes unrelated grant provenance and retains bounded dependent handles", () => {
  const { owner } = fixture();
  const target = {
    code: "child",
    administrationConsent: {
      version: 1,
      revision: 4,
      grants: [
        { code: "parent", revision: 1 },
        { code: "child-grant", revision: 1, parentProof: { code: "parent" } },
        { code: "independent", revision: 1, identity: "secret" },
      ],
    },
  };
  assert.deepEqual(
    owner
      .projectAuthorized(target, { parent: { code: "parent" } })
      .grants.map((grant) => grant.code),
    ["parent", "child-grant"],
  );
  assert.ok(
    !JSON.stringify(
      owner.projectAuthorized(target, { parent: { code: "parent" } }),
    ).includes("secret"),
  );
});
test("authorized row revocation options distinguish direct children from visible descendants without exposing proof", () => {
  const { owner } = fixture();
  const past = new Date(Date.now() - 60000).toISOString();
  const target = {
    code: "target",
    administrationConsent: {
      version: 1,
      revision: 3,
      grants: [
        { code: "parent", revision: 1, status: "ACTIVE" },
        {
          code: "direct",
          revision: 1,
          status: "ACTIVE",
          parentProof: { code: "parent", revision: 1 },
        },
        {
          code: "expired-direct",
          revision: 1,
          status: "ACTIVE",
          expiresAt: past,
          parentProof: { code: "parent", revision: 1 },
        },
        {
          code: "indirect",
          revision: 1,
          status: "ACTIVE",
          parentProof: { code: "direct", revision: 1 },
        },
        {
          code: "revoked",
          revision: 2,
          status: "REVOKED",
          parentProof: { code: "parent", revision: 1 },
        },
        { code: "independent", revision: 1, status: "ACTIVE" },
      ],
    },
  };
  const before = JSON.stringify(target);
  const parent = owner.projectAuthorized(target, {
    parent: { code: "parent" },
  });
  assert.deepEqual(
    parent.grants.map((grant) => [grant.code, grant.canRevoke]),
    [
      ["parent", false],
      ["direct", true],
      ["expired-direct", true],
      ["indirect", false],
      ["revoked", false],
    ],
  );
  assert.equal(
    parent.grants.find((grant) => grant.code === "expired-direct").status,
    "EXPIRED",
  );
  assert.ok(parent.grants.every((grant) => grant.parentProof === undefined));
  for (const authority of [
    { enterpriseCode: "target" },
    { platform: true, enterpriseCode: "default" },
  ]) {
    const result = owner.projectAuthorized(target, authority);
    assert.ok(
      result.grants
        .filter((grant) => grant.code !== "revoked")
        .every((grant) => grant.canRevoke),
    );
    assert.equal(
      result.grants.find((grant) => grant.code === "revoked").canRevoke,
      false,
    );
  }
  assert.equal(JSON.stringify(target), before);
});
test("cycles and excess onward depth fail before any owner lookup", async () => {
  const { owner } = fixture();
  await assert.rejects(
    owner.validate(
      "child",
      { owner: "profile.administrationConsent", code: "cycle", revision: 1 },
      ["cycle"],
    ),
    { code: "ERR_PROFILE_CONSENT_FORBIDDEN" },
  );
  await assert.rejects(
    owner.validate(
      "child",
      { owner: "profile.administrationConsent", code: "grant", revision: 1 },
      ["a", "b", "c", "d", "e"],
    ),
    { code: "ERR_PROFILE_CONSENT_FORBIDDEN" },
  );
});
test("invalid reparent epochs and parents cannot acquire the global graph fence", async () => {
  const { owner, policy, m } = fixture();
  policy.reparentQualified = true;
  m.permission = () => {};
  owner.platformActor = async () => ({ identity: { recordId: "actor" } });
  SERVICE.DefaultEnterpriseService = {
    hierarchyReferenceCode: (code) => code,
    hierarchy: async () => {
      throw new Error("invalid parent");
    },
  };
  owner.recoveryRecord = async () => ({
    code: "child",
    administrationHierarchyEpoch: 2,
  });
  let acquired = false;
  owner.acquireHierarchySerial = async () => {
    acquired = true;
  };
  await assert.rejects(
    owner.reparent({
      body: {
        enterpriseCode: "child",
        parentCode: "parent",
        epoch: 1,
        operationId: "reviewed_operation_1",
      },
    }),
    { code: "ERR_PROFILE_CONSENT_CONFLICT" },
  );
  await assert.rejects(
    owner.reparent({
      body: {
        enterpriseCode: "child",
        parentCode: "parent",
        epoch: 2,
        operationId: "reviewed_operation_1",
      },
    }),
    /invalid parent/,
  );
  assert.equal(acquired, false);
});
test("graph recovery never cancels or steals an unresolved child operation", async () => {
  const { owner, policy, m } = fixture();
  policy.reparentQualified = true;
  policy.hierarchyRecoveryQualified = true;
  policy.hierarchyRecoveryPermission = "recover";
  m.permission = () => {};
  owner.platformActor = async () => ({ identity: { recordId: "recovery" } });
  const serial = {
    id: "reviewed_operation_1",
    revision: 3,
    targetCode: "child",
    hash: "original",
    phase: "PENDING",
  };
  owner.recoveryRecord = async (code) =>
    code === "child"
      ? {
          code,
          administrationHierarchyOperation: { id: serial.id, phase: "PENDING" },
        }
      : { code, administrationHierarchySerialOperation: serial };
  owner.persistHierarchy = async () =>
    assert.fail("must not steal pending child");
  await assert.rejects(
    owner.recoverHierarchySerial({
      body: { enterpriseCode: "child", operationId: serial.id, revision: 3 },
    }),
    { code: "ERR_PROFILE_CONSENT_CONFLICT" },
  );
});
test("source authority reloads an accepted appointed administrator and refuses current account group loss", async () => {
  const { owner, m, epoch } = fixture();
  const identity = {
    tenantCode: "tenant",
    recordKind: "EMPLOYEE",
    recordId: "original",
  };
  const person = {
    loginId: "admin",
    authVersion: 3,
    userGroups: ["adminGroup"],
  };
  const item = {
    code: "appointed",
    enterpriseCode: "parent",
    tenantCode: "tenant",
    status: "REGISTERED",
    revision: 2,
    registeredLoginId: "admin",
    roleCode: "ENTERPRISE_ADMIN",
    groupCodes: ["adminGroup"],
  };
  owner.enterprise = async () => ({
    code: "parent",
    tenant: "tenant",
    defaultAdminAssignmentCode: "founder",
  });
  m.anchor = async () => ({ identity, person });
  m.inventory = async () => [item];
  m.assignment = async () => ({ item });
  m.read = async () => person;
  m.resolve = async () => ({ identity });
  m.groups = async () => [{ code: "adminGroup" }];
  m.permission = () => {};
  SERVICE.DefaultEnterpriseService = { hierarchyReferenceCode: (code) => code };
  SERVICE.DefaultEnterpriseManagementService = {
    rolePolicy: () => ({
      administrationClass: "ENTERPRISE_ADMIN",
      groupCodes: ["adminGroup"],
    }),
  };
  SERVICE.DefaultAuthenticationProviderService = {
    resolveSessionUserGroups: (value) => value.userGroups,
  };
  global.UTILS = { getUserGroupPermissions: () => ["manage"] };
  const retained = await owner.sourceAuthority("parent", identity);
  assert.equal(retained.code, "appointed");
  assert.equal(retained.authorizationPolicyVersion, 2);
  assert.equal(retained.sourceBindings, undefined);
  person.userGroups = [];
  await assert.rejects(owner.sourceAuthority("parent", identity), {
    code: "ERR_PROFILE_CONSENT_FORBIDDEN",
  });
  person.userGroups = ["adminGroup"];
  item.membership = { phase: "PREPARED", projectionId: "projection", identity };
  await assert.rejects(owner.sourceAuthority("parent", identity), {
    code: "ERR_PROFILE_CONSENT_FORBIDDEN",
  });
  delete item.membership;
  m.groups = async () => {
    epoch.version += 1;
    return [{ code: "adminGroup" }];
  };
  await assert.rejects(owner.sourceAuthority("parent", identity), {
    code: "ERR_PROFILE_CONSENT_CONFLICT",
  });
});
test("positive creation binds approved policy and only the ready immediate parent without creating records", async () => {
  const { owner, policy } = fixture();
  policy.creationDefault = true;
  policy.creationRights = {
    approved: true,
    approvalReference: "fixture-approval",
    roleCodes: ["VIEWER"],
    actions: ["VIEW"],
    recipients: ["approved@example.invalid"],
    lifetimeDays: 2,
  };
  const identity = {
    tenantCode: "tenant",
    recordKind: "EMPLOYEE",
    recordId: "original",
  };
  owner.platformActor = async () => ({ identity, person: { authVersion: 1 } });
  owner.sourceAuthority = async (code) => ({
    code: code + "_assignment",
    platformAdministrator: code === "default",
    authorizationPolicyVersion: 2,
  });
  owner.enterprise = async (code) => ({
    code,
    defaultAdminAssignmentCode: "parent-admin",
  });
  owner.assignmentRecipient = async () => ({ identity });
  owner.relationshipForParent = async () => [
    { code: "parent", tenantCode: "tenant", parentCode: undefined, epoch: 2 },
  ];
  SERVICE.DefaultEnterpriseService = { hierarchyReferenceCode: (code) => code };
  SERVICE.DefaultEnterpriseManagementService = {
    rolePolicy: () => ({ delegable: true }),
    normalizeEmail: (value) => value,
  };
  const model = await owner.prepareCreation(
    { code: "child", tenant: "child-tenant", superEnterprise: "parent" },
    {},
  );
  const grants = model.administrationConsent.grants;
  assert.equal(grants.length, 1);
  assert.equal(grants[0].sourceEnterpriseCode, "parent");
  assert.equal(grants[0].creationPolicy.approvalReference, "fixture-approval");
  assert.deepEqual(
    grants[0].relationship.map((row) => row.code),
    ["child", "parent"],
  );
});
test("versioned workspace is policy-presented, current-target-bound and exposes no canonical identity", async () => {
  const { owner, policy, m } = fixture();
  const keys = [
    "title",
    "grantLabel",
    "revokeLabel",
    "sourceLabel",
    "assignmentLabel",
    "roleLabel",
    "actionLabel",
    "recipientLabel",
    "expiryLabel",
    "confirmMessage",
    "uncertainMessage",
    "emptyMessage",
  ];
  policy.workspace = {
    version: 1,
    presentation: Object.fromEntries(keys.map((key) => [key, key])),
  };
  const target = {
    code: "child",
    administrationConsent: {
      version: 1,
      revision: 5,
      grants: [
        {
          code: "retained",
          revision: 1,
          status: "ACTIVE",
          identity: "secret-locator",
          grantedBy: "secret-locator",
        },
      ],
    },
  };
  let reads = 0;
  owner.target = async () => {
    reads += 1;
    return target;
  };
  owner.enterprise = async (code) => ({ code });
  owner.relationship = async () => [];
  owner.commandActor = async () => ({ actor: {} });
  m.inventory = async () => [];
  SERVICE.DefaultEnterpriseService = {
    hierarchy: async () => [{ code: "child" }, { code: "parent" }],
  };
  SERVICE.DefaultEnterpriseManagementService = {
    rolePolicy: () => ({ delegable: true }),
  };
  const result = await owner.workspace({ params: { enterpriseCode: "child" } });
  assert.equal(result.version, 1);
  assert.equal(result.kind, "ENTERPRISE_ADMINISTRATION_CONSENT");
  assert.equal(result.revision, 5);
  assert.equal(result.presentation.title, "title");
  assert.equal(result.mutation.recipientField, "recipientAssignmentCode");
  assert.ok(reads >= 3);
  assert.ok(!JSON.stringify(result).includes("secret-locator"));
  owner.enterprise = async (code) => ({
    code,
    name: { en: "Parent Enterprise" },
  });
  owner.classifiedAdministrator = () => true;
  let recipientReads = 0;
  owner.assignmentRecipient = async () => {
    recipientReads += 1;
    return {
      identity: "secret-locator",
      person: {
        name: { firstName: "Approved", lastName: "Administrator" },
        loginId: "private-login",
        email: "private-address@example.test",
      },
    };
  };
  m.inventory = async () => [
    { code: "accepted-admin", roleCode: "ENTERPRISE_ADMIN" },
  ];
  SERVICE.DefaultEnterpriseManagementService.rolePolicy = () => ({
    delegable: true,
    label: "Enterprise Admin",
  });
  const labeled = await owner.workspace({
    params: { enterpriseCode: "child" },
  });
  assert.equal(
    recipientReads,
    1,
    "business labels reuse the existing recipient read",
  );
  assert.deepEqual(labeled.options.sources, [
    {
      enterpriseCode: "parent",
      enterpriseName: "Parent Enterprise",
      assignments: [
        {
          code: "accepted-admin",
          roleCode: "ENTERPRISE_ADMIN",
          recipientName: "Approved Administrator",
          roleLabel: "Enterprise Admin",
        },
      ],
    },
  ]);
  for (const privateValue of [
    "secret-locator",
    "private-login",
    "private-address",
  ])
    assert.ok(!JSON.stringify(labeled).includes(privateValue));
  assert.equal(
    owner.recipientName({ person: { loginId: "private-login" } }),
    undefined,
  );
  assert.equal(
    owner.recipientName({
      person: { name: { firstName: {}, lastName: "Admin" } },
    }),
    undefined,
  );
  for (const invalid of [
    { en: "object" },
    "",
    "x".repeat(257),
    "unsafe\nlabel",
  ])
    assert.equal(owner.businessLabel(invalid), undefined);
  const optionalKeys = [
    "inspectLabel",
    "workingLabel",
    "reviewTitle",
    "confirmLabel",
    "cancelLabel",
    "unavailableMessage",
    "recordedMessage",
  ];
  for (const key of optionalKeys)
    policy.workspace.presentation[key] = "Custom " + key;
  const customized = await owner.workspace({
    params: { enterpriseCode: "child" },
  });
  for (const key of optionalKeys)
    assert.equal(customized.presentation[key], "Custom " + key);
  for (const key of optionalKeys) {
    for (const invalid of [undefined, null, 1, "", "   ", "x".repeat(501)]) {
      policy.workspace.presentation[key] = invalid;
      await assert.rejects(
        owner.workspace({ params: { enterpriseCode: "child" } }),
        { code: "ERR_PROFILE_CONSENT_UNAVAILABLE" },
      );
    }
    delete policy.workspace.presentation[key];
  }
  delete policy.workspace.presentation.confirmMessage;
  await assert.rejects(
    owner.workspace({ params: { enterpriseCode: "child" } }),
    { code: "ERR_PROFILE_CONSENT_UNAVAILABLE" },
  );
  policy.workspace.presentation.confirmMessage = "Confirm";
  policy.workspace.presentation.html =
    "<section>not a presentation field</section>";
  await assert.rejects(
    owner.workspace({ params: { enterpriseCode: "child" } }),
  );
});
test("onward commands cannot broaden recipient, action, expiry or depth ceilings", async () => {
  for (const broaden of ["recipient", "action", "expiry", "depth"]) {
    const { owner, policy } = fixture();
    policy.onwardQualified = true;
    policy.maximumDelegationDepth = 1;
    const actor = {
      identity: {
        tenantCode: "tenant",
        recordKind: "EMPLOYEE",
        recordId: "actor",
      },
      person: { authVersion: 1 },
    };
    const parent = {
      code: "parent-grant",
      revision: 1,
      status: "ACTIVE",
      sourceEnterpriseCode: "parent",
      roleCodes: ["VIEWER"],
      actions: ["VIEW"],
      recipients: ["approved@example.invalid"],
      expiresAt: new Date(Date.now() + 600000).toISOString(),
      delegationDepth: broaden === "depth" ? 1 : 0,
    };
    owner.target = async () => ({
      code: "child",
      administrationConsent: { version: 1, revision: 1, grants: [parent] },
    });
    owner.commandActor = async () => ({
      actor,
      enterpriseCode: "parent",
      parent,
      parentProof: {
        owner: "profile.administrationConsent",
        code: parent.code,
        revision: 1,
      },
    });
    owner.assignmentRecipient = async () => actor;
    owner.relationship = async () => [];
    owner.sourceAuthority = async () => ({ code: "appointed" });
    owner.persist = async () =>
      assert.fail("broader derived grants must not persist");
    SERVICE.DefaultEnterpriseManagementService = {
      rolePolicy: () => ({ delegable: true }),
      normalizeEmail: (value) => value.toLowerCase(),
    };
    const input = {
      operation: "GRANT",
      operationId: "reviewed_operation_1",
      revision: 1,
      parentGrantCode: parent.code,
      sourceEnterpriseCode: "parent",
      recipientAssignmentCode: "appointed",
      roleCodes: ["VIEWER"],
      actions: [broaden === "action" ? "INVITE" : "VIEW"],
      recipients: [
        broaden === "recipient"
          ? "outside@example.invalid"
          : "approved@example.invalid",
      ],
      expiresAt: new Date(
        Date.now() + (broaden === "expiry" ? 1200000 : 300000),
      ).toISOString(),
    };
    await assert.rejects(owner.command({ body: input }), {
      code: "ERR_PROFILE_CONSENT_FORBIDDEN",
    });
  }
});
test("target revocation cascades dependent grant generations without touching independent authority", async () => {
  const { owner, policy } = fixture();
  policy.maximumGrants = 10;
  const grants = [
    { code: "root", status: "ACTIVE", revision: 1 },
    {
      code: "child",
      status: "ACTIVE",
      revision: 3,
      parentProof: { code: "root", revision: 1 },
    },
    {
      code: "grandchild",
      status: "ACTIVE",
      revision: 2,
      parentProof: { code: "child", revision: 3 },
    },
    { code: "independent", status: "ACTIVE", revision: 7 },
  ];
  owner.target = async () => ({
    code: "target",
    administrationConsent: { version: 1, revision: 5, grants },
  });
  owner.commandActor = async () => ({
    actor: { identity: { recordId: "target-admin" } },
    enterpriseCode: "target",
  });
  let saved;
  owner.persist = async (target, state) => {
    saved = state;
    return { ...target, administrationConsent: state };
  };
  const stamps = [];
  owner.register = async (target, grant) =>
    stamps.push([target, grant.code, grant.revision]);
  await owner.command({
    body: {
      operation: "REVOKE",
      operationId: "reviewed_operation_1",
      revision: 5,
      grantCode: "root",
    },
  });
  assert.deepEqual(
    saved.grants.map((grant) => [grant.code, grant.status, grant.revision]),
    [
      ["root", "REVOKED", 2],
      ["child", "REVOKED", 4],
      ["grandchild", "REVOKED", 3],
      ["independent", "ACTIVE", 7],
    ],
  );
  assert.equal(saved.revision, 6);
  assert.ok(stamps.some((row) => row[1] === "grandchild" && row[2] === 3));
});
test("consent enterprise reads use private admission rather than already-redacted hierarchy records", async () => {
  const { owner } = fixture();
  const record = {
    code: "child",
    active: true,
    tenant: "tenant",
    administrationConsent: { version: 1, revision: 7, grants: [] },
  };
  owner.recoveryRecord = async () => record;
  const tenantOwner = {};
  SERVICE.DefaultTenantService = tenantOwner;
  SERVICE.DefaultEnterpriseService = {
    hierarchyReferenceCode: (code) => code,
    readHierarchyRecord: async (service, code) => {
      assert.equal(service, tenantOwner);
      assert.equal(code, "tenant");
      return { code };
    },
  };
  assert.equal(
    (await owner.enterprise("child")).administrationConsent.revision,
    7,
  );
  record.administrationHierarchyOperation = { phase: "PENDING" };
  await assert.rejects(owner.enterprise("child"), {
    code: "ERR_PROFILE_CONSENT_CONFLICT",
  });
});
test("graph-only recovery installs the child cancellation barrier before releasing the serial fence", async () => {
  const { owner, policy, m } = fixture();
  policy.reparentQualified = true;
  policy.hierarchyRecoveryQualified = true;
  policy.hierarchyRecoveryPermission = "recover";
  m.permission = () => {};
  owner.platformActor = async () => ({
    identity: { recordId: "reviewed-recovery" },
  });
  const serial = {
    id: "reviewed_operation_1",
    hash: "original",
    revision: 2,
    targetCode: "child",
    phase: "PENDING",
  };
  const child = { code: "child", administrationHierarchyEpoch: 0 };
  const platform = {
    code: "default",
    administrationHierarchySerialOperation: serial,
  };
  owner.recoveryRecord = async (code) => (code === "child" ? child : platform);
  SERVICE.DefaultEnterpriseService = {
    hierarchyReferenceCode: (code) => code ?? undefined,
  };
  const order = [];
  owner.persistHierarchy = async (record, predicate, patch) => {
    order.push(record.code);
    if (record.code === "child") {
      assert.deepEqual(predicate.administrationHierarchyOperation, {
        $exists: false,
      });
      assert.equal(patch.administrationHierarchyOperation.phase, "COMPLETE");
      assert.equal(patch.administrationHierarchyOperation.cancelled, true);
      assert.equal(patch.administrationHierarchyEpoch, undefined);
    } else
      assert.equal(
        predicate["administrationHierarchySerialOperation.phase"],
        "PENDING",
      );
    Object.assign(record, patch);
    return record;
  };
  const result = await owner.recoverHierarchySerial({
    body: { enterpriseCode: "child", operationId: serial.id, revision: 2 },
  });
  assert.deepEqual(order, ["child", "default"]);
  assert.equal(result.status, "CANCELLED");
  assert.equal(child.administrationHierarchyEpoch, 0);
  assert.equal(
    platform.administrationHierarchySerialOperation.cancelledBy.recordId,
    "reviewed-recovery",
  );
});
test("explicit pending-child cancellation preserves advanced epoch and original parent, then releases only matching serial", async () => {
  const { owner, policy, m } = fixture();
  Object.assign(policy, {
    reparentQualified: true,
    hierarchyRecoveryQualified: true,
    hierarchyRecoveryPermission: "recover",
  });
  m.permission = () => {};
  owner.platformActor = async () => ({
    identity: { recordId: "new-recovery-admin" },
  });
  const operation = {
    id: "reviewed_operation_1",
    hash: "original",
    phase: "PENDING",
    previousEpoch: 4,
    previousParent: "original-parent",
    nextParent: "proposed-parent",
    targetCodes: ["dependent"],
    actor: { recordId: "original-actor" },
  };
  const child = {
    code: "child",
    superEnterprise: "original-parent",
    administrationHierarchyEpoch: 5,
    administrationHierarchyOperation: operation,
  };
  const platform = {
    code: "default",
    administrationHierarchySerialOperation: {
      id: operation.id,
      hash: operation.hash,
      revision: 3,
      targetCode: "child",
      phase: "PENDING",
    },
  };
  owner.recoveryRecord = async (code) => (code === "child" ? child : platform);
  SERVICE.DefaultEnterpriseService = {
    hierarchyReferenceCode: (code) => code ?? undefined,
  };
  const order = [];
  owner.persistHierarchy = async (record, predicate, patch) => {
    order.push(record.code);
    if (record.code === "child") {
      assert.equal(
        predicate["administrationHierarchyOperation.phase"],
        "PENDING",
      );
      assert.equal(predicate.administrationHierarchyEpoch, 5);
      assert.equal(predicate.superEnterprise, "original-parent");
      assert.equal(patch.administrationHierarchyEpoch, undefined);
      assert.equal(patch.superEnterprise, undefined);
      assert.equal(patch.administrationHierarchyOperation.phase, "CANCELLED");
      assert.equal(
        patch.administrationHierarchyOperation.actor.recordId,
        "original-actor",
      );
    }
    Object.assign(record, patch);
    return record;
  };
  const result = await owner.recoverHierarchySerial({
    body: { enterpriseCode: "child", operationId: operation.id, revision: 3 },
  });
  assert.deepEqual(order, ["child", "default"]);
  assert.equal(result.status, "CANCELLED");
  assert.equal(child.administrationHierarchyEpoch, 5);
  assert.equal(child.superEnterprise, "original-parent");
  assert.equal(
    child.administrationHierarchyOperation.cancelledBy.recordId,
    "new-recovery-admin",
  );
  assert.equal(owner.terminalHierarchy(child), true);
  child.superEnterprise = "changed-parent";
  assert.equal(owner.terminalHierarchy(child), false);
});
test("pending cancellation refuses unknown original epoch or a parent that already changed", async () => {
  for (const defect of ["epoch", "parent"]) {
    const { owner, policy, m } = fixture();
    Object.assign(policy, {
      reparentQualified: true,
      hierarchyRecoveryQualified: true,
      hierarchyRecoveryPermission: "recover",
    });
    m.permission = () => {};
    owner.platformActor = async () => ({ identity: { recordId: "recovery" } });
    const operation = {
      id: "reviewed_operation_1",
      hash: "original",
      phase: "PENDING",
      previousEpoch: defect === "epoch" ? undefined : 1,
      previousParent: "original",
      targetCodes: [],
    };
    owner.recoveryRecord = async (code) =>
      code === "child"
        ? {
            code,
            superEnterprise: defect === "parent" ? "changed" : "original",
            administrationHierarchyEpoch: 2,
            administrationHierarchyOperation: operation,
          }
        : {
            code,
            administrationHierarchySerialOperation: {
              id: operation.id,
              hash: operation.hash,
              revision: 1,
              targetCode: "child",
              phase: "PENDING",
            },
          };
    SERVICE.DefaultEnterpriseService = {
      hierarchyReferenceCode: (code) => code ?? undefined,
    };
    owner.persistHierarchy = async () =>
      assert.fail("unproven cancellation must never persist");
    await assert.rejects(
      owner.recoverHierarchySerial({
        body: {
          enterpriseCode: "child",
          operationId: operation.id,
          revision: 1,
        },
      }),
      { code: "ERR_PROFILE_CONSENT_CONFLICT" },
    );
  }
});
