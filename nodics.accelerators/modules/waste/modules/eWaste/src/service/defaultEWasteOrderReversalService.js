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
    const digital = events[0]?.metadata?.digitalSale;
    if (
      events.length !== 1 ||
      customers.length !== 1 ||
      !customers[0]?.code ||
      events[0].toOwnerRef?.code !== customers[0].code ||
      (digital
        ? SERVICE.DefaultEWasteDigitalSaleService.amount().compare(String(digital.capture?.amount), String(r.totalAmount)) !== 0
        : String(events[0].metadata.rewardPrice) !== String(Number(r.totalAmount)))
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
    // Digital-only capture/settlement terms do not approve the legacy asset refund policy.
    if (event.metadata?.digitalSale)
      return { eligible: false, reason: "DIGITAL_OWNERSHIP_REFUND_POLICY_REQUIRES_REVIEW" };
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
    if (event.metadata?.digitalSale) throw new Error("Reviewed digital ownership refund policy is required");
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
    if (event.metadata?.digitalSale) throw new Error("Reviewed digital ownership refund policy is required");
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
    if (event.metadata?.digitalSale) throw new Error("Reviewed digital ownership refund policy is required");
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
  /** Resolves the exact original one-asset sale and active retained refund policy; request selectors never supply policy, payee or ledger authority. */
  digitalContext: async function (input, phase) {
    const sale = SERVICE.DefaultEWasteDigitalSaleService, waste = SERVICE.DefaultWasteAssetTransferOperationService;
    const r = sale.context(input), p = r.payload;
    const fields = ["code", "entitlementCode", "orderCode", "ownerId", "refundCode", "idempotencyKey"];
    if (Object.keys(p).some(key => !fields.includes(key)) || fields.some(key => typeof p[key] !== "string" || !/^[A-Za-z0-9_.:@|\-]{1,192}$/.test(p[key])) ||
        p.idempotencyKey !== p.refundCode || p.refundCode !== "ORDER_REFUND_" + crypto.createHash("sha256")
          .update([r.tenant, r.enterpriseCode, p.orderCode].join("|")).digest("hex").slice(0, 32).toUpperCase())
      throw new Error("Exact original digital refund selectors are required");
    const event = await waste.digitalRead(r, "wasteAssetOwnershipEvent", p.code), d = event?.metadata?.digitalSale, c = d?.command;
    if (!c || event.active !== true || event.transferType !== "SELL" || event.transferStatus !== "COMPLETED" ||
        c.tenant !== r.tenant || c.enterpriseCode !== r.enterpriseCode || c.orderCode !== p.orderCode || c.ownerId !== p.ownerId ||
        event.assetCode !== c.assetCode || !isDeepStrictEqual(event.fromOwnerRef, c.sellerRef) || !isDeepStrictEqual(event.toOwnerRef, c.buyerRef) ||
        !isDeepStrictEqual(event.commerceOrderRef, { module: "order", schema: "commerceOrder", code: p.orderCode }) ||
        !isDeepStrictEqual(await sale.buyer(r, c.ownerId), c.buyerRef) || !isDeepStrictEqual(await sale.buyer(r, c.sellerRef.code), c.sellerRef))
      throw new Error("Original digital ownership sale changed");
    for (const [name, schema] of [["transfer", "wasteAssetTransferPolicy"], ["reward", "wasteRewardSettlementPolicy"], ["carbon", "wasteCarbonSettlementPolicy"]]) {
      const pin = c.policies?.[name], policy = pin?.code && await waste.digitalRead(r, schema, pin.code);
      if (!policy || policy.active !== true || policy.status !== "ACTIVE" || !isDeepStrictEqual(policy, pin) ||
          (policy.effectiveFrom && (!Number.isFinite(sale.timestamp(policy.effectiveFrom)) || sale.timestamp(policy.effectiveFrom) > Date.now())) ||
          (policy.effectiveTo && (!Number.isFinite(sale.timestamp(policy.effectiveTo)) || sale.timestamp(policy.effectiveTo) <= Date.now())))
        throw new Error("Original digital refund policy changed or expired");
    }
    const terms = c.policies.reward.metadata?.digitalOwnership;
    if (c.policies.transfer.metadata?.digitalOwnership?.refund !== "ORIGINAL_TRANSFER_REVERSAL_ONLY_BEFORE_ONWARD_TRANSFER" ||
        c.policies.transfer.code !== event.policyCode || terms?.version !== 1 || terms.proceeds !== "CAPTURED_TOTAL" ||
        terms.payee !== "CURRENT_SELLER" || c.policies.carbon.settlementMode !== "NONE" || c.policies.transfer.carbonTransferMode !== "NONE" ||
        !isDeepStrictEqual(event.carbonSettlementRefs, []) || !isDeepStrictEqual(d.settlement?.carbonSettlementRefs, []))
      throw new Error("Reviewed original-sale no-fee no-carbon digital refund policy is required");
    const evidence = await sale.purchaseEvidence(r, event, true);
    const items = evidence.entitlement ? [evidence.entitlement] : [];
    const item = items[0], expectedEvidence = { ...sale.result(event, "SOLD").evidence, assetCode: c.assetCode, bindingCode: c.binding.code };
    if (items.length !== 1 || item.active !== true || item.code !== p.entitlementCode || item.tenant !== r.tenant ||
        item.enterpriseCode !== r.enterpriseCode || item.ownerId !== p.ownerId || item.orderCode !== p.orderCode ||
        item.providerOwner !== "wasteCore" || item.providerCode !== event.code || item.digitalDeliveryType !== "DIGITAL_OWNERSHIP" ||
        item.orderEntryCode !== c.entryCode || item.productCode !== c.productCode || item.sku !== c.sku ||
        !Number.isFinite(sale.timestamp(item.purchasedAt)) || sale.timestamp(item.purchasedAt) !== sale.timestamp(d.completedAt) ||
        item.idempotencyKey !== c.idempotencyKey + ":entitlement" ||
        !["ACTIVE", "REFUND_PENDING", "REVOKED"].includes(item.status) ||
        (phase === "preview" ? item.status !== "ACTIVE" : item.evidence?.refundCode !== p.refundCode) ||
        (["prepare", "settle"].includes(phase) && item.status !== "REFUND_PENDING") ||
        (phase === "complete" && !["REFUND_PENDING", "REVOKED"].includes(item.status)) ||
        !isDeepStrictEqual(item.evidence, { ...expectedEvidence, ...(item.evidence?.refundCode ? { refundCode: p.refundCode } : {}) }))
      throw new Error("Exact original digital ownership entitlement is unavailable");
    const capture = await sale.capture(r, event, phase === "preview" ? ["PLACED", "COMPLETED", "FULFILLED"] : ["REFUND_PENDING", "REFUNDED"]);
    if (!isDeepStrictEqual(capture, d.capture) || !isDeepStrictEqual(event.rewardSettlementRefs, d.settlement?.rewardSettlementRefs))
      throw new Error("Original digital capture or settlement changed");
    await sale.verifySettlement(r, event);
    const ledgers = (await sale.ledgerEvidence(r, c.buyerRef.code, terms, { entryCode: d.capture.ledgerCode, sourceType: "PAYMENT", sourceCode: c.orderCode })).entries;
    const buyerLedger = ledgers[0];
    if (ledgers.length !== 1 || buyerLedger.code !== d.capture.ledgerCode || buyerLedger.entryType !== "CAPTURE" ||
        typeof buyerLedger.walletCode !== "string" || !buyerLedger.walletCode || buyerLedger.programCode !== terms.programCode ||
        buyerLedger.rewardTypeCode !== terms.rewardTypeCode || buyerLedger.idempotencyKey !== c.checkoutIdempotencyKey + ":payment:capture" ||
        buyerLedger.sourceType !== "PAYMENT" || buyerLedger.sourceCode !== c.orderCode || buyerLedger.targetType !== "ORDER" ||
        buyerLedger.targetCode !== c.orderCode || buyerLedger.reservationCode !== d.capture.reservationCode ||
        sale.amount().compare(String(buyerLedger.amount), d.capture.amount) !== 0)
      throw new Error("Original buyer debit is unconfirmed");
    const originalCapture = { captureCode: d.capture.paymentRef.code, amount: d.capture.amount, currency: d.capture.currency,
      providerCode: "loyalty-reward-points", methodCode: "LOYALTY_REWARD", walletCode: buyerLedger.walletCode,
      programCode: terms.programCode, rewardTypeCode: terms.rewardTypeCode, reversalOfEntryCode: d.capture.ledgerCode };
    return { r, event, item, originalCapture };
  },
  /** Re-reads Order-owned persisted approval and phase evidence; trusted service admission alone is never business refund authority. */
  digitalAuthority: async function (context, phase) {
    const { r, event, item, originalCapture } = context, p = r.payload, sale = SERVICE.DefaultEWasteDigitalSaleService;
    const evidence = await sale.purchaseEvidence(r, event, true);
    const rows = evidence.refunds;
    if (!Array.isArray(rows) || !Array.isArray(evidence.orders) || !Array.isArray(evidence.cases))
      throw new Error("Original persisted Order digital refund approval is required");
    const row = rows[0], e = row?.evidence, plan = e?.plan;
    const orders = evidence.orders;
    const order = orders[0];
    if (rows.length !== 1 || row.active !== true || row.tenant !== r.tenant || row.enterpriseCode !== r.enterpriseCode ||
        row.ownerId !== p.ownerId || row.orderCode !== p.orderCode || row.code !== p.refundCode || row.requestType !== "REFUND" ||
        !["APPROVED", "EXECUTING", "RECONCILIATION_REQUIRED", "COMPLETED"].includes(row.status) ||
        typeof e?.approval?.by !== "string" || !e.approval.by || !Number.isFinite(sale.timestamp(e.approval.at)) ||
        typeof e.approval.commandKey !== "string" || !/^[A-Za-z0-9._:-]{8,180}$/.test(e.approval.commandKey) ||
        typeof e.approval.reason !== "string" || e.approval.reason.trim().length < 10 || e.approval.reason.length > 2000 ||
        plan?.provider !== "digitalCore" || plan.domain?.kind !== "DIGITAL_OWNERSHIP" || plan.domain.saleCode !== event.code ||
        plan.domain.assetCode !== event.assetCode || plan.domain.refundCode !== p.refundCode ||
        !isDeepStrictEqual(plan.domain.entitlementCodes, [item.code]) || !isDeepStrictEqual(plan.originalCapture, originalCapture) ||
        plan.captureCode !== originalCapture.captureCode || plan.amount !== originalCapture.amount || plan.currency !== originalCapture.currency ||
        orders.length !== 1 || order.code !== p.orderCode || order.active !== true || order.tenant !== r.tenant ||
        order.enterpriseCode !== r.enterpriseCode || order.ownerId !== p.ownerId || order.totalAmount !== plan.amount || order.currency !== plan.currency ||
        order.evidence?.refundCode !== p.refundCode || !["REFUND_PENDING", "REFUNDED"].includes(order.status))
      throw new Error("Original persisted Order digital refund approval is required");
    const cases = evidence.cases;
    const review = cases[0];
    if (cases.length !== 1 || review.active !== true || review.code !== e.caseCode || review.requestType !== "DISPUTE" ||
        review.tenant !== r.tenant || review.orderCode !== p.orderCode || review.ownerId !== p.ownerId ||
        review.enterpriseCode !== r.enterpriseCode || !["REFUND", "CANCELLATION", "RETURN"].includes(review.evidence?.requestedResolution))
      throw new Error("Original scoped Order review is unavailable");
    if (["settle", "complete"].includes(phase) && !["PREPARED", "COMPLETED"].includes(e.steps?.PREPARE?.status))
      throw new Error("Original Order PREPARE checkpoint is required");
    if (phase === "complete" && (e.steps?.SETTLE?.status !== "COMPLETED" || e.steps?.PAYMENT?.status !== "REFUND_SUCCEEDED" || !e.steps.PAYMENT.transactionCode))
      throw new Error("Original Order seller settlement and Payment checkpoints are required");
    const command = { tenant: r.tenant, enterpriseCode: r.enterpriseCode, orderCode: p.orderCode, ownerId: p.ownerId,
      refundCode: p.refundCode, saleCode: event.code, entitlementCode: item.code, assetCode: event.assetCode,
      approvalCommandKey: e.approval.commandKey, caseCode: e.caseCode, originalCapture,
      sellerEntryCode: event.rewardSettlementRefs[0].code };
    return { ...context, row, command };
  },
  /** Verifies a fresh seller-proceeds reversal of the sole original earning; no caller ledger, amount or wallet is accepted. */
  digitalSellerReversal: async function (context, ref) {
    const { r, event, command } = context, sale = SERVICE.DefaultEWasteDigitalSaleService;
    const terms = event.metadata.digitalSale.command.policies.reward.metadata.digitalOwnership;
    const customerCode = event.metadata.digitalSale.command.sellerRef.code;
    const originals = (await sale.ledgerEvidence(r, customerCode, terms, { entryCode: command.sellerEntryCode, sourceType: "WASTE_ASSET_SALE", sourceCode: event.code })).entries;
    const original = originals[0];
    const rows = (await sale.ledgerEvidence(r, customerCode, terms, { reversalOfEntryCode: command.sellerEntryCode, sourceType: "ORDER_REFUND", sourceCode: command.orderCode })).entries;
    const entry = rows[0];
    if (originals.length !== 1 || rows.length !== 1 || entry.code !== ref?.code ||
        entry.idempotencyKey !== command.refundCode + ":" + command.sellerEntryCode || entry.sourceType !== "ORDER_REFUND" || entry.sourceCode !== command.orderCode ||
        entry.walletCode !== original.walletCode || entry.programCode !== original.programCode || entry.rewardTypeCode !== original.rewardTypeCode ||
        entry.reversalOfEntryCode !== original.code || entry.entryType !== "REVERSE" ||
        SERVICE.DefaultEWasteDigitalSaleService.amount().compare(String(entry.amount), event.metadata.digitalSale.capture.amount) !== 0)
      throw new Error("Original seller-proceeds reversal is unconfirmed");
    return { module: "loyaltyLedger", schema: "rewardLedgerEntry", code: entry.code, originalEntryCode: original.code };
  },
  /** Requires canonical Payment and Loyalty readback for the full original buyer capture before ownership returns to the seller. */
  digitalPayment: async function (context) {
    const { r, row, event, originalCapture: capture, command } = context, sale = SERVICE.DefaultEWasteDigitalSaleService;
    const code = row.evidence.steps.PAYMENT.transactionCode;
    const evidence = await sale.purchaseEvidence(r, event, true), rows = evidence.transactions;
    if (!Array.isArray(rows)) throw new Error("Original buyer Payment refund is unconfirmed");
    const payment = rows[0], intent = payment?.evidence?.refundIntent;
    const expectedKey = "order-full-refund:" + crypto.createHash("sha256")
      .update(JSON.stringify([r.tenant, r.enterpriseCode, command.orderCode, command.refundCode])).digest("hex");
    if (rows.length !== 1 || payment.tenant !== r.tenant || payment.enterpriseCode !== r.enterpriseCode || payment.ownerId !== command.ownerId ||
        payment.orderCode !== command.orderCode || payment.status !== "REFUND_SUCCEEDED" || payment.idempotencyKey !== expectedKey ||
        payment.totalAmount !== capture.amount || payment.currency !== capture.currency || payment.evidence?.operation !== "REFUND" ||
        payment.evidence.providerCode !== capture.providerCode || !payment.evidence.providerReference ||
        !isDeepStrictEqual(intent, { tenant: r.tenant, enterpriseCode: r.enterpriseCode, ownerId: command.ownerId, orderCode: command.orderCode,
          totalAmount: capture.amount, currency: capture.currency, refundCode: command.refundCode, approvalCommandKey: command.approvalCommandKey, ...capture }))
      throw new Error("Original buyer Payment refund is unconfirmed");
    const c = event.metadata.digitalSale.command;
    const ledgers = (await sale.ledgerEvidence(r, c.buyerRef.code, c.policies.reward.metadata.digitalOwnership,
      { reversalOfEntryCode: capture.reversalOfEntryCode, sourceType: "PAYMENT", sourceCode: command.orderCode })).entries;
    const entry = ledgers[0];
    if (ledgers.length !== 1 || entry.code !== payment.evidence.providerReference || entry.walletCode !== capture.walletCode ||
        entry.programCode !== capture.programCode || entry.rewardTypeCode !== capture.rewardTypeCode ||
        entry.sourceType !== "PAYMENT" || entry.sourceCode !== command.orderCode || entry.idempotencyKey !== expectedKey ||
        sale.amount().compare(String(entry.amount), capture.amount) !== 0)
      throw new Error("Original buyer refund ledger is unconfirmed");
    return { module: "paymentCore", schema: "paymentTransaction", code: payment.code };
  },
  /** Runs only the approved original-sale no-fee/no-carbon path; uncertain effects keep original owner locks and command references. */
  digitalInvoke: async function (input, phase) {
    if (!["preview", "prepare", "settle", "complete"].includes(phase)) throw new Error("Unsupported digital refund phase");
    let context = await this.digitalContext(input, phase);
    const { r, event, item } = context, sale = SERVICE.DefaultEWasteDigitalSaleService, waste = SERVICE.DefaultWasteAssetReversalOperationService;
    const result = { saleCode: event.code, assetCode: event.assetCode, refundCode: r.payload.refundCode, entitlementCodes: [item.code] };
    if (phase === "preview") {
      const asset = await SERVICE.DefaultWasteAssetTransferOperationService.digitalRead(r, "wasteAsset", event.assetCode);
      if (!waste.digitalEligible(asset, event)) return { eligible: false, reason: "ASSET_MOVED_OR_LOCKED" };
      return { ...result, eligible: true, kind: "DIGITAL_OWNERSHIP",
        summary: "Reverse original seller proceeds, refund original buyer capture, and restore digital ownership only; no fee, carbon or physical custody reversal." };
    }
    context = await this.digitalAuthority(context, phase);
    const { command } = context;
    if (phase === "prepare") {
      await waste.prepareDigital(r, event, command);
      return { ...result, status: "PREPARED" };
    }
    let { reversal } = await waste.digitalState(r, event, command);
    let ref = reversal.metadata.digitalRefund.sellerReversalRef;
    if (phase === "settle") {
      if (!ref) {
        const key = command.refundCode + ":" + command.sellerEntryCode;
        const response = await sale.remote(r, "loyaltyApi", "loyalty", "/reward-ledger-entries/" + encodeURIComponent(command.sellerEntryCode) + "/reverse", {
          scale: event.metadata.digitalSale.command.policies.reward.metadata.digitalOwnership.scale,
          sourceType: "ORDER_REFUND", sourceCode: command.orderCode, idempotencyKey: key,
        }, true);
        ref = response?.ledgerEntry;
      }
      ref = await this.digitalSellerReversal(context, ref);
      reversal = await waste.settleDigital(r, event, command, ref);
    } else {
      ref = await this.digitalSellerReversal(context, ref);
      if (!isDeepStrictEqual(context.row.evidence.steps.SETTLE.sellerReversalRef, ref)) throw new Error("Original Order seller checkpoint changed");
      reversal = await waste.completeDigital(r, event, command, await this.digitalPayment(context));
    }
    return { ...result, status: "COMPLETED", eventCode: reversal.code, sellerReversalRef: ref };
  },
};
