/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
require("./helpers/runtimeEnums.js")();
/** @module loyaltyWallet/test/loyaltyEnterpriseTestCredit @description Isolated contracts for real test-credit, Profile transport, sample safeguards, reward operations and transaction composition. @layer test @owner loyaltyWallet */
const test = require("node:test"), assert = require("node:assert/strict");
const credit = require("../src/service/defaultLoyaltyEnterpriseTestCreditService");
const operations = require("../src/service/defaultLoyaltyRewardOperationService");
const transaction = require("../src/service/defaultLoyaltyTransactionService");
const sample = require("../src/service/defaultLoyaltySampleCreditContributionService");
const participant = require("../src/service/defaultLoyaltyParticipantService");
const clone = value => structuredClone(value);

function fixture(t) {
  const globals = ["SERVICE", "CONFIG", "NODICS", "UTILS", "CLASSES"];
  const previous = globals.map(key => [key, Object.getOwnPropertyDescriptor(global, key)]);
  t.after(() => previous.forEach(([key, descriptor]) => descriptor
    ? Object.defineProperty(global, key, descriptor) : delete global[key]));
  delete global.CLASSES;
  const walletDefaults = clone(require("../config/properties").loyalty);
  const configuration = {
    loyalty: { ...clone(require("../../loyaltyCore/config/properties").loyalty), ...walletDefaults,
      transactions: { ...walletDefaults.transactions, enabled: true },
      enterpriseTestCredits: { ...walletDefaults.enterpriseTestCredits, enabled: true, allowedEnvironments: ["isolated-test"] } },
    runtimeRole: { code: "LOYALTY" },
    databaseTransactions: { enabled: true, failClosed: true, maximumCommitTimeMs: 5000 },
  };
  const rows = {}, database = {}, models = {}, state = {
    environment: "isolated-test", permission: true, profileCalls: [], proofCount: 0, reads: 0, writes: 0, commits: 0,
  };
  const request = { tenant: "tenant", authorization: "Bearer original-human", authData: {
    tenant: "tenant", entCode: "platform", loginId: "administrator", principalType: "human",
    tokenType: "access", authenticationMethod: "PASSWORD", authVersion: 3,
  }, payload: { walletCode: "wallet", programCode: "program", rewardTypeCode: "points", amount: "4.50",
    reason: "Reviewed Enterprise demonstration allocation", idempotencyKey: "command", confirmed: true } };
  global.CONFIG = { get: key => configuration[key] };
  global.UTILS = { createModelName: name => name };
  global.NODICS = { getSelectedEnvironmentName: () => state.environment, getModels: () => models };
  let queue = Promise.resolve();
  global.SERVICE = { DefaultLoyaltyAmountService: require("../../loyaltyCore/src/service/defaultLoyaltyAmountService"),
    DefaultLoyaltyRewardOperationService: operations,
    DefaultLoyaltyTransactionService: transaction,
    DefaultLoyaltySampleCreditContributionService: sample,
    DefaultLoyaltyParticipantService: participant,
    DefaultLoggerService: { assertSensitiveRequest() {} },
    DefaultSecuredRequestPipelineService: { getGrantedPermissions: () => [], isPermissionGranted: () => state.permission },
    DefaultDatabaseModelHandlerService: { inspectIndexes: async () => ({ versioned: false,
      indexes: state.noIndex ? [] : [{ key: { code: 1 }, unique: true }] }) },
    DefaultDatabaseTransactionService: {
      capabilities: () => ({ multiRecordAtomic: true, contextPropagation: true }),
      resolve: () => ({ database }),
      execute: (scope, work) => {
        const pending = queue.then(async () => {
          assert.deepEqual(scope, { tenant: "tenant", moduleName: walletDefaults.transactions.moduleName });
          assert.equal(state.token, undefined, "canonical earn must join the existing transaction");
          const snapshot = clone(rows), token = {}; state.token = token;
          let result;
          try { result = await work(token); state.commits++; }
          catch (error) { for (const name of Object.keys(rows)) rows[name] = snapshot[name]; throw error; }
          finally { state.token = undefined; }
          if (state.loseCommitAck) { state.loseCommitAck = false; throw Error("lost commit acknowledgement"); }
          return result;
        });
        queue = pending.catch(() => {});
        return pending;
      },
    },
    DefaultModuleService: { invokeModule: async call => {
      assert.equal(call.local, false);
      assert.deepEqual(call.targetAuthority, { runtimeRole: "PLATFORM" });
      assert.equal(call.tenant, "tenant");
      assert.equal(call.header.Authorization, request.authorization, "Profile receives the original signed credential");
      assert.equal(call.header["X-Enterprise-Code"], "platform");
      assert.equal(call.methodName, "POST");
      assert.equal(call.maxAttempts, 1);
      state.profileCalls.push(clone(call));
      if (state.profileUnavailable) throw Error("Profile unavailable");
      if (call.apiName === "/participants/resolve") {
        assert.deepEqual(call.requestBody, { ownerType: "ENTERPRISE", ownerCode: "recipient" });
        return { data: { contractVersion: 1, tenant: "tenant", recipient: clone(call.requestBody) } };
      }
      assert.equal(call.apiName, configuration.loyalty.enterpriseTestCredits.platformAdministratorEvidencePath);
      assert.deepEqual(Object.keys(call.requestBody).sort(), ["nonce", "permission"]);
      state.proofCount++;
      const proof = { contractVersion: 1, nonce: call.requestBody.nonce, tenant: "tenant", enterpriseCode: "platform",
        actorCode: request.authData.loginId, principalType: "human", platformAdministrator: true,
        permission: "loyalty.wallet.testCredit", authVersion: request.authData.authVersion };
      state.onProof?.(proof, state.proofCount);
      return { data: proof };
    } },
  };
  for (const name of ["LoyaltyWallet", "LoyaltyWalletRewardBalance", "RewardLedgerEntry", "RewardTestCreditOperation", "LoyaltyProgram", "LoyaltyRewardType"]) {
    rows[name] = [];
    models[name[0].toLowerCase() + name.slice(1)] = { dataBase: database, versioned: false,
      rawSchema: { transaction: { enabled: true, sideEffects: "none" }, cache: { enabled: false }, event: { enabled: false } },
      compareAndSetItem() {} };
    const match = (row, query) => Object.entries(query || {}).every(([key, value]) => row[key] === value);
    const check = r => {
      assert.equal(r.authData.principalType, "service", "generated storage is private after owner admission");
      assert.equal(r.tenant, "tenant");
      assert.ok(state.token, "record reads and writes stay inside the composition");
      assert.equal(r.transactionContext, state.token);
    };
    const write = async r => {
      check(r); state.writes++;
      if (state.failWrite === name) throw Error("synthetic " + name + " failure");
      if (state.dropWrite === name) return { code: "SUC_WRITE" };
      if (r.query) {
        const existing = rows[name].find(row => match(row, r.query));
        if (!existing) throw Error("conditional write conflict");
        Object.assign(existing, clone(r.model));
      } else {
        if (rows[name].some(row => row.code === r.model.code)) throw Error("duplicate identity");
        rows[name].push(clone(r.model));
      }
      if (state.onWrite) state.onWrite(name);
      return { code: "SUC_WRITE", result: clone(r.model) };
    };
    SERVICE["Default" + name + "Service"] = { save: write, update: write, get: async r => {
      check(r); state.reads++;
      return { code: "SUC_READ", result: clone(rows[name].filter(row => match(row, r.query))) };
    } };
  }
  const marks = { sample: true, testOnly: true, testEnvironment: state.environment };
  rows.LoyaltyWallet.push({ code: "wallet", active: true, status: "OPEN", ownerType: "ENTERPRISE", ownerCode: "recipient", metadata: clone(marks) });
  rows.LoyaltyWalletRewardBalance.push({ code: "balance", active: true, walletCode: "wallet", programCode: "program", rewardTypeCode: "points",
    available: "10.00", earned: "10.00", reserved: "0.00", spent: "0.00", expired: "0.00", reversed: "0.00", revision: 0, metadata: clone(marks) });
  rows.LoyaltyProgram.push({ code: "program", active: true, status: "ACTIVE", earningEnabled: true, testCreditRewardTypeCodes: ["points"] });
  rows.LoyaltyRewardType.push({ code: "points", active: true, status: "ACTIVE", unitType: "POINT", precision: 2 });
  return { request, state, rows, models, configuration, run: () => credit.credit(request) };
}

