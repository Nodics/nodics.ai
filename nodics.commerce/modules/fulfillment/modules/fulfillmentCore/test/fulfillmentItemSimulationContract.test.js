/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/**
 * @module fulfillmentCore/test/fulfillmentItemSimulationContract
 * @description Exercises the real LOCAL ITEM simulator in isolation, not authenticated delivery or installed deployment qualification.
 * @layer test
 * @owner fulfillmentCore
 * @override Extensions may narrow admission; simulated results never establish verified or immutable delivery truth.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const simulation = require("../src/service/defaultFulfillmentItemSimulationService");
const boundary = require("../src/service/defaultFulfillmentItemDeliveryEvidenceService");
let previous, configuration, deployment, forbidden;

test.beforeEach(() => {
  previous = Object.fromEntries(["CLASSES", "CONFIG", "SERVICE", "NODICS", "fetch"]
    .map(key => [key, Object.getOwnPropertyDescriptor(global, key)]));
  global.CLASSES = { NodicsError: class extends Error {
    constructor(code, message) { super(message); this.code = code; }
  } };
  configuration = {
    environment: { class: "LOCAL" },
    fulfillmentCore: { itemSimulation: { enabled: true, environmentAllowlist: ["isolatedLocal"] } },
    promotion: { merchantBenefits: { enabled: true, itemEvidenceMode: "LOCAL_SIMULATION",
      itemEvidenceService: "DefaultFulfillmentItemSimulationService" } }
  };
  deployment = { name: "isolatedLocal" };
  forbidden = [];
  global.CONFIG = { get: key => {
    assert(Object.hasOwn(configuration, key), "Only declared local simulation policy may be read");
    return configuration[key];
  } };
  global.NODICS = { getSelectedEnvironmentName: () => deployment.name };
  global.SERVICE = new Proxy({ DefaultFulfillmentItemDeliveryEvidenceService: boundary }, {
    get(target, key) {
      if (Object.hasOwn(target, key)) return target[key];
      forbidden.push(String(key));
      throw Error("Simulator must not access persistence, provider or transport services");
    }
  });
  global.fetch = () => { forbidden.push("fetch"); throw Error("No simulation transport"); };
});
test.afterEach(() => {
  const observed = forbidden.slice();
  for (const [key, descriptor] of Object.entries(previous)) {
    if (descriptor) Object.defineProperty(global, key, descriptor); else delete global[key];
  }
  assert.deepEqual(observed, [], "No persistence, receipt, stock, credential or transport dependency access");
});

function context() {
  return { tenant: "tenantA", enterpriseCode: "merchant", issuerEnterpriseCode: "issuer", ownerId: "buyer",
    couponCode: "coupon-1", productCode: "product", promotionCode: "campaign", promotionRevision: 0,
    storeCode: "outlet", targetCode: "target-1", merchantReceiptReference: "SIM:receipt-1", storeRevision: 7,
    items: [{ sku: "sku-b", quantity: 2, unit: "EACH" }, { sku: "sku-a", quantity: 1, unit: "EACH" }] };
}
function refused(error) {
  return error.code === "ERR_FULFILLMENT_ITEM_DELIVERY_UNCONFIRMED" &&
    ["ITEM_SIMULATION_NOT_ADMITTED", "INVALID_ITEM_DELIVERY_CONTEXT"].includes(error.message);
}

test("real provider emits only explicit unverified simulation with the exact canonical bundle", async () => {
  const input = context(), original = structuredClone(input), result = await simulation.evaluate(input);
  assert.deepEqual(input, original);
  assert.deepEqual(result, { ...structuredClone(simulation.context(input)), eligible: true, simulated: true,
    verified: false, immutable: false, status: "SIMULATED", sourceType: "ITEM_SIMULATION",
    sourceStage: "SIMULATED_ITEMS", sourceReference: input.merchantReceiptReference,
    sourceHash: result.sourceHash, sourceRevision: 0 });
  assert.match(result.sourceHash, /^[a-f0-9]{64}$/);
  for (const key of ["deliveredAt", "receivedAt", "shipmentCode", "receiptCode", "liveQualified"])
    assert.equal(Object.hasOwn(result, key), false, "Simulation cannot invent " + key);
  assert.equal(result.storeRevision, 7);
  assert.deepEqual(result.items.map(item => item.sku), ["sku-a", "sku-b"]);
});

test("canonical context is detached and deeply frozen, not an assertion of delivery", () => {
  const input = context(), result = simulation.context(input);
  assert(Object.isFrozen(result) && Object.isFrozen(result.items) && result.items.every(Object.isFrozen));
  input.ownerId = "changed"; input.storeRevision = 99; input.items[0].quantity = 99;
  assert.equal(result.ownerId, "buyer"); assert.equal(result.storeRevision, 7);
  assert.equal(result.items[1].quantity, 2);
  assert.equal(result.verified, undefined);
});

test("same context, reordered fields and reordered items have the same protocol-pinned SHA", async () => {
  const input = context(), reordered = Object.fromEntries(Object.entries(input).reverse());
  reordered.items = input.items.slice().reverse();
  const first = await simulation.evaluate(input), second = await simulation.evaluate(reordered);
  assert.deepEqual(second, first);
  assert.equal(first.sourceHash, crypto.createHash("sha256")
    .update(JSON.stringify({ protocol: "ITEM_SIMULATION_V1", context: simulation.context(input) })).digest("hex"));
});

test("every original scope, revision, reference and exact item quantity is bound into the simulation hash", async () => {
  const first = await simulation.evaluate(context());
  for (const field of ["tenant", "enterpriseCode", "issuerEnterpriseCode", "ownerId", "couponCode", "productCode",
    "promotionCode", "storeCode", "targetCode", "merchantReceiptReference", "promotionRevision", "storeRevision", "items"]) {
    const input = context();
    if (field === "items") input.items[0].quantity++;
    else if (typeof input[field] === "number") input[field]++;
    else input[field] += "-changed";
    assert.notEqual((await simulation.evaluate(input)).sourceHash, first.sourceHash, field);
  }
});

test("concurrent and sequential evaluations are deterministic independent projections, not delivery replay receipts", async () => {
  const input = context(), original = structuredClone(input), pending = simulation.evaluate(input);
  input.ownerId = "changed"; input.items[0].quantity = 100;
  const first = await pending;
  const results = await Promise.all(Array.from({ length: 24 }, () => simulation.evaluate(original)));
  for (const result of results) { assert.deepEqual(result, first); assert.notEqual(result, first); }
  first.items[0].quantity = 99; first.ownerId = "changed-result";
  assert.equal(results[0].items[0].quantity, 1);
  assert.equal(results[0].ownerId, "buyer");
  assert.deepEqual(await simulation.evaluate(original), results[0]);
});

for (const field of Object.keys(context())) {
  test("missing exact original selector refuses without aliases/defaults: " + field, async () => {
    const input = context(); delete input[field];
    await assert.rejects(simulation.evaluate(input), refused);
  });
}

test("aliases, envelopes, caller proof and extra fields cannot manufacture simulation authority", async () => {
  for (const input of [null, [], { result: context(), code: "SUC_GET" }, { data: context() },
    { ...context(), tenantCode: "tenantA" }, { ...context(), buyerId: "buyer" },
    { ...context(), verified: true }, { ...context(), immutable: true }, { ...context(), deliveredAt: "2026-01-01" },
    { ...context(), sourceHash: "a".repeat(64) }, { ...context(), authData: { admin: true } },
    { ...context(), tenant: " " }, { ...context(), issuerEnterpriseCode: { code: "issuer" } }])
    await assert.rejects(simulation.evaluate(input), refused);
});

test("accessors, inherited data, symbols and hidden context fields refuse without evaluating getters", async () => {
  let getters = 0;
  const accessor = context(); Object.defineProperty(accessor, "storeRevision", { enumerable: true, get() { getters++; return 7; } });
  const item = context(); Object.defineProperty(item.items[0], "sku", { enumerable: true, get() { getters++; return "sku"; } });
  const inherited = Object.assign(Object.create({ verified: true }), context());
  const symbol = context(); symbol[Symbol("proof")] = true;
  const hidden = context(); Object.defineProperty(hidden, "proof", { value: true });
  for (const input of [accessor, item, inherited, symbol, hidden]) await assert.rejects(simulation.evaluate(input), refused);
  assert.equal(getters, 0);
});

test("revision values are exact safe integers; positive observed outlet revision is mandatory", async () => {
  for (const value of [0, -1, "7", null, undefined, NaN, Infinity, 1.5, Number.MAX_SAFE_INTEGER + 1])
    await assert.rejects(simulation.evaluate({ ...context(), storeRevision: value }), refused);
  for (const value of [-1, "0", null, undefined, NaN, Infinity, 1.5, Number.MAX_SAFE_INTEGER + 1])
    await assert.rejects(simulation.evaluate({ ...context(), promotionRevision: value }), refused);
  const result = await simulation.evaluate({ ...context(), storeRevision: Number.MAX_SAFE_INTEGER,
    promotionRevision: Number.MAX_SAFE_INTEGER });
  assert.equal(result.storeRevision, Number.MAX_SAFE_INTEGER);
});

test("SIM handle grammar refuses real receipt handles, empty suffixes, whitespace and oversized references", async () => {
  for (const reference of ["receipt-1", "CART:receipt", "sim:receipt", "SIM:", "SIM:receipt/1", "SIM: receipt",
    "SIM:receipt\n", "SIM:" + "a".repeat(116), null, 1])
    await assert.rejects(simulation.evaluate({ ...context(), merchantReceiptReference: reference }), refused);
  for (const reference of ["SIM:a", "SIM:a_.:@-1", "SIM:" + "a".repeat(115)])
    assert.equal((await simulation.evaluate({ ...context(), merchantReceiptReference: reference })).sourceReference, reference);
});

test("exact bounded SKU promises are required even for simulation", async () => {
  const item = context().items[0];
  for (const items of [[], Array(2), [item, { ...item }], [{ ...item, quantity: "2" }], [{ ...item, quantity: 0 }],
    [{ ...item, quantity: 101 }], [{ ...item, unit: "KG" }], [{ ...item, verified: true }],
    Array.from({ length: 21 }, (_, index) => ({ ...item, sku: "sku-" + index }))])
    await assert.rejects(simulation.evaluate({ ...context(), items }), refused);
});

const policyCases = {
  "missing fulfillment selection": () => { configuration.fulfillmentCore = undefined; },
  "missing simulation policy": () => { delete configuration.fulfillmentCore.itemSimulation; },
  "disabled simulation": () => { configuration.fulfillmentCore.itemSimulation.enabled = false; },
  "coerced simulation enablement": () => { configuration.fulfillmentCore.itemSimulation.enabled = "true"; },
  "missing promotion selection": () => { configuration.promotion = undefined; },
  "missing merchant policy": () => { delete configuration.promotion.merchantBenefits; },
  "disabled merchant benefits": () => { configuration.promotion.merchantBenefits.enabled = false; },
  "missing simulation mode": () => { delete configuration.promotion.merchantBenefits.itemEvidenceMode; },
  "verified mode": () => { configuration.promotion.merchantBenefits.itemEvidenceMode = "VERIFIED"; },
  "wrong evidence owner": () => { configuration.promotion.merchantBenefits.itemEvidenceService = "DefaultFulfillmentItemDeliveryEvidenceService"; },
  "missing evidence owner": () => { delete configuration.promotion.merchantBenefits.itemEvidenceService; },
  "missing environment classification": () => { configuration.environment = undefined; },
  "unselected environment": () => { deployment.name = "otherLocal"; }
};
for (const [name, change] of Object.entries(policyCases)) {
  test("explicit admission refuses " + name, async () => {
    change(); await assert.rejects(simulation.evaluate(context()), refused);
  });
}

test("nonlocal or heuristic environment classifications never qualify simulation", async () => {
  for (const value of ["PRODUCTION", "STAGING", "QA", "LOCAL_SIMULATION", "local", true, null, undefined]) {
    configuration.environment = { class: value };
    await assert.rejects(simulation.evaluate(context()), refused);
  }
});

test("allowlist is explicit, bounded, exact and unique", async () => {
  for (const allowed of [undefined, null, [], "isolatedLocal", ["otherLocal"], ["isolatedLocal", "isolatedLocal"],
    ["isolatedLocal", " "], ["isolatedLocal", "x".repeat(129)], ["isolatedLocal", 1],
    Array.from({ length: 21 }, (_, i) => i ? "local" + i : "isolatedLocal")]) {
    configuration.fulfillmentCore.itemSimulation.environmentAllowlist = allowed;
    await assert.rejects(simulation.evaluate(context()), refused);
  }
});

test("canonical selected environment wins; legacy environment getter is used only when selection getter is absent", async () => {
  global.NODICS = { getSelectedEnvironmentName: () => "foreign", getEnvironmentName: () => "isolatedLocal" };
  await assert.rejects(simulation.evaluate(context()), refused);
  global.NODICS = { getEnvironmentName: () => "isolatedLocal" };
  assert.equal((await simulation.evaluate(context())).simulated, true);
  for (const nodics of [undefined, {}, { getSelectedEnvironmentName: () => undefined, getEnvironmentName: () => "isolatedLocal" }]) {
    global.NODICS = nodics; await assert.rejects(simulation.evaluate(context()), refused);
  }
});

test("missing canonical context boundary or helpers refuses without alternate adapters", async () => {
  for (const service of [undefined, {}, { record: boundary.record }, { context: boundary.context }]) {
    global.SERVICE = { DefaultFulfillmentItemDeliveryEvidenceService: service };
    await assert.rejects(simulation.evaluate(context()), refused);
  }
});

test("later-layer admission and context narrowing are honored through this", async () => {
  const narrowed = { ...simulation, assertSelected() {
    simulation.assertSelected.call(this);
    if (deployment.name !== "narrowLocal") this.fail();
    return true;
  } };
  await assert.rejects(narrowed.evaluate(context()), refused);
  deployment.name = "narrowLocal";
  configuration.fulfillmentCore.itemSimulation.environmentAllowlist = ["narrowLocal"];
  assert.equal((await narrowed.evaluate(context())).verified, false);
  const outlet = { ...simulation, context(input) {
    const result = simulation.context.call(this, input);
    if (result.storeCode !== "selectedOutlet") this.fail();
    return result;
  } };
  await assert.rejects(outlet.evaluate(context()), refused);
  assert.equal((await outlet.evaluate({ ...context(), storeCode: "selectedOutlet" })).immutable, false);
});

test("selection is rechecked after context customization and revoked policy cannot yield a result", async () => {
  const narrowed = { ...simulation, context(input) {
    const result = simulation.context.call(this, input);
    configuration.fulfillmentCore.itemSimulation.enabled = false;
    return result;
  } };
  await assert.rejects(narrowed.evaluate(context()), refused);
});

test("framework defaults remain inert; selecting a name alone does not admit simulation", async () => {
  configuration.fulfillmentCore = require("../config/properties").fulfillmentCore;
  assert.equal(configuration.fulfillmentCore.itemSimulation.enabled, false);
  assert.deepEqual(configuration.fulfillmentCore.itemSimulation.environmentAllowlist, []);
  await assert.rejects(simulation.evaluate(context()), refused);
  assert.equal(boundary.contract().available, false, "Simulation does not implement authenticated allocation receipts");
});
