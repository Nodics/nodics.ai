/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
require("./helpers/runtimeEnums.js")();

/** @module loyaltyWallet/test/loyaltyPartnerRewardConversion @description Exercises durable conversion coordination with synthetic provider and generated persistence/ledger doubles only; no live runtime or external integration. @layer test @owner loyaltyWallet */
const test = require("node:test");
const assert = require("node:assert/strict");
const coordinator = require("../src/service/defaultLoyaltyPartnerRewardConversionService");
const originalOperations = require("../src/service/defaultLoyaltyRewardOperationService");
const participant = require("../src/service/defaultLoyaltyParticipantService");
const clone = value => structuredClone(value);

function fixture(t) {
  const previous = ["SERVICE", "CONFIG", "CLASSES", "UTILS"].map(key => [key, Object.getOwnPropertyDescriptor(global, key)]);
  t.after(() => previous.forEach(([key, descriptor]) => {
    if (descriptor) Object.defineProperty(global, key, descriptor);
    else delete global[key];
  }));
  delete global.CLASSES;
  const state = { executeCalls: 0, reconcileCalls: 0, credits: 0, releases: 0, captures: 0, reserves: 0,
    outcomes: new Map(), holds: new Map(), postings: new Map(), stores: {}, clock: new Date("2026-10-18T10:00:00Z") };
  const owner = { ...coordinator, now: () => new Date(state.clock) };
  const config = { enabled: true, providers: { synthetic: "SyntheticPartnerProvider" } };
  global.CONFIG = { get: key => key === "loyalty"
    ? { ...require("../config/properties").loyalty, partnerRewardConversion: config } : undefined };
  function store(name, initial = []) {
    const map = new Map(initial.map(row => ["tenant-a:" + row.code, clone({ active: true, ...row })]));
    state.stores[name] = map;
    return {
      get: async request => {
        assert.equal(request.authData.principalType, "service");
        assert.equal(request.authData.tenant, request.tenant);
        assert.equal(request.searchOptions.pageSize, 2);
        const row = map.get(request.tenant + ":" + request.query.code);
        return { code: "SUC_TEST_READ", result: row ? [clone(row)] : [] };
      },
      save: async request => {
        await require("../../../../nodics.foundation/modules/nDatabase/database/src/service/interceptors/defaultInterceptorService")
          .setUpdatedTimestamp(request, {});
        assert.equal(request.options.upsert, false);
        assert.equal(request.options.insertOnly, request.query ? undefined : true);
        assert.equal(request.authData.principalType, "service");
        const row = clone(request.model), key = request.tenant + ":" + row.code, old = map.get(key);
        if (state.beforeSave) await state.beforeSave(request);
        if (request.query) {
          if (!old || !Object.entries(request.query).every(([field, value]) => old[field] === value)) throw Error("conditional write lost");
        } else if (old) throw Error("duplicate unique code");
        if (state.failBeforeStatus === row.status) { state.failBeforeStatus = undefined; throw Error("persistence interrupted"); }
        map.set(key, row);
        if (state.failAfterStatus === row.status) { state.failAfterStatus = undefined; throw Error("acknowledgement lost"); }
        return { code: "SUC_TEST_SAVE", result: clone(row) };
      },
    };
  }
  const integration = { code: "partner-route", partnerEnterpriseCode: "partner-enterprise", providerKey: "synthetic",
    revision: 1, status: "ACTIVE", conversionEnabled: true, providerBindingReference: "credential-binding-a",
    termsReference: "terms-a", termsRevision: "v1", rules: { syntheticRate: "2" },
    sourceRewards: [{ programCode: "program", rewardTypeCode: "points" }] };
  const account = { code: "account-link", integrationCode: integration.code, partnerEnterpriseCode: integration.partnerEnterpriseCode,
    revision: 1, status: "VERIFIED", ownerType: "CUSTOMER", ownerCode: "customer-a",
    accountReference: "private-external-account", verificationReference: "private-verification" };
  const source = {
    fail: originalOperations.fail,
    serviceRequest: originalOperations.serviceRequest,
    serviceAuthData: originalOperations.serviceAuthData,
    partnerConversionCapabilities: () => ({ heldUntilOutcome: true, replaySafe: true, originalAuthority: true }),
    reserve: async request => {
      state.lastSourceRequest = request;
      assert.equal(owner.ownsSourceRequest(request), true);
      assert.equal(owner.ownsSourceRequest({ ...request, amount: "999" }), false);
      assert.equal(request.authData.principalType, state.actorType || "customer");
      assert.equal(request.holdPolicy, "EXTERNAL_OUTCOME");
      let hold = state.holds.get(request.idempotencyKey);
      if (!hold) {
        hold = { code: "hold-1", status: "RESERVED", ...request };
        delete hold.authData;
        delete hold.authorization;
        delete hold.transactionContext;
        delete hold.conversionContext;
        state.holds.set(request.idempotencyKey, hold);
        state.reserves++;
      }
      return { reservation: clone(hold) };
    },
    capture: async request => {
      assert.equal(owner.ownsSourceRequest(request), true);
      assert.equal(request.authData.principalType, state.actorType || "customer");
      assert.equal(request.providerReference, state.expectedProviderReference || "credit-receipt");
      if (state.failCapture) { state.failCapture = false; throw Error("capture interrupted"); }
      let result = state.postings.get(request.idempotencyKey);
      if (!result) {
        result = { ledgerEntry: { code: "capture-entry" }, redemption: { code: "redemption-1",
          reservationCode: request.reservationCode, providerReference: request.providerReference,
          walletCode: request.walletCode, programCode: request.programCode, rewardTypeCode: request.rewardTypeCode,
          amount: request.amount, status: "CAPTURED", captureLedgerEntryCode: "capture-entry" } };
        state.postings.set(request.idempotencyKey, result);
        state.captures++;
      }
      return clone(result);
    },
    release: async request => {
      assert.equal(owner.ownsSourceRequest(request), true);
      let result = state.postings.get(request.idempotencyKey);
      if (!result) {
        result = { ledgerEntry: { code: "release-entry" }, reservation: { code: request.reservationCode, status: "RELEASED", sourceCode: request.sourceCode } };
        state.postings.set(request.idempotencyKey, result);
        state.releases++;
      }
      return clone(result);
    },
  };
  const provider = {
    capabilities: () => ({ contractVersion: 1, idempotentExecution: true, authoritativeOutcomes: true, terminalNoCreditFence: true }),
    quote: async r => ({ quoteReference: "quote-1", sourceAmount: r.sourceAmount, sourceScale: r.sourceScale,
      targetAmount: "20.00", targetScale: 2, targetUnit: "PARTNER_POINTS", termsReference: r.integration.termsReference,
      termsRevision: r.integration.termsRevision, expiresAt: new Date(state.clock.getTime() + 60000) }),
    execute: async r => {
      state.executeCalls++;
      assert.equal(state.stores.conversions.get("tenant-a:" + r.operationReference).status, "SUBMITTED");
      assert.equal(state.reserves, 1);
      if (state.executeHook) return state.executeHook(r);
      if (!state.outcomes.has(r.operationReference)) { state.credits++; state.outcomes.set(r.operationReference, terminal(r)); }
      if (state.loseProviderAcknowledgement) throw Error("provider timeout with secret data");
      return state.outcomes.get(r.operationReference);
    },
    reconcile: async r => {
      state.reconcileCalls++;
      if (state.reconcileHook) return state.reconcileHook(r);
      return state.outcomes.get(r.operationReference) || { status: "UNKNOWN" };
    },
  };
  function terminal(r, status = "CREDITED") {
    return { status, operationReference: r.operationReference, integrationCode: r.integration.code,
      partnerEnterpriseCode: r.integration.partnerEnterpriseCode, accountReference: r.account.accountReference,
      targetAmount: r.targetAmount, targetUnit: r.targetUnit, providerReference: status === "CREDITED" ? "credit-receipt" : "fenced-receipt",
      ...(status === "NOT_CREDITED" ? { cannotCredit: true } : {}) };
  }
  let queue = Promise.resolve();
  const transactions = {
    qualify: r => { assert.equal(r.tenant, r.authData.tenant); },
    compose: async (r, work) => {
      const before = queue;
      let unlock;
      queue = new Promise(resolve => { unlock = resolve; });
      await before;
      const maps = [...Object.values(state.stores), state.holds, state.postings];
      const snapshots = maps.map(map => clone([...map]));
      const counts = [state.reserves, state.captures, state.releases];
      r.transactionContext = {};
      try { return await work(); }
      catch (error) {
        maps.forEach((map, index) => { map.clear(); for (const [key, value] of snapshots[index]) map.set(key, value); });
        [state.reserves, state.captures, state.releases] = counts;
        throw error;
      } finally { delete r.transactionContext; unlock(); }
    },
  };
  global.SERVICE = { DefaultLoyaltyAmountService: require("../../loyaltyCore/src/service/defaultLoyaltyAmountService"),
    DefaultLoggerService: { assertSensitiveRequest: () => {} },
    DefaultEnterpriseMembershipService: {
      permission: (r, permission) => { if (!r.authData.permissions.includes(permission)) owner.fail("FORBIDDEN"); },
      verifyAuthenticatedActor: async r => ({ person: { code: r.authData.code } }),
      enterprise: async code => ({ enterprise: { code, active: true, tenant: { active: true } }, tenantCode: "partner-tenant" }),
    },
    DefaultLoyaltyParticipantService: participant,
    DefaultSecuredRequestPipelineService: {
      getGrantedPermissions: r => r.authData.permissions,
      isPermissionGranted: (permission, permissions) => permissions?.includes(permission),
    },
    DefaultModuleService: { invokeModule: async request => {
      assert.equal(request.header.Authorization, "Bearer original-signed-token");
      if (request.apiName === "/participants/resolve") {
        assert.equal(request.methodName, "POST");
        assert.deepEqual(request.requestBody, { ownerType: "ENTERPRISE", ownerCode: "partner-enterprise" });
        return { result: { contractVersion: 1, tenant: request.tenant, recipient: request.requestBody } };
      }
      if (state.profileEvidence) return { result: state.profileEvidence };
      return { result: request.apiName === "/customer/identity"
        ? { contractVersion: 1, tenant: request.tenant, enterpriseCode: request.header["X-Enterprise-Code"],
          customer: { code: auth.code, loginId: auth.loginId } }
        : { principalCode: auth.loginId, scopes: [{ scopeType: "ENTERPRISE", scopeCode: auth.entCode }], deniedScopes: [] } };
    } },
    DefaultLoyaltyTransactionService: transactions,
    DefaultLoyaltyWalletService: store("wallets", [{ code: "wallet", status: "OPEN", ownerType: "CUSTOMER", ownerCode: "customer-a" }]),
    DefaultLoyaltyPartnerRewardIntegrationService: store("integrations", [integration]),
    DefaultLoyaltyPartnerRewardAccountService: store("accounts", [account]),
    DefaultLoyaltyProgramService: store("programs", [{ code: "program", status: "ACTIVE", spendEnabled: true, partnerConversionRewardTypeCodes: ["points"] }]),
    DefaultLoyaltyRewardTypeService: store("types", [{ code: "points", status: "ACTIVE", precision: 2 }]),
    DefaultLoyaltyPartnerRewardConversionRecordService: store("conversions"),
    DefaultLoyaltyRewardOperationService: source,
    SyntheticPartnerProvider: provider,
  };
  const auth = { tokenType: "access", principalType: "customer", tenant: "tenant-a", entCode: "owner-enterprise", code: "customer-a", loginId: "customer-login",
    permissions: ["loyalty.partnerConversion.execute", "loyalty.partnerConversion.read"] };
  const request = payload => ({ tenant: "tenant-a", authData: clone(auth), authorization: "Bearer original-signed-token", payload });
  const quoteRequest = changes => request({ integrationCode: "partner-route", accountLinkCode: "account-link", walletCode: "wallet",
    programCode: "program", rewardTypeCode: "points", amount: "10.00", idempotencyKey: "request-1", ...changes });
  const command = code => request({ conversionCode: code });
  const read = (name, code) => state.stores[name].get("tenant-a:" + code);
  return { state, owner, provider, source, config, auth, quoteRequest, command, read, terminal };
}

