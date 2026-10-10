/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module loyaltyWallet/test/loyaltySampleCreditContribution @description Verifies qualified nImport credit instructions, exact replay and transactional rollback with real Loyalty amount/posting logic. @layer test @owner loyaltyWallet */
const test = require("node:test"), assert = require("node:assert/strict");
const owner = require("../src/service/defaultLoyaltySampleCreditContributionService");
const operations = require("../src/service/defaultLoyaltyRewardOperationService");
let policy, request, payload, stores, writes, token, failLedger, requireToken, database;
const source = { releaseCode: "example.app:localDemoCredit", version: "0.0.1", checksum: "a".repeat(64) };
const clone = value => structuredClone(value);
const match = (row, query) => Object.entries(query).every(([key, value]) => row[key] === value);
function storage(name) {
  return {
    get: async r => {
      if (requireToken) assert.equal(r.transactionContext, token);
      assert.equal(r.authData.tenant, "tenant");
      assert.equal(r.searchOptions.pageSize, 2);
      return { code: "SUC_DBS_00000", result: stores[name].filter(row => match(row, r.query)).map(clone) };
    },
    update: async r => {
      assert.equal(r.transactionContext, token);
      const index = stores[name].findIndex(row => match(row, r.query));
      if (index < 0) return { code: "SUC_DBS_00000", result: { matchedCount: 0 } };
      stores[name][index] = clone(r.model); writes++;
      return { code: "SUC_DBS_00000", result: { matchedCount: 1 } };
    },
    save: async r => {
      assert.equal(r.transactionContext, token);
      assert.equal(r.options.insertOnly, true);
      if (failLedger) throw Error("ledger unavailable");
      if (stores[name].some(row => row.code === r.model.code)) throw Error("duplicate");
      stores[name].push(clone(r.model)); writes++;
      return { code: "SUC_DBS_00000", result: clone(r.model) };
    },
  };
}
test.beforeEach(() => {
  policy = { environment: { class: "LOCAL" }, runtimeRole: { code: "LOYALTY" }, loyalty: {
    transactions: { enabled: true }, sampleCredits: { enabled: true, maximumInstructions: 100,
      allowedEnvironments: ["exampleLocal"], approvedSources: [{ ...source, environmentCode: "exampleLocal",
        enterpriseCode: "merchant", instructionCode: "demo-credit", approvalReference: "approved-demo-credit" }] } } };
  request = { tenant: "tenant", authData: { tenant: "tenant", entCode: "merchant", loginId: "operator",
    principalType: "human", tokenType: "access", permissions: ["loyalty.sampleCredit.apply"] },
    contribution: { ...source, destinationRole: "LOYALTY", lifecycle: "OPERATIONAL_VERSIONED", selectionPolicy: "EXPLICIT", dataType: "sample" } };
  payload = { contractVersion: 1, credits: [{ code: "demo-credit", customerCode: "buyer", walletCode: "wallet",
    programCode: "program", rewardTypeCode: "points", amount: "7645", approvalReference: "approved-demo-credit",
    expectedBalance: { available: "118", reserved: "0", earned: "118", spent: "0", expired: "0", reversed: "0", revision: 0 } }] };
  stores = { wallet: [{ code: "wallet", ownerType: "CUSTOMER", ownerCode: "buyer", status: "OPEN", active: true, metadata: { sample: true } }],
    balance: [{ code: "balance", walletCode: "wallet", programCode: "program", rewardTypeCode: "points", ...clone(payload.credits[0].expectedBalance), active: true, metadata: { sample: true } }],
    ledger: [], program: [{ code: "program", status: "ACTIVE", earningEnabled: true }],
    reward: [{ code: "points", status: "ACTIVE", unitType: "POINT", precision: 2 }] };
  writes = 0; failLedger = false; requireToken = false;
  global.CONFIG = { get: key => policy[key] };
  global.UTILS = { createModelName: name => name };
  database = {};
  global.NODICS = { getSelectedEnvironmentName: () => "exampleLocal", getModels: () => Object.fromEntries(
    ["loyaltyWallet", "loyaltyWalletRewardBalance", "rewardLedgerEntry"].map(name => [name, { versioned: false, dataBase: database,
      compareAndSetItem() {}, rawSchema: { transaction: { enabled: true, sideEffects: "none" }, cache: { enabled: false }, event: { enabled: false } } }])) };
  global.SERVICE = { DefaultLoyaltyRewardOperationService: operations,
    DefaultDataReleaseService: { readContributionPayload: async (contribution, installer, basename) => {
      assert.deepEqual(contribution, request.contribution); assert.equal(installer, "LOYALTY_SAMPLE_CREDITS");
      assert.equal(basename, "loyaltyCredits.json"); return clone(payload);
    } },
    DefaultSecuredRequestPipelineService: { getGrantedPermissions: r => r.authData.permissions,
      isPermissionGranted: (permission, grants) => grants.includes(permission) },
    DefaultDatabaseModelHandlerService: { inspectIndexes: async () => ({ versioned: false, indexes: [{ key: { code: 1 }, unique: true }] }) },
    DefaultLoyaltyWalletService: storage("wallet"), DefaultLoyaltyWalletRewardBalanceService: storage("balance"),
    DefaultRewardLedgerEntryService: storage("ledger"), DefaultLoyaltyProgramService: storage("program"),
    DefaultLoyaltyRewardTypeService: storage("reward"),
    DefaultLoyaltyTransactionService: { qualify() { return { scope: { moduleName: "loyaltyWallet", tenant: "tenant" },
      owner: { resolve(scope) { assert.deepEqual(scope, { moduleName: "loyaltyWallet", tenant: "tenant" }); return { database }; } } }; }, run: async (r, work) => {
      const before = clone(stores); token = Object.freeze({ token: true }); r.transactionContext = token; requireToken = true;
      try { return await work(); } catch (error) { stores = before; throw error; }
      finally { delete r.transactionContext; requireToken = false; }
    } },
  };
});
test.afterEach(() => { for (const key of ["CONFIG", "UTILS", "NODICS", "SERVICE"]) delete global[key]; });

