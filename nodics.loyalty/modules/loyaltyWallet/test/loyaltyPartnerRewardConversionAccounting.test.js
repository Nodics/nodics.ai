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
/** @module loyaltyWallet/test/loyaltyPartnerRewardConversionAccounting @description Connects real conversion, reward operations and transaction composition with isolated storage/provider doubles. @layer test @owner loyaltyWallet */
const test = require("node:test"), assert = require("node:assert/strict");
const conversion = require("../src/service/defaultLoyaltyPartnerRewardConversionService");
const operations = require("../src/service/defaultLoyaltyRewardOperationService");
const transaction = require("../src/service/defaultLoyaltyTransactionService");
const participant = require("../src/service/defaultLoyaltyParticipantService");
const clone = value => structuredClone(value);

function fixture(t) {
  const previous = ["SERVICE", "CONFIG", "CLASSES", "UTILS"].map(key => [key, Object.getOwnPropertyDescriptor(global, key)]);
  t.after(() => previous.forEach(([key, descriptor]) => descriptor
    ? Object.defineProperty(global, key, descriptor) : delete global[key]));
  global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
  global.UTILS = { isBlank: value => !value || Object.keys(value).length === 0 };
  const initializer = require("../../../../nodics.foundation/modules/nDatabase/database/src/service/procs/save/defaultModelSaveInitializerService");
  const interceptor = require("../../../../nodics.foundation/modules/nDatabase/database/src/service/interceptors/defaultInterceptorService");
  const mongo = require("../../../../nodics.foundation/modules/nDatabase/mongodb/src/schemas/model").default;
  const { ObjectId } = require("mongodb");
  const rows = {}, state = { sends: 0, commits: 0, activeToken: undefined };
  const base = { tenant: "tenant", authorization: "Bearer original", authData: { tenant: "tenant", entCode: "enterprise", tokenType: "access",
    principalType: "customer", loginId: "customer-login" } };
  const walletDefaults = clone(require("../config/properties").loyalty);
  const configuration = { loyalty: { ...clone(require("../../loyaltyCore/config/properties").loyalty), ...walletDefaults,
    transactions: { ...walletDefaults.transactions, enabled: true },
    partnerRewardConversion: { enabled: true, providers: { synthetic: "SyntheticConversionProvider" } } },
    databaseTransactions: { enabled: true, failClosed: true, maximumCommitTimeMs: 5000 } };
  global.CONFIG = { get: key => configuration[key] };
  global.SERVICE = { DefaultLoyaltyAmountService: require("../../loyaltyCore/src/service/defaultLoyaltyAmountService"),
    DefaultLoyaltyRewardOperationService: operations,
    DefaultLoyaltyPartnerRewardConversionService: conversion,
    DefaultLoyaltyTransactionService: transaction,
    DefaultLoggerService: { assertSensitiveRequest() {} },
    DefaultLoyaltyParticipantService: participant,
    DefaultSecuredRequestPipelineService: { getGrantedPermissions: () => [], isPermissionGranted: () => true },
    DefaultModuleService: { invokeModule: async r => {
      assert.equal(r.local, false);
      assert.equal(r.tenant, base.tenant);
      assert.equal(r.header.Authorization, base.authorization, "original participant bearer reaches remote Profile");
      assert.equal(r.header["X-Enterprise-Code"], base.authData.entCode);
      if (r.apiName === "/participants/resolve") {
        assert.deepEqual(r.requestBody, { ownerType: "ENTERPRISE", ownerCode: "partner" });
        return { data: { contractVersion: 1, tenant: base.tenant, recipient: r.requestBody } };
      }
      if (r.apiName === "/customer/identity") return { data: { contractVersion: 1, tenant: base.tenant,
        enterpriseCode: base.authData.entCode, customer: { code: "customer", loginId: base.authData.loginId } } };
      assert.equal(r.apiName, "/identity/scopes/me");
      return { data: { principalCode: base.authData.loginId, deniedScopes: [], scopes: [
        { scopeType: "ENTERPRISE", scopeCode: base.authData.entCode, tenantCode: base.tenant, capabilityCode: "loyaltyWallet" },
      ] } };
    } },
    DefaultDatabaseTransactionService: {
      capabilities: () => ({ multiRecordAtomic: true, contextPropagation: true }),
      execute: async (scope, work) => {
        assert.equal(scope.tenant, "tenant");
        assert.equal(state.activeToken, undefined, "source operations must join, not start nested transactions");
        const snapshot = clone(rows), token = {};
        state.activeToken = token;
        try { const result = await work(token); state.commits++; return result; }
        catch (error) { for (const name of Object.keys(rows)) rows[name] = snapshot[name]; throw error; }
        finally { state.activeToken = undefined; }
      },
    },
  };
  for (const name of ["LoyaltyWallet", "LoyaltyWalletRewardBalance", "RewardLedgerEntry", "RewardReservation", "RewardRedemption",
    "LoyaltyProgram", "LoyaltyRewardType", "LoyaltyPartnerRewardIntegration", "LoyaltyPartnerRewardAccount", "LoyaltyPartnerRewardConversionRecord"]) {
    rows[name] = [];
    const match = (row, query) => Object.entries(query || {}).every(([key, value]) => row[key] === value);
    const check = (request, write) => {
      assert.equal(request.authData.principalType, "service", "private storage policy never admits public customer CRUD");
      assert.equal(request.tenant, "tenant");
      if (state.activeToken) assert.equal(request.transactionContext, state.activeToken);
      if (write && ["LoyaltyWalletRewardBalance", "RewardLedgerEntry", "RewardReservation", "RewardRedemption"].includes(name))
        assert.ok(state.activeToken, "all accounting writes participate atomically");
    };
    const write = async request => {
      check(request, true);
      if (state.failWrite === name) { state.failWrite = undefined; throw Error("synthetic write interruption"); }
      if (name === "LoyaltyPartnerRewardConversionRecord") {
        const prior = rows[name].find(row => row.code === request.model.code);
        request.model.created ??= new Date("2000-01-01T00:00:00Z");
        await interceptor.setUpdatedTimestamp(request, {});
        // Force a distinct prior timestamp without replacing the real interceptor.
        if (prior && prior.updated.getTime() === request.model.updated.getTime()) {
          await new Promise(resolve => setTimeout(resolve, 2));
          await interceptor.setUpdatedTimestamp(request, {});
        }
        SERVICE.DefaultModelValidatorService = { validateMandate: async () => true, validateDataType: async () => true };
        const schemaModel = {
          ...mongo,
          rawSchema: require("../src/schemas/schemas").loyaltyWallet.loyaltyPartnerRewardConversionRecord,
          dataBase: { getOptions: () => ({ modelSaveOptions: { upsert: true, returnDocument: "after" } }) },
          transactionOptions: input => {
            if (state.activeToken) assert.equal(input.transactionContext, state.activeToken);
            return state.activeToken ? { session: state.activeToken } : {};
          },
          insertOne: async model => {
            assert(!rows[name].some(row => row.code === model.code));
            const _id = new ObjectId();
            rows[name].push({ ...clone(model), _id });
            return { acknowledged: true, insertedCount: 1, insertedId: _id };
          },
          findOneAndUpdate: async (query, update, options) => {
            assert.equal(options.upsert, false);
            if (state.activeToken) assert.equal(options.session, state.activeToken);
            assert.deepEqual(Object.keys(query).sort(), ["code", "revision", "status"]);
            assert(!Object.hasOwn(update.$set, "_id"));
            const old = rows[name].find(row => match(row, query));
            if (!old) return { ok: 1, value: null };
            assert.deepEqual(update.$set.created, old.created);
            assert.deepEqual(update.$set.createdAt, old.createdAt);
            Object.assign(old, clone(update.$set));
            if (state.corruptConversionField) {
              const field = state.corruptConversionField;
              state.corruptConversionField = undefined;
              return { ok: 1, value: { ...old, [field]: field === "updated" ? "invalid-date" : "tampered" } };
            }
            return { ok: 1, value: { ...old } };
          },
        };
        const result = await initializer.persistModel.call(initializer, {
          ...request, query: request.query || { code: request.model.code }, schemaModel,
        });
        return { code: "SUC_WRITE", result };
      }
      if (request.query) {
        const row = rows[name].find(row => match(row, request.query));
        if (!row) throw Error("conditional write conflict");
        Object.assign(row, clone(request.model));
      } else {
        if (rows[name].some(row => row.code === request.model.code)) throw Error("duplicate identity");
        rows[name].push(clone(request.model));
      }
      return { code: "SUC_WRITE", result: clone(rows[name].find(row => row.code === request.model.code)) };
    };
    SERVICE["Default" + name + "Service"] = {
      get: async request => { check(request); const result = clone(rows[name].filter(row => match(row, request.query)));
        return { code: "SUC_READ", result, count: result.length }; }, save: write, update: write,
    };
  }
  const add = (name, value) => rows[name].push({ active: true, ...value });
  add("LoyaltyWallet", { code: "wallet", ownerType: "CUSTOMER", ownerCode: "customer", status: "OPEN" });
  add("LoyaltyWalletRewardBalance", { code: "balance", walletCode: "wallet", programCode: "program", rewardTypeCode: "points",
    available: "10.00", reserved: "0.00", earned: "10.00", spent: "0.00", expired: "0.00", reversed: "0.00", revision: 0 });
  add("LoyaltyProgram", { code: "program", status: "ACTIVE", spendEnabled: true, partnerConversionRewardTypeCodes: ["points"] });
  add("LoyaltyRewardType", { code: "points", status: "ACTIVE", precision: 2 });
  add("LoyaltyPartnerRewardIntegration", { code: "integration", partnerEnterpriseCode: "partner", providerKey: "synthetic", revision: 1,
    status: "ACTIVE", conversionEnabled: true, sourceRewards: [{ programCode: "program", rewardTypeCode: "points" }],
    providerBindingReference: "binding", termsReference: "terms", termsRevision: "v1" });
  add("LoyaltyPartnerRewardAccount", { code: "account", integrationCode: "integration", partnerEnterpriseCode: "partner", revision: 1,
    status: "VERIFIED", ownerType: "CUSTOMER", ownerCode: "customer", accountReference: "private-account", verificationReference: "verified" });
  const terminal = (r, status) => ({ status, operationReference: r.operationReference, integrationCode: r.integration.code,
    partnerEnterpriseCode: r.integration.partnerEnterpriseCode, accountReference: r.account.accountReference,
    targetAmount: r.targetAmount, targetUnit: r.targetUnit, providerReference: "provider-receipt", cannotCredit: status === "NOT_CREDITED" });
  SERVICE.SyntheticConversionProvider = {
    capabilities: () => ({ contractVersion: 1, idempotentExecution: true, authoritativeOutcomes: true, terminalNoCreditFence: true }),
    quote: async r => ({ sourceAmount: r.sourceAmount, sourceScale: r.sourceScale, targetAmount: "2.00", targetScale: 2,
      targetUnit: "PARTNER_POINT", quoteReference: "quote", termsReference: "terms", termsRevision: "v1", expiresAt: new Date(Date.now() + 60000) }),
    execute: async r => { assert.equal(state.activeToken, undefined); state.sends++;
      state.last = r; return state.unknown ? { status: "UNKNOWN" } : terminal(r, "CREDITED"); },
    reconcile: async r => { assert.equal(state.activeToken, undefined); return terminal(r, state.noCredit ? "NOT_CREDITED" : "CREDITED"); },
  };
  return { rows, state, base, command: code => ({ ...clone(base), payload: { conversionCode: code } }), quote: () => conversion.quote({ ...clone(base),
    payload: { walletCode: "wallet", integrationCode: "integration", accountLinkCode: "account", programCode: "program", rewardTypeCode: "points",
      amount: "4.00", idempotencyKey: "command" } }) };
}