/** Composes the real save initializer with an isolated atomic storage adapter.
 * Generated primary-code lookup is present even on creation; no live I/O occurs.
 */
function generatedConversionPersistence(f) {
  const initializer = require("../../../../nodics.foundation/modules/nDatabase/database/src/service/procs/save/defaultModelSaveInitializerService");
  global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
  const rows = f.state.stores.conversions;
  const calls = { creates: 0, updates: 0, loseCreateAcknowledgement: false, race: undefined };
  const rawSchema = require("../src/schemas/schemas").loyaltyWallet.loyaltyPartnerRewardConversionRecord;
  SERVICE.DefaultLoyaltyPartnerRewardConversionRecordService.save = async request => {
    await require("../../../../nodics.foundation/modules/nDatabase/database/src/service/interceptors/defaultInterceptorService")
      .setUpdatedTimestamp(request, {});
    assert.equal(request.options.upsert, false);
    assert.equal(request.options.recursive, false);
    assert.equal(request.options.skipItemCache, true);
    assert.equal(request.authData.principalType, "service");
    const key = request.tenant + ":" + request.model.code;
    const schemaModel = {
      rawSchema,
      compareAndSetItem: async input => {
        calls.creates++;
        assert.equal(input.operation, "create");
        assert.equal(input.insertOnly, true);
        if (calls.race) { rows.set(key, calls.race(clone(input.model))); calls.race = undefined; }
        if (rows.has(key)) throw Object.assign(Error("duplicate"), { code: 11000 });
        rows.set(key, clone(input.model));
        if (calls.loseCreateAcknowledgement) {
          calls.loseCreateAcknowledgement = false;
          throw Error("acknowledgement lost");
        }
        return clone(input.model);
      },
      saveItems: async input => {
        calls.updates++;
        assert.notEqual(input.options.insertOnly, true);
        const old = rows.get(key);
        if (!old || !Object.entries(input.query).every(([field, value]) => old[field] === value)) {
          throw new CLASSES.NodicsError("ERR_MDL_00005");
        }
        rows.set(key, clone(input.model));
        return clone(input.model);
      },
    };
    const result = await initializer.persistModel.call(initializer, {
      ...request, query: request.query || { code: request.model.code }, schemaModel,
    });
    return { code: "SUC_TEST_SAVE", result };
  };
  return calls;
}

