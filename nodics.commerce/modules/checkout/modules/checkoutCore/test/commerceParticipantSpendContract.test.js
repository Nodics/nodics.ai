/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module checkoutCore/test/commerceParticipantSpendContract @description Proves shared exact Enterprise ceilings, scoped administration and revision-bound settings. @layer test @owner checkoutCore */
const test = require("node:test"), assert = require("node:assert/strict");
const owner = require("../src/service/defaultCommerceParticipantSpendService");
const defaults = require("../config/properties");
const exact = require("../../../../baseCommerce/modules/pricing/src/service/defaultExactAmountService");
const ref = { module: "profile", schema: "enterprise", code: "buyer" };
const actor = { principalType: "human", code: "staff", loginId: "staff", enterpriseCode: "buyer" };
const terms = amount => ({ ownerRef: ref, actorRef: actor, amount, currency: "POINTS" });
const input = () => ({ tenant: "tenant", enterpriseCode: "buyer", authorization: "Bearer original",
  authData: { tenant: "tenant", enterpriseCode: "buyer", loginId: "admin", principalType: "human", tokenType: "access" } });

function setup() {
  const state = { policy: undefined, defaults: structuredClone(defaults), scopes: [{ scopeType: "ENTERPRISE", scopeCode: "buyer" }], denied: [] };
  global.CONFIG = { get: name => state.defaults[name] };
  global.UTILS = { createModelName: name => name };
  global.NODICS = { getModels: () => ({ commerceParticipantSpendPolicy: { versioned: false, primaryKey: "code", compareAndSetItem() {}, rawSchema: {} } }) };
  global.SERVICE = {
    DefaultExactAmountService: exact,
    DefaultCheckoutPlacementPortsService: { serviceAuthData: request => request.authData },
    DefaultModelConcurrencyService: { getField: () => "revision" },
    DefaultDatabaseModelHandlerService: { inspectIndexes: async () => ({ versioned: false, indexes: [{ unique: true, key: { code: 1 } }] }) },
    DefaultSecuredRequestPipelineService: { getGrantedPermissions: () => ["commerce.checkout.spend.manage"], isPermissionGranted: (p, list) => list.includes(p) },
    DefaultModuleService: { invokeModule: async () => ({ principalCode: "admin", scopes: state.scopes, deniedScopes: state.denied }) },
    DefaultCommerceParticipantSpendPolicyService: {
      get: async () => ({ code: "SUC_READ", count: state.policy ? 1 : 0, result: state.policy ? [structuredClone(state.policy)] : [] }),
      save: async request => { state.policy = { ...request.model, revision: 0 }; return { code: "SUC_SAVE" }; },
      update: async request => { state.policy = { ...request.model, revision: request.model.revision + 1 }; return { code: "SUC_UPDATE" }; },
    },
    DefaultBiddingAuctionService: { isSeller: () => false, scheduler: request => { assert.equal(request.authData.principalType, "service"); return request; } },
  };
  global.FACADE = { DefaultCartCustomerFacade: { resolveContext: async request => ({ ...request, ownerRef: ref, actorRef: actor }) } };
  state.setPolicy = (limit, overrides = {}) => { state.policy = { tenant: "tenant", enterpriseCode: "buyer", actorCode: "staff", currency: "POINTS",
    code: owner.key("tenant", "buyer", "staff", "POINTS"), perPurchaseLimit: limit, status: "ACTIVE", revision: 0, ...overrides }; };
  return state;
}

