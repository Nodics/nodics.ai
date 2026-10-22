/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** Current journey assertions loaded by the eWaste ownership bridge suite. */
const test = require("node:test"), assert = require("node:assert/strict");
const fixture = require("./commonBundleFixture.cjs");
const root = "../../../../../../../nodics.commerce/modules/digitalCommerce/modules/digitalCore/src/service/";
const settlement = require(root + "defaultDigitalBundleSettlementService");
const ownership = require(root + "defaultDigitalCommerceOwnershipService");
const digital = require(root + "defaultDigitalCommerceCheckoutService");
const earnings = f => f.loyalty.rows.RewardLedgerEntry.filter(row => row.entryType === "EARN");

test("common bundle transfers actual Waste certificate to Enterprise and credits actual Loyalty after whole completion", async t => {
  const f = await fixture(t, { enterpriseSeller: true, enterpriseBuyer: true });
  const [unit] = await digital.reserveForCheckout(f.r, { entries: [{ ...f.entry, availability: {
    productType: "DIGITAL", inventoryStrategy: "DIGITAL_COMMERCE", digitalDeliveryType: "DIGITAL_OWNERSHIP" } }] });
  assert.equal(f.wasteRows.wasteAsset[0].assetStatus, "LOCKED"); await f.seedCapture(unit);
  const sales = await digital.confirmSale(f.r, { code: "order" }, [unit]);
  await digital.deliver(f.r, { code: "order" }, sales);
  await digital.deliver(f.r, { code: "order" }, sales);
  const asset = f.wasteRows.wasteAsset[0], event = f.wasteRows.wasteAssetOwnershipEvent[0];
  assert.deepEqual(asset.ownerRef, f.buyer); assert.deepEqual(asset.digitalOwnerRef, f.buyer);
  assert.equal(asset.assetStatus, "SOLD"); assert.equal(event.transferStatus, "COMPLETED");
  assert.equal(event.toOwnerRef.schema, "enterprise"); assert.equal(event.fromOwnerRef.schema, "enterprise");
  for (const key of ["physicalOwnerRef", "custodyStatus", "originalOwnerRef", "rewardSettlementRefs", "carbonSettlementRefs"])
    assert.deepEqual(asset[key], f.original[key]);
  assert.equal(f.rows.DigitalEntitlement.length, 1); assert.equal(f.rows.DigitalDelivery.length, 1);
  assert.equal(f.rows.DigitalDelivery[0].evidence.physicalCustodyTransferred, false);
  assert.equal(earnings(f).length, 1); assert.equal(f.wasteRows.wasteAssetOwnershipEvent.length, 1);
});

const mutations = {
  "capture status": f => f.rows.PaymentTransactionEntry[1].status = "AUTHORIZED",
  "capture tenant": f => f.rows.PaymentTransactionEntry[1].tenant = "foreign",
  "capture merchant": f => f.rows.PaymentTransactionEntry[1].enterpriseCode = "foreign",
  "capture owner": f => f.rows.PaymentTransactionEntry[1].ownerId = "other",
  "capture key": f => f.rows.PaymentTransactionEntry[1].idempotencyKey = "other",
  "capture amount": f => f.rows.PaymentTransactionEntry[1].totalAmount = "99",
  "capture mirror": f => f.rows.PaymentTransactionEntry[1].providerReference = "foreign",
  "capture duplicate": f => f.rows.PaymentTransactionEntry.push(structuredClone(f.rows.PaymentTransactionEntry[1])),
  "authorization missing": f => f.rows.PaymentTransactionEntry.shift(),
  "authorization key": f => f.rows.PaymentTransactionEntry[0].idempotencyKey = "foreign",
  "order key": f => f.rows.CommerceOrder[0].idempotencyKey = "foreign",
  "order amount": f => f.rows.CommerceOrder[0].totalAmount = "99",
  "order owner": f => f.rows.CommerceOrder[0].evidence.ownerRef.code = "foreign",
  "entry absent": f => f.rows.CommerceOrderEntry.length = 0,
  "entry quantity": f => f.rows.CommerceOrderEntry[0].quantity = "2",
  "entry reservation": f => f.rows.CommerceOrderEntry[0].evidence.digitalReservationCodes = ["foreign"],
  "ledger absent": f => f.loyalty.rows.RewardLedgerEntry.length = 0,
  "ledger source": f => f.loyalty.rows.RewardLedgerEntry[0].sourceCode = "foreign",
  "ledger target": f => f.loyalty.rows.RewardLedgerEntry[0].targetCode = "foreign",
  "ledger amount": f => f.loyalty.rows.RewardLedgerEntry[0].amount = "99",
  "ledger reservation": f => f.loyalty.rows.RewardLedgerEntry[0].reservationCode = "foreign",
  "ledger wallet": f => f.loyalty.rows.RewardLedgerEntry[0].walletCode = "foreign",
};
for (const [label, alter] of Object.entries(mutations)) test("common purchase rejects " + label + " before transfer or earning", async t => {
  const f = await fixture(t), unit = await f.reserve(); await f.seedCapture(unit); alter(f);
  await assert.rejects(settlement.confirm(f.r, unit));
  assert.deepEqual(f.wasteRows.wasteAsset[0].ownerRef, f.seller);
  assert.equal(f.wasteRows.wasteAsset[0].assetStatus, "LOCKED"); assert.equal(earnings(f).length, 0);
});

