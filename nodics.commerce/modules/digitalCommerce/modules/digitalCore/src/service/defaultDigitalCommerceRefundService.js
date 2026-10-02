/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module digitalCore/service/defaultDigitalCommerceRefundService @description Supplies unused-coupon refund eligibility and recoverable revocation ports to Order while Promotion owns code revocation. @layer service @owner digitalCore */
module.exports = {
  /** Resolves purchased entitlements under the original order and customer. */
  items: function (r) {
    return SERVICE.DefaultDigitalCommerceEntitlementService.listEntitlements(
      r,
      { orderCode: r.orderCode, ownerId: r.ownerId },
    );
  },
  /** Verifies the complete bounded purchase-unit multiset before any reversal phase. @param {Object} r Owner-resolved order context. @param {Array} items Current entitlements. @returns {boolean} Exact product quantities with unique unit identities. */
  matchesPurchaseUnits: function (r, items) {
    if (
      [r.tenant, r.ownerId, r.orderCode].some(
        (value) => typeof value !== "string" || !value,
      )
    )
      return false;
    if (
      !Array.isArray(r.entries) ||
      !r.entries.length ||
      !Array.isArray(items) ||
      !items.length ||
      items.length > 100
    )
      return false;
    const expected = new Map();
    let quantity = 0;
    for (const entry of r.entries) {
      const count = Number(entry.quantity);
      if (
        !["string", "number"].includes(typeof entry.quantity) ||
        typeof entry.productCode !== "string" ||
        !entry.productCode ||
        !Number.isSafeInteger(count) ||
        count < 1 ||
        count > 100
      )
        return false;
      quantity += count;
      if (quantity > 100) return false;
      expected.set(
        entry.productCode,
        (expected.get(entry.productCode) || 0) + count,
      );
    }
    if (quantity !== items.length) return false;
    const codes = new Set(),
      providers = new Set();
    for (const item of items) {
      if (
        !item ||
        item.tenant !== r.tenant ||
        item.enterpriseCode !== r.enterpriseCode ||
        item.ownerId !== r.ownerId ||
        item.orderCode !== r.orderCode ||
        item.providerOwner !== "promotion" ||
        typeof item.code !== "string" ||
        !item.code ||
        typeof item.providerCode !== "string" ||
        !item.providerCode ||
        codes.has(item.code) ||
        providers.has(item.providerCode) ||
        !expected.has(item.productCode)
      )
        return false;
      codes.add(item.code);
      providers.add(item.providerCode);
      expected.set(item.productCode, expected.get(item.productCode) - 1);
    }
    return [...expected.values()].every((count) => count === 0);
  },
  /** Rejects used coupons and mixed or incomplete digital orders before any refund effect. */
  preview: async function (r) {
    const items = await this.items(r);
    if (!items.length)
      return { eligible: false, reason: "NO_DIGITAL_ENTITLEMENT" };
    if (!this.matchesPurchaseUnits(r, items))
      return { eligible: false, reason: "MIXED_OR_INCOMPLETE_DIGITAL_ORDER" };
    for (const item of items) {
      if (
        !SERVICE.DefaultDigitalCommerceEntitlementService.revocationPolicy(
          item,
          "REFUND",
        ).refundable
      )
        return {
          eligible: false,
          reason: "PURCHASE_REFUND_POLICY_REQUIRES_REVIEW",
        };
      if (
        item.status !== "ACTIVE" ||
        item.claimStatus !== "UNCLAIMED" ||
        item.evidence?.merchantRedemption
      )
        return { eligible: false, reason: "COUPON_CLAIMED_OR_USED" };
    }
    return {
      eligible: true,
      kind: "DIGITAL_COUPON",
      summary:
        "Revoke unused coupons and refund the original captured payment.",
      entitlementCodes: items.map((i) => i.code),
    };
  },
  /** Locks every entitlement and asks Promotion to lock its unused purchased code before refunding payment. */
  prepare: async function (r) {
    const owner = SERVICE.DefaultDigitalCommerceEntitlementService;
    const items = await this.items(r);
    if (!this.matchesPurchaseUnits(r, items))
      throw new Error(
        "Digital order units are incomplete or ambiguous; manual review is required",
      );
    for (let item of items) {
      if (
        item.evidence?.refundCode &&
        item.evidence.refundCode !== r.refundCode
      )
        throw new Error("Entitlement belongs to another refund");
      if (!item.evidence?.refundCode) {
        if (!owner.revocationPolicy(item, "REFUND").refundable)
          throw new Error(
            "Purchase refund policy changed; manual review is required",
          );
        if (
          item.status !== "ACTIVE" ||
          item.claimStatus !== "UNCLAIMED" ||
          item.evidence?.merchantRedemption
        )
          throw new Error(
            "Coupon claim changed; manual resolution is required",
          );
        await owner.update(SERVICE.DefaultDigitalEntitlementService, r, item, {
          status: "REFUND_PENDING",
          evidence: { ...item.evidence, refundCode: r.refundCode },
        });
        item = (await this.items(r)).find((i) => i.code === item.code);
      }
      if (item.evidence?.refundCode !== r.refundCode)
        throw new Error("Entitlement refund lock changed");
      await SERVICE.DefaultPromotionOperationService.revokePurchasedCoupon({
        ...r,
        couponCode: item.providerCode,
      });
    }
    return { status: "PREPARED" };
  },
  /** Digital coupons have no seller or asset settlement in this provider. */
  settle: async function () {
    return { status: "COMPLETED" };
  },
  /** Completes Promotion revocation and keeps linked immutable entitlement reversal evidence. */
  complete: async function (r) {
    const owner = SERVICE.DefaultDigitalCommerceEntitlementService;
    const items = await this.items(r);
    if (!this.matchesPurchaseUnits(r, items))
      throw new Error(
        "Digital order units are incomplete or ambiguous; manual review is required",
      );
    for (const item of items) {
      if (item.evidence?.refundCode !== r.refundCode)
        throw new Error("The entitlement was not prepared for this refund");
      await SERVICE.DefaultPromotionOperationService.revokePurchasedCoupon({
        ...r,
        couponCode: item.providerCode,
        complete: true,
      });
      if (item.status !== "REVOKED")
        await owner.update(SERVICE.DefaultDigitalEntitlementService, r, item, {
          status: "REVOKED",
          revokedAt: new Date(),
        });
      const code = "refund:" + item.code;
      const reversal = await owner.save(
        SERVICE.DefaultDigitalReversalService,
        r,
        {
          code,
          tenant: r.tenant,
          enterpriseCode: r.enterpriseCode,
          ownerId: r.ownerId,
          entitlementCode: item.code,
          orderCode: r.orderCode,
          requestType: "REFUND",
          policyDecision: "REVOKE_AND_REFUND",
          reasonCode: "APPROVED_UNUSED_COUPON_REFUND",
          status: "COMPLETED",
          revision: 0,
          idempotencyKey: r.refundCode,
          correlationId: r.correlationId || r.refundCode,
          decidedAt: new Date(),
          evidence: { refundCode: r.refundCode },
        },
      );
      if (
        reversal.status !== "COMPLETED" ||
        reversal.evidence?.refundCode !== r.refundCode
      )
        throw new Error("Digital reversal completion is not confirmed");
    }
    return { status: "COMPLETED" };
  },
};
