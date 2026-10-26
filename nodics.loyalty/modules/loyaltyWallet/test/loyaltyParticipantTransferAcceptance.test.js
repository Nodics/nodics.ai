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
const tokens = Object.fromEntries(["customerToken", "enterpriseToken", "policyToken"].map(actor =>
  [actor, "header." + Buffer.from(JSON.stringify({ entCode: actor === "enterpriseToken" ? "enterprise-one" : "default", actor })).toString("base64url") + ".signature"]));

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
    const token = Object.keys(tokens).find(key => tokens[key] === options?.headers?.Authorization?.replace("Bearer ", ""));
    assert.ok(owners[token], "known participant token required");
    assert.equal(options.headers["x-enterprise-code"], token === "enterpriseToken" ? "enterprise-one" : "default");
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
      throw Object.assign(Error("Private detail omitted"), { code: "ERR_LOYALTY_TRANSFER_AMOUNT_LIMIT" });
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
      if (path === "/nodics/system/v0/contract/openapi") {
        assert.equal(options.headers.Authorization, "Bearer " + tokens.policyToken);
        assert.equal(options.headers["x-enterprise-code"], "default");
        return { paths: {
        "/nodics/loyaltyApi/v0/participant/wallet": { get: {} },
        "/nodics/loyaltyApi/v0/participant/reward-transfers": { post: {} },
        "/nodics/loyaltyApi/v0/participant/reward-transfers/{operationKey}": { get: {} },
        "/nodics/loyaltyApi/v0/participant/transfer-policy/read": { post: {} },
        } };
      }
      if (path.endsWith("/transfer-policy/read")) {
        assert.equal(options.headers.Authorization, "Bearer " + tokens.policyToken);
        assert.equal(options.headers["x-enterprise-code"], "default");
        assert.deepEqual(body(options), { enterpriseCode: selected.enterprise.ownerCode,
          programCode: selected.programCode, rewardTypeCode: selected.rewardTypeCode });
        return { ownerType: "ENTERPRISE", ownerCode: selected.enterprise.ownerCode,
          programCode: selected.programCode, rewardTypeCode: selected.rewardTypeCode,
          effective: { enabled: true, outgoingEnabled: true, incomingEnabled: true, ...selected.enterprisePolicy } };
      }
      const token = actor(options);
      if (path.endsWith("/wallet")) return projection(token);
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
        return new Response(JSON.stringify({ code: error.code || "ERR_LOYALTY_TRANSFER", message: error.message }),
          { status: 409, headers: { "Content-Type": "application/json" } });
      }
    },
  };
  return { selected, context, actors: { customer: tokens.customerToken, enterprise: tokens.enterpriseToken }, balances, entries,
    operations, rawSubmissions: () => rawSubmissions };
}

test("live runner verifies owner separation, fees, limit refusal, uncertain recovery and duplicate replay", async () => {
  const api = await import(source);
  const fixture = liveFixture();
  const report = await api.runLoyaltyParticipantTransferAcceptance({
    execute: true, selection: fixture.selected, actors: fixture.actors, policyReadToken: tokens.policyToken, context: fixture.context,
  });
  assert.equal(report.state, "PASSED");
  assert.equal(report.walletAuthority, "LOYALTY");
  assert.equal(report.customerDefaultsAdded, false);
  assert.equal(report.policy.rejectedAmount, "5.01");
  assert.equal(report.transfers.length, 2);
  assert.equal(report.transfers[0].uncertainRecoveryVerified, true);
  assert.ok(report.transfers.every(item => item.duplicateReplayVerified && item.ownerIsolationVerified));
  assert.equal(fixture.rawSubmissions(), 2);
  assert.equal(report.policy.refusalCode, "ERR_LOYALTY_TRANSFER_AMOUNT_LIMIT");
  assert.equal(report.policy.refusalHttpStatus, 409);
  assert.equal(fixture.operations.size, 2);
  assert.equal(JSON.stringify(report).includes("customerToken"), false);
  assert.equal(JSON.stringify(report).includes("enterpriseToken"), false);
  assert.equal(JSON.stringify(report).includes("policyToken"), false);
});

