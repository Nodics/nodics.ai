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
/** @module loyaltyWallet/test/loyaltyPartnerRewardSelection @description Exercises bounded owner-scoped conversion choices with synthetic persisted records; no provider execution or account linking. @layer test @owner loyaltyWallet */
const test = require("node:test");
const assert = require("node:assert/strict");
const owner = require("../src/service/defaultLoyaltyPartnerRewardConversionService");

/** Creates isolated generated-read fixtures while exercising the actual conversion admission and eligibility methods. */
function fixture(t, enterprise = false) {
  const previous = ["CONFIG", "SERVICE"].map(key => [key, global[key]]);
  t.after(() => previous.forEach(([key, value]) => value === undefined ? delete global[key] : global[key] = value));
  const participant = { ownerType: enterprise ? "ENTERPRISE" : "CUSTOMER", ownerCode: enterprise ? "buyer" : "customer", actorCode: "actor" };
  const policy = structuredClone(require("../config/properties").loyalty.partnerRewardConversion);
  policy.enabled = true;
  policy.providers.synthetic = "SyntheticProvider";
  const records = {
    DefaultLoyaltyWalletService: [{ code: "wallet", active: true, status: "OPEN", ...participant }],
    DefaultLoyaltyPartnerRewardAccountService: [{ code: "link", active: true, status: "VERIFIED", ...participant,
      revision: 1, integrationCode: "integration", partnerEnterpriseCode: "partner", accountReference: "private-account", verificationReference: "private-proof" }],
    DefaultLoyaltyPartnerRewardIntegrationService: [{ code: "integration", active: true, status: "ACTIVE", revision: 1,
      conversionEnabled: true, partnerEnterpriseCode: "partner", providerKey: "synthetic", providerBindingReference: "private-credentials",
      termsReference: "terms", termsRevision: "1", sourceRewards: [{ programCode: "program", rewardTypeCode: "points" }] }],
    DefaultLoyaltyProgramService: [{ code: "program", active: true, status: "ACTIVE", spendEnabled: true, partnerConversionRewardTypeCodes: ["points"] }],
    DefaultLoyaltyRewardTypeService: [{ code: "points", active: true, status: "ACTIVE", precision: 2 }],
  };
  const reads = [], state = { records, policy, reads, participant };
  global.CONFIG = { get: key => key === "loyalty" ? { partnerRewardConversion: policy } : undefined };
  global.SERVICE = { DefaultLoyaltyAmountService: require("../../loyaltyCore/src/service/defaultLoyaltyAmountService"),
    DefaultLoggerService: { assertSensitiveRequest: () => {} },
    DefaultLoyaltyParticipantService: {
      resolve: async (request, permission) => {
        assert.equal(permission, "loyalty.partnerConversion.read");
        assert.equal(request.authorization, "Bearer original");
        return structuredClone(participant);
      },
      recipient: async () => ({ ownerType: "ENTERPRISE", ownerCode: "partner" }),
    },
    DefaultLoyaltyRewardOperationService: { serviceRequest: context => ({ tenant: context.tenant, authData: { principalType: "service" } }) },
    SyntheticProvider: { capabilities: () => ({ contractVersion: 1, idempotentExecution: true, authoritativeOutcomes: true, terminalNoCreditFence: true }),
      quote: () => assert.fail("Selection must not quote"), execute: () => assert.fail("Selection must not execute"), reconcile: () => assert.fail("Selection must not reconcile") },
  };
  for (const name of Object.keys(records)) SERVICE[name] = { get: async request => {
    reads.push({ name, request });
    let result = structuredClone(records[name].filter(row => Object.entries(request.query).every(([key, value]) => row[key] === value)));
    const count = result.length;
    result = result.slice(0, request.searchOptions.pageSize);
    if (state.changeRead) result = state.changeRead(name, result);
    return { code: "SUC_TEST_READ", result, count };
  } };
  state.request = { tenant: "tenant", authorization: "Bearer original", payload: {},
    authData: { tenant: "tenant", entCode: "buyer", principalType: enterprise ? "human" : "customer", tokenType: "access" } };
  return state;
}

