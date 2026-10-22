/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const source = require("../src/service/defaultDigitalCommerceCouponAcquisitionService");
const entitlement = require("../src/service/defaultDigitalCommerceEntitlementService");
const defaults = require("../config/properties").digitalCore;
/** @module digitalCore/test/digitalCouponAcquisition @description Exercises actual coupon acquisition readers against isolated generated persistence and domain receipts; not installed-provider acceptance. @layer test @owner digitalCore */
function fixture(type = "REWARDS", enterprise = false) {
  const ownerRef = { type: enterprise ? "ENTERPRISE" : "CUSTOMER", code: enterprise ? "shop" : "customer" };
  const canonical = { module: "profile", schema: ownerRef.type.toLowerCase(), code: ownerRef.code };
  const ownerId = enterprise ? "shop" : "login";
  const r = { tenant: "t", enterpriseCode: "shop", ownerId, ownerRef, authorization: "Bearer original",
    authData: { tenant: "t", enterpriseCode: "shop", principalType: enterprise ? "human" : "customer", tokenType: "access", loginId: "actor" },
    idempotencyKey: "checkout:digital:entry:0", couponCode: "coupon", payload: { couponCode: "coupon", orderCode: "order",
      cartCode: "cart", entryCode: "entry", productCode: "product", sku: "sku", certificateCodes: type === "REWARDS" ? [] : ["certificate"] } };
  const settings = structuredClone(defaults), db = {}, owner = { ...source }, calls = [];
  const scope = { tenant: "t", enterpriseCode: "shop", ownerId, active: true };
  db.DefaultCartService = [{ ...scope, code: "cart", status: "PLACED", ownerRef: canonical, channelCode: "channel" }];
  db.DefaultCartEntryService = [{ ...scope, code: "entry", cartCode: "cart", status: "ACTIVE", ownerRef: canonical, productCode: "product", sku: "sku" }];
  db.DefaultCommerceOrderService = [{ ...scope, code: "order", cartCode: "cart", status: "PLACED", totalAmount: type === "CERTIFICATES" ? "0" : "10", currency: "PTS",
    evidence: { ownerRef: canonical, calculationCode: "calculation", storeCode: "store" } }];
  db.DefaultCartCalculationService = [{ ...scope, code: "calculation", cartCode: "cart", entries: [{ code: "entry", productCode: "product", sku: "sku",
    priceDecision: { tenant: "t", productCode: "product", currency: "PTS", storeCode: "store", priceRowCode: "price" } }] }];
  db.DefaultPaymentTransactionEntryService = type === "CERTIFICATES" ? [] : [{ ...scope, code: "capture", cartCode: "cart", orderCode: "order",
    status: "CAPTURED", currency: "PTS", totalAmount: "10", methodCode: "LOYALTY_REWARD", evidence: { operation: "CAPTURE" } }];
  db.DefaultCheckoutCheckpointService = [{ ...scope, code: "checkout", ownerId, idempotencyKey: "checkout", status: "COMPENSATION_REQUIRED",
    evidence: { completed: ["DIGITAL_RESERVED"], compensation: [] } }];
  const coupon = { ...scope, code: "coupon", offerAllocationCode: "allocation", status: "RESERVED", idempotencyKey: r.idempotencyKey,
    cartCode: "cart", orderCode: "order", sku: "sku" };
  const allocation = { code: "allocation", evidence: { status: "RESERVED", couponCode: "coupon", identity: { tenant: "t", ownerId, ownerRef,
    orderCode: "order", entryCode: "entry", productCode: "product", promotionCode: "offer", idempotencyKey: r.idempotencyKey,
    certificateCodes: r.payload.certificateCodes.slice() }, campaign: { couponOffer: { requirements: { type, ...(type !== "CERTIFICATES" ? { priceRef: "price" } : {}) } } } } };
  let consumed = false, reserved = false;
  global.CONFIG = { get: name => name === "digitalCore" ? settings : undefined };
  global.FACADE = { DefaultCartCustomerFacade: { resolveContext: async input => ({ ...input, ownerRef: canonical, ownerId }) } };
  global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
  global.SERVICE = { DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ isSystem: true }) },
    DefaultCouponOfferService: { validate: value => structuredClone(value) },
    DefaultPromotionOperationService: { readLifecycleCoupon: async () => structuredClone(coupon) },
    DefaultCouponAcquisitionPersistenceService: { read: async () => structuredClone(allocation) },
    DefaultCouponOfferAllocationService: { fenceInputs: async (_r, _coupon, direction) => {
      allocation.evidence.inputDisposition ||= direction; return allocation.evidence.inputDisposition;
    } },
    DefaultExactAmountService: { compare: (a, b) => Math.sign(Number(a) - Number(b)) },
    DefaultServiceTokenService: { requireRuntimePrincipal: input => input.authData },
    DefaultDigitalCommerceOwnershipService: { remote: async (input, phase, command) => {
      calls.push({ phase, command });
      if (phase === "coupon-reserve") reserved = true;
      if (phase === "coupon-consume") { if (!reserved) throw new Error("No original hold"); consumed = true; }
      if (phase === "coupon-release") { if (consumed) throw new Error("Already consumed"); reserved = false; }
      return { contractVersion: 1, tenant: input.tenant, enterpriseCode: input.enterpriseCode, ownerRef: command.ownerRef,
        operationKey: command.operationKey, orderCode: command.orderCode, certificates: command.certificateCodes.map(code => ({ code, ownerRef,
          valid: true, consumed, available: !consumed && !reserved, ...(reserved && !consumed ? { reservationCode: command.operationKey } : {}),
          ...(consumed ? { consumedBy: command.operationKey, consumedOrderCode: command.orderCode } : {}),
          categoryCode: "electronics", milestoneCodes: ["RECYCLED"] })) };
    } } };
  const install = name => { SERVICE[name] = { get: async input => {
    const selected = (db[name] || []).filter(row => Object.entries(input.query).every(([k, v]) => k.split(".").reduce((o, key) => o?.[key], row) === v))
      .sort((a, b) => a.code.localeCompare(b.code));
    const start = (input.searchOptions.pageNumber - 1) * input.searchOptions.pageSize;
    return { code: "SUC_READ", acknowledged: true, count: selected.length, result: structuredClone(selected.slice(start, start + input.searchOptions.pageSize)) };
  } }; };
  for (const name of [...Object.keys(db), "DefaultDigitalEntitlementService", "DefaultDigitalDeliveryService"]) install(name);
  return { r, owner, settings, db, coupon, allocation, calls, ownerRef, scope, install };
}
test("framework bounds are complete and later-layer narrowing is enforced", () => {
  const f = fixture(); assert.equal(f.owner.settings().maximumCertificates, 100);
  f.settings.couponAcquisition.maximumCertificates = 1;
  assert.throws(() => f.owner.certificates(["a", "b"]));
  delete f.settings.couponAcquisition.maximumSourcePages; assert.throws(() => f.owner.settings());
});
test("actual authorization derives customer and Enterprise owners from fresh participant and persisted Cart evidence", async () => {
  for (const enterprise of [false, true]) {
    const f = fixture("REWARDS", enterprise);
    assert.deepEqual(await f.owner.authorize(f.r), { tenant: "t", ownerRef: f.ownerRef, ownerId: f.r.ownerId, orderCode: "order" });
    f.r.ownerRef.code = "actor"; await assert.rejects(f.owner.authorize(f.r));
  }
});
test("foreign Cart, failed generated envelopes, stale actor and changed owner evidence never grant acquisition", async () => {
  let f = fixture(); f.db.DefaultCartService[0].ownerRef.code = "foreign"; await assert.rejects(f.owner.authorize(f.r));
  f = fixture(); SERVICE.DefaultCartService.get = async () => ({ code: "ERR_READ", count: 0, result: [] }); await assert.rejects(f.owner.authorize(f.r));
  f = fixture(); FACADE.DefaultCartCustomerFacade.resolveContext = async () => { throw new Error("DENY"); }; await assert.rejects(f.owner.authorize(f.r));
  f = fixture(); const get = SERVICE.DefaultCartService.get; SERVICE.DefaultCartService.get = async r => { const rows = await get(r); f.r.authData.loginId = "other"; return rows; };
  await assert.rejects(f.owner.authorize(f.r));
});
test("rewards completion uses actual persisted capture and immutable Pricing row, without requiring a usable coupon", async () => {
  const f = fixture(); const result = await f.owner.completion(f.r);
  assert.equal(result.rewardCaptureReference, "capture"); assert.equal(f.coupon.status, "RESERVED"); assert.deepEqual(result.certificateCodes, []);
  f.db.DefaultCartCalculationService[0].entries[0].priceDecision.priceRowCode = "other";
  await assert.rejects(f.owner.completion(f.r));
});
test("certificate-only consumption creates no payment and BOTH requires captured points before consumption", async () => {
  for (const type of ["CERTIFICATES", "BOTH"]) {
    const f = fixture(type);
    await assert.rejects(f.owner.completion(f.r));
    await f.owner.reserveInputs(f.r);
    if (type === "BOTH") {
      f.db.DefaultPaymentTransactionEntryService[0].status = "PENDING";
      await assert.rejects(f.owner.completeInputs(f.r)); assert.equal(f.calls.some(c => c.phase === "coupon-consume"), false);
      f.db.DefaultPaymentTransactionEntryService[0].status = "CAPTURED";
    }
    const result = await f.owner.completeInputs(f.r);
    assert.equal(result.status, "COMPLETED"); assert.deepEqual(result.certificateCodes, ["certificate"]);
    assert.equal("rewardCaptureReference" in result, type === "BOTH");
    await assert.rejects(f.owner.releaseInputs(f.r));
  }
});
test("certificate evidence cannot substitute a different selected code or consumed order", async () => {
  const f = fixture("CERTIFICATES"), remote = SERVICE.DefaultDigitalCommerceOwnershipService.remote;
  SERVICE.DefaultDigitalCommerceOwnershipService.remote = async (...args) => { const value = await remote(...args); value.certificates[0].code = "foreign"; return value; };
  await assert.rejects(f.owner.readCertificateEligibility({ ...f.r, promotionCode: "offer", certificateCodes: ["certificate"], requirements: {} }));
});
test("unconfirmed recovery keeps holds; original persisted no-payment failure can release an unconsumed hold", async () => {
  const f = fixture("CERTIFICATES"); await f.owner.reserveInputs(f.r);
  f.db.DefaultCheckoutCheckpointService[0].status = "PROCESSING";
  await assert.rejects(f.owner.releaseInputs(f.r)); assert.equal(f.calls.some(c => c.phase === "coupon-release"), false);
  f.db.DefaultCheckoutCheckpointService[0].status = "COMPENSATION_REQUIRED";
  assert.deepEqual(await f.owner.releaseInputs(f.r), { status: "FAILED", orderCode: "order", couponUsable: false, inputsReconciled: true });
  f.allocation.evidence.status = "COMPLETED"; await assert.rejects(f.owner.failed(f.r));
});
test("full generated history is paginated, owner typed, actual redeemer retained, and late writes invalidate a snapshot", async () => {
  const f = fixture("REWARDS", true), when = "2026-01-01T00:00:00.000Z";
  f.settings.couponAcquisition.sourcePageSize = 2;
  const policy = { version: 2, promotionCode: "offer", originalOwnerRef: f.ownerRef, issuerEnterpriseRef: { code: "issuer" } };
  f.db.DefaultDigitalEntitlementService = ["a", "b", "c"].map(code => ({ ...f.scope, code, cartCode: "cart", orderCode: "order", providerCode: code,
    digitalDeliveryType: "COUPON_CODE", providerOwner: "promotion", purchasedAt: when, purchasePolicy: policy }));
  f.db.DefaultCartService[0].active = false;
  f.db.DefaultCheckoutCheckpointService.push({ ...f.scope, code: "order", orderCode: "order", status: "COMPLETED", evidence: { orderCode: "order", digitalDeliveryCodes: ["a", "b", "c"] } });
  f.db.DefaultDigitalDeliveryService = ["a", "b", "c"].map(code => ({ ...f.scope, code: "delivery:" + code, entitlementCode: code,
    orderCode: "order", providerCode: code, status: "DELIVERED", deliveryType: "COUPON_CODE" }));
  const marker = { receiptCode: "receipt", code: "redemption", enterpriseRef: { code: "redeemer" }, storeRef: { code: "outlet" }, confirmedAt: when };
  Object.assign(f.db.DefaultDigitalEntitlementService[0], { claimStatus: "REDEEMED", evidence: { merchantRedemption: marker } });
  f.db.DefaultDigitalDeliveryService.push({ ...f.scope, code: "receipt", entitlementCode: "a", orderCode: "order", providerCode: "a",
    status: "DELIVERED", deliveryType: "MERCHANT_RECEIPT", deliveredAt: when,
    evidence: { ...marker, redemptionCode: marker.code, fulfillmentStatus: "COMPLETED" } });
  const r = { tenant: "t", channelCode: "channel", pageSize: 2, authData: { tenant: "t", principalType: "service",
    modules: ["digitalCore", "promotion"], permissions: ["commerce.promotion.analytics"] } };
  const first = await f.owner.reportingEvents(r); assert.equal(first.events.length, 2); assert.equal(first.complete, false);
  const last = await f.owner.reportingEvents({ ...r, snapshotId: first.snapshotId, cursor: first.nextCursor });
  const redemption = last.events.find(e => e.kind === "REDEMPTION");
  assert.equal(redemption.redeemerEnterpriseCode, "redeemer"); assert.deepEqual(redemption.ownerRef, f.ownerRef); assert.equal(redemption.historyKnown, true);
  assert.equal(last.complete, true); assert.equal(JSON.stringify(last).includes("actor"), false);
  f.db.DefaultDigitalEntitlementService[1].purchasedAt = "2025-01-01T00:00:00.000Z";
  await assert.rejects(f.owner.reportingEvents({ ...r, snapshotId: first.snapshotId, cursor: first.nextCursor }));
  await assert.rejects(f.owner.reportingEvents({ ...r, authData: { ...r.authData, principalType: "customer" } }));
});
test("explicit NONE retains validity, missing legacy expiry is not NONE, and v2 cannot refund", () => {
  fixture(); const rights = { ...entitlement };
  const item = { purchasedAt: "2026-01-01T00:00:00.000Z", purchasePolicy: { version: 2, purchasedAt: "2026-01-01T00:00:00.000Z",
    couponOffer: { expiry: { mode: "NONE" } }, finality: { refundable: false, transferable: false, singleUse: true } } };
  assert.deepEqual(rights.couponWindow(item), { mode: "NONE", expired: false });
  assert.equal(rights.revocationPolicy(item, "REFUND").policyDecision, "BLOCKED");
  assert.throws(() => rights.couponWindow({ purchasedAt: item.purchasedAt }));
  item.validTo = "2027-01-01T00:00:00.000Z"; assert.throws(() => rights.couponWindow(item));
});
