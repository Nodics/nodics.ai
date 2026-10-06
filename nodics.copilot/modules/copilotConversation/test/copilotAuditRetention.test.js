/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
/** @module copilotConversation/test/copilotAuditRetention @description Independent audit policy, holds, transaction rollback and original-operation recovery. @layer test @owner copilotConversation */
"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { isDeepStrictEqual } = require("node:util");
const owner = require("../src/service/defaultCopilotAuditRetentionService");
const retention = require("../src/service/defaultCopilotRetentionExecutionService");
/** Creates isolated durable-owner doubles; never deletes deployed data. */
function fixture(t, kind = "TRANSCRIPT_ACCESS") {
  const old = {
    SERVICE: global.SERVICE,
    CONFIG: global.CONFIG,
    CLASSES: global.CLASSES,
  };
  t.after(() => Object.assign(global, old));
  const scope = { tenantCode: "tenant", enterpriseCode: "enterprise" };
  const policy = {
    ...scope,
    kind,
    retentionDays: 1,
    holdAll: false,
    recordCodes: [],
    conversationCodes: [],
  };
  const config = {
    conversation: {
      storage: "GENERATED_SERVICE",
      auditRetention: {
        deletionEnabled: true,
        maximumBatch: 2,
        enterprisePolicies: [policy],
      },
    },
  };
  const request = {
    tenant: "tenant",
    authData: {
      loginId: "operator",
      entCode: "enterprise",
      permissions: ["copilot.audit.retention.execute"],
      principalType: "human",
      tokenType: "access",
    },
    body: { kind, reason: "Approved independent retention" },
  };
  const state = {
    rows: [
      {
        ...scope,
        code: "oldAudit",
        principalCode: "employee",
        conversationCode: "conversation",
        occurredAt: "2020-01-01T00:00:00.000Z",
        outcome: "READ_AUTHORIZED",
        updatedAt: "2020-01-01T00:00:00.000Z",
        state: "EXECUTED",
      },
    ],
    journal: null,
    fence: null,
    removes: 0,
    lose: false,
    failRemove: false,
    corrupt: false,
  };
  const matches = (row, query) =>
    Object.entries(query).every(([key, value]) =>
      value?.$in
        ? value.$in.includes(row[key])
        : value?.$nin
          ? !value.$nin.includes(row[key])
          : value?.$lt
            ? new Date(row[key]) < value.$lt
            : isDeepStrictEqual(row[key], value),
    );
  const envelope = (result) => ({
    code: "SUC_CPC_00000",
    result: structuredClone(result),
  });
  const store = {
    get: async (r) => {
      if (r.internalPersistence === "DURABLE_JOURNAL")
        assert.deepEqual(Object.keys(r.searchOptions).sort(), ["pageNumber", "pageSize"]);
      return envelope(
        state.rows
          .filter((row) => matches(row, r.query))
          .slice(0, r.searchOptions.pageSize)
          .map((row) =>
            state.corrupt ? { ...row, enterpriseCode: "foreign" } : row,
          ),
      );
    },
    remove: async (r) => {
      state.removes++;
      const before = state.rows.length;
      state.rows = state.rows.filter((row) => !matches(row, r.query));
      if (state.failRemove) throw new Error("failed");
      return envelope({ deletedCount: before - state.rows.length });
    },
  };
  global.CLASSES = { NodicsError: class extends Error {} };
  global.CONFIG = {
    get: (key) =>
      key === "databaseTransactions"
        ? { enabled: true, failClosed: true }
        : key === "runtimePropertyGovernance"
          ? {
              readFence: {
                enabled: true,
                owners: { copilotConversation: true },
              },
            }
          : config,
  };
  global.SERVICE = {
    DefaultCopilotRetentionExecutionService: retention,
    DefaultCopilotActivityService: {
      scope: (r) => ({
        tenantCode: r.tenant,
        enterpriseCode: r.authData.entCode,
      }),
    },
    DefaultCopilotConversationService: {
      identity: (r) => ({ principalCode: r.authData.loginId }),
    },
    DefaultCopilotAdministrationService: {
      current: async () => ({
        configuration: config,
        revision: "a".repeat(64),
      }),
    },
    DefaultRuntimePropertyPersistenceService: {
      policy: () => ({ enabled: true, requireDurableJournal: true }),
    },
    DefaultCopilotTranscriptAccessService: store,
    DefaultCopilotActionService: store,
    DefaultCopilotAuditRetentionOperationService: {
      get: async (r) =>
        envelope(
          state.journal && matches(state.journal, r.query)
            ? [state.journal]
            : [],
        ),
      save: async (r) => {
        assert.equal(r.options.insertOnly, true);
        if (state.journal) throw new Error("duplicate");
        state.journal = structuredClone(r.model);
        return envelope(state.journal);
      },
      update: async (r) => {
        const matched = state.journal && matches(state.journal, r.query);
        if (matched) Object.assign(state.journal, structuredClone(r.model));
        return envelope({ matchedCount: matched ? 1 : 0 });
      },
    },
    DefaultRuntimePropertyReadFenceService: {
      acquire: async (r, intent) => {
        if (state.fence) throw new Error("held");
        state.fence = { ...intent, token: "private-token" };
        return state.fence;
      },
      inspect: async () => state.fence,
      release: async () => {
        state.fence = null;
      },
    },
    DefaultDatabaseTransactionService: {
      capabilities: () => ({ multiRecordAtomic: true, journaledCommit: true }),
      execute: async (options, operation) => {
        const previous = structuredClone({
          rows: state.rows,
          journal: state.journal,
        });
        try {
          await operation({ opaque: true });
        } catch (error) {
          Object.assign(state, previous);
          throw error;
        }
        if (state.lose) throw new Error("commit response lost");
      },
    },
  };
  return {
    request,
    policy,
    state,
    config,
    async command() {
      const review = await owner.preview(request);
      return {
        ...request,
        body: {
          ...request.body,
          operationCode: review.operationCode,
          cutoff: review.cutoff,
          reviewDigest: review.reviewDigest,
          confirmed: true,
        },
      };
    },
  };
}
test("independent audit deletion commits receipt atomically, excludes held rows and never deletes again", async (t) => {
  const f = fixture(t);
  f.state.rows.push({ ...f.state.rows[0], code: "heldAudit" });
  f.policy.recordCodes = ["heldAudit"];
  const command = await f.command();
  assert.equal(f.state.removes, 0);
  const result = await owner.execute(command);
  assert.equal(result.state, "COMPLETED");
  assert.equal(result.removed, 1);
  assert.deepEqual(
    f.state.rows.map((row) => row.code),
    ["heldAudit"],
  );
  assert.equal(f.state.fence, null);
  await assert.rejects(owner.execute(command));
  assert.equal(f.state.removes, 1);
  assert.equal(JSON.stringify(result).includes("heldAudit"), false);
});
test("lost commit response is reconciled only by original inspection; disabled deletion still permits release", async (t) => {
  const f = fixture(t);
  const command = await f.command();
  f.state.lose = true;
  await assert.rejects(owner.execute(command));
  assert.equal(f.state.rows.length, 0);
  f.config.conversation.auditRetention.deletionEnabled = false;
  const request = {
    ...f.request,
    body: { operationCode: command.body.operationCode },
  };
  assert.equal((await owner.inspect(request)).state, "COMPLETED");
  assert.equal(f.state.removes, 1);
  f.state.lose = false;
  assert.equal((await owner.stop(request)).state, "COMPLETED");
  assert.equal(f.state.fence, null);
});
test("original audit inspection rejects altered journal evidence and foreign actors", async (t) => {
  const f = fixture(t);
  const command = await f.command();
  await owner.execute(command);
  const read = {
    ...f.request,
    body: { operationCode: command.body.operationCode },
  };
  const original = structuredClone(f.state.journal.evidence);
  for (const patch of [
    { cutoff: "2021-01-01T00:00:00.000Z" },
    { reason: "changed" },
    { removed: 0 },
    { selected: [{ code: "foreign", digest: "b".repeat(64) }] },
  ]) {
    f.state.journal.evidence = { ...original, ...patch };
    await assert.rejects(owner.inspect(read));
  }
  f.state.journal.evidence = original;
  assert.equal(
    (
      await owner.inspect({
        ...read,
        authData: { ...read.authData, loginId: "foreign" },
      })
    ).state,
    "OUTCOME_UNKNOWN",
  );
  assert.equal(f.state.removes, 1);
});
test("terminal standalone actions can expire without inventing a conversation association", async (t) => {
  const f = fixture(t, "ACTION");
  delete f.state.rows[0].conversationCode;
  const command = await f.command();
  assert.equal((await owner.execute(command)).removed, 1);
});
test("failed delete transaction rolls back and can be explicitly stopped without replay", async (t) => {
  const f = fixture(t);
  const command = await f.command();
  f.state.failRemove = true;
  await assert.rejects(owner.execute(command));
  assert.equal(f.state.rows.length, 1);
  assert.equal(f.state.journal.state, "PREPARED");
  assert.equal(
    (
      await owner.stop({
        ...f.request,
        body: { operationCode: command.body.operationCode },
      })
    ).state,
    "STOPPED",
  );
  assert.equal(f.state.rows.length, 1);
  assert.equal(f.state.removes, 1);
  assert.equal(f.state.fence, null);
});
test("policy changes, holds, foreign rows and independent permission deny before deletion", async (t) => {
  const f = fixture(t);
  const command = await f.command();
  f.policy.holdAll = true;
  await assert.rejects(owner.execute(command));
  f.policy.holdAll = false;
  f.policy.retentionDays = 2;
  await assert.rejects(owner.execute(command));
  f.policy.retentionDays = 1;
  f.state.corrupt = true;
  await assert.rejects(owner.preview(f.request));
  f.state.corrupt = false;
  await assert.rejects(
    owner.preview({
      ...f.request,
      authData: {
        ...f.request.authData,
        permissions: ["copilot.activity.lifecycle.execute"],
      },
    }),
  );
  await assert.rejects(
    owner.preview({
      ...f.request,
      body: { ...f.request.body, kind: "PROVIDER_ACCOUNTING" },
    }),
  );
  assert.equal(f.state.removes, 0);
  assert.equal(f.state.journal, null);
});
test("action audit excludes running, approved and uncertain operations", async (t) => {
  const f = fixture(t, "ACTION");
  for (const state of ["APPROVED", "EXECUTING", "OUTCOME_UNKNOWN"])
    f.state.rows.push({ ...f.state.rows[0], code: state, state });
  const command = await f.command();
  assert.equal((await owner.execute(command)).removed, 1);
  assert.deepEqual(
    f.state.rows.map((row) => row.state),
    ["APPROVED", "EXECUTING", "OUTCOME_UNKNOWN"],
  );
});
