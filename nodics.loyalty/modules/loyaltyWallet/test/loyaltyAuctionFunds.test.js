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
/** @module loyaltyWallet/test/loyaltyAuctionFunds @description Exercises real auction accounting and canonical composition against isolated transactional storage and owner evidence doubles. @layer test @owner loyaltyWallet */
const test = require("node:test"), assert = require("node:assert/strict");
const auctions = require("../src/service/defaultLoyaltyAuctionFundsService");
const operations = require("../src/service/defaultLoyaltyRewardOperationService");
const transactions = require("../src/service/defaultLoyaltyTransactionService");
const participant = require("../src/service/defaultLoyaltyParticipantService");
const clone = value => structuredClone(value);

test("auction refusals retain owner-local HTTP status definitions", () => {
  const statuses = require("../src/utils/statusDefinitions");
  for (const [suffix, code] of Object.entries({ CONFIGURATION: "503", FORBIDDEN: "403",
    PERSISTENCE: "503", FUNDING: "409", TRANSACTION: "503", IDEMPOTENCY: "409", RESERVATION: "409" })) {
    const definition = statuses["ERR_LOYALTY_AUCTION_" + suffix];
    assert.equal(definition?.code, code);
    assert.equal(typeof definition?.message, "string");
    assert.ok(definition.message.length > 0);
  }
});

test("Checkout evidence defaults resolve the concrete router through the real module URL builder", t => {
  const moduleService = require("../../../../nodics.foundation/modules/nService/src/service/module/defaultModuleService");
  const checkout = require("../../../../nodics.commerce/modules/checkout/package.json");
  const checkoutCore = require("../../../../nodics.commerce/modules/checkout/modules/checkoutCore/package.json");
  const routes = require("../../../../nodics.commerce/modules/checkout/modules/checkoutCore/src/router/routers");
  const target = require("../config/properties").loyalty.auctions.checkoutEvidence;
  const descriptors = ["CONFIG", "NODICS"].map(key => [key, Object.getOwnPropertyDescriptor(global, key)]);
  t.after(() => descriptors.forEach(([key, value]) => value ? Object.defineProperty(global, key, value) : delete global[key]));
  global.CONFIG = { get: key => ({ contextRoot: "nodics", defaultContentType: "application/json" })[key] };
  global.NODICS = { getRawModule: name => {
    assert.equal(name, checkoutCore.name);
    return { metaData: { prefix: checkoutCore.name } };
  } };
  assert.equal(checkout.nodics.runtime.router, false);
  assert.equal(checkoutCore.nodics.runtime.router, true);
  assert.equal(target.moduleName, checkoutCore.name);
  const route = routes[target.moduleName].auction.auctionFundsEvidence;
  assert.equal(target.apiName, route.key);
  for (const endpoint of ["https://commerce.example.test", "https://commerce.example.test/nodics/checkoutCore"]) {
    const request = moduleService.buildRuntimeRegistryRequest({ ...target, methodName: route.method }, { endpoint }, {});
    assert.equal(request.uri, "https://commerce.example.test/nodics/checkoutCore/v0/checkout/auction-funds/evidence");
    assert.equal(request.method, "POST");
    assert.equal(request.nodicsContext.moduleName, "checkoutCore");
  }
});

