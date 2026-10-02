/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module inventory/test/inventoryImportAdmission @description Proves policy/runtime isolation and refusal of unapproved opening stock snapshot imports. @layer test @owner inventory */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const service = require("../src/service/defaultInventoryOperationService");
const hooks = require("../src/interceptors/interceptors");

test("Staged rejects every stock mutation hook while warehouse policy remains authorable", () => {
  global.CONFIG = {
    get: (key) => (key === "runtimeRole" ? { code: "COMMERCE_STAGED" } : {}),
  };
  for (const schemaName of [
    "inventoryBalance",
    "inventoryMovement",
    "inventoryReservation",
  ]) {
    assert.throws(
      () => service.validateImportTarget({ schemaName }),
      /forbidden on Staged/,
    );
    const entries = Object.values(hooks).filter((h) => h.item === schemaName);
    assert.deepEqual(entries.map((h) => h.trigger).sort(), [
      "preRemove",
      "preSave",
      "preUpdate",
    ]);
    for (const hook of entries)
      assert.throws(
        () => service[hook.handler.split(".")[1]]({}),
        /forbidden on Staged/,
      );
  }
  assert.equal(service.validateImportTarget({ schemaName: "warehouse" }), true);
});

test("Online rejects versioned snapshot stock import without rejecting existing owner writes", () => {
  global.CONFIG = { get: () => ({}) };
  assert.equal(service.requireOperationalRuntime(), true);
  assert.equal(
    service.validateImportTarget({
      schemaName: "inventoryBalance",
      lifecycle: "REFERENCE",
    }),
    true,
  );
  assert.throws(
    () =>
      service.validateImportTarget({
        schemaName: "inventoryBalance",
        lifecycle: "OPERATIONAL_VERSIONED",
      }),
    /governed Inventory operations/,
  );
});

test("flags cannot manufacture coupon issuance approval for operational snapshots", () => {
  const promotion = require("../../promotion/src/service/defaultPromotionOperationService");
  global.CONFIG = {
    get: (key) =>
      key === "promotion"
        ? {
            sellerAuthorization: { enabled: true, qualified: true },
            publication: { runtimeRole: "ONLINE", delivery: { enabled: true } },
          }
        : {},
  };
  assert.throws(
    () =>
      promotion.validateImportTarget({
        schemaName: "coupon",
        lifecycle: "OPERATIONAL_VERSIONED",
      }),
    /governed issuance/,
  );
});

test("Staged balance and movement owner writes reject before persistence", async () => {
  global.CONFIG = {
    get: (key) =>
      key === "inventory" ? { publication: { runtimeRole: "STAGED" } } : {},
  };
  let calls = 0;
  global.SERVICE = {
    DefaultInventoryBalanceService: {
      update: () => {
        calls++;
      },
    },
    DefaultInventoryMovementService: {
      save: () => {
        calls++;
      },
    },
  };
  await assert.rejects(service.saveBalance({}, {}), /forbidden on Staged/);
  await assert.rejects(service.saveMovement({}, {}), /forbidden on Staged/);
  assert.equal(calls, 0);
});
