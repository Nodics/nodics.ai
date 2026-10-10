/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const crypto = require("node:crypto");
const { isDeepStrictEqual } = require("node:util");
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
  /** Requires the exact original completed digital sale without intervening ownership, custody or competing locks. */
  digitalEligible: function (asset, event) {
    const d = event.metadata?.digitalSale;
    return asset?.active === true && event.active === true && event.transferType === "SELL" && event.transferStatus === "COMPLETED" &&
      asset.assetStatus === "SOLD" && asset.metadata?.lastTransferCode === event.code &&
      !asset.metadata.pendingTransferCode && !asset.metadata.pendingTransferEvent && !asset.metadata.pendingRefundCode &&
      d?.completedAt === asset.metadata.digitalSaleCompletedAt && Number.isFinite(Date.parse(d.completedAt)) &&
      isDeepStrictEqual(asset.ownerRef, event.toOwnerRef) && isDeepStrictEqual(asset.digitalOwnerRef, event.toOwnerRef);
  },
  /** Verifies the immutable reversal command and its current lock, including the original physical-custody snapshot. */
  digitalState: async function (r, event, command) {
    const owner = SERVICE.DefaultWasteAssetTransferOperationService;
    const asset = await owner.digitalRead(r, "wasteAsset", event.assetCode);
    const reversal = await owner.digitalRead(r, "wasteAssetOwnershipEvent", this.code(event));
    if (r.authData?.principalType !== "service" || !reversal || reversal.active !== true ||
        !isDeepStrictEqual(reversal.metadata?.digitalRefund?.command, command) ||
        reversal.assetCode !== event.assetCode || reversal.transferType !== "REVERSAL" ||
        !["RESERVED", "COMPLETED"].includes(reversal.transferStatus) ||
        !isDeepStrictEqual(reversal.fromOwnerRef, event.toOwnerRef) || !isDeepStrictEqual(reversal.toOwnerRef, event.fromOwnerRef) ||
        !isDeepStrictEqual(reversal.triggerRef, { module: "wasteCore", schema: "wasteAssetOwnershipEvent", code: event.code }) ||
        !isDeepStrictEqual(reversal.commerceOrderRef, event.commerceOrderRef) ||
        asset?.active !== true || asset.metadata?.pendingTransferCode || asset.metadata?.pendingTransferEvent ||
        !isDeepStrictEqual(reversal.metadata.digitalRefund.custody,
          { physicalOwnerRef: asset.physicalOwnerRef ?? null, custodyStatus: asset.custodyStatus ?? null }))
      throw new Error("Original digital refund lock or command changed");
    const buyerHeld = asset.assetStatus === "LOCKED" && asset.metadata.pendingRefundCode === command.refundCode &&
      asset.metadata.lastTransferCode === event.code && isDeepStrictEqual(asset.ownerRef, event.toOwnerRef) &&
      isDeepStrictEqual(asset.digitalOwnerRef, event.toOwnerRef) && asset.metadata.digitalSaleCompletedAt === event.metadata.digitalSale.completedAt;
    const sellerHeld = asset.metadata.lastTransferCode === reversal.code &&
      isDeepStrictEqual(asset.ownerRef, event.fromOwnerRef) && isDeepStrictEqual(asset.digitalOwnerRef, event.fromOwnerRef) &&
      ((asset.assetStatus === "LOCKED" && asset.metadata.pendingRefundCode === command.refundCode) ||
        (asset.assetStatus === "OWNED" && !asset.metadata.pendingRefundCode && reversal.transferStatus === "COMPLETED"));
    if (!buyerHeld && !sellerHeld) throw new Error("Digital asset moved or refund lock changed");
    return { asset, reversal };
  },
  /** Locks the exact original buyer-held sale with CAS before any original seller earning is reversed. */
  prepareDigital: async function (r, event, command) {
    const owner = SERVICE.DefaultWasteAssetTransferOperationService, code = this.code(event);
    if (r.authData?.principalType !== "service" || command.saleCode !== event.code ||
        command.orderCode !== event.metadata?.digitalSale?.command?.orderCode || !command.refundCode)
      throw new Error("Original digital refund command is required");
    let asset = await owner.digitalRead(r, "wasteAsset", event.assetCode);
    const existing = await owner.digitalRead(r, "wasteAssetOwnershipEvent", code);
    if (existing) return (await this.digitalState(r, event, command)).reversal;
    let model = asset?.metadata?.pendingRefundEvent;
    if (asset?.metadata?.pendingRefundCode) {
      if (asset.metadata.pendingRefundCode !== command.refundCode || !isDeepStrictEqual(model?.metadata?.digitalRefund?.command, command))
        throw new Error("Original digital refund acquisition changed");
    } else {
      if (!this.digitalEligible(asset, event)) throw new Error("Digital asset moved or is locked");
      model = { code, assetCode: event.assetCode, fromOwnerRef: event.toOwnerRef, toOwnerRef: event.fromOwnerRef,
        transferType: "REVERSAL", transferStatus: "RESERVED", policyCode: event.policyCode,
        triggerRef: { module: "wasteCore", schema: "wasteAssetOwnershipEvent", code: event.code },
        commerceOrderRef: event.commerceOrderRef, occurredAt: new Date().toISOString(), idempotencyKey: command.refundCode, revision: 0,
        metadata: { refundCode: command.refundCode, reversalOfEventCode: event.code,
          digitalRefund: { command, custody: { physicalOwnerRef: asset.physicalOwnerRef ?? null, custodyStatus: asset.custodyStatus ?? null } } } };
      asset = await owner.digitalUpdate(r, "wasteAsset", asset, { assetStatus: "LOCKED",
        metadata: { ...asset.metadata, pendingRefundCode: command.refundCode, pendingRefundEvent: model } });
    }
    await owner.digitalCreate(r, model);
    return (await this.digitalState(r, event, command)).reversal;
  },
  /** Retains one exact verified seller reversal before acknowledging SETTLE; a missing acknowledgement cannot authorize a new ledger command. */
  settleDigital: async function (r, event, command, sellerReversalRef) {
    const owner = SERVICE.DefaultWasteAssetTransferOperationService;
    const { reversal } = await this.digitalState(r, event, command);
    const retained = reversal.metadata.digitalRefund.sellerReversalRef;
    if (retained && !isDeepStrictEqual(retained, sellerReversalRef)) throw new Error("Original seller reversal changed");
    if (retained) return reversal;
    return owner.digitalUpdate(r, "wasteAssetOwnershipEvent", reversal, { rewardSettlementRefs: [sellerReversalRef], carbonSettlementRefs: [],
      metadata: { ...reversal.metadata, digitalRefund: { ...reversal.metadata.digitalRefund, sellerReversalRef } } });
  },
  /** Restores the original seller only after owner-verified seller reversal and original Payment refund; interrupted writes resume under the same lock. */
  completeDigital: async function (r, event, command, paymentRef) {
    const owner = SERVICE.DefaultWasteAssetTransferOperationService;
    let { asset, reversal } = await this.digitalState(r, event, command);
    const d = reversal.metadata.digitalRefund;
    if (!d.sellerReversalRef || !isDeepStrictEqual(reversal.rewardSettlementRefs, [d.sellerReversalRef]) ||
        !isDeepStrictEqual(reversal.carbonSettlementRefs, []) || !paymentRef?.code)
      throw new Error("Original digital refund settlement is unconfirmed");
    if (d.paymentRef && !isDeepStrictEqual(d.paymentRef, paymentRef)) throw new Error("Original buyer refund changed");
    if (!d.paymentRef) reversal = await owner.digitalUpdate(r, "wasteAssetOwnershipEvent", reversal, {
      metadata: { ...reversal.metadata, digitalRefund: { ...d, paymentRef } } });
    if (asset.metadata.lastTransferCode !== reversal.code)
      asset = await owner.digitalUpdate(r, "wasteAsset", asset, { ownerRef: event.fromOwnerRef, digitalOwnerRef: event.fromOwnerRef,
        metadata: { ...asset.metadata, lastTransferCode: reversal.code, refundedOrderCode: command.orderCode } });
    if (reversal.transferStatus !== "COMPLETED") reversal = await owner.digitalUpdate(r, "wasteAssetOwnershipEvent", reversal,
      { transferStatus: "COMPLETED" });
    if (asset.assetStatus === "LOCKED") await owner.digitalUpdate(r, "wasteAsset", asset, { assetStatus: "OWNED",
      metadata: { ...asset.metadata, pendingRefundCode: null, pendingRefundEvent: null } });
    return (await this.digitalState(r, event, command)).reversal;
  },
};