test("real operations accept private coordinator authority after normalization and commit one reserve/capture/redemption", async t => {
  const f = fixture(t), quote = await f.quote(), original = clone(f.base);
  assert.equal((await conversion.confirm(f.command(quote.conversionCode))).status, "COMPLETED");
  assert.deepEqual(f.base, original);
  assert.equal(f.rows.LoyaltyWalletRewardBalance[0].available, "6.00");
  assert.equal(f.rows.LoyaltyWalletRewardBalance[0].reserved, "0.00");
  assert.equal(f.rows.LoyaltyWalletRewardBalance[0].spent, "4.00");
  assert.equal(f.rows.RewardReservation[0].holdPolicy, "EXTERNAL_OUTCOME");
  assert.equal(f.rows.RewardReservation[0].expiresAt, undefined);
  assert.equal(f.rows.RewardRedemption[0].providerReference, "provider-receipt");
  assert.deepEqual(f.rows.RewardLedgerEntry.map(row => row.entryType), ["RESERVE", "CAPTURE"]);
  await conversion.confirm(f.command(quote.conversionCode));
  assert.equal(f.rows.RewardLedgerEntry.length, 2);
  assert.equal(f.state.sends, 1);
});

test("real participant resolver and accounting preserve Enterprise owner distinct from acting employee", async t => {
  const f = fixture(t);
  f.base.authData.principalType = "human";
  f.base.authData.loginId = "employee-login";
  for (const row of [f.rows.LoyaltyWallet[0], f.rows.LoyaltyPartnerRewardAccount[0]]) {
    row.ownerType = "ENTERPRISE";
    row.ownerCode = "enterprise";
  }
  const quote = await f.quote();
  assert.equal((await conversion.confirm(f.command(quote.conversionCode))).status, "COMPLETED");
  const record = f.rows.LoyaltyPartnerRewardConversionRecord[0];
  assert.equal(record.ownerType, "ENTERPRISE");
  assert.equal(record.ownerCode, "enterprise");
  assert.equal(record.actorCode, "employee-login");
  assert.equal(f.rows.LoyaltyWalletRewardBalance[0].spent, "4.00");
  assert.equal(f.rows.RewardLedgerEntry.length, 2);
});

