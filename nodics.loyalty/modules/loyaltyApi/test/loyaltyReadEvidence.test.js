/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module loyaltyApi/test/loyaltyReadEvidence @description Source-only owner-generated evidence and original groupless runtime-context tests. No JWT issuance, native provider or live acceptance claim. @layer test @owner loyaltyApi */
const test = require("node:test"), assert = require("node:assert/strict");
const evidence = require("../../loyaltyWallet/src/service/defaultLoyaltyReadEvidenceService");
const operations = require("../../loyaltyWallet/src/service/defaultLoyaltyRewardOperationService");
const runtime = require("../../../../nodics.foundation/modules/nAuth/src/service/identity/defaultServiceTokenService");
const security = require("../../../../nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService");
const routes = require("../src/router/routers").loyaltyApi.internal;
const facade = require("../src/facade/defaultLoyaltyInternalFacade");
const controller = require("../src/controller/defaultLoyaltyInternalController");
function fixture(t) {
  const previous = Object.fromEntries(["SERVICE", "CONFIG", "CLASSES", "FACADE", "NODICS"].map(key => [key, global[key]]));
  t.after(() => { for (const [key, value] of Object.entries(previous)) if (value === undefined) delete global[key]; else global[key] = value; });
  global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
  const authData = { tokenType: "service", principalType: "service", serviceId: "runtime", principalId: "runtime", tenant: "tenant",
    entCode: "enterprise", runtimeInstanceId: "instance", runtimeScope: { projectCode: "project", environmentCode: "local",
      serverCode: "waste", instanceCode: "instance", assignmentCode: "grant" }, modules: ["loyaltyApi"], permissions: ["loyalty.wallet.read"], userGroups: [], groups: [] };
  const p = { customerCode: "customer", programCode: "program", rewardTypeCode: "points" };
  const record = value => ({ tenant: "tenant", active: true, revision: 1, ...value });
  const rows = {
    DefaultLoyaltyWalletService: [record({ code: "wallet", ownerType: "CUSTOMER", ownerCode: "customer", status: "OPEN", metadata: { private: true } })],
    DefaultLoyaltyWalletRewardBalanceService: [record({ code: "balance", walletCode: "wallet", programCode: "program", rewardTypeCode: "points", available: "118.00", reserved: "0.00" })],
    DefaultRewardLedgerEntryService: [record({ code: "capture", walletCode: "wallet", programCode: "program", rewardTypeCode: "points",
      entryType: "CAPTURE", amount: "16.00", sourceType: "PAYMENT", sourceCode: "order", targetType: "ORDER", targetCode: "order", idempotencyKey: "checkout:payment:capture" }),
    record({ code: "refund", walletCode: "wallet", programCode: "program", rewardTypeCode: "points", entryType: "REVERSE", amount: "16.00",
      sourceType: "PAYMENT", sourceCode: "order", reversalOfEntryCode: "capture", idempotencyKey: "original-refund" })],
  };
  const reads = [], state = { truncate: false, foreign: false };
  global.CONFIG = { get: key => key === "authSecurity" ? { internalToken: { runtimeAccessGroups: ["serviceAccountUserGroup"] } } : undefined };
  global.SERVICE = { DefaultServiceTokenService: runtime, DefaultLoyaltyRewardOperationService: operations, DefaultLoyaltyReadEvidenceService: evidence,
    DefaultLoggerService: { hasPrivateCaptureProtection: () => true } };
  global.FACADE = { DefaultLoyaltyInternalFacade: facade };
  for (const name of Object.keys(rows)) SERVICE[name] = {
    get: async input => {
      reads.push({ name, input });
      assert.equal(input.tenant, "tenant"); assert.equal(input.authData.principalId, "loyaltyRewardOperationService");
      assert.equal(input.options.recursive, false); assert.equal(input.options.skipItemCache, true);
      assert.equal(input.searchOptions.pageSize, 2); assert.equal(input.searchOptions.pageNumber, 1);
      const selected = structuredClone(rows[name].filter(row => Object.entries(input.query).every(([key, value]) => row[key] === value)));
      if (state.foreign && selected[0]) selected[0].tenant = "foreign";
      return { code: "SUC_GET", result: selected, ...(state.omitCount ? {} : { count: state.truncate ? 20 : selected.length }) };
    },
    save: () => assert.fail("Read evidence must not save"), update: () => assert.fail("Read evidence must not update"),
  };
  return { authData, p, rows, reads, state, request: payload => ({ tenant: "tenant", authData, payload }) };
}
test("original groupless runtime receives one existing wallet/balance through the established owner storage context without credential mutation", async t => {
  const f = fixture(t), before = structuredClone(f.authData);
  Object.freeze(f.authData.userGroups); Object.freeze(f.authData.groups); Object.freeze(f.authData);
  const result = await evidence.walletEvidence(f.request({ ...f.p, walletCode: "wallet" }));
  assert.equal(result.balance.available, "118.00"); assert.equal(result.wallet.ownerCode, "customer");
  assert.equal(result.wallet.metadata, undefined); assert.deepEqual(f.authData, before);
  f.rows.DefaultLoyaltyWalletRewardBalanceService = [];
  assert.equal((await evidence.walletEvidence(f.request({ ...f.p, walletCode: "wallet" }))).balance, null);
});
test("tenant-scoped generated reads project runtime tenant onto canonical rows without persisting it", async t => {
  const f = fixture(t);
  const schemas = require("../../loyaltyWallet/src/schemas/schemas").loyaltyWallet;
  const baseSchemas = require("../../../../nodics.foundation/modules/nDatabase/database/src/schemas/schemas").default;
  for (const schema of [schemas.loyaltyWallet, schemas.loyaltyWalletRewardBalance, baseSchemas.base, baseSchemas.super])
    assert.equal(schema.definition.tenant, undefined);
  for (const rows of Object.values(f.rows)) for (const row of rows) delete row.tenant;
  const before = structuredClone(f.rows), auth = structuredClone(f.authData);
  const wallet = await evidence.walletEvidence(f.request({ ...f.p, walletCode: "wallet" }));
  assert.equal(wallet.tenant, "tenant"); assert.equal(wallet.wallet.tenant, "tenant"); assert.equal(wallet.balance.tenant, "tenant");
  const ledger = await evidence.ledgerEvidence(f.request({ ...f.p, entryCode: "capture", sourceType: "PAYMENT", sourceCode: "order" }));
  assert.equal(ledger.wallet.tenant, "tenant"); assert.equal(ledger.entries[0].tenant, "tenant");
  assert.deepEqual(f.rows, before); assert.deepEqual(f.authData, auth);
});
test("optional walletCode resolves one existing exact CUSTOMER owner without opening or deriving a wallet", async t => {
  const f = fixture(t);
  for (const rows of Object.values(f.rows)) for (const row of rows) delete row.tenant;
  const before = structuredClone(f.rows), auth = structuredClone(f.authData);
  SERVICE.DefaultLoyaltyWalletOperationService = { open: () => assert.fail("No wallet opening"), projection: () => assert.fail("No wallet projection") };
  const result = await evidence.walletEvidence(f.request(f.p));
  assert.equal(result.wallet.code, "wallet"); assert.equal(result.wallet.tenant, "tenant");
  assert.equal(result.customerCode, "customer"); assert.equal(result.programCode, "program"); assert.equal(result.rewardTypeCode, "points");
  assert.deepEqual(f.reads[0].input.query, { ownerType: "CUSTOMER", ownerCode: "customer" });
  assert.deepEqual(f.reads[1].input.query, { walletCode: "wallet", programCode: "program", rewardTypeCode: "points" });
  assert.deepEqual(f.rows, before); assert.deepEqual(f.authData, auth);
  f.rows.DefaultLoyaltyWalletRewardBalanceService = [];
  const missing = await evidence.walletEvidence(f.request(f.p));
  assert.equal(missing.balance, null); assert.equal(missing.programCode, "program");
});
test("exact owner lookup rejects missing, ambiguous, foreign, inactive or closed wallets without creating records", async t => {
  for (const change of [f => { f.rows.DefaultLoyaltyWalletService = []; },
    f => { f.rows.DefaultLoyaltyWalletService.push({ ...f.rows.DefaultLoyaltyWalletService[0], code: "second" }); },
    f => { f.rows.DefaultLoyaltyWalletService[0].ownerCode = "foreign"; },
    f => { f.rows.DefaultLoyaltyWalletService[0].ownerType = "EMPLOYEE"; },
    f => { f.rows.DefaultLoyaltyWalletService[0].status = "CLOSED"; },
    f => { f.rows.DefaultLoyaltyWalletService[0].active = false; },
    f => { f.rows.DefaultLoyaltyWalletService[0].tenant = "foreign"; }]) {
    const f = fixture(t); change(f); const before = structuredClone(f.rows);
    await assert.rejects(evidence.walletEvidence(f.request(f.p)), /unavailable/);
    assert.deepEqual(f.rows, before);
  }
});
test("optional exact owner selection does not accept a general query or malformed explicit walletCode", async t => {
  const f = fixture(t);
  for (const payload of [{ ...f.p, walletCode: undefined }, { ...f.p, walletCode: null }, { ...f.p, walletCode: "" },
    { ...f.p, query: {} }, { ...f.p, ownerType: "CUSTOMER" }, { ...f.p, customerCode: ["customer"] },
    { customerCode: "customer", rewardTypeCode: "points" }, { customerCode: "customer", programCode: "program" }]) {
    await assert.rejects(evidence.walletEvidence(f.request(payload)), /unavailable/); assert.equal(f.reads.length, 0);
  }
  assert.equal((await evidence.walletEvidence(f.request({ ...f.p, walletCode: "wallet" }))).wallet.code, "wallet");
  await assert.rejects(evidence.walletEvidence(f.request({ ...f.p, walletCode: "missing" })), /unavailable/);
});
test("optional wallet owner selection cannot substitute for a missing original ledger wallet", async t => {
  for (const walletCode of [undefined, null, "", ["wallet"]]) {
    const f = fixture(t); f.rows.DefaultRewardLedgerEntryService[0].walletCode = walletCode;
    await assert.rejects(evidence.ledgerEvidence(f.request({ ...f.p, entryCode: "capture", sourceType: "PAYMENT", sourceCode: "order" })), /unavailable/);
    assert.equal(f.reads.some(read => read.name === "DefaultLoyaltyWalletService" && !Object.hasOwn(read.input.query, "code")), false);
  }
});
test("protected reads accept only the actual generated first-page normalization", async t => {
  const initializer = require("../../../../nodics.foundation/modules/nDatabase/database/src/service/procs/get/defaultModelsGetInitializerService");
  for (const drift of [null, { limit: 3 }, { skip: 1 }, { snapshot: true }, { projection: { code: 1 } }]) {
    const f = fixture(t);
    for (const name of Object.keys(f.rows)) {
      const get = SERVICE[name].get;
      SERVICE[name].get = async request => {
        const result = await get(request);
        initializer.buildOptions.call({ LOG: { debug() {} } }, request, {}, { nextSuccess() {}, error(_r, _s, error) { throw error; } });
        if (drift) Object.assign(request.searchOptions, drift);
        return result;
      };
    }
    if (drift) await assert.rejects(evidence.walletEvidence(f.request(f.p)), /unavailable/);
    else {
      assert.equal((await evidence.walletEvidence(f.request(f.p))).wallet.code, "wallet");
      assert.equal((await evidence.walletEvidence(f.request({ ...f.p, walletCode: "wallet" }))).wallet.code, "wallet");
      assert.equal((await evidence.ledgerEvidence(f.request({ ...f.p, entryCode: "capture", sourceType: "PAYMENT", sourceCode: "order" }))).entries[0].code, "capture");
      assert(f.reads.every(read => read.input.searchOptions.limit === 2 && read.input.searchOptions.skip === 0));
    }
  }
});
test("owner lookup retains original business grant and rejects selector/storage drift across awaits", async t => {
  for (const change of [(f, request) => { request.tenant = "foreign"; },
    (_f, _request, generated) => { generated.query.ownerCode = "foreign"; },
    (_f, _request, generated) => { generated.authData.tenant = "foreign"; },
    (f, request) => { request.payload.programCode = "foreign"; },
    (_f, _request, generated) => { generated.options.skipItemCache = false; },
    (_f, _request, generated) => { generated.searchOptions.pageSize = 100; },
    (_f, request) => { request.query = { ownerCode: "foreign" }; },
    (_f, request) => { request.tenantCode = "foreign"; },
    () => { SERVICE.DefaultLoggerService.hasPrivateCaptureProtection = () => false; },
    f => { f.authData.permissions = []; }, f => { f.policy.callers = []; }]) {
    const f = fixture(t), originalGet = CONFIG.get;
    f.policy = { runtimeRole: "LOYALTY", callers: [{ tenant: "tenant", principalEnterpriseCode: "enterprise", enterpriseCode: "business",
      serviceId: "runtime", ...f.authData.runtimeScope }] };
    global.CONFIG = { get: key => key === "loyalty" ? { api: { readEvidence: f.policy } } : key === "runtimeRole" ? { code: "LOYALTY" } : originalGet(key) };
    global.NODICS = { getSelectedEnvironmentName: () => "local" };
    const request = f.request({ ...f.p, enterpriseCode: "business" }), get = SERVICE.DefaultLoyaltyWalletService.get;
    SERVICE.DefaultLoyaltyWalletService.get = async generated => { const result = await get(generated); change(f, request, generated); return result; };
    await assert.rejects(evidence.walletEvidence(request), /unavailable/);
  }
});
test("generated read tenant drift refuses even when returned domain rows carry no tenant field", async t => {
  const f = fixture(t), get = SERVICE.DefaultLoyaltyWalletService.get;
  delete f.rows.DefaultLoyaltyWalletService[0].tenant;
  SERVICE.DefaultLoyaltyWalletService.get = async request => {
    const result = await get(request); request.tenant = "foreign"; return result;
  };
  await assert.rejects(evidence.walletEvidence(f.request({ ...f.p, walletCode: "wallet" })), /unavailable/);
});
test("canonical route and controller admit the original groupless principal without assigning token groups", async t => {
  const f = fixture(t);
  for (const route of [routes.walletEvidence, routes.ledgerEvidence]) {
    assert.equal(route.secured, true); assert.deepEqual(route.authTokenTypes, ["service"]);
    assert.equal(route.permission, "loyalty.wallet.read"); assert.equal(route.cache.enabled, false);
    assert.equal(route.requestPrivacy.sensitive, true);
    assert.equal(security.hasAccessGroup({ authData: f.authData, router: route }), true);
    assert.equal(security.hasAcceptedTokenType({ authData: f.authData, router: route }), true);
  }
  const result = await controller.walletEvidence({ tenant: "tenant", authData: f.authData,
    httpRequest: { body: { ...f.p, walletCode: "wallet" } } });
  assert.equal(result.data.balance.available, "118.00"); assert.deepEqual(f.authData.userGroups, []);
});
test("exact original Order capture and its exact source-scoped reversal retain native identities, with no ledger history enumeration", async t => {
  const f = fixture(t), source = { ...f.p, sourceType: "PAYMENT", sourceCode: "order" };
  assert.equal((await evidence.ledgerEvidence(f.request({ ...source, entryCode: "capture" }))).entries[0].code, "capture");
  assert.equal((await evidence.ledgerEvidence(f.request({ ...source, reversalOfEntryCode: "capture" }))).entries[0].code, "refund");
  f.rows.DefaultRewardLedgerEntryService.pop();
  assert.deepEqual((await evidence.ledgerEvidence(f.request({ ...source, reversalOfEntryCode: "capture" }))).entries, []);
});
test("wrong tenant, enterprise aliases, runtime instance, module, token and permission refuse before generated reads", async t => {
  const f = fixture(t);
  for (const change of [{ tenant: "foreign" }, { entCode: "foreign", enterpriseCode: "enterprise" }, { runtimeInstanceId: "other" },
    { modules: [] }, { tokenType: "access" }, { principalType: "customer" }, { permissions: [] }, { runtimeScope: {} }]) {
    await assert.rejects(evidence.walletEvidence({ ...f.request({ ...f.p, walletCode: "wallet" }), authData: { ...f.authData, ...change } }));
    assert.equal(f.reads.length, 0);
  }
  await assert.rejects(evidence.walletEvidence({ ...f.request({ ...f.p, walletCode: "wallet" }), enterpriseCode: "foreign" }));
  assert.equal(f.reads.length, 0);
});
test("query operators, body scope, provider overrides, array selectors and ambiguous selectors refuse before reads", async t => {
  const f = fixture(t), payload = { ...f.p, entryCode: "capture", sourceType: "PAYMENT", sourceCode: "order" };
  for (const extra of [{ query: {} }, { tenant: "foreign" }, { customerCode: { $ne: null } }, { sourceCode: ["order"] },
    { reversalOfEntryCode: "capture" }, { serviceName: "DefaultCustomerService" }]) {
    await assert.rejects(evidence.ledgerEvidence(f.request({ ...payload, ...extra })));
    assert.equal(f.reads.length, 0);
  }
});
test("foreign customer, program, reward type, Order source or suspended wallet never discloses entries", async t => {
  const f = fixture(t), payload = { ...f.p, entryCode: "capture", sourceType: "PAYMENT", sourceCode: "order" };
  for (const extra of [{ customerCode: "foreign" }, { programCode: "foreign" }, { rewardTypeCode: "foreign" }, { sourceCode: "foreign-order" }])
    await assert.rejects(evidence.ledgerEvidence(f.request({ ...payload, ...extra })), /unavailable/);
  f.rows.DefaultLoyaltyWalletService[0].status = "SUSPENDED";
  await assert.rejects(evidence.ledgerEvidence(f.request(payload)), /unavailable/);
});
test("duplicate, truncated and cross-tenant provider rows cannot qualify exact evidence", async t => {
  const f = fixture(t), payload = { ...f.p, walletCode: "wallet" };
  f.rows.DefaultLoyaltyWalletService.push(structuredClone(f.rows.DefaultLoyaltyWalletService[0]));
  await assert.rejects(evidence.walletEvidence(f.request(payload)), /unavailable/);
  f.rows.DefaultLoyaltyWalletService.pop(); f.state.truncate = true;
  await assert.rejects(evidence.walletEvidence(f.request(payload)), /unavailable/);
  f.state.truncate = false; f.state.foreign = true;
  await assert.rejects(evidence.walletEvidence(f.request(payload)), /unavailable/);
});
test("foreign-order reversal and competing same-original reversals refuse rather than hide contradictory movements", async t => {
  const f = fixture(t), payload = { ...f.p, reversalOfEntryCode: "capture", sourceType: "PAYMENT", sourceCode: "order" };
  f.rows.DefaultRewardLedgerEntryService[1].sourceCode = "foreign-order";
  await assert.rejects(evidence.ledgerEvidence(f.request(payload)), /unavailable/);
  f.rows.DefaultRewardLedgerEntryService[1].sourceCode = "order";
  f.rows.DefaultRewardLedgerEntryService.push({ ...f.rows.DefaultRewardLedgerEntryService[1], code: "second-refund", sourceCode: "foreign-order" });
  await assert.rejects(evidence.ledgerEvidence(f.request(payload)), /unavailable/);
});
test("mid-read signed identity drift and copied unadmitted owner contexts refuse", async t => {
  const f = fixture(t), original = SERVICE.DefaultLoyaltyWalletService.get;
  SERVICE.DefaultLoyaltyWalletService.get = async request => { const value = await original(request); f.authData.entCode = "foreign"; return value; };
  await assert.rejects(evidence.walletEvidence(f.request({ ...f.p, walletCode: "wallet" })), /unavailable/);
  assert.deepEqual(Object.keys(evidence).sort(), ["ledgerEvidence", "walletEvidence"]);
});
test("provider errors remain content-free and cannot expose private rows or credentials", async t => {
  const f = fixture(t);
  SERVICE.DefaultLoyaltyWalletService.get = async () => { throw new Error("private customer and Bearer secret"); };
  await assert.rejects(evidence.walletEvidence(f.request({ ...f.p, walletCode: "wallet" })), error => {
    assert.equal(error.code, "ERR_LOYALTY_EVIDENCE_UNAVAILABLE");
    assert.equal(/private|Bearer|secret/.test(error.message), false); return true;
  });
});
test("unqualified private entry refuses before any provider read; a copied payload capture flag does not qualify it", async t => {
  const f = fixture(t); SERVICE.DefaultLoggerService.hasPrivateCaptureProtection = () => false;
  await assert.rejects(evidence.walletEvidence({ ...f.request({ ...f.p, walletCode: "wallet" }), privateCaptureQualified: true }), /unavailable/);
  assert.equal(f.reads.length, 0);
});

