/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

/** @module eWaste/test/eWasteApplicationContract @description Verifies E-Waste exposes reusable journey metadata without owning underlying domain state. @layer test @owner eWaste */
const assert = require("assert");
const service = require("../src/service/defaultEWasteJourneyContractService");

const contract = service.journeyContract({
  now: new Date("2026-09-01T17:00:00.000Z"),
  correlationId: "corr-ewaste-001",
  idempotencyKey: "ewaste-contract-001",
  evidenceRefs: [{ module: "media", schema: "mediaAsset", code: "photo-001" }],
  policyRefs: [
    {
      module: "wasteCore",
      schema: "wasteAssetTransferPolicy",
      code: "EWASTE_DONATION_TRANSFER_STANDARD",
    },
  ],
});
const journeyByCode = contract.journeys.reduce(function (index, journey) {
  index[journey.code] = journey;
  return index;
}, {});

assert.strictEqual(contract.code, "EWASTE");
assert.strictEqual(contract.moduleName, "eWaste");
assert.strictEqual(contract.frontendModuleName, undefined);
assert.strictEqual(contract.projectModuleName, undefined);
assert.strictEqual(contract.frameworkModuleName, "nodics.waste");
assert.deepStrictEqual(contract.requiredScenarioModules, ["eWaste"]);
assert.strictEqual(
  contract.ownershipBoundaries.wasteFactsOwner,
  "nodics.waste",
);
assert.strictEqual(contract.ownershipBoundaries.eWastePresetOwner, "eWaste");
assert.strictEqual(
  contract.ownershipBoundaries.recyclingHandoffOwner,
  "wasteRecycling",
);
assert.strictEqual(contract.ownershipBoundaries.walletOwner, "nodics.loyalty");
assert.strictEqual(
  contract.ownershipBoundaries.commerceOwner,
  "nodics.commerce",
);
assert.strictEqual(contract.ownershipBoundaries.frontendOwner, undefined);
assert.strictEqual(contract.evidenceRefs[0].code, "photo-001");
assert.strictEqual(
  contract.policyRefs[0].code,
  "EWASTE_DONATION_TRANSFER_STANDARD",
);

[
  "EWASTE_SUBMISSION",
  "EWASTE_COLLECTION_ACCEPTANCE",
  "EWASTE_ASSETS",
  "EWASTE_MARKETPLACE_PROJECTION",
  "EWASTE_SALE_CALLBACKS",
  "EWASTE_GIFT",
  "EWASTE_DONATION",
  "EWASTE_COUPON_REDEMPTION",
  "EWASTE_RECYCLING_HANDOFF",
].forEach(function (journeyCode) {
  assert(
    journeyByCode[journeyCode],
    journeyCode + " must be present in E-Waste",
  );
});

assert.strictEqual(
  journeyByCode.EWASTE_SUBMISSION.operationRef.routeKey,
  "/waste/submissions",
);
assert.strictEqual(
  journeyByCode.EWASTE_SUBMISSION.operationRef.permission,
  "waste.submission.create",
);
assert.strictEqual(
  journeyByCode.EWASTE_ASSETS.operationRef.routeKey,
  "/waste/assets/owned",
);
assert.strictEqual(
  journeyByCode.EWASTE_MARKETPLACE_PROJECTION.operationRef.routeKey,
  "/waste/assets/:assetCode/marketplace-projections",
);
assert.strictEqual(
  journeyByCode.EWASTE_GIFT.operationRef.routeKey,
  "/waste/assets/:assetCode/gift/request",
);
assert.strictEqual(
  journeyByCode.EWASTE_DONATION.operationRef.routeKey,
  "/waste/assets/:assetCode/donations/request",
);
assert.strictEqual(
  journeyByCode.EWASTE_COUPON_REDEMPTION.operationRef.routeKey,
  "/waste/assets/:assetCode/coupon-redemptions/request",
);
assert.strictEqual(
  journeyByCode.EWASTE_RECYCLING_HANDOFF.ownerModule,
  "wasteRecycling",
);
assert.strictEqual(
  journeyByCode.EWASTE_RECYCLING_HANDOFF.service,
  "DefaultWasteRecyclingHandoffContractService",
);

const enabled = service.enabledJourneys(contract, {
  gift: { enabled: false },
  recyclingHandoff: { enabled: false },
});
assert(
  !enabled.some(function (journey) {
    return journey.code === "EWASTE_GIFT";
  }),
);
assert(
  !enabled.some(function (journey) {
    return journey.code === "EWASTE_RECYCLING_HANDOFF";
  }),
);
assert(
  enabled.some(function (journey) {
    return journey.code === "EWASTE_DONATION";
  }),
);

assert.throws(function () {
  service.journeyContract({ rewardFormula: { points: 10 } });
}, /rewardFormula must stay outside/);

assert.throws(function () {
  service.journeyContract({ couponCode: "COUPON-001" });
}, /couponCode must stay outside/);

assert.throws(function () {
  service.journeyContract({ provider: { accessToken: "secret-token" } });
}, /accessToken must stay outside/);

assert.throws(function () {
  service.journeyContract({ productName: "Used phone asset product" });
}, /productName must stay outside/);

console.log("E-Waste application contract validated");

const customized = service.journeyContract({
  application: {
    code: "PARTNER_EWASTE",
    frontendModuleName: "partner.web",
    projectModuleName: "partner.waste",
  },
});
assert.strictEqual(customized.frontendModuleName, "partner.web");
assert.strictEqual(customized.projectModuleName, "partner.waste");
assert.strictEqual(customized.moduleName, "eWaste");
