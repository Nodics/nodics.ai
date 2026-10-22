/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module eWaste/test/eWasteListingPublication @description New eWaste listing delegation through real persisted Digital publication; remote Product/Pricing owners use isolated receipts. @owner eWaste @layer test */
const test = require("node:test"), assert = require("node:assert/strict");
const listing = require("../src/service/defaultEWasteListingService");
const root = "../../../../../../";
const setup = require(root + "nodics.commerce/modules/digitalCommerce/modules/digitalCore/test/bundlePublicationFixture.cjs");
const bundles = require(root + "nodics.commerce/modules/digitalCommerce/modules/digitalCore/src/service/defaultDigitalBundleService");
const publisher = require(root + "nodics.commerce/modules/digitalCommerce/modules/digitalCore/src/service/defaultDigitalCommerceAuctionService");
const persistence = require(root + "nodics.waste/modules/wasteCore/src/service/defaultWastePersistenceService");

function fixture(t) {
  const f = setup(t), calls = [];
  const ownerRef = { module: "profile", schema: "customer", code: "seller" };
  const asset = { code: "asset", revision: 1, ownerRef, digitalOwnerRef: ownerRef, active: true, assetStatus: "OWNED",
    physicalOwnerRef: { module: "profile", schema: "enterprise", code: "custodian" },
    metadata: { facts: { name: "Private source description" }, photo: { url: "private-photo-sentinel" }, preservedEvidence: "kept" } };
  const request = { ...f.request, code: "asset", expectedRevision: 1, confirmed: true, idempotencyKey: "original-listing",
    authData: { ...f.request.authData, code: "seller", principalType: "customer" },
    payload: { name: "Reviewed certificate bundle", amount: "12.50", currency: "POINTS", priceBookCode: "reviewed-book",
      listingContextRef: { code: 'binding', revision: 3 },
      reward: { programCode: "reviewed-program", rewardTypeCode: "reviewed-points", scale: 2 },
      storeCode: "store", saleMode: "FIXED", startsAt: null, endsAt: null, categoryCodes: [] } };
  Object.assign(f.rows.DefaultDigitalBundleListingContextService[0], { priceBookCode: 'reviewed-book',
    reward: { programCode: 'reviewed-program', rewardTypeCode: 'reviewed-points' } });
  f.rows.DefaultLoyaltyProgramService[0].code = 'reviewed-program';
  f.rows.DefaultLoyaltyRewardTypeService[0].code = 'reviewed-points';
  SERVICE.DefaultEWasteExperienceService = { store: () => ({ ...persistence, one: async () => structuredClone(asset) }) };
  SERVICE.DefaultEWasteMarketplaceService = { customerRemote: async (r, module, api, method, body) => {
    assert.strictEqual(r, request); assert.equal(module, "digitalCore"); assert.equal(method, "POST");
    calls.push({ api, body: structuredClone(body) });
    return api === "/bundles" ? bundles.create(r, body) : publisher.publish(r, body);
  } };
  return { ...f, asset, request, calls };
}
test("reviewed listing persists common manifest and exact decimal terms without a new legacy intent or private media", async t => {
  const f = fixture(t), original = structuredClone(f.asset), request = structuredClone(f.request);
  const result = await listing.list(f.request);
  assert.equal(result.status, "PUBLISHED"); assert.equal(result.quantity, "1");
  assert.deepEqual(f.calls.map(c => c.api), ["/bundles", "/bundles/listings"]);
  assert.equal(f.row().evidence.listing.terms.amount, "12.5");
  assert.deepEqual(f.row().evidence.listing.terms.reward, f.request.payload.reward);
  assert.deepEqual(f.row().evidence.listing.contextRef, f.request.payload.listingContextRef);
  assert.equal(f.row().evidence.manifestEnterpriseCode, "seller-enterprise");
  assert.equal(f.row().enterpriseCode, "market");
  assert.equal(f.effects[0], "reserve"); assert.equal(f.effects.includes("open-round"), false);
  assert.deepEqual(f.asset, original); assert.deepEqual(f.request, request);
  assert.equal(JSON.stringify(f.rows).includes("private-photo-sentinel"), false);
  assert.equal(f.rows.DefaultDigitalProductBindingService.length, 1);
});
test("explicit same-command replay retains one original manifest, publication and content hold", async t => {
  const f = fixture(t);
  const first = await listing.list(f.request), second = await listing.list(f.request);
  assert.equal(first.publicationCode, second.publicationCode);
  assert.equal(f.rows.DefaultDigitalBundleManifestService.length, 1);
  assert.equal(f.rows.DefaultDigitalBundleOperationService.length, 1);
  assert.equal(f.effects.filter(x => x === "reserve").length, 1);
});
test("unknown Product activation retains common content holds and recovers original saved preparation", async t => {
  const f = fixture(t); f.failPublish(true);
  await assert.rejects(listing.list(f.request), /Activation unknown/);
  assert.equal(f.row().evidence.listing.phase, "PUBLISHING"); assert.equal(f.holds.size, 1);
  f.failPublish(false); assert.equal((await listing.list(f.request)).status, "PUBLISHED");
  assert.equal(f.effects.filter(x => x === "prepare").length, 1); assert.equal(f.effects.includes("release"), false);
});
for (const [label, metadata, status] of [
  ["retained intent", { listingIntent: { contractVersion: 2 } }, "OWNED"],
  ["reconciliation hold", { listingReconciliation: { status: "RECONCILING" } }, "OWNED"],
  ["legacy pending", { listingRewardPrice: 12, listingCommand: "original" }, "LISTING_REQUESTED"],
]) test(label + " requires owner reconciliation rather than read-based backfill", async t => {
  const f = fixture(t); f.asset.metadata = metadata; f.asset.assetStatus = status;
  f.request.idempotencyKey = "new-key"; f.request.payload.listingIntent = { forged: true };
  const before = structuredClone(f.asset);
  await assert.rejects(listing.list(f.request), /Historical listing/);
  assert.equal(f.calls.length, 0); assert.deepEqual(f.asset, before);
});
for (const [label, change] of [
  ["amount", f => f.request.payload.amount = "13"],
  ["reward program", f => f.request.payload.reward.programCode = "other"],
  ["currency", f => f.request.payload.currency = "OTHER"],
  ["window", f => f.request.payload.endsAt = "2999-01-01T00:00:00.000Z"],
  ["component revision", f => f.request.expectedRevision = 2],
]) test("original listing cannot adopt changed " + label, async t => {
  const f = fixture(t); await listing.list(f.request); change(f);
  await assert.rejects(listing.list(f.request), /conflict/);
  assert.equal(f.effects.filter(x => x === "reserve").length, 1);
  assert.equal(f.rows.DefaultDigitalProductBindingService.length, 1);
});
test("confirmation, current ownership, principal and original revision remain mandatory", async t => {
  for (const change of [f => f.request.confirmed = false, f => f.request.expectedRevision = 0,
    f => f.asset.ownerRef.code = "other", f => f.request.authData.principalType = "service",
    f => f.request.idempotencyKey = ""]) {
    const f = fixture(t); change(f);
    await assert.rejects(listing.list(f.request)); assert.equal(f.holds.size, 0);
  }
});
test("explicit business terms replace old rewardPrice and do not inherit random programs or windows", async t => {
  for (const key of ["amount", "reward", "storeCode", "priceBookCode", "currency", "saleMode", "startsAt", "endsAt"]) {
    const f = fixture(t); delete f.request.payload[key]; f.request.payload.rewardPrice = 12;
    await assert.rejects(listing.list(f.request)); assert.equal(f.holds.size, 0);
  }
});
test("unqualified publication owners and bad actual receipts never manufacture a published listing", async t => {
  const f = fixture(t); f.policy.bundleListings.enabled = false;
  await assert.rejects(listing.list(f.request), /not configured/); assert.equal(f.holds.size, 0);
  f.policy.bundleListings.enabled = true;
  SERVICE.DefaultModuleService.invokeModule = async () => ({ success: false });
  await assert.rejects(listing.list(f.request)); assert.equal(f.holds.size, 0);
});
test("new key cannot reuse scarce content from an uncertain prior publication", async t => {
  const f = fixture(t); f.failPublish(true); await assert.rejects(listing.list(f.request), /Activation unknown/);
  f.request.idempotencyKey = "replacement";
  await assert.rejects(listing.list(f.request), /not available/);
  assert.equal(f.holds.size, 1); assert.equal(f.effects.includes("release"), false);
});
