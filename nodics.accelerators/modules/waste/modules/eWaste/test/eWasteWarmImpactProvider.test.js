/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module eWaste/test/eWasteWarmImpactProvider @description Checks sourced WARM factors, weight uncertainty, unsupported boundaries and provider provenance through the real dispatcher. @owner eWaste @layer test */
const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const provider = require("../src/service/defaultEWasteWarmImpactProviderService");
const root = "../../../../../../nodics.waste/modules/wasteImpact/";
const calculator = require(
  root + "src/service/defaultWasteImpactCalculationService",
);
const defaults = require(root + "config/properties").wasteImpact.calculation;
const domain = require("../config/properties").wasteImpact.calculation;
let settings;
beforeEach(() => {
  settings = structuredClone({
    ...defaults,
    ...domain,
    providerService: "WarmProvider",
    failureMode: "ERROR",
  });
  global.CONFIG = { get: () => ({ calculation: settings }) };
  global.SERVICE = {
    WarmProvider: provider,
    DefaultWastePersistenceService: {
      fail(code, message) {
        throw Object.assign(new Error(message), { code });
      },
    },
  };
});
const request = (facts) => ({
  sourceRef: {
    module: "wasteSubmission",
    schema: "wasteSubmission",
    code: "A",
  },
  profile: { code: "P", formulaType: "EXTERNAL_PROVIDER" },
  facts,
});
test("uses EPA source units for a ten kilogram desktop and retains every basis field", async () => {
  const result = await calculator.calculate(
    request({
      itemTypeCode: "DESKTOP_TOWER",
      categoryCode: "DESKTOP_COMPUTER",
      weight: "10",
      quantity: 2,
    }),
    { tenant: "t" },
  );
  assert.equal(result.metrics[0].value, "16.644901");
  assert.equal(result.metrics[1].value, "0.016645");
  const env = result.metadata.environmentalAssessment,
    provenance = result.metadata.impactProvider;
  assert.equal(env.inputs.weightKg, 10); // Weight is total, never multiplied by quantity twice.
  assert.equal(env.factors.baselineFactor, 0.02);
  assert.equal(env.factors.treatmentFactor, -1.49);
  assert.equal(env.factors.factorSetVersion, "EPA_WARM_V16_DEC2023");
  assert.equal(env.methodology.providerVersion, "1");
  assert.equal(env.methodology.assessmentBasis, "POTENTIAL");
  assert.equal(provenance.isMock, false);
  assert.equal(env.carbonCredits.issuedQuantity, null);
  for (const key of [
    "geography",
    "baselineScenario",
    "treatmentScenario",
    "systemBoundary",
    "factorDatasetRef",
  ])
    assert.ok(env.methodology[key]);
});
test("preserves AI per-item range, confidence and total savings bounds", async () => {
  const result = await calculator.calculate(
    request({
      itemTypeCode: "LAPTOP",
      quantity: 2,
      weightEstimate: {
        min: 1,
        max: 3,
        unit: "KG",
        basis: "INFERRED",
        confidence: 0.7,
      },
    }),
  );
  const env = result.metadata.environmentalAssessment;
  assert.equal(env.inputs.weightKg, 4);
  assert.equal(env.inputs.weightMinKg, 2);
  assert.equal(env.inputs.weightMaxKg, 6);
  assert.equal(env.inputs.weightConfidence, 0.7);
  assert.equal(env.inputs.weightBasis, "INFERRED");
  assert.equal(env.factors.savingsMinKgCO2e, 2.380992);
  assert.equal(env.factors.savingsMaxKgCO2e, 7.142977);
});
test("unknown weight, unsupported batteries and malformed explicit values fail without invented fallback", async () => {
  for (const facts of [
    { itemTypeCode: "LAPTOP" },
    { itemTypeCode: "LOOSE_LITHIUM_BATTERY", weight: 2 },
    {
      itemTypeCode: "LAPTOP",
      weight: "",
      weightEstimate: { min: 1, max: 2, unit: "KG", basis: "INFERRED" },
    },
    { itemTypeCode: "LAPTOP", weight: true },
    { itemTypeCode: "LAPTOP", quantity: 0, weight: 2 },
  ])
    await assert.rejects(calculator.calculate(request(facts)), {
      code: "ERR_WASTE_IMPACT_INPUT_INVALID",
    });
});
test("future configured category mapping is an explicit supported extension", async () => {
  settings.warm.itemTypes.PROJECT_PRINTER = "HARD_COPY_DEVICES";
  const result = await calculator.calculate(
    request({ itemTypeCode: "PROJECT_PRINTER", weight: 10 }),
  );
  assert.equal(result.metrics[0].value, "6.393406");
});
test("changing provider leaves the first detached result unchanged", async () => {
  const first = await calculator.calculate(
    request({ itemTypeCode: "LAPTOP", weight: 2 }),
  );
  const snapshot = JSON.stringify(first);
  SERVICE.NextProvider = {
    calculate: () => ({
      provider: { code: "NEXT", version: "2", isMock: false },
      formulaVersion: "NEXT_V2",
      calculationStatus: "ESTIMATED",
      metrics: [
        {
          metricCode: "ESTIMATED_CO2E_SAVED_KG",
          value: "7",
          unitOfMeasure: "KG_CO2E",
        },
      ],
    }),
  };
  settings.providerService = "NextProvider";
  assert.equal(
    (await calculator.calculate(request({ weight: 2 }))).metrics[0].value,
    "7",
  );
  assert.equal(JSON.stringify(first), snapshot);
});