test("uncertain real certificate transfer keeps locks until whole recovery and never becomes an original-sale return", async t => {
  const f = await fixture(t), unit = await f.reserve(); await f.seedCapture(unit);
  f.failures.certificateAfter = true; await assert.rejects(settlement.confirm(f.r, unit), /uncertain/);
  assert.equal(f.wasteRows.wasteAsset[0].assetStatus, "LOCKED");
  assert.deepEqual(f.wasteRows.wasteAsset[0].ownerRef, f.buyer); assert.equal(earnings(f).length, 0);
  await assert.rejects(settlement.fenceCompensation(f.r, unit), /forward recovery/);
  const sold = await settlement.confirm(f.r, unit);
  assert.equal((await ownership.refund(f.r, [sold], "preview")).eligible, false);
  for (const phase of ["prepare", "settle", "complete"]) await assert.rejects(ownership.refund(f.r, [sold], phase), /final sales/);
  assert.deepEqual(f.wasteRows.wasteAsset[0].physicalOwnerRef, f.original.physicalOwnerRef);
});

test("lost generated Waste acknowledgement replays original ownership and earning exactly once", async t => {
  const f = await fixture(t), unit = await f.reserve(); await f.seedCapture(unit); f.failures.updateAfter = true;
  try { await settlement.confirm(f.r, unit); } catch (error) { assert.match(error.message, /acknowledgement|revision/); }
  assert.equal((await settlement.confirm(f.r, unit)).status, "SOLD");
  assert.equal(f.wasteRows.wasteAssetOwnershipEvent.length, 1); assert.equal(earnings(f).length, 1);
});

test("fresh component permission denial retains captured purchase for forward recovery", async t => {
  const f = await fixture(t), unit = await f.reserve(); await f.seedCapture(unit); f.denyComponents();
  await assert.rejects(settlement.confirm(f.r, unit), /authority/);
  assert.equal(f.wasteRows.wasteAsset[0].assetStatus, "LOCKED");
  assert.deepEqual(f.wasteRows.wasteAsset[0].ownerRef, f.seller); assert.equal(earnings(f).length, 0);
});

test("changed buyer, order, locale or Checkout key cannot resume common purchase", async t => {
  const f = await fixture(t), unit = await f.reserve();
  for (const patch of [{ ownerId: "other" }, { idempotencyKey: "replacement" }, { payload: { ...f.r.payload, orderCode: "other" } }])
    await assert.rejects(settlement.confirm({ ...f.r, ...patch }, unit));
  await assert.rejects(settlement.reserve({ ...f.r, locale: "ar" }, f.entry, f.available), /changed/);
  assert.deepEqual(f.wasteRows.wasteAsset[0].ownerRef, f.seller);
});

test("prepayment cancellation clears only the purchase claim and cannot unlock original certificate content", async t => {
  const f = await fixture(t), unit = await f.reserve(); await settlement.fenceCompensation(f.r, unit);
  await assert.rejects(settlement.release(f.r, unit), /compensation proof/);
  f.rows.CheckoutCheckpoint.push({ code: "checkout", tenant: "T", enterpriseCode: "market", ownerId: "buyer", active: true,
    idempotencyKey: "checkout", status: "COMPENSATION_REQUIRED", evidence: { completed: ["DIGITAL_RESERVED"], compensation: [] } });
  await settlement.release(f.r, unit);
  assert.equal(f.wasteRows.wasteAsset[0].assetStatus, "LOCKED"); assert.deepEqual(f.wasteRows.wasteAsset[0].ownerRef, f.seller);
  await assert.rejects(f.reserve(), /cancelled/);
});

test("canonical BUNDLE projects as ASSET with common Commerce fields and never reads physical descriptors", async t => {
  const previous = global.SERVICE; t.after(() => { global.SERVICE = previous; });
  const marketplace = require("../../src/service/defaultEWasteMarketplaceService");
  global.SERVICE = { DefaultWasteItemDescriptorService: { catalogue: () => assert.fail("Bundle does not need physical descriptors") } };
  const settings = { storeCode: "market", currency: "POINTS", jurisdiction: "AE", programCode: "selected", rewardTypeCode: "points" };
  const instance = { ...marketplace, settings: () => settings };
  const attrs = { kind: "BUNDLE", bundleRef: { module: "digitalCore", schema: "digitalBundleManifest", code: "bundle" },
    ownerRef: { module: "profile", schema: "enterprise", code: "seller" }, listingWindow: { startsAt: null, endsAt: null }, saleMode: "FIXED",
    privateEvidence: "must-not-leak" };
  const product = { productCode: "product", variantCodes: ["variant"], localizedAttributes: attrs, locale: "ar",
    price: { currency: "POINTS", unitAmount: "12.5" }, availability: { available: true } };
  const result = await instance.catalogueOffers({}, [product]);
  assert.equal(result.assets.length, 1); assert.equal(result.coupons.length, 0);
  assert.equal(result.assets[0].kind, "ASSET"); assert.equal(product.localizedAttributes.kind, "BUNDLE");
  const offer = await instance.marketplaceOffer({}, product);
  assert.equal(offer.kind, "ASSET"); assert.deepEqual(offer.bundleRef, attrs.bundleRef); assert.deepEqual(offer.ownerRef, attrs.ownerRef);
  assert.deepEqual(offer.commerce, { ...settings, locale: "ar", variantCode: "variant" });
  assert.deepEqual(offer.listingWindow, attrs.listingWindow); assert.equal(offer.available, true);
  assert.equal(JSON.stringify(offer).includes("must-not-leak"), false); assert.equal(offer.carbonUnits, undefined);
  const requirements = { type: "REWARDS" };
  const coupon = await instance.marketplaceOffer({}, { ...product, localizedAttributes: { kind: "COUPON" },
    availability: { available: true, acquisitionRequirements: requirements } });
  assert.deepEqual(coupon.acquisitionRequirements, requirements); assert.deepEqual(coupon.commerce, offer.commerce);
});
