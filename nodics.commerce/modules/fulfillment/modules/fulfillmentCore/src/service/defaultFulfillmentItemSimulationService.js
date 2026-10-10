/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
const crypto = require("node:crypto");
/** @module fulfillmentCore/service/defaultFulfillmentItemSimulationService @description Produces deterministic, explicitly unverified ITEM simulation results only for an opted-in LOCAL deployment. It performs no delivery, receipt issuance, inventory, transport or database work. @layer service @owner fulfillmentCore @override Later layers may narrow admission; simulated results must never become verified delivery evidence. */
module.exports = {
  /** Refuses unavailable or malformed simulation without echoing private context. @returns {never} Typed refusal. */
  fail: function () {
    throw new CLASSES.NodicsError("ERR_FULFILLMENT_ITEM_DELIVERY_UNCONFIRMED", "ITEM_SIMULATION_NOT_ADMITTED");
  },
  /** Requires explicit native-local selection and canonical deployment classification, not a request flag or environment name heuristic. @returns {boolean} Exact simulation selection. */
  assertSelected: function () {
    const policy = CONFIG.get("fulfillmentCore")?.itemSimulation;
    const benefits = CONFIG.get("promotion")?.merchantBenefits;
    const environment = typeof NODICS !== "undefined" &&
      (typeof NODICS.getSelectedEnvironmentName === "function" ? NODICS.getSelectedEnvironmentName() :
        typeof NODICS.getEnvironmentName === "function" ? NODICS.getEnvironmentName() : undefined);
    const allowed = policy?.environmentAllowlist;
    if (CONFIG.get("environment")?.class !== "LOCAL" || policy?.enabled !== true ||
        benefits?.enabled !== true || benefits.itemEvidenceMode !== "LOCAL_SIMULATION" ||
        benefits.itemEvidenceService !== "DefaultFulfillmentItemSimulationService" ||
        !Array.isArray(allowed) || !allowed.length || allowed.length > 20 ||
        new Set(allowed).size !== allowed.length ||
        allowed.some(value => typeof value !== "string" || !/^[A-Za-z0-9_.:-]{1,128}$/.test(value)) ||
        !allowed.includes(environment)) this.fail();
    return true;
  },
  /** Canonicalizes existing bounded ITEM selectors plus the merchant-owner's observed outlet revision. @param {Object} input Original owner context, never delivery proof. @returns {Object} Detached simulation coordinates. */
  context: function (input) {
    const boundary = SERVICE.DefaultFulfillmentItemDeliveryEvidenceService;
    if (typeof boundary?.record !== "function" || typeof boundary.context !== "function") this.fail();
    const keys = ["tenant", "enterpriseCode", "issuerEnterpriseCode", "ownerId", "couponCode", "productCode",
      "promotionCode", "promotionRevision", "storeCode", "targetCode", "merchantReceiptReference", "items", "storeRevision"];
    const record = boundary.record(input, keys);
    const { storeRevision, ...original } = record;
    const context = boundary.context(original);
    if (!Number.isSafeInteger(storeRevision) || storeRevision < 1 ||
        !/^SIM:[A-Za-z0-9_.:@-]{1,115}$/.test(context.merchantReceiptReference)) this.fail();
    return Object.freeze({ ...context, storeRevision });
  },
  /** Simulates the exact selected bundle without asserting an immutable receipt or real delivery. Same context deterministically yields the same hash; no physical replay guarantee is claimed. @param {Object} input Bounded Promotion context. @returns {Promise<Object>} Clearly simulated, unverified projection. */
  evaluate: async function (input) {
    this.assertSelected();
    const context = this.context(input);
    const hash = crypto.createHash("sha256").update(JSON.stringify({ protocol: "ITEM_SIMULATION_V1", context })).digest("hex");
    this.assertSelected();
    return { ...structuredClone(context), eligible: true, simulated: true, verified: false, immutable: false,
      status: "SIMULATED", sourceType: "ITEM_SIMULATION", sourceStage: "SIMULATED_ITEMS",
      sourceReference: context.merchantReceiptReference, sourceHash: hash, sourceRevision: 0 };
  },
};