for (const enterprise of [false, true]) test(`conversion options use exact ${enterprise ? "Enterprise" : "Customer"} ownership and redact external evidence`, async t => {
  const f = fixture(t, enterprise), result = await owner.options(f.request);
  assert.equal(result.options.length, 1);
  assert.equal(result.walletCode, "wallet");
  assert.deepEqual(result.owner, { ownerType: f.participant.ownerType, ownerCode: f.participant.ownerCode });
  assert.deepEqual(result.options[0], { integrationCode: "integration", partnerEnterpriseCode: "partner", accountLinkCode: "link",
    programCode: "program", rewardTypeCode: "points", sourceScale: 2, termsReference: "terms", termsRevision: "1" });
  assert.doesNotMatch(JSON.stringify(result), /private-|actorCode|providerKey/);
  assert.ok(f.reads.every(({ request }) => request.tenant === "tenant" && request.options.recursive === false));
});
test("disabled conversion performs no generated reads and supplies no routes", async t => {
  const f = fixture(t); f.policy.enabled = false;
  assert.deepEqual((await owner.options(f.request)).options, []);
  assert.equal(f.reads.length, 0);
});
test("empty or unrelated verified links never invent a partner account", async t => {
  const f = fixture(t); f.records.DefaultLoyaltyPartnerRewardAccountService[0].ownerCode = "other";
  assert.deepEqual((await owner.options(f.request)).options, []);
});
test("truncated account scans fail rather than offer a partial choice set", async t => {
  const f = fixture(t); f.policy.selection.maximumAccounts = 1;
  f.records.DefaultLoyaltyPartnerRewardAccountService.push({ ...f.records.DefaultLoyaltyPartnerRewardAccountService[0], code: "second" });
  await assert.rejects(owner.options(f.request), /PERSISTENCE/);
});
test("foreign generated rows and caller owner selectors refuse", async t => {
  const f = fixture(t);
  f.changeRead = (name, rows) => name === "DefaultLoyaltyPartnerRewardAccountService" ? rows.map(row => ({ ...row, ownerCode: "other" })) : rows;
  await assert.rejects(owner.options(f.request), /PERSISTENCE/);
  await assert.rejects(owner.options({ ...f.request, payload: { ownerCode: "other" } }), /INVALID/);
});
test("expired links and issuer-ineligible reward types are not offered", async t => {
  const f = fixture(t);
  f.records.DefaultLoyaltyPartnerRewardAccountService[0].validUntil = "2000-01-01T00:00:00Z";
  assert.deepEqual((await owner.options(f.request)).options, []);
  delete f.records.DefaultLoyaltyPartnerRewardAccountService[0].validUntil;
  f.records.DefaultLoyaltyProgramService[0].partnerConversionRewardTypeCodes = [];
  assert.deepEqual((await owner.options(f.request)).options, []);
});
test("no adapter selection and incomplete framework policy cannot create routes", async t => {
  const f = fixture(t); f.policy.providers = {};
  assert.deepEqual((await owner.options(f.request)).options, []);
  delete f.policy.selection;
  await assert.rejects(owner.options(f.request), /UNAVAILABLE/);
});
test("a retired integration does not block an unrelated eligible route", async t => {
  const f = fixture(t);
  f.records.DefaultLoyaltyPartnerRewardAccountService.push({ ...f.records.DefaultLoyaltyPartnerRewardAccountService[0],
    code: "old-link", integrationCode: "retired" });
  f.records.DefaultLoyaltyPartnerRewardIntegrationService.push({ ...f.records.DefaultLoyaltyPartnerRewardIntegrationService[0],
    code: "retired", active: false, status: "RETIRED" });
  const result = await owner.options(f.request);
  assert.equal(result.options.length, 1);
  assert.equal(result.options[0].integrationCode, "integration");
});
for (const kind of ["program", "rewardType"]) test(`an inactive ${kind} does not hide other eligible reward choices`, async t => {
  const f = fixture(t), program = kind === "program";
  const name = program ? "DefaultLoyaltyProgramService" : "DefaultLoyaltyRewardTypeService";
  const key = program ? "programCode" : "rewardTypeCode";
  f.records[name].push({ ...f.records[name][0], code: "retired", active: false });
  f.records.DefaultLoyaltyPartnerRewardIntegrationService[0].sourceRewards.push({ programCode: "program", rewardTypeCode: "points", [key]: "retired" });
  const result = await owner.options(f.request);
  assert.equal(result.options.length, 1);
  assert.equal(result.options[0][key], program ? "program" : "points");
  f.records[name][1].active = "false";
  await assert.rejects(owner.options(f.request), /PERSISTENCE/);
  f.records[name][1].active = false;
  f.records[name][1].tenant = "foreign";
  await assert.rejects(owner.options(f.request), /PERSISTENCE/);
});
test("authority drift during selection refuses the complete response", async t => {
  const f = fixture(t);
  f.changeRead = (name, rows) => { if (name === "DefaultLoyaltyRewardTypeService") f.request.authData.entCode = "different"; return rows; };
  await assert.rejects(owner.options(f.request), /FORBIDDEN/);
});
