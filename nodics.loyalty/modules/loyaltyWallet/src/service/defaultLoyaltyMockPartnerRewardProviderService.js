/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const crypto = require("node:crypto");

/**
 * @module loyaltyWallet/src/service/defaultLoyaltyMockPartnerRewardProviderService
 * @description Implements the existing conversion provider contract with explicit
 * simulation evidence. Consumes private owner snapshots; never calls a network or
 * writes a partner account. Invalid configuration/snapshots refuse through Wallet.
 * @layer service
 * @owner loyaltyWallet
 * @override Exported methods are mergeable; preserve simulation markers, frozen
 * quote outcomes and deterministic replay. Real adapters use a distinct binding.
 */
module.exports = {
  /**
   * Describes simulation-only protocol guarantees, never external qualification.
   * @returns {Object} Provider capabilities; no effects or errors.
   */
  capabilities: function () {
    return { contractVersion: 1, idempotentExecution: true, authoritativeOutcomes: true,
      terminalNoCreditFence: true, simulated: true };
  },

  /**
   * Resolves existing conversion validation without duplicating error authority.
   * @returns {Object} Loader-selected owner; missing dependencies fail closed.
   */
  owner: function () { return SERVICE.DefaultLoyaltyPartnerRewardConversionService; },

  /**
   * Resolves the overridable quote clock.
   * @returns {Date} Current time; no writes.
   */
  now: function () { return new Date(); },

  /**
   * Reads complete framework defaults and explicit later-layer choices.
   * @returns {Object} Validated new-quote policy; invalid/disabled policy refuses.
   */
  policy: function () {
    const policy = CONFIG.get("loyalty")?.partnerRewardConversion?.mock;
    if (policy?.enabled !== true || typeof policy.outcome !== "string" ||
        ENUMS.LoyaltyPartnerCreditOutcome[policy.outcome]?.key !== policy.outcome ||
        !this.owner().identifier(policy.targetUnit) || !Number.isSafeInteger(policy.quoteLifetimeMs) ||
        policy.quoteLifetimeMs <= 0 || !Number.isFinite(new Date(this.now().getTime() + policy.quoteLifetimeMs).getTime()))
      this.owner().fail("UNAVAILABLE");
    return policy;
  },

  /**
   * Binds a simulation receipt to its tenant, operation, accounts and frozen terms.
   * @param {Object} request Private coordinator snapshot, never public input.
   * @param {string} outcome Frozen simulation scenario.
   * @returns {string} Deterministic simulation reference; no persistence or transport.
   */
  reference: function (request, outcome) {
    return "simulated:" + outcome + ":" + crypto.createHash("sha256").update(JSON.stringify([
      request.tenant, request.operationReference, request.integration, request.account,
      request.programCode, request.rewardTypeCode, request.sourceAmount, request.sourceScale,
      request.targetAmount, request.targetScale, request.targetUnit,
      request.integration.termsReference, request.integration.termsRevision,
    ])).digest("hex");
  },

  /**
   * Quotes a one-for-one simulated unit conversion with canonical source precision.
   * @param {Object} request Owner-validated private integration/account snapshot.
   * @returns {Promise<Object>} Explicit simulated quote; no external effects.
   * @throws {Error} Disabled/invalid policy or invalid canonical amounts refuse.
   */
  quote: async function (request) {
    const policy = this.policy();
    const sourceAmount = SERVICE.DefaultLoyaltyAmountService.assertPositive(request.sourceAmount, request.sourceScale);
    const terms = { ...request, sourceAmount, targetAmount: sourceAmount,
      targetScale: request.sourceScale, targetUnit: policy.targetUnit };
    return { simulated: true, quoteReference: this.reference(terms, policy.outcome),
      sourceAmount, sourceScale: request.sourceScale, targetAmount: terms.targetAmount,
      targetScale: terms.targetScale, targetUnit: terms.targetUnit,
      termsReference: request.integration.termsReference, termsRevision: request.integration.termsRevision,
      expiresAt: new Date(this.now().getTime() + policy.quoteLifetimeMs) };
  },

  /**
   * Replays the frozen simulation, including after restart or configuration changes.
   * @param {Object} request Retained owner snapshot including quote reference.
   * @returns {Promise<Object>} Simulated outcome/receipt, never real partner credit.
   * @throws {Error} Altered terms, non-simulation or malformed references refuse.
   */
  execute: async function (request) {
    const outcome = request.quoteReference?.split(":")[1];
    if (request.simulated !== true || typeof outcome !== "string" ||
        ENUMS.LoyaltyPartnerCreditOutcome[outcome]?.key !== outcome ||
        request.quoteReference !== this.reference(request, outcome)) this.owner().fail("PROVIDER");
    return { simulated: true, status: outcome, operationReference: request.operationReference,
      integrationCode: request.integration.code, partnerEnterpriseCode: request.integration.partnerEnterpriseCode,
      accountReference: request.account.accountReference, targetAmount: request.targetAmount,
      targetUnit: request.targetUnit, providerReference: request.quoteReference,
      ...(outcome === ENUMS.LoyaltyPartnerCreditOutcome.NOT_CREDITED.key ? { cannotCredit: true } : {}) };
  },

  /**
   * Recovers the deterministic simulated outcome without sending or stored maps.
   * @param {Object} request Retained private owner snapshot.
   * @returns {Promise<Object>} Same receipt as execute; same refusal contract.
   */
  reconcile: function (request) { return this.execute(request); },
};