test("generated save initializer inserts first quote and recovers lost acknowledgement without replacement", async t => {
  const f = fixture(t), calls = generatedConversionPersistence(f);
  calls.loseCreateAcknowledgement = true;
  const quote = await f.owner.quote(f.quoteRequest());
  assert.equal(quote.status, "QUOTED");
  assert.equal(f.state.stores.conversions.size, 1);
  assert.deepEqual(await f.owner.quote(f.quoteRequest()), quote);
  assert.equal(calls.creates, 1);
  assert.equal(calls.updates, 0);
  assert.equal(f.state.reserves, 0);
  assert.equal(f.state.executeCalls, 0);
});

test("generated insert-only duplicate recovers exact winner and rejects conflicting intent", async t => {
  const f = fixture(t), calls = generatedConversionPersistence(f);
  calls.race = row => row;
  const quote = await f.owner.quote(f.quoteRequest());
  const retained = clone(f.read("conversions", quote.conversionCode));
  assert.equal(calls.creates, 1);
  assert.equal(calls.updates, 0);
  assert.equal(f.state.stores.conversions.size, 1);
  await assert.rejects(f.owner.quote(f.quoteRequest({ amount: "11.00" })), { code: "ERR_LOYALTY_CONVERSION_CONFLICT" });
  assert.deepEqual(f.read("conversions", quote.conversionCode), retained);
  calls.race = row => ({ ...row, intent: { ...row.intent, amount: "12.00" } });
  await assert.rejects(f.owner.quote(f.quoteRequest({ idempotencyKey: "racing-conflict" })),
    { code: "ERR_LOYALTY_CONVERSION_CONFLICT" });
  assert.equal(calls.creates, 2);
  assert.equal(calls.updates, 0);
});

test("generated transition keeps exact revision/status predicates and cannot recreate or overwrite a stale row", async t => {
  const f = fixture(t), calls = generatedConversionPersistence(f);
  const quote = await f.owner.quote(f.quoteRequest());
  const row = f.read("conversions", quote.conversionCode);
  assert(row);
  const context = await f.owner.context(f.command(quote.conversionCode), "status");
  const advanced = { ...row, revision: row.revision + 1, status: "EXPIRED" };
  await f.owner.persist(context, advanced, row);
  await assert.rejects(f.owner.persist(context, { ...row, revision: 1, status: "HOLDING" }, row), { code: "ERR_MDL_00005" });
  assert.deepEqual({ ...f.read("conversions", row.code), updated: advanced.updated }, advanced);
  await assert.rejects(f.owner.persist(context, { ...advanced, revision: 2, status: "HOLDING" },
    { ...advanced, status: "QUOTED" }), { code: "ERR_MDL_00005" });
  assert.deepEqual({ ...f.read("conversions", row.code), updated: advanced.updated }, advanced);
  f.state.stores.conversions.delete("tenant-a:" + row.code);
  await assert.rejects(f.owner.persist(context, advanced, row), { code: "ERR_MDL_00005" });
  assert.equal(f.state.stores.conversions.size, 0);
  assert.equal(calls.creates, 1);
  assert.equal(calls.updates, 4);
});