test("preflight exposes only fixed gate labels and never provider diagnostics or records", async () => {
  policy.loyalty.sampleCredits.enabled = false;
  assert.deepEqual(await owner.preflightContribution(request), { ready: false,
    blocker: { owner: "loyaltyWallet", code: "ERR_LOYALTY_SAMPLE_CREDIT_UNAVAILABLE", gate: "HUMAN_CONTEXT" } });
  policy.loyalty.sampleCredits.enabled = true;
  stores.wallet[0].metadata.sample = false;
  const result = await owner.preflightContribution(request);
  assert.equal(result.blocker.gate, "SAMPLE_WALLET_ELIGIBILITY");
  assert.equal(writes, 0);
  assert.equal(JSON.stringify(result).includes('walletCode'), false);
});

test("read-only preflight and atomic credit preserve caller and original balance snapshots", async () => {
  const before = clone(request);
  assert.equal((await owner.preflightContribution(request)).ready, true);
  assert.equal(writes, 0);
  const result = await owner.installContribution(request);
  assert.equal(result.data.receipts[0].action, "CREDITED");
  assert.equal(stores.balance[0].available, "7763.00");
  assert.equal(stores.balance[0].earned, "7763.00");
  assert.equal(stores.balance[0].revision, 1);
  assert.equal(stores.ledger.length, 1);
  assert.equal(stores.ledger[0].amount, "7645.00");
  assert.equal(stores.ledger[0].entryType, "EARN");
  assert.equal(stores.ledger[0].metadata.sampleCredit.localDemoOnly, true);
  assert.equal(stores.ledger[0].metadata.operatorCode, "operator");
  assert.deepEqual(request, before);
  assert.deepEqual(payload.credits[0].expectedBalance, { available: "118", reserved: "0", earned: "118", spent: "0", expired: "0", reversed: "0", revision: 0 });
});
test("schema qualification reports only the failed fixed condition before writes", async () => {
  const models = NODICS.getModels();
  NODICS.getModels = () => models;
  for (const [gate, change] of [
    ["SCHEMA_MODEL", model => delete models.loyaltyWalletRewardBalance],
    ["SCHEMA_DATABASE", model => { model.dataBase = {}; }],
    ["SCHEMA_VERSIONING", model => { model.versioned = true; }],
    ["SCHEMA_TRANSACTION", model => { model.rawSchema.transaction.enabled = false; }],
    ["SCHEMA_CACHE", model => { model.rawSchema.cache.enabled = true; }],
    ["SCHEMA_EVENT", model => { model.rawSchema.event.enabled = true; }],
    ["SCHEMA_COMPARE_AND_SET", model => { delete model.compareAndSetItem; }],
  ]) {
    const original = models.loyaltyWalletRewardBalance;
    models.loyaltyWalletRewardBalance = { ...original, rawSchema: clone(original.rawSchema) };
    change(models.loyaltyWalletRewardBalance);
    assert.deepEqual(await owner.preflightContribution(request), { ready: false,
      blocker: { owner: "loyaltyWallet", code: "ERR_LOYALTY_SAMPLE_CREDIT_UNAVAILABLE", gate,
        schema: "loyaltyWallet.loyaltyWalletRewardBalance" } });
    models.loyaltyWalletRewardBalance = original;
    assert.equal(writes, 0);
  }
});
test("original replay remains once-only even after spending and rejects changed intent", async () => {
  await owner.installContribution(request);
  stores.balance[0].available = "100.00"; stores.balance[0].revision = 9;
  const result = await owner.installContribution(request);
  assert.equal(result.data.receipts[0].action, "CURRENT"); assert.equal(writes, 2);
  payload.credits[0].amount = "7646";
  await assert.rejects(owner.installContribution(request), { code: "ERR_LOYALTY_SAMPLE_CREDIT_CONFLICT" });
  assert.equal(stores.balance[0].available, "100.00"); assert.equal(writes, 2);
});
test("ledger interruption rolls back the balance and original retry posts once", async () => {
  failLedger = true;
  await assert.rejects(owner.installContribution(request), /ledger unavailable/);
  assert.equal(stores.balance[0].available, "118"); assert.equal(stores.balance[0].revision, 0); assert.equal(stores.ledger.length, 0);
  failLedger = false; await owner.installContribution(request);
  assert.equal(stores.balance[0].available, "7763.00"); assert.equal(stores.ledger.length, 1);
});
test("unacknowledged balance write cannot commit an orphan ledger posting", async () => {
  SERVICE.DefaultLoyaltyWalletRewardBalanceService.update = async () => ({ code: "SUC_DBS_00000", result: { matchedCount: 0 } });
  await assert.rejects(owner.installContribution(request), { code: "ERR_LOYALTY_SAMPLE_CREDIT_CONFLICT" });
  assert.equal(stores.balance[0].available, "118"); assert.equal(stores.ledger.length, 0);
});
test("explicit failed write acknowledgements abort even when in-transaction data was written", async () => {
  const save = SERVICE.DefaultRewardLedgerEntryService.save;
  for (const refusal of [{ code: "ERR_DBS_WRITE" }, { code: "SUC_DBS_00000", acknowledged: false },
    { code: "SUC_DBS_00000", result: { acknowledged: false } }]) {
    SERVICE.DefaultRewardLedgerEntryService.save = async r => { await save(r); return refusal; };
    await assert.rejects(owner.installContribution(request), { code: "ERR_LOYALTY_SAMPLE_CREDIT_CONFLICT" });
    assert.equal(stores.balance[0].available, "118"); assert.equal(stores.ledger.length, 0);
  }
  SERVICE.DefaultRewardLedgerEntryService.save = save;
  const update = SERVICE.DefaultLoyaltyWalletRewardBalanceService.update;
  SERVICE.DefaultLoyaltyWalletRewardBalanceService.update = async r => { await update(r);
    return { code: "SUC_DBS_00000", result: { acknowledged: false } }; };
  await assert.rejects(owner.installContribution(request), { code: "ERR_LOYALTY_SAMPLE_CREDIT_CONFLICT" });
  assert.equal(stores.balance[0].available, "118"); assert.equal(stores.ledger.length, 0);
});
test("missing, foreign, closed, non-sample or ambiguous wallets never open or receive credit", async () => {
  for (const alteration of [() => { stores.wallet = []; }, () => { stores.wallet[0].ownerCode = "other"; },
    () => { stores.wallet[0].status = "CLOSED"; }, () => { stores.wallet[0].metadata.sample = false; },
    () => { stores.wallet.push(clone(stores.wallet[0])); }]) {
    const original = clone(stores); alteration();
    assert.equal((await owner.preflightContribution(request)).ready, false);
    assert.equal(writes, 0); stores = original;
  }
});
test("independent human permission, Local class, exact source and atomic provider are mandatory", async () => {
  for (const alter of [() => { request.authData.permissions = []; }, () => { request.authData.permissions = ["loyalty.rewards.earn"]; },
    () => { delete request.authData.loginId; }, () => { request.authData.principalType = "service"; },
    () => { policy.environment.class = "PRODUCTION"; }, () => { policy.loyalty.sampleCredits.enabled = false; },
    () => { policy.loyalty.sampleCredits.allowedEnvironments = []; }, () => { request.enterpriseCode = "foreign"; },
    () => { policy.loyalty.sampleCredits.approvedSources[0].checksum = "b".repeat(64); },
    () => { policy.loyalty.transactions.enabled = false; }]) {
    const originalPolicy = clone(policy), originalRequest = clone(request); alter();
    assert.equal((await owner.preflightContribution(request)).ready, false); assert.equal(writes, 0);
    policy = originalPolicy; request = originalRequest;
  }
});
test("balance revision drift, carbon units, ambiguous ledger and sparse identity indexes refuse", async () => {
  for (const alter of [() => { stores.balance[0].revision = 1; }, () => { stores.reward[0].unitType = "CREDIT"; },
    () => { SERVICE.DefaultDatabaseModelHandlerService.inspectIndexes = async () => ({ versioned: false, indexes: [{ key: { code: 1 }, unique: true, sparse: true }] }); }]) {
    const original = clone(stores), inspect = SERVICE.DefaultDatabaseModelHandlerService.inspectIndexes; alter();
    assert.equal((await owner.preflightContribution(request)).ready, false); assert.equal(writes, 0);
    stores = original; SERVICE.DefaultDatabaseModelHandlerService.inspectIndexes = inspect;
  }
});
test("nImport installer does not accept generic snapshots, paths, duplicate tuples or body approvals", async () => {
  for (const alter of [() => { payload.path = "/tmp/credit"; }, () => { payload.credits[0].balance = "999999"; },
    () => { payload.credits.push(clone(payload.credits[0])); }, () => { request.contribution.selectionPolicy = "DEFAULT"; },
    () => { request.contribution.destinationRole = "COMMERCE"; }]) {
    const original = clone(payload), originalRequest = clone(request); alter();
    assert.equal((await owner.preflightContribution(request)).ready, false); assert.equal(writes, 0);
    payload = original; request = originalRequest;
  }
});
test("preflight refuses foreign or missing schema database wrappers before transaction work", async () => {
  const getModels = NODICS.getModels;
  for (const moduleName of ["loyaltyWallet", "loyaltyLedger"]) {
    NODICS.getModels = (name, tenant) => {
      const models = getModels(name, tenant);
      if (name === moduleName) for (const model of Object.values(models)) model.dataBase = {};
      return models;
    };
    assert.equal((await owner.preflightContribution(request)).ready, false);
    await assert.rejects(owner.installContribution(request), { code: "ERR_LOYALTY_SAMPLE_CREDIT_UNAVAILABLE" });
    assert.equal(writes, 0);
  }
  NODICS.getModels = getModels;
  SERVICE.DefaultLoyaltyTransactionService.qualify = () => ({ scope: {}, owner: { resolve() { throw Error("unavailable"); } } });
  assert.equal((await owner.preflightContribution(request)).ready, false);
  assert.equal(writes, 0);
});
test("database mismatch identifies only the fixed schema before any generated record reads", async () => {
  const getModels = NODICS.getModels;
  NODICS.getModels = (name, tenant) => {
    const models = getModels(name, tenant);
    if (name === "loyaltyLedger") models.rewardLedgerEntry.dataBase = { credentials: "never-output", client: "never-output" };
    return models;
  };
  for (const serviceName of ["DefaultLoyaltyWalletService", "DefaultLoyaltyWalletRewardBalanceService",
    "DefaultRewardLedgerEntryService", "DefaultLoyaltyProgramService", "DefaultLoyaltyRewardTypeService"])
    SERVICE[serviceName].get = async () => { throw Error("record read forbidden during schema qualification"); };
  assert.deepEqual(await owner.preflightContribution(request), { ready: false, blocker: {
    owner: "loyaltyWallet", code: "ERR_LOYALTY_SAMPLE_CREDIT_UNAVAILABLE", gate: "SCHEMA_DATABASE",
    schema: "loyaltyLedger.rewardLedgerEntry" } });
  assert.equal(writes, 0);
});
test("later failure metadata cannot expose an unlisted schema or provider details", async () => {
  const customized = { ...owner, persistence() {
    const error = Object.assign(Error("provider secrets never-output"), { code: "ERR_LOYALTY_SAMPLE_CREDIT_UNAVAILABLE",
      sampleCreditGate: "SCHEMA_DATABASE", sampleCreditSchema: "private.record-never-output" });
    throw error;
  } };
  assert.deepEqual(await customized.preflightContribution(request), { ready: false, blocker: {
    owner: "loyaltyWallet", code: "ERR_LOYALTY_SAMPLE_CREDIT_UNAVAILABLE", gate: "SCHEMA_DATABASE" } });
  assert.equal(writes, 0);
});
test("later owner customization can narrow admission without replacing posting or bypassing checks", async () => {
  const customized = { ...owner, instruction(input) { const result = owner.instruction.call(this, input);
    if (Number(result.amount) > 1000) this.fail("ERR_LOYALTY_SAMPLE_CREDIT_INVALID"); return result; } };
  assert.equal((await customized.preflightContribution(request)).ready, false);
  assert.equal((await owner.preflightContribution(request)).ready, true); assert.equal(writes, 0);
});
