/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module eWaste/test/eWasteDigitalSaleEvidence
 * @description Source-only private evidence regressions over real Waste generated-read/context owners and tenant-less domain schemas. No native or financial qualification.
 * @layer test @owner eWaste
 */
const test = require("node:test"), assert = require("node:assert/strict");
const evidence = require("../src/service/defaultEWasteDigitalSaleEvidenceService");
const sale = require("../src/service/defaultEWasteDigitalSaleService");
const wasteRoot = "../../../../../../nodics.waste/modules/wasteCore/";
const waste = require(wasteRoot + "src/service/defaultWasteAssetTransferOperationService");
const persistence = require(wasteRoot + "src/service/defaultWastePersistenceService");
const schemas = require(wasteRoot + "src/schemas/schemas").wasteCore;
const inspection = require(wasteRoot + "src/service/defaultWasteInstalledDataInspectionService");
const runtime = require("../../../../../../nodics.foundation/modules/nAuth/src/service/identity/defaultServiceTokenService");

function fixture(t, kind = "LISTING") {
  const previous = Object.fromEntries(["CONFIG", "SERVICE", "NODICS", "CLASSES"].map(key => [key, global[key]]));
  t.after(() => { for (const [key, value] of Object.entries(previous))
    if (value === undefined) delete global[key]; else global[key] = value; });
  const ref = code => ({ module: "profile", schema: "customer", code });
  const policies = {
    transfer: { code: "transfer", active: true, status: "ACTIVE", revision: 1,
      metadata: { digitalOwnership: { refund: "ORIGINAL_TRANSFER_REVERSAL_ONLY_BEFORE_ONWARD_TRANSFER" } } },
    reward: { code: "reward", active: true, status: "ACTIVE", revision: 1, walletCurrencyCode: "POINTS",
      metadata: { digitalOwnership: { programCode: "program", rewardTypeCode: "points" } } },
    carbon: { code: "carbon", active: true, status: "ACTIVE", revision: 1, settlementMode: "NONE" },
  };
  const command = { tenant: "t", enterpriseCode: "business", sellerRef: ref("seller"), buyerRef: ref("buyer"),
    policies, projectionCode: "projection", orderCode: "order", ownerId: "buyer-login", idempotencyKey: "original-unit" };
  const asset = { code: "asset", active: true, revision: 2, assetStatus: kind === "LISTING" ? "LISTED" : kind === "PURCHASE" ? "SOLD" : "OWNED",
    ownerRef: ref(kind === "PURCHASE" ? "buyer" : "seller"), digitalOwnerRef: ref(kind === "PURCHASE" ? "buyer" : "seller"),
    physicalOwnerRef: ref("seller"), custodyStatus: "CUSTOMER_HELD", metadata: kind === "LISTING" ? {} : { lastTransferCode: kind === "PURCHASE" ? "sale" : "reversal" },
    marketplaceProjectionRef: { code: "projection" } };
  const projection = { code: "projection", active: true, revision: 2, projectionStatus: "LISTED", assetCode: "asset",
    commerceProductRef: { code: "product" }, ownerRef: ref("seller") };
  const original = { code: "sale", active: true, revision: 2, assetCode: "asset", transferType: "SELL", transferStatus: "COMPLETED",
    fromOwnerRef: ref("seller"), toOwnerRef: ref("buyer"), rewardSettlementRefs: [], carbonSettlementRefs: [],
    metadata: { digitalSale: { command, completedAt: "2026-10-09T01:00:00.123Z", capture: {}, settlement: {} } } };
  const reversal = { code: "reversal", active: true, revision: 2, assetCode: "asset", transferType: "REVERSAL", transferStatus: "COMPLETED",
    triggerRef: { code: "sale" }, metadata: { digitalRefund: { command: { refundCode: "refund", orderCode: "order", ownerId: "buyer-login" } } } };
  const rows = { wasteAsset: [asset], wasteAssetMarketplaceProjection: [projection], wasteAssetOwnershipEvent: [original, reversal],
    wasteAssetTransferPolicy: [policies.transfer], wasteRewardSettlementPolicy: [policies.reward], wasteCarbonSettlementPolicy: [policies.carbon] };
  const auth = { tokenType: "service", principalType: "service", tenant: "t", entCode: "default", serviceId: "apiAdmin", isSystem: false,
    modules: ["eWaste"], permissions: ["waste.asset.sale.transfer"], userGroups: [], groups: [], runtimeInstanceId: "instance",
    runtimeScope: { projectCode: "project", environmentCode: "local", serverCode: "commerce", instanceCode: "instance", assignmentCode: "assignment" } };
  const settings = { enabled: true, qualified: true, allowedServicePrincipals: ["apiAdmin"], businessCallers: [{ tenant: "t",
    principalEnterpriseCode: "default", enterpriseCode: "business", serviceId: "apiAdmin", ...auth.runtimeScope, permissions: ["waste.asset.sale.transfer"] }] };
  const payload = { contractVersion: 1, kind, bindingCode: "binding", productCode: "product", sku: "SKU", storeCode: "store", locale: "en", assetCode: "asset",
    ...(kind !== "LISTING" ? { code: "sale", ownerId: "buyer-login", orderCode: "order", entryCode: "entry", checkoutIdempotencyKey: "checkout" } : {}),
    ...(kind === "REFUND" ? { refundCode: "refund" } : {}) };
  const request = { tenant: "t", entCode: "default", authData: auth, httpRequest: { headers: { "x-enterprise-code": "default" } } };
  const input = { tenant: "t", enterpriseCode: "business", authData: auth, privateRequest: request, payload };
  const calls = [], hooks = {};
  global.CONFIG = { get: key => key === "eWaste" ? { marketplace: { digitalOwnership: settings } } : undefined };
  global.NODICS = { getSelectedEnvironmentName: () => "local" };
  global.CLASSES = { NodicsError: class extends Error {} };
  const store = { ...persistence };
  global.SERVICE = { DefaultWastePersistenceService: store, DefaultWasteAssetTransferOperationService: waste,
    DefaultServiceTokenService: runtime, DefaultLoggerService: { hasPrivateCaptureProtection: () => true },
    DefaultSecuredRequestPipelineService: { getGrantedPermissions: r => r.authData.permissions, isPermissionGranted: (p, granted) => granted.includes(p) },
    DefaultEWasteDigitalSaleService: { ...sale,
      binding: async r => ({ asset: await waste.digitalRead(r, "wasteAsset", "asset"),
        projection: await waste.digitalRead(r, "wasteAssetMarketplaceProjection", "projection"), ref: { assetCode: "asset", sellerRef: ref("seller") },
        policies: Object.fromEntries(await Promise.all(Object.entries(policies).map(async ([name, policy]) => [name,
          await waste.digitalRead(r, name === "transfer" ? "wasteAssetTransferPolicy" : name === "reward" ? "wasteRewardSettlementPolicy" : "wasteCarbonSettlementPolicy", policy.code)]))) }),
      buyer: async (_r, code) => { await hooks.buyer?.(); return ref(code); },
      event: async r => waste.digitalRead(r, "wasteAssetOwnershipEvent", r.payload.code),
    } };
  for (const [schema, values] of Object.entries(rows)) {
    assert.equal(schemas[schema].definition.tenant, undefined, "Fixture follows actual tenant-less Waste schema");
    SERVICE["Default" + schema[0].toUpperCase() + schema.slice(1) + "Service"] = { get: async r => {
      calls.push({ schema, request: r });
      const response = { code: "SUC_GET", result: structuredClone(values.filter(row => row.code === r.query.code)) };
      await hooks.get?.(r, response, schema, calls.length);
      return response;
    } };
  }
  return { input, request, auth, settings, rows, calls, hooks, store, policies };
}

