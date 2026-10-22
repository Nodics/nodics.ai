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
  const previous = ["SERVICE", "CONFIG", "CLASSES"].map(key => [key, Object.getOwnPropertyDescriptor(global, key)]);
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
        assert.equal(request.options.upsert, false);
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
      assert.equal(request.providerReference, "credit-receipt");
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
