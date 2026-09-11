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
  /** Rejects used coupons and mixed or incomplete digital orders before any refund effect. */
  preview: async function (r) {
    const items = await this.items(r);
    if (!items.length)
      return { eligible: false, reason: "NO_DIGITAL_ENTITLEMENT" };
    if (
      r.entries.some(
        (e) =>
          items.filter((i) => i.productCode === e.productCode).length !==
          Number(e.quantity),
      )
    )
      return { eligible: false, reason: "MIXED_OR_INCOMPLETE_DIGITAL_ORDER" };
    for (const item of items) {
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
    for (let item of await this.items(r)) {
      if (
        item.evidence?.refundCode &&
        item.evidence.refundCode !== r.refundCode
      )
        throw new Error("Entitlement belongs to another refund");
      if (!item.evidence?.refundCode) {
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
    for (const item of await this.items(r)) {
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
      await SERVICE.DefaultDigitalReversalService.save({
        tenant: r.tenant,
        authData: owner.serviceAuthData(r),
        query: { code },
        model: owner.persistenceModel({
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
        }),
      });
    }
    return { status: "COMPLETED" };
  },
};
