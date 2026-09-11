/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module wasteCore/test/wasteAssetTransferRecovery @description Covers optimistic ownership guards and recovery after an event persistence outage. @layer test @owner wasteCore */
const test = require("node:test"),
  assert = require("node:assert/strict"),
  operation = require("../src/service/defaultWasteAssetTransferOperationService");
test.afterEach(() => delete global.SERVICE);
test("a locked gift recovers its event and rejects altered payloads", async () => {
  const from = { module: "profile", schema: "customer", code: "from" },
    to = { ...from, code: "to" };
  let asset = {
      code: "asset",
      ownerRef: from,
      assetStatus: "OWNED",
      revision: 1,
      metadata: { illustrativeCarbonUnits: 2 },
    },
    event,
    fail = true;
  const store = {
    one: async (schema) =>
      schema === "wasteAsset" ? structuredClone(asset) : event,
    fail: (code, message) => {
      throw Object.assign(new Error(message), { code });
    },
    owned: (a, o) => {
      if (a.ownerRef.code !== o.code) throw new Error("not found");
      return a;
    },
    revision: (a, revision) => {
      if (a.revision !== revision) throw new Error("revision conflict");
    },
    update: async (schema, req, old, patch) => {
      if (schema === "wasteAsset") {
        assert.equal(old.revision, asset.revision);
        asset = { ...asset, ...patch, revision: asset.revision + 1 };
        return structuredClone(asset);
      }
      event = { ...event, ...patch };
      return event;
    },
    create: async (schema, req, model) => {
      if (fail) {
        fail = false;
        throw new Error("event store unavailable");
      }
      event = structuredClone(model);
      return event;
    },
  };
  global.SERVICE = { DefaultWastePersistenceService: store };
  const request = {
    assetCode: "asset",
    actorRef: from,
    toOwnerRef: to,
    transferType: "GIFT",
    idempotencyKey: "gift-1",
    expectedRevision: 1,
  };
  await assert.rejects(
    operation.begin({ ...request, actorRef: to }),
    /not found/,
  );
  await assert.rejects(operation.begin(request), /event store unavailable/);
  assert.equal(asset.assetStatus, "GIFT_PENDING");
  const resumed = await operation.begin(request);
  assert.equal(resumed.event.toOwnerRef.code, "to");
  await assert.rejects(
    operation.begin({ ...request, toOwnerRef: { ...to, code: "other" } }),
    /different details/,
  );
  await operation.complete({ eventCode: event.code });
  await operation.complete({ eventCode: event.code });
  assert.equal(asset.ownerRef.code, "to");
  assert.equal(event.transferStatus, "COMPLETED");
});