test("framework defaults remain authoritative; Enterprise actor limits are governed records", async () => {
  const state = setup();
  assert.equal((await owner.enforce(input(), terms("100.00"))).withinLimit, true);
  state.setPolicy("10.00");
  assert.equal((await owner.enforce(input(), terms("10.00"))).withinLimit, true);
  await assert.rejects(owner.enforce(input(), terms("10.01")), /exceeds/);
});
test("exact ceilings never use floating point and a framework ceiling cannot be raised", async () => {
  const state = setup(); state.setPolicy("9007199254740993.00");
  assert.equal((await owner.assess(input(), terms("9007199254740993.01"))).withinLimit, false);
  state.defaults.checkoutCore.participantSpend.perPurchaseLimit = "5";
  assert.equal((await owner.assess(input(), terms("6"))).withinLimit, false);
});
test("zero ceiling blocks paid purchases while free transactions remain eligible", async () => {
  const state = setup(); state.setPolicy("0");
  assert.equal((await owner.enforce(input(), terms("0"))).withinLimit, true);
  await assert.rejects(owner.enforce(input(), terms("0.01")), /exceeds/);
});
test("foreign, duplicate, failed and truncated policy reads fail closed", async () => {
  const state = setup(); state.setPolicy("10", { enterpriseCode: "other" });
  await assert.rejects(owner.enforce(input(), terms("1")), /not confirmed/);
  for (const response of [{ code: "ERR_READ", count: 0, result: [] }, { code: "SUC_READ", count: 1, result: [] },
    { code: "SUC_READ", count: 2, result: [state.policy, state.policy] }]) {
    SERVICE.DefaultCommerceParticipantSpendPolicyService.get = async () => response;
    await assert.rejects(owner.enforce(input(), terms("1")), /not confirmed/);
  }
});
test("missing defaults and caller-selected owner fail before charging", async () => {
  const state = setup(); delete state.defaults.checkoutCore.participantSpend;
  await assert.rejects(owner.enforce(input(), terms("1")), /unavailable/);
  setup(); await assert.rejects(owner.enforce(input(), { ...terms("1"), ownerRef: { ...ref, code: "other" } }), /owner changed/);
});
test("auction and checkout consume the same actor policy with no Wallet-side counter", async () => {
  const state = setup(); state.setPolicy("10");
  const request = { ...input(), buyerRef: ref, actorRef: actor }, command = { ...terms("11"), roundCode: "round" };
  const round = { tenant: "tenant", code: "round", currency: "POINTS" };
  assert.equal((await owner.evaluateAuction(request, { round, operation: "qualify", command })).withinLimit, false);
  await assert.rejects(owner.evaluateAuction(request, { round, operation: "qualify", command: { ...command, actorRef: { ...actor, loginId: "other" } } }), /participant changed/);
});
test("scheduler uses retained bid actor, not seller or service identity", async () => {
  const state = setup(); state.setPolicy("10");
  const command = { ...terms("11"), roundCode: "round", sourceCode: "bid" };
  const round = { tenant: "tenant", code: "round", currency: "POINTS", bids: { bid: { buyerRef: ref, actorRef: actor, amount: "11" } } };
  const request = { ...input(), authData: { principalType: "service" } };
  assert.equal((await owner.evaluateAuction(request, { round, operation: "inspect", command })).withinLimit, false);
  await assert.rejects(owner.evaluateAuction(request, { round, operation: "inspect", command: { ...command, amount: "1" } }), /not retained/);
});
test("Enterprise administration respects explicit denials", async () => {
  const state = setup(); state.denied = [{ scopeType: "ENTERPRISE", scopeCode: "buyer" }];
  await assert.rejects(owner.settings({ ...input(), payload: { actorCode: "staff", currency: "POINTS" } }), /denied/);
});
test("admin changes are scoped, revision-bound and may remove an actor ceiling", async () => {
  const state = setup(), request = { ...input(), payload: { actorCode: "staff", currency: "POINTS", expectedRevision: null, perPurchaseLimit: "20" } };
  const created = await owner.updateSettings(request);
  assert.equal(created.revision, 0); assert.equal(state.policy.updatedBy, "admin");
  await assert.rejects(owner.updateSettings(request), /changed; reload/);
  request.payload.expectedRevision = 0; request.payload.perPurchaseLimit = null;
  assert.equal((await owner.updateSettings(request)).perPurchaseLimit, null);
  assert.equal(state.policy.revision, 1);
});
test("unqualified persistence cannot save spending policies", async () => {
  setup(); NODICS.getModels = () => ({});
  await assert.rejects(owner.updateSettings({ ...input(), payload: { actorCode: "staff", currency: "POINTS", expectedRevision: null, perPurchaseLimit: "10" } }), /concurrency/);
});
test("Profile authority mutation during lookup is rejected", async () => {
  setup(); const request = input();
  SERVICE.DefaultModuleService.invokeModule = async () => { request.tenant = "other"; return { principalCode: "admin", scopes: [], deniedScopes: [] }; };
  await assert.rejects(owner.administrator(request), /changed/);
});
test("wildcard denied administration cannot read or change policies and foreign qualifiers never grant authority", async () => {
  const state = setup(), request = input();
  request.authData.permissions = ["commerce.checkout.spend.manage"];
  SERVICE.DefaultSecuredRequestPipelineService = require("../../../../../../nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService");
  state.scopes = [{ scopeType: "ENTERPRISE", scopeCode: "buyer", capabilityCode: "*" }];
  await owner.administrator(request);
  SERVICE.DefaultCommerceParticipantSpendPolicyService.get = async () => assert.fail("Denied administrator cannot read policy");
  for (const [scopeType, scopeCode] of [["GLOBAL", "*"], ["TENANT", "tenant"], ["ENTERPRISE", "buyer"]]) {
    state.denied = [{ scopeType, scopeCode, capabilityCode: "*" }];
    await assert.rejects(owner.settings({ ...request, payload: { actorCode: "staff", currency: "POINTS" } }), /denied/);
  }
  state.denied = [];
  state.scopes = [{ scopeType: "GLOBAL", scopeCode: "*", enterpriseCode: "foreign" }];
  await assert.rejects(owner.administrator(request), /denied/);
  state.scopes = [{ scopeType: "ENTERPRISE", scopeCode: "buyer" }];
  await assert.rejects(({ ...owner, matchesAdministratorScope: () => false }).administrator(request), /denied/);
});
