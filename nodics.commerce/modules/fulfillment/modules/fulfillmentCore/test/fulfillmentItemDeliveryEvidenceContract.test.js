/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/**
 * @module fulfillmentCore/test/fulfillmentItemDeliveryEvidenceContract
 * @description Isolated refusal and consumer compatibility tests, not authenticated delivery or installed persistence qualification.
 * @layer test
 * @owner fulfillmentCore
 * @override Later-layer cases may narrow admission but must not turn synthetic selectors into delivery proof.
 */
const test = require("node:test"), assert = require("node:assert/strict");
const adapter = require("../src/service/defaultFulfillmentItemDeliveryEvidenceService");
const promotion = require("../../../../baseCommerce/modules/promotion/src/service/defaultPromotionItemBenefitService");
const invalid = "INVALID_ITEM_DELIVERY_CONTEXT", unavailable = "AUTHENTICATED_ALLOCATION_RECEIPT_NOT_IMPLEMENTED";
let previous, accesses;
test.beforeEach(() => {
  previous = Object.fromEntries(["CLASSES", "CONFIG", "SERVICE"].map(key => [key, Object.getOwnPropertyDescriptor(global, key)]));
  global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
  accesses = [];
  const forbidden = name => new Proxy({}, { get(_target, key) { accesses.push(name + "." + String(key)); throw Error("Unexpected side effect dependency"); } });
  global.CONFIG = forbidden("CONFIG");
  global.SERVICE = forbidden("SERVICE");
});
test.afterEach(() => {
  for (const [key, descriptor] of Object.entries(previous)) {
    if (descriptor) Object.defineProperty(global, key, descriptor);
    else delete global[key];
  }
});

/** Builds selectors only; none of these test values constitute delivery proof. */
function context() {
  return { tenant: "tenantA", enterpriseCode: "operator", issuerEnterpriseCode: "seller",
    ownerId: "buyer", couponCode: "coupon-1", productCode: "product", promotionCode: "promotion",
    promotionRevision: 0, storeCode: "outlet", targetCode: "target-1", merchantReceiptReference: "receipt:1",
    items: [{ sku: "sku-b", quantity: 2, unit: "EACH" }, { sku: "sku-a", quantity: 1, unit: "EACH" }] };
}
function refusal(reason) {
  return error => error.code === "ERR_FULFILLMENT_ITEM_DELIVERY_UNCONFIRMED" && error.message === reason;
}

test("loader-shaped service exports an inert evaluate contract and locally owned refusal status", async () => {
  assert.equal(typeof adapter.evaluate, "function");
  assert.deepEqual(adapter.contract(), { ownerModule: "fulfillmentCore", receiptOwner: "shipment", available: false, reason: unavailable });
  assert.ok(Object.isFrozen(adapter.contract()));
  assert.equal(require("../src/utils/statusDefinitions").ERR_FULFILLMENT_ITEM_DELIVERY_UNCONFIRMED.code, "409");
  const input = context(), original = structuredClone(input);
  await assert.rejects(adapter.evaluate(input), refusal(unavailable));
  assert.deepEqual(input, original);
  assert.deepEqual(accesses, [], "no configuration, generated-owner write/read, transport or credential access");
});

test("context is exact, detached, canonical and deeply frozen, but never evidence", () => {
  const input = context(), original = structuredClone(input), result = adapter.context(input);
  assert.deepEqual(input, original);
  assert.deepEqual(result.items.map(item => item.sku), ["sku-a", "sku-b"]);
  assert.notEqual(result.items, input.items);
  assert.ok(Object.isFrozen(result) && Object.isFrozen(result.items) && result.items.every(Object.isFrozen));
  input.items[0].quantity = 99;
  input.ownerId = "changed";
  assert.equal(result.items[1].quantity, 2);
  assert.equal(result.ownerId, "buyer");
  assert.equal(result.verified, undefined);
});

for (const field of ["tenant", "enterpriseCode", "issuerEnterpriseCode", "ownerId", "couponCode", "productCode",
  "promotionCode", "promotionRevision", "storeCode", "targetCode", "merchantReceiptReference", "items"]) {
  test("missing original " + field + " is refused without aliases/defaults", async () => {
    const input = context(); delete input[field];
    await assert.rejects(adapter.evaluate(input), refusal(invalid));
  });
}

