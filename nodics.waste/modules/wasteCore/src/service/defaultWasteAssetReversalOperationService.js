/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const crypto = require("node:crypto");
/** @module wasteCore/service/defaultWasteAssetReversalOperationService @description Locks a completed sale's current asset and records a linked ownership reversal after external settlement, without owning rewards or payment. @layer service @owner wasteCore */
module.exports = {
  /** Derives a single reversal identity from the original sale event. */
  code: function (event) {
    return (
      "REVERSAL_" +
      crypto
        .createHash("sha256")
        .update(event.code)
        .digest("hex")
        .slice(0, 28)
        .toUpperCase()
    );
  },
  /** Verifies current ownership still matches the original sale and no later transfer or lock intervened. */
  eligible: function (asset, event) {
    return (
      event.transferType === "SELL" &&
      event.transferStatus === "COMPLETED" &&
      asset.assetStatus === "SOLD" &&
      asset.ownerRef?.code === event.toOwnerRef.code &&
      asset.ownerRef?.schema === event.toOwnerRef.schema &&
      asset.metadata?.lastTransferCode === event.code
    );
  },
  /** Locks the asset through its revision before Loyalty or Payment make reversal effects. */
  prepare: async function (r, event) {
    const store = SERVICE.DefaultWastePersistenceService,
      code = this.code(event);
    let asset = await store.one("wasteAsset", r, event.assetCode),
      existing = await store.one("wasteAssetOwnershipEvent", r, code);
    if (existing) {
      if (existing.metadata.refundCode !== r.refundCode)
        throw new Error("Asset reversal belongs to another order refund");
      return existing;
    }
    if (asset.metadata?.pendingRefundCode !== r.refundCode) {
      if (!this.eligible(asset, event))
        throw new Error(
          "The asset has moved or is locked; manual resolution is required",
        );
      asset = await store.update("wasteAsset", r, asset, {
        assetStatus: "LOCKED",
        metadata: { ...asset.metadata, pendingRefundCode: r.refundCode },
      });
    }
    if (asset.metadata?.pendingRefundCode !== r.refundCode)
      throw new Error("Asset reversal lock changed");
    return store.create("wasteAssetOwnershipEvent", r, {
      code,
      assetCode: event.assetCode,
      fromOwnerRef: event.toOwnerRef,
      toOwnerRef: event.fromOwnerRef,
      transferType: "REVERSAL",
      transferStatus: "RESERVED",
      policyCode: r.policyCode,
      triggerRef: {
        module: "wasteCore",
        schema: "wasteAssetOwnershipEvent",
        code: event.code,
      },
      commerceOrderRef: event.commerceOrderRef,
      occurredAt: new Date(),
      idempotencyKey: r.refundCode,
      revision: 0,
      metadata: { refundCode: r.refundCode, reversalOfEventCode: event.code },
    });
  },
  /** Restores the former digital owner only after the payment and domain settlement have completed. */
  complete: async function (r, event) {
    const store = SERVICE.DefaultWastePersistenceService,
      code = this.code(event);
    let reversal = await store.one("wasteAssetOwnershipEvent", r, code);
    if (!reversal || reversal.metadata.refundCode !== r.refundCode)
      throw new Error("An asset reversal reservation is required");
    if (reversal.transferStatus === "COMPLETED") return reversal;
    const asset = await store.one("wasteAsset", r, event.assetCode);
    if (asset.metadata?.pendingRefundCode !== r.refundCode)
      throw new Error("Asset reversal lock changed");
    if (asset.metadata?.lastTransferCode !== code)
      await store.update("wasteAsset", r, asset, {
        assetStatus: "OWNED",
        ownerRef: event.fromOwnerRef,
        digitalOwnerRef: event.fromOwnerRef,
        metadata: {
          ...asset.metadata,
          lastTransferCode: code,
          pendingTransferCode: null,
          pendingTransferEvent: null,
          pendingRefundCode: r.refundCode,
          refundedOrderCode: r.orderCode,
        },
      });
    return store.update("wasteAssetOwnershipEvent", r, reversal, {
      transferStatus: "COMPLETED",
      rewardSettlementRefs: r.rewardSettlementRefs || [],
      carbonSettlementRefs: r.carbonSettlementRefs || [],
    });
  },
};
