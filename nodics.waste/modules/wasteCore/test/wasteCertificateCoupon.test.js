/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
require("./helpers/runtimeEnums.js")();
/** @module wasteCore/test/wasteCertificateCoupon @description Tests coupon certificate holds against real Waste CAS primitives with isolated generated repositories. @owner wasteCore @layer test */
const test = require("node:test"), assert = require("node:assert/strict");
const service = require("../src/service/defaultWasteCertificateCouponService");
const component = require("../src/service/defaultWasteCertificateBundleComponentService");
const operations = require("../src/service/defaultWasteAssetTransferOperationService");
const properties = require("../config/properties");
const holdings = require("../src/service/defaultWasteCertificateHoldingsService");
const owner = code => ({ module: "profile", schema: "customer", code });
function fixture(t) {
  const before = Object.fromEntries(["SERVICE", "NODICS", "UTILS", "CONFIG"].map(k => [k, global[k]]));
  t.after(() => Object.assign(global, before));
  const rows = { wasteAsset: new Map(), wasteAssetOwnershipEvent: new Map() };
  let loseEvent = false, loseUpdate = false, sourceDenied = false, sourceConflict = false;
  const repositories = Object.fromEntries(Object.keys(rows).map(schema => [schema, {
    get: async r => ({ code: "SUC_GET", result: [...rows[schema].values()].filter(row => row.code === r.query.code).map(row => structuredClone(row)) }),
    save: async r => {
      assert.equal(r.options.insertOnly, true);
      if (rows[schema].has(r.model.code)) throw Error("Duplicate identity");
      if (loseEvent) { loseEvent = false; throw Error("event unavailable"); }
      rows[schema].set(r.model.code, structuredClone(r.model)); return { code: "SUC_SAVE" };
    },
    update: async r => {
      const row = rows[schema].get(r.query.code), matched = row?.revision === r.query.revision;
      if (matched) Object.assign(row, structuredClone(r.model), { revision: r.query.revision + 1 });
      if (loseUpdate) { loseUpdate = false; throw Error("acknowledgement lost"); }
      return { code: "SUC_UPDATE", result: { matchedCount: matched ? 1 : 0 } };
    },
  }]));
  const verification = { code: "verification", active: true, submissionCode: "submission", verificationStatus: "APPROVED",
    verifiedCategoryCode: "phone", verifiedFacts: { brandCode: "brand", modelCode: "model" } };
  global.CONFIG = { get: key => properties[key] };
  global.SERVICE = { DefaultWasteAssetTransferOperationService: operations, DefaultWasteCertificateBundleComponentService: component,
    DefaultWasteCertificateCouponService: service,
    DefaultWastePersistenceService: { repository: schema => repositories[schema], context: r => ({ tenant: r.tenant }), records: r => r.result,
      list: async (schema, r, query) => schema === "wasteVerification" && query.code === verification.code ? [verification] : [] },
    DefaultDatabaseModelHandlerService: { inspectIndexes: async () => ({ versioned: false, indexes: [{ unique: true, key: { code: 1 } }] }) },
    DefaultModelConcurrencyService: { getField: () => "revision" },
    DefaultModuleService: { invokeModule: async request => {
      assert.equal(request.apiName, "/internal/coupons/acquisition/source");
      assert.equal(request.maxAttempts, 1);
      const { phase, enterpriseCode, ...command } = request.requestBody;
      return { contractVersion: 1, tenant: request.tenant, enterpriseCode, phase, allowed: !sourceDenied,
        command: sourceConflict ? { ...command, orderCode: "other" } : command };
    } },
  };
  global.NODICS = { getModels: () => Object.fromEntries(Object.keys(rows).map(schema => [schema,
    { primaryKey: "code", compareAndSetItem: () => {}, rawSchema: {} }])) };
  global.UTILS = { createModelName: value => value };
  const original = { code: "certificate", active: true, revision: 0, assetStatus: "OWNED", ownerRef: owner("buyer"), digitalOwnerRef: owner("buyer"),
    originalOwnerRef: owner("contributor"), physicalOwnerRef: owner("custodian"), rewardSettlementRefs: [{ code: "reward" }],
    carbonSettlementRefs: [{ code: "carbon" }], custodyStatus: "RECYCLED", sourceSubmissionCode: "submission",
    verificationRef: { module: "wasteVerification", schema: "wasteVerification", code: "verification" }, metadata: {} };
  rows.wasteAsset.set(original.code, structuredClone(original));
  const request = { tenant: "T", enterpriseCode: "E", authData: { tenant: "T", tokenType: "service" }, validateAuthority: () => {} };
  const command = { contractVersion: 1, ownerRef: { type: "CUSTOMER", code: "buyer" }, ownerId: "buyer", orderCode: "order",
    entryCode: "entry", productCode: "product", promotionCode: "offer", operationKey: "purchase:entry", idempotencyKey: "purchase:entry",
    certificateCodes: ["certificate"], requirements: { type: "CERTIFICATES", certificates: { quantity: 1 } } };
  return { rows, request, command, original, verification, loseEvent: () => { loseEvent = true; }, loseUpdate: () => { loseUpdate = true; },
    deny: () => { sourceDenied = true; }, conflict: () => { sourceConflict = true; } };
}
test("coupon consumption is final and changes no rewards, carbon, contributor or physical custody", async t => {
  const f = fixture(t), call = phase => service.invoke(f.request, f.command, phase);
  assert.equal((await call("inspect")).certificates[0].brandCode, "brand");
  assert.equal((await call("reserve")).certificates[0].reservationCode, f.command.operationKey);
  const consumed = (await call("consume")).certificates[0];
  assert.equal(consumed.consumed, true); assert.equal(consumed.available, false);
  assert.equal(consumed.consumedOrderCode, "order");
  await call("consume");
  await assert.rejects(call("release"), /final/);
  const asset = f.rows.wasteAsset.get("certificate");
  for (const key of ["originalOwnerRef", "ownerRef", "digitalOwnerRef", "physicalOwnerRef", "custodyStatus", "rewardSettlementRefs", "carbonSettlementRefs"])
    assert.deepEqual(asset[key], f.original[key]);
  assert.equal((await component.inspect(f.request, { ownerRef: owner("buyer"), component: {
    kind: "CERTIFICATE", reference: { module: "wasteCore", schema: "wasteAsset", code: "certificate" }, quantity: "1", expectedRevision: asset.revision } })).available, false);
});
test("effective certificate phases preserve wire values and enum additions do not authorize transitions", async t => {
  const f = fixture(t), original = ENUMS.WasteCertificateOperation;
  let phaseReads = 0;
  global.ENUMS.WasteCertificateOperation = { ...original,
    INSPECT: { get value() { phaseReads++; return original.INSPECT.value; } },
    REFUND: { key: "REFUND", value: "refund" }
  };
  t.after(() => { global.ENUMS.WasteCertificateOperation = original; });
  assert.equal((await service.invoke(f.request, f.command, "inspect")).certificates[0].available, true);
  assert.ok(phaseReads > 0);
  await assert.rejects(service.invoke(f.request, f.command, "refund"), /Unsupported/);
  assert.deepEqual(f.rows.wasteAsset.get("certificate"), f.original);
  assert.equal(f.rows.wasteAssetOwnershipEvent.size, 0);
});
test("failed purchase releases only its original hold; repeated release is safe", async t => {
  const f = fixture(t); await service.invoke(f.request, f.command, "reserve");
  const result = await service.invoke(f.request, f.command, "release");
  assert.equal(result.certificates[0].available, true); assert.equal(result.certificates[0].reservationCode, undefined);
  await service.invoke(f.request, f.command, "release");
  await assert.rejects(service.invoke(f.request, f.command, "consume"), /final/);
});
test("lost event and mutation acknowledgement recover the original certificate reservation", async t => {
  const f = fixture(t); f.loseEvent();
  await assert.rejects(service.invoke(f.request, f.command, "reserve"), /event unavailable/);
  assert.equal(f.rows.wasteAsset.get("certificate").assetStatus, "REDEMPTION_PENDING");
  await service.invoke(f.request, f.command, "reserve"); f.loseUpdate();
  await service.invoke(f.request, f.command, "consume");
  assert.equal(f.rows.wasteAssetOwnershipEvent.size, 1);
});
test("source refusal and changed original order never mutate holdings", async t => {
  const f = fixture(t); f.deny();
  await assert.rejects(service.invoke(f.request, f.command, "reserve"), /unconfirmed/);
  assert.deepEqual(f.rows.wasteAsset.get("certificate"), f.original);
  f.conflict();
  await assert.rejects(service.invoke(f.request, f.command, "release"), /unconfirmed/);
});
test("failed purchase before reservation fences delayed acquisition", async t => {
  const f = fixture(t);
  await service.invoke(f.request, f.command, "release");
  await assert.rejects(service.invoke(f.request, f.command, "reserve"), /final/);
  assert.equal(f.rows.wasteAsset.get("certificate").assetStatus, "OWNED");
});
test("consume and failure cleanup cannot both win the original event revision", async t => {
  const f = fixture(t); await service.invoke(f.request, f.command, "reserve");
  const result = await Promise.allSettled([service.invoke(f.request, f.command, "consume"), service.invoke(f.request, f.command, "release")]);
  assert.equal(result.filter(row => row.status === "fulfilled").length, 1);
});
test("foreign owners, duplicate certificates and unavailable verification cannot authorize reservation", async t => {
  const f = fixture(t);
  await assert.rejects(service.invoke(f.request, { ...f.command, ownerId: "other", ownerRef: { type: "CUSTOMER", code: "other" } }, "inspect"), /unavailable/);
  await assert.rejects(service.invoke(f.request, { ...f.command, certificateCodes: ["certificate", "certificate"] }, "reserve"), /command/);
  f.verification.verificationStatus = "REJECTED";
  assert.equal((await service.invoke(f.request, f.command, "inspect")).certificates[0].valid, false);
  await assert.rejects(service.invoke(f.request, f.command, "reserve"), /cannot be reserved/);
});
test("fresh authority is required even when the original command is valid", async t => {
  const f = fixture(t);
  await assert.rejects(service.invoke({ ...f.request, validateAuthority: undefined }, f.command, "reserve"), /authority/);
  assert.equal(f.rows.wasteAssetOwnershipEvent.size, 0);
});
test("holdings selection keeps consumed certificates visible but unavailable and strips private evidence", async t => {
  const f = fixture(t);
  SERVICE.DefaultWastePersistenceService.page = async (schema, r, query, page, limit) => {
    assert.equal(query["ownerRef.code"], "buyer"); assert.equal(query["ownerRef.schema"], "customer");
    return { items: [...f.rows.wasteAsset.values()], total: 1, page, limit };
  };
  await service.invoke(f.request, f.command, "reserve"); await service.invoke(f.request, f.command, "consume");
  const result = await holdings.list(f.request, { ownerRef: owner("buyer"), page: 1, limit: 25 });
  assert.equal(result.items[0].available, false); assert.equal(result.items[0].assetStatus, "REDEEMED");
  assert.equal(result.items[0].metadata, undefined); assert.equal(result.items[0].originalOwnerRef, undefined);
});
test("holdings reads reject a repository result outside the exact typed owner", async t => {
  const f = fixture(t);
  SERVICE.DefaultWastePersistenceService.page = async () => ({ items: [f.original], total: 1, page: 1, limit: 25 });
  await assert.rejects(holdings.list(f.request, { ownerRef: owner("other"), page: 1, limit: 25 }), /owner scope/);
});
