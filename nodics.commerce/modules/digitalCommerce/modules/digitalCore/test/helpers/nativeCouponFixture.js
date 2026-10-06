/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/**
 * @module digitalCore/test/helpers/nativeCouponFixture
 * @description Provisions a synthetic delivered coupon through native lifecycle owners in an explicitly disposable runtime.
 * @layer test
 * @owner digitalCore
 * @sideEffects Writes only owner-managed records in the selected isolated acceptance database. Does not qualify payment or publication.
 */
module.exports = {
  /** Seeds once, preserving original purchase and redemption evidence on restart. */
  provision: async function () {
    const fixture = CONFIG.get("copilotAcceptance");
    const database = CONFIG.get("database").default.mongodb.master.databaseName;
    if (
      fixture?.withCouponActions !== true ||
      CONFIG.get("runtimeRole")?.code !== "COMMERCE" ||
      !/^nodics_erasure_test_[a-f0-9]{32}$/.test(database)
    )
      throw new Error("Owned disposable coupon runtime required");
    const promotion = SERVICE.DefaultPromotionOperationService;
    const digital = SERVICE.DefaultDigitalCommerceEntitlementService;
    const request = {
      tenant: "default",
      enterpriseCode: "default",
      ownerId: "acceptance_buyer",
      idempotencyKey: "acceptance_coupon_purchase",
      correlationId: "acceptance_coupon_purchase",
      authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
      options: { recursive: false, skipItemCache: true },
    };
    const existing = await digital.listEntitlements(request, {
      orderCode: "acceptance_order",
    });
    if (existing.length) {
      if (existing.length !== 1 || existing[0].ownerId !== request.ownerId)
        throw new Error("Unexpected coupon fixture identity");
      return;
    }
    const campaign = await SERVICE.DefaultPromotionService.save({
      ...request,
      model: promotion.withSchemaBase(
        {
          code: "acceptance_campaign",
          name: "Acceptance admission benefit",
          tenant: request.tenant,
          status: "ACTIVE",
          priority: 0,
          conditions: {},
          actions: {},
          revision: 0,
        },
        request,
      ),
    });
    promotion.assertLifecycleEnvelope(campaign);
    const issued = await promotion.createCouponBatch({
      ...request,
      payload: {
        code: "acceptance_batch",
        promotionCode: "acceptance_campaign",
        couponCodes: ["ACCEPTANCE-COUPON-SECRET"],
      },
    });
    const purchase = {
      ...request,
      payload: {
        batchCode: issued.batch.code,
        orderCode: "acceptance_order",
        productCode: "acceptance_product",
        entryCode: "acceptance_entry",
      },
    };
    const reserved = await promotion.reserveCouponCodeForCheckout(purchase);
    purchase.payload.couponCode = reserved.code;
    const sold = await promotion.confirmCouponCodeSale(purchase);
    await digital.createFromCouponSales(
      purchase,
      { code: "acceptance_order" },
      [sold],
    );
    const delivered = await promotion.deliverCouponCodeSale(purchase);
    await digital.recordDeliveries(purchase, { code: "acceptance_order" }, [
      delivered,
    ]);
  },
};