test("business enterprise evidence requires one exact deployment grant, preserves principal enterprise and rejects header-only delegation", async t => {
  const f = fixture(t), grant = { tenant: "tenant", principalEnterpriseCode: "enterprise", enterpriseCode: "business", serviceId: "runtime", ...f.authData.runtimeScope };
  for (const rows of Object.values(f.rows)) for (const row of rows) delete row.tenant;
  const policy = { runtimeRole: "LOYALTY", callers: [grant] }, originalGet = CONFIG.get;
  global.CONFIG = { get: k => k === "loyalty" ? { api: { readEvidence: policy } } : k === "runtimeRole" ? { code: "LOYALTY" } : originalGet(k) };
  global.NODICS = { getSelectedEnvironmentName: () => "local" };
  const request = { ...f.request({ ...f.p, enterpriseCode: "business", walletCode: "wallet" }),
    enterpriseCode: "enterprise", entCode: "enterprise", httpRequest: { headers: { "x-enterprise-code": "enterprise" } } }, original = structuredClone(f.authData);
  assert.equal((await evidence.walletEvidence(request)).enterpriseCode, "business"); assert.deepEqual(f.authData, original);
  for (const aliases of [{ enterpriseCode: "business" }, { entCode: "business" }, { httpRequest: { headers: { "x-enterprise-code": "business" } } }])
    await assert.rejects(evidence.walletEvidence({ ...request, ...aliases }));
  policy.callers.push(structuredClone(grant)); await assert.rejects(evidence.walletEvidence(request)); policy.callers.pop();
  grant.instanceCode = "other"; await assert.rejects(evidence.walletEvidence(request)); grant.instanceCode = "instance";
  await assert.rejects(evidence.walletEvidence({ ...f.request({ ...f.p, walletCode: "wallet" }), httpRequest: { headers: { "x-enterprise-code": "business" } } }));
  const get = SERVICE.DefaultLoyaltyWalletService.get;
  SERVICE.DefaultLoyaltyWalletService.get = async r => { const value = await get(r); policy.callers = []; return value; };
  await assert.rejects(evidence.walletEvidence(request));
});

