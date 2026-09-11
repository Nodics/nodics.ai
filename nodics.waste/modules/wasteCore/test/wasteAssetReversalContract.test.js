/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module wasteCore/test/wasteAssetReversalContract @description Verifies that ownership remains locked until financial owners complete, and that interrupted final event persistence recovers without duplicating or losing original sale history. @layer test @owner wasteCore */
const test = require("node:test"),
  assert = require("node:assert/strict"),
  service = require("../src/service/defaultWasteAssetReversalOperationService");
let asset, events, failEvent;
const event = {
  code: "sale",
  assetCode: "asset",
  transferType: "SELL",
  transferStatus: "COMPLETED",
  fromOwnerRef: { module: "profile", schema: "customer", code: "seller" },
  toOwnerRef: { module: "profile", schema: "customer", code: "buyer" },
  commerceOrderRef: { module: "order", schema: "commerceOrder", code: "ORDER" },
};
const r = { refundCode: "refund", orderCode: "ORDER", policyCode: "digital" };
test.beforeEach(() => {
  asset = {
    code: "asset",
    revision: 3,
    assetStatus: "SOLD",
    ownerRef: event.toOwnerRef,
    metadata: { lastTransferCode: "sale" },
  };
  events = new Map([["sale", structuredClone(event)]]);
  failEvent = false;
  global.SERVICE = {
    DefaultWastePersistenceService: {
      one: async (schema, r, code) =>
        structuredClone(schema === "wasteAsset" ? asset : events.get(code)),
      create: async (schema, r, model) => {
        assert(!events.has(model.code));
        events.set(model.code, structuredClone(model));
        return model;
      },
      update: async (schema, r, old, patch) => {
        if (schema === "wasteAsset") {
          assert.equal(old.revision, asset.revision);
          asset = { ...asset, ...patch, revision: asset.revision + 1 };
          return structuredClone(asset);
        }
        if (failEvent) {
          failEvent = false;
          throw Error("event write interrupted");
        }
        const next = {
          ...events.get(old.code),
          ...patch,
          revision: (old.revision || 0) + 1,
        };
        events.set(old.code, next);
        return structuredClone(next);
      },
    },
  };
});
test("asset stays with buyer under a lock until completion and interrupted final event writing is safely repeatable", async () => {
  await service.prepare(r, event);
  assert.equal(asset.assetStatus, "LOCKED");
  assert.equal(asset.ownerRef.code, "buyer");
  assert.equal(events.size, 2);
  await service.prepare(r, event);
  failEvent = true;
  await assert.rejects(service.complete(r, event), /interrupted/);
  assert.equal(asset.ownerRef.code, "seller");
  const revision = asset.revision;
  await service.complete(r, event);
  await service.complete(r, event);
  assert.equal(asset.revision, revision);
  assert.equal(events.get(service.code(event)).transferStatus, "COMPLETED");
  assert.deepEqual(events.get("sale"), event);
});
test("onward sale and another refund cannot change ownership", async () => {
  asset.metadata.lastTransferCode = "later-sale";
  await assert.rejects(service.prepare(r, event), /moved or is locked/);
  assert.equal(events.size, 1);
  asset.metadata.lastTransferCode = "sale";
  await service.prepare(r, event);
  await assert.rejects(
    service.prepare({ ...r, refundCode: "other" }, event),
    /another order refund/,
  );
  assert.equal(asset.ownerRef.code, "buyer");
});
