/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const amounts = require("../../loyaltyCore/src/service/defaultLoyaltyAmountService");
const properties = require("../config/properties");

const source = "../src/service/acceptance/defaultLoyaltyParticipantTransferAcceptanceService.mjs";

function selection() {
  return {
    contractVersion: 1,
    approvalReference: "reviewed-local-transfer",
    runCode: "transfer-acceptance-001",
    programCode: "program",
    rewardTypeCode: "points",
    scale: 2,
    customer: { ownerCode: "customer-one" },
    enterprise: { ownerCode: "enterprise-one" },
    expectedFeeAmount: "1.00",
    enterprisePolicy: {
      feeAmount: "1.00",
      maximumAmount: "5.00",
      maximumDailyAmount: "20.00",
      maximumDailyCount: 4,
      timeZone: "UTC",
    },
    limitProbeAmount: "5.01",
    transfers: {
      customerToEnterprise: { amount: "2.00" },
      enterpriseToCustomer: { amount: "3.00" },
    },
  };
}

function liveFixture() {
  const selected = selection();
  const owners = {
    customerToken: { type: "CUSTOMER", code: selected.customer.ownerCode, wallet: "wallet-customer" },
    enterpriseToken: { type: "ENTERPRISE", code: selected.enterprise.ownerCode, wallet: "wallet-enterprise" },
  };
  const balances = {
    customerToken: { available: "20.00", reserved: "0.00", spent: "0.00", earned: "20.00" },
    enterpriseToken: { available: "20.00", reserved: "0.00", spent: "0.00", earned: "20.00" },
  };
  const entries = { customerToken: [], enterpriseToken: [] };
  const operations = new Map();
  let rawSubmissions = 0;
  const actor = options => {
    const token = options?.headers?.Authorization?.replace("Bearer ", "");
    assert.ok(owners[token], "known participant token required");
    return token;
  };
  const body = options => JSON.parse(options.body);
  const status = (token, key) => operations.get(token + ":" + key) || {
    status: "UNCONFIRMED",
    operationCode: "unconfirmed-" + token + "-" + key,
  };
  const projection = token => ({
    owner: { ownerType: owners[token].type, ownerCode: owners[token].code, actorCode: token + "-actor" },
    wallet: { code: owners[token].wallet, ownerType: owners[token].type, ownerCode: owners[token].code, status: "OPEN" },
    balances: [{ code: "balance-" + token, programCode: selected.programCode, rewardTypeCode: selected.rewardTypeCode,
      name: "Points", precision: selected.scale, ...balances[token], reversed: "0.00", expired: "0.00",
      transferEligible: true, transferFeeAmount: selected.expectedFeeAmount }],
    entries: structuredClone(entries[token]),
  });
  const execute = (token, command) => {
    const key = token + ":" + command.idempotencyKey;
    if (operations.has(key)) return operations.get(key);
    if (amounts.compare(command.amount, selected.enterprisePolicy.maximumAmount, selected.scale) > 0)
      throw Error("Per-transfer limit exceeded");
    const recipientToken = Object.keys(owners).find(candidate => owners[candidate].type === command.recipient.ownerType &&
      owners[candidate].code === command.recipient.ownerCode);
    assert.ok(recipientToken);
    const operationCode = "operation-" + command.idempotencyKey;
    const debit = amounts.add(command.amount, selected.expectedFeeAmount, selected.scale);
    balances[token].available = amounts.subtract(balances[token].available, debit, selected.scale);
    balances[token].spent = amounts.add(balances[token].spent, debit, selected.scale);
    balances[recipientToken].available = amounts.add(balances[recipientToken].available, command.amount, selected.scale);
    balances[recipientToken].earned = amounts.add(balances[recipientToken].earned, command.amount, selected.scale);
    const result = { status: "COMPLETED", amount: command.amount, feeAmount: selected.expectedFeeAmount,
      debitEntryCode: "debit-" + command.idempotencyKey, creditEntryCode: "credit-" + command.idempotencyKey, operationCode };
    entries[token].unshift({ code: result.debitEntryCode, programCode: selected.programCode, rewardTypeCode: selected.rewardTypeCode,
      entryType: "CAPTURE", amount: debit, sourceType: "WALLET_TRANSFER", sourceCode: operationCode, postedAt: new Date().toISOString() });
    entries[recipientToken].unshift({ code: result.creditEntryCode, programCode: selected.programCode, rewardTypeCode: selected.rewardTypeCode,
      entryType: "EARN", amount: command.amount, sourceType: "WALLET_TRANSFER", sourceCode: operationCode, postedAt: new Date().toISOString() });
    operations.set(key, result);
    return result;
  };
  const context = {
    request: async (role, path, options = {}) => {
      assert.equal(role, "LOYALTY");
      if (path === "/nodics/system/v0/contract/openapi") return { paths: {
        "/nodics/loyaltyApi/v0/participant/wallet": { get: {} },
        "/nodics/loyaltyApi/v0/participant/reward-transfers": { post: {} },
        "/nodics/loyaltyApi/v0/participant/reward-transfers/{operationKey}": { get: {} },
        "/nodics/loyaltyApi/v0/participant/transfer-policy/read": { post: {} },
      } };
      const token = actor(options);
      if (path.endsWith("/wallet")) return projection(token);
      if (path.endsWith("/transfer-policy/read")) return { ownerType: "ENTERPRISE", ownerCode: selected.enterprise.ownerCode,
        effective: { enabled: true, outgoingEnabled: true, incomingEnabled: true, ...selected.enterprisePolicy } };
      if (path.includes("/reward-transfers/") && options.method !== "POST")
        return status(token, decodeURIComponent(path.split("/").at(-1)));
      if (path.endsWith("/reward-transfers")) return execute(token, body(options));
      assert.fail("unexpected path " + path);
    },
    raw: async (role, path, options) => {
      rawSubmissions++;
      try {
        const result = await context.request(role, path, options);
        return new Response(JSON.stringify({ data: result }), { status: 200, headers: { "Content-Type": "application/json" } });
      } catch (error) {
        return new Response(JSON.stringify({ code: "ERR_LOYALTY_TRANSFER", message: error.message }),
          { status: 400, headers: { "Content-Type": "application/json" } });
      }
    },
  };
  return { selected, context, actors: { customer: "customerToken", enterprise: "enterpriseToken" }, balances, entries,
    operations, rawSubmissions: () => rawSubmissions };
}