function fixture(t) {
  const descriptors = ["SERVICE", "CONFIG", "CLASSES"].map(key => [key, Object.getOwnPropertyDescriptor(global, key)]);
  t.after(() => descriptors.forEach(([key, value]) => value ? Object.defineProperty(global, key, value) : delete global[key]));
  delete global.CLASSES;
  const defaults = clone(require("../config/properties").loyalty);
  const configuration = { loyalty: { ...clone(require("../../loyaltyCore/config/properties").loyalty),
    ...clone(require("../../loyaltyReservation/config/properties").loyalty), ...defaults,
    transactions: { ...defaults.transactions, enabled: true },
    auctions: { ...defaults.auctions, enabled: true, maximumCommands: 20 } },
    databaseTransactions: { enabled: true, failClosed: true, maximumCommitTimeMs: 5000 } };
  const rows = {}, state = { commits: 0, writes: 0, token: undefined, checkout: false };
  global.CONFIG = { get: key => configuration[key] };
  global.SERVICE = { DefaultLoyaltyAmountService: require("../../loyaltyCore/src/service/defaultLoyaltyAmountService"), DefaultLoyaltyAuctionFundsService: auctions, DefaultLoyaltyRewardOperationService: operations,
    DefaultLoyaltyTransactionService: transactions, DefaultLoyaltyParticipantService: participant,
    DefaultModuleService: { invokeModule: async r => {
      assert.equal(r.header.Authorization, "Bearer original");
      assert.equal(r.tenant, "tenant");
      assert.equal(state.token, undefined, "owner network reads precede the database transaction");
      if (state.ownerError) return { code: "ERR_OWNER" };
      const { operation, command } = r.requestBody;
      const checkout = r.apiName === '/checkout/auction-funds/evidence';
      assert.equal(r.moduleName, checkout ? 'checkoutCore' : 'bidding');
      assert.equal(r.apiName, checkout ? '/checkout/auction-funds/evidence' : '/auctions/funds-evidence');
      assert.equal(r.apiVersion, 'v0');
      assert.equal(r.connectionName, 'commerce');
      if (checkout) return { confirmed: true, tenant: "tenant", operation,
        orderCode: command.orderCode, roundCode: command.roundCode, bidCode: command.sourceCode,
        reservationCode: command.reservationCode, amount: command.amount, idempotencyKey: command.idempotencyKey,
        decision: operation === "capture" ? "CAPTURE" : "RELEASE", receiptCode: "checkout-receipt", terminalFence: !state.unfenced };
      return { confirmed: !state.denied, tenant: "tenant", operation, command: clone(command), checkoutRequired: state.checkout,
        spendAdmission: { confirmed: true, ownerRef: clone(command.ownerRef), actorRef: clone(command.actorRef),
          amount: command.amount, currency: command.currency, actorAuthorized: state.actorAuthorized !== false,
          withinLimit: state.withinLimit !== false } };
    } },
    DefaultDatabaseTransactionService: {
      capabilities: () => ({ multiRecordAtomic: true, contextPropagation: true }),
      execute: async (scope, work) => {
        assert.equal(scope.tenant, "tenant");
        assert.equal(state.token, undefined, "accounting must join the composition");
        const snapshot = clone(rows); state.token = {};
        try { const result = await work(state.token); state.commits++; return result; }
        catch (error) { for (const name of Object.keys(rows)) rows[name] = snapshot[name]; throw error; }
        finally { state.token = undefined; }
      },
    },
  };
  for (const name of ["LoyaltyWallet", "LoyaltyWalletRewardBalance", "LoyaltyProgram", "LoyaltyRewardType",
    "RewardReservation", "RewardLedgerEntry", "RewardRedemption"]) {
    rows[name] = [];
    const match = (row, query) => Object.entries(query || {}).every(([key, value]) => row[key] === value);
    const check = (r, write) => {
      assert.equal(r.tenant, "tenant"); assert.equal(r.authData.principalType, "service");
      if (state.token) assert.equal(r.transactionContext, state.token);
      if (write) assert.ok(state.token, "every accounting write needs the shared transaction");
    };
    const write = async r => {
      check(r, true); state.writes++;
      if (state.failWrite === name || state.failReceipt && r.model.metadata?.auction) throw Error("synthetic interruption");
      if (state.fakeWrite === name) return { code: "SUC_WRITE", result: clone(r.model) };
      if (r.query) {
        const old = rows[name].find(row => match(row, r.query));
        if (!old) throw Error("revision conflict");
        Object.assign(old, clone(r.model));
      } else {
        if (rows[name].some(row => row.code === r.model.code)) throw Error("duplicate");
        rows[name].push(clone(r.model));
      }
      return { code: "SUC_WRITE", result: clone(rows[name].find(row => row.code === r.model.code)) };
    };
    SERVICE["Default" + name + "Service"] = {
      get: async r => { check(r); if (state.readError === name) return { code: "ERR_READ", result: [], count: 0 };
        const result = clone(rows[name].filter(row => match(row, r.query)));
        return { code: "SUC_READ", result, count: result.length }; }, save: write, update: write,
    };
  }
  const add = (name, row) => rows[name].push({ active: true, ...row });
  add("LoyaltyWallet", { code: "wallet", ownerType: "ENTERPRISE", ownerCode: "buyer-enterprise", status: "OPEN",
    metadata: { auctionFunding: [{ enabled: true, programCode: "program", rewardTypeCode: "points", currency: "AED" }] } });
  add("LoyaltyProgram", { code: "program", status: "ACTIVE", spendEnabled: true });
  add("LoyaltyRewardType", { code: "points", status: "ACTIVE", precision: 2 });
  add("LoyaltyWalletRewardBalance", { code: "balance", walletCode: "wallet", programCode: "program", rewardTypeCode: "points",
    available: "10.00", reserved: "0.00", earned: "10.00", spent: "0.00", expired: "0.00", reversed: "0.00", revision: 0 });
  const base = { tenant: "tenant", authorization: "Bearer original", authData: { tenant: "tenant", principalType: "human",
    tokenType: "access", loginId: "employee", entCode: "buyer-enterprise" } };
  const payload = { ownerRef: { module: "profile", schema: "enterprise", code: "buyer-enterprise" },
    actorRef: { principalType: "human", loginId: "employee", code: "employee", enterpriseCode: "buyer-enterprise" },
    walletCode: "wallet", programCode: "program", rewardTypeCode: "points", scale: 2,
    amount: "4.00", currency: "AED", storeCode: "store", sourceType: "BIDDING", sourceCode: "bid", targetType: "AUCTION_ROUND",
    targetCode: "round", roundCode: "round", publicationCode: "publication", idempotencyKey: "reserve", correlationId: "round",
    expiresAt: null, holdUntilRelease: true };
  const request = changes => ({ ...clone(base), payload: { ...clone(payload), ...changes } });
  return { rows, state, configuration, request, reserve: () => auctions.reserve(request()),
    held: () => rows.RewardReservation[0], balance: () => rows.LoyaltyWalletRewardBalance[0],
    command: (key, changes) => request({ reservationCode: rows.RewardReservation[0]?.code, idempotencyKey: key, ...changes }) };
}