test("completed original commands recover without another balance movement", async () => {
  const api = await import(source);
  const fixture = liveFixture();
  const first = await api.runLoyaltyParticipantTransferAcceptance({
    execute: true, selection: fixture.selected, actors: fixture.actors, policyReadToken: tokens.policyToken, context: fixture.context,
  });
  const balances = structuredClone(fixture.balances);
  const entries = structuredClone(fixture.entries);
  const second = await api.runLoyaltyParticipantTransferAcceptance({
    execute: true, selection: fixture.selected, actors: fixture.actors, policyReadToken: tokens.policyToken, context: fixture.context,
  });
  assert.equal(first.state, "PASSED");
  assert.equal(second.state, "RECOVERED");
  assert.ok(second.transfers.every(item => item.mode === "RECOVERED"));
  assert.deepEqual(fixture.balances, balances);
  assert.deepEqual(fixture.entries, entries);
  assert.equal(fixture.operations.size, 2);
});

test("policy credentials and exact owner evidence fail closed before any transfer probe", async () => {
  const api = await import(source);
  for (const policyReadToken of [undefined, "", tokens.customerToken, tokens.enterpriseToken]) {
    const fixture = liveFixture();
    let calls = 0;
    fixture.context.request = async () => { calls++; assert.fail("No API call allowed"); };
    await assert.rejects(api.runLoyaltyParticipantTransferAcceptance({ execute: true,
      selection: fixture.selected, actors: fixture.actors, policyReadToken, context: fixture.context }),
    /policy-read bearer|distinct from both/);
    assert.equal(calls, 0);
  }
  for (const mismatch of [{ ownerType: "CUSTOMER" }, { ownerCode: "default" },
    { programCode: "other" }, { rewardTypeCode: "other" }, null]) {
    const fixture = liveFixture();
    const request = fixture.context.request;
    let probes = 0;
    fixture.context.request = async (role, path, options) => {
      if (path.endsWith("/transfer-policy/read")) {
        if (!mismatch) throw Error("Policy read denied");
        return { ...await request(role, path, options), ...mismatch };
      }
      if (options?.method === "POST") probes++;
      return request(role, path, options);
    };
    await assert.rejects(api.runLoyaltyParticipantTransferAcceptance({ execute: true,
      selection: fixture.selected, actors: fixture.actors, policyReadToken: tokens.policyToken, context: fixture.context }),
    /exact reviewed Enterprise|Policy read denied/);
    assert.equal(probes, 0);
    assert.equal(fixture.operations.size, 0);
  }
});

test("missing or different real policy limits never authorize a probe or become fixture defaults", async () => {
  const api = await import(source);
  for (const patch of [{ maximumAmount: null }, { maximumAmount: "10.00" },
    { maximumDailyAmount: null }, { maximumDailyCount: null }, { maximumDailyCount: 5 }]) {
    const fixture = liveFixture(), request = fixture.context.request;
    let mutations = 0;
    fixture.context.request = async (role, path, options) => {
      if (path.endsWith("/transfer-policy/read")) {
        const result = await request(role, path, options);
        return { ...result, effective: { ...result.effective, ...patch } };
      }
      if (options?.method === "POST") mutations++;
      return request(role, path, options);
    };
    await assert.rejects(api.runLoyaltyParticipantTransferAcceptance({ execute: true,
      selection: fixture.selected, actors: fixture.actors, policyReadToken: tokens.policyToken, context: fixture.context }),
    /effective policy changed/);
    assert.equal(mutations, 0); assert.equal(fixture.operations.size, 0);
  }
});

test("limit proof rejects generic conflicts, spoofed messages and wrong HTTP status", async () => {
  const api = await import(source);
  for (const [status, code] of [[409, "ERR_LOYALTY_TRANSFER"], [403, "ERR_LOYALTY_TRANSFER_AMOUNT_LIMIT"],
    [200, "ERR_LOYALTY_TRANSFER_AMOUNT_LIMIT"]]) {
    const fixture = liveFixture();
    fixture.context.raw = async () => new Response(JSON.stringify({ code, message: "Per-transfer limit exceeded" }), { status });
    await assert.rejects(api.runLoyaltyParticipantTransferAcceptance({ execute: true,
      selection: fixture.selected, actors: fixture.actors, policyReadToken: tokens.policyToken, context: fixture.context }),
    /did not refuse the reviewed probe/);
    assert.equal(fixture.operations.size, 0);
  }
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