test("live runner verifies owner separation, fees, limit refusal, uncertain recovery and duplicate replay", async () => {
  const api = await import(source);
  const fixture = liveFixture();
  const report = await api.runLoyaltyParticipantTransferAcceptance({
    execute: true, selection: fixture.selected, actors: fixture.actors, context: fixture.context,
  });
  assert.equal(report.state, "PASSED");
  assert.equal(report.walletAuthority, "LOYALTY");
  assert.equal(report.customerDefaultsAdded, false);
  assert.equal(report.policy.rejectedAmount, "5.01");
  assert.equal(report.transfers.length, 2);
  assert.equal(report.transfers[0].uncertainRecoveryVerified, true);
  assert.ok(report.transfers.every(item => item.duplicateReplayVerified && item.ownerIsolationVerified));
  assert.equal(fixture.rawSubmissions(), 1);
  assert.equal(fixture.operations.size, 2);
  assert.equal(JSON.stringify(report).includes("customerToken"), false);
  assert.equal(JSON.stringify(report).includes("enterpriseToken"), false);
});

test("completed original commands recover without another balance movement", async () => {
  const api = await import(source);
  const fixture = liveFixture();
  const first = await api.runLoyaltyParticipantTransferAcceptance({
    execute: true, selection: fixture.selected, actors: fixture.actors, context: fixture.context,
  });
  const balances = structuredClone(fixture.balances);
  const entries = structuredClone(fixture.entries);
  const second = await api.runLoyaltyParticipantTransferAcceptance({
    execute: true, selection: fixture.selected, actors: fixture.actors, context: fixture.context,
  });
  assert.equal(first.state, "PASSED");
  assert.equal(second.state, "RECOVERED");
  assert.ok(second.transfers.every(item => item.mode === "RECOVERED"));
  assert.deepEqual(fixture.balances, balances);
  assert.deepEqual(fixture.entries, entries);
  assert.equal(fixture.operations.size, 2);
});

test("reviewed selections require distinct owners, a bounded excess-limit probe and no extra authority fields", async () => {
  const api = await import(source);
  const valid = selection();
  assert.equal(api.validateLoyaltyParticipantTransferAcceptanceSelection(valid).runCode, valid.runCode);
  assert.equal(api.validateLoyaltyParticipantTransferAcceptanceSelection({ ...valid,
    expectedFeeAmount: "1", enterprisePolicy: { ...valid.enterprisePolicy, feeAmount: "1" },
    transfers: { ...valid.transfers, customerToEnterprise: { amount: "2" } },
  }).transfers.customerToEnterprise.amount, "2.00");
  await assert.rejects(async () => api.validateLoyaltyParticipantTransferAcceptanceSelection({ ...valid, tenant: "hidden" }), /invalid/);
  await assert.rejects(async () => api.validateLoyaltyParticipantTransferAcceptanceSelection({
    ...valid, enterprise: { ownerCode: valid.customer.ownerCode },
  }), /distinct owner/);
  await assert.rejects(async () => api.validateLoyaltyParticipantTransferAcceptanceSelection({ ...valid, limitProbeAmount: "5.00" }), /must exceed/);
  await assert.rejects(async () => api.validateLoyaltyParticipantTransferAcceptanceSelection({ ...valid, expectedFeeAmount: "-1.00",
    enterprisePolicy: { ...valid.enterprisePolicy, feeAmount: "-1.00" } }), /cannot be negative/);
  await assert.rejects(async () => api.runLoyaltyParticipantTransferAcceptance({ selection: valid }), /requires --execute/);
});

test("registered owner command accepts exactly one explicit reviewed selection", async () => {
  const api = await import(source);
  assert.deepEqual(properties.tooling.commands["acceptance:loyalty-participant-transfer"], {
    acceptanceContract: true,
    projectHome: true,
    handler: "@nTooling/node-script",
    script: "src/service/acceptance/defaultLoyaltyParticipantTransferAcceptanceService.mjs",
  });
  assert.equal(api.loyaltyParticipantTransferAcceptanceArgument(["--execute", "--selection=/tmp/reviewed.json"]),
    "/tmp/reviewed.json");
  assert.throws(() => api.loyaltyParticipantTransferAcceptanceArgument(["--execute"]), /Exactly one/);
  assert.throws(() => api.loyaltyParticipantTransferAcceptanceArgument([
    "--execute", "--selection=/tmp/a.json", "--selection=/tmp/b.json",
  ]), /Exactly one/);
  assert.throws(() => api.loyaltyParticipantTransferAcceptanceArgument(["--execute", "--selection=/tmp/a.json", "--seed"]), /Unsupported/);
});
