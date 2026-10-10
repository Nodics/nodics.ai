/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module checkoutCore/test/checkoutDigitalDomainRoutingContract @description Tests narrow calculated digital-domain routing without physical inventory substitution or missing-owner success. @layer test @owner checkoutCore */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const service = require("../src/service/defaultCheckoutPlacementPortsService");
const asset = { code: "asset-entry", productCode: "asset-product", sku: "asset-sku", quantity: "1",
  availability: { productType: "DIGITAL", inventoryStrategy: "DIGITAL_COMMERCE", digitalDeliveryType: "DIGITAL_OWNERSHIP" } };
test("exact ownership and coupon entries never reserve physical stock", async t => {
  const previous = global.SERVICE; t.after(() => { global.SERVICE = previous; });
  global.SERVICE = {};
  const entries = [asset, { availability: { inventoryStrategy: "COUPON_CODE_POOL" } }];
  assert.deepEqual(await service.create().reserveInventory({}, { entries }), []);
});
test("ambiguous ownership strategy fails before physical effects", async t => {
  const previous = global.SERVICE; t.after(() => { global.SERVICE = previous; });
  let calls = 0;
  global.SERVICE = { DefaultInventoryReservationPolicyService: { prepare: () => { calls++; } } };
  for (const availability of [
    { inventoryStrategy: "DIGITAL_COMMERCE" }, { digitalDeliveryType: "DIGITAL_OWNERSHIP" },
    { ...asset.availability, productType: "PHYSICAL" },
    { ...asset.availability, inventoryStrategy: "WAREHOUSE" }, { productType: "DIGITAL" },
  ]) await assert.rejects(service.create().reserveInventory({}, { entries: [{ availability }] }), /Unsupported digital/);
  assert.equal(calls, 0);
});
test("missing Digital Core cannot turn digital checkout into an empty successful reservation", async t => {
  const previous = global.SERVICE; t.after(() => { global.SERVICE = previous; });
  global.SERVICE = {};
  const ports = service.create();
  await assert.rejects(ports.reserveDigitalUnits({}, { entries: [asset] }), /Digital reservation owner unavailable/);
  await assert.rejects(ports.reserveDigitalUnits({}, { entries: [{ availability: { inventoryStrategy: "COUPON_CODE_POOL" } }] }), /Digital reservation owner unavailable/);
  assert.deepEqual(await ports.reserveDigitalUnits({}, { entries: [{ availability: { inventoryStrategy: "WAREHOUSE" } }] }), []);
});
test("physical entries retain canonical Inventory reservation and mixed carts reserve only physical stock", async t => {
  const previous = global.SERVICE; t.after(() => { global.SERVICE = previous; });
  const calls = [];
  global.SERVICE = {
    DefaultInventoryReservationPolicyService: { prepare: (r, stock) => { calls.push({ r, stock }); return { ...stock, quantity: r.quantity }; } },
    DefaultInventoryReservationOperationService: { reserveAll: async (r, rows) => rows },
  };
  const request = { tenant: "t", enterpriseCode: "e", idempotencyKey: "placement", payload: { orderCode: "order" } };
  const physical = { code: "physical-entry", sku: "shirt", quantity: "2", availability: {
    inventoryStrategy: "WAREHOUSE", candidates: [{ warehouseCode: "warehouse", revision: 4 }] } };
  const result = await service.create().reserveInventory(request, { entries: [asset, physical] });
  assert.equal(calls.length, 1); assert.equal(result.length, 1);
  assert.equal(result[0].sku, "shirt"); assert.equal(result[0].quantity, "2");
  const custom = { ...service, digitalReservationEntry: () => { throw new Error("later owner"); } };
  await assert.rejects(custom.create().reserveInventory(request, { entries: [asset] }), /later owner/);
});

test("ownership reservation binds the persisted Cart locale instead of root or body selection", async t => {
  const previous = global.SERVICE; t.after(() => { global.SERVICE = previous; });
  const calls = [], cart = { code: "cart", storeCode: "store", locale: "ar" };
  global.SERVICE = { DefaultCartOperationService: { cartSnapshot: async () => cart },
    DefaultDigitalCommerceCheckoutService: { reserveForCheckout: async r => { calls.push(r); return []; } } };
  const request = { locale: "untrusted-root", payload: { cartCode: "cart", locale: "untrusted-body" } };
  await service.create().reserveDigitalUnits(request, { entries: [asset] });
  assert.equal(calls[0].locale, "ar"); assert.equal(request.locale, "untrusted-root");
  delete cart.locale;
  await assert.rejects(service.create().reserveDigitalUnits(request, { entries: [asset] }), /Persisted Cart locale/);
  assert.equal(calls.length, 1);
});
