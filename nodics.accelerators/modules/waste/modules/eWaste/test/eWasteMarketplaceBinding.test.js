/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module eWaste/test/eWasteMarketplaceBinding @description Tests framework-owned binding defaults and safe complete Commerce DTOs. @owner eWaste @layer test */
const test = require("node:test"), assert = require("node:assert/strict");
const marketplace = require("../src/service/defaultEWasteMarketplaceService");
const defaults = require("../config/properties").eWaste.marketplace;
const identities = ["storeCode", "currency", "jurisdiction", "programCode", "rewardTypeCode"];
const selected = () => ({ ...structuredClone(defaults), storeCode: "store", currency: "POINTS", jurisdiction: "AE",
  programCode: "governed-program", rewardTypeCode: "governed-points" });
const product = () => ({ productCode: "product", variantCodes: ["variant"], price: { currency: "POINTS", unitAmount: "2.5" },
  availability: { available: true }, localizedAttributes: { kind: "BUNDLE",
    bundleRef: { module: "digitalCore", schema: "digitalBundleManifest", code: "manifest" } } });
const fixture = settings => ({ ...marketplace, experience: () => ({ settings: () => ({ marketplace: settings }) }) });

test("framework defines required runtime-specific binding identities as null without activating listing or ownership", () => {
  for (const key of identities) assert.equal(defaults[key], null, key);
  for (const key of ["catalogVersion", "priceBookCode", "warehouseCode", "transferPolicyCode",
    "rewardSettlementPolicyCode", "carbonSettlementPolicyCode", "saleMode"])
    assert.equal(defaults[key], null, key);
  assert.deepEqual(defaults.listingPresentation, { description: null, imageUrl: null, sample: false });
  assert.equal(defaults.locale, "en"); assert.equal(defaults.autoPublishListings, false);
  assert.equal(defaults.digitalOwnership.enabled, false); assert.equal(defaults.digitalOwnership.qualified, false);
  assert.equal(fixture(defaults).commerceBinding(product()), null);
  assert.throws(() => fixture(defaults).products({}, "/products/discovery"), /binding is unavailable/);
});

test("configured locale drives discovery and missing Product locale; retained Product locale takes precedence", async () => {
  const settings = { ...selected(), locale: "ar-AE" }, service = fixture(settings), calls = [];
  service.experience = () => ({ settings: () => ({ marketplace: settings }), remote: async (...args) => { calls.push(args); return {}; } });
  await service.products({ query: { locale: "injected" } }, "/products/discovery", { locale: "injected" });
  assert.equal(new URL(calls[0][3], "https://owner.test").searchParams.get("locale"), "ar-AE");
  const first = await service.marketplaceOffer({}, product());
  assert.equal(first.commerce.locale, "ar-AE"); assert.equal(first.kind, "ASSET");
  assert.deepEqual(first.commerce, { storeCode: "store", currency: "POINTS", jurisdiction: "AE",
    programCode: "governed-program", rewardTypeCode: "governed-points", variantCode: "variant", locale: "ar-AE" });
  const localized = product(); localized.locale = "fr-CA";
  assert.equal((await service.offer({}, localized)).commerce.locale, "fr-CA");
  assert.equal(fixture(selected()).commerceBinding(product()).locale, defaults.locale);
});

test("missing or malformed binding selectors never expose a partial purchase DTO", async () => {
  for (const key of identities) for (const value of [null, undefined, "", " bad", {}, "x".repeat(193)]) {
    const settings = selected(); settings[key] = value;
    assert.equal(await fixture(settings).offer({}, product()), null, key + " " + String(value));
    assert.equal(await fixture(settings).marketplaceOffer({}, product()), null);
  }
  for (const value of [null, undefined, "", "bad/locale", {}, "x".repeat(65)]) {
    const settings = selected(); settings.locale = value;
    assert.equal(fixture(settings).commerceBinding(product()), null);
    assert.throws(() => fixture(settings).products({}, "/products/discovery"), /binding is unavailable/);
  }
});

test("retained variant, currency and locale cannot be replaced by caller checkout selectors", async () => {
  const service = fixture(selected());
  for (const patch of [{ variantCodes: [] }, { variantCodes: [null] }, { locale: "" },
    { locale: "bad/locale" }, { price: { currency: "OTHER", unitAmount: "2.5" } }]) {
    assert.equal(await service.offer({ payload: { variantCode: "injected", locale: "en" } }, { ...product(), ...patch }), null);
  }
  const coupon = product(); coupon.localizedAttributes = { kind: "COUPON", acquisitionRequirements: { purchaseType: "REWARDS_ONLY" } };
  const offer = await service.marketplaceOffer({}, coupon);
  assert.equal(offer.commerce.programCode, "governed-program");
  assert.equal(offer.acquisitionRequirements, null);
  assert.equal(offer.available, false);
  coupon.availability.acquisitionRequirements = { type: 'REWARDS' };
  assert.deepEqual((await service.marketplaceOffer({}, coupon)).acquisitionRequirements, { type: 'REWARDS' });
});

test('unknown or malformed owner requirements stay explicit and unavailable despite copied Product attributes', async () => {
  const service = fixture(selected());
  for (const value of [undefined, null, {}, { type: 'UNKNOWN' }, { type: 'REWARDS', priceRef: 'private' },
    { type: 'CERTIFICATES' }, { type: 'BOTH', certificates: { quantity: 0, categoryCode: 'x', milestoneCode: 'y' } }]) {
    const coupon = product();
    coupon.localizedAttributes = { kind: 'COUPON', acquisitionRequirements: { type: 'REWARDS' } };
    coupon.availability.acquisitionRequirements = value;
    for (const dto of [await service.offer({}, coupon), await service.marketplaceOffer({}, coupon)]) {
      assert.equal(dto.acquisitionRequirements, null); assert.equal(dto.available, false);
    }
  }
});