test("exact earning evidence confirms source-scoped absence without creating a wallet or posting rewards", async t => {
  const f = fixture(t), before = structuredClone(f.rows), auth = structuredClone(f.authData);
  const payload = { ...f.p, sourceType: "WASTE_ASSET_SALE", sourceCode: "transfer", earningIdempotencyKey: "transfer:sale-proceeds" };
  const result = await evidence.ledgerEvidence(f.request(payload));
  assert.deepEqual(result.entries, []);
  assert.deepEqual(result.ledgerSelection, { entryType: "EARN", sourceType: "WASTE_ASSET_SALE", sourceCode: "transfer",
    idempotencyKey: "transfer:sale-proceeds", programCode: "program", rewardTypeCode: "points" });
  assert.deepEqual(f.reads[1].input.query, { walletCode: "wallet", programCode: "program", rewardTypeCode: "points",
    entryType: "EARN", sourceType: "WASTE_ASSET_SALE", sourceCode: "transfer" });
  assert.deepEqual(f.rows, before); assert.deepEqual(f.authData, auth);
  f.state.omitCount = true;
  await assert.rejects(evidence.ledgerEvidence(f.request(payload)), /unavailable/);
});

test("source-scoped earning reads expose the original earning but reject another key and ambiguous source rows", async t => {
  const f = fixture(t), payload = { ...f.p, sourceType: "WASTE_ASSET_SALE", sourceCode: "transfer", earningIdempotencyKey: "transfer:sale-proceeds" };
  const row = { ...f.rows.DefaultRewardLedgerEntryService[0], code: "earning", entryType: "EARN", sourceType: "WASTE_ASSET_SALE",
    sourceCode: "transfer", idempotencyKey: payload.earningIdempotencyKey };
  f.rows.DefaultRewardLedgerEntryService.push(row);
  assert.equal((await evidence.ledgerEvidence(f.request(payload))).entries[0].code, "earning");
  row.idempotencyKey = "other-key";
  await assert.rejects(evidence.ledgerEvidence(f.request(payload)), /unavailable/);
  row.idempotencyKey = payload.earningIdempotencyKey;
  f.rows.DefaultRewardLedgerEntryService.push({ ...row, code: "another" });
  await assert.rejects(evidence.ledgerEvidence(f.request(payload)), /unavailable/);
});