test("real uncertain protected hold rejects generic release and resumes terminal no-credit through owner", async t => {
  const f = fixture(t); f.state.unknown = true;
  const quote = await f.quote();
  assert.equal((await conversion.confirm(f.command(quote.conversionCode))).status, "SUBMITTED");
  assert.equal(f.rows.LoyaltyWalletRewardBalance[0].reserved, "4.00");
  await assert.rejects(operations.release({ ...f.base, reservationCode: f.rows.RewardReservation[0].code, idempotencyKey: "forged-release" }),
    { code: "ERR_LOYALTY_CONVERSION_FORBIDDEN" });
  f.state.noCredit = true;
  assert.equal((await conversion.status(f.command(quote.conversionCode))).status, "REJECTED");
  assert.equal(f.rows.LoyaltyWalletRewardBalance[0].available, "10.00");
  assert.deepEqual(f.rows.RewardLedgerEntry.map(row => row.entryType), ["RESERVE", "RELEASE"]);
});

test("real capture posting failure rolls balance and ledger back while retaining durable external credit", async t => {
  const f = fixture(t), quote = await f.quote();
  f.state.failWrite = "RewardRedemption";
  await assert.rejects(conversion.confirm(f.command(quote.conversionCode)), /synthetic write interruption/);
  assert.equal(f.rows.LoyaltyPartnerRewardConversionRecord[0].status, "CREDIT_CONFIRMED");
  assert.equal(f.rows.LoyaltyWalletRewardBalance[0].reserved, "4.00");
  assert.deepEqual(f.rows.RewardLedgerEntry.map(row => row.entryType), ["RESERVE"]);
  assert.equal((await conversion.status(f.command(quote.conversionCode))).status, "COMPLETED");
  assert.equal(f.state.sends, 1);
  assert.equal(f.rows.RewardRedemption.length, 1);
});

