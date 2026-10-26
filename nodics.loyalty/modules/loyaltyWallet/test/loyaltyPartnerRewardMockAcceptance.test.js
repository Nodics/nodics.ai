/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module loyaltyWallet/test @description Isolated installed-runner contracts; no live acceptance. @owner loyaltyWallet @layer test */
const test = require("node:test");
const assert = require("node:assert/strict");
const load = () => import("../src/service/acceptance/defaultLoyaltyPartnerRewardMockAcceptanceService.mjs");
const selection = () => ({
  contractVersion: 1, approvalReference: "review-1", environmentCode: "exampleLocal", localDemo: true,
  isolatedPartition: true, baseUrl: "http://127.0.0.1:65534", enterpriseCode: "runtime-enterprise", runCode: "retained-e11",
  owner: { ownerType: "ENTERPRISE", ownerCode: "GREENPERKS_RETAIL" }, walletCode: "WALLET_999EE415B574069DDD37BC98",
  integrationCode: "integration", accountLinkCode: "account", partnerEnterpriseCode: "partner-enterprise",
  programCode: "program", rewardTypeCode: "points", termsReference: "simulated:terms", termsRevision: "1",
  amount: "1", sourceScale: 0, targetUnit: "SIMULATED_POINTS",
});
const actorCode = "retail.administrator@circa.local";
const token = "eyJhbGciOiJIUzI1NiJ9." + Buffer.from(JSON.stringify({ entCode: "runtime-enterprise", loginId: actorCode })).toString("base64url") + ".syntheticSignature";

async function fixture(tamper = () => {}, recovered = false) {
  const api = await load(), s = selection(), plan = await api.run({ selection: s });
  let done = recovered, confirms = 0;
  const calls = [];
  const result = () => ({ ...Object.fromEntries(["integrationCode", "accountLinkCode", "partnerEnterpriseCode", "programCode", "rewardTypeCode", "termsReference", "termsRevision", "walletCode", "owner", "sourceScale", "targetUnit"].map(key => [key, s[key]])),
    simulated: true, conversionCode: plan.conversionCode, status: done ? "COMPLETED" : "QUOTED", sourceAmount: "1",
    targetAmount: "1", targetScale: 0, ...(done ? { completedAt: "2026-10-25", confirmedAt: "2026-10-25" } : {}) });
  const fetch = async (url, options) => {
    const op = url.pathname.split("/").pop(); calls.push({ op, options });
    assert.equal(options.headers.Authorization, "Bearer " + token);
    assert.equal(options.headers["x-enterprise-code"], s.enterpriseCode);
    assert.equal(options.redirect, "error");
    assert.ok(options.signal);
    let value;
    if (op === "options") value = { enabled: true, owner: s.owner, walletCode: s.walletCode, options: [result()] };
    else if (op === "wallet") value = { owner: s.owner, wallet: { ...s.owner, code: s.walletCode, status: "OPEN" },
      balances: [{ programCode: s.programCode, rewardTypeCode: s.rewardTypeCode, precision: 0,
        available: done ? "4" : "5", spent: done ? "1" : "0", reserved: "0", earned: "5" }] };
    else {
      if (op === "quote") assert.equal(JSON.parse(options.body).idempotencyKey, "retained-e11:convert");
      else assert.deepEqual(JSON.parse(options.body), { conversionCode: plan.conversionCode });
      if (op === "confirm") { done = true; confirms++; }
      assert.ok(["quote", "confirm", "status"].includes(op), "No provisioning or credit route");
      value = result();
    }
    tamper(value, op, confirms);
    return new Response(JSON.stringify({ code: "SUC_TEST", result: value }), { status: 200 });
  };
  return { api, s, fetch, calls };
}

