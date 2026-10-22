/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
require("./helpers/runtimeEnums.js")();
/** @module wasteCore/test/wasteCertificateBundleComponent @description Tests staged certificate ownership using the actual transfer persistence primitives and isolated generated CAS repositories. @owner wasteCore @layer test */
const test = require("node:test"), assert = require("node:assert/strict");
const component = require("../src/service/defaultWasteCertificateBundleComponentService");
const operations = require("../src/service/defaultWasteAssetTransferOperationService");
const owner = code => ({ module: "profile", schema: "customer", code });
function fixture(t) {
  const before = { SERVICE: global.SERVICE, NODICS: global.NODICS, UTILS: global.UTILS };
  t.after(() => Object.assign(global, before));
  const rows = { wasteAsset: new Map(), wasteAssetOwnershipEvent: new Map() };
  let loseEvent = false, loseUpdate = false;
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
  global.SERVICE = { DefaultWasteAssetTransferOperationService: operations,
    DefaultWastePersistenceService: { repository: schema => repositories[schema], context: r => ({ tenant: r.tenant }), records: r => r.result },
    DefaultDatabaseModelHandlerService: { inspectIndexes: async () => ({ versioned: false, indexes: [{ unique: true, key: { code: 1 } }] }) },
    DefaultModelConcurrencyService: { getField: () => "revision" },
  };
  global.NODICS = { getModels: () => Object.fromEntries(Object.keys(rows).map(schema => [schema,
    { primaryKey: "code", compareAndSetItem: () => {}, rawSchema: {} }])) };
  global.UTILS = { createModelName: value => value };
  const original = { code: "certificate", active: true, revision: 0, assetStatus: "OWNED", ownerRef: owner("seller"), digitalOwnerRef: owner("seller"),
    originalOwnerRef: owner("contributor"), physicalOwnerRef: owner("custodian"), rewardSettlementRefs: [{ code: "original-reward" }], metadata: {} };
  rows.wasteAsset.set(original.code, structuredClone(original));
  const request = { tenant: "T", authData: { tenant: "T", tokenType: "service" }, validateAuthority: () => {} };
  const input = { component: { kind: "CERTIFICATE", reference: { module: "wasteCore", schema: "wasteAsset", code: original.code }, quantity: "1", expectedRevision: 0 },
    ownerRef: owner("seller"), recipientRef: owner("buyer"), purpose: "GIFT", bundleCode: "bundle", manifestRevision: 0, operationKey: "original:0" };
  return { rows, request, input, original, loseEvent: () => { loseEvent = true; }, loseUpdate: () => { loseUpdate = true; } };
}
test("certificate transfer retains hold until finalize and preserves all original beneficiaries", async t => {
  const f = fixture(t), { request: r, input } = f;
  assert.equal((await component.inspect(r, input)).available, true);
  await component.reserve(r, input);
  await component.transfer(r, input);
  assert.equal(f.rows.wasteAsset.get("certificate").assetStatus, "LOCKED");
  await assert.rejects(component.release(r, input), /cannot be released/);
  await component.finalize(r, input);
  const saved = f.rows.wasteAsset.get("certificate");
  assert.equal(saved.assetStatus, "GIFTED"); assert.deepEqual(saved.ownerRef, owner("buyer"));
  for (const key of ["originalOwnerRef", "physicalOwnerRef", "rewardSettlementRefs"]) assert.deepEqual(saved[key], f.original[key]);
  await component.finalize(r, input);
  assert.equal(f.rows.wasteAssetOwnershipEvent.size, 1);
});
test("lost reservation event and update acknowledgements reconcile original asset checkpoints", async t => {
  const f = fixture(t); f.loseEvent();
  await assert.rejects(component.reserve(f.request, f.input), /event unavailable/);
  assert.equal(f.rows.wasteAsset.get("certificate").assetStatus, "LOCKED");
  await component.reserve(f.request, f.input);
  f.loseUpdate();
  await component.release(f.request, f.input);
  assert.equal(f.rows.wasteAsset.get("certificate").assetStatus, "OWNED");
  await assert.rejects(component.transfer(f.request, f.input), /lock changed/);
});
test("competing transfer and release cannot both pass the original event revision", async t => {
  const f = fixture(t); await component.reserve(f.request, f.input);
  const results = await Promise.allSettled([component.transfer(f.request, f.input), component.release(f.request, f.input)]);
  assert.equal(results.filter(row => row.status === "fulfilled").length, 1);
});
