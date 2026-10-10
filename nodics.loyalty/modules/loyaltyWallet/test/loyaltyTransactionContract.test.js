/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

/**
 * @module loyaltyWallet/test/loyaltyTransactionContract
 * @description Exercises the optional hook with the real canonical transaction
 * service and an isolated in-memory adapter, including rollback, wrapper scope,
 * token expiry, read-only qualification and later-layer member customization.
 * @layer test
 * @owner loyaltyWallet
 */
const assert = require("node:assert/strict");
const test = require("node:test");
const bridge = require("../src/service/defaultLoyaltyTransactionService");
const rewardOperation = require("../src/service/defaultLoyaltyRewardOperationService");
const canonical = require("../../../../nodics.foundation/modules/nDatabase/database/src/service/transaction/defaultDatabaseTransactionService");
const statuses = require("../../loyaltyCore/src/utils/statusDefinitions");

function fixture(t) {
  const previous = ["CONFIG", "SERVICE", "CLASSES"].map(key => [key, Object.getOwnPropertyDescriptor(global, key)]);
  t.after(() => previous.forEach(([key, descriptor]) => {
    if (descriptor) Object.defineProperty(global, key, descriptor);
    else delete global[key];
  }));
  const state = {
    rows: [], started: 0, committed: 0, aborted: 0, lookups: [],
    capabilities: { multiRecordAtomic: true, contextPropagation: true },
  };
  const settings = {
    loyalty: { transactions: { enabled: true } },
    databaseTransactions: { enabled: true, failClosed: true, maximumCommitTimeMs: 5000 },
  };
  const database = { getOptions: () => ({ connectionHandler: "FixtureTransactionAdapter" }) };
  const databases = Object.fromEntries(["loyaltyWallet", "loyaltyLedger", "loyaltyReservation", "loyaltyRedemption"]
    .map(name => [name, database]));
  const schema = {
    rawSchema: { transaction: { enabled: true, sideEffects: "none" }, cache: { enabled: false }, event: { enabled: false } },
  };
  global.CONFIG = { get: key => settings[key] };
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        assert.ok(statuses[code], "Every bridge refusal must resolve through the shared status owner");
        super(statuses[code].message);
        this.code = code;
        this.responseCode = Number(statuses[code].code);
      }
    },
  };
  global.SERVICE = {
    DefaultLoyaltyTransactionService: bridge,
    DefaultDatabaseTransactionService: canonical,
    DefaultDatabaseConfigurationService: {
      getTenantDatabase: (moduleName, tenant) => {
        state.lookups.push({ moduleName, tenant });
        return tenant === "tenant-a" && databases[moduleName] ? { master: databases[moduleName] } : undefined;
      },
    },
    FixtureTransactionAdapter: {
      transactionCapabilities: () => state.capabilities,
      transactionOperationOptions: context => ({ rows: context.rows }),
      executeTransaction: async (target, options, work) => {
        assert.strictEqual(target, database);
        assert.equal(options.maximumCommitTimeMs, settings.databaseTransactions.maximumCommitTimeMs);
        state.started += 1;
        if (state.failBeforeWork) throw state.failBeforeWork;
        const context = { rows: structuredClone(state.rows) };
        let result;
        try {
          result = await work(context);
        } catch (error) {
          state.aborted += 1;
          throw error;
        }
        state.rows = context.rows;
        state.committed += 1;
        if (state.failAfterCommit) throw state.failAfterCommit;
        return result;
      },
    },
  };
  const request = {
    tenant: "tenant-a", walletCode: "original-wallet",
    authData: { tenant: "tenant-a", principalType: "employee", code: "signed-operator", permissions: ["reviewed.credit"] },
  };
  function rows(r, moduleName = "loyaltyWallet", model = schema) {
    const resolved = canonical.resolve({ moduleName, tenant: r.tenant });
    return canonical.operationOptions(r.transactionContext, resolved.database, model).rows;
  }
  return { state, settings, database, databases, schema, request, rows };
}