test("plan is offline and stable; explicit Local selection cannot smuggle authority", async () => {
  const api = await load(), s = selection();
  assert.deepEqual(await api.run({ selection: s }), await api.run({ selection: s, fetch: () => assert.fail("network") }));
  for (const patch of [{ baseUrl: "https://example.com" }, { baseUrl: "http://user:pass@localhost" },
    { environmentCode: "Production" }, { localDemo: false }, { isolatedPartition: false },
    { amount: 1 }, { amount: "0" }, { amount: "1.5" }, { token }, { sourceScale: 9 }])
    assert.throws(() => api.validate({ ...s, ...patch }));
  assert.throws(() => api.sessionHeaders("service-token", s));
  assert.throws(() => api.sessionHeaders(token, { ...s, enterpriseCode: "foreign" }));
});
test("bounded HTTP exercises simulation, one source debit and replay without credits", async () => {
  const f = await fixture();
  const report = await f.api.run({ selection: f.s, execute: true, token, fetch: f.fetch });
  assert.equal(report.state, "PASSED"); assert.equal(report.simulated, true);
  assert.equal(report.externalPartnerCreditProven, false); assert.equal(report.sourceDeltaVerified, true);
  assert.equal(f.calls.length, 8);
});
test("retained completed key is recovery, not a claim of fresh accounting", async () => {
  const f = await fixture(() => {}, true);
  const report = await f.api.run({ selection: f.s, execute: true, token, fetch: f.fetch });
  assert.equal(report.state, "RECOVERED"); assert.equal(report.sourceDeltaVerified, false);
});
test("installed owner projection accepts actor evidence without changing the two-key selection", async () => {
  const f = await fixture(value => { value.owner = { ...value.owner, actorCode }; });
  const report = await f.api.run({ selection: f.s, execute: true, token, fetch: f.fetch });
  assert.equal(report.state, "PASSED");
  assert.deepEqual(f.s.owner, { ownerType: "ENTERPRISE", ownerCode: "GREENPERKS_RETAIL" });
});
test("owner projections reject foreign typed owners and actor evidence at every response boundary", async () => {
  for (const operation of ["options", "wallet", "quote", "confirm", "status"]) {
    for (const patch of [{ ownerType: "CUSTOMER" }, { ownerCode: "foreign" },
      { actorCode: "foreign@circa.local" }, { actorCode: null }, { actorCode: "" }]) {
      const f = await fixture((value, op) => { if (op === operation) value.owner = { ...value.owner, ...patch }; });
      await assert.rejects(f.api.run({ selection: f.s, execute: true, token, fetch: f.fetch }));
      assert.equal(f.calls.at(-1).op, operation);
    }
  }
});
test("non-simulated, foreign and drifted results stop before further mutation", async () => {
  for (const [operation, alter] of [
    ["options", v => { v.options[0].simulated = false; }],
    ["quote", v => { v.simulated = false; }],
    ["quote", v => { v.accountLinkCode = "foreign"; }],
    ["confirm", v => { v.targetAmount = "2"; }],
    ["confirm", v => { v.status = "SUBMITTED"; }],
  ]) {
    const f = await fixture((value, op) => { if (op === operation) alter(value); });
    await assert.rejects(f.api.run({ selection: f.s, execute: true, token, fetch: f.fetch }));
    assert.equal(f.calls.at(-1).op, operation);
  }
});
test("replay balance changes and error envelopes cannot pass", async () => {
  const f = await fixture((value, op, confirms) => {
    if (op === "wallet" && confirms === 2) value.balances[0].available = "3";
  });
  await assert.rejects(f.api.run({ selection: f.s, execute: true, token, fetch: f.fetch }), /Replay changed/);
  const api = await load();
  for (const response of [new Response(JSON.stringify({ code: "ERR_TEST", secret: "private" })),
    new Response("private", { status: 302 }), new Response("x".repeat(262145)),
    new Response(JSON.stringify({ data: {}, result: {} }))]) {
    await assert.rejects(api.transport(selection(), token, async () => response)("/wallet"), error => !error.message.includes("private"));
  }
});