for (const field of ["updated", "created", "createdAt", "revision", "status", "sourceAmount", "ownerType"]) {
  test(`generated accounting rejects changed ${field} evidence and rolls back before original-key recovery`, async t => {
    const f = fixture(t), quote = await f.quote();
    const context = await conversion.context(f.command(quote.conversionCode), "confirm");
    const original = clone(f.rows.LoyaltyPartnerRewardConversionRecord[0]);
    const claimed = await conversion.transition(context, original, { status: "HOLDING" });
    assert.equal(claimed.won, true);
    f.state.corruptConversionField = field;
    await assert.rejects(conversion.post(context, claimed.row, "reserve"), { code: "ERR_LOYALTY_CONVERSION_PERSISTENCE" });
    assert.equal(f.rows.LoyaltyPartnerRewardConversionRecord[0].status, "HOLDING");
    assert.equal(f.rows.LoyaltyPartnerRewardConversionRecord[0].revision, claimed.row.revision);
    assert.equal(f.rows.LoyaltyWalletRewardBalance[0].available, "10.00");
    assert.equal(f.rows.LoyaltyWalletRewardBalance[0].reserved, "0.00");
    assert.equal(f.rows.RewardLedgerEntry.length, 0);
    assert.equal(f.rows.RewardReservation.length, 0);
    assert.equal(f.state.sends, 0);
    assert.equal((await conversion.status(f.command(quote.conversionCode))).status, "COMPLETED");
    const completed = f.rows.LoyaltyPartnerRewardConversionRecord[0];
    assert.deepEqual(completed.created, original.created);
    assert.deepEqual(completed.createdAt, original.createdAt);
    assert.equal(f.rows.RewardLedgerEntry.length, 2);
    assert.equal(f.state.sends, 1);
    await conversion.status(f.command(quote.conversionCode));
    assert.equal(f.rows.RewardLedgerEntry.length, 2);
    assert.equal(f.state.sends, 1);
  });
}