test("real earn, sample safeguards and composition retain original authority and atomically persist test audit", async t => {
  const f = fixture(t), original = clone(f.request), result = await f.run();
  assert.equal(result.status, "CREDITED");
  assert.equal(result.ownerType, "ENTERPRISE");
  assert.equal(result.ownerCode, "recipient");
  assert.equal(result.testOnly, true);
  assert.equal(result.amount, "4.50");
  assert.equal(result.actorCode, "administrator");
  assert.equal(f.rows.LoyaltyWalletRewardBalance[0].available, "14.50");
  assert.equal(f.rows.LoyaltyWalletRewardBalance[0].earned, "14.50");
  assert.equal(f.rows.LoyaltyWalletRewardBalance[0].revision, 1);
  assert.equal(f.rows.RewardLedgerEntry.length, 1);
  assert.equal(f.rows.RewardLedgerEntry[0].entryType, "EARN");
  assert.equal(f.rows.RewardLedgerEntry[0].sourceType, "ENTERPRISE_TEST_CREDIT");
  assert.equal(f.rows.RewardLedgerEntry[0].metadata.testCredit.intent.reason, f.request.payload.reason);
  assert.equal(f.rows.RewardTestCreditOperation[0].ledgerEntryCode, result.ledgerEntryCode);
  assert.equal(f.state.commits, 1);
  assert.equal(f.state.proofCount, 3);
  assert.equal(new Set(f.state.profileCalls.filter(c => c.requestBody.nonce).map(c => c.requestBody.nonce)).size, 3);
  assert.deepEqual(f.request, original);
  assert.equal(f.request.transactionContext, undefined);
});

