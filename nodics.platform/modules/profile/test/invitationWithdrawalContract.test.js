/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/**
 * @module profile/test/invitationWithdrawalContract
 * @description Injected serialized unused-invitation refusal and same-command recovery fixtures; not installed persistence qualification.
 * @layer test
 * @owner profile
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const { createHash } = require("node:crypto");
const implementation = require("../src/service/enterprise/defaultEnterpriseTeamAdministrationService");

/** Supplies private owner collaborators without executing runtime writes. @param {Object} extra Invitation overrides. @returns {Object} Owner fixture. */
function fixture(extra = {}) {
  let item = {
    code: "invitation",
    enterpriseCode: "business",
    revision: 4,
    status: "ACTIVE",
    active: true,
    ...extra,
  };
  const enterprise = { code: "business", defaultAdminAssignmentCode: "other" };
  const calls = [];
  const command = {
    assignmentCode: item.code,
    revision: 4,
    operationId: "withdraw_123456789",
  };
  const digest = (value) =>
    createHash("sha256").update(JSON.stringify(value)).digest("hex");
  const actor = {
    tenantCode: "staff",
    recordKind: "EMPLOYEE",
    recordId: "administrator",
  };
  const teamOperation = {
    id: command.operationId,
    phase: "PENDING",
    operation: "WITHDRAW",
    input: command,
    actor,
    hash: digest({
      operation: "WITHDRAW",
      input: command,
      identity: actor,
      enterpriseCode: enterprise.code,
    }),
  };
  global.CONFIG = {
    get: () => ({
      teamAdministration: { invitationWithdrawalQualified: true },
    }),
  };
  const owner = {
    ...implementation,
    fail: (suffix) => {
      throw new Error(suffix);
    },
    begin: async () => ({ ...enterprise, teamOperation }),
    finish: async (_lease, value) => {
      calls.push("finish");
      return value;
    },
    memberships: () => ({
      digest,
      base: () => ({ input: (value) => value }),
      assignment: async () => ({ item, enterprise }),
      administrator: async () => calls.push("admit"),
      write: async (_old, patch) => {
        calls.push("write");
        item = { ...item, ...patch, revision: item.revision + 1 };
        return item;
      },
      registerMembership: async () => calls.push("stamp"),
      project: (value) => ({
        code: value.code,
        status: value.status,
        revision: value.revision,
      }),
    }),
  };
  return {
    owner,
    calls,
    request: { body: command },
    get item() {
      return item;
    },
  };
}
test("unused invitation is retained inactive rather than deleting identity/history", async () => {
  global.CONFIG = {};
  const f = fixture();
  const result = await f.owner.withdrawInvitation(f.request);
  assert.deepEqual(result, {
    code: "invitation",
    status: "REVOKED",
    revision: 5,
  });
  assert.equal(f.item.active, false);
  assert.equal(
    f.item.invitationWithdrawal.operationId,
    f.request.body.operationId,
  );
  assert.deepEqual(f.calls, ["admit", "write", "finish"]);
});
test("started registration, reserved identity and accepted membership cannot be withdrawn", async () => {
  global.CONFIG = {};
  for (const extra of [
    { registration: { phase: "PREPARED" } },
    { identityClaimed: true },
    { membership: { phase: "COMPLETE" } },
    { status: "REGISTERED" },
  ]) {
    const f = fixture(extra);
    await assert.rejects(f.owner.withdrawInvitation(f.request), /CONFLICT/);
    assert.deepEqual(f.calls, ["finish"]);
  }
});
test("same-command replay repairs only exact committed withdrawal evidence without a second write", async () => {
  global.CONFIG = {};
  const f = fixture({
    revision: 5,
    status: "REVOKED",
    active: false,
    invitationWithdrawal: {
      operationId: "withdraw_123456789",
      withdrawnAt: "2026-10-02T00:00:00.000Z",
    },
  });
  await f.owner.withdrawInvitation(f.request);
  assert.deepEqual(f.calls, ["stamp", "admit", "finish"]);
  const mismatch = fixture({
    revision: 6,
    status: "REVOKED",
    active: false,
    invitationWithdrawal: {
      operationId: "withdraw_123456789",
      withdrawnAt: "2026-10-02T00:00:00.000Z",
    },
  });
  await assert.rejects(
    mismatch.owner.withdrawInvitation(mismatch.request),
    /CONFLICT/,
  );
  assert.deepEqual(mismatch.calls, []);
});
