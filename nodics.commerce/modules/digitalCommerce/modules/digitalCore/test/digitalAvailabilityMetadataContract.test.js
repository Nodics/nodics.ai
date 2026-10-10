/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module digitalCore/test/digitalAvailabilityMetadataContract @description Pins strict retained Digital metadata classification without saleMode inference, qualification or physical fallback. @layer test @owner digitalCore */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const checkout = require("../src/service/defaultDigitalCommerceCheckoutService");
const ownership = require("../src/service/defaultDigitalCommerceOwnershipService");

function fixture(t, attributes) {
  const previous = { SERVICE: global.SERVICE, CONFIG: global.CONFIG, ENUMS: global.ENUMS };
  t.after(() => Object.assign(global, previous));
  const request = { tenant: "default", enterpriseCode: "catalogue", storeCode: "marketplace", locale: "en",
    productCode: "asset", variantCode: "asset-variant", sku: "ASSET-SKU", quantity: "1" };
  const projection = { ...request, status: "CURRENT", payload: { variantCodes: ["asset-variant"],
    variantSkuMap: { "asset-variant": "ASSET-SKU" }, localizedAttributes: structuredClone(attributes) } };
  global.SERVICE = {
    DefaultDigitalCommerceOwnershipService: { availability: () => assert.fail("Malformed classification must not reach ownership") },
    DefaultPromotionOperationService: { couponPoolAvailability: () => assert.fail("Malformed classification must not reach Promotion") },
    DefaultInventorySourcingService: { source: () => assert.fail("Digital classification must not fall back to physical stock") },
  };
  global.CONFIG = { get: () => ({ maximumCouponUnitsPerCheckout: 100 }) };
  const Enum = require('../../../../../../nodics.foundation/modules/nConfig/bin/enum');
  global.ENUMS = { DigitalOwnershipAvailabilityReason: new Enum(require('../src/utils/enums').DigitalOwnershipAvailabilityReason.definition) };
  return { request, projection };
}

test("saleMode DIGITAL_OWNERSHIP without canonical delivery and inventory attributes remains malformed", async t => {
  const attrs = { productType: "DIGITAL", fulfillmentStrategy: "DIGITAL_COMMERCE", saleMode: "DIGITAL_OWNERSHIP", kind: "ASSET" };
  const f = fixture(t, attrs);
  for (const extra of [{}, { digitalDeliveryType: "DIGITAL_OWNERSHIP" }, { inventoryStrategy: "DIGITAL_COMMERCE" }]) {
    f.projection.payload.localizedAttributes = { ...attrs, ...extra };
    await assert.rejects(checkout.availabilityFromProjection(f.request, f.projection), { code: 'ERR_DIGITAL_AVAILABILITY_METADATA' });
  }
  assert.deepEqual(attrs, { productType: "DIGITAL", fulfillmentStrategy: "DIGITAL_COMMERCE", saleMode: "DIGITAL_OWNERSHIP", kind: "ASSET" });
});

test("unknown delivery types and inconsistent ownership/coupon metadata never become valid availability", async t => {
  const f = fixture(t, {});
  for (const attributes of [
    { productType: "DIGITAL", digitalDeliveryType: "LICENSE", inventoryStrategy: "DIGITAL_COMMERCE" },
    { productType: "DIGITAL", digitalDeliveryType: "DIGITAL_OWNERSHIP", inventoryStrategy: "COUPON_CODE_POOL" },
    { productType: "PHYSICAL", digitalDeliveryType: "DIGITAL_OWNERSHIP", inventoryStrategy: "DIGITAL_COMMERCE" },
    { productType: "DIGITAL", digitalDeliveryType: "COUPON_CODE", inventoryStrategy: "DIGITAL_COMMERCE" },
    { productType: "PHYSICAL", digitalDeliveryType: "COUPON_CODE", inventoryStrategy: "COUPON_CODE_POOL" },
    { productType: "DIGITAL", digitalDeliveryType: "", inventoryStrategy: "COUPON_CODE_POOL" },
  ]) {
    f.projection.payload.localizedAttributes = attributes;
    await assert.rejects(checkout.availabilityFromProjection(f.request, f.projection), { code: 'ERR_DIGITAL_AVAILABILITY_METADATA' });
  }
});