test("disabled hook preserves legacy pass-through, request identity and arbitrary prior context", async t => {
  const f = fixture(t);
  delete global.SERVICE.DefaultDatabaseTransactionService;
  for (const policy of [undefined, {}, { transactions: { enabled: false } }, { transactions: { enabled: "true" } }]) {
    f.settings.loyalty = policy;
    f.request.transactionContext = { legacy: true };
    const before = Object.getOwnPropertyDescriptors(f.request);
    let calls = 0;
    const result = await rewardOperation.transaction(f.request, () => {
      calls += 1;
      assert.deepEqual(Object.getOwnPropertyDescriptors(f.request), before);
      return "legacy-result";
    });
    assert.equal(result, "legacy-result");
    assert.equal(calls, 1);
    assert.equal(f.state.started, 0);
    assert.deepEqual(f.state.lookups, []);
    assert.deepEqual(Object.getOwnPropertyDescriptors(f.request), before);
    assert.throws(() => bridge.qualify(f.request), { code: "ERR_LOYALTY_TRANSACTION_UNAVAILABLE" });
  }
  const failure = new Error("legacy callback failed");
  await assert.rejects(bridge.run(f.request, () => { throw failure; }), error => error === failure);
});

test("qualify is synchronous, read-only and selects only effective owner configuration", t => {
  const f = fixture(t);
  f.settings.loyalty.transactions.moduleName = "loyaltyLedger";
  f.request.payload = { moduleName: "foreign", tenant: "foreign", transactionContext: { forged: true } };
  f.request.moduleName = "foreign";
  const before = Object.getOwnPropertyDescriptors(f.request);
  const qualified = bridge.qualify(f.request);
  assert.deepEqual(qualified.scope, { moduleName: "loyaltyLedger", tenant: "tenant-a" });
  assert.strictEqual(qualified.owner, canonical);
  assert.equal(typeof qualified.then, "undefined");
  assert.deepEqual(Object.getOwnPropertyDescriptors(f.request), before);
  assert.equal(f.state.started, 0);
  assert.deepEqual(f.state.rows, []);
  delete f.request.tenant;
  assert.equal(bridge.qualify(f.request).scope.tenant, "tenant-a");
});

test("existing hook keeps one opaque token for all owner writes/postreads and expires it after commit", async t => {
  const f = fixture(t), auth = f.request.authData;
  let token;
  const result = await rewardOperation.transaction(f.request, async () => {
    token = f.request.transactionContext;
    assert.ok(Object.isFrozen(token));
    assert.strictEqual(f.request.authData, auth);
    assert.equal(f.rows(f.request).length, 0);
    f.rows(f.request).push({ code: "balance", available: "25.00" });
    f.rows(f.request, "loyaltyLedger").push({ code: "ledger", amount: "25.00" });
    await Promise.resolve();
    assert.strictEqual(f.request.transactionContext, token);
    assert.equal(f.rows(f.request, "loyaltyReservation").length, 2);
    assert.equal(f.rows(f.request, "loyaltyRedemption").length, 2);
    return "committed-result";
  });
  assert.equal(result, "committed-result");
  assert.equal(f.state.started, 1);
  assert.equal(f.state.committed, 1);
  assert.equal(f.state.rows.length, 2);
  assert.equal(Object.hasOwn(f.request, "transactionContext"), false);
  assert.strictEqual(f.request.authData, auth);
  assert.throws(() => canonical.operationOptions(token, f.database, f.schema), /invalid, expired/);
});

test("failed work aborts staged balance/ledger effects and restores exact property descriptors", async t => {
  for (const descriptor of [undefined,
    { value: undefined, enumerable: false, configurable: true, writable: false },
    { value: undefined, enumerable: true, configurable: false, writable: true }]) {
    await t.test(JSON.stringify(descriptor) || "absent", async child => {
      const f = fixture(child), failure = new Error("ledger rejected");
      if (descriptor) Object.defineProperty(f.request, "transactionContext", descriptor);
      const before = Object.getOwnPropertyDescriptors(f.request);
      let token;
      await assert.rejects(bridge.run(f.request, async () => {
        token = f.request.transactionContext;
        f.rows(f.request).push({ code: "balance" });
        f.rows(f.request, "loyaltyLedger").push({ code: "ledger" });
        await Promise.resolve();
        throw failure;
      }), error => error === failure);
      assert.equal(f.state.aborted, 1);
      assert.deepEqual(f.state.rows, []);
      assert.deepEqual(Object.getOwnPropertyDescriptors(f.request), before);
      assert.throws(() => canonical.operationOptions(token, f.database, f.schema), /invalid, expired/);
    });
  }
});

