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
  /** Resolves an explicitly configured, size-scoped proxy; never a category-wide fallback. */
  referenceScenario: function (facts, settings) {
    if (settings.itemTypes?.[facts.itemTypeCode] || settings.categories?.[facts.categoryCode]) return null;
    if (facts.submissionUnit === "BUNDLE") {
      const bundle = settings.bundleReferenceScenario;
      if (!bundle || bundle.enabled !== true || facts.itemTypeCode !== bundle.itemTypeCode || facts.categoryCode !== bundle.categoryCode) return null;
      if (!["version", "category", "explanation"].every(key => typeof bundle[key] === "string" && bundle[key].trim() && bundle[key].length <= 1024))
        this.fail("ERR_WASTE_IMPACT_CONFIGURATION_INVALID", "Bundle reference scenario provenance is incomplete");
      return { ...bundle, requiresWeight: true };
    }
    const scenario = settings.referenceScenarios?.[facts.itemTypeCode];
    if (!scenario || scenario.enabled !== true || scenario.sizeClass !== facts.sizeClass) return null;
    if (!["version", "category", "explanation", "weightSource", "weightSourceRef", "comparisonSourceRef"].every(key =>
      typeof scenario[key] === "string" && scenario[key].trim() && scenario[key].length <= 512))
      this.fail("ERR_WASTE_IMPACT_CONFIGURATION_INVALID", "Reference scenario provenance is incomplete");
    return scenario;
  },
  /** Uses declared total weight first; otherwise retains per-item estimated bounds and applies quantity once. */
  weight: function (facts, settings) {
    const quantity = facts.quantity === undefined ? 1 : facts.quantity;
    if (facts.submissionUnit === "BUNDLE" && quantity !== 1) this.fail("ERR_WASTE_IMPACT_INPUT_INVALID", "Bundle mass must be assessed once");
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
    let range = facts.weightEstimate;
    const scenario = this.referenceScenario(facts, settings);
    const unknown = !range || (range.basis === "UNKNOWN" && range.min == null && range.max == null);
    if (unknown && (!scenario || scenario.requiresWeight) && settings.allowPartialAssessment === true) return { quantity, weightSource: "UNKNOWN", weightBasis: "UNKNOWN" };
    if (unknown && scenario && !scenario.requiresWeight) range = { min: scenario.minKg, max: scenario.maxKg, unit: "KG", basis: "REFERENCE_ASSUMPTION" };
    if (
      !range ||
      range.unit !== "KG" ||
      !( ["INFERRED", "OPERATOR_VERIFIED"].includes(range.basis) || (unknown && scenario && range.basis === "REFERENCE_ASSUMPTION"))
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
      weightSource: range.basis === "REFERENCE_ASSUMPTION" ? "REFERENCE_ASSUMPTION" : "ESTIMATED_RANGE_MIDPOINT",
      weightBasis: range.basis,
      weightAggregation: facts.submissionUnit === "BUNDLE" ? "TOTAL_BUNDLE_RANGE" : "PER_ITEM_RANGE_TIMES_QUANTITY",
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
    const scenario = this.referenceScenario(facts, settings);
    if (scenario) return scenario.category;
    if (settings.allowPartialAssessment === true) return null;
    return this.fail(
      "ERR_WASTE_IMPACT_INPUT_INVALID",
      "This item has no supported WARM category; a different assessment provider is required",
    );
  },
  /** Retains useful input estimates without substituting an unsupported climate factor. */
  partialAssessment: function (facts, input, settings, category) {
    if (input.submissionUnit === "BUNDLE" && !input.weightKg)
      this.fail("ERR_WASTE_IMPACT_INPUT_INVALID", "A total electronic-item weight estimate is required for this bundle");
    return {
      provider: { code: "EPA_WARM_ELECTRONICS", version: "5", isMock: false },
      formulaVersion: "RECYCLING_INPUT_ASSESSMENT_V1", calculationStatus: "ESTIMATED",
      assessmentBasis: "INPUT_ONLY",
      assessmentLimitation: !category ? "No supported emissions or energy factor is mapped to this item. Weight and count are retained for recycling assessment." : "An item weight or defensible weight estimate is required for emissions and energy calculations.",
      metrics: [
        ...(input.submissionUnit === "BUNDLE" ? [] : [{ metricCode: "RECYCLING_INPUT_ITEM_COUNT", value: String(input.quantity), unitOfMeasure: "EACH" }]),
        ...(input.weightKg ? [{ metricCode: "POTENTIAL_RECYCLING_INPUT_KG", value: input.weightKg.toFixed(settings.precision), unitOfMeasure: "KG" }] : []),
      ],
      calculation: { input: { ...input, itemTypeCode: facts.itemTypeCode, categoryCode: facts.categoryCode }, parameters: {} },
    };
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
      scenario = this.referenceScenario(facts, settings),
      category = this.category(facts, settings),
      row = settings.rows?.[category],
      input = { ...this.weight(facts, settings), ...(facts.submissionUnit === "BUNDLE" ? { submissionUnit: "BUNDLE" } : {}) };
    if (!category) return this.partialAssessment(facts, input, settings, category);
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
    const energyRow = settings.energyRows?.[category];
    if (energyRow && (!Number.isFinite(energyRow.landfill) || !Number.isFinite(energyRow.recycling) ||
        !Number.isFinite(settings.kWhPerMillionBtu) || settings.kWhPerMillionBtu <= 0 || energyRow.landfill < energyRow.recycling))
      this.fail("ERR_WASTE_IMPACT_CONFIGURATION_INVALID", "The WARM energy factor or unit conversion is invalid");
    if (!input.weightKg) return this.partialAssessment(facts, input, settings, category);
    const energyFactor = energyRow ? (energyRow.landfill - energyRow.recycling) * settings.kWhPerMillionBtu / settings.kgPerShortTon : undefined;
    const factor = ((row.landfill - row.recycling) * 1000) / settings.kgPerShortTon;
    const rounded = (value) => Number(value.toFixed(settings.precision));
    return {
      provider: { code: "EPA_WARM_ELECTRONICS", version: "5", isMock: false },
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
        { metricCode: "POTENTIAL_RECYCLING_INPUT_KG", value: input.weightKg.toFixed(settings.precision), unitOfMeasure: "KG" },
        ...(input.submissionUnit === "BUNDLE" ? [] : [{ metricCode: "RECYCLING_INPUT_ITEM_COUNT", value: String(input.quantity), unitOfMeasure: "EACH" }]),
        ...(energyRow ? [{ metricCode: "ENERGY_SAVED_KWH", value: (input.weightKg * energyFactor).toFixed(settings.precision), unitOfMeasure: "KWH" }] : []),
        { metricCode: "BASELINE_EMISSIONS_KG_CO2E", value: (input.weightKg * row.landfill * 1000 / settings.kgPerShortTon).toFixed(settings.precision), unitOfMeasure: "KG_CO2E" },
      ],
      methodologyRef: "EPA WARM electronics",
      factorDatasetRef: settings.datasetRef,
      referenceYear: settings.referenceYear,
      geography: settings.geography,
      baselineScenario: settings.baselineScenario,
      treatmentScenario: settings.treatmentScenario,
      systemBoundary: settings.systemBoundary,
      assessmentBasis: scenario ? "REFERENCE_SCENARIO" : "POTENTIAL",
      ...(scenario ? { referenceScenarioVersion: scenario.version, referenceScenarioExplanation: scenario.requiresWeight || input.weightSource === "REFERENCE_ASSUMPTION" ? scenario.explanation : "Reference scenario: WARM electronic peripherals proxy, not a charger-specific factor. The calculation uses the item weight basis and bounds recorded below.",
        weightReference: scenario.weightSource, weightReferenceUrl: scenario.weightSourceRef,
        comparisonReferenceUrl: scenario.comparisonSourceRef } : {}),
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
          ...(energyRow ? { energyFactorKWhPerKg: energyFactor,
          energyBaselineFactor: energyRow.landfill,
          energyTreatmentFactor: energyRow.recycling,
          energySourceFactorUnit: "MILLION_BTU_PER_US_SHORT_TON",
          kWhPerMillionBtu: settings.kWhPerMillionBtu,
          energyMinKWh: rounded(input.weightMinKg * energyFactor),
          energyMaxKWh: rounded(input.weightMaxKg * energyFactor) } : {}),
          precision: settings.precision,
        },
      },
    };
  },
};
