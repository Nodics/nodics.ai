/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module eWaste/service/defaultEWasteWeightRewardValuationService @description Applies trusted weight reward policy to original approval evidence; rewards remain separate from sourced impact and credit issuance. @owner eWaste @layer service @override Later project policy may choose different reward rules without rewriting historical settlements. */
module.exports = {
  /** Values original approval evidence using trusted policy and error bindings. No persistence or ledger writes; unavailable carbon contributes zero. */
  assess: function (request, policy, errors = {}) {
    if (
      !policy ||
      !Number.isFinite(policy.pointsPerKg) ||
      policy.pointsPerKg < 0 ||
      !Number.isFinite(policy.carbonUnitsPerEstimatedKg) ||
      policy.carbonUnitsPerEstimatedKg < 0
    )
      throw new CLASSES.NodicsError(
        errors.policy || "ERR_EWASTE_VALUATION_UNAVAILABLE",
        "The reward valuation policy is invalid",
      );
    const impact = request.impact || {},
      provenance = impact.metadata?.impactProvider;
    const facts = request.asset?.metadata?.facts || {};
    let weight = provenance?.input?.weightKg,
      weightSource = provenance?.input?.weightSource;
    if (weight === undefined && facts.weight !== undefined) {
      weight = Number(facts.weight);
      weightSource = "DECLARED";
    }
    if (
      weight === undefined &&
      facts.weightEstimate?.min > 0 &&
      facts.weightEstimate.max >= facts.weightEstimate.min
    ) {
      weight =
        ((facts.weightEstimate.min + facts.weightEstimate.max) / 2) *
        (facts.quantity || 1);
      weightSource = "ESTIMATED_RANGE_MIDPOINT";
    }
    const metric =
      impact.calculationStatus !== "FAILED" &&
      (impact.metrics || []).find(
        (m) =>
          m.metricCode === "ESTIMATED_CO2E_SAVED_KG" &&
          m.unitOfMeasure === "KG_CO2E",
      );
    const carbon = metric ? Number(metric.value) : 0;
    if (weight === undefined) weight = 0;
    if (
      !Number.isFinite(weight) ||
      weight < 0 ||
      !Number.isFinite(carbon) ||
      carbon < 0
    )
      throw new CLASSES.NodicsError(
        errors.input || "ERR_WASTE_INPUT_INVALID",
        "The reward valuation input is invalid",
      );
    return {
      version: policy.version,
      illustrative: true,
      weightKg: weight,
      weightSource: weightSource || "UNAVAILABLE",
      pointsRewardTypeCode: policy.pointsRewardTypeCode,
      rewards: [
        {
          programCode: policy.programCode,
          rewardTypeCode: policy.pointsRewardTypeCode,
          amount: (weight * policy.pointsPerKg).toFixed(2),
          scale: 2,
        },
        {
          programCode: policy.programCode,
          rewardTypeCode: policy.carbonRewardTypeCode,
          amount: (carbon * policy.carbonUnitsPerEstimatedKg).toFixed(3),
          scale: 3,
        },
      ],
    };
  },
};
