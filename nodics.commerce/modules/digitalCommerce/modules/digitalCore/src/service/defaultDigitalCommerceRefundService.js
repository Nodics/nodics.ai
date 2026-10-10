/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module digitalCore/service/defaultDigitalCommerceRefundService @description Supplies Order refund ports for unused coupons and exact original digital-ownership sales while retaining Promotion and domain-owner authority. @layer service @owner digitalCore */
module.exports = {
  /** Reads exactly one original unused promotion unit for Order's separately audited missing-policy exception. No terms are changed. */
  exceptionCandidate: async function (r, phase) {
    const fail = () => { throw new CLASSES.NodicsError("ERR_ORDER_REFUND_EXCEPTION"); };
    const read = async (service, query, authData) => {
      const response = await service?.get?.({ tenant: r.tenant, authData, query,
        options: { recursive: false, skipItemCache: true }, searchOptions: { pageSize: 3, pageNumber: 1 } });
      if (!response || typeof response.code !== "string" || !/^SUC_/.test(response.code) || response.error ||
          response.success === false || response.acknowledged === false ||
          (response.errors !== undefined && (!Array.isArray(response.errors) || response.errors.length)) ||
          !Array.isArray(response.result) || response.result.length !== 1 || response.count !== 1 ||
          [response.total, response.totalCount].some(n => n !== undefined && n !== 1) ||
          Object.entries(query).some(([key, value]) => response.result[0]?.[key] !== value)) fail();
      return response.result[0];
    };
    const item = await read(SERVICE.DefaultDigitalEntitlementService,
      { tenant: r.tenant, enterpriseCode: r.enterpriseCode, ownerId: r.ownerId, orderCode: r.orderCode },
      SERVICE.DefaultDigitalCommerceEntitlementService.serviceAuthData(r));
    const initial = ["adjudicate", "preview"].includes(phase), locked = !!item.evidence?.refundCode;
    if (!this.matchesPurchaseUnits(r, [item]) || item.digitalDeliveryType !== "COUPON_CODE" ||
        !item.purchasePolicy || typeof item.purchasePolicy !== "object" || Array.isArray(item.purchasePolicy) ||
        "refundPolicy" in item.purchasePolicy || item.claimStatus !== "UNCLAIMED" || item.evidence?.merchantRedemption ||
        !["ACTIVE", "REFUND_PENDING", "REVOKED"].includes(item.status) ||
        (initial ? item.status !== "ACTIVE" || locked : locked && item.evidence.refundCode !== r.refundCode) ||
        (!locked && item.status !== "ACTIVE") || !Number.isFinite(Date.parse(item.purchasedAt)) ||
        !Number.isFinite(Date.parse(item.validTo)) || (!locked && Date.parse(item.validTo) <= Date.now()) ||
        r.entries.length !== 1 || r.entries[0].sku !== item.sku ||
        [item.code, item.providerCode, item.productCode, item.sku].some(value => typeof value !== "string" || !value)) fail();
    const promotion = SERVICE.DefaultPromotionOperationService;
    const coupon = await read(SERVICE.DefaultCouponService, { tenant: r.tenant, code: item.providerCode }, promotion.serviceAuthData(r));
    promotion.purchasedCampaign(coupon);
    if (typeof coupon.enterpriseCode !== "string" || !coupon.enterpriseCode ||
        promotion.withEnterpriseAssociations(coupon, r).enterpriseCode !== coupon.enterpriseCode ||
        coupon.soldTo !== r.ownerId || coupon.orderCode !== r.orderCode ||
        coupon.productCode !== item.productCode || coupon.sku !== item.sku ||
        !["UNCLAIMED", undefined].includes(coupon.benefitStatus) || coupon.redeemedAt || coupon.claimedAt || coupon.merchantRedemption ||
        !["DELIVERED", "REFUND_PENDING", "REVOKED"].includes(coupon.status) ||
        (initial ? coupon.status !== "DELIVERED" || coupon.refundReference : coupon.refundReference && coupon.refundReference !== r.refundCode) ||
        (coupon.status !== "DELIVERED" && coupon.refundReference !== r.refundCode) ||
        SERVICE.DefaultOrderRefundExceptionService.digest(coupon.purchasePolicy) !== SERVICE.DefaultOrderRefundExceptionService.digest(item.purchasePolicy)) fail();
    return { entitlementCode: item.code, couponCode: item.providerCode, productCode: item.productCode, sku: item.sku,
      policyHash: SERVICE.DefaultOrderRefundExceptionService.digest({ purchasePolicy: item.purchasePolicy,
        purchasedAt: new Date(item.purchasedAt).toISOString(), validTo: new Date(item.validTo).toISOString(),
        productCode: item.productCode, sku: item.sku, entitlementCode: item.code, couponCode: item.providerCode,
        stockEnterpriseCode: coupon.enterpriseCode }) };
  },
  /** Requires exact private Order phase admission; public flags and cloned requests cannot confer an exception. */
  exceptionAuthority: async function (r, phase) {
    return SERVICE.DefaultOrderRefundRecoveryService?.exceptionAuthority?.(r, phase);
  },
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
  /** Dispatches exact ownership purchases or rejects used coupons and mixed/incomplete digital orders before any refund effect. */
  preview: async function (r) {
    const exception = await this.exceptionAuthority(r, "preview");
    const items = await this.items(r);
    if (items.some(item => item.digitalDeliveryType === "DIGITAL_OWNERSHIP"))
      return SERVICE.DefaultDigitalCommerceOwnershipService.refund(r, items, "preview");
    if (!items.length)
      return { eligible: false, reason: "NO_DIGITAL_ENTITLEMENT" };
    if (!this.matchesPurchaseUnits(r, items))
      return { eligible: false, reason: "MIXED_OR_INCOMPLETE_DIGITAL_ORDER" };
    for (const item of items) {
      if (
        !SERVICE.DefaultDigitalCommerceEntitlementService.revocationPolicy(
          item,
          "REFUND",
        ).refundable && !exception
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
      ...(exception ? { policyException: exception } : {}),
    };
  },
  /** Locks every entitlement and asks Promotion to lock its unused purchased code before refunding payment. */
  prepare: async function (r) {
    const exception = await this.exceptionAuthority(r, "prepare");
    const owner = SERVICE.DefaultDigitalCommerceEntitlementService;
    const items = await this.items(r);
    if (items.some(item => item.digitalDeliveryType === "DIGITAL_OWNERSHIP"))
      return SERVICE.DefaultDigitalCommerceOwnershipService.refund(r, items, "prepare");
    if (!this.matchesPurchaseUnits(r, items))
      throw new Error(
        "Digital order units are incomplete or ambiguous; manual review is required",
      );
    for (let item of items) {
      if (item.evidence?.refundPolicyException && !exception)
        throw new CLASSES.NodicsError("ERR_ORDER_REFUND_EXCEPTION");
      if (
        item.evidence?.refundCode &&
        item.evidence.refundCode !== r.refundCode
      )
        throw new Error("Entitlement belongs to another refund");
      if (!item.evidence?.refundCode) {
        if (!owner.revocationPolicy(item, "REFUND").refundable && !exception)
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
          evidence: { ...item.evidence, refundCode: r.refundCode, ...(exception ? { refundPolicyException: exception } : {}) },
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
  /** Delegates original asset settlement; exact coupon purchases have no seller settlement. */
  settle: async function (r) {
    const exception = await this.exceptionAuthority(r, "settle");
    const items = await this.items(r);
    if (items.some(item => item.evidence?.refundPolicyException) && !exception)
      throw new CLASSES.NodicsError("ERR_ORDER_REFUND_EXCEPTION");
    if (items.some(item => item.digitalDeliveryType === "DIGITAL_OWNERSHIP"))
      return SERVICE.DefaultDigitalCommerceOwnershipService.refund(r, items, "settle");
    if (!this.matchesPurchaseUnits(r, items))
      throw new Error("Digital order units are incomplete or ambiguous; manual review is required");
    return { status: "COMPLETED" };
  },
  /** Completes Promotion revocation and keeps linked immutable entitlement reversal evidence. */
  complete: async function (r) {
    const exception = await this.exceptionAuthority(r, "complete");
    const owner = SERVICE.DefaultDigitalCommerceEntitlementService;
    const items = await this.items(r);
    if (items.some(item => item.evidence?.refundPolicyException) && !exception)
      throw new CLASSES.NodicsError("ERR_ORDER_REFUND_EXCEPTION");
    if (items.some(item => item.digitalDeliveryType === "DIGITAL_OWNERSHIP"))
      return SERVICE.DefaultDigitalCommerceOwnershipService.refund(r, items, "complete");
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
