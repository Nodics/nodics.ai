/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const { isDeepStrictEqual } = require("node:util");
/** @module digitalCore/service/defaultDigitalCommerceOwnershipService @description Adapts exact retained Product/binding evidence to a configured secured persisted ownership owner, without owning transfer or settlement state. @layer service @owner digitalCore @override Later layers select a qualified owner through digitalCore.digitalOwnership; source defaults remain absent/off. */
module.exports = {
  /** Reads exact timestamp milliseconds without Date-to-string precision loss or non-date coercion. */
  timestamp: function (value) {
    return value instanceof Date ? value.getTime() : typeof value === "string" ? Date.parse(value) : NaN;
  },
  /** Recognizes only the complete ownership classification; contradictions never route to physical stock or coupon pools. */
  isEntry: function (entry) {
    const a = entry?.availability || {};
    if (a.digitalDeliveryType !== "DIGITAL_OWNERSHIP") return false;
    if (a.productType !== "DIGITAL" || a.inventoryStrategy !== "DIGITAL_COMMERCE") throw new Error("Contradictory digital ownership classification");
    return true;
  },
  /** Resolves an explicitly selected server-owned integration, never body-selected providers or qualification inferred from availability. */
  settings: function () {
    const p = (CONFIG.get("digitalCore") || {}).digitalOwnership || {};
    if (p.enabled !== true || p.qualified !== true || !p.owner?.moduleName || !p.owner.connectionName ||
        !p.owner.targetAuthority || !p.owner.apiPrefix) throw new Error("Digital ownership owner is not qualified");
    return p;
  },
  /** Executes one secured owner invocation and rejects failed or malformed envelopes; uncertain mutations are not automatically retried. */
  remote: async function (r, phase, payload) {
    const p = this.settings();
    if (typeof r.enterpriseCode !== "string" || !/^[A-Za-z0-9_.:@-]{1,128}$/.test(r.enterpriseCode) ||
        payload.enterpriseCode !== undefined && payload.enterpriseCode !== r.enterpriseCode)
      throw new Error("Digital ownership business scope changed");
    let value = await SERVICE.DefaultModuleService.invokeModule({ local: false,
      moduleName: p.owner.moduleName, connectionName: p.owner.connectionName, targetAuthority: p.owner.targetAuthority,
      apiName: p.owner.apiPrefix + "/" + phase, methodName: "POST", tenant: r.tenant, request: { tenant: r.tenant },
      requestBody: { ...payload, enterpriseCode: r.enterpriseCode }, header: {
        "Idempotency-Key": payload.idempotencyKey || payload.checkoutIdempotencyKey,
        "X-Correlation-Id": r.correlationId || payload.idempotencyKey || payload.checkoutIdempotencyKey },
      timeoutMs: 15000, maxAttempts: 1 });
    for (let n = 0; n < 6 && value; n++) {
      if (value.error || value.success === false || value.acknowledged === false ||
          (value.errors && (!Array.isArray(value.errors) || value.errors.length)) || /^ERR_/.test(value.code || "") ||
          (phase === "compensation-resolve" && (value.data !== undefined || value.result !== undefined) &&
            value.code !== undefined && (typeof value.code !== "string" || !/^SUC_/.test(value.code)))) throw new Error("Digital ownership owner failed");
      if (value.data !== undefined) value = value.data;
      else if (value.result !== undefined) value = value.result;
      else break;
    }
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Digital ownership evidence is unavailable");
    return value;
  },
  /** Resolves the original reserved command through the private domain owner, never mutable Cart/Product or caller unit fields. */
  resolveCompensation: async function (r, selector) {
    if (![r.tenant, r.enterpriseCode, r.ownerId, selector?.orderCode, selector?.checkoutIdempotencyKey].every(v => typeof v === "string" && v.trim()) ||
        selector.ownerId !== r.ownerId || !/^TRANSFER_[A-F0-9]{32}$/.test(selector.code || ""))
      throw new Error("Original compensation scope is required");
    const unit = await this.remote(r, "compensation-resolve", { contractVersion: 1, enterpriseCode: r.enterpriseCode,
      code: selector.code, ownerId: r.ownerId, orderCode: selector.orderCode, checkoutIdempotencyKey: selector.checkoutIdempotencyKey });
    if (unit.code !== selector.code || unit.tenant !== r.tenant || unit.enterpriseCode !== r.enterpriseCode ||
        unit.ownerId !== r.ownerId || unit.orderCode !== selector.orderCode || unit.checkoutIdempotencyKey !== selector.checkoutIdempotencyKey ||
        (unit.contractVersion !== undefined && unit.contractVersion !== 1) ||
        [unit.bindingCode, unit.entryCode, unit.productCode, unit.sku, unit.storeCode, unit.locale, unit.assetCode].some(v => typeof v !== "string" || !v.trim()) ||
        unit.idempotencyKey !== selector.checkoutIdempotencyKey + ":digital:" + unit.entryCode + ":0" ||
        !Number.isSafeInteger(unit.eventRevision) || unit.eventRevision < 0 || !/^[a-f0-9]{64}$/.test(unit.commandDigest || "") ||
        !Number.isFinite(this.timestamp(unit.expiresAt))) throw new Error("Original digital compensation command is unconfirmed");
    this.command({ ...r, payload: { orderCode: selector.orderCode } }, unit);
    return unit;
  },
  /** Returns bounded unavailable supply for an unselected integration; selected reads require exact retained binding pins and persisted owner evidence. */
  availability: async function (r, projection) {
    const p = (CONFIG.get("digitalCore") || {}).digitalOwnership || {};
    if (p.enabled !== true || p.qualified !== true) {
      const reasons = ENUMS.DigitalOwnershipAvailabilityReason;
      return { available: false, status: "UNAVAILABLE", guaranteed: false, reservableAt: "CHECKOUT_BEFORE_PAYMENT",
        inventoryStrategy: "DIGITAL_COMMERCE", productType: "DIGITAL", digitalDeliveryType: "DIGITAL_OWNERSHIP",
        reasonCode: p.enabled !== true ? reasons.DIGITAL_OWNERSHIP_NOT_SELECTED.key : reasons.DIGITAL_OWNERSHIP_NOT_QUALIFIED.key };
    }
    this.settings();
    const payload = projection.payload, map = payload.variantSkuMap || {}, variants = payload.variantCodes || [];
    const candidates = variants.filter(code => typeof map[code] === "string" && (!r.sku || map[code] === r.sku) && (!r.variantCode || code === r.variantCode));
    if (candidates.length !== 1 || Number(r.quantity) !== 1) throw new Error("Digital ownership requires one exact retained asset unit");
    const variantCode = candidates[0], sku = map[variantCode];
    const rows = await SERVICE.DefaultDigitalCommerceEntitlementService.readRecords(SERVICE.DefaultDigitalProductBindingService, r, {
      tenant: r.tenant, enterpriseCode: r.enterpriseCode, productCode: r.productCode, variantCode, sku, status: "ACTIVE",
    });
    const b = rows[0], ref = b?.providerReference, pins = b?.evidence?.retainedProducts;
    if (!Array.isArray(pins) || !pins.length || pins.length > 20 || new Set(pins.map(pin => pin.locale)).size !== pins.length)
      throw new Error("Retained digital ownership locale pins are unavailable");
    const pin = pins.find(value => value.locale === r.locale);
    if (rows.length !== 1 || b.active !== true || b.tenant !== r.tenant || b.enterpriseCode !== r.enterpriseCode ||
        b.productCode !== r.productCode || b.variantCode !== variantCode || b.sku !== sku || b.status !== "ACTIVE" ||
        b.providerOwner !== "wasteCore" || b.digitalDeliveryType !== "DIGITAL_OWNERSHIP" || b.inventoryStrategy !== "DIGITAL_COMMERCE" ||
        !b.code || !Number.isSafeInteger(b.revision) || ref?.storeCode !== r.storeCode ||
        !ref.assetCode || ref.assetCode !== payload.localizedAttributes?.assetCode ||
        pin?.code !== projection.code || !pin.sourceHash || pin.sourceHash !== projection.sourceHash ||
        !pin.publicationVersion || pin.publicationVersion !== projection.publicationVersion)
      throw new Error("Retained digital ownership binding is unavailable");
    const response = await this.remote(r, "availability", { bindingCode: b.code, productCode: r.productCode, sku, storeCode: r.storeCode, locale: r.locale });
    if (typeof response.available !== "boolean" || response.assetCode !== ref.assetCode || response.status !== "OWNER_CHECKED")
      throw new Error("Digital asset availability is unconfirmed");
    return { available: response.available, status: response.available ? "AVAILABLE" : "UNAVAILABLE", guaranteed: false,
      reservableAt: "CHECKOUT_BEFORE_PAYMENT", inventoryStrategy: "DIGITAL_COMMERCE", productType: "DIGITAL",
      digitalDeliveryType: "DIGITAL_OWNERSHIP", assetCode: ref.assetCode, bindingCode: b.code, sku, variantCode, locale: r.locale };
  },
  /** Derives the fixed owner command from original checkout identity; never forwards arbitrary payload or caller asset/policy selection. */
  command: function (r, unit) {
    if (!r.ownerId || !r.enterpriseCode || !r.tenant || !r.payload?.orderCode || !unit.entryCode || !unit.productCode || !unit.sku || !unit.idempotencyKey || !unit.storeCode || !unit.locale || !unit.checkoutIdempotencyKey)
      throw new Error("Stable digital ownership purchase identity is required");
    return { code: unit.code, bindingCode: unit.bindingCode, ownerId: r.ownerId, orderCode: r.payload.orderCode,
      entryCode: unit.entryCode, productCode: unit.productCode, sku: unit.sku, storeCode: unit.storeCode,
      locale: unit.locale, checkoutIdempotencyKey: unit.checkoutIdempotencyKey, idempotencyKey: unit.idempotencyKey };
  },
  /** Verifies the full persisted owner response; no missing field is supplied locally as presumed delivery. */
  verify: function (r, command, result, status) {
    if (result.status !== status || result.digitalDeliveryType !== "DIGITAL_OWNERSHIP" || result.providerOwner !== "wasteCore" ||
        !result.code || !result.assetCode || result.tenant !== r.tenant || result.enterpriseCode !== r.enterpriseCode ||
        ["ownerId", "orderCode", "entryCode", "productCode", "sku", "storeCode", "locale", "idempotencyKey", "checkoutIdempotencyKey", "bindingCode"].some(key => result[key] !== command[key]) ||
        (command.code && result.code !== command.code) || !Number.isFinite(this.timestamp(result.expiresAt)) ||
        (["SOLD", "DELIVERED"].includes(status) && (!Number.isFinite(this.timestamp(result.soldAt)) ||
          result.evidence?.transferCode !== result.code || !result.evidence.capture?.paymentRef?.code || !result.evidence.settlement ||
          result.evidence.physicalCustodyTransferred !== false)) ||
        (status === "DELIVERED" && this.timestamp(result.deliveredAt) !== this.timestamp(result.soldAt))) throw new Error("Persisted digital ownership evidence is unconfirmed");
    return result;
  },
  /** Re-resolves pinned Product and binding before acquisition, ignoring calculation-carried owner selectors. */
  reserve: async function (r, entry) {
    if (String(entry.quantity) !== "1") throw new Error("Digital ownership quantity must be one");
    const availability = await SERVICE.DefaultDigitalCommerceCheckoutService.availability({
      tenant: r.tenant, enterpriseCode: r.enterpriseCode, storeCode: r.storeCode, locale: r.locale,
      productCode: entry.productCode, sku: entry.sku, variantCode: entry.variantCode, quantity: 1, ownerId: r.ownerId, authData: r.authData,
    });
    // Unavailable supply may be this command's existing lock; only the persisted owner may distinguish replay from a competing buyer.
    if (!this.isEntry({ availability })) throw new Error("Digital asset is unavailable");
    const command = this.command(r, { entryCode: entry.code, productCode: entry.productCode, sku: entry.sku,
      storeCode: r.storeCode, locale: r.locale, bindingCode: availability.bindingCode, checkoutIdempotencyKey: r.idempotencyKey,
      idempotencyKey: r.idempotencyKey + ":digital:" + entry.code + ":0" });
    const result = this.verify(r, command, await this.remote(r, "reserve", command), "RESERVED");
    if (result.assetCode !== availability.assetCode) throw new Error("Reserved asset binding changed");
    return result;
  },
  /** Confirms or delivers only the original persisted sale; eWaste independently re-reads Commerce capture and original transfer evidence. */
  phase: async function (r, order, unit, phase) {
    const request = { ...r, payload: { ...r.payload, orderCode: order.code } };
    if (unit.tenant !== r.tenant || unit.enterpriseCode !== r.enterpriseCode || unit.ownerId !== r.ownerId || unit.orderCode !== order.code)
      throw new Error("Digital ownership purchase scope changed");
    const command = this.command(request, unit), status = phase === "confirm" ? "SOLD" : "DELIVERED";
    const result = this.verify(request, command, await this.remote(request, phase, command), status);
    if (result.assetCode !== unit.assetCode) throw new Error("Original asset changed");
    await this.record(request, order, result, phase === "deliver");
    return result;
  },
  /** Requires a fresh exact ownership record, not the generic save helper's lifecycle-tolerant replay subset. */
  verifyRecord: async function (service, r, model) {
    const rows = await SERVICE.DefaultDigitalCommerceEntitlementService.readRecords(service, r, {
      code: model.code, tenant: r.tenant, enterpriseCode: r.enterpriseCode,
    });
    const saved = rows[0];
    if (rows.length !== 1 || saved.active !== true || Object.keys(model).some(key => {
      if (["revision", "correlationId"].includes(key)) return false;
      if (["purchasedAt", "deliveredAt"].includes(key))
        return !Number.isFinite(this.timestamp(saved[key])) || this.timestamp(saved[key]) !== this.timestamp(model[key]);
      return !isDeepStrictEqual(saved[key], model[key]);
    })) throw new Error("Original digital ownership record evidence changed");
    return saved;
  },
  /** Records entitlement/delivery evidence through the existing Digital owner after authoritative transfer confirmation. */
  record: async function (r, order, sale, delivered) {
    const owner = SERVICE.DefaultDigitalCommerceEntitlementService;
    const model = { code: owner.entitlementCode(r, { orderCode: order.code, providerCode: sale.code }),
      tenant: r.tenant, enterpriseCode: r.enterpriseCode, ownerId: r.ownerId, orderCode: order.code, orderEntryCode: sale.entryCode,
      productCode: sale.productCode, sku: sale.sku, providerOwner: "wasteCore", providerCode: sale.code,
      digitalDeliveryType: "DIGITAL_OWNERSHIP", status: "ACTIVE", revision: 0, purchasedAt: sale.soldAt,
      idempotencyKey: sale.idempotencyKey + ":entitlement", correlationId: r.correlationId || sale.idempotencyKey,
      evidence: { ...sale.evidence, assetCode: sale.assetCode, bindingCode: sale.bindingCode } };
    await owner.save(SERVICE.DefaultDigitalEntitlementService, r, model);
    const entitlement = await this.verifyRecord(SERVICE.DefaultDigitalEntitlementService, r, model);
    if (delivered) {
      const delivery = {
      code: "digitalDelivery:" + sale.code, tenant: r.tenant, enterpriseCode: r.enterpriseCode, ownerId: r.ownerId,
      entitlementCode: entitlement.code, orderCode: order.code, deliveryType: "DIGITAL_OWNERSHIP", providerOwner: "wasteCore",
      providerCode: sale.code, status: "DELIVERED", revision: 0, deliveredAt: sale.deliveredAt,
      idempotencyKey: sale.idempotencyKey + ":delivery", correlationId: r.correlationId || sale.idempotencyKey, evidence: model.evidence,
      };
      await owner.save(SERVICE.DefaultDigitalDeliveryService, r, delivery);
      await this.verifyRecord(SERVICE.DefaultDigitalDeliveryService, r, delivery);
    }
    return entitlement;
  },
  /** Releases only original reservations whose owner proves durable terminal payment and persisted cancellation; uncertainty remains failed. */
  release: async function (r, unit) {
    try {
      const command = this.command({ ...r, payload: { ...r.payload, orderCode: unit.orderCode } }, unit);
      const result = await this.remote(r, "cancel", command);
      if (!["CANCELLED", "EXPIRED"].includes(result.status)) throw new Error("Digital release is unconfirmed");
      this.verify(r, command, result, result.status);
      return { type: "DIGITAL_OWNERSHIP_RELEASE", code: unit.code, status: "COMPLETED" };
    } catch {
      return { type: "DIGITAL_OWNERSHIP_RELEASE", code: unit.code, status: "FAILED", errorCode: "DIGITAL_OWNERSHIP_RECOVERY_REQUIRED" };
    }
  },
  /** Coordinates one original ownership refund under freshly revalidated Order staff approval; domain owners retain all asset and ledger authority. */
  refund: async function (r, items, phase) {
    const item = items[0], entry = r.entries?.[0], owner = SERVICE.DefaultDigitalCommerceEntitlementService;
    const exact = items.length === 1 && r.entries?.length === 1 && entry &&
      ["string", "number"].includes(typeof entry.quantity) && String(entry.quantity) === "1" &&
      [r.tenant, r.enterpriseCode, r.ownerId, r.orderCode, r.refundCode].every(v => typeof v === "string" && v) &&
      item?.active === true && item.tenant === r.tenant && item.enterpriseCode === r.enterpriseCode &&
      item.ownerId === r.ownerId && item.orderCode === r.orderCode && item.providerOwner === "wasteCore" &&
      item.digitalDeliveryType === "DIGITAL_OWNERSHIP" && item.productCode === entry.productCode && item.sku === entry.sku &&
      entry.code === r.orderCode + ":" + item.orderEntryCode && item.code && item.providerCode &&
      item.evidence?.transferCode === item.providerCode && item.evidence.assetCode &&
      item.evidence.physicalCustodyTransferred === false;
    if (!exact) {
      if (phase === "preview") return { eligible: false, reason: "MIXED_OR_INCOMPLETE_DIGITAL_ORDER" };
      throw new Error("Exact original one-asset digital order is required");
    }
    if (!["preview", "prepare", "settle", "complete"].includes(phase)) throw new Error("Unsupported ownership refund phase");
    const authority = await SERVICE.DefaultOrderRefundRecoveryService.paymentAuthority(r,
      phase === "preview" ? false : phase === "complete" ? true : "PREFLIGHT");
    if (["tenant", "enterpriseCode", "ownerId", "orderCode", "refundCode"].some(key => authority[key] !== r[key]) ||
        (phase !== "preview" && authority.allowExecution !== true)) throw new Error("Original Order refund authority changed");
    if (phase !== "preview") {
      const row = await SERVICE.DefaultOrderRefundRecoveryService.record(r), plan = row?.evidence?.plan;
      if (plan?.provider !== "digitalCore" || plan.domain?.kind !== "DIGITAL_OWNERSHIP" ||
          plan.domain.saleCode !== item.providerCode || plan.domain.assetCode !== item.evidence.assetCode ||
          !isDeepStrictEqual(plan.domain.entitlementCodes, [item.code])) throw new Error("Original approved ownership refund plan changed");
    }
    if (item.evidence.refundCode && item.evidence.refundCode !== r.refundCode) throw new Error("Entitlement belongs to another refund");
    if (!["ACTIVE", "REFUND_PENDING", "REVOKED"].includes(item.status) ||
        (phase === "preview" && item.status !== "ACTIVE") ||
        (phase === "settle" && item.status !== "REFUND_PENDING") ||
        (phase === "complete" && !["REFUND_PENDING", "REVOKED"].includes(item.status)) ||
        (phase === "prepare" && item.status === "ACTIVE" && item.evidence.refundCode) ||
        (item.status !== "ACTIVE" && item.evidence.refundCode !== r.refundCode) ||
        (["settle", "complete"].includes(phase) && item.evidence.refundCode !== r.refundCode))
      throw new Error("Original ownership entitlement refund lock is unavailable");
    if (phase === "prepare" && !item.evidence.refundCode)
      await owner.update(SERVICE.DefaultDigitalEntitlementService, r, item, {
        status: "REFUND_PENDING", evidence: { ...item.evidence, refundCode: r.refundCode },
      });
    const result = await this.remote(r, "refund-" + phase, {
      code: item.providerCode, entitlementCode: item.code, orderCode: r.orderCode,
      ownerId: r.ownerId, refundCode: r.refundCode, idempotencyKey: r.refundCode,
    });
    if (phase === "preview" && result.eligible === false) return result;
    if (result.saleCode !== item.providerCode || result.assetCode !== item.evidence.assetCode ||
        result.refundCode !== r.refundCode || !isDeepStrictEqual(result.entitlementCodes, [item.code]) ||
        (phase === "preview" ? result.eligible !== true || result.kind !== "DIGITAL_OWNERSHIP" :
          result.status !== (phase === "prepare" ? "PREPARED" : "COMPLETED")) ||
        (["settle", "complete"].includes(phase) && (!/^REVERSAL_[A-F0-9]{28}$/.test(result.eventCode || "") ||
          result.sellerReversalRef?.module !== "loyaltyLedger" || result.sellerReversalRef.schema !== "rewardLedgerEntry" ||
          !result.sellerReversalRef.code || result.sellerReversalRef.originalEntryCode !== item.evidence.settlement?.rewardSettlementRefs?.[0]?.code)))
      throw new Error("Original ownership refund owner evidence is unconfirmed");
    if (phase === "complete") {
      if (item.status !== "REVOKED") await owner.update(SERVICE.DefaultDigitalEntitlementService, r, item, {
        status: "REVOKED", revokedAt: new Date(),
      });
      const reversal = await owner.save(SERVICE.DefaultDigitalReversalService, r, {
        code: "refund:" + item.code, tenant: r.tenant, enterpriseCode: r.enterpriseCode, ownerId: r.ownerId,
        entitlementCode: item.code, orderCode: r.orderCode, requestType: "REFUND", policyDecision: "REVOKE_AND_REFUND",
        reasonCode: "APPROVED_ORIGINAL_ASSET_REFUND", status: "COMPLETED", revision: 0,
        idempotencyKey: r.refundCode, correlationId: r.correlationId || r.refundCode, decidedAt: new Date(),
        evidence: { refundCode: r.refundCode, saleCode: item.providerCode, assetCode: item.evidence.assetCode,
          ownershipReversalCode: result.eventCode, sellerReversalRef: result.sellerReversalRef },
      });
      if (reversal.status !== "COMPLETED" || !isDeepStrictEqual(reversal.evidence, {
        refundCode: r.refundCode, saleCode: item.providerCode, assetCode: item.evidence.assetCode,
        ownershipReversalCode: result.eventCode, sellerReversalRef: result.sellerReversalRef,
      })) throw new Error("Digital ownership reversal readback is unconfirmed");
    }
    return result;
  },
};