for (const kind of ["LISTING", "PURCHASE", "REFUND"]) test(kind + " projects verified partition without storing tenant or changing raw fingerprints", async t => {
  const f = fixture(t, kind), before = structuredClone(f.rows), auth = structuredClone(f.auth);
  const result = await evidence.read(f.input);
  assert.equal(result.tenant, "t"); assert.equal(result.enterpriseCode, "business");
  for (const record of [result.asset, result.projection, ...Object.values(result.policies), result.sale, result.reversal].filter(Boolean)) assert.equal(record.tenant, "t");
  assert.equal(result.pins.asset, inspection.checksum(f.rows.wasteAsset[0]));
  assert.equal(result.pins.projection, inspection.checksum(f.rows.wasteAssetMarketplaceProjection[0]));
  if (result.sale) assert.equal(result.pins.sale, inspection.checksum(f.rows.wasteAssetOwnershipEvent[0]));
  if (result.reversal) assert.equal(result.pins.reversal, inspection.checksum(f.rows.wasteAssetOwnershipEvent[1]));
  assert.deepEqual(f.rows, before); assert.deepEqual(f.auth, auth);
  for (const { request } of f.calls) {
    assert.equal(request.tenant, "t"); assert.equal(request.authData.tenant, "t");
    assert.deepEqual(request.searchOptions, { pageSize: 2, pageNumber: 1 });
    assert.deepEqual(request.options, { recursive: false, skipItemCache: true });
  }
});

