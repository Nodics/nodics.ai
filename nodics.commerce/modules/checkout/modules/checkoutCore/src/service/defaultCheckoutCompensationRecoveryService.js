/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const { isDeepStrictEqual } = require("node:util");
/** @module checkoutCore/service/defaultCheckoutCompensationRecoveryService @description Recovers bounded retained digital compensation without replaying placement or financial commands. @layer service @owner checkoutCore */
module.exports = {
  /** Creates a customer-safe owner failure without exposing retained records. */
  failure: function (code = "ERR_CHECKOUT_COMPENSATION_UNCONFIRMED") {
    return Object.assign(new Error(code), { code });
  },
  /** Rejects failed envelopes at every layer, including nominal success with missing acknowledgement. */
  unwrap: function (value) {
    for (let n = 0; n < 8; n++) {
      if (!value || typeof value !== "object" || value.error || value.success === false || value.acknowledged === false ||
          (value.errors !== undefined && (!Array.isArray(value.errors) || value.errors.length)) ||
          ("code" in value && (typeof value.code !== "string" || !/^SUC_/.test(value.code)))) throw this.failure();
      if (Array.isArray(value)) return value;
      const envelope = Object.hasOwn(value, "result") || Object.hasOwn(value, "data");
      if (envelope) {
        if (typeof value.code !== "string" || !/^SUC_/.test(value.code)) throw this.failure();
        value = Object.hasOwn(value, "result") ? value.result : value.data;
      } else return value;
    }
    throw this.failure();
  },
  /** Uses only existing generated owners and uncached bounded protected reads; failures never mean empty evidence. */
  rows: async function (service, request, query) {
    if (typeof service?.get !== "function") throw this.failure();
    const response = await service.get({ tenant: request.tenant,
      authData: SERVICE.DefaultCheckoutPlacementPortsService.serviceAuthData(request),
      query: { ...query, tenant: request.tenant },
      options: { recursive: false, skipItemCache: true }, searchOptions: { pageSize: 3, pageNumber: 1 } });
    if (typeof response?.code !== "string" || !/^SUC_/.test(response.code) || !Array.isArray(response.result)) throw this.failure();
    const value = this.unwrap(response);
    if (!Array.isArray(value) || value.length > 2 || response.count !== value.length ||
        [response.total, response.totalCount].some(n => n !== undefined && (!Number.isSafeInteger(n) || n !== value.length)) ||
        value.some(row => !row || typeof row !== "object" || Array.isArray(row) ||
          Object.entries({ ...query, tenant: request.tenant }).some(([k, v]) => !isDeepStrictEqual(row[k], v)))) throw this.failure();
    return value;
  },
  /** Requires one exact owner projection, not a first-row guess. */
  one: async function (service, request, query) {
    const rows = await this.rows(service, request, query);
    if (rows.length !== 1 || Object.entries({ ...query, tenant: request.tenant }).some(([k, v]) => !isDeepStrictEqual(rows[0][k], v)))
      throw this.failure();
    return rows[0];
  },
  /** Counts only the four canonical original Payment keys; this non-atomic observation cannot establish retry authority. */
  originalPaymentRecordCount: async function (request) {
    let count = 0;
    for (const [suffix, operation] of [[":payment", "AUTHORIZE"], [":payment:capture", "CAPTURE"],
      [":payment:void", "VOID"], [":payment:refund", "REFUND"]]) {
      let records;
      try {
        // Do not filter enterprise: a conflicting same-owner original key must fail, not appear absent.
        records = await this.rows(SERVICE.DefaultPaymentTransactionEntryService, request,
          { ownerId: request.ownerId, idempotencyKey: request.commandCode + suffix });
      } catch (_) { throw this.failure(); }
      if (records.length > 1 || records.some(row => row.enterpriseCode !== request.enterpriseCode ||
          typeof row.code !== "string" || !row.code.trim() || row.evidence?.operation !== operation ||
          (row.operation !== undefined && row.operation !== operation))) throw this.failure();
      count += records.length;
    }
    return count;
  },
  /** Reads only original owner checkpoint metadata; neither absence nor a terminal status grants retry or financial authority. */
  commandStatus: async function (request) {
    const identifier = value => typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9_.:@|\-]{0,255}$/.test(value);
    if (!request || ![request.tenant, request.enterpriseCode, request.ownerId, request.commandCode].every(identifier)) throw this.failure();
    const scope = { ...request, tenant: request.tenant, enterpriseCode: request.enterpriseCode,
      ownerId: request.ownerId, commandCode: request.commandCode };
    let records;
    try {
      records = await this.rows(SERVICE.DefaultCheckoutCheckpointService, scope,
        { ownerId: scope.ownerId, idempotencyKey: scope.commandCode });
    } catch (_) { throw this.failure(); }
    if (records.length > 1) throw this.failure();
    if (!records.length) return { status: "UNCONFIRMED", revision: null, completedPhases: [], compensationOutcomes: [], scopeQualified: false,
      originalPaymentRecordCount: await this.originalPaymentRecordCount(scope) };
    const row = records[0], phases = ["VALIDATED", "CALCULATED", "RESERVED", "DIGITAL_RESERVED", "AUTHORIZED", "ORDERED",
      "PAYMENT_CAPTURED", "PROMOTION_COMMITTED", "DIGITAL_SOLD", "RELEASED", "DIGITAL_DELIVERED"];
    const types = ["PROMOTION_REVERSAL", "INVENTORY_RELEASE", "DIGITAL_COUPON_RELEASE", "DIGITAL_OWNERSHIP_RELEASE", "PAYMENT_VOID", "PAYMENT_REFUND"];
    const completed = row.evidence?.completed, outcomes = row.evidence?.compensation;
    if (!["COMPLETED", "COMPENSATED", "COMPENSATION_REQUIRED"].includes(row.status) ||
        !Number.isSafeInteger(row.revision) || row.revision < 0 || !identifier(row.code) ||
        (row.status === "COMPLETED" ? row.code !== row.evidence?.orderCode : row.code !== scope.commandCode) ||
        (row.enterpriseCode !== undefined && row.enterpriseCode !== scope.enterpriseCode) ||
        !Array.isArray(completed) || completed.length > phases.length ||
        completed.some((phase, index) => !phases.includes(phase) || index > 0 && phases.indexOf(phase) <= phases.indexOf(completed[index - 1])) ||
        (row.status === "COMPLETED" ? outcomes !== undefined : !Array.isArray(outcomes)) ||
        (outcomes !== undefined && (outcomes.length > 256 || outcomes.some(value => !value ||
          !types.includes(value.type) || !["COMPLETED", "FAILED"].includes(value.status))))) throw this.failure();
    return { status: row.status, revision: row.revision, completedPhases: completed.map(phase => phases[phases.indexOf(phase)]),
      compensationOutcomes: (outcomes || []).map(value => ({ type: value.type, status: value.status })),
      scopeQualified: row.enterpriseCode === scope.enterpriseCode,
      originalPaymentRecordCount: await this.originalPaymentRecordCount(scope) };
  },
  /** Prevents all original-key placement effects once compensation exists, including failed protected reads. */
  assertPlacementAllowed: async function (request) {
    const rows = await this.rows(SERVICE.DefaultCheckoutCheckpointService, request,
      { ownerId: request.ownerId, idempotencyKey: request.idempotencyKey });
    if (rows.length > 1) throw this.failure();
    const row = rows[0];
    if (row && (row.tenant !== request.tenant || row.ownerId !== request.ownerId ||
        row.idempotencyKey !== request.idempotencyKey || row.status !== "COMPLETED" ||
        (request.enterpriseCode && row.enterpriseCode !== request.enterpriseCode)))
      throw this.failure("ERR_CHECKOUT_COMPENSATION_REQUIRED");
  },
  /** Reads the original placement identity; legacy compensation enterprise scope is pinned by its retained Payment intent. */
  checkpoint: async function (request) {
    return this.one(SERVICE.DefaultCheckoutCheckpointService, request,
      { code: request.commandCode, idempotencyKey: request.commandCode, ownerId: request.ownerId });
  },
  /** Qualifies only the initial one-unit captured-before-sale failure; unknown obligations remain explicit recovery. */
  qualify: function (request, row) {
    const e = row.evidence, intent = e?.paymentCompensationIntent, outcomes = e?.compensation;
    const stages = ["VALIDATED", "CALCULATED", "RESERVED", "DIGITAL_RESERVED", "AUTHORIZED", "ORDERED", "PAYMENT_CAPTURED"];
    if (!["COMPENSATION_REQUIRED", "COMPENSATED"].includes(row.status) ||
        !Number.isSafeInteger(row.revision) || row.revision < 0 || !Number.isSafeInteger(row.revision + 2) ||
        !isDeepStrictEqual(e?.completed, stages) ||
        e.inventoryReservationRecoveryRequired !== false || e.digitalReservationRecoveryRequired !== false || e.digitalReservationUncertainKey ||
        !intent || intent.tenant !== request.tenant || intent.enterpriseCode !== request.enterpriseCode || intent.ownerId !== request.ownerId ||
        (row.enterpriseCode !== undefined && row.enterpriseCode !== request.enterpriseCode) || intent.operation !== "REFUND" ||
        intent.idempotencyKey !== request.commandCode + ":payment:refund" ||
        [intent.orderCode, intent.cartCode, intent.originalPaymentTransactionCode, intent.originalIdempotencyKey,
          intent.originalProviderReference, intent.providerCode, intent.methodCode, intent.currency].some(v => typeof v !== "string" || !v.trim()) ||
        typeof intent.amount !== "string" || !/^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(intent.amount) || !/[1-9]/.test(intent.amount) ||
        !Array.isArray(outcomes) || outcomes.length !== 2) throw this.failure();
    const cleanup = outcomes.filter(v => v.type === "DIGITAL_OWNERSHIP_RELEASE"), payments = outcomes.filter(v => v.type === "PAYMENT_REFUND");
    const payment = payments[0];
    if (cleanup.length !== 1 || cleanup[0].status !== "FAILED" || cleanup[0].errorCode !== "DIGITAL_OWNERSHIP_RECOVERY_REQUIRED" ||
        !/^TRANSFER_[A-F0-9]{32}$/.test(cleanup[0].code || "") || payments.length !== 1 || payment.status !== "COMPLETED" ||
        !["REFUNDED", "REFUND_SUCCEEDED"].includes(payment.paymentStatus) || payment.idempotencyKey !== intent.idempotencyKey ||
        [payment.paymentTransactionCode, payment.providerReference].some(v => typeof v !== "string" || !v.trim())) throw this.failure();
    return { intent, cleanup: cleanup[0], payment };
  },
  /** Re-reads original Order/entry and terminal Payment rows; no financial execution or current Cart/Product reads. */
  evidence: async function (request, row, plan) {
    const { intent, cleanup, payment } = plan;
    const scope = { enterpriseCode: request.enterpriseCode, ownerId: request.ownerId, orderCode: intent.orderCode, cartCode: intent.cartCode };
    const order = await this.one(SERVICE.DefaultCommerceOrderService, request,
      { code: intent.orderCode, enterpriseCode: request.enterpriseCode, ownerId: request.ownerId, cartCode: intent.cartCode, idempotencyKey: request.commandCode });
    if (order.status !== "PLACED" || order.totalAmount !== intent.amount || order.currency !== intent.currency ||
        !isDeepStrictEqual(order.evidence?.reservationCodes, []) ||
        !isDeepStrictEqual(order.evidence?.digitalReservationCodes, [cleanup.code])) throw this.failure();
    const entries = await this.rows(SERVICE.DefaultCommerceOrderEntryService, request, scope);
    const entry = entries[0];
    if (entries.length !== 1 || Object.entries({ ...scope, tenant: request.tenant }).some(([k, v]) => entry[k] !== v) ||
        entry.status !== "PLACED" || String(entry.quantity) !== "1" ||
        typeof entry.productCode !== "string" || !entry.productCode || typeof entry.sku !== "string" || !entry.sku ||
        !isDeepStrictEqual(entry.evidence?.digitalReservationCodes, [cleanup.code])) throw this.failure();
    const capture = await this.one(SERVICE.DefaultPaymentTransactionEntryService, request,
      { ...scope, idempotencyKey: intent.originalIdempotencyKey });
    const refund = await this.one(SERVICE.DefaultPaymentTransactionEntryService, request,
      { ...scope, idempotencyKey: intent.idempotencyKey });
    for (const [value, operation] of [[capture, "CAPTURE"], [refund, "REFUND"]]) {
      const evidence = value.evidence;
      if (value.reconciliationRequired === true || (value.amount !== undefined && value.amount !== intent.amount) || value.totalAmount !== intent.amount ||
          value.currency !== intent.currency || evidence?.providerCode !== intent.providerCode || evidence.methodCode !== intent.methodCode ||
          evidence.operation !== operation || ["operation", "providerCode", "methodCode", "providerReference"].some(k =>
            value[k] !== undefined && value[k] !== evidence[k]))
        throw this.failure();
    }
    if (capture.code !== intent.originalPaymentTransactionCode || refund.code !== payment.paymentTransactionCode ||
        capture.status !== "CAPTURED" || capture.evidence.providerReference !== intent.originalProviderReference ||
        refund.status !== payment.paymentStatus || refund.evidence.providerReference !== payment.providerReference ||
        (refund.evidence?.providerStatus !== undefined && !["REFUNDED", "REFUND_SUCCEEDED"].includes(refund.evidence.providerStatus))) throw this.failure();
    return { order, entry };
  },
  /** Resolves only persisted domain command evidence through DigitalCore's private owner adapter. */
  resolveCleanup: async function (request, plan, entry) {
    const digital = SERVICE.DefaultDigitalCommerceOwnershipService;
    if (typeof digital?.resolveCompensation !== "function" || typeof digital.release !== "function") throw this.failure();
    const unit = await digital.resolveCompensation(request, { code: plan.cleanup.code,
      ownerId: request.ownerId, orderCode: plan.intent.orderCode, checkoutIdempotencyKey: request.commandCode });
    if (entry.code !== plan.intent.orderCode + ":" + unit.entryCode ||
        entry.idempotencyKey !== request.commandCode + ":order-entry:" + unit.entryCode ||
        unit.productCode !== entry.productCode || unit.sku !== entry.sku) throw this.failure();
    return unit;
  },
  /** Applies one exact revision/evidence-preimage update and requires positive match plus exact protected readback. */
  transition: async function (request, original, status, evidence) {
    const service = SERVICE.DefaultCheckoutCheckpointService;
    if (typeof service?.update !== "function") throw this.failure();
    const expected = { ...original, status, revision: original.revision + 1, evidence };
    const response = await service.update({ tenant: request.tenant,
      authData: SERVICE.DefaultCheckoutPlacementPortsService.serviceAuthData(request),
      query: { tenant: request.tenant, code: original.code, ownerId: request.ownerId, idempotencyKey: original.idempotencyKey,
        revision: original.revision, status: original.status, evidence: original.evidence },
      model: { status, revision: expected.revision, evidence },
      options: { recursive: false, upsert: false, returnModified: false } });
    if (typeof response?.code !== "string" || !/^SUC_/.test(response.code) || this.unwrap(response).matchedCount !== 1) throw this.failure();
    const saved = await this.checkpoint(request);
    if (["code", "tenant", "enterpriseCode", "ownerId", "idempotencyKey", "status", "revision", "evidence"].some(k =>
      !isDeepStrictEqual(saved[k], expected[k]))) throw this.failure();
    return saved;
  },
  /** Returns only bounded recovery status, never original financial or domain command records. */
  result: function (row) {
    return { commandCode: row.code, status: row.status, revision: row.revision,
      recoveryStatus: row.evidence.compensationRecovery.status };
  },
  /** Qualifies only one uncertain index-zero coupon before authorization; legacy scope is never backfilled. */
  qualifyPrepaymentCoupon: function (request, row) {
    const identifier = value => typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9_.:@|\-]{0,255}$/.test(value);
    const e = row.evidence, prefix = request.commandCode + ":digital:", key = e?.digitalReservationUncertainKey;
    const entryCode = typeof key === "string" && key.startsWith(prefix) && key.endsWith(":0") ? key.slice(prefix.length, -2) : undefined;
    if (![request.tenant, request.enterpriseCode, request.ownerId, request.commandCode, key, entryCode].every(identifier) ||
        row.tenant !== request.tenant || row.ownerId !== request.ownerId || row.code !== request.commandCode ||
        row.idempotencyKey !== request.commandCode ||
        (row.enterpriseCode !== undefined && row.enterpriseCode !== request.enterpriseCode) ||
        !["COMPENSATION_REQUIRED", "COMPENSATED"].includes(row.status) ||
        !Number.isSafeInteger(row.revision) || row.revision < 0 || !Number.isSafeInteger(row.revision + 2) ||
        !isDeepStrictEqual(e?.completed, ["VALIDATED", "CALCULATED", "RESERVED"]) ||
        e.inventoryReservationRecoveryRequired !== false || e.digitalReservationRecoveryRequired !== true ||
        e.paymentCompensationIntent !== undefined || !isDeepStrictEqual(e.compensation, [
          { type: "DIGITAL_COUPON_RELEASE", status: "FAILED", errorCode: "DIGITAL_RESERVATION_UNCERTAIN" }])) throw this.failure();
    return { uncertainKey: key, entryCode };
  },
  /** Accepts only the Digital owner's fixed original-unit receipt, never a caller qualification or raw coupon. */
  prepaymentCouponReceipt: function (request, plan, outcome) {
    const fields = ["type", "status", "reservationKey", "cartCode", "entryCode", "enterpriseCode"];
    if (!outcome || typeof outcome !== "object" || Array.isArray(outcome) ||
        Object.keys(outcome).length !== fields.length || fields.some(key => !Object.hasOwn(outcome, key)) ||
        outcome.type !== "DIGITAL_COUPON_RELEASE" || outcome.status !== "COMPLETED" ||
        outcome.reservationKey !== plan.uncertainKey || outcome.entryCode !== plan.entryCode ||
        outcome.enterpriseCode !== request.enterpriseCode || typeof outcome.cartCode !== "string" ||
        !/^[A-Za-z0-9][A-Za-z0-9_.:@|\-]{0,255}$/.test(outcome.cartCode)) throw this.failure();
    return { type: "DIGITAL_COUPON_RELEASE", status: "COMPLETED", reservationKey: plan.uncertainKey,
      cartCode: outcome.cartCode, entryCode: plan.entryCode, enterpriseCode: request.enterpriseCode };
  },
  /** Exposes only retained original Cart/entry recovery identity after fresh zero Payment evidence, without retry permission. */
  prepaymentCouponResult: function (row) {
    const recovery = row.evidence.compensationRecovery;
    return { ...this.result(row), recoveryType: recovery.kind, cartCode: recovery.outcome.cartCode,
      entryCode: recovery.outcome.entryCode, originalPaymentRecordCount: 0 };
  },
  /** Rejects any existing Order or entitlement for the verified original Cart; access denial never proves absence. */
  prepaymentCartEvidence: async function (request, cartCode) {
    try {
      for (const service of [SERVICE.DefaultCommerceOrderService, SERVICE.DefaultDigitalEntitlementService]) {
        if ((await this.rows(service, request, { cartCode })).length !== 0) throw this.failure();
      }
    } catch (_) { throw this.failure(); }
  },
  /** Fences one original prepayment coupon cleanup; Payment observations are not a distributed no-effects claim. */
  recoverPrepaymentCoupon: async function (request, original) {
    const plan = this.qualifyPrepaymentCoupon(request, original), prior = original.evidence.compensationRecovery;
    if (prior !== undefined) {
      const expected = { contractVersion: 1, kind: "PREPAYMENT_UNCERTAIN_COUPON", status: "COMPLETED",
        attemptId: prior?.attemptId, tenant: request.tenant, enterpriseCode: request.enterpriseCode, ownerId: request.ownerId,
        commandCode: request.commandCode, uncertainKey: plan.uncertainKey, entryCode: plan.entryCode,
        cartCode: prior?.outcome?.cartCode,
        outcome: this.prepaymentCouponReceipt(request, plan, prior?.outcome) };
      if (original.status !== "COMPENSATED" || original.revision !== 2 ||
          !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(prior?.attemptId || "") ||
          !isDeepStrictEqual(prior, expected) || await this.originalPaymentRecordCount(request) !== 0) throw this.failure();
      await this.prepaymentCartEvidence(request, prior.cartCode);
      return this.prepaymentCouponResult(original);
    }
    const digital = SERVICE.DefaultDigitalCommerceCheckoutService;
    if (original.status !== "COMPENSATION_REQUIRED" || original.revision !== 0 ||
        typeof digital?.uncertainCouponReservationScope !== "function" ||
        typeof digital.recoverUncertainCouponReservation !== "function" || await this.originalPaymentRecordCount(request) !== 0) throw this.failure();
    let scope;
    try {
      scope = await digital.uncertainCouponReservationScope({ ...request, idempotencyKey: request.commandCode }, { uncertainKey: plan.uncertainKey });
    } catch (_) { throw this.failure(); }
    const scopeFields = ["cartCode", "entryCode", "productCode", "sku", "enterpriseCode"];
    if (!scope || typeof scope !== "object" || Array.isArray(scope) || Object.keys(scope).length !== scopeFields.length ||
        scopeFields.some(key => !Object.hasOwn(scope, key) || typeof scope[key] !== "string" ||
          !/^[A-Za-z0-9][A-Za-z0-9_.:@|\-]{0,255}$/.test(scope[key])) ||
        scope.entryCode !== plan.entryCode || scope.enterpriseCode !== request.enterpriseCode ||
        (original.cartCode !== undefined && original.cartCode !== scope.cartCode)) throw this.failure();
    await this.prepaymentCartEvidence(request, scope.cartCode);
    const claim = { contractVersion: 1, kind: "PREPAYMENT_UNCERTAIN_COUPON", status: "RUNNING",
      attemptId: require("node:crypto").randomUUID(), tenant: request.tenant, enterpriseCode: request.enterpriseCode,
      ownerId: request.ownerId, commandCode: request.commandCode, uncertainKey: plan.uncertainKey, entryCode: plan.entryCode, cartCode: scope.cartCode };
    const claimed = await this.transition(request, original, "COMPENSATION_REQUIRED", { ...original.evidence, compensationRecovery: claim });
    let outcome, receipt;
    try {
      if (await this.originalPaymentRecordCount(request) !== 0) throw this.failure();
      await this.prepaymentCartEvidence(request, claim.cartCode);
      outcome = await digital.recoverUncertainCouponReservation({ ...request, idempotencyKey: request.commandCode },
        { uncertainKey: plan.uncertainKey });
    } catch (_) { /* Failed or unknown owner effects stay fenced; never persist arbitrary dependency errors. */ }
    try {
      if (await this.originalPaymentRecordCount(request) !== 0) throw this.failure();
      await this.prepaymentCartEvidence(request, claim.cartCode);
      receipt = this.prepaymentCouponReceipt(request, plan, outcome);
      if (receipt.cartCode !== claim.cartCode) receipt = undefined;
    } catch (_) { /* No terminal success without both the original owner receipt and fresh zero Payment evidence. */ }
    const saved = await this.transition(request, claimed, receipt ? "COMPENSATED" : "COMPENSATION_REQUIRED",
      { ...claimed.evidence, compensationRecovery: { ...claim, status: receipt ? "COMPLETED" : "UNCONFIRMED",
        ...(receipt ? { outcome: receipt } : {}) } });
    if (!receipt) throw this.failure();
    return this.prepaymentCouponResult(saved);
  },
  /** Runs cleanup only after a confirmed fenced claim; an uncertain attempt is never automatically stolen or repeated. */
  recover: async function (request) {
    if (![request.tenant, request.enterpriseCode, request.ownerId, request.commandCode].every(v => typeof v === "string" && v.trim()) ||
        request.commandCode.length > 256 || !request.payload || typeof request.payload !== "object" ||
        Array.isArray(request.payload) || Object.keys(request.payload).length) throw this.failure();
    const original = await this.checkpoint(request);
    if (isDeepStrictEqual(original.evidence?.completed, ["VALIDATED", "CALCULATED", "RESERVED"]))
      return this.recoverPrepaymentCoupon(request, original);
    const plan = this.qualify(request, original);
    const prior = original.evidence.compensationRecovery;
    if (prior !== undefined) {
      if (original.status !== "COMPENSATED" || prior?.status !== "COMPLETED" || prior.contractVersion !== 1 ||
          prior.code !== plan.cleanup.code || prior.outcome?.type !== "DIGITAL_OWNERSHIP_RELEASE" ||
          prior.outcome.code !== plan.cleanup.code || prior.outcome.status !== "COMPLETED" ||
          !Number.isSafeInteger(prior.eventRevision) || !/^[a-f0-9]{64}$/.test(prior.commandDigest || "")) throw this.failure();
      return this.result(original);
    }
    if (original.status !== "COMPENSATION_REQUIRED") throw this.failure();
    const { entry } = await this.evidence(request, original, plan);
    const unit = await this.resolveCleanup(request, plan, entry);
    const claim = { contractVersion: 1, code: unit.code, status: "RUNNING", attemptId: require("node:crypto").randomUUID(),
      eventRevision: unit.eventRevision, commandDigest: unit.commandDigest };
    const claimed = await this.transition(request, original, "COMPENSATION_REQUIRED", { ...original.evidence, compensationRecovery: claim });
    // Revalidate authoritative non-domain evidence after the claim, before any cancellation effect.
    await this.evidence(request, claimed, plan);
    let outcome;
    try {
      outcome = await SERVICE.DefaultDigitalCommerceOwnershipService.release({ ...request,
        idempotencyKey: request.commandCode, payload: { orderCode: plan.intent.orderCode, cartCode: plan.intent.cartCode } }, unit);
    } catch (_) { /* Unknown owner effects remain fenced for reconciliation. */ }
    const confirmed = outcome?.type === "DIGITAL_OWNERSHIP_RELEASE" && outcome.code === plan.cleanup.code &&
      outcome.status === "COMPLETED" && !outcome.error && outcome.success !== false && outcome.acknowledged !== false &&
      (outcome.errors === undefined || Array.isArray(outcome.errors) && outcome.errors.length === 0);
    const recovery = { ...claim, status: confirmed ? "COMPLETED" : "UNCONFIRMED",
      ...(confirmed ? { outcome: { type: outcome.type, code: outcome.code, status: outcome.status } } : {}) };
    const saved = await this.transition(request, claimed, confirmed ? "COMPENSATED" : "COMPENSATION_REQUIRED",
      { ...claimed.evidence, compensationRecovery: recovery });
    if (!confirmed) throw this.failure();
    return this.result(saved);
  },
};
