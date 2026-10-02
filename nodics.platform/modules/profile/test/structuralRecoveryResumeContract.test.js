/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/**
 * @module profile/test/structuralRecoveryResumeContract
 * @description Covers reviewed structural crash resumption, original operation
 * fences, monotonic checkpoints and exact-state refusal. No runtime apply occurs.
 * @layer test
 * @owner profile
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const source = require("../src/service/identity/defaultIdentityGovernanceMigrationService");

function fixture(status = "FAILED", appliedChangeCount = 0) {
  global.CLASSES = { NodicsError: class extends Error {} };
  const changes = [0, 1].map((index) => ({ code: String(index) }));
  const audit = {
    code: "audit",
    status,
    planFingerprint: "a".repeat(64),
    appliedChangeCount,
    preview: { changes, changeCount: changes.length },
    ...(status === "RECOVERING"
      ? { recoveryOperationId: "1b62a7a0-03ee-40b3-a143-739e9ae3e202" }
      : {}),
  };
  const states = changes.map((_, index) =>
    index < appliedChangeCount ? "AFTER" : "BEFORE",
  );
  const writes = [];
  const fences = [];
  const owner = {
    ...source,
    getPolicy: () => ({ recoveryInspectionMaximumChanges: 10 }),
    recoveryAudit: async () => structuredClone(audit),
    structuralChangeState: async (_, change) => {
      const state = states[Number(change.code)];
      if (!["BEFORE", "AFTER"].includes(state)) throw Error("drift");
      return state;
    },
    updatePrincipal: async (_, change) => {
      writes.push(change.code);
      states[Number(change.code)] = "AFTER";
    },
    updateAudit: async (_, code, from, patch, expected) => {
      assert.equal(code, audit.code);
      assert.equal(audit.status, from, "phase fence");
      for (const [key, value] of Object.entries(expected))
        assert.equal(audit[key], value, key + " fence");
      fences.push(structuredClone(expected));
      Object.assign(audit, structuredClone(patch));
      return structuredClone(audit);
    },
  };
  return { owner, audit, states, writes, fences };
}

test("interruption after an owner write resumes without a second write", async () => {
  const f = fixture();
  const update = f.owner.updateAudit;
  let failed = false;
  f.owner.updateAudit = async (...args) => {
    if (!failed && args[3].appliedChangeCount === 1) {
      failed = true;
      throw Error("checkpoint unavailable");
    }
    return update(...args);
  };
  await assert.rejects(f.owner.recoverReviewedMigration({}), /checkpoint/);
  assert.equal(f.audit.status, "RECOVERING");
  const originalFence = f.audit.recoveryOperationId;
  assert.deepEqual(f.writes, ["0"]);
  f.owner.updateAudit = update;
  const result = await f.owner.recoverReviewedMigration({});
  assert.equal(result.data.status, "APPLIED");
  assert.deepEqual(f.writes, ["0", "1"]);
  assert.equal(f.audit.recoveryOperationId, originalFence);
  assert.equal(f.audit.appliedChangeCount, 2);
});

test("an interrupted recovery retains the original operation and completed prefix", async () => {
  const f = fixture("RECOVERING", 1);
  const original = f.audit.recoveryOperationId;
  await f.owner.recoverReviewedMigration({});
  assert.deepEqual(f.writes, ["1"]);
  assert.equal(f.audit.recoveryOperationId, original);
  assert.equal(f.fences[0].appliedChangeCount, 1);
  assert.equal(f.fences[1].appliedChangeCount, 2);
});

test("completed recovery is read-only under unchanged exact post-state", async () => {
  const f = fixture("RECOVERING", 2);
  f.audit.status = "APPLIED";
  f.audit.result = { recovered: true };
  await f.owner.recoverReviewedMigration({});
  assert.deepEqual(f.writes, []);
  assert.deepEqual(f.fences, []);
  f.states[0] = "BEFORE";
  await assert.rejects(f.owner.recoverReviewedMigration({}));
});

test("record drift and a forged operation fence never acquire recovery", async () => {
  const f = fixture("RECOVERING");
  f.states[0] = "DRIFT";
  await assert.rejects(f.owner.recoverReviewedMigration({}), /drift/);
  assert.deepEqual(f.writes, []);
  f.states[0] = "BEFORE";
  f.audit.recoveryOperationId = "caller-selected";
  await assert.rejects(f.owner.recoverReviewedMigration({}));
  assert.deepEqual(f.writes, []);
});

test("late checkpoint conflicts do not lower acknowledged recovery progress", async () => {
  const f = fixture("RECOVERING");
  const update = f.owner.updateAudit;
  f.owner.updateAudit = async (...args) => {
    if (args[3].appliedChangeCount === 1) {
      f.audit.appliedChangeCount = 2;
      throw Error("another continuation advanced");
    }
    return update(...args);
  };
  await assert.rejects(f.owner.recoverReviewedMigration({}), /advanced/);
  assert.equal(f.audit.appliedChangeCount, 2);
  assert.equal(f.audit.status, "RECOVERING");
});

test("later-layer recovery bounds are honored before acquiring any operation", async () => {
  const f = fixture();
  f.owner.getPolicy = () => ({ recoveryInspectionMaximumChanges: 1 });
  await assert.rejects(f.owner.recoverReviewedMigration({}));
  assert.deepEqual(f.writes, []);
  assert.deepEqual(f.fences, []);
});