test("effective pure helper overrides retain projections, fingerprints and private failure ownership", async t => {
  const f = fixture(t, "REFUND"), calls = { project: 0, checksum: 0 };
  const expected = await evidence.read(f.input), before = structuredClone(f.rows);
  const effective = { ...evidence,
    project: function (record, fields) { calls.project++; return evidence.project(record, fields); },
    checksum: function (record) { calls.checksum++; return evidence.checksum(record); } };
  assert.deepEqual(await effective.read(f.input), expected);
  assert(calls.project > 0); assert.equal(calls.checksum, 7);
  assert.deepEqual(f.rows, before);
  for (const name of ["owner", "fail", "dependency"]) assert.equal(Object.hasOwn(evidence, name), false);
  const detachedRead = evidence.read;
  assert.deepEqual(await detachedRead(f.input), expected);
});

test("generated first-page normalization is accepted but widened persistence reads refuse", async t => {
  const initializer = require("../../../../../../nodics.foundation/modules/nDatabase/database/src/service/procs/get/defaultModelsGetInitializerService");
  for (const drift of [null, { limit: 3 }, { skip: 1 }, { snapshot: true }, { projection: { code: 1 } }]) {
    const f = fixture(t, "REFUND"), before = structuredClone(f.rows);
    f.hooks.get = async request => {
      initializer.buildOptions.call({ LOG: { debug() {} } }, request, {}, { nextSuccess() {}, error(_r, _s, error) { throw error; } });
      if (drift) Object.assign(request.searchOptions, drift);
    };
    if (drift) await assert.rejects(evidence.read(f.input));
    else assert.equal((await evidence.read(f.input)).reversal.tenant, "t");
    assert.deepEqual(f.rows, before);
  }
});
test("explicit conflicting tenant refuses for every projected owner record", async t => {
  for (const schema of Object.keys(fixture(t, "REFUND").rows)) {
    const f = fixture(t, "REFUND"); f.rows[schema][0].tenant = "foreign";
    await assert.rejects(evidence.read(f.input));
  }
  const f = fixture(t, "REFUND"); f.rows.wasteAssetOwnershipEvent[1].tenant = "foreign";
  await assert.rejects(evidence.read(f.input));
});

test("matching stored tenant stays compatible; null or blank stored tenant is not absence", async t => {
  const f = fixture(t, "REFUND");
  for (const rows of Object.values(f.rows)) for (const row of rows) row.tenant = "t";
  const before = structuredClone(f.rows), result = await evidence.read(f.input);
  assert.equal(result.reversal.tenant, "t"); assert.deepEqual(f.rows, before);
  for (const tenant of [null, ""]) {
    const invalid = fixture(t); invalid.rows.wasteAsset[0].tenant = tenant;
    await assert.rejects(evidence.read(invalid.input));
  }
});