test("malformed identities, references, revisions and non-context envelopes fail closed", async () => {
  const cases = [null, [], "receipt:1", { data: context() }, { result: context(), code: "SUC_GET" },
    { ...context(), tenant: " " }, { ...context(), ownerId: "buyer\n" }, { ...context(), tenant: "x".repeat(193) },
    { ...context(), issuerEnterpriseCode: { code: "seller", moduleName: "profile", schemaName: "enterprise" } },
    { ...context(), promotionRevision: -1 }, { ...context(), promotionRevision: "0" },
    { ...context(), promotionRevision: Number.MAX_SAFE_INTEGER + 1 },
    { ...context(), merchantReceiptReference: "receipt/1" }, { ...context(), merchantReceiptReference: "x".repeat(120) }];
  for (const input of cases) await assert.rejects(adapter.evaluate(input), refusal(invalid));
  assert.deepEqual(accesses, []);
});

test("exact item grammar rejects partial, duplicate, oversized, coerced and extra-field selectors", async () => {
  const item = context().items[0];
  const cases = [[], Array(2), Array.from({ length: 21 }, (_, index) => ({ ...item, sku: "sku-" + index })),
    [item, { ...item }], [{ ...item, quantity: "1" }], [{ ...item, quantity: 0 }], [{ ...item, quantity: 101 }],
    [{ ...item, quantity: 1.5 }], [{ ...item, quantity: NaN }], [{ ...item, unit: "KG" }],
    [{ ...item, sku: "x".repeat(129) }], [{ ...item, sku: "sku/1" }], [{ ...item, verified: true }],
    [{ sku: "sku", quantity: 1 }], [null]];
  for (const items of cases) await assert.rejects(adapter.evaluate({ ...context(), items }), refusal(invalid));
  const input = context(); input.items.extra = true;
  await assert.rejects(adapter.evaluate(input), refusal(invalid));
});

test("maximum valid selectors are admitted syntactically but cannot establish authority", async () => {
  const input = context();
  input.ownerId = "x".repeat(192); input.merchantReceiptReference = "r".repeat(119);
  input.promotionRevision = Number.MAX_SAFE_INTEGER;
  input.items = Array.from({ length: 20 }, (_, index) => ({ sku: String(index).padStart(128, "s"), quantity: 100, unit: "EACH" }));
  assert.equal(adapter.context(input).items.length, 20);
  await assert.rejects(adapter.evaluate(input), refusal(unavailable));
});

test("accessors, inherited fields, hidden evidence and symbols are rejected without invoking getters", async () => {
  let invoked = 0;
  const accessor = context(); Object.defineProperty(accessor, "ownerId", { enumerable: true, get() { invoked++; return "buyer"; } });
  const itemAccessor = context(); Object.defineProperty(itemAccessor.items[0], "sku", { enumerable: true, get() { invoked++; return "sku"; } });
  const arrayAccessor = context(); Object.defineProperty(arrayAccessor.items, "0", { enumerable: true, get() { invoked++; return {}; } });
  const inherited = Object.assign(Object.create({ verified: true }), context());
  const hidden = context(); Object.defineProperty(hidden, "proof", { value: { verified: true } });
  const symbol = context(); symbol[Symbol("proof")] = true;
  for (const input of [accessor, itemAccessor, arrayAccessor, inherited, hidden, symbol])
    await assert.rejects(adapter.evaluate(input), refusal(invalid));
  assert.equal(invoked, 0);
});

test("manual/staff proof, provider declarations, credentials, flags and receipt JSON never enter evaluation", async () => {
  for (const [key, value] of Object.entries({ tenantCode: "tenantA", buyerId: "buyer", verified: true, immutable: true,
    eligible: true, status: "DELIVERED", evidenceMode: "MANUAL_ATTESTATION", providerCode: "carrier-sandbox",
    liveQualified: true, webhookSignatureValidation: true, authData: { permissions: ["commerce.fulfillment.return"] },
    authorization: "isolated-test-not-a-credential", sourceHash: "a".repeat(64), deliveredAt: "2026-01-01T00:00:00Z",
    receipt: { status: "DELIVERED", items: context().items }, ports: { read: () => ({ verified: true }) } }))
    await assert.rejects(adapter.evaluate({ ...context(), [key]: value }), refusal(invalid));
  assert.deepEqual(accesses, []);
});

