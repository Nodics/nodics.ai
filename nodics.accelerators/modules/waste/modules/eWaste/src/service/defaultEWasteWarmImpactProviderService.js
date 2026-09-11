/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

/** @module eWaste/service/defaultEWasteWarmImpactProviderService @description Calculates potential electronics recycling savings using a versioned EPA WARM dataset and explicit baseline. No persistence, AI calls, rewards or credit issuance. @owner eWaste @layer service @override Later providers implement the wasteImpact protocol; later configuration supplies versioned mappings and datasets. */
module.exports = {
  /** Rejects unsupported inputs or malformed configuration through Waste's stable errors. */
  fail: function (code, message) {
    return SERVICE.DefaultWastePersistenceService.fail(code, message);
  },
  /** Reads positive bounded kilograms; supplied invalid data never falls back to an estimate. */
  positive: function (value, maximum) {
    if (
      !["number", "string"].includes(typeof value) ||
      String(value).trim() === "" ||
      !Number.isFinite(Number(value)) ||
      Number(value) <= 0 ||
      Number(value) > maximum
    )
      this.fail(
        "ERR_WASTE_IMPACT_INPUT_INVALID",
        "A positive weight within the configured limit is required",
      );
    return Number(value);
  },
  /** Uses declared total weight first; otherwise retains per-item estimated bounds and applies quantity once. */
  weight: function (facts, settings) {
    const quantity = facts.quantity === undefined ? 1 : facts.quantity;
    if (
      !Number.isSafeInteger(quantity) ||
      quantity < 1 ||
      quantity > 100 ||
      (facts.weightUnit && facts.weightUnit !== "KG")
    )
      this.fail(
        "ERR_WASTE_IMPACT_INPUT_INVALID",
        "Use a valid item count and kilograms",
      );
    for (const key of ["verifiedWeight", "receivedWeight", "weight"]) {
      if (facts[key] !== undefined && facts[key] !== null) {
        const weight = this.positive(facts[key], settings.maximumWeightKg);
        return {
          weightKg: weight,
          weightMinKg: weight,
          weightMaxKg: weight,
          quantity,
          weightSource: key,
          weightBasis:
            facts.weightProvenance?.basis ||
            (key === "weight" ? "DECLARED" : "RECORDED"),
          weightAggregation: "TOTAL",
        };
      }
    }
    const range = facts.weightEstimate;
    if (
      !range ||
      range.unit !== "KG" ||
      !["INFERRED", "OPERATOR_VERIFIED"].includes(range.basis)
    )
      this.fail(
        "ERR_WASTE_IMPACT_INPUT_INVALID",
        "Provide a weight or a supported weight estimate before calculating impact",
      );
    const min = this.positive(range.min, settings.maximumWeightKg),
      max = this.positive(range.max, settings.maximumWeightKg);
    if (max < min || max * quantity > settings.maximumWeightKg)
      this.fail(
        "ERR_WASTE_IMPACT_INPUT_INVALID",
        "The estimated weight range is invalid",
      );
    return {
      weightKg: ((min + max) / 2) * quantity,
      weightMinKg: min * quantity,
      weightMaxKg: max * quantity,
      unitWeightMinKg: min,
      unitWeightMaxKg: max,
      quantity,
      weightSource: "ESTIMATED_RANGE_MIDPOINT",
      weightBasis: range.basis,
      weightAggregation: "PER_ITEM_RANGE_TIMES_QUANTITY",
      ...(typeof range.confidence === "number" &&
      range.confidence >= 0 &&
      range.confidence <= 1
        ? { weightConfidence: range.confidence }
        : {}),
    };
  },
  /** Matches only configured electronic categories; unknown appliances/batteries never inherit a made-up coefficient. */
  category: function (facts, settings) {
    for (const [table, code] of [
      [settings.itemTypes, facts.itemTypeCode],
      [settings.categories, facts.categoryCode],
    ]) {
      if (
        table &&
        typeof code === "string" &&
        Object.prototype.hasOwnProperty.call(table, code)
      )
        return table[code];
    }
    return this.fail(
      "ERR_WASTE_IMPACT_INPUT_INVALID",
      "This item has no supported WARM category; a different assessment provider is required",
    );
  },
  /** Returns a reproducible potential-benefit assessment, preserving original units, factor row, weight bounds and method scope. */
  calculate: function (request, context) {
    const settings = context?.settings?.warm;
    if (
      !settings ||
      !Number.isInteger(settings.precision) ||
      settings.precision < 3 ||
      settings.precision > 9 ||
      !Number.isFinite(settings.maximumWeightKg) ||
      settings.maximumWeightKg <= 0 ||
      ![
        "datasetVersion",
        "datasetRef",
        "geography",
        "baselineScenario",
        "treatmentScenario",
        "systemBoundary",
      ].every(
        (key) => typeof settings[key] === "string" && settings[key].trim(),
      )
    )
      this.fail(
        "ERR_WASTE_IMPACT_CONFIGURATION_INVALID",
        "The WARM dataset configuration is incomplete",
      );
    const facts = request.facts || {},
      category = this.category(facts, settings),
      row = settings.rows?.[category];
    if (
      !row ||
      !Number.isFinite(row.landfill) ||
      !Number.isFinite(row.recycling) ||
      !Number.isFinite(settings.kgPerShortTon) ||
      settings.kgPerShortTon <= 0 ||
      row.landfill < row.recycling
    )
      this.fail(
        "ERR_WASTE_IMPACT_CONFIGURATION_INVALID",
        "The WARM factor row or source-unit conversion is invalid",
      );
    const input = this.weight(facts, settings),
      factor = ((row.landfill - row.recycling) * 1000) / settings.kgPerShortTon;
    const rounded = (value) => Number(value.toFixed(settings.precision));
    return {
      provider: { code: "EPA_WARM_ELECTRONICS", version: "1", isMock: false },
      formulaVersion: "WARM_BASELINE_MINUS_TREATMENT_V1",
      calculationStatus: "ESTIMATED",
      metrics: [
        {
          metricCode: "ESTIMATED_CO2E_SAVED_KG",
          value: (input.weightKg * factor).toFixed(settings.precision),
          unitOfMeasure: "KG_CO2E",
        },
        {
          metricCode: "CARBON_EQUIVALENT_TCO2E",
          value: ((input.weightKg * factor) / 1000).toFixed(settings.precision),
          unitOfMeasure: "T_CO2E",
        },
      ],
      methodologyRef: "EPA WARM electronics",
      factorDatasetRef: settings.datasetRef,
      referenceYear: settings.referenceYear,
      geography: settings.geography,
      baselineScenario: settings.baselineScenario,
      treatmentScenario: settings.treatmentScenario,
      systemBoundary: settings.systemBoundary,
      assessmentBasis: "POTENTIAL",
      calculation: {
        input: {
          ...input,
          itemTypeCode: facts.itemTypeCode,
          categoryCode: facts.categoryCode,
        },
        parameters: {
          factorKgCO2ePerKg: factor,
          factorSource: category,
          factorSetVersion: settings.datasetVersion,
          baselineFactor: row.landfill,
          treatmentFactor: row.recycling,
          sourceFactorUnit: "T_CO2E_PER_US_SHORT_TON",
          kgPerShortTon: settings.kgPerShortTon,
          savingsMinKgCO2e: rounded(input.weightMinKg * factor),
          savingsMaxKgCO2e: rounded(input.weightMaxKg * factor),
          precision: settings.precision,
        },
      },
    };
  },
};