test("Enterprise qualification uses canonical owner and precision with Commerce-owned spend evidence", async t => {
  const f = fixture(t), q = await auctions.qualify(f.request());
  assert.equal(q.eligible, true); assert.equal(q.scale, 2); assert.equal(q.ownerRef.code, "buyer-enterprise");
  f.state.withinLimit = false;
  assert.equal((await auctions.qualify(f.request({ amount: "9.00" }))).withinLimit, false);
  await assert.rejects(auctions.qualify(f.request({ ownerRef: { module: "profile", schema: "customer", code: "employee" },
    funding: { walletCode: "wallet" } })), { code: "ERR_LOYALTY_AUCTION_FORBIDDEN" });
  await assert.rejects(auctions.qualify(f.request({ amount: "1.001" })));
  assert.equal(f.state.writes, 0);
});

test("reserve, increases, decreases and release retain one nonexpiring hold with delta ledger postings", async t => {
  const f = fixture(t), first = await f.reserve();
  assert.equal(first.reservation.expiresAt, null); assert.equal(first.reservation.holdUntilRelease, true);
  assert.equal(f.held().holdPolicy, "AUCTION_ROUND");
  await auctions.adjust(f.command("increase", { amount: "7.00" }));
  assert.equal(f.balance().available, "3.00"); assert.equal(f.balance().reserved, "7.00");
  await auctions.adjust(f.command("decrease", { amount: "2.00" }));
  assert.equal(f.balance().available, "8.00"); assert.equal(f.balance().reserved, "2.00");
  assert.deepEqual(f.rows.RewardLedgerEntry.map(r => [r.entryType, r.amount]), [["RESERVE", "4.00"], ["RESERVE", "3.00"], ["RELEASE", "5.00"]]);
  await auctions.release(f.command("release", { amount: "2.00" }));
  assert.equal(f.balance().available, "10.00"); assert.equal(f.balance().reserved, "0.00");
  assert.equal(f.rows.RewardReservation.length, 1); assert.equal(f.held().code, first.reservation.code);
});

test("command receipts replay without double posting and reject altered amounts", async t => {
  const f = fixture(t), first = await f.reserve();
  f.balance().available = "0.00";
  assert.deepEqual(await f.reserve(), first);
  f.balance().available = "6.00";
  await auctions.adjust(f.command("update", { amount: "6.00" }));
  await auctions.adjust(f.command("update", { amount: "6.00" }));
  await assert.rejects(auctions.adjust(f.command("update", { amount: "5.00" })), { code: "ERR_LOYALTY_AUCTION_IDEMPOTENCY" });
  await auctions.adjust(f.command("unchanged", { amount: "6.00" }));
  assert.equal(f.rows.RewardLedgerEntry.length, 2);
});

test("independent bids cannot share a hold or exceed available funds", async t => {
  const f = fixture(t); await f.reserve();
  await auctions.reserve(f.request({ sourceCode: "second", idempotencyKey: "second", amount: "5.00" }));
  assert.equal(f.rows.RewardReservation.length, 2); assert.equal(f.balance().reserved, "9.00");
  await assert.rejects(auctions.adjust(f.command("increase", { amount: "7.00" })), { code: "ERR_LOYALTY_AUCTION_FUNDING" });
  assert.equal(f.held().amount, "4.00");
});

test("ledger or receipt failure rolls back every accounting write", async t => {
  const f = fixture(t); f.state.failWrite = "RewardLedgerEntry";
  await assert.rejects(f.reserve(), /synthetic interruption/);
  assert.equal(f.balance().available, "10.00"); assert.equal(f.rows.RewardReservation.length, 0);
  f.state.failWrite = undefined; await f.reserve();
  f.state.failReceipt = true;
  await assert.rejects(auctions.adjust(f.command("update", { amount: "6.00" })), /synthetic interruption/);
  assert.equal(f.held().amount, "4.00"); assert.equal(f.balance().reserved, "4.00");
  assert.equal(f.rows.RewardLedgerEntry.length, 1);
});