test("persisted BSON identity never enters transition writes or owner acknowledgement comparisons", async t => {
  const f = fixture(t);
  const calls = generatedConversionPersistence(f);
  const quote = await f.owner.quote(f.quoteRequest());
  const { ObjectId } = require("mongodb");
  const mongo = require("../../../../nodics.foundation/modules/nDatabase/mongodb/src/schemas/model").default;
  const initializer = require("../../../../nodics.foundation/modules/nDatabase/database/src/service/procs/save/defaultModelSaveInitializerService");
  const retainedId = new ObjectId();
  const key = "tenant-a:" + quote.conversionCode;
  f.state.stores.conversions.get(key)._id = retainedId;
  global.UTILS = { isBlank: value => !value || Object.keys(value).length === 0 };
  let writes = 0;
  SERVICE.DefaultLoyaltyPartnerRewardConversionRecordService.save = async request => {
    await require("../../../../nodics.foundation/modules/nDatabase/database/src/service/interceptors/defaultInterceptorService")
      .setUpdatedTimestamp(request, {});
    const schemaModel = {
      ...mongo,
      rawSchema: require("../src/schemas/schemas").loyaltyWallet.loyaltyPartnerRewardConversionRecord,
      dataBase: { getOptions: () => ({ modelSaveOptions: { upsert: true, returnDocument: "after" } }) },
      transactionOptions: () => ({}),
      findOneAndUpdate: async (query, update, options) => {
        assert.equal(options.upsert, false);
        assert.deepEqual(Object.keys(query).sort(), ["code", "revision", "status"]);
        // MongoDB refuses changing its immutable identifier, including a cloned BSON object.
        assert(!Object.hasOwn(update.$set, "_id"), "owner must not $set storage identity");
        const old = f.state.stores.conversions.get(key);
        if (!old || !Object.entries(query).every(([field, value]) => old[field] === value)) return { ok: 1, value: null };
        writes++;
        const saved = { ...clone(update.$set), _id: retainedId };
        f.state.stores.conversions.set(key, saved);
        return { ok: 1, value: saved };
      },
    };
    const result = await initializer.persistModel.call(initializer, { ...request, schemaModel });
    return { code: "SUC_TEST_SAVE", result };
  };
  const result = await f.owner.confirm(f.command(quote.conversionCode));
  assert.equal(result.status, "COMPLETED");
  assert(writes > 1);
  assert.equal(calls.creates, 1);
  assert.equal(f.state.executeCalls, 1);
  assert.equal(f.state.captures, 1);
  assert.equal(f.state.stores.conversions.get(key)._id, retainedId);
  const before = writes;
  assert.deepEqual(await f.owner.confirm(f.command(quote.conversionCode)), result);
  assert.equal(writes, before);
  assert.equal(f.state.executeCalls, 1);
});

test("durable quote and confirmation spend once; output never exposes private account/provider bindings", async t => {
  const f = fixture(t), request = f.quoteRequest(), original = clone(request);
  const quote = await f.owner.quote(request);
  assert.deepEqual(request, original);
  assert.equal(f.state.reserves, 0);
  assert.equal(f.state.stores.conversions.size, 1);
  assert.deepEqual(await f.owner.quote(f.quoteRequest({ amount: "10" })), quote);
  const completed = await f.owner.confirm(f.command(quote.conversionCode));
  assert.equal(completed.status, "COMPLETED");
  await f.owner.confirm(f.command(quote.conversionCode));
  await f.owner.status(f.command(quote.conversionCode));
  assert.equal(f.state.executeCalls, 1);
  assert.equal(f.state.reserves, 1);
  assert.equal(f.state.captures, 1);
  assert.equal(f.state.releases, 0);
  assert.equal(f.state.credits, 1);
  assert.doesNotMatch(JSON.stringify(completed), /private-|credential-binding|providerReference|quoteReference/);
  assert.equal(f.read("conversions", quote.conversionCode).redemptionCode, "redemption-1");
});

test("lost provider acknowledgement survives coordinator restart and never resubmits", async t => {
  const f = fixture(t);
  f.state.loseProviderAcknowledgement = true;
  const quote = await f.owner.quote(f.quoteRequest());
  assert.equal((await f.owner.confirm(f.command(quote.conversionCode))).status, "SUBMITTED");
  assert.equal(f.state.releases, 0);
  const restarted = { ...coordinator, now: f.owner.now };
  assert.equal((await restarted.status(f.command(quote.conversionCode))).status, "COMPLETED");
  assert.equal(f.state.executeCalls, 1);
  assert.equal(f.state.credits, 1);
  assert.equal(f.state.captures, 1);
});

test("unknown outcome retains hold beyond quote expiry; late credit then completes", async t => {
  const f = fixture(t);
  f.state.executeHook = async () => ({ status: "PENDING" });
  const quote = await f.owner.quote(f.quoteRequest());
  await f.owner.confirm(f.command(quote.conversionCode));
  f.state.clock = new Date("2030-01-01T00:00:00Z");
  assert.equal((await f.owner.status(f.command(quote.conversionCode))).status, "SUBMITTED");
  assert.equal(f.state.releases, 0);
  f.state.reconcileHook = async r => f.terminal(r);
  assert.equal((await f.owner.status(f.command(quote.conversionCode))).status, "COMPLETED");
  assert.equal(f.state.executeCalls, 1);
});

test("terminal fenced no-credit releases once, while a lookup absence never releases", async t => {
  const f = fixture(t);
  f.state.executeHook = async r => ({ ...f.terminal(r, "NOT_CREDITED"), cannotCredit: false });
  const quote = await f.owner.quote(f.quoteRequest());
  await assert.rejects(f.owner.confirm(f.command(quote.conversionCode)), { code: "ERR_LOYALTY_CONVERSION_PROVIDER" });
  assert.equal(f.state.releases, 0);
  f.state.reconcileHook = async r => f.terminal(r, "NOT_CREDITED");
  assert.equal((await f.owner.status(f.command(quote.conversionCode))).status, "REJECTED");
  await f.owner.status(f.command(quote.conversionCode));
  assert.equal(f.state.releases, 1);
  assert.equal(f.state.captures, 0);
});