test("canonical ownership delegates exactly to its owner and preserves legitimate unavailable evidence", async t => {
  const f = fixture(t, { productType: "DIGITAL", digitalDeliveryType: "DIGITAL_OWNERSHIP", inventoryStrategy: "DIGITAL_COMMERCE" });
  const unavailable = { available: false, status: "UNAVAILABLE", guaranteed: false, digitalDeliveryType: "DIGITAL_OWNERSHIP" };
  let calls = 0;
  SERVICE.DefaultDigitalCommerceOwnershipService.availability = async (request, projection) => {
    calls++;
    assert.equal(request, f.request);
    assert.equal(projection, f.projection);
    return unavailable;
  };
  assert.equal(await checkout.availabilityFromProjection(f.request, f.projection), unavailable);
  assert.equal(calls, 1);
});

test("unselected ownership returns bounded unavailable evidence before binding or HTTP reads while settings and reserve stay strict", async t => {
  const f = fixture(t, { productType: "DIGITAL", digitalDeliveryType: "DIGITAL_OWNERSHIP", inventoryStrategy: "DIGITAL_COMMERCE" });
  SERVICE.DefaultDigitalCommerceOwnershipService = ownership;
  SERVICE.DefaultModuleService = { invokeModule: () => assert.fail("Unqualified ownership must not call HTTP") };
  SERVICE.DefaultDigitalCommerceEntitlementService = { readRecords: () => assert.fail("Unqualified ownership must not read bindings") };
  for (const policy of [{}, { enabled: false, qualified: false }, { enabled: true, qualified: false },
    { enabled: false, qualified: true }, { enabled: 'true', qualified: true }, { enabled: true, qualified: 'true' }]) {
    const original = structuredClone(policy);
    CONFIG.get = () => ({ digitalOwnership: policy });
    const before = structuredClone({ request: f.request, projection: f.projection });
    assert.deepEqual(await checkout.availabilityFromProjection(f.request, f.projection), {
      available: false, status: 'UNAVAILABLE', guaranteed: false, reservableAt: 'CHECKOUT_BEFORE_PAYMENT',
      productType: 'DIGITAL', inventoryStrategy: 'DIGITAL_COMMERCE', digitalDeliveryType: 'DIGITAL_OWNERSHIP',
      reasonCode: policy.enabled !== true ? 'DIGITAL_OWNERSHIP_NOT_SELECTED' : 'DIGITAL_OWNERSHIP_NOT_QUALIFIED',
    });
    assert.throws(() => ownership.settings(), /Digital ownership owner is not qualified/);
    await assert.rejects(ownership.remote(f.request, 'reserve', {}), /Digital ownership owner is not qualified/);
    SERVICE.DefaultDigitalCommerceCheckoutService = { availability: request => checkout.availabilityFromProjection(request, f.projection) };
    await assert.rejects(ownership.reserve({ ...f.request, ownerId: 'buyer', idempotencyKey: 'checkout', payload: { orderCode: 'order' } },
      { code: 'entry', productCode: f.request.productCode, sku: f.request.sku, quantity: 1 }), /Digital ownership owner is not qualified/);
    assert.deepEqual({ request: f.request, projection: f.projection }, before);
    assert.deepEqual(policy, original);
  }
});

