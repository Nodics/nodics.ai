/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/**
 * @module profile/service/customer/DefaultCustomerEligibilityRuleOutcomeService
 * @description Registers declarative Profile eligibility ALLOW/DENY outcomes in the existing Rules registry; definitions never create approvals, policies, credentials or KYC certificates.
 * @layer service
 * @owner profile
 * @override Later layers may tighten exported validators; retain explicit matched-policy approval and denial precedence in the consumer.
 */
module.exports = {
  /** Validates an inert outcome with no authority-bearing payload. @param {Object} outcome Rules declaration. @param {string} code Fixed type. @returns {Object} Validation result. */
  validate: function (outcome, code) {
    const valid =
      outcome?.outcomeType === code &&
      Object.keys(outcome).every((key) =>
        ["outcomeType", "parameters"].includes(key),
      ) &&
      (outcome.parameters === undefined ||
        (outcome.parameters !== null &&
          typeof outcome.parameters === "object" &&
          !Array.isArray(outcome.parameters) &&
          Object.keys(outcome.parameters).length === 0));
    return {
      valid,
      issues: valid ? [] : [{ code: "PROFILE_ELIGIBILITY_OUTCOME_INVALID" }],
    };
  },
  /** Registers stable effective definitions without replacing another registry owner. @returns {Promise<boolean>} Lifecycle completion. */
  init: async function () {
    if (
      typeof SERVICE === "undefined" ||
      !SERVICE.DefaultRuleOutcomeRegistryService
    )
      return true;
    if (!this.definitions)
      this.definitions = Object.fromEntries(
        [
          "PROFILE_CUSTOMER_ELIGIBILITY_ALLOW",
          "PROFILE_CUSTOMER_ELIGIBILITY_DENY",
        ].map((code) => [
          code,
          {
            ownerModule: "profile",
            validate: (outcome) => this.validate(outcome, code),
          },
        ]),
      );
    for (const [code, definition] of Object.entries(this.definitions))
      SERVICE.DefaultRuleOutcomeRegistryService.registerOutcomeType(
        code,
        definition,
      );
    return true;
  },
  /** Ensures registration after registry initialization without creating policy records. @returns {Promise<boolean>} Lifecycle completion. */
  postInit: function () {
    return this.init();
  },
};
