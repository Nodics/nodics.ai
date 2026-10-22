/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const acquisition = require("../src/service/defaultDigitalCommerceCouponAcquisitionService");
const checkout = require("../src/service/defaultDigitalCommerceCheckoutService");
const digital = require("../src/service/defaultDigitalCommerceEntitlementService");
const notifications = require("../src/service/defaultDigitalCommerceNotificationService");
/** @module digitalCore/test/digitalCouponCheckoutComposition @description Composes actual Digital checkout/acquisition/entitlement and Promotion allocation/private persistence with isolated generated records and domain transport. No installed provider or database is exercised. @owner digitalCore @layer test */
const { setup, realWaste } = require("./helpers/couponCheckoutFixture");

test("certificate-only unlimited coupon completes real reservation, source callback, consumption, sale, entitlement and delivery without Payment", async t => {
  const f = setup(t), result = await f.finish();
  assert.equal(result.deliveries[0].status, "DELIVERED"); assert.equal(f.db.DefaultPaymentTransactionEntryService.length, 0);
  assert.ok(result.reservations[0].offerAllocationCode); assert.equal(result.entitlement.purchasePolicy.version, 2);
  assert.deepEqual(f.state.phases.filter(p => p !== "coupon-inspect"), ["coupon-reserve", "coupon-consume"]);
  assert.equal((await notifications.evidence({ ...f.r, orderCode: "order" }, "PURCHASED")).items.length, 1);
  assert.equal(notifications.validityPresentation(result.entitlement), "No expiry");
  assert.deepEqual(digital.publicEntitlement(result.entitlement).purchaseTerms, ["Single use"]);
  const reveal = { ...f.r, entitlementCode: result.entitlement.code, couponCode: result.deliveries[0].code,
    payload: { entitlementCode: result.entitlement.code } }; f.privateRequests.add(reveal);
  assert.equal((await digital.authorizeCouponReveal(reveal, result.deliveries[0])).code, result.entitlement.code);
});
test("BOTH cannot consume or sell until original reward capture is present, then commits one lifetime allowance", async t => {
  const f = setup(t, "BOTH");
  const reservations = await checkout.reserveForCheckout(f.r, { entries: [f.entry] });
  f.db.DefaultPaymentTransactionEntryService[0].status = "PENDING";
  await assert.rejects(checkout.confirmSale(f.r, f.db.DefaultCommerceOrderService[0], reservations));
  assert.equal(f.state.consumed, false);
  f.db.DefaultPaymentTransactionEntryService[0].status = "CAPTURED";
  await checkout.confirmSale(f.r, f.db.DefaultCommerceOrderService[0], reservations);
  assert.equal(f.state.consumed, true);
  assert.equal([...f.tables.get('couponOwnerAllowance').values()][0].evidence.completed, 1);
});
test("Enterprise reveal resolves current staff scope without making that employee the owner; current deny prevents reveal", async t => {
  const f = setup(t, "CERTIFICATES", true), result = await f.finish();
  const r = { ...f.r, entitlementCode: result.entitlement.code, couponCode: result.deliveries[0].code,
    payload: { entitlementCode: result.entitlement.code } }; f.privateRequests.add(r);
  assert.equal((await digital.authorizeCouponReveal(r, result.deliveries[0])).ownerId, "issuer");
  f.state.denied = true; await assert.rejects(digital.authorizeCouponReveal(r, result.deliveries[0]));
});
test("distinct Enterprise buyer purchases issuer coupon then owner-bound lists and privately reveals in merchant partition", async t => {
  const f = setup(t, "CERTIFICATES", true, "buyer-enterprise"), secrets = new Map();
  const protect = SERVICE.DefaultSecretProtectionService.protect;
  SERVICE.DefaultSecretProtectionService.protect = async r => { const result = await protect(r); secrets.set(result.ciphertext, r.value); return result; };
  SERVICE.DefaultSecretProtectionService.unprotect = async r => secrets.get(r.envelope.ciphertext);
  const result = await f.finish();
  assert.equal(result.entitlement.enterpriseCode, "issuer");
  assert.equal(result.entitlement.participantEnterpriseCode, "buyer-enterprise");
  assert.deepEqual(result.entitlement.ownerRef, { type: "ENTERPRISE", code: "buyer-enterprise" });
  const input = { tenant: "t", enterpriseCode: "buyer-enterprise", authData: structuredClone(f.r.authData), authorization: f.r.authorization,
    payload: { entitlementCode: result.entitlement.code } };
  f.privateRequests.add(input);
  const listed = await digital.listOwn(await digital.listContext(input));
  assert.equal(listed.entitlements.length, 1); assert.equal(listed.entitlements[0].enterpriseCode, "issuer");
  assert.equal(JSON.stringify(listed).includes("protectedToken"), false);
  const revealed = await digital.reveal(input);
  assert.equal(revealed.status, "REVEALED"); assert.ok([...secrets.values()].includes(revealed.token));
  await assert.rejects(digital.reveal({ ...input, enterpriseCode: "issuer" }));
  f.state.denied = true; await assert.rejects(digital.listOwn(input)); await assert.rejects(digital.reveal(input));
  f.state.denied = false;
  f.db.DefaultDigitalEntitlementService[0].purchasePolicy.originalOwnerRef = { type: "ENTERPRISE", code: "other" };
  await assert.rejects(digital.listOwn(input)); await assert.rejects(digital.reveal(input));
});
test("distinct Enterprise BOTH consideration stays in buyer Payment namespace while coupon evidence remains merchant-scoped", async t => {
  const f = setup(t, "BOTH", true, "buyer-enterprise"), result = await f.finish();
  assert.equal(f.db.DefaultPaymentTransactionEntryService[0].enterpriseCode, "buyer-enterprise");
  const input = { tenant: "t", enterpriseCode: "buyer-enterprise", authData: f.r.authData, authorization: f.r.authorization,
    couponCode: result.deliveries[0].code, payload: { entitlementCode: result.entitlement.code } };
  f.privateRequests.add(input);
  assert.equal((await digital.authorizeCouponReveal(input, result.deliveries[0])).enterpriseCode, "issuer");
  f.db.DefaultPaymentTransactionEntryService[0].enterpriseCode = "issuer";
  await assert.rejects(digital.authorizeCouponReveal(input, result.deliveries[0]));
});
test("lost certificate hold acknowledgement retains the actual coupon reservation and releases only after persisted failure", async t => {
  const f = setup(t); f.state.failReserve = true;
  let failure; try { await checkout.reserveForCheckout(f.r, { entries: [f.entry] }); } catch (e) { failure = e; }
  assert.equal(failure.digitalReservations.length, 1); assert.equal(f.state.reserved, true);
  assert.equal((await checkout.releaseReservations(f.r, failure.digitalReservations))[0].status, "FAILED");
  f.db.DefaultCheckoutCheckpointService.push({ tenant: "t", enterpriseCode: f.r.enterpriseCode, code: "checkout", ownerId: f.r.ownerId, idempotencyKey: "checkout",
    status: "COMPENSATION_REQUIRED", evidence: { completed: [], compensation: [] } });
  assert.equal((await checkout.releaseReservations(f.r, failure.digitalReservations))[0].status, "COMPLETED");
  assert.equal(f.state.reserved, false); assert.equal([...f.tables.get('couponOwnerAllowance').values()][0].evidence.reserved, 0);
  const phases = f.state.phases.length;
  assert.equal((await checkout.releaseReservations(f.r, failure.digitalReservations))[0].status, "COMPLETED");
  assert.equal(f.state.phases.length, phases);
});
test("callback rejects substituted requirements, foreign runtime grants and unconfirmed consideration", async t => {
  const f = setup(t), rows = await checkout.reserveForCheckout(f.r, { entries: [f.entry] });
  const command = await acquisition.commandForCoupon(f.r, rows[0]);
  await SERVICE.DefaultCouponOfferAllocationService.fenceInputs(command, rows[0], "COMMIT");
  const body = { contractVersion: 1, phase: "consume", enterpriseCode: "issuer", ownerRef: f.ownerRef, ownerId: f.r.ownerId,
    orderCode: "order", entryCode: "entry", productCode: "product", promotionCode: "offer", operationKey: command.idempotencyKey,
    idempotencyKey: command.idempotencyKey, certificateCodes: ["certificate"], requirements: structuredClone(f.campaign.couponOffer.requirements) };
  assert.equal((await acquisition.sourceProof(f.sourceRequest, body)).allowed, true);
  await assert.rejects(acquisition.sourceProof(f.sourceRequest, { ...body, certificateCodes: ["another"] }));
  f.sourceRequest.authData.runtimeScope.assignmentCode = "foreign";
  await assert.rejects(acquisition.sourceProof(f.sourceRequest, body));
});
for (const type of ["CERTIFICATES", "BOTH"]) test(`${type} distinct Enterprise release uses retained purchaser evidence through the real Waste callback`, async t => {
  const f = setup(t, type, true, "buyer-enterprise"), waste = realWaste(f);
  f.r.actorRef = { principalType: "human", code: "actor", loginId: "actor", enterpriseCode: "buyer-enterprise" };
  const units = await checkout.reserveForCheckout(f.r, { entries: [f.entry] });
  const participant = { ownerRef: f.r.ownerRef, actorRef: f.r.actorRef, participantEnterpriseCode: "buyer-enterprise" };
  const intent = { tenant: "t", enterpriseCode: "issuer", ownerId: f.r.ownerId, ...participant,
    orderCode: "order", cartCode: "cart", operation: "REFUND", idempotencyKey: "checkout:payment:refund" };
  if (type === "BOTH") f.db.DefaultPaymentTransactionEntryService.push({
    tenant: "t", enterpriseCode: "buyer-enterprise", ownerId: f.r.ownerId, code: "refund", orderCode: "order",
    idempotencyKey: intent.idempotencyKey, status: "REFUND_SUCCEEDED", evidence: { operation: "REFUND", participant },
  });
  f.db.DefaultCheckoutCheckpointService.push({ tenant: "t", enterpriseCode: "issuer", ownerId: f.r.ownerId,
    code: "checkout", idempotencyKey: "checkout", status: "COMPENSATION_REQUIRED", evidence: {
      ...participant, completed: type === "BOTH" ? ["PAYMENT_CAPTURED"] : [],
      compensation: type === "BOTH" ? [{ type: "PAYMENT_REFUND", status: "COMPLETED",
        paymentTransactionCode: "refund", idempotencyKey: intent.idempotencyKey }] : [],
      ...(type === "BOTH" ? { paymentCompensationIntent: intent } : {}),
    } });
  assert.equal((await checkout.releaseReservations(f.r, units))[0].status, "COMPLETED");
  assert.equal(waste.rows.wasteAsset.get("certificate").assetStatus, "OWNED");
  assert.equal(waste.rows.wasteAsset.get("certificate").metadata.pendingTransferCode, null);
});