test("selected ownership still validates owner configuration, binding and exact remote evidence", async t => {
  const f = fixture(t, { productType: 'DIGITAL', digitalDeliveryType: 'DIGITAL_OWNERSHIP', inventoryStrategy: 'DIGITAL_COMMERCE', assetCode: 'asset' });
  SERVICE.DefaultDigitalCommerceOwnershipService = ownership;
  const owner = { moduleName: 'domain', connectionName: 'domain', targetAuthority: 'DOMAIN', apiPrefix: '/internal/sales' };
  const policy = { enabled: true, qualified: true, owner };
  CONFIG.get = () => ({ digitalOwnership: policy });
  let reads = 0, calls = 0;
  const binding = { code: 'binding', active: true, revision: 1, tenant: f.request.tenant, enterpriseCode: f.request.enterpriseCode,
    productCode: f.request.productCode, variantCode: f.request.variantCode, sku: f.request.sku, status: 'ACTIVE',
    providerOwner: 'wasteCore', digitalDeliveryType: 'DIGITAL_OWNERSHIP', inventoryStrategy: 'DIGITAL_COMMERCE',
    providerReference: { storeCode: f.request.storeCode, assetCode: 'asset' }, evidence: { retainedProducts: [{
      locale: f.request.locale, code: 'projection', sourceHash: 'hash', publicationVersion: 'version' }] } };
  Object.assign(f.projection, { code: 'projection', sourceHash: 'hash', publicationVersion: 'version' });
  SERVICE.DefaultDigitalCommerceEntitlementService = { readRecords: async () => { reads++; return [structuredClone(binding)]; } };
  SERVICE.DefaultModuleService = { invokeModule: async () => { calls++; return { available: true, status: 'OWNER_CHECKED', assetCode: 'asset' }; } };
  for (const key of Object.keys(owner)) {
    const value = owner[key]; delete owner[key];
    await assert.rejects(checkout.availabilityFromProjection(f.request, f.projection), /not qualified/);
    owner[key] = value;
  }
  assert.equal(reads, 0); assert.equal(calls, 0);
  assert.equal((await checkout.availabilityFromProjection(f.request, f.projection)).available, true);
  binding.evidence.retainedProducts[0].sourceHash = 'corrupt';
  await assert.rejects(checkout.availabilityFromProjection(f.request, f.projection), /binding is unavailable/);
  assert.equal(calls, 1);
  binding.evidence.retainedProducts[0].sourceHash = 'hash';
  const fault = new Error('AUTH_OR_REMOTE_FAILURE');
  SERVICE.DefaultModuleService.invokeModule = async () => { throw fault; };
  await assert.rejects(checkout.availabilityFromProjection(f.request, f.projection), error => error === fault);
  for (const response of [{ code: 'ERR_OWNER' }, { available: false, status: 'OWNER_CHECKED', assetCode: 'foreign' },
    { available: true, status: 'UNCONFIRMED', assetCode: 'asset' }]) {
    SERVICE.DefaultModuleService.invokeModule = async () => response;
    await assert.rejects(checkout.availabilityFromProjection(f.request, f.projection));
  }
});

test("missing ownership implementation and genuine owner faults remain errors, not synthesized available summaries", async t => {
  const f = fixture(t, { productType: "DIGITAL", digitalDeliveryType: "DIGITAL_OWNERSHIP", inventoryStrategy: "DIGITAL_COMMERCE" });
  delete SERVICE.DefaultDigitalCommerceOwnershipService;
  await assert.rejects(checkout.availabilityFromProjection(f.request, f.projection), /Unsupported digital ownership availability/);
  const fault = new Error("OWNER_SCOPE_OR_READ_FAILURE");
  SERVICE.DefaultDigitalCommerceOwnershipService = { availability: async () => { throw fault; } };
  await assert.rejects(checkout.availabilityFromProjection(f.request, f.projection), error => error === fault);
});

test("foreign scope and wrong retained SKU still reject before any availability owner handoff", async t => {
  const f = fixture(t, { productType: "DIGITAL", saleMode: "DIGITAL_OWNERSHIP", kind: "ASSET" });
  for (const key of ["tenant", "enterpriseCode", "storeCode", "locale", "productCode"])
    await assert.rejects(checkout.availabilityFromProjection({ ...f.request, [key]: "foreign" }, f.projection), /Digital Product scope is unavailable/);
  await assert.rejects(checkout.availabilityFromProjection({ ...f.request, sku: "FOREIGN" }, f.projection), /Digital Product SKU is unavailable/);
});
