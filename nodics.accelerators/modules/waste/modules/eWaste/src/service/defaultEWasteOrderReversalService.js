/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module eWaste/service/defaultEWasteOrderReversalService @description Supplies Waste sale reversal ports to Commerce Order by coordinating original ownership-event and Loyalty ledger references; original submission rewards remain unchanged. @layer service @owner eWaste */
module.exports = {
  /** Authorizes only internal Commerce orchestration under a configured digital-sale policy. */
  context: function (input) {
    if (input.authData?.principalType !== "service")
      throw new Error("An internal service identity is required");
    const p = input.payload || {},
      settings =
        SERVICE.DefaultEWasteExperienceService.settings().marketplace || {};
    if (
      !settings.refundsEnabled ||
      !p.orderCode?.startsWith(settings.orderCodePrefix) ||
      !p.refundCode ||
      !p.ownerId
    )
      throw new Error("This digital sale refund is not configured");
    return {
      ...input,
      ...p,
      payload: undefined,
      policyCode: settings.transferPolicyCode,
    };
  },
  /** Reads the original completed sale using its Commerce order reference and checks the original buyer and total. */
  sale: async function (r) {
    const store = SERVICE.DefaultWastePersistenceService,
      events = await store.list(
        "wasteAssetOwnershipEvent",
        r,
        { "commerceOrderRef.code": r.orderCode, transferType: "SELL" },
        2,
      );
    const matched = await SERVICE.DefaultEWasteExperienceService.remote(
      r,
      "profile",
      "profile",
      "/customer",
      "POST",
      {
        query: { $or: [{ code: r.ownerId }, { loginId: r.ownerId }] },
        options: { recursive: false },
        searchOptions: { pageSize: 2 },
      },
    );
    const customers = Array.isArray(matched) ? matched : [matched];
    if (
      events.length !== 1 ||
      customers.length !== 1 ||
      !customers[0]?.code ||
      events[0].toOwnerRef?.code !== customers[0].code ||
      String(events[0].metadata.rewardPrice) !== String(Number(r.totalAmount))
    )
      throw new Error(
        "The original completed asset sale does not match this order",
      );
    return events[0];
  },
  /** Calls the Loyalty owner using internal credentials and an immutable source-derived command. */
  loyalty: function (r, path, body, method = "POST") {
    return SERVICE.DefaultEWasteExperienceService.remote(
      r,
      "loyaltyApi",
      "loyalty",
      path,
      method,
      body,
    );
  },
  /** Reads wallet balances to explain whether the known original sale movements are currently recoverable. */
  available: async function (r, owner, rewardTypeCode, amount) {
    const p = SERVICE.DefaultEWasteExperienceService.settings().marketplace;
    const data = await this.loyalty(r, "/wallet-projections", {
      ownerType: "CUSTOMER",
      ownerCode: owner.code,
    });
    const balance = (data.balances || []).find(
      (b) =>
        b.rewardTypeCode === rewardTypeCode && b.programCode === p.programCode,
    );
    return balance && Number(balance.available) >= Number(amount);
  },
  /** Explains full sale reversibility before locking or changing balances. */
  preview: async function (input) {
    const r = this.context(input),
      event = await this.sale(r),
      asset = await SERVICE.DefaultWastePersistenceService.one(
        "wasteAsset",
        r,
        event.assetCode,
      ),
      p = SERVICE.DefaultEWasteExperienceService.settings().marketplace;
    if (
      !SERVICE.DefaultWasteAssetReversalOperationService.eligible(asset, event)
    )
      return { eligible: false, reason: "ASSET_MOVED_OR_LOCKED" };
    if (event.rewardSettlementRefs?.length !== 1)
      return { eligible: false, reason: "SALE_PROCEEDS_EVIDENCE_INCOMPLETE" };
    if (
      !(await this.available(
        r,
        event.fromOwnerRef,
        p.rewardTypeCode,
        event.metadata.rewardPrice,
      ))
    )
      return { eligible: false, reason: "SELLER_PROCEEDS_UNAVAILABLE" };
    if (
      Number(event.metadata.carbonUnits) > 0 &&
      (!(await this.available(
        r,
        event.toOwnerRef,
        p.carbonRewardTypeCode,
        event.metadata.carbonUnits,
      )) ||
        event.carbonSettlementRefs?.length !== 2)
    )
      return { eligible: false, reason: "ATTACHED_CARBON_UNAVAILABLE" };
    return {
      eligible: true,
      kind: "DIGITAL_ASSET",
      assetCode: asset.code,
      summary:
        "Recover sale proceeds, return attached carbon and digital ownership, and refund the original buyer payment. Original submission rewards remain unchanged.",
    };
  },
  /** Locks the original asset through the Waste owner before any financial reversal. */
  prepare: async function (input) {
    const r = this.context(input),
      event = await this.sale(r);
    await SERVICE.DefaultWasteAssetReversalOperationService.prepare(r, event);
    return { status: "PREPARED" };
  },
  /** Reverses only the original sale proceeds and attached-carbon transfer ledger entries using original-entry idempotency. */
  settle: async function (input) {
    const r = this.context(input),
      event = await this.sale(r),
      reversal = await SERVICE.DefaultWastePersistenceService.one(
        "wasteAssetOwnershipEvent",
        r,
        SERVICE.DefaultWasteAssetReversalOperationService.code(event),
      );
    if (!reversal || reversal.metadata.refundCode !== r.refundCode)
      throw new Error("The asset must be locked before refund settlement");
    const refs = [];
    // Recover the buyer's carbon credit before restoring the seller's carbon debit.
    for (const ref of [
      ...(event.rewardSettlementRefs || []),
      ...(event.carbonSettlementRefs || []).slice().reverse(),
    ]) {
      const result = await this.loyalty(
        { ...r, idempotencyKey: r.refundCode + ":" + ref.code },
        "/reward-ledger-entries/" + encodeURIComponent(ref.code) + "/reverse",
        {
          scale: event.rewardSettlementRefs.some(
            (original) => original.code === ref.code,
          )
            ? SERVICE.DefaultEWasteExperienceService.settings().marketplace
                .rewardScale
            : SERVICE.DefaultEWasteExperienceService.settings().marketplace
                .carbonScale,
          sourceType: "ORDER_REFUND",
          sourceCode: r.orderCode,
          idempotencyKey: r.refundCode + ":" + ref.code,
        },
      );
      const entry = SERVICE.DefaultEWasteExperienceService.unwrap(
        result.ledgerEntry,
      );
      refs.push({
        module: "loyaltyLedger",
        schema: "rewardLedgerEntry",
        code: entry.code,
        originalEntryCode: ref.code,
      });
    }
    return { status: "COMPLETED", refs };
  },
  /** Commits returned ownership after Commerce has confirmed the buyer refund. */
  complete: async function (input) {
    const r = this.context(input),
      event = await this.sale(r);
    const result =
      await SERVICE.DefaultWasteAssetReversalOperationService.complete(
        {
          ...r,
          rewardSettlementRefs: r.settlement?.refs?.filter((ref) =>
            event.rewardSettlementRefs.some(
              (original) => original.code === ref.originalEntryCode,
            ),
          ),
          carbonSettlementRefs: r.settlement?.refs?.filter((ref) =>
            event.carbonSettlementRefs.some(
              (original) => original.code === ref.originalEntryCode,
            ),
          ),
        },
        event,
      );
    return { status: "COMPLETED", eventCode: result.code };
  },
};