test("earning absence never accepts failed, truncated, foreign or drifting evidence", async t => {
  for (const change of [result => { delete result.count; }, result => { result.count = 1; },
    result => { result.count = "0"; }, result => { result.acknowledged = false; }, result => { result.code = "ERR_GET"; },
    result => { result.success = false; }, result => { result.error = true; }]) {
    const f = fixture(t), get = SERVICE.DefaultRewardLedgerEntryService.get;
    SERVICE.DefaultRewardLedgerEntryService.get = async input => { const result = await get(input); change(result); return result; };
    await assert.rejects(evidence.ledgerEvidence(f.request({ ...f.p, sourceType: "WASTE_ASSET_SALE", sourceCode: "transfer",
      earningIdempotencyKey: "transfer:sale-proceeds" })), /unavailable/);
  }
  const f = fixture(t), payload = { ...f.p, sourceType: "WASTE_ASSET_SALE", sourceCode: "transfer", earningIdempotencyKey: "transfer:sale-proceeds" };
  for (const extra of [{ entryCode: "capture" }, { reversalOfEntryCode: "capture" }, { query: {} }, { sourceCode: { $ne: null } }]) {
    await assert.rejects(evidence.ledgerEvidence(f.request({ ...payload, ...extra })), /unavailable/);
    assert.equal(f.reads.length, 0);
  }
  const request = f.request(payload), get = SERVICE.DefaultRewardLedgerEntryService.get;
  SERVICE.DefaultRewardLedgerEntryService.get = async input => { const result = await get(input); request.payload.sourceCode = "foreign"; return result; };
  await assert.rejects(evidence.ledgerEvidence(request), /unavailable/);
});