test("confirmed credit remains durable when local capture fails and recovers without provider resubmission", async t => {
  const f = fixture(t);
  f.state.failCapture = true;
  const quote = await f.owner.quote(f.quoteRequest());
  await assert.rejects(f.owner.confirm(f.command(quote.conversionCode)), /capture interrupted/);
  assert.equal(f.read("conversions", quote.conversionCode).status, "CREDIT_CONFIRMED");
  f.provider.execute = async () => assert.fail("must not submit a second credit");
  f.provider.reconcile = async () => assert.fail("retained terminal evidence is sufficient");
  assert.equal((await f.owner.status(f.command(quote.conversionCode))).status, "COMPLETED");
  assert.equal(f.state.captures, 1);
});

test("local capture and conversion state roll back together when final state write fails", async t => {
  const f = fixture(t), quote = await f.owner.quote(f.quoteRequest());
  f.state.failBeforeStatus = "COMPLETED";
  await assert.rejects(f.owner.confirm(f.command(quote.conversionCode)), /persistence interrupted/);
  assert.equal(f.state.captures, 0);
  assert.equal((await f.owner.confirm(f.command(quote.conversionCode))).status, "COMPLETED");
  assert.equal(f.state.captures, 1);
  assert.equal(f.state.executeCalls, 1);
});

test("lost SUBMITTED acknowledgement leaves a recoverable send gap and never blindly executes", async t => {
  const f = fixture(t), quote = await f.owner.quote(f.quoteRequest());
  f.state.failAfterStatus = "SUBMITTED";
  assert.equal((await f.owner.confirm(f.command(quote.conversionCode))).status, "SUBMITTED");
  assert.equal(f.state.executeCalls, 0);
  assert.equal((await f.owner.confirm(f.command(quote.conversionCode))).status, "SUBMITTED");
  f.state.reconcileHook = async r => f.terminal(r, "NOT_CREDITED");
  assert.equal((await f.owner.status(f.command(quote.conversionCode))).status, "REJECTED");
  assert.equal(f.state.executeCalls, 0);
  assert.equal(f.state.releases, 1);
});

test("simultaneous confirmations produce one provider execute and one source posting", async t => {
  const f = fixture(t), quote = await f.owner.quote(f.quoteRequest());
  await Promise.all(Array.from({ length: 12 }, () => f.owner.confirm(f.command(quote.conversionCode))));
  assert.equal((await f.owner.status(f.command(quote.conversionCode))).status, "COMPLETED");
  assert.equal(f.state.executeCalls, 1);
  assert.equal(f.state.reserves, 1);
  assert.equal(f.state.captures, 1);
});

test("quote idempotency rejects changed intent; concurrent quote requests retain one persisted quote", async t => {
  const f = fixture(t);
  const quotes = await Promise.all([f.owner.quote(f.quoteRequest()), f.owner.quote(f.quoteRequest())]);
  assert.deepEqual(quotes[0], quotes[1]);
  assert.equal(f.state.stores.conversions.size, 1);
  await assert.rejects(f.owner.quote(f.quoteRequest({ amount: "11.00" })), { code: "ERR_LOYALTY_CONVERSION_CONFLICT" });
});

test("expired quotes cannot hold rewards; changed integration/account terms refuse confirmation", async t => {
  const f = fixture(t), quote = await f.owner.quote(f.quoteRequest());
  f.read("accounts", "account-link").revision++;
  await assert.rejects(f.owner.confirm(f.command(quote.conversionCode)), { code: "ERR_LOYALTY_CONVERSION_CONFLICT" });
  f.read("accounts", "account-link").revision--;
  f.read("integrations", "partner-route").termsRevision = "v2";
  await assert.rejects(f.owner.confirm(f.command(quote.conversionCode)), { code: "ERR_LOYALTY_CONVERSION_CONFLICT" });
  f.state.clock = new Date("2026-10-18T10:01:00Z");
  assert.equal((await f.owner.confirm(f.command(quote.conversionCode))).status, "EXPIRED");
  assert.equal(f.state.reserves, 0);
});

test("pending conversion retains original binding after integration pause or terms revision", async t => {
  const f = fixture(t);
  f.state.executeHook = async () => ({ status: "UNKNOWN" });
  const quote = await f.owner.quote(f.quoteRequest());
  await f.owner.confirm(f.command(quote.conversionCode));
  Object.assign(f.read("integrations", "partner-route"), { status: "PAUSED", termsRevision: "v2" });
  f.state.reconcileHook = async r => {
    assert.equal(r.integration.termsRevision, "v1");
    assert.equal(r.integration.providerBindingReference, "credential-binding-a");
    return f.terminal(r);
  };
  assert.equal((await f.owner.status(f.command(quote.conversionCode))).status, "COMPLETED");
});

test("inert defaults, missing providers, and old unqualified reserve implementation fail closed", async t => {
  const f = fixture(t);
  f.config.enabled = false;
  await assert.rejects(f.owner.quote(f.quoteRequest()), { code: "ERR_LOYALTY_CONVERSION_UNAVAILABLE" });
  f.config.enabled = true;
  delete f.config.providers.synthetic;
  await assert.rejects(f.owner.quote(f.quoteRequest()), { code: "ERR_LOYALTY_CONVERSION_UNAVAILABLE" });
  f.config.providers.synthetic = "SyntheticPartnerProvider";
  const quote = await f.owner.quote(f.quoteRequest());
  global.SERVICE.DefaultLoyaltyRewardOperationService = { ...originalOperations, partnerConversionCapabilities: undefined };
  await assert.rejects(f.owner.confirm(f.command(quote.conversionCode)), { code: "ERR_LOYALTY_CONVERSION_UNAVAILABLE" });
  assert.equal(f.read("conversions", quote.conversionCode).status, "QUOTED");
  assert.equal(f.state.reserves, 0);
});