test("ordinary Shipment/tracking status, revocation and returns cannot turn default refusal into success", async () => {
  let reads = 0;
  for (const status of ["SHIPPED", "DELIVERED", "RETURNED", "REVOKED", "PENDING", "FAILED"]) {
    global.CONFIG = { get: () => ({ enabled: true, liveQualified: true, productionTrafficApproved: true }) };
    global.SERVICE = { DefaultShipmentService: { get: async () => { reads++; return { code: "SUC_GET", result: [{ status, verified: true }] }; } } };
    await assert.rejects(adapter.evaluate(context()), refusal(unavailable));
  }
  assert.equal(reads, 0, "legacy rows are not authenticated allocation receipts");
});

test("sequential replay, changed scope and concurrent attempts remain side-effect-free refusals", async () => {
  const input = context(), original = structuredClone(input);
  const pending = adapter.evaluate(input);
  input.items[0].quantity = 100; input.ownerId = "foreign";
  await assert.rejects(pending, refusal(unavailable));
  await assert.rejects(adapter.evaluate(original), refusal(unavailable));
  for (const field of ["tenant", "enterpriseCode", "issuerEnterpriseCode", "ownerId", "couponCode", "targetCode", "storeCode", "merchantReceiptReference"])
    await assert.rejects(adapter.evaluate({ ...original, [field]: "foreign" }), refusal(unavailable));
  const results = await Promise.allSettled(Array.from({ length: 16 }, () => adapter.evaluate(structuredClone(original))));
  assert.ok(results.every(result => result.status === "rejected" && refusal(unavailable)(result.reason)));
  assert.deepEqual(accesses, []);
});

test("later-layer narrowing is honored and overriding metadata/context cannot manufacture a base success", async () => {
  const narrow = { ...adapter, context(input) { const result = adapter.context.call(this, input);
    if (result.storeCode !== "allowed") throw this.error("OUTLET_NOT_SELECTED"); return result; } };
  await assert.rejects(narrow.evaluate(context()), refusal("OUTLET_NOT_SELECTED"));
  await assert.rejects(narrow.evaluate({ ...context(), storeCode: "allowed" }), refusal(unavailable));
  const forged = { ...adapter, contract: () => ({ available: true }), context: () => ({ eligible: true, verified: true, immutable: true }) };
  await assert.rejects(forged.evaluate(context()), refusal(unavailable));
});

test("existing Promotion selector invokes real Fulfillment refusal rather than accepting or consuming ITEM", async () => {
  const input = context();
  global.CONFIG = { get: key => key === "promotion" ? { merchantBenefits: {
    enabled: true, qualified: true, itemEvidenceService: "DefaultFulfillmentItemDeliveryEvidenceService" } } : {} };
  global.SERVICE = { DefaultFulfillmentItemDeliveryEvidenceService: adapter };
  const campaign = { revision: input.promotionRevision, conditions: { storeCodes: [input.storeCode] },
    actions: { benefitType: "ITEM", items: input.items } };
  const coupon = { code: input.couponCode, soldTo: input.ownerId, productCode: input.productCode,
    promotionCode: input.promotionCode, soldAt: "2020-01-01T00:00:00Z",
    issuerEnterpriseRef: { code: input.issuerEnterpriseCode, moduleName: "profile", schemaName: "enterprise" } };
  await assert.rejects(promotion.validate({ tenant: input.tenant, enterpriseCode: input.enterpriseCode,
    storeCode: input.storeCode, targetCode: input.targetCode, payload: { merchantReceiptReference: input.merchantReceiptReference } }, campaign, coupon), refusal(unavailable));
  const defaults = require("../config/properties").fulfillmentCore;
  assert.equal(defaults.carrierProvider.enabled, false);
  assert.equal(defaults.carrierProvider.liveQualified, false);
  assert.equal(defaults.physicalOperations.enabled, false);
});
