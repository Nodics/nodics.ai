/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const crypto = require("node:crypto");
/** @module wasteCore/service/defaultWasteAssetTransferOperationService @description Persists ownership transfer state and optimistic asset locks without owning wallet or payment data. @layer service @owner wasteCore */
module.exports = {
  /** Resolves generated Waste repositories. */
  store: function () {
    return SERVICE.DefaultWastePersistenceService;
  },
  /** Derives one event identity from an authenticated command. */
  eventCode: function (request) {
    return (
      "TRANSFER_" +
      crypto
        .createHash("sha256")
        .update(request.actorRef.code + ":" + request.idempotencyKey)
        .digest("hex")
        .slice(0, 24)
        .toUpperCase()
    );
  },
  /** Locks an eligible asset before external settlement; replays use the recorded command. */
  begin: async function (request) {
    const store = this.store(),
      code = this.eventCode(request),
      asset = await store.one("wasteAsset", request, request.assetCode);
    const fingerprint = crypto
      .createHash("sha256")
      .update(
        JSON.stringify({
          assetCode: request.assetCode,
          type: request.transferType,
          to: request.toOwnerRef,
          price: request.rewardPrice || 0,
        }),
      )
      .digest("hex");
    let event = await store.one("wasteAssetOwnershipEvent", request, code);
    if (event) {
      if (event.metadata.fingerprint !== fingerprint)
        store.fail(
          "ERR_WASTE_COMMAND_CONFLICT",
          "This command was already used for different details",
        );
      return { asset, event };
    }
    if (!asset) store.fail("ERR_WASTE_RECORD_NOT_FOUND", "Asset not found");
    if (
      asset.metadata &&
      asset.metadata.pendingTransferCode === code &&
      asset.metadata.pendingTransferEvent
    ) {
      const saved = asset.metadata.pendingTransferEvent;
      if (saved.metadata.fingerprint !== fingerprint)
        store.fail(
          "ERR_WASTE_COMMAND_CONFLICT",
          "This command was already used for different details",
        );
      event = await store.create(
        "wasteAssetOwnershipEvent",
        request,
        Object.assign({}, saved, { occurredAt: new Date(saved.occurredAt) }),
      );
      return { asset, event };
    }
    if (request.transferType === "GIFT")
      store.owned(asset, request.actorRef, "ownerRef");
    if (asset.ownerRef.code === request.toOwnerRef.code)
      store.fail("ERR_WASTE_SELF_TRANSFER", "Choose a different recipient");
    store.revision(asset, request.expectedRevision);
    const allowed =
      request.transferType === "SELL"
        ? ["LISTED"]
        : ["OWNED", "SOLD", "GIFTED"];
    if (!allowed.includes(asset.assetStatus))
      store.fail(
        "ERR_WASTE_ASSET_BUSY",
        "This asset is not available for this action",
      );
    const eventModel = {
      code,
      assetCode: asset.code,
      fromOwnerRef: asset.ownerRef,
      toOwnerRef: request.toOwnerRef,
      transferType: request.transferType,
      transferStatus: "RESERVED",
      policyCode: request.policyCode,
      occurredAt: new Date(),
      idempotencyKey: request.idempotencyKey,
      revision: 0,
      metadata: {
        fingerprint,
        rewardPrice: request.rewardPrice || 0,
        carbonUnits: Number(
          (asset.metadata && asset.metadata.illustrativeCarbonUnits) || 0,
        ),
        previousStatus: asset.assetStatus,
        offer: request.offer,
      },
    };
    const locked = await store.update("wasteAsset", request, asset, {
      assetStatus:
        request.transferType === "SELL" ? "SALE_PENDING" : "GIFT_PENDING",
      metadata: Object.assign({}, asset.metadata, {
        pendingTransferCode: code,
        pendingTransferEvent: eventModel,
      }),
    });
    event = await store.create("wasteAssetOwnershipEvent", request, eventModel);
    return { asset: locked, event };
  },
  /** Commits ownership after the owning payment and reward services acknowledge settlement. */
  complete: async function (request) {
    const store = this.store(),
      event = await store.one(
        "wasteAssetOwnershipEvent",
        request,
        request.eventCode,
      );
    if (!event)
      store.fail("ERR_WASTE_TRANSFER_NOT_FOUND", "Transfer not found");
    if (event.transferStatus === "COMPLETED") return event;
    let asset = await store.one("wasteAsset", request, event.assetCode);
    if (asset.metadata.pendingTransferCode !== event.code)
      store.fail("ERR_WASTE_TRANSFER_CONFLICT", "Asset transfer changed");
    if (asset.ownerRef.code !== event.toOwnerRef.code)
      asset = await store.update("wasteAsset", request, asset, {
        ownerRef: event.toOwnerRef,
        digitalOwnerRef: event.toOwnerRef,
        assetStatus: event.transferType === "SELL" ? "SOLD" : "GIFTED",
        metadata: Object.assign({}, asset.metadata, {
          lastTransferCode: event.code,
        }),
      });
    return store.update("wasteAssetOwnershipEvent", request, event, {
      transferStatus: "COMPLETED",
      commerceOrderRef: request.commerceOrderRef,
      paymentRef: request.paymentRef,
      carbonSettlementRefs: request.carbonSettlementRefs || [],
      rewardSettlementRefs: request.rewardSettlementRefs || [],
    });
  },
};