test("provider failures before work and uncertain commit acknowledgements never run fallback work", async t => {
  const f = fixture(t), failure = new Error("provider acknowledgement lost");
  f.state.failBeforeWork = failure;
  let calls = 0;
  await assert.rejects(bridge.run(f.request, () => { calls += 1; }), error => error === failure);
  assert.equal(calls, 0);
  assert.equal(Object.hasOwn(f.request, "transactionContext"), false);
  delete f.state.failBeforeWork;
  f.state.failAfterCommit = failure;
  await assert.rejects(bridge.run(f.request, () => {
    calls += 1;
    f.rows(f.request).push({ code: "retained-original-evidence" });
  }), error => error === failure);
  assert.equal(calls, 1);
  assert.equal(f.state.rows.length, 1);
  assert.equal(Object.hasOwn(f.request, "transactionContext"), false);
});

test("unqualified canonical owners, configuration and capabilities refuse before work", async t => {
  const cases = {
    databaseDisabled: f => { f.settings.databaseTransactions.enabled = false; },
    failOpen: f => { f.settings.databaseTransactions.failClosed = false; },
    missingConfig: f => { delete f.settings.databaseTransactions; },
    invalidTimeout: f => { f.settings.databaseTransactions.maximumCommitTimeMs = 0; },
    fractionalTimeout: f => { f.settings.databaseTransactions.maximumCommitTimeMs = 1.5; },
    missingOwner: () => { delete global.SERVICE.DefaultDatabaseTransactionService; },
    missingExecute: () => { global.SERVICE.DefaultDatabaseTransactionService = { capabilities: canonical.capabilities }; },
    missingCapabilities: () => { global.SERVICE.DefaultDatabaseTransactionService = { execute: canonical.execute }; },
    missingAtomicity: f => { delete f.state.capabilities.multiRecordAtomic; },
    falseAtomicity: f => { f.state.capabilities.multiRecordAtomic = false; },
    missingPropagation: f => { delete f.state.capabilities.contextPropagation; },
    falsePropagation: f => { f.state.capabilities.contextPropagation = false; },
    truthyPropagation: f => { f.state.capabilities.contextPropagation = "true"; },
    unavailableWrapper: f => { delete f.databases.loyaltyWallet; },
    capabilityFailure: () => { global.SERVICE.DefaultDatabaseTransactionService = {
      execute: canonical.execute, capabilities: () => { throw new Error("private provider diagnostic"); },
    }; },
  };
  for (const [name, change] of Object.entries(cases)) {
    await t.test(name, async child => {
      const f = fixture(child);
      change(f);
      assert.throws(() => bridge.qualify(f.request), { code: "ERR_LOYALTY_TRANSACTION_UNAVAILABLE", responseCode: 503 });
      await assert.rejects(bridge.run(f.request, () => assert.fail("work must not start")),
        { code: "ERR_LOYALTY_TRANSACTION_UNAVAILABLE" });
      assert.equal(f.state.started, 0);
      assert.equal(Object.hasOwn(f.request, "transactionContext"), false);
    });
  }
});

test("invalid scope, supplied contexts and unsafe request slots refuse without replacement", async t => {
  const cases = {
    missingTenant: f => { delete f.request.tenant; delete f.request.authData.tenant; },
    conflictingTenant: f => { f.request.authData.tenant = "foreign"; },
    emptyTenant: f => { f.request.tenant = ""; },
    normalizedTenant: f => { f.request.tenant = " tenant-a "; },
    invalidOwnerModule: f => { f.settings.loyalty.transactions.moduleName = ""; },
  };
  for (const [name, change] of Object.entries(cases)) {
    await t.test(name, async child => {
      const f = fixture(child);
      change(f);
      await assert.rejects(bridge.run(f.request, () => assert.fail("work must not start")), { code: "ERR_LOYALTY_TRANSACTION_SCOPE" });
      assert.equal(f.state.started, 0);
    });
  }
  for (const value of [{ forged: true }, null, false, 0, ""]) {
    await t.test("supplied " + JSON.stringify(value), async child => {
      const f = fixture(child);
      f.request.transactionContext = value;
      await assert.rejects(bridge.run(f.request, () => assert.fail("work must not start")), { code: "ERR_LOYALTY_TRANSACTION_CONTEXT" });
      assert.strictEqual(f.request.transactionContext, value);
      assert.equal(f.state.started, 0);
    });
  }
  for (const kind of ["accessor", "frozen", "inherited"]) {
    await t.test(kind, async child => {
      const f = fixture(child);
      if (kind === "accessor") Object.defineProperty(f.request, "transactionContext", { get: () => assert.fail("getter must not run") });
      if (kind === "frozen") Object.freeze(f.request);
      if (kind === "inherited") Object.setPrototypeOf(f.request, { transactionContext: { forged: true } });
      const before = Object.getOwnPropertyDescriptors(f.request);
      await assert.rejects(bridge.run(f.request, () => assert.fail("work must not start")), { code: "ERR_LOYALTY_TRANSACTION_CONTEXT" });
      assert.deepEqual(Object.getOwnPropertyDescriptors(f.request), before);
      assert.equal(f.state.started, 0);
    });
  }
});