test("issuer program and partner route eligibility are independent; coupon availability is insufficient", async t => {
  const f = fixture(t);
  delete f.read("programs", "program").partnerConversionRewardTypeCodes;
  await assert.rejects(f.owner.quote(f.quoteRequest()), { code: "ERR_LOYALTY_CONVERSION_INELIGIBLE" });
  f.read("programs", "program").partnerConversionRewardTypeCodes = ["points"];
  Object.assign(f.read("integrations", "partner-route"), { conversionEnabled: false, couponEnabled: true });
  await assert.rejects(f.owner.quote(f.quoteRequest()), { code: "ERR_LOYALTY_CONVERSION_INELIGIBLE" });
  assert.equal(f.state.stores.conversions.size, 0);
});

test("account mappings cannot cross Enterprise or customer ownership even with a shared adapter", async t => {
  const f = fixture(t);
  f.read("accounts", "account-link").partnerEnterpriseCode = "other-partner";
  await assert.rejects(f.owner.quote(f.quoteRequest()), { code: "ERR_LOYALTY_CONVERSION_INELIGIBLE" });
  f.read("accounts", "account-link").partnerEnterpriseCode = "partner-enterprise";
  f.read("accounts", "account-link").ownerCode = "other-customer";
  await assert.rejects(f.owner.quote(f.quoteRequest()), { code: "ERR_LOYALTY_CONVERSION_INELIGIBLE" });
});

test("authorization, tenant drift, foreign wallet, and extra client fields refuse without writes", async t => {
  const f = fixture(t);
  await assert.rejects(f.owner.quote(f.quoteRequest({ expiresAt: "2099-01-01" })), { code: "ERR_LOYALTY_CONVERSION_INVALID" });
  const drift = f.quoteRequest(); drift.tenant = "tenant-b";
  await assert.rejects(f.owner.quote(drift), { code: "ERR_LOYALTY_CONVERSION_FORBIDDEN" });
  const noPermission = f.quoteRequest(); noPermission.authData.permissions = [];
  await assert.rejects(f.owner.quote(noPermission), { code: "ERR_LOYALTY_PARTICIPANT" });
  f.auth.code = "other-customer";
  await assert.rejects(f.owner.quote(f.quoteRequest()), { code: "ERR_LOYALTY_CONVERSION_FORBIDDEN" });
  f.auth.principalType = "service";
  await assert.rejects(f.owner.quote(f.quoteRequest()), { code: "ERR_LOYALTY_CONVERSION_FORBIDDEN" });
  assert.equal(f.state.stores.conversions.size, 0);
});

test("Enterprise conversion binds employee authority to Enterprise-owned wallet and account", async t => {
  const f = fixture(t);
  f.state.actorType = "human";
  Object.assign(f.auth, { principalType: "human", code: "employee-a", loginId: "employee-a" });
  for (const row of [f.read("wallets", "wallet"), f.read("accounts", "account-link")]) {
    Object.assign(row, { ownerType: "ENTERPRISE", ownerCode: "owner-enterprise" });
  }
  const quote = await f.owner.quote(f.quoteRequest());
  assert.equal((await f.owner.confirm(f.command(quote.conversionCode))).status, "COMPLETED");
  assert.equal(f.read("conversions", quote.conversionCode).ownerCode, "owner-enterprise");
  assert.equal(f.read("conversions", quote.conversionCode).confirmedBy, "employee-a");
  f.auth.entCode = "another-enterprise";
  await assert.rejects(f.owner.status(f.command(quote.conversionCode)), { code: "ERR_LOYALTY_CONVERSION_FORBIDDEN" });
});

test("foreign or unconfirmed provider evidence never captures or releases source rewards", async t => {
  const f = fixture(t), quote = await f.owner.quote(f.quoteRequest());
  f.state.executeHook = async r => ({ ...f.terminal(r), partnerEnterpriseCode: "other-partner" });
  await assert.rejects(f.owner.confirm(f.command(quote.conversionCode)), { code: "ERR_LOYALTY_CONVERSION_PROVIDER" });
  f.state.reconcileHook = async () => ({ status: "ACCEPTED" });
  await assert.rejects(f.owner.status(f.command(quote.conversionCode)), { code: "ERR_LOYALTY_CONVERSION_PROVIDER" });
  assert.equal(f.state.captures, 0);
  assert.equal(f.state.releases, 0);
  assert.equal(f.read("conversions", quote.conversionCode).status, "SUBMITTED");
});

test("source precision is canonical, excess decimals reject, and large exact values survive quote persistence", async t => {
  const f = fixture(t);
  await assert.rejects(f.owner.quote(f.quoteRequest({ amount: "1.001" })), { code: "ERR_LOYALTY_AMOUNT_PRECISION" });
  await assert.rejects(f.owner.quote(f.quoteRequest({ amount: "0" })), { code: "ERR_LOYALTY_AMOUNT_POSITIVE" });
  const quote = await f.owner.quote(f.quoteRequest({ amount: "900719925474099312345.12" }));
  assert.equal(quote.sourceAmount, "900719925474099312345.12");
  assert.equal(f.read("conversions", quote.conversionCode).sourceScale, 2);
});

test("missing persistence and malformed quote do not return fabricated success", async t => {
  const f = fixture(t);
  const save = SERVICE.DefaultLoyaltyPartnerRewardConversionRecordService.save;
  SERVICE.DefaultLoyaltyPartnerRewardConversionRecordService.save = async () => undefined;
  await assert.rejects(f.owner.quote(f.quoteRequest()), { code: "ERR_LOYALTY_CONVERSION_PERSISTENCE" });
  SERVICE.DefaultLoyaltyPartnerRewardConversionRecordService.save = save;
  f.provider.quote = async () => ({ targetAmount: "20.00" });
  await assert.rejects(f.owner.quote(f.quoteRequest()), { code: "ERR_LOYALTY_CONVERSION_PROVIDER" });
  assert.equal(f.state.stores.conversions.size, 0);
});