test("replay after spending preserves original posting and actor without replenishing balance", async t => {
  const f = fixture(t), original = await f.run();
  f.rows.LoyaltyWalletRewardBalance[0].available = "0.00";
  f.rows.LoyaltyWalletRewardBalance[0].spent = "14.50";
  f.rows.LoyaltyWalletRewardBalance[0].revision++;
  f.request.authData.loginId = "second-admin";
  const result = await f.run();
  assert.deepEqual(result, { ...original, status: "CURRENT" });
  assert.equal(f.rows.LoyaltyWalletRewardBalance[0].available, "0.00");
  assert.equal(f.rows.RewardLedgerEntry.length, 1);
});

test("same-key concurrent commands post once through real compose and join", async t => {
  const f = fixture(t), results = await Promise.all([f.run(), f.run()]);
  assert.deepEqual(results.map(r => r.status), ["CREDITED", "CURRENT"]);
  assert.equal(f.rows.RewardLedgerEntry.length, 1);
  assert.equal(f.rows.RewardTestCreditOperation.length, 1);
  assert.equal(f.rows.LoyaltyWalletRewardBalance[0].available, "14.50");
});

test("lost commit acknowledgement is recovered from durable receipt without another credit", async t => {
  const f = fixture(t); f.state.loseCommitAck = true;
  await assert.rejects(f.run(), /lost commit acknowledgement/);
  assert.equal((await f.run()).status, "CURRENT");
  assert.equal(f.rows.RewardLedgerEntry.length, 1);
  assert.equal(f.rows.LoyaltyWalletRewardBalance[0].available, "14.50");
});

test("altered idempotent command and tampered ledger audit are conflicts", async t => {
  const f = fixture(t); await f.run();
  f.request.payload.reason = "Different allocation";
  await assert.rejects(f.run(), { code: "ERR_LOYALTY_TEST_CREDIT_CONFLICT" });
  f.request.payload.reason = "Reviewed Enterprise demonstration allocation";
  f.rows.RewardLedgerEntry[0].metadata.testCredit.actor.actorCode = "forged";
  await assert.rejects(f.run(), { code: "ERR_LOYALTY_TEST_CREDIT_CONFLICT" });
  assert.equal(f.rows.RewardLedgerEntry.length, 1);
});

