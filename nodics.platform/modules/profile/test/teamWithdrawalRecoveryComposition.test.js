/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/**
 * @module profile/test/teamWithdrawalRecoveryComposition
 * @description Composes real Team lease/recovery/private-read owners and membership writers over in-memory conditional persistence.
 * @layer test
 * @owner profile
 * Provider acknowledgements, identity reads and stamp failures are simulated; this is not installed qualification.
 */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const crypto = require("node:crypto");
const teamSource = require("../src/service/enterprise/defaultEnterpriseTeamAdministrationService");
const membershipSource = require("../src/service/enterprise/defaultEnterpriseMembershipService");
const registrationSource = require("../src/service/enterprise/defaultEnterpriseRegistrationService");
const managementSource = require("../src/service/enterprise/defaultEnterpriseManagementService");
const security = require("../../../../nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService");

/** Matches owner-authored conditional selectors without implementing a general database. */
function matches(row, query) {
  return Object.entries(query).every(([path, expected]) => {
    const value = path.split(".").reduce((item, key) => item?.[key], row);
    return expected && typeof expected === "object" && "$exists" in expected
      ? (value !== undefined) === expected.$exists
      : value === expected;
  });
}

/** Builds isolated storage and fault injection around the actual owner composition. @returns {Object} Fixture only; no live providers. */
function fixture() {
  const configuration = {
    memberships: {
      enabled: true,
      inventoryQualified: true,
      sessionBindingQualified: true,
      assignmentClaimIndexQualified: true,
      pageSize: 50,
      maximumInventoryPages: 100,
    },
    teamAdministration: {
      enabled: true,
      serializedWritesQualified: true,
      operatorRecoveryQualified: true,
      invitationWithdrawalQualified: true,
      recoveryPresentation: { title: "Recover Team" },
    },
  };
  global.CONFIG = {
    get: (key) =>
      key === "enterpriseManagement"
        ? configuration
        : key ===
            "enterpriseManagement.teamAdministration.operatorRecoveryQualified"
          ? configuration.teamAdministration.operatorRecoveryQualified
          : key === "defaultEnterprise"
            ? "platform"
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
  const enterprise = {
    code: "target",
    active: true,
    defaultAdminAssignmentCode: "original-admin",
    adminEmail: "original@example.test",
  };
  const assignment = {
    code: "unused-invitation",
    enterpriseCode: "target",
    tenantCode: "staff",
    roleCode: "OPERATOR",
    revision: 3,
    active: true,
    status: "ACTIVE",
    normalizedEmail: "invitee@example.test",
  };
  const profiles = [
    {
      tenant: "staff",
      _id: "original-id",
      loginId: "original@example.test",
      principalType: "human",
      active: true,
      authVersion: 1,
    },
    {
      tenant: "authority",
      _id: "operator-id",
      loginId: "operator@example.test",
      principalType: "human",
      active: true,
      authVersion: 1,
    },
  ];
  const faults = {};
  const calls = {
    enterpriseWrites: [],
    assignmentWrites: [],
    stamps: 0,
    assignmentReads: 0,
  };
  const digest = (value) =>
    crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
  const team = { ...teamSource };
  const m = {
    ...membershipSource,
    authority: () => "authority",
    read: async (owner, tenant, query) => {
      if (owner === "DefaultEmployeeService")
        return structuredClone(
          profiles.find(
            (person) => person.tenant === tenant && matches(person, query),
          ) || null,
        );
      assert.equal(owner, "DefaultEnterpriseAccessAssignmentService");
      assert.equal(tenant, "authority");
      calls.assignmentReads++;
      if (faults.assignmentRead) {
        faults.assignmentRead = false;
        throw new Error("assignment read lost");
      }
      return matches(assignment, query) ? structuredClone(assignment) : null;
    },
    enterprise: async (code) => ({
      enterprise: await team.readEnterprise("authority", { code }),
      tenantCode: "staff",
    }),
  };
  const response = (result) => ({ code: "SUC_DBS_00000", result });
  global.SERVICE = {
    DefaultEnterpriseTeamAdministrationService: team,
    DefaultEnterpriseMembershipService: m,
    DefaultEnterpriseRegistrationService: { ...registrationSource },
    DefaultEnterpriseManagementService: {
      isPlatformAdministrator: managementSource.isPlatformAdministrator,
      commandDigest: digest,
      rolePolicy: () => ({ label: "Operator" }),
    },
    DefaultSecuredRequestPipelineService: security,
    DefaultIdentityGovernanceService: {
      getSystemAuthData: () => ({ isSystem: true }),
    },
    DefaultUserStateService: { findUserState: async () => ({ locked: false }) },
    DefaultPrincipalSecurityStampService: {
      validate: async () => {
        if (faults.actorStamp) throw new Error("actor stamp denied");
      },
      register: async (tenant, key, revision) => {
        assert.equal(tenant, "authority");
        assert.equal(key, m.membershipKey(assignment.code));
        assert.equal(revision, assignment.revision);
        calls.stamps++;
        if (faults.stamp) {
          faults.stamp = false;
          throw new Error("stamp acknowledgement lost");
        }
        if (faults.afterStamp) await faults.afterStamp();
      },
    },
    DefaultEnterpriseService: {
      get: async (request) => {
        if (faults.enterpriseRead) {
          faults.enterpriseRead = false;
          throw new Error("enterprise read lost");
        }
        const envelope = response(
          matches(enterprise, request.query)
            ? [structuredClone(enterprise)]
            : [],
        );
        team.redactEnterprise(request, envelope);
        return envelope;
      },
      update: async (request) => {
        assert(team.ownsEnterpriseWrite(request));
        assert.equal(request.tenant, "authority");
        team.protectEnterprise(request);
        calls.enterpriseWrites.push(structuredClone(request));
        if (faults.beforeEnterpriseWrite)
          await faults.beforeEnterpriseWrite(request);
        if (!matches(enterprise, request.query))
          return response({ matchedCount: 0 });
        if (
          faults.rejectFinish &&
          request.model.teamOperation.phase === "COMPLETE"
        )
          throw new Error("finish not committed");
        Object.assign(enterprise, structuredClone(request.model));
        if (
          faults.finishAck &&
          request.model.teamOperation.phase === "COMPLETE"
        ) {
          faults.finishAck = false;
          if (faults.finishRead) {
            faults.finishRead = false;
            faults.enterpriseRead = true;
          }
          throw new Error("finish acknowledgement lost");
        }
        return response({ matchedCount: 1 });
      },
    },
    DefaultEnterpriseAccessAssignmentService: {
      update: async (request) => {
        assert(m.ownsMembershipWrite(request));
        assert.equal(request.tenant, "authority");
        calls.assignmentWrites.push(structuredClone(request));
        if (!matches(assignment, request.query))
          return response({ matchedCount: 0 });
        Object.assign(assignment, structuredClone(request.model), {
          revision: assignment.revision + 1,
        });
        if (faults.assignmentAck) {
          faults.assignmentAck = false;
          faults.assignmentRead = true;
          throw new Error("assignment acknowledgement lost");
        }
        return response({ matchedCount: 1 });
      },
    },
  };
  const original = {
    tenant: "staff",
    authData: {
      tokenType: "access",
      principalType: "human",
      loginId: profiles[0].loginId,
      authVersion: 1,
      tenant: "staff",
      entCode: "target",
      authenticationMethod: "PASSWORD",
      permissions: ["profile.enterpriseAccess.assign"],
      userGroups: ["adminGroup"],
    },
    body: {
      assignmentCode: assignment.code,
      revision: 3,
      operationId: "withdraw_operation_12345",
    },
  };
  const operator = {
    tenant: "authority",
    authData: {
      tokenType: "access",
      principalType: "human",
      loginId: profiles[1].loginId,
      authVersion: 1,
      tenant: "authority",
      entCode: "platform",
      authenticationMethod: "PASSWORD",
      permissions: ["profile.enterpriseAccess.assign"],
      userGroups: ["runtimeConfigAdminUserGroup"],
    },
    body: {
      enterpriseCode: "target",
      teamRevision: 1,
      operationId: original.body.operationId,
    },
  };
  return {
    team,
    m,
    enterprise,
    assignment,
    profiles,
    configuration,
    faults,
    calls,
    original,
    operator,
    inspect: () =>
      team.recoveryWorkspace({
        ...operator,
        body: { enterpriseCode: "target" },
      }),
  };
}

/** Leaves a real committed withdrawal behind a held lease by dropping acknowledgement/readback. */
async function committedWithdrawal() {
  const f = fixture();
  f.faults.assignmentAck = true;
  await assert.rejects(
    f.team.withdrawInvitation(f.original),
    /assignment read lost/,
  );
  assert.equal(f.assignment.status, "REVOKED");
  assert.equal(f.enterprise.teamOperation.phase, "PENDING");
  f.profiles[0].active = false;
  return f;
}

test("operator finalizes committed withdrawal after original actor loss without a second assignment write", async () => {
  const f = await committedWithdrawal();
  const view = await f.inspect();
  assert.deepEqual(view.operation, {
    id: f.original.body.operationId,
    phase: "PENDING",
    teamRevision: 1,
    recoverable: true,
  });
  const before = structuredClone(f.assignment);
  const outcome = await f.team.reconcileCommittedOperation(f.operator);
  assert.equal(outcome.status, "REVOKED");
  assert.equal(outcome.accepted, false);
  assert.deepEqual(f.assignment, before);
  assert.equal(f.calls.assignmentWrites.length, 1);
  assert.equal(f.enterprise.teamOperation.phase, "COMPLETE");
  assert.equal(f.enterprise.teamOperation.actor.recordId, "original-id");
  assert.equal(
    f.enterprise.teamOperation.recovery.actor.recordId,
    "operator-id",
  );
  assert.equal((await f.inspect()).operation.recoverable, false);
  const count = f.calls.enterpriseWrites.length;
  assert.deepEqual(
    await f.team.reconcileCommittedOperation(f.operator),
    outcome,
  );
  assert.equal(f.calls.enterpriseWrites.length, count);
  for (const value of [view, outcome]) {
    for (const privateKey of [
      "original-id",
      "operator-id",
      "membershipMutation",
      "invitationWithdrawal",
      '"hash"',
      '"input"',
    ])
      assert(!JSON.stringify(value).includes(privateKey));
  }
  const publicRead = await SERVICE.DefaultEnterpriseService.get({
    query: { code: "target" },
  });
  assert.equal(publicRead.result[0].teamOperation, undefined);
  assert.equal(publicRead.result[0].teamRevision, undefined);
});

for (const [label, mutate] of [
  [
    "EXTERNAL proof",
    (f) => {
      f.operator.authData.authenticationMethod = "EXTERNAL";
    },
  ],
  [
    "non-platform actor",
    (f) => {
      f.operator.authData.entCode = "target";
    },
  ],
  [
    "service token",
    (f) => {
      f.operator.authData.tokenType = "service";
    },
  ],
  [
    "system context",
    (f) => {
      f.operator.authData.isSystem = true;
    },
  ],
  [
    "customer context",
    (f) => {
      f.operator.authData.principalType = "customer";
    },
  ],
  [
    "missing permission",
    (f) => {
      f.operator.authData.permissions = [];
    },
  ],
  [
    "disabled operator",
    (f) => {
      f.profiles[1].active = false;
    },
  ],
  [
    "stale actor proof",
    (f) => {
      f.faults.actorStamp = true;
    },
  ],
  [
    "unqualified recovery",
    (f) => {
      f.configuration.teamAdministration.operatorRecoveryQualified = false;
    },
  ],
  [
    "unqualified withdrawal",
    (f) => {
      f.configuration.teamAdministration.invitationWithdrawalQualified = false;
    },
  ],
])
  test(`${label} cannot inspect or recover another actor's withdrawal`, async () => {
    const f = await committedWithdrawal();
    mutate(f);
    if (label !== "unqualified withdrawal") await assert.rejects(f.inspect());
    else assert.equal((await f.inspect()).operation.recoverable, false);
    await assert.rejects(f.team.reconcileCommittedOperation(f.operator));
    assert.equal(f.calls.enterpriseWrites.length, 1);
    assert.equal(f.calls.stamps, 0);
  });

for (const [label, mutate] of [
  [
    "stale reviewed revision",
    (f) => {
      f.operator.body.teamRevision++;
    },
  ],
  [
    "replacement operation",
    (f) => {
      f.operator.body.operationId = "other_operation_12345";
    },
  ],
  [
    "replacement action input",
    (f) => {
      f.operator.body.assignmentCode = "other";
    },
  ],
  [
    "tampered stored input",
    (f) => {
      f.enterprise.teamOperation.input.revision++;
    },
  ],
  [
    "unexpected reviewed field even with matching hash",
    (f) => {
      const operation = f.enterprise.teamOperation;
      operation.input.extra = "unreviewed";
      operation.hash = f.m.digest({
        operation: operation.operation,
        input: operation.input,
        identity: operation.actor,
        enterpriseCode: f.enterprise.code,
      });
    },
  ],
  [
    "changed assignment revision",
    (f) => {
      f.assignment.revision++;
    },
  ],
  [
    "missing commit marker",
    (f) => {
      delete f.assignment.invitationWithdrawal;
    },
  ],
  [
    "wrong commit marker",
    (f) => {
      f.assignment.invitationWithdrawal.operationId = "other_operation_12345";
    },
  ],
  [
    "missing commit time",
    (f) => {
      delete f.assignment.invitationWithdrawal.withdrawnAt;
    },
  ],
  [
    "reactivated invitation",
    (f) => {
      f.assignment.active = true;
    },
  ],
  [
    "registration evidence",
    (f) => {
      f.assignment.registration = { phase: "PREPARED" };
    },
  ],
  [
    "claimed identity",
    (f) => {
      f.assignment.identityClaimed = true;
    },
  ],
  [
    "membership evidence",
    (f) => {
      f.assignment.membership = { phase: "COMPLETE" };
    },
  ],
  [
    "default administrator",
    (f) => {
      f.enterprise.defaultAdminAssignmentCode = f.assignment.code;
    },
  ],
])
  test(`${label} retains the withdrawal fence without writing or repairing stamps`, async () => {
    const f = await committedWithdrawal();
    mutate(f);
    await assert.rejects(f.team.reconcileCommittedOperation(f.operator));
    assert.equal(f.enterprise.teamOperation.phase, "PENDING");
    assert.equal(f.calls.enterpriseWrites.length, 1);
    assert.equal(f.calls.assignmentWrites.length, 1);
    assert.equal(f.calls.stamps, 0);
  });

test("uncommitted withdrawal is not inferred from a pending reviewed command", async () => {
  const f = fixture();
  await f.team.begin(f.original, "WITHDRAW", f.original.body, "target");
  assert.equal((await f.inspect()).operation.recoverable, false);
  await assert.rejects(f.team.reconcileCommittedOperation(f.operator));
  assert.equal(f.calls.assignmentWrites.length, 0);
  assert.equal(f.calls.stamps, 0);
});

test("stamp failure and same-revision late evidence drift retain the lease", async () => {
  const f = await committedWithdrawal();
  f.faults.stamp = true;
  await assert.rejects(
    f.team.reconcileCommittedOperation(f.operator),
    /stamp acknowledgement lost/,
  );
  assert.equal(f.enterprise.teamOperation.phase, "PENDING");
  f.faults.afterStamp = async () => {
    f.assignment.registration = { phase: "PREPARED" };
  };
  await assert.rejects(f.team.reconcileCommittedOperation(f.operator));
  assert.equal(f.calls.enterpriseWrites.length, 1);
});

test("operator authority is revalidated after stamp repair", async () => {
  const f = await committedWithdrawal();
  f.faults.afterStamp = async () => {
    f.profiles[1].active = false;
  };
  await assert.rejects(f.team.reconcileCommittedOperation(f.operator));
  assert.equal(f.enterprise.teamOperation.phase, "PENDING");
  assert.equal(f.calls.enterpriseWrites.length, 1);
});

test("original withdrawal retry revalidates authority after stamp repair", async () => {
  const f = await committedWithdrawal();
  f.profiles[0].active = true;
  f.faults.afterStamp = async () => {
    f.profiles[0].active = false;
  };
  await assert.rejects(f.team.withdrawInvitation(f.original));
  assert.equal(f.enterprise.teamOperation.phase, "PENDING");
  assert.equal(f.calls.enterpriseWrites.length, 1);
  assert.equal(f.calls.assignmentWrites.length, 1);
});

test("original withdrawal retry refuses same-revision evidence drift after stamp repair", async () => {
  const f = await committedWithdrawal();
  f.profiles[0].active = true;
  f.faults.afterStamp = async () => {
    f.assignment.registration = { phase: "PREPARED" };
  };
  await assert.rejects(f.team.withdrawInvitation(f.original));
  assert.equal(f.enterprise.teamOperation.phase, "PENDING");
  assert.equal(f.calls.enterpriseWrites.length, 1);
});

test("original withdrawal retry requires recorded commit time and rejects default designation", async () => {
  for (const mutate of [
    (f) => {
      delete f.assignment.invitationWithdrawal.withdrawnAt;
    },
    (f) => {
      f.enterprise.defaultAdminAssignmentCode = f.assignment.code;
    },
  ]) {
    const f = await committedWithdrawal();
    f.profiles[0].active = true;
    mutate(f);
    await assert.rejects(f.team.withdrawInvitation(f.original));
    assert.equal(f.calls.stamps, 0);
    assert.equal(f.enterprise.teamOperation.phase, "PENDING");
  }
});

test("original withdrawal retry uses the effective later-layer committed-evidence guard", async () => {
  const f = await committedWithdrawal();
  f.profiles[0].active = true;
  let calls = 0;
  f.team.repairCommittedAssignment = async function (...args) {
    calls++;
    return teamSource.repairCommittedAssignment.apply(this, args);
  };
  const result = await f.team.withdrawInvitation(f.original);
  assert.equal(result.status, "REVOKED");
  assert.equal(calls, 1);
  assert.equal(f.calls.assignmentWrites.length, 1);
  assert.equal(f.enterprise.teamOperation.phase, "COMPLETE");
});

test("a stricter later-layer evidence guard may reject without finishing or replaying", async () => {
  const f = await committedWithdrawal();
  f.profiles[0].active = true;
  const existing = f.team.committedRecoveryMatches;
  f.team.committedRecoveryMatches = function (...args) {
    assert.equal(existing.apply(this, args), true);
    return false;
  };
  await assert.rejects(f.team.withdrawInvitation(f.original));
  assert.equal(f.calls.stamps, 0);
  assert.equal(f.calls.assignmentWrites.length, 1);
  assert.equal(f.enterprise.teamOperation.phase, "PENDING");
});

/** Retains a committed membership command in the existing fixture without creating a principal. */
async function committedMembership(operation) {
  const f = fixture();
  await f.team.begin(f.original, operation, f.original.body, "target");
  Object.assign(f.assignment, {
    revision: 4,
    status:
      operation === "RESUME"
        ? "REGISTERED"
        : operation === "SUSPEND"
          ? "SUSPENDED"
          : "REVOKED",
    active: operation !== "REVOKE",
    membership: {
      phase: "COMPLETE",
      lastTeamOperation: f.original.body.operationId,
    },
  });
  return f;
}

for (const operation of ["SUSPEND", "REVOKE", "RESUME"]) {
  test(`${operation} retry rejects mismatched committed revision before stamp repair`, async () => {
    const f = await committedMembership(operation);
    f.assignment.revision++;
    await assert.rejects(f.team.changeMembership(f.original, operation));
    assert.equal(f.calls.stamps, 0);
    assert.equal(f.enterprise.teamOperation.phase, "PENDING");
  });

  test(`${operation} retry rechecks assignment and authority after stamp repair`, async () => {
    for (const mutate of [
      (f) => {
        f.assignment.roleCode = "OTHER_ROLE";
      },
      (f) => {
        f.profiles[0].active = false;
      },
    ]) {
      const f = await committedMembership(operation);
      f.faults.afterStamp = async () => mutate(f);
      await assert.rejects(f.team.changeMembership(f.original, operation));
      assert.equal(f.enterprise.teamOperation.phase, "PENDING");
      assert.equal(f.calls.enterpriseWrites.length, 1);
    }
  });

  test(`${operation} retry acknowledges unchanged commit without a second assignment write`, async () => {
    const f = await committedMembership(operation);
    const result = await f.team.changeMembership(f.original, operation);
    assert.equal(result.status, f.assignment.status);
    assert.equal(f.enterprise.teamOperation.phase, "COMPLETE");
    assert.equal(f.calls.assignmentWrites.length, 0);
    assert.equal(f.calls.stamps, 1);
  });
}

test("lost final acknowledgement/readback is recovered by explicit completed-outcome inspection only", async () => {
  const f = await committedWithdrawal();
  f.faults.finishAck = f.faults.finishRead = true;
  await assert.rejects(
    f.team.reconcileCommittedOperation(f.operator),
    /enterprise read lost/,
  );
  assert.equal((await f.inspect()).operation.phase, "COMPLETE");
  const writes = f.calls.enterpriseWrites.length;
  assert.equal(
    (await f.team.reconcileCommittedOperation(f.operator)).status,
    "REVOKED",
  );
  assert.equal(f.calls.enterpriseWrites.length, writes);
  assert.equal(f.calls.assignmentWrites.length, 1);
});

test("competing finish preserves the exact revision/operation fence", async () => {
  const f = await committedWithdrawal();
  f.faults.beforeEnterpriseWrite = async () => {
    f.enterprise.teamRevision++;
  };
  await assert.rejects(f.team.reconcileCommittedOperation(f.operator));
  assert.equal(f.enterprise.teamOperation.phase, "PENDING");
  assert.equal(f.calls.assignmentWrites.length, 1);
});

test("competing platform operators cannot overwrite the winning recovery provenance", async () => {
  const f = await committedWithdrawal();
  f.profiles.push({
    ...f.profiles[1],
    _id: "second-operator-id",
    loginId: "second@example.test",
  });
  const second = structuredClone(f.operator);
  second.authData.loginId = "second@example.test";
  let arrivals = 0;
  let release;
  const barrier = new Promise((resolve) => {
    release = resolve;
  });
  f.faults.afterStamp = async () => {
    if (++arrivals === 2) release();
    await barrier;
  };
  const results = await Promise.allSettled([
    f.team.reconcileCommittedOperation(f.operator),
    f.team.reconcileCommittedOperation(second),
  ]);
  assert.equal(
    results.filter((result) => result.status === "fulfilled").length,
    1,
  );
  assert.equal(
    results.filter((result) => result.status === "rejected").length,
    1,
  );
  assert.equal(f.enterprise.teamOperation.phase, "COMPLETE");
  const winner =
    results[0].status === "fulfilled" ? "operator-id" : "second-operator-id";
  assert.equal(f.enterprise.teamOperation.recovery.actor.recordId, winner);
  assert.equal(f.calls.assignmentWrites.length, 1);
});

/** Selects the already-reviewed eligible target; administrator eligibility has its own real-owner suite. */
function prepareHandover(f) {
  f.assignment.status = "REGISTERED";
  f.team.administrators = async () => [structuredClone(f.assignment)];
  f.original.body.enterpriseCode = "target";
  f.original.body.operationId = f.operator.body.operationId =
    "handover_operation_12345";
}

test("handover before final CAS has no partial designation and cannot be operator-replayed", async () => {
  const f = fixture();
  prepareHandover(f);
  f.faults.rejectFinish = true;
  await assert.rejects(f.team.handover(f.original), /finish not committed/);
  assert.equal(f.enterprise.defaultAdminAssignmentCode, "original-admin");
  assert.equal(f.enterprise.adminEmail, "original@example.test");
  assert.equal((await f.inspect()).operation.recoverable, false);
  f.profiles[0].active = false;
  await assert.rejects(f.team.reconcileCommittedOperation(f.operator));
  assert.equal(f.enterprise.teamOperation.phase, "PENDING");
  assert.equal(f.calls.assignmentWrites.length, 0);
});

test("handover designation and COMPLETE share one CAS even when both acknowledgement and readback are lost", async () => {
  const f = fixture();
  prepareHandover(f);
  f.faults.finishAck = f.faults.finishRead = true;
  await assert.rejects(f.team.handover(f.original), /enterprise read lost/);
  const finish = f.calls.enterpriseWrites[1];
  assert.equal(finish.query.teamRevision, 1);
  assert.equal(finish.query["teamOperation.id"], f.original.body.operationId);
  assert.equal(finish.query["teamOperation.phase"], "PENDING");
  assert.equal(finish.model.defaultAdminAssignmentCode, f.assignment.code);
  assert.equal(finish.model.adminEmail, f.assignment.normalizedEmail);
  assert.equal(finish.model.teamOperation.phase, "COMPLETE");
  assert.equal(f.enterprise.defaultAdminAssignmentCode, f.assignment.code);
  f.profiles[0].active = false;
  const view = await f.inspect();
  assert.equal(view.operation.phase, "COMPLETE");
  assert.equal(view.operation.recoverable, false);
  assert.equal(view.operation.input, undefined);
  await assert.rejects(f.team.reconcileCommittedOperation(f.operator), {
    code: "ERR_PROFILE_TEAM_CONFLICT",
  });
  assert.equal(f.calls.enterpriseWrites.length, 2);
  assert.equal(f.calls.assignmentWrites.length, 0);
});
