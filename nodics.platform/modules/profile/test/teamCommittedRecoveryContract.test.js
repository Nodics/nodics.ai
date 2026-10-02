/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/** @module profile/test/teamCommittedRecoveryContract @description Verifies evidence-only platform recovery, qualification and stale/ambiguous denial without persistence or behavioral runtime activation. @layer test @owner profile */
const assert = require("node:assert/strict");
const test = require("node:test");
const crypto = require("node:crypto");
const source = require("../src/service/enterprise/defaultEnterpriseTeamAdministrationService");
const facade = require("../src/facade/enterprise/defaultEnterpriseManagementFacade");

function fixture() {
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code, message) {
        super(message || code);
        this.code = code;
      }
    },
  };
  let qualified = true,
    platform = true;
  global.CONFIG = { get: () => qualified };
  const digest = (value) =>
    crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
  const reviewed = {
    assignmentCode: "assignment",
    revision: 3,
    operationId: "operation_12345678",
  };
  const enterprise = {
    code: "target",
    active: true,
    teamRevision: 7,
    teamOperation: {
      id: reviewed.operationId,
      operation: "SUSPEND",
      phase: "PENDING",
      input: reviewed,
      actor: { recordId: "lost-actor" },
    },
  };
  enterprise.teamOperation.hash = digest({
    operation: "SUSPEND",
    input: reviewed,
    identity: enterprise.teamOperation.actor,
    enterpriseCode: "target",
  });
  const item = {
    code: "assignment",
    enterpriseCode: "target",
    revision: 4,
    status: "SUSPENDED",
    active: true,
    membership: { phase: "COMPLETE", lastTeamOperation: reviewed.operationId },
  };
  const calls = { stamps: 0, finish: 0, admissions: 0 };
  const m = {
    base: () => ({
      input: (value, keys) => {
        if (Object.keys(value).some((key) => !keys.includes(key)))
          throw Error("unexpected selector");
        return value;
      },
    }),
    administrator: async () => {
      calls.admissions++;
      return { identity: { recordId: "operator" } };
    },
    digest,
    rows: (response) => response.result,
    read: async () => enterprise,
    authority: () => "authority",
    assignment: async () => ({ item, enterprise }),
    registerMembership: async () => {
      calls.stamps++;
    },
    project: (record) => ({ code: record.code, revision: record.revision }),
  };
  const owner = {
    ...source,
    policy: () => true,
    memberships: () => m,
    finish: async (lease, outcome) => {
      calls.finish++;
      calls.lease = lease;
      return outcome;
    },
  };
  global.SERVICE = {
    DefaultIdentityGovernanceService: { getSystemAuthData: () => ({}) },
    DefaultEnterpriseService: {
      get: async (request) => {
        assert.equal(request.options.recursive, false);
        assert.equal(request.options.skipItemCache, true);
        assert.equal(request.searchOptions.pageSize, 2);
        return { code: "SUC_FIND_00000", result: [enterprise] };
      },
    },
    DefaultEnterpriseManagementService: {
      isPlatformAdministrator: () => platform,
    },
    DefaultEnterpriseTeamAdministrationService: owner,
  };
  const request = {
    authData: { authenticationMethod: "PASSWORD" },
    query: {},
    body: {
      enterpriseCode: "target",
      teamRevision: 7,
      operationId: reviewed.operationId,
    },
  };
  return {
    owner,
    request,
    enterprise,
    item,
    calls,
    disable: () => {
      qualified = false;
    },
    denyPlatform: () => {
      platform = false;
    },
  };
}

test("fresh platform operator finalizes only committed evidence and records private recovery provenance", async () => {
  const f = fixture();
  assert.deepEqual(
    await facade.membershipAction(f.request, "RECONCILE_COMMITTED"),
    { code: "assignment", revision: 4 },
  );
  assert.equal(f.calls.stamps, 1);
  assert.equal(f.calls.finish, 1);
  assert.equal(f.calls.admissions, 2);
  assert.equal(f.calls.lease.teamOperation.recovery.actor.recordId, "operator");
  assert.equal(f.calls.lease.teamOperation.actor.recordId, "lost-actor");
});
test("operator inspection projects committed proof but never stored actor or mutation input", async () => {
  const f = fixture();
  f.request.body = { enterpriseCode: "target" };
  CONFIG.get = (key) =>
    key === "enterpriseManagement"
      ? { teamAdministration: { recoveryPresentation: { title: "Recovery" } } }
      : true;
  f.owner.policy = () => ({ recoveryPresentation: { title: "Recovery" } });
  const view = await f.owner.recoveryWorkspace(f.request);
  assert.equal(view.operation.recoverable, true);
  assert.equal(view.operation.teamRevision, 7);
  assert.equal(view.operation.actor, undefined);
  assert.equal(view.operation.input, undefined);
  assert.equal(f.calls.finish, 0);
  assert.equal(f.calls.stamps, 0);
  f.item.revision = 3;
  assert.equal(
    (await f.owner.recoveryWorkspace(f.request)).operation.recoverable,
    false,
  );
});

test("qualification, platform context and PASSWORD proof are required", async () => {
  let f = fixture();
  f.disable();
  await assert.rejects(f.owner.reconcileCommittedOperation(f.request));
  f = fixture();
  f.denyPlatform();
  await assert.rejects(f.owner.reconcileCommittedOperation(f.request));
  f = fixture();
  f.request.authData.authenticationMethod = "EXTERNAL";
  await assert.rejects(f.owner.reconcileCommittedOperation(f.request));
});

test("stale revision, missing input, altered hash, handover and uncommitted evidence retain the lease", async () => {
  for (const mutate of [
    (f) => {
      f.request.body.teamRevision++;
    },
    (f) => {
      delete f.enterprise.teamOperation.input;
    },
    (f) => {
      f.enterprise.teamOperation.hash = "tampered";
    },
    (f) => {
      f.enterprise.teamOperation.operation = "HANDOVER";
    },
    (f) => {
      f.item.membership.lastTeamOperation = "other";
    },
    (f) => {
      f.item.revision++;
    },
    (f) => {
      f.item.status = "REGISTERED";
    },
  ]) {
    const f = fixture();
    mutate(f);
    await assert.rejects(f.owner.reconcileCommittedOperation(f.request));
    assert.equal(f.calls.stamps, 0);
    assert.equal(f.calls.finish, 0);
  }
});

test("late assignment change after stamp repair refuses finalization", async () => {
  const f = fixture();
  let reads = 0;
  const m = f.owner.memberships();
  m.assignment = async () => ({
    item: ++reads === 1 ? { ...f.item } : { ...f.item, revision: 5 },
    enterprise: f.enterprise,
  });
  await assert.rejects(f.owner.reconcileCommittedOperation(f.request));
  assert.equal(f.calls.stamps, 1);
  assert.equal(f.calls.finish, 0);
});
