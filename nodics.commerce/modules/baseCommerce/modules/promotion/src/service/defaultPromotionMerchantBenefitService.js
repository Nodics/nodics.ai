/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module promotion/service/defaultPromotionMerchantBenefitService @description Validates monetary coupon actions against independently qualified owner-priced evidence, never browser subtotal or display copy. @layer service @owner promotion @override Later Promotion layers supply an owning evidence adapter; retain exact arithmetic, source binding and unsupported-action refusal. */
module.exports = {
  /** Identifies whether an explicitly enabled owner-priced merchant path is selected. @returns {boolean} Selected flag. */
  enabled: function () {
    return CONFIG.get("promotion")?.merchantBenefits?.enabled === true;
  },
  /** Requires bounded exact positive monetary values without number coercion. @param {*} value Declared amount. @param {boolean} zero Allow zero. @returns {string} Canonical amount. */
  amount: function (value, zero = false) {
    const exact = SERVICE.DefaultExactAmountService;
    if (
      !exact ||
      typeof value !== "string" ||
      !/^\d{1,18}(\.\d{1,8})?$/.test(value) ||
      exact.compare(value, "0") < (zero ? 0 : 1)
    )
      throw new CLASSES.NodicsError(
        "ERR_PROMOTION_BENEFIT_UNCONFIRMED",
        "Merchant benefit amount is invalid",
      );
    return exact.normalize(value);
  },
  /** Calculates only supported retained monetary terms using exact owner arithmetic. @param {string} subtotalAmount Canonical priced subtotal. @param {Object} terms Validated retained terms. @returns {string} Discount, not settlement. */
  calculate: function (subtotalAmount, terms) {
    const exact = SERVICE.DefaultExactAmountService,
      subtotal = this.amount(subtotalAmount, true),
      declared = this.amount(terms.declared);
    if (
      typeof terms.percent !== "boolean" ||
      (terms.percent && exact.compare(declared, "100") > 0)
    )
      throw new CLASSES.NodicsError("ERR_PROMOTION_BENEFIT_UNCONFIRMED");
    if (
      terms.minimum !== undefined &&
      exact.compare(subtotal, this.amount(terms.minimum, true)) < 0
    )
      throw new CLASSES.NodicsError("ERR_PROMOTION_BENEFIT_UNCONFIRMED");
    let discount = terms.percent
      ? exact.multiply(exact.multiply(subtotal, declared), "0.01")
      : declared;
    if (terms.cap !== undefined) {
      const cap = this.amount(terms.cap);
      if (exact.compare(discount, cap) > 0) discount = cap;
    }
    if (exact.compare(discount, subtotal) > 0)
      throw new CLASSES.NodicsError("ERR_PROMOTION_BENEFIT_UNCONFIRMED");
    return exact.normalize(discount);
  },
  /** Verifies fixed/percentage/capped monetary benefits from an authoritative priced source. SKU bundles remain refused without their dedicated owning implementation. @param {Object} r Merchant context. @param {Object} campaign Retained campaign. @param {Object} coupon Purchased unit. @returns {Promise<Object|undefined>} Bound validated benefit. */
  validate: async function (r, campaign, coupon) {
    if (!this.enabled()) return undefined;
    const p = CONFIG.get("promotion").merchantBenefits,
      action = campaign.actions || {},
      conditions = campaign.conditions || {},
      exact = SERVICE.DefaultExactAmountService;
    if (
      p.qualified !== true ||
      !/^[A-Za-z][A-Za-z0-9_]{0,127}$/.test(p.evidenceService || "") ||
      typeof SERVICE[p.evidenceService]?.evaluate !== "function" ||
      Object.keys(action).some(
        (k) =>
          ![
            "discountType",
            "discountValue",
            "percent",
            "discountAmount",
            "maximumDiscountAmount",
            "reasonCode",
            "exclusionGroup",
          ].includes(k),
      )
    )
      throw new CLASSES.NodicsError(
        "ERR_PROMOTION_BENEFIT_UNCONFIRMED",
        "Merchant benefit owner is unavailable or unsupported",
      );
    const percent =
      String(action.discountType || "").toUpperCase() === "PERCENT";
    if (
      action.discountType &&
      !["PERCENT", "FIXED", "AMOUNT"].includes(
        String(action.discountType).toUpperCase(),
      )
    )
      throw new CLASSES.NodicsError(
        "ERR_PROMOTION_BENEFIT_UNCONFIRMED",
        "Merchant benefit type is unsupported",
      );
    if (percent && action.discountAmount !== undefined)
      throw new CLASSES.NodicsError(
        "ERR_PROMOTION_BENEFIT_UNCONFIRMED",
        "Percentage and fixed discount declarations cannot be combined",
      );
    if (
      percent &&
      action.discountValue !== undefined &&
      action.percent !== undefined &&
      action.discountValue !== action.percent
    )
      throw new CLASSES.NodicsError(
        "ERR_PROMOTION_BENEFIT_UNCONFIRMED",
        "Percentage discount declarations conflict",
      );
    const declared = this.amount(
      percent
        ? (action.discountValue ?? action.percent)
        : action.discountAmount,
    );
    if (percent && exact.compare(declared, "100") > 0)
      throw new CLASSES.NodicsError(
        "ERR_PROMOTION_BENEFIT_UNCONFIRMED",
        "Merchant percentage exceeds one hundred",
      );
    const cap =
      action.maximumDiscountAmount !== undefined
        ? this.amount(action.maximumDiscountAmount)
        : undefined;
    const minimum =
      conditions.minimumSubtotal !== undefined
        ? this.amount(conditions.minimumSubtotal, true)
        : undefined;
    const proof = await SERVICE[p.evidenceService].evaluate({
      tenant: r.tenant,
      enterpriseCode: r.enterpriseCode,
      issuerEnterpriseRef: coupon.issuerEnterpriseRef,
      ownerId: coupon.soldTo,
      couponCode: coupon.code,
      promotionCode: coupon.promotionCode,
      promotionRevision: campaign.promotionRevision ?? campaign.revision,
      storeCode: r.storeCode,
      merchantReceiptReference: r.payload?.merchantReceiptReference,
      benefitTerms: { percent, declared, cap, minimum },
    });
    if (
      proof?.eligible !== true ||
      proof.verified !== true ||
      proof.tenant !== r.tenant ||
      proof.enterpriseCode !== r.enterpriseCode ||
      proof.ownerId !== coupon.soldTo ||
      proof.couponCode !== coupon.code ||
      proof.promotionCode !== coupon.promotionCode ||
      proof.promotionRevision !==
        (campaign.promotionRevision ?? campaign.revision) ||
      proof.storeCode !== r.storeCode ||
      proof.sourceType !== "PRICED_TRANSACTION" ||
      typeof proof.sourceReference !== "string" ||
      !/^[A-Za-z0-9_.:@-]{1,128}$/.test(proof.sourceReference) ||
      typeof proof.currency !== "string" ||
      !/^[A-Z]{3}$/.test(proof.currency)
    )
      throw new CLASSES.NodicsError(
        "ERR_PROMOTION_BENEFIT_UNCONFIRMED",
        "Authoritative merchant-priced evidence is required",
      );
    if (
      proof.sourceStage === "PRICED_CART" &&
      (!/^[a-f0-9]{64}$/.test(proof.sourceHash || "") ||
        !Number.isSafeInteger(proof.sourceRevision) ||
        proof.sourceRevision < 0 ||
        !Number.isSafeInteger(proof.storeRevision) ||
        proof.storeRevision < 1)
    )
      throw new CLASSES.NodicsError("ERR_PROMOTION_BENEFIT_UNCONFIRMED");
    const subtotal = this.amount(proof.subtotalAmount, true);
    if (minimum && exact.compare(subtotal, minimum) < 0)
      throw new CLASSES.NodicsError(
        "ERR_PROMOTION_BENEFIT_UNCONFIRMED",
        "Merchant minimum spend is not met",
      );
    let discount = percent
      ? exact.multiply(exact.multiply(subtotal, declared), "0.01")
      : declared;
    if (cap && exact.compare(discount, cap) > 0) discount = cap;
    if (
      exact.compare(discount, subtotal) > 0 ||
      exact.compare(this.amount(proof.discountAmount, true), discount) !== 0
    )
      throw new CLASSES.NodicsError(
        "ERR_PROMOTION_BENEFIT_UNCONFIRMED",
        "Authoritative merchant discount does not match purchased rights",
      );
    return {
      sourceReference: proof.sourceReference,
      currency: proof.currency,
      discountAmount: exact.normalize(discount),
      ...(proof.sourceStage === "PRICED_CART"
        ? {
            sourceStage: proof.sourceStage,
            sourceHash: proof.sourceHash,
            sourceRevision: proof.sourceRevision,
            storeCode: proof.storeCode,
            storeRevision: proof.storeRevision,
            subtotalAmount: subtotal,
          }
        : {}),
    };
  },
};
