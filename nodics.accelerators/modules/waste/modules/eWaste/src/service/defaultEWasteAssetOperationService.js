/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module eWaste/service/defaultEWasteAssetOperationService @description Coordinates confirmed Waste ownership actions through Profile, Commerce and Loyalty authorities. @layer service @owner eWaste */
module.exports = {
  /** Resolves the owning experience composition boundary. */
  experience: function () {
    return SERVICE.DefaultEWasteExperienceService;
  },
  /** Applies the explicitly configured local transfer policy. */
  policy: function () {
    const p = this.experience().settings().marketplace || {};
    if (!p.transferPolicyCode)
      throw new Error("Asset transfers are not configured");
    return p;
  },
  /** Resolves a recipient through Profile without exposing customer listings. */
  recipient: async function (request) {
    const email = request.payload.recipientEmail;
    if (typeof email !== "string" || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      throw new Error("Enter a recipient email");
    const result = await this.experience().remote(
      request,
      "profile",
      "profile",
      "/customer",
      "POST",
      {
        query: { loginId: email.trim().toLowerCase() },
        searchOptions: { pageSize: 1 },
        options: { recursive: false },
      },
    );
    const customer = Array.isArray(result) ? result[0] : result;
    if (!customer || !customer.code)
      throw new Error("The recipient must have a customer account");
    return { module: "profile", schema: "customer", code: customer.code };
  },
  /** Settles attached carbon and sale proceeds with stable ledger operation keys. */
  settle: async function (request, event) {
    const xp = this.experience(),
      p = this.policy(),
      wallets = [];
    for (const owner of [event.fromOwnerRef, event.toOwnerRef])
      wallets.push(
        await xp.remote(request, "loyaltyApi", "loyalty", "/wallets", "POST", {
          ownerType: "CUSTOMER",
          ownerCode: owner.code,
        }),
      );
    const carbonRefs = [],
      rewardRefs = [];
    if (event.metadata.carbonUnits > 0) {
      const result = await xp.remote(
        request,
        "loyaltyApi",
        "loyalty",
        "/reward-transfers",
        "POST",
        {
          fromWalletCode: wallets[0].code,
          toWalletCode: wallets[1].code,
          programCode: p.programCode,
          rewardTypeCode: p.carbonRewardTypeCode,
          amount: String(event.metadata.carbonUnits),
          scale: p.carbonScale,
          sourceCode: event.code,
          idempotencyKey: event.code + ":carbon",
        },
      );
      for (const code of [result.debitEntryCode, result.creditEntryCode])
        carbonRefs.push({
          module: "loyaltyLedger",
          schema: "rewardLedgerEntry",
          code,
        });
    }
    if (event.transferType === "SELL" && event.metadata.rewardPrice > 0) {
      const result = await xp.remote(
        request,
        "loyaltyApi",
        "loyalty",
        "/reward-earnings",
        "POST",
        {
          walletCode: wallets[0].code,
          programCode: p.programCode,
          rewardTypeCode: p.rewardTypeCode,
          amount: String(event.metadata.rewardPrice),
          scale: p.rewardScale,
          sourceType: "WASTE_ASSET_SALE",
          sourceCode: event.code,
          idempotencyKey: event.code + ":sale-proceeds",
        },
      );
      const entry = xp.unwrap(result.ledgerEntry);
      rewardRefs.push({
        module: "loyaltyLedger",
        schema: "rewardLedgerEntry",
        code: Array.isArray(entry) ? entry[0].code : entry.code,
      });
    }
    await SERVICE.DefaultWasteAssetTransferOperationService.complete(
      Object.assign({}, request, {
        eventCode: event.code,
        carbonSettlementRefs: carbonRefs,
        rewardSettlementRefs: rewardRefs,
        commerceOrderRef: request.commerceOrderCode
          ? {
              module: "order",
              schema: "commerceOrder",
              code: request.commerceOrderCode,
            }
          : undefined,
      }),
    );
    return {
      code: event.code,
      message:
        event.transferType === "GIFT"
          ? "The asset and attached carbon are now with the recipient. Your approval reward points are unchanged."
          : "Ownership and attached carbon have transferred. Sale proceeds are recorded in the seller wallet.",
    };
  },
  /** Confirms a gift from the authenticated current owner. */
  gift: async function (request) {
    const store = this.experience().store(),
      actor = store.customer(request),
      p = this.policy();
    if (request.confirmed !== true || !request.idempotencyKey)
      throw new Error("Review and confirm the gift");
    const recipient = await this.recipient(request);
    const state = await SERVICE.DefaultWasteAssetTransferOperationService.begin(
      Object.assign({}, request, {
        assetCode: request.code,
        actorRef: actor,
        toOwnerRef: recipient,
        transferType: "GIFT",
        policyCode: p.transferPolicyCode,
      }),
    );
    if (state.event.transferStatus === "COMPLETED")
      return {
        code: state.event.code,
        message: "This gift is already complete.",
      };
    return this.settle(request, state.event);
  },
  /** Locks a reviewed offer before Commerce takes payment. */
  reserveSale: async function (request) {
    const owner = this.experience().store().customer(request),
      p = this.policy();
    return SERVICE.DefaultWasteAssetTransferOperationService.begin(
      Object.assign({}, request, {
        assetCode: request.offer.assetCode,
        actorRef: owner,
        toOwnerRef: owner,
        transferType: "SELL",
        rewardPrice: request.offer.rewardPrice,
        policyCode: p.transferPolicyCode,
      }),
    );
  },
  /** Completes an already reserved sale after Commerce confirms its order. */
  completeSale: async function (request) {
    const op = SERVICE.DefaultWasteAssetTransferOperationService,
      owner = this.experience().store().customer(request);
    const event = await this.experience()
      .store()
      .one(
        "wasteAssetOwnershipEvent",
        request,
        op.eventCode(Object.assign({}, request, { actorRef: owner })),
      );
    if (!event || event.toOwnerRef.code !== owner.code)
      throw new Error("Sale reservation not found");
    return this.settle(request, event);
  },
};