test("shared Profile participant evidence distinguishes canonical customer code, login and denied Enterprise authority", async t => {
  const f = fixture(t);
  f.state.profileEvidence = { contractVersion: 1, tenant: "tenant-a", enterpriseCode: "owner-enterprise",
    customer: { code: "foreign-canonical-code", loginId: f.auth.loginId } };
  await assert.rejects(f.owner.quote(f.quoteRequest()), { code: "ERR_LOYALTY_CONVERSION_FORBIDDEN" });
  f.state.actorType = "human";
  Object.assign(f.auth, { principalType: "human", loginId: "employee-a" });
  f.state.profileEvidence = { principalCode: "employee-a", scopes: [{ scopeType: "ENTERPRISE", scopeCode: "owner-enterprise" }],
    deniedScopes: [{ scopeType: "ENTERPRISE", scopeCode: "owner-enterprise" }] };
  await assert.rejects(f.owner.quote(f.quoteRequest()), { code: "ERR_LOYALTY_PARTICIPANT" });
  assert.equal(f.state.stores.conversions.size, 0);
});

test("disabling new conversions preserves recovery of a previously confirmed external outcome", async t => {
  const f = fixture(t);
  f.state.loseProviderAcknowledgement = true;
  const quote = await f.owner.quote(f.quoteRequest());
  await f.owner.confirm(f.command(quote.conversionCode));
  f.config.enabled = false;
  await assert.rejects(f.owner.quote(f.quoteRequest({ idempotencyKey: "next" })), { code: "ERR_LOYALTY_CONVERSION_UNAVAILABLE" });
  assert.equal((await f.owner.status(f.command(quote.conversionCode))).status, "COMPLETED");
  assert.equal(f.state.executeCalls, 1);
});

test("hold and state write roll back together; ephemeral source authority cannot be replayed or serialized", async t => {
  const f = fixture(t), quote = await f.owner.quote(f.quoteRequest());
  f.state.failBeforeStatus = "HELD";
  await assert.rejects(f.owner.confirm(f.command(quote.conversionCode)), /persistence interrupted/);
  assert.equal(f.state.reserves, 0);
  assert.equal(f.state.holds.size, 0);
  assert.equal(f.state.executeCalls, 0);
  assert.equal(f.read("conversions", quote.conversionCode).status, "HOLDING");
  assert.equal(f.owner.ownsSourceRequest(f.state.lastSourceRequest), false);
  assert.equal(f.owner.ownsSourceRequest(clone(f.state.lastSourceRequest)), false);
  assert.equal((await f.owner.status(f.command(quote.conversionCode))).status, "COMPLETED");
  assert.equal(f.state.reserves, 1);
});

test("unsafe expiring source holds roll back before any external dispatch", async t => {
  const f = fixture(t), reserve = f.source.reserve;
  f.source.reserve = async r => {
    const result = await reserve(r);
    result.reservation.expiresAt = new Date("2026-10-18T10:15:00Z");
    return result;
  };
  const quote = await f.owner.quote(f.quoteRequest());
  await assert.rejects(f.owner.confirm(f.command(quote.conversionCode)), { code: "ERR_LOYALTY_CONVERSION_PERSISTENCE" });
  assert.equal(f.state.reserves, 0);
  assert.equal(f.state.executeCalls, 0);
});

test("transaction composition is mandatory before a quote can be claimed", async t => {
  const f = fixture(t), quote = await f.owner.quote(f.quoteRequest());
  delete SERVICE.DefaultLoyaltyTransactionService.compose;
  await assert.rejects(f.owner.confirm(f.command(quote.conversionCode)), { code: "ERR_LOYALTY_CONVERSION_UNAVAILABLE" });
  assert.equal(f.read("conversions", quote.conversionCode).status, "QUOTED");
});

function mockFixture(t, overrides = {}) {
  const f = fixture(t);
  const defaults = require("../config/properties").loyalty.partnerRewardConversion;
  f.config.providers = clone(defaults.providers);
  f.config.mock = { ...defaults.mock, enabled: true, ...overrides };
  f.read("integrations", "partner-route").providerKey = "mock";
  f.read("wallets", "wallet").metadata = { sample: true, testOnly: true };
  const adapter = { ...require("../src/service/defaultLoyaltyMockPartnerRewardProviderService"), now: () => f.state.clock };
  SERVICE.DefaultLoyaltyPartnerRewardConversionService = f.owner;
  SERVICE.DefaultLoyaltyMockPartnerRewardProviderService = adapter;
  return { ...f, adapter };
}

test("framework mock defaults are inert and reject malformed overrides and ordinary wallets", async t => {
  const defaults = require("../config/properties").loyalty.partnerRewardConversion;
  assert.equal(defaults.enabled, false);
  assert.equal(defaults.mock.enabled, false);
  const f = mockFixture(t, { enabled: false });
  await assert.rejects(f.owner.quote(f.quoteRequest()), /UNAVAILABLE/);
  f.config.mock.enabled = true;
  for (const [key, invalid] of [["outcome", "SUCCESS"], ["outcome", "enums"], ["outcome", undefined], ["targetUnit", ""], ["quoteLifetimeMs", 0], ["quoteLifetimeMs", Number.MAX_SAFE_INTEGER]]) {
    const previous = f.config.mock[key];
    f.config.mock[key] = invalid;
    await assert.rejects(f.owner.quote(f.quoteRequest()), /UNAVAILABLE/);
    f.config.mock[key] = previous;
  }
  delete f.read("wallets", "wallet").metadata;
  await assert.rejects(f.owner.quote(f.quoteRequest()), /INELIGIBLE/);
  assert.equal(f.state.stores.conversions.size, 0);
  assert.equal(f.state.reserves, 0);
});