test("real Digital -> Waste coupon mutation -> Digital source callback composes with Promotion sale and no reward/carbon/custody mutation", async t => {
  const f = setup(t), waste = realWaste(f), result = await f.finish();
  const saved = waste.rows.wasteAsset.get("certificate");
  assert.equal(saved.assetStatus, "REDEEMED"); assert.equal(waste.rows.wasteAssetOwnershipEvent.size, 1);
  for (const key of ["ownerRef", "originalOwnerRef", "physicalOwnerRef", "custodyStatus", "rewardSettlementRefs", "carbonSettlementRefs"])
    assert.deepEqual(saved[key], waste.original[key]);
  assert.equal(result.entitlement.purchasePolicy.version, 2);
  assert.equal((await notifications.evidence({ ...f.r, orderCode: "order" }, "PURCHASED")).items.length, 1);
});
test("partial real Waste consumption durably fences reversal and retains the original coupon for forward completion", async t => {
  const f = setup(t, "BOTH"), waste = realWaste(f);
  f.campaign.couponOffer.requirements.certificates.quantity = 2;
  f.entry.availability.purchaseRequirements = structuredClone(f.campaign.couponOffer.requirements);
  f.r.payload.couponSelections.entry[0] = ["certificate", "certificate2"];
  waste.rows.wasteAsset.set("certificate2", { ...structuredClone(waste.original), code: "certificate2" });
  const reservations = await checkout.reserveForCheckout(f.r, { entries: [f.entry] });
  f.state.failConsumeCode = "certificate2";
  await assert.rejects(checkout.confirmSale(f.r, f.db.DefaultCommerceOrderService[0], reservations), /second certificate/);
  assert.equal(waste.rows.wasteAsset.get("certificate").assetStatus, "REDEEMED");
  assert.equal(waste.rows.wasteAsset.get("certificate2").assetStatus, "REDEMPTION_PENDING");
  assert.equal((await checkout.couponCompensationDisposition(f.r, reservations)).disposition, "FORWARD_REQUIRED");
  assert.equal(f.db.DefaultPaymentTransactionEntryService[0].status, "CAPTURED");
  assert.equal((await checkout.releaseReservations(f.r, reservations))[0].status, "FAILED");
  f.state.failConsumeCode = undefined;
  const order = f.db.DefaultCommerceOrderService[0]; order.idempotencyKey = f.r.idempotencyKey;
  order.evidence.digitalReservationCodes = reservations.map(unit => unit.code); order.evidence.reservationCodes = [];
  const retained = await checkout.resolveCouponForwardRecovery({ ...f.r, commandCode: f.r.idempotencyKey },
    { orderCode: "order", cartCode: "cart", couponCodes: order.evidence.digitalReservationCodes });
  const sales = await checkout.confirmSale(retained.scope, retained.order, retained.units);
  const deliveries = await checkout.deliver(retained.scope, retained.order, sales);
  assert.equal(deliveries.length, 1); assert.equal(waste.rows.wasteAssetOwnershipEvent.size, 2);
  assert.equal(waste.rows.wasteAsset.get("certificate2").assetStatus, "REDEEMED");
  assert.equal([...f.tables.get("couponOwnerAllowance").values()][0].evidence.completed, 1);
});
test("release selection is persisted before reversal and prevents a later consume attempt", async t => {
  const f = setup(t, "BOTH"), reservations = await checkout.reserveForCheckout(f.r, { entries: [f.entry] });
  assert.equal((await checkout.couponCompensationDisposition(f.r, reservations)).disposition, "RELEASE_ALLOWED");
  await assert.rejects(checkout.confirmSale(f.r, f.db.DefaultCommerceOrderService[0], reservations));
  assert.equal(f.state.consumed, false);
});