test("nested valid, foreign and expired tokens cannot join or widen canonical scope", async t => {
  const f = fixture(t);
  let token;
  await bridge.run(f.request, async () => {
    token = f.request.transactionContext;
    for (const nested of [f.request, { ...f.request }, { ...f.request, tenant: "foreign" }]) {
      await assert.rejects(bridge.run(nested, () => assert.fail("nested work must not start")), { code: "ERR_LOYALTY_TRANSACTION_CONTEXT" });
      assert.strictEqual(nested.transactionContext, token);
    }
    assert.equal(f.state.started, 1);
    assert.strictEqual(f.request.transactionContext, token);
  });
  await assert.rejects(bridge.run({ ...f.request, transactionContext: token }, () => assert.fail("expired token must refuse")),
    { code: "ERR_LOYALTY_TRANSACTION_CONTEXT" });
  assert.equal(f.state.started, 1);
});

test("canonical wrapper and schema eligibility remain enforced for participating child models", async t => {
  const f = fixture(t);
  f.databases.loyaltyLedger = { getOptions: f.database.getOptions };
  await assert.rejects(bridge.run(f.request, () => {
    f.rows(f.request).push({ code: "staged-balance" });
    f.rows(f.request, "loyaltyLedger");
  }), /another database/);
  assert.deepEqual(f.state.rows, []);
  f.databases.loyaltyLedger = f.database;
  await assert.rejects(bridge.run(f.request, () => f.rows(f.request, "loyaltyLedger", {
    rawSchema: { transaction: { enabled: false } },
  })), /not enabled/);
  await assert.rejects(bridge.run(f.request, () => f.rows(f.request, "loyaltyLedger", {
    rawSchema: { transaction: { enabled: true, sideEffects: "none" }, event: { enabled: true } },
  })), /side effects/);
  assert.equal(Object.hasOwn(f.request, "transactionContext"), false);
});

test("later-layer scope and qualify members are honored through the effective service object", async t => {
  const f = fixture(t);
  let qualified = 0, scoped = 0;
  const customized = Object.assign({}, bridge, {
    scope: function (request, policy) {
      scoped += 1;
      return bridge.scope.call(this, request, { ...policy, moduleName: "loyaltyLedger" });
    },
    qualify: function (request) {
      qualified += 1;
      return bridge.qualify.call(this, request);
    },
  });
  global.SERVICE.DefaultLoyaltyTransactionService = customized;
  await rewardOperation.transaction(f.request, () => f.rows(f.request).push({ code: "customized" }));
  assert.equal(qualified, 1);
  assert.equal(scoped, 1);
  assert.deepEqual(f.state.lookups[0], { moduleName: "loyaltyLedger", tenant: "tenant-a" });
});

test("invalid work and missing canonical token fail with owner codes", async t => {
  const f = fixture(t);
  await assert.rejects(bridge.run(f.request), { code: "ERR_LOYALTY_TRANSACTION_OPERATION", responseCode: 400 });
  global.SERVICE.DefaultDatabaseTransactionService = {
    capabilities: () => f.state.capabilities,
    execute: async (_scope, work) => work(undefined),
  };
  await assert.rejects(bridge.run(f.request, () => assert.fail("no token must refuse")), { code: "ERR_LOYALTY_TRANSACTION_CONTEXT" });
  assert.equal(Object.hasOwn(f.request, "transactionContext"), false);
});