test("registered mock retains explicit simulation through quote, capture receipt and restart replay", async t => {
  const f = mockFixture(t, { targetUnit: "SIMULATED_MILES", quoteLifetimeMs: 120000 });
  const quote = await f.owner.quote(f.quoteRequest());
  assert.equal(quote.simulated, true);
  assert.equal(quote.targetUnit, "SIMULATED_MILES");
  assert.equal(quote.targetAmount, "10.00");
  assert.equal(new Date(quote.quoteExpiresAt).getTime() - f.state.clock.getTime(), 120000);
  const row = f.read("conversions", quote.conversionCode);
  assert.equal(row.simulated, true);
  assert.match(row.quoteReference, /^simulated:CREDITED:/);
  f.state.expectedProviderReference = row.quoteReference;
  f.state.failCapture = true;
  await assert.rejects(f.owner.confirm(f.command(quote.conversionCode)), /capture interrupted/);
  assert.equal(f.read("conversions", quote.conversionCode).providerEvidence.simulated, true);
  // A fresh loader instance and changed defaults cannot rewrite retained outcomes.
  SERVICE.DefaultLoyaltyMockPartnerRewardProviderService = { ...require("../src/service/defaultLoyaltyMockPartnerRewardProviderService") };
  f.config.mock.enabled = false;
  f.config.mock.outcome = "NOT_CREDITED";
  f.config.enabled = false;
  const completed = await f.owner.status(f.command(quote.conversionCode));
  assert.equal(completed.status, "COMPLETED");
  assert.equal(completed.simulated, true);
  await f.owner.status(f.command(quote.conversionCode));
  assert.equal(f.state.captures, 1);
  assert.equal(f.state.credits, 0);
  const receipt = [...f.state.postings.values()][0].redemption;
  assert.match(receipt.providerReference, /^simulated:CREDITED:/);
  assert.doesNotMatch(JSON.stringify(completed), /private-|credential-binding/);
});

for (const outcome of ["NOT_CREDITED", "PENDING", "UNKNOWN"]) test(`mock ${outcome} follows the existing protected outcome workflow`, async t => {
  const f = mockFixture(t, { outcome });
  const quote = await f.owner.quote(f.quoteRequest());
  const result = await f.owner.confirm(f.command(quote.conversionCode));
  assert.equal(result.simulated, true);
  assert.equal(result.status, outcome === "NOT_CREDITED" ? "REJECTED" : "SUBMITTED");
  f.config.mock.outcome = "CREDITED";
  f.config.mock.enabled = false;
  assert.deepEqual(await f.owner.status(f.command(quote.conversionCode)), result);
  assert.equal(f.state.captures, 0);
  assert.equal(f.state.releases, outcome === "NOT_CREDITED" ? 1 : 0);
  if (outcome === "NOT_CREDITED") assert.equal(f.read("conversions", quote.conversionCode).providerEvidence.cannotCredit, true);
});

test("mock send-gap recovery is deterministic and rejects cross-tenant or changed quote terms", async t => {
  const f = mockFixture(t);
  const quote = await f.owner.quote(f.quoteRequest());
  const row = f.read("conversions", quote.conversionCode);
  const request = f.owner.providerRequest({ tenant: "tenant-a" }, row);
  const expected = await f.adapter.execute(request);
  f.config.mock.outcome = "NOT_CREDITED";
  f.config.mock.enabled = false;
  assert.deepEqual(await f.adapter.reconcile(request), expected);
  for (const changes of [{ tenant: "tenant-b" }, { targetAmount: "100.00" }, { simulated: false }, { quoteReference: "bad" }]) {
    await assert.rejects(f.adapter.reconcile({ ...request, ...changes }), /PROVIDER/);
  }
  assert.equal(f.state.reserves, 0);
});

test("mock resumes a submitted send gap with a fresh provider and frozen scenario", async t => {
  const f = mockFixture(t);
  const quote = await f.owner.quote(f.quoteRequest());
  f.state.expectedProviderReference = f.read("conversions", quote.conversionCode).quoteReference;
  f.adapter.execute = async () => { throw Error("send gap"); };
  assert.equal((await f.owner.confirm(f.command(quote.conversionCode))).status, "SUBMITTED");
  SERVICE.DefaultLoyaltyMockPartnerRewardProviderService = { ...require("../src/service/defaultLoyaltyMockPartnerRewardProviderService") };
  f.config.mock.outcome = "NOT_CREDITED";
  f.config.mock.enabled = false;
  const result = await f.owner.status(f.command(quote.conversionCode));
  assert.equal(result.status, "COMPLETED");
  assert.equal(result.simulated, true);
  assert.equal(f.state.captures, 1);
  assert.equal(f.state.releases, 0);
});

test("coordinator refuses simulation marker loss and real-provider replacement before spending", async t => {
  const f = mockFixture(t), originalQuote = f.adapter.quote;
  f.adapter.quote = async function (request) { return { ...await originalQuote.call(this, request), simulated: false }; };
  await assert.rejects(f.owner.quote(f.quoteRequest()), /PROVIDER/);
  f.adapter.quote = originalQuote;
  const quote = await f.owner.quote(f.quoteRequest());
  const row = f.read("conversions", quote.conversionCode);
  const outcome = await f.adapter.execute(f.owner.providerRequest({ tenant: "tenant-a" }, row));
  assert.throws(() => f.owner.outcome(row, { ...outcome, simulated: false }), /PROVIDER/);
  f.config.providers.mock = "SyntheticPartnerProvider";
  await assert.rejects(f.owner.confirm(f.command(quote.conversionCode)), /PROVIDER/);
  assert.equal(f.state.reserves, 0);
});

test("mock canonical amount owner can be customized without replacing conversion workflow", async t => {
  const f = mockFixture(t);
  let calls = 0;
  const amount = SERVICE.DefaultLoyaltyAmountService;
  SERVICE.DefaultLoyaltyAmountService = { ...amount, assertPositive: function (...args) {
    calls++;
    return amount.assertPositive.apply(this, args);
  } };
  const quote = await f.owner.quote(f.quoteRequest({ amount: "9007199254740993.01" }));
  assert.equal(quote.targetAmount, "9007199254740993.01");
  assert.ok(calls >= 3);
  const schema = require("../src/schemas/schemas").loyaltyWallet.loyaltyPartnerRewardConversionRecord.definition;
  assert.equal(schema.simulated.type, "bool");
  assert.equal(schema.simulated.required, true);
});
