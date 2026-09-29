/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module eWaste/test/eWasteWeightValuationPrecision @description Exact decimal, original evidence and quantity regressions with independent policy. @owner eWaste @layer test */
const { test, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const domain = require("../src/service/defaultEWasteWeightRewardValuationService");
const valuation = { assess: (request) => domain.assess(request, policy) };
let policy;
beforeEach(() => {
  policy = {
    version: "v2",
    pointsPerKg: 10,
    carbonUnitsPerEstimatedKg: 1,
    programCode: "INDEPENDENT_PROGRAM",
    pointsRewardTypeCode: "POINTS",
    carbonRewardTypeCode: "CARBON_UNITS",
  };
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code, message) {
        super(message);
        this.code = code;
      }
    },
  };
});
afterEach(() => {
  delete global.SERVICE;
  delete global.CONFIG;
  delete global.CLASSES;
});
test("points follow weight while carbon units follow sourced CO2e under separate policy", () => {
  const result = valuation.assess({
    asset: { metadata: { facts: { weight: 99 } } },
    impact: {
      calculationStatus: "ESTIMATED",
      metrics: [
        {
          metricCode: "ESTIMATED_CO2E_SAVED_KG",
          unitOfMeasure: "KG_CO2E",
          value: "2.380992",
        },
      ],
      metadata: {
        impactProvider: {
          input: { weightKg: 2, weightSource: "ESTIMATED_RANGE_MIDPOINT" },
        },
      },
    },
  });
  assert.equal(result.rewards[0].amount, "20.00");
  assert.equal(result.rewards[1].amount, "2.381");
  assert.equal(result.version, "v2");
});
test("unavailable impact does not invent carbon rewards and retains reviewed weight range", () => {
  const result = valuation.assess({
    asset: {
      metadata: {
        facts: { quantity: 2, weightEstimate: { min: 1, max: 3, unit: "KG" } },
      },
    },
    impact: { calculationStatus: "FAILED", metrics: [] },
  });
  assert.equal(result.rewards[0].amount, "40.00");
  assert.equal(result.rewards[1].amount, "0.000");
});
test("unknown physical input never becomes a fabricated weight or reward", () => {
  const result = valuation.assess({
    asset: { metadata: { facts: {} } },
    impact: { calculationStatus: "FAILED", metrics: [] },
  });
  assert.equal(result.weightKg, 0);
  assert.equal(result.weightSource, "UNAVAILABLE");
  assert.equal(result.rewards[0].amount, "0.00");
});
