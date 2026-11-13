/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const definition = require("../src/service/operations/defaultBackofficeOperationalReadinessService");
const harness = require("./support/repairEvidenceHarness");
const properties = require("../config/properties");
global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message || code); this.code = code; } } };
global.CONFIG = { get: key => properties[key] };
const request = (key = "repair-original-key", overrides = {}) => ({
  tenant: "tenant-a", authData: { principalType: "human", tokenType: "access", loginId: "admin", tenant: "tenant-a" },
  readinessRepair: { idempotencyKey: key, dryRun: false, operation: "owner.repair", action: "REPAIR",
    ownerModule: "testOwner", available: true, eligibility: "MANUAL", correlationId: "review-1",
    targetIdentifiers: { sourceCode: "record-1" }, context: { expectedVersion: "1" }, ...overrides }
});
function setup() {
  const h = harness();
  global.SERVICE = h.services;
  const owner = { calls: 0, authorized: true, confirmed: false,
    authorizeRepair: async function () { if (!this.authorized) throw new CLASSES.NodicsError("ERR_AUTH_00003"); return true; },
    repairCapability: () => ({ available: true, supportedOperations: [{ operation: "owner.repair", action: "REPAIR" }] }),
    result: () => ({ completionVerified: true, state: "COMPLETED", changedCount: 1, evidenceReference: "owner-receipt-1" }),
    executeRepair: async function () { this.calls++; this.confirmed = true; return this.result(); },
    reconcileRepair: async function () { return this.confirmed ? this.result() : undefined; }
  };
  const fresh = () => {
    const dispatcher = Object.assign({}, definition, { _repairProviderRegistry: Object.create(null),
      _repairProviderCapabilityCache: Object.create(null), _repairAttempts: [],
      _repairTelemetry: { registered: 0, providerRefreshes: 0, executed: 0, completed: 0, failed: 0, blocked: 0, dryRuns: 0 } });
    dispatcher.registerRepairProvider("testOwner", owner);
    return dispatcher;
  };
  return { h, owner, fresh, dispatcher: fresh() };
}
test("restart replays the same verified receipt, while changed intent and revoked owner permission are denied", async () => {
  const { h, owner, fresh, dispatcher } = setup();
  const first = await dispatcher.executeRepair(request());
  assert.equal(first.receipt.durable, true);
  h.restart();
  const replay = await fresh().executeRepair(request());
  assert.equal(replay.receipt.receiptCode, first.receipt.receiptCode);
  assert.equal(replay.idempotentReplay, true); assert.equal(owner.calls, 1);
  await assert.rejects(fresh().executeRepair(request(undefined, { context: { expectedVersion: "2" } })), { code: "ERR_BOF_00102" });
  owner.authorized = false;
  await assert.rejects(fresh().executeRepair(request()), { code: "ERR_AUTH_00003" });
  assert.equal(owner.calls, 1);
});
test("competing identities share one target fence, without cross-actor receipt reuse", async () => {
  const { owner, dispatcher } = setup();
  let started, release;
  const began = new Promise(resolve => { started = resolve; });
  const wait = new Promise(resolve => { release = resolve; });
  owner.executeRepair = async function () { this.calls++; started(); await wait; return this.result(); };
  const first = dispatcher.executeRepair(request());
  await began;
  const other = request("repair-competing-key"); other.authData.loginId = "second";
  assert.equal((await dispatcher.executeRepair(other)).state, "REPAIR_LOCKED");
  release(); await first;
  assert.equal(owner.calls, 1);
});
test("uncertain dispatch survives restart and closes only from exact owner evidence without a second execution", async () => {
  const { h, owner, fresh, dispatcher } = setup();
  owner.executeRepair = async function () { this.calls++; this.confirmed = true; throw new Error("lost owner acknowledgement"); };
  const pending = await dispatcher.executeRepair(request());
  assert.equal(pending.state, "RECONCILIATION_REQUIRED"); assert.equal(pending.retryPolicy.safeToRetry, false);
  h.restart();
  assert.equal((await fresh().executeRepair(request("repair-competing-key"))).state, "REPAIR_LOCKED");
  const recovered = await fresh().executeRepair(request());
  assert.equal(recovered.state, "COMPLETED"); assert.equal(recovered.receipt.durable, true);
  assert.equal(owner.calls, 1); assert.equal(h.state.receipt.size, 1);
});
test("unverified owner result stays fenced across restart and malformed transaction capability fails closed", async () => {
  const { h, owner, fresh, dispatcher } = setup();
  owner.executeRepair = async function () { this.calls++; return { state: "COMPLETED" }; };
  const pending = await dispatcher.executeRepair(request());
  assert.equal(pending.state, "RECONCILIATION_REQUIRED");
  h.restart(); assert.equal((await fresh().executeRepair(request())).state, "RECONCILIATION_REQUIRED");
  assert.equal(owner.calls, 1);
  SERVICE.DefaultDatabaseTransactionService.capabilities = () => ({ multiRecordAtomic: false });
  await assert.rejects(fresh().executeRepair(request("another-target-key", { targetIdentifiers: { sourceCode: "record-2" } })), { code: "ERR_BOF_00101" });
});
test("lost claim acknowledgement is resolved before a single conditional dispatch and tenant mismatch is denied", async () => {
  const { h, owner, dispatcher } = setup();
  h.state.failAcknowledgement = true;
  assert.equal((await dispatcher.executeRepair(request())).state, "COMPLETED");
  assert.equal(owner.calls, 1);
  const foreign = request(); foreign.tenant = "tenant-b";
  await assert.rejects(dispatcher.executeRepair(foreign), { code: "ERR_AUTH_00003" });
});
test("generic batch execution stays refused without invoking the provider", async () => {
  const { owner, dispatcher } = setup();
  assert.equal((await dispatcher.executeRepair(request(undefined, { batch: true }))).state, "BATCH_EXECUTION_DISABLED");
  assert.equal(owner.calls, 0);
});

test("generated receipt and target schemas admit only side-effect-free managed transactions", () => {
  const schemas = require("../src/schemas/schemas").backoffice;
  const transactions = require("../../../../nodics.foundation/modules/nDatabase/database/src/service/transaction/defaultDatabaseTransactionService");
  for (const name of ["backofficeRepairReceipt", "backofficeRepairTarget"]) {
    const schema = schemas[name];
    assert.equal(transactions.assertSchemaEligible({ rawSchema: schema }), true);
    assert.deepEqual(schema.backoffice.concurrency, { managed: true, field: "revision" });
    assert.equal(schema.router.enabled, false);
    assert.equal(schema.definition.revision.default, 1);
  }
});