test("successful-looking persistence without a saved ledger is rejected and rolled back", async t => {
  const f = fixture(t); f.state.fakeWrite = "RewardLedgerEntry";
  await assert.rejects(f.reserve(), { code: "ERR_LOYALTY_AUCTION_PERSISTENCE" });
  assert.equal(f.balance().available, "10.00"); assert.equal(f.rows.RewardReservation.length, 0);
});

test("capture requires Bidding selection and Checkout terminal fence and uses the original reservation", async t => {
  const f = fixture(t); await f.reserve();
  const request = f.command("capture", { orderCode: "order" });
  await assert.rejects(auctions.capture(request), { code: "ERR_LOYALTY_AUCTION_FORBIDDEN" });
  f.state.checkout = true; f.state.unfenced = true;
  await assert.rejects(auctions.capture(request), { code: "ERR_LOYALTY_AUCTION_FORBIDDEN" });
  f.state.unfenced = false;
  await auctions.capture(request); await auctions.capture(request);
  assert.equal(f.balance().reserved, "0.00"); assert.equal(f.balance().spent, "4.00");
  assert.equal(f.rows.RewardRedemption.length, 1); assert.equal(f.rows.RewardLedgerEntry.length, 2);
  assert.equal(f.rows.RewardRedemption[0].providerReference, "checkout-receipt");
});

test("revoked actor and suspended wallet cannot increase holds but cannot strand released funds", async t => {
  const f = fixture(t); await f.reserve();
  f.rows.LoyaltyWallet[0].status = "SUSPENDED";
  f.state.actorAuthorized = false;
  assert.equal((await auctions.inspect(f.command("inspect"))).eligible, false);
  await assert.rejects(auctions.adjust(f.command("update", { amount: "6.00" })), { code: "ERR_LOYALTY_AUCTION_FUNDING" });
  delete f.rows.LoyaltyWallet[0].metadata.auctionFunding;
  await auctions.release(f.command("release"));
  assert.equal(f.balance().available, "10.00");
});

test("generic operations and forged plain-object admission cannot release, adjust, capture or reverse auction funds", async t => {
  const f = fixture(t); await f.reserve();
  const r = { ...f.request(), ...f.request().payload, reservationCode: f.held().code,
    holdPolicy: "AUCTION_ROUND", auctionContext: {}, auctionOperation: "adjust" };
  for (const method of ["release", "capture", "adjustAuction", "reserve"])
    await assert.rejects(operations[method](r), { code: "ERR_LOYALTY_AUCTION_FORBIDDEN" });
  await assert.rejects(operations.reverse({ ...r, reversalOfEntryCode: f.rows.RewardLedgerEntry[0].code }),
    { code: "ERR_LOYALTY_AUCTION_FORBIDDEN" });
  assert.equal(f.balance().reserved, "4.00");
});

test("unknown owner evidence, unavailable reads and disabled atomic transactions never report success", async t => {
  const f = fixture(t); f.state.denied = true;
  await assert.rejects(f.reserve(), { code: "ERR_LOYALTY_AUCTION_FORBIDDEN" });
  f.state.denied = false; f.state.readError = "LoyaltyWallet";
  await assert.rejects(f.reserve(), { code: "ERR_LOYALTY_AUCTION_PERSISTENCE" });
  f.state.readError = undefined; f.configuration.loyalty.transactions.enabled = false;
  await assert.rejects(f.reserve());
  assert.equal(f.state.writes, 0);
});

test("service scheduler credentials are accepted only as service tokens and rejected as participant credentials", async t => {
  const f = fixture(t), input = f.request();
  input.authData = { tenant: "tenant", entCode: "market", loginId: "scheduler", principalType: "service", tokenType: "service" };
  await auctions.reserve(input);
  input.authData.tokenType = "access";
  await assert.rejects(auctions.reserve(input), { code: "ERR_LOYALTY_AUCTION_FORBIDDEN" });
});

test("owner command mutation during evidence lookup cannot change reviewed funds", async t => {
  const f = fixture(t), original = SERVICE.DefaultModuleService.invokeModule;
  SERVICE.DefaultModuleService.invokeModule = async r => { r.requestBody.command.amount = "1.00"; return original(r); };
  await assert.rejects(f.reserve(), { code: "ERR_LOYALTY_AUCTION_FORBIDDEN" });
  assert.equal(f.state.writes, 0);
});