for (const name of ["LoyaltyWalletRewardBalance", "RewardLedgerEntry", "RewardTestCreditOperation"]) {
  test("rollback includes all participants when " + name + " fails", async t => {
    const f = fixture(t), before = clone(f.rows); f.state.failWrite = name;
    await assert.rejects(f.run(), /synthetic/);
    assert.deepEqual(f.rows, before);
    assert.equal(f.state.commits, 0);
  });
  test("durable readback detects unpersisted acknowledgement from " + name, async t => {
    const f = fixture(t), before = clone(f.rows); f.state.dropWrite = name;
    await assert.rejects(f.run(), { code: "ERR_LOYALTY_TEST_CREDIT_CONFLICT" });
    assert.deepEqual(f.rows, before);
  });
}

test("missing default-off configuration and actual environment mismatch refuse before Profile or storage", async t => {
  const f = fixture(t), selected = clone(f.configuration.loyalty.enterpriseTestCredits);
  for (const policy of [undefined, { ...selected, enabled: false }, { ...selected, allowedEnvironments: [] }]) {
    f.configuration.loyalty.enterpriseTestCredits = policy;
    await assert.rejects(f.run(), { code: "ERR_LOYALTY_TEST_CREDIT_UNAVAILABLE" });
  }
  f.configuration.loyalty.enterpriseTestCredits = selected;
  f.state.environment = "not-approved";
  await assert.rejects(f.run(), { code: "ERR_LOYALTY_TEST_CREDIT_UNAVAILABLE" });
  assert.equal(f.state.profileCalls.length, 0);
  assert.equal(f.state.reads, 0);
});

test("permission and native human access requirements cannot be replaced by a service or role flag", async t => {
  const f = fixture(t), original = clone(f.request.authData);
  for (const patch of [{ principalType: "service" }, { principalType: "customer" }, { isSystem: true },
    { authenticationMethod: "LINKED" }, { tokenType: "refresh" }, { sessionContext: {} }, { authVersion: 0 }, { tenant: "other" }]) {
    f.request.authData = { ...original, ...patch };
    await assert.rejects(f.run(), { code: "ERR_LOYALTY_TEST_CREDIT_FORBIDDEN" });
  }
  f.request.authData = original; f.state.permission = false;
  await assert.rejects(f.run(), { code: "ERR_LOYALTY_TEST_CREDIT_FORBIDDEN" });
  assert.equal(f.state.profileCalls.length, 0);
  assert.equal(f.state.reads, 0);
});

test("fresh nonce, native platform authority, actor, scope and auth version all bind Profile proof", async t => {
  const f = fixture(t);
  for (const patch of [{ nonce: "stale" }, { platformAdministrator: false }, { actorCode: "other" }, { tenant: "other" },
    { enterpriseCode: "recipient" }, { principalType: "service" }, { authVersion: 2 }, { permission: "loyalty.wallet.transfer" }]) {
    f.state.onProof = proof => Object.assign(proof, patch);
    await assert.rejects(f.run(), { code: "ERR_LOYALTY_TEST_CREDIT_FORBIDDEN" });
  }
  assert.equal(f.state.reads, 0);
});

test("Profile unavailability is not treated as platform authority", async t => {
  const f = fixture(t); f.state.profileUnavailable = true;
  await assert.rejects(f.run(), /Profile unavailable/);
  assert.equal(f.state.reads, 0);
});

test("revocation observed after posting rolls back receipt and accounting", async t => {
  const f = fixture(t), before = clone(f.rows);
  f.state.onProof = (proof, count) => { if (count === 3) proof.platformAdministrator = false; };
  await assert.rejects(f.run(), { code: "ERR_LOYALTY_TEST_CREDIT_FORBIDDEN" });
  assert.deepEqual(f.rows, before);
});

test("original credential and command mutation during evidence lookup is refused", async t => {
  const f = fixture(t);
  f.state.onProof = () => { f.request.authorization = "Bearer substituted"; };
  await assert.rejects(f.run(), { code: "ERR_LOYALTY_TEST_CREDIT_FORBIDDEN" });
  assert.equal(f.state.reads, 0);
});