test("verified storage partition and generated response refuse drift, ambiguity and failed/truncated envelopes", async t => {
  for (const change of [
    r => { r.tenant = "foreign"; }, r => { r.authData.tenant = "foreign"; },
    r => { r.query.code = "foreign"; }, r => { r.searchOptions.pageSize = 100; },
    r => { r.options.skipItemCache = false; },
    (_r, response) => { response.result[0].tenant = "foreign"; },
    (_r, response) => { response.result.push(structuredClone(response.result[0])); },
    (_r, response) => { response.total = 2; }, (_r, response) => { response.success = false; },
    (_r, response) => { response.acknowledged = false; }, (_r, response) => { response.result[0].revision++; },
    (_r, response) => { response.result = [null]; }, (_r, response) => { response.result = []; },
  ]) {
    const f = fixture(t);
    f.hooks.get = (r, response, _schema, count) => { if (count === 6) change(r, response); };
    await assert.rejects(evidence.read(f.input));
  }
});

test("wrong generated persistence context refuses without projecting a tenant", async t => {
  for (const change of [r => { r.tenant = "foreign"; }, r => { r.authData.tenant = "foreign"; }]) {
    const f = fixture(t), inherited = f.store.context;
    f.store.context = r => { const stored = inherited.call(f.store, r); change(stored); return stored; };
    await assert.rejects(evidence.read(f.input));
  }
});

test("original request, delegated business policy and private capture remain unchanged across awaits", async t => {
  for (const change of [
    f => { f.request.tenant = "foreign"; }, f => { f.input.tenant = "foreign"; },
    f => { f.auth.permissions = []; }, f => { f.input.enterpriseCode = "foreign"; },
    f => { f.request.httpRequest.headers["x-enterprise-code"] = "business"; },
    f => { f.settings.businessCallers[0].enterpriseCode = "foreign"; },
    () => { SERVICE.DefaultLoggerService.hasPrivateCaptureProtection = () => false; },
  ]) {
    const f = fixture(t); f.hooks.buyer = () => change(f);
    await assert.rejects(evidence.read(f.input));
  }
});

test("unwrapped evidence failures expose only fixed per-call stages after runtime service cloning", async t => {
  const cloned = require("lodash/merge")({}, evidence);
  const sentinel = "private internal failure sentinel";
  for (const [gate, change, kind] of [
    ["EVIDENCE_SNAPSHOT", f => { const context = SERVICE.DefaultEWasteDigitalSaleService.context;
      SERVICE.DefaultEWasteDigitalSaleService.context = function(input) {
        const result = context.call(this, input); f.auth.uncloneable = () => {}; return result;
      }; }],
    ["EVIDENCE_AUTHORITY", () => { SERVICE.DefaultEWasteDigitalSaleService.recheckAuthority = () => { throw new Error(sentinel); }; }],
    ["EVIDENCE_PROJECTION", () => { SERVICE.DefaultEWasteDigitalSaleService.binding = async () => ({}); }],
    ["EVIDENCE_EVENT", () => { SERVICE.DefaultEWasteDigitalSaleService.event = async () => { throw new Error(sentinel); }; }, "PURCHASE"],
    ["EVIDENCE_GENERATED_CONTEXT", f => { const context = f.store.context; let count = 0;
      f.store.context = function(r) { if (++count === 6) throw new Error(sentinel); return context.call(this, r); }; }],
    ["EVIDENCE_GENERATED_RECORDS", f => { const records = f.store.records; let count = 0;
      f.store.records = function(r) { if (++count === 6) throw new Error(sentinel); return records.call(this, r); }; }],
  ]) {
    const f = fixture(t, kind); change(f);
    await assert.rejects(cloned.read(f.input), error => {
      assert.equal(error.message, "Exact original digital ownership evidence is unavailable: " + gate);
      assert.equal(error.message.includes(sentinel), false);
      assert.equal(error.cause, undefined);
      return true;
    });
  }
  const f = fixture(t);
  assert.equal((await cloned.read(f.input)).kind, "LISTING", "A previous failure cannot contaminate another read");
});