test("environment change during accounting aborts the transaction", async t => {
  const f = fixture(t), before = clone(f.rows);
  f.state.onWrite = () => { f.state.environment = "changed"; };
  await assert.rejects(f.run(), { code: "ERR_LOYALTY_TEST_CREDIT_UNAVAILABLE" });
  assert.deepEqual(f.rows, before);
});

test("client environment, actor, owner, amount number or missing confirmation never grants funding", async t => {
  const f = fixture(t), input = clone(f.request.payload);
  for (const patch of [{ environmentCode: "isolated-test" }, { actorCode: "administrator" }, { ownerType: "ENTERPRISE" },
    { amount: 4.5 }, { confirmed: false }, { reason: " " }, { reason: "line\nbreak" }]) {
    f.request.payload = { ...input, ...patch };
    await assert.rejects(f.run(), { code: "ERR_LOYALTY_TEST_CREDIT_INVALID" });
  }
  assert.equal(f.state.reads, 0);
});

test("production or customer wallet and unmarked balance cannot be silently promoted to test targets", async t => {
  const f = fixture(t), wallet = clone(f.rows.LoyaltyWallet[0]), balance = clone(f.rows.LoyaltyWalletRewardBalance[0]);
  for (const patch of [{ metadata: {} }, { ownerType: "CUSTOMER" }, { status: "CLOSED" },
    { metadata: { sample: true, testOnly: true, testEnvironment: "different" } }]) {
    f.rows.LoyaltyWallet[0] = { ...clone(wallet), ...patch };
    await assert.rejects(f.run(), { code: "ERR_LOYALTY_TEST_CREDIT_INELIGIBLE" });
  }
  f.rows.LoyaltyWallet[0] = wallet;
  f.rows.LoyaltyWalletRewardBalance[0] = { ...balance, metadata: {} };
  await assert.rejects(f.run(), { code: "ERR_LOYALTY_TEST_CREDIT_INELIGIBLE" });
  f.rows.LoyaltyWalletRewardBalance.length = 0;
  await assert.rejects(f.run(), { code: "ERR_LOYALTY_TEST_CREDIT_INELIGIBLE" });
  assert.equal(f.state.writes, 0);
});

test("POINT earning and explicit governed reward selection are required", async t => {
  const f = fixture(t);
  f.rows.LoyaltyProgram[0].testCreditRewardTypeCodes = [];
  await assert.rejects(f.run(), { code: "ERR_LOYALTY_TEST_CREDIT_INELIGIBLE" });
  f.rows.LoyaltyProgram[0].testCreditRewardTypeCodes = ["points"];
  f.rows.LoyaltyRewardType[0].unitType = "CARBON";
  await assert.rejects(f.run(), { code: "ERR_LOYALTY_SAMPLE_CREDIT_UNAVAILABLE" });
  f.rows.LoyaltyRewardType[0].unitType = "POINT";
  f.rows.LoyaltyProgram[0].earningEnabled = false;
  await assert.rejects(f.run(), { code: "ERR_LOYALTY_SAMPLE_CREDIT_UNAVAILABLE" });
  assert.equal(f.state.writes, 0);
});

test("zero, negative and excess precision cannot be credited; exact decimal precision is governed", async t => {
  const f = fixture(t);
  for (const amount of ["0", "-1", "0.001", "NaN", "1e4"]) {
    f.request.payload.amount = amount;
    await assert.rejects(f.run());
  }
  assert.equal(f.state.writes, 0);
  f.request.payload.amount = "0.01";
  assert.equal((await f.run()).amount, "0.01");
  assert.equal(f.rows.LoyaltyWalletRewardBalance[0].available, "10.01");
});

test("unqualified transaction, database model and unique index refuse before record access", async t => {
  const f = fixture(t);
  f.configuration.loyalty.transactions.enabled = false;
  await assert.rejects(f.run());
  f.configuration.loyalty.transactions.enabled = true;
  f.state.noIndex = true;
  await assert.rejects(f.run());
  f.state.noIndex = false;
  f.models.rewardTestCreditOperation.dataBase = {};
  await assert.rejects(f.run(), { code: "ERR_LOYALTY_TEST_CREDIT_UNAVAILABLE" });
  assert.equal(f.state.reads, 0);
  assert.equal(f.state.writes, 0);
});
