/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const { isDeepStrictEqual } = require("node:util");
const couponInspectionEnums = require('../../../../../digitalCommerce/modules/digitalCore/src/utils/enums');
/**
 * @module checkoutCore/service/defaultCheckoutCompensationRecoveryService
 * @description Recovers bounded retained digital compensation without replaying placement or financial
 * commands.
 * @layer service
 * @owner checkoutCore
 * @remarks Compensation recovery is an extension of the retained Checkout checkpoint, not a second
 * payment pipeline. Exact original keys, typed owner, merchant placement and participant Payment
 * namespace are mandatory; missing evidence never authorizes cleanup or financial replay.
 * Inputs and outputs are specified on each exported member below.
 * Effects and failures remain in the existing owner flow; missing evidence is never synthetic success.
 * Exported members: couponReleaseFailureCode, assertOwner, prepaymentPhases, failure, unwrap, rows, one,
 * originalPaymentRecordCount, commandStatus, assertPlacementAllowed, checkpoint, qualify, evidence,
 * resolveCleanup, transition, result, qualifyPrepaymentCoupon, prepaymentCouponReceipt,
 * prepaymentCouponResult, recoverAcquisitions, prepaymentCartEvidence, prepaymentDiagnostic, failedPrepaymentBundle,
 * prepaymentReconciliationProof, reconcilePrepaymentBundle, recoverPrepaymentCoupon,
 * recover.
 * @override Customize through the existing loader-visible module members, preserving private
 * authority.
 */
module.exports = {
  /**
   * Projects only fixed registered coupon-source failure codes from qualified owner outcomes.
   * @param {Object} outcome Retained or validated Digital release outcome; never raw dependency text.
   * @returns {string|undefined} Allowlisted static code for a failed coupon release only.
   * @remarks No reads, writes, message projection or retry authority. Unknown codes remain private.
   * @override Preserve exact membership and failed coupon-release restrictions.
   */
  couponReleaseFailureCode: function (outcome) {
    const codes = [
      'ERR_EWASTE_SALE_DIAGNOSTIC_041',
      'ERR_EWASTE_SALE_DIAGNOSTIC_042',
      'ERR_EWASTE_SALE_DIAGNOSTIC_043',
      'ERR_EWASTE_SALE_DIAGNOSTIC_044',
      'ERR_EWASTE_SALE_DIAGNOSTIC_045',
      'ERR_EWASTE_SALE_DIAGNOSTIC_046',
      'ERR_EWASTE_SALE_DIAGNOSTIC_047',
      'ERR_EWASTE_SALE_DIAGNOSTIC_048',
      'ERR_EWASTE_SALE_DIAGNOSTIC_049',
      'ERR_EWASTE_SALE_DIAGNOSTIC_050',
      'ERR_EWASTE_SALE_DIAGNOSTIC_051',
      'ERR_EWASTE_SALE_DIAGNOSTIC_052',
      'ERR_EWASTE_SALE_DIAGNOSTIC_053',
      'ERR_EWASTE_SALE_DIAGNOSTIC_054',
      'ERR_EWASTE_SALE_DIAGNOSTIC_055',
      'ERR_EWASTE_SALE_DIAGNOSTIC_056',
    ];
    return outcome?.type === 'DIGITAL_COUPON_RELEASE' && outcome.status === 'FAILED' &&
      codes.includes(outcome.errorCode) ? outcome.errorCode : undefined;
  },
  /**
   * Requires typed owner continuity for Enterprise and all newly retained participant evidence.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {Object} row Original persisted owner record and retained evidence.
   * @returns {Object} Unchanged retained record after typed owner validation.
   * @remarks Effects: Read-only comparison; no owner migration.
   * Failure behavior: Rejects mismatched owner kind/code or participant evidence.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  assertOwner: function (request, row) {
    if (row && (request.ownerRef?.schema === 'enterprise' || row.evidence?.ownerRef) &&
        !isDeepStrictEqual(row.evidence?.ownerRef, request.ownerRef)) throw this.failure();
    if (row && request.merchantScope && (!isDeepStrictEqual(row.evidence?.merchantScope, request.merchantScope) ||
        row.evidence?.participantEnterpriseCode !== request.participantEnterpriseCode)) throw this.failure();
    return row;
  },
  /**
   * Enterprise spending admission is an additional retained phase, not a second recovery workflow.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @returns {string[]} Expected initial retained phase sequence for this participant kind.
   * @remarks Effects: Pure phase selection; no journal mutation.
   * Failure behavior: No deliberate exception for a valid request.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  prepaymentPhases: function (request) {
    return request.ownerRef?.schema === 'enterprise'
      ? ["VALIDATED", "CALCULATED", "SPENDING_ADMITTED", "RESERVED"] : ["VALIDATED", "CALCULATED", "RESERVED"];
  },
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
  /**
   * Uses only existing generated owners and uncached bounded protected reads; failures never mean empty
   * evidence.
   * @param {Object} service Effective generated owner service; not a caller-selected executable.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {Object} query Owner-scoped lookup selectors; never permission authority.
   * @returns {Promise<Object[]>} Complete bounded records from the selected generated owner.
   * @remarks Effects: Uncached protected read only; no write authority is returned.
   * Failure behavior: Rejects failed, incomplete, malformed or ambiguous owner evidence.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  rows: async function (service, request, query) {
    if (typeof service?.get !== "function") throw this.failure();
    const persistence = service === SERVICE.DefaultPaymentTransactionEntryService
      ? { ...request, enterpriseCode: query.enterpriseCode || request.participantEnterpriseCode || request.enterpriseCode } : request;
    const response = await service.get({ tenant: request.tenant,
      authData: SERVICE.DefaultCheckoutPlacementPortsService.serviceAuthData(persistence),
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
  /**
   * Counts only the four canonical original Payment keys; this non-atomic observation cannot establish
   * retry authority.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @returns {Promise<number>} Count of the four exact original Payment-key records.
   * @remarks Effects: Reads participant-bound original Payment identities; result is not retry
   * authority.
   * Failure behavior: Rejects failed or contradictory protected reads.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
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
      if (records.length > 1 || records.some(row => row.enterpriseCode !== (request.participantEnterpriseCode || request.enterpriseCode) ||
          typeof row.code !== "string" || !row.code.trim() || row.evidence?.operation !== operation ||
          (row.operation !== undefined && row.operation !== operation))) throw this.failure();
      count += records.length;
    }
    return count;
  },
  /**
   * Reads only original owner checkpoint metadata; neither absence nor a terminal status grants retry or
   * financial authority.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @returns {Promise<Object>} Bounded checkpoint progress, qualified recovery action and original
   * binding fields.
   * @remarks Effects: Reads original journal/payment evidence; does not claim financial success from
   * absence.
   * Failure behavior: Rejects foreign owner, inconsistent bindings or failed completeness checks.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
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
    const row = this.assertOwner(request, records[0]), phases = ["VALIDATED", "CALCULATED", "SPENDING_ADMITTED", "RESERVED", "DIGITAL_RESERVED", "AUTHORIZED", "ORDERED",
      "PAYMENT_CAPTURED", "PROMOTION_COMMITTED", "DIGITAL_SOLD", "RELEASED", "DIGITAL_DELIVERED"];
    const types = ["PROMOTION_REVERSAL", "INVENTORY_RELEASE", "DIGITAL_COUPON_RELEASE", "DIGITAL_OWNERSHIP_RELEASE", "PAYMENT_VOID", "PAYMENT_REFUND"];
    const completed = row.evidence?.completed, outcomes = row.evidence?.compensation;
    if (!["COMPLETED", "COMPENSATED", "COMPENSATION_REQUIRED"].includes(row.status) ||
        !Number.isSafeInteger(row.revision) || row.revision < 0 || !identifier(row.code) ||
        (row.status === "COMPLETED" ? row.code !== row.evidence?.orderCode &&
          !SERVICE.DefaultCheckoutBundleRecoveryService?.completed(row) &&
          !(row.code === scope.commandCode && SERVICE.DefaultCheckoutPlacementPortsService.completedPaymentJournal(row)) : row.code !== scope.commandCode) ||
        (row.enterpriseCode !== undefined && row.enterpriseCode !== scope.enterpriseCode) ||
        !Array.isArray(completed) || completed.length > phases.length ||
        completed.some((phase, index) => !phases.includes(phase) || index > 0 && phases.indexOf(phase) <= phases.indexOf(completed[index - 1])) ||
        (row.status === "COMPLETED" ? outcomes !== undefined : !Array.isArray(outcomes)) ||
        (outcomes !== undefined && (outcomes.length > 256 || outcomes.some(value => !value ||
          !types.includes(value.type) || !["COMPLETED", "FAILED"].includes(value.status))))) throw this.failure();
    const bound = row.status === 'COMPLETED' || row.evidence?.merchantScope || row.cartCode !== undefined || row.evidence?.orderCode !== undefined;
    if (bound && (!identifier(row.cartCode) || !identifier(row.evidence?.orderCode) ||
        row.evidence?.couponAcquisitionRecovery && (row.evidence.couponAcquisitionRecovery.cartCode !== row.cartCode ||
          row.evidence.couponAcquisitionRecovery.orderCode !== row.evidence.orderCode) ||
        row.evidence?.paymentCompensationIntent && (row.evidence.paymentCompensationIntent.cartCode !== row.cartCode ||
          row.evidence.paymentCompensationIntent.orderCode !== row.evidence.orderCode))) throw this.failure();
    const recoveryAction = row.evidence?.bundleForwardRecovery
      ? await SERVICE.DefaultCheckoutBundleRecoveryService.action(scope, row) : undefined;
    const plan = row.evidence?.couponAcquisitionRecovery;
    let couponRecoveryDiagnostics;
    if (row.status === 'COMPENSATION_REQUIRED' && Array.isArray(plan?.reservations) &&
        plan.reservations.some(unit => unit.offerAllocationCode)) {
      const digital = SERVICE.DefaultDigitalCommerceCouponAcquisitionService;
      const maximum = SERVICE.DefaultDigitalCommerceCheckoutService?.maximumCouponUnits?.();
      if (!digital?.inspectRecovery || !Number.isSafeInteger(maximum) || plan.reservations.length > maximum ||
          row.enterpriseCode !== scope.enterpriseCode || !isDeepStrictEqual(row.evidence.actorRef, scope.actorRef) ||
          !bound || plan.reservations.some(unit => !identifier(unit.code) || !identifier(unit.idempotencyKey))) throw this.failure();
      const units = [];
      for (const [unitIndex, unit] of plan.reservations.entries()) if (unit.offerAllocationCode) {
        const inspection = await digital.inspectRecovery({ ...scope, idempotencyKey: scope.commandCode,
          payload: { cartCode: plan.cartCode, orderCode: plan.orderCode } }, unit);
        if (!inspection || !['UNKNOWN', 'RESERVED', 'RELEASED', 'COMPLETED'].includes(inspection.allocationStatus) ||
            !['UNKNOWN', 'UNSET', 'RELEASE', 'COMMIT'].includes(inspection.inputDisposition) ||
            !['UNKNOWN', 'RESERVED', 'SOLD', 'DELIVERED', 'AVAILABLE', 'REASSIGNED'].includes(inspection.couponStatus) ||
            !couponInspectionEnums.CouponRecoveryInspectionStage.definition.includes(inspection.stage) ||
            !couponInspectionEnums.CouponRecoveryInspectionCondition.definition.includes(inspection.condition) ||
            (inspection.stage === 'EVIDENCE_CONFIRMED') !== (inspection.condition === 'NONE') ||
            (inspection.stage === 'EVIDENCE_CONFIRMED' ? inspection.failureCode !== undefined :
              inspection.failureCode !== 'ERR_DIGITAL_COUPON_RECOVERY_INSPECTION')) throw this.failure();
        units.push({ unitIndex, allocationStatus: inspection.allocationStatus, inputDisposition: inspection.inputDisposition,
          couponStatus: inspection.couponStatus, stage: inspection.stage, condition: inspection.condition,
          ...(inspection.failureCode ? { failureCode: inspection.failureCode } : {}) });
      }
      const current = await this.rows(SERVICE.DefaultCheckoutCheckpointService, scope,
        { ownerId: scope.ownerId, idempotencyKey: scope.commandCode });
      if (current.length !== 1 || !isDeepStrictEqual(current[0], row)) throw this.failure();
      couponRecoveryDiagnostics = { contract: 'COUPON_RECOVERY_INSPECTION_V1', readOnly: true, units };
    }
    return { status: row.status, revision: row.revision, ...(bound ? { cartCode: row.cartCode, orderCode: row.evidence.orderCode } : {}),
      ...(recoveryAction ? { recoveryAction } : {}),
      ...(couponRecoveryDiagnostics ? { couponRecoveryDiagnostics } : {}),
      ...(row.evidence?.compensationRecovery?.failure && isDeepStrictEqual(row.evidence.compensationRecovery.failure,
        this.prepaymentDiagnostic({ recoveryStage: row.evidence.compensationRecovery.failure.stage }))
        ? { compensationRecoveryDiagnostic: row.evidence.compensationRecovery.failure } : {}),
      completedPhases: completed.map(phase => phases[phases.indexOf(phase)]),
      compensationOutcomes: (outcomes || []).map(value => ({ type: value.type, status: value.status,
        ...(row.enterpriseCode === scope.enterpriseCode && this.couponReleaseFailureCode(value)
          ? { errorCode: this.couponReleaseFailureCode(value) } : {}) })),
      scopeQualified: row.enterpriseCode === scope.enterpriseCode,
      originalPaymentRecordCount: await this.originalPaymentRecordCount(scope) };
  },
  /**
   * Prevents all original-key placement effects once compensation exists, including failed protected
   * reads.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @returns {Promise<void>} Completes only when compensation does not fence original placement.
   * @remarks Effects: Protected intent read; no placement or financial effects.
   * Failure behavior: Rejects existing compensation or uncertain/failed intent reads.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  assertPlacementAllowed: async function (request) {
    const rows = await this.rows(SERVICE.DefaultCheckoutCheckpointService, request,
      { ownerId: request.ownerId, idempotencyKey: request.idempotencyKey });
    if (rows.length > 1) throw this.failure();
    const row = this.assertOwner(request, rows[0]);
    if (row && (row.tenant !== request.tenant || row.ownerId !== request.ownerId ||
        row.idempotencyKey !== request.idempotencyKey || row.status !== "COMPLETED" ||
        (request.enterpriseCode && row.enterpriseCode !== request.enterpriseCode)))
      throw this.failure("ERR_CHECKOUT_COMPENSATION_REQUIRED");
  },
  /**
   * Reads the original placement identity; legacy compensation enterprise scope is pinned by its
   * retained Payment intent.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @returns {Promise<Object|undefined>} Original owner-validated placement checkpoint, or absence.
   * @remarks Effects: Reads exact retained command identity with original partition.
   * Failure behavior: Rejects mismatched tenant, typed owner or retained command scope.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  checkpoint: async function (request) {
    return this.assertOwner(request, await this.one(SERVICE.DefaultCheckoutCheckpointService, request,
      { code: request.commandCode, idempotencyKey: request.commandCode, ownerId: request.ownerId }));
  },
  /**
   * Qualifies only the initial one-unit captured-before-sale failure; unknown obligations remain
   * explicit recovery.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {Object} row Original persisted owner record and retained evidence.
   * @returns {Object} Validated original compensation intent, cleanup target and payment plan.
   * @remarks Effects: Read-only retained evidence validation; no financial execution.
   * Failure behavior: Rejects unsupported phase/state or incomplete original obligation.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  qualify: function (request, row) {
    const e = row.evidence, intent = e?.paymentCompensationIntent, outcomes = e?.compensation;
    const stages = ["VALIDATED", "CALCULATED", "RESERVED", "DIGITAL_RESERVED", "AUTHORIZED", "ORDERED", "PAYMENT_CAPTURED"];
    if (request.ownerRef?.schema === "enterprise") stages.splice(2, 0, "SPENDING_ADMITTED");
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
  /**
   * Re-reads original Order/entry and terminal Payment rows; no financial execution or current
   * Cart/Product reads.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {Object} row Original persisted owner record and retained evidence.
   * @param {Object} plan Qualified original compensation plan, not caller replacement instructions.
   * @returns {Promise<Object>} Verified original Order and entry after terminal Payment checks.
   * @remarks Effects: Re-reads existing exact receipts only; no current repricing or payment execution.
   * Failure behavior: Rejects missing, duplicate, foreign or contradictory terminal evidence.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
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
      { ...scope, enterpriseCode: intent.methodCode === "LOYALTY_REWARD" ? request.participantEnterpriseCode || request.enterpriseCode : scope.enterpriseCode,
        idempotencyKey: intent.originalIdempotencyKey });
    const refund = await this.one(SERVICE.DefaultPaymentTransactionEntryService, request,
      { ...scope, enterpriseCode: intent.methodCode === "LOYALTY_REWARD" ? request.participantEnterpriseCode || request.enterpriseCode : scope.enterpriseCode,
        idempotencyKey: intent.idempotencyKey });
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
  /**
   * Qualifies only one uncertain index-zero coupon before authorization; legacy scope is never
   * backfilled.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {Object} row Original persisted owner record and retained evidence.
   * @returns {Object} Exact uncertain original coupon key and entry code.
   * @remarks Effects: Validates retained preauthorization evidence; no backfill or release.
   * Failure behavior: Rejects non-initial, ambiguous or potentially paid acquisition.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
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
        !isDeepStrictEqual(e?.completed, this.prepaymentPhases(request)) ||
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
        outcome.type !== (plan.reservationType === "BUNDLE" ? "DIGITAL_OWNERSHIP_RELEASE" : "DIGITAL_COUPON_RELEASE") || outcome.status !== "COMPLETED" ||
        outcome.reservationKey !== plan.uncertainKey || outcome.entryCode !== plan.entryCode ||
        outcome.enterpriseCode !== request.enterpriseCode || typeof outcome.cartCode !== "string" ||
        !/^[A-Za-z0-9][A-Za-z0-9_.:@|\-]{0,255}$/.test(outcome.cartCode)) throw this.failure();
    return { type: outcome.type, status: "COMPLETED", reservationKey: plan.uncertainKey,
      cartCode: outcome.cartCode, entryCode: plan.entryCode, enterpriseCode: request.enterpriseCode };
  },
  /** Exposes only retained original Cart/entry recovery identity after fresh zero Payment evidence, without retry permission. */
  prepaymentCouponResult: function (row) {
    const recovery = row.evidence.compensationRecovery;
    return { ...this.result(row), recoveryType: recovery.kind, cartCode: recovery.outcome.cartCode,
      entryCode: recovery.outcome.entryCode, originalPaymentRecordCount: 0 };
  },
  /**
   * Reconciles terminal original Payment evidence before releasing governed coupon inputs; never
   * executes Payment.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {Object} original Original admitted request or retained command, as described by this
   * operation.
   * @returns {Promise<Object>} Original checkpoint revision/status and confirmed acquisition recovery
   * state.
   * @remarks Effects: Reconciles terminal Payment first, releases original inputs and persists recovery;
   * never executes Payment.
   * Failure behavior: Uncertain release or financial proof retains failure/recovery rather than claiming
   * cleanup.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  recoverAcquisitions: async function (request, original) {
    this.assertOwner(request, original);
    if (original.evidence?.couponAcquisitionRecovery?.paymentAttemptUnconfirmed === true)
      original = await this.reconcileAuthorizationDenial(request, original);
    const plan = original.evidence?.couponAcquisitionRecovery, intent = original.evidence?.paymentCompensationIntent;
    const digital = SERVICE.DefaultDigitalCommerceCheckoutService;
    if (!digital?.maximumCouponUnits || !digital.releaseReservations) throw this.failure();
    const identifier = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_.:@|\-]{0,255}$/.test(value);
    if (!plan || !identifier(plan.orderCode) || !identifier(plan.cartCode) || plan.paymentAttemptUnconfirmed !== false ||
        !Array.isArray(plan.reservations) || !plan.reservations.length || plan.reservations.length > digital.maximumCouponUnits() ||
        new Set(plan.reservations.map(unit => unit.code)).size !== plan.reservations.length ||
        plan.reservations.some(unit => !identifier(unit.code)) || original.enterpriseCode !== request.enterpriseCode ||
        !['COMPENSATION_REQUIRED', 'COMPENSATED'].includes(original.status) || !Array.isArray(original.evidence.compensation)) throw this.failure();
    if (plan.status === 'COMPLETED' && original.status === 'COMPENSATED') {
      if (plan.reservations.some(unit => unit.digitalDeliveryType === 'DIGITAL_OWNERSHIP') && original.evidence.paymentDenialDecision)
        await SERVICE.DefaultDigitalBundleSettlementService.inspectAuthorizationRelease({ ...request, idempotencyKey: request.commandCode,
          payload: { orderCode: plan.orderCode, cartCode: plan.cartCode } }, plan.reservations);
      return { commandCode: original.code, status: original.status, revision: original.revision, recoveryStatus: 'COMPLETED' };
    }
    if (!['READY', 'UNCONFIRMED'].includes(plan.status) || original.status !== 'COMPENSATION_REQUIRED') throw this.failure();
    const payments = [];
    for (const suffix of [':payment', ':payment:capture', ':payment:void', ':payment:refund']) {
      const rows = await this.rows(SERVICE.DefaultPaymentTransactionEntryService, request,
        { ownerId: request.ownerId, orderCode: plan.orderCode, idempotencyKey: request.commandCode + suffix });
      if (rows.length > 1) throw this.failure();
      payments.push(...rows);
    }
    let outcomes = structuredClone(original.evidence.compensation);
    if (intent) {
      if (!['VOID', 'REFUND'].includes(intent.operation) || intent.idempotencyKey !== request.commandCode + ':payment:' + intent.operation.toLowerCase() ||
          intent.tenant !== request.tenant || intent.enterpriseCode !== request.enterpriseCode || intent.ownerId !== request.ownerId ||
          intent.orderCode !== plan.orderCode || intent.cartCode !== plan.cartCode) throw this.failure();
      const reversal = payments.filter(row => row.idempotencyKey === intent.idempotencyKey), row = reversal[0];
      if (reversal.length !== 1 || ![...(intent.operation === 'VOID' ? ['VOIDED'] : ['REFUNDED', 'REFUND_SUCCEEDED'])].includes(row.status) ||
          row.cartCode !== plan.cartCode || row.currency !== intent.currency || row.evidence?.operation !== intent.operation ||
          row.enterpriseCode !== (intent.methodCode === 'LOYALTY_REWARD' ? request.participantEnterpriseCode : request.enterpriseCode) ||
          (row.methodCode || row.evidence?.methodCode) !== intent.methodCode ||
          (row.providerCode || row.evidence?.providerCode) !== intent.providerCode ||
          !identifier(row.providerReference || row.evidence?.providerReference) ||
          SERVICE.DefaultExactAmountService.compare(row.totalAmount, intent.amount) !== 0 ||
          request.ownerRef && !isDeepStrictEqual(row.evidence?.participant?.ownerRef, request.ownerRef)) throw this.failure();
      outcomes = outcomes.filter(value => value.type !== 'PAYMENT_' + intent.operation);
      outcomes.push({ type: 'PAYMENT_' + intent.operation, status: 'COMPLETED', paymentStatus: row.status,
        idempotencyKey: intent.idempotencyKey, paymentTransactionCode: row.code,
        providerReference: row.providerReference || row.evidence.providerReference });
    } else if (original.evidence.paymentDenialDecision) {
      await this.verifyAuthorizationDenial(request, original);
    } else if (payments.length || original.evidence.completed?.includes('AUTHORIZED') ||
        original.evidence.completed?.includes('PAYMENT_CAPTURED')) throw this.failure();
    const claimed = await this.transition(request, original, 'COMPENSATION_REQUIRED', { ...original.evidence,
      compensation: outcomes, couponAcquisitionRecovery: { ...plan, status: 'RUNNING' } });
    let releases;
    try {
      const scope = { ...request, idempotencyKey: request.commandCode,
        payload: { orderCode: plan.orderCode, cartCode: plan.cartCode } };
      const units = [];
      for (const unit of plan.reservations) units.push(unit.digitalDeliveryType === 'DIGITAL_OWNERSHIP'
        ? await SERVICE.DefaultDigitalCommerceOwnershipService.resolveCompensation(scope, { code: unit.code,
          ownerId: request.ownerId, orderCode: plan.orderCode, checkoutIdempotencyKey: request.commandCode }) : unit);
      releases = await digital.releaseReservations(scope, units);
    } catch (_) { /* Unknown owner effects remain retained and never imply released inputs. */ }
    const valid = Array.isArray(releases) && releases.length === plan.reservations.length &&
      new Set(releases.map(value => value.code)).size === releases.length && releases.every(value =>
        plan.reservations.some(unit => unit.code === value.code && value.type ===
          (unit.digitalDeliveryType === 'DIGITAL_OWNERSHIP' ? 'DIGITAL_OWNERSHIP_RELEASE' : 'DIGITAL_COUPON_RELEASE')) &&
        ['COMPLETED', 'FAILED'].includes(value.status));
    if (valid) outcomes = outcomes.filter(value => !plan.reservations.some(unit => value.code === unit.code &&
      ['DIGITAL_COUPON_RELEASE', 'DIGITAL_OWNERSHIP_RELEASE'].includes(value.type))).concat(releases.map(value => ({
        type: value.type, code: value.code, status: value.status,
        ...(value.status === 'FAILED' ? { errorCode: this.couponReleaseFailureCode(value) || 'DIGITAL_RELEASE_UNCONFIRMED' } : {}) })));
    const resolvedUncertain = valid && typeof original.evidence.digitalReservationUncertainKey === 'string' &&
      plan.reservations.some(unit => unit.idempotencyKey === original.evidence.digitalReservationUncertainKey &&
      releases.some(value => value.code === unit.code && value.status === 'COMPLETED'));
    if (resolvedUncertain) outcomes = outcomes.filter(value => !(value.type === 'DIGITAL_COUPON_RELEASE' &&
      value.code === undefined && value.errorCode === 'DIGITAL_RESERVATION_UNCERTAIN'));
    let terminalProof = true;
    if (original.evidence.paymentDenialDecision && plan.reservations.some(unit => unit.digitalDeliveryType === 'DIGITAL_OWNERSHIP')) {
      try { await this.verifyAuthorizationDenial(request, claimed); } catch (_) { terminalProof = false; }
    }
    const complete = valid && terminalProof && outcomes.every(value => value.status === 'COMPLETED');
    const saved = await this.transition(request, claimed, complete ? 'COMPENSATED' : 'COMPENSATION_REQUIRED', {
      ...claimed.evidence, compensation: outcomes,
      ...(resolvedUncertain ? { digitalReservationRecoveryRequired: false } : {}),
      couponAcquisitionRecovery: { ...plan, status: complete ? 'COMPLETED' : 'UNCONFIRMED' } });
    return { commandCode: saved.code, status: saved.status, revision: saved.revision,
      recoveryStatus: saved.evidence.couponAcquisitionRecovery.status };
  },
  /**
   * Requires original preauthorization phases and exact Enterprise/actor scope. A retained Loyalty
   * error selects its owner only; the subsequent atomic fence, never that error, proves no effects.
   */
  denialScope: function (request, row) {
    this.assertOwner(request, row);
    const e = row.evidence, plan = e?.couponAcquisitionRecovery;
    if (request.ownerRef?.schema !== 'enterprise' || request.ownerRef.code !== request.ownerId ||
        request.participantEnterpriseCode !== request.ownerId || !sameActor(request.actorRef, e?.actorRef) ||
        row.code !== request.commandCode || row.idempotencyKey !== request.commandCode || row.ownerId !== request.ownerId ||
        row.tenant !== request.tenant || row.enterpriseCode !== request.enterpriseCode ||
        !['COMPENSATION_REQUIRED', 'COMPENSATED'].includes(row.status) ||
        !isDeepStrictEqual(e.completed, [...this.prepaymentPhases(request), 'DIGITAL_RESERVED']) ||
        e.paymentCompensationIntent || e.bundleForwardRecovery || e.inventoryReservationRecoveryRequired !== false ||
        e.digitalReservationRecoveryRequired !== false || !plan || plan.orderCode !== e.orderCode || plan.cartCode !== row.cartCode ||
        (plan.paymentMethod !== 'LOYALTY_REWARD' && !(plan.paymentMethod === undefined && e.errorCode === 'ERR_LOYALTY_BALANCE_NEGATIVE')))
      throw this.failure();
    return { ...request, orderCode: plan.orderCode, originalAuthorization: e.originalAuthorization };
    function sameActor(left, right) { return left?.principalType === 'human' && isDeepStrictEqual(left, right); }
  },
  /** Rejects every original Payment effect except a positively bound durable denial; checks all Order rows. */
  denialPayments: async function (request, row, decision) {
    const scope = this.denialScope(request, row), plan = row.evidence.couponAcquisitionRecovery;
    if ((await this.rows(SERVICE.DefaultCommerceOrderService, request, { code: plan.orderCode })).length) throw this.failure();
    const payments = await this.rows(SERVICE.DefaultPaymentTransactionEntryService, request, { orderCode: plan.orderCode });
    if (payments.length > 1 || payments.some(p => p.ownerId !== request.ownerId || p.cartCode !== plan.cartCode ||
        p.enterpriseCode !== request.participantEnterpriseCode || p.idempotencyKey !== request.commandCode + ':payment' ||
        !['DECLINED', 'CANCELLED'].includes(p.status) || p.evidence?.operation !== 'AUTHORIZE' ||
        (p.methodCode || p.evidence?.methodCode) !== 'LOYALTY_REWARD' ||
        !isDeepStrictEqual(p.evidence?.participant?.ownerRef, request.ownerRef) ||
        !isDeepStrictEqual(p.evidence?.participant?.actorRef, request.actorRef) ||
        !p.evidence?.reservationDecision || decision && !isDeepStrictEqual(p.evidence.reservationDecision, decision))) throw this.failure();
    return scope;
  },
  /** Rechecks the durable Loyalty decision independently before every original input release. */
  verifyAuthorizationDenial: async function (request, row) {
    const scope = await this.denialPayments(request, row, row.evidence.paymentDenialDecision);
    const decision = await SERVICE.DefaultPaymentExecutionService.authorizationDecision(scope, row.evidence.paymentDenialDecision?.contract === 'LOYALTY_RESERVATION_RECONCILIATION_V1' ? 'reconcile' : 'inspect');
    if (!isDeepStrictEqual(decision, row.evidence.paymentDenialDecision)) throw this.failure();
    return decision;
  },
  /**
   * Fences an uncertain original authorization, persists proof by checkpoint CAS, then allows the
   * existing guarded cleanup. Lost acknowledgements remain uncertain and recover only the same key.
   */
  reconcileAuthorizationDenial: async function (request, row) {
    const scope = await this.denialPayments(request, row);
    if (row.status !== 'COMPENSATION_REQUIRED') throw this.failure();
    const plan = row.evidence.couponAcquisitionRecovery;
    if (!Array.isArray(plan.reservations) || !plan.reservations.length) throw this.failure();
    const bundle = plan.reservations.length === 1 && plan.reservations[0].digitalDeliveryType === 'DIGITAL_OWNERSHIP' &&
      /^bundle-operation:[a-f0-9]{64}$/.test(plan.reservations[0].code || '') && !plan.reservations[0].offerAllocationCode;
    if (!bundle && plan.reservations.some(unit => !unit.offerAllocationCode || unit.digitalDeliveryType === 'DIGITAL_OWNERSHIP'))
      throw this.failure();
    const ownerScope = { ...request, idempotencyKey: request.commandCode, payload: { orderCode: plan.orderCode, cartCode: plan.cartCode } };
    const disposition = bundle
      ? await SERVICE.DefaultDigitalBundleSettlementService.authorizationCompensationDisposition(ownerScope, plan.reservations)
      : await SERVICE.DefaultDigitalCommerceCheckoutService.couponCompensationDisposition(ownerScope, plan.reservations);
    if (disposition?.disposition !== 'RELEASE_ALLOWED' || disposition.outcomes?.length !== plan.reservations.length ||
        new Set(disposition.outcomes.map(unit => unit.code)).size !== plan.reservations.length ||
        disposition.outcomes.some(unit => unit.disposition !== 'RELEASE_ALLOWED' || !plan.reservations.some(r => r.code === unit.code))) throw this.failure();
    const decision = await SERVICE.DefaultPaymentExecutionService.authorizationDecision(scope, scope.originalAuthorization ? 'reconcile' : 'cancel');
    await this.denialPayments(request, row, decision);
    const current = await this.checkpoint(request);
    if (!isDeepStrictEqual(current, row)) throw this.failure();
    return this.transition(request, row, 'COMPENSATION_REQUIRED', { ...row.evidence,
      paymentDenialDecision: decision, couponAcquisitionRecovery: { ...plan, paymentAttemptUnconfirmed: false } });
  },
  /** Rejects any existing Order or entitlement for the verified original Cart; access denial never proves absence. */
  prepaymentCartEvidence: async function (request, cartCode) {
    try {
      for (const service of [SERVICE.DefaultCommerceOrderService, SERVICE.DefaultDigitalEntitlementService]) {
        if ((await this.rows(service, request, { cartCode })).length !== 0) throw this.failure();
      }
    } catch (_) { throw this.failure(); }
  },
  /** Returns only a bounded server-selected failure stage/code; dependency messages and payloads are never retained. */
  prepaymentDiagnostic: function (error, fallback) {
    const stages = ["PAYMENT_BEFORE_OWNER", "CART_BEFORE_OWNER", "DIGITAL_OWNER", "OWNER_ADMISSION", "CHECKPOINT_PROOF",
      "LISTING_PROOF", "PURCHASE_PROOF", "PURCHASE_FENCE", "LISTING_FENCE", "OWNER_RELEASE", "OWNER_READBACK",
      "PAYMENT_AFTER_OWNER", "CART_AFTER_OWNER", "RECEIPT_PROOF"];
    return { stage: stages.includes(error?.recoveryStage) ? error.recoveryStage : stages.includes(fallback) ? fallback : "DIGITAL_OWNER",
      code: "ERR_CHECKOUT_COMPENSATION_UNCONFIRMED" };
  },
  /** Validates the immutable revision-two failed bundle attempt; no RUNNING claim, receipt or unbounded history is accepted. */
  failedPrepaymentBundle: function (request, plan, prior) {
    const expected = { contractVersion: 1, kind: "PREPAYMENT_UNCERTAIN_BUNDLE", reservationType: "BUNDLE", status: "UNCONFIRMED",
      attemptId: prior?.attemptId, tenant: request.tenant, enterpriseCode: request.enterpriseCode, ownerId: request.ownerId,
      commandCode: request.commandCode, uncertainKey: plan.uncertainKey, entryCode: plan.entryCode, cartCode: prior?.cartCode,
      ...(prior?.failure ? { failure: this.prepaymentDiagnostic({ recoveryStage: prior.failure.stage }) } : {}) };
    if (!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(prior?.attemptId || "") ||
        typeof prior?.cartCode !== "string" || !prior.cartCode.trim() || !isDeepStrictEqual(prior, expected)) throw this.failure();
    return expected;
  },
  /** Validates exact finite owner pins from a read-only cancellation preflight; selectors never authorize effects. */
  prepaymentReconciliationProof: function (proof) {
    const fields = ["purchaseCode", "purchaseRevision", "commandDigest", "listingCode", "listingRevision", "listingEvidenceDigest"];
    if (!proof || Object.keys(proof).length !== fields.length || fields.some(k => !Object.hasOwn(proof, k)) ||
        ![proof.purchaseCode, proof.listingCode].every(v => /^bundle-operation:[a-f0-9]{64}$/.test(v)) ||
        ![proof.commandDigest, proof.listingEvidenceDigest].every(v => /^[a-f0-9]{64}$/.test(v)) ||
        ![proof.purchaseRevision, proof.listingRevision].every(v => Number.isSafeInteger(v) && v >= 0)) throw this.failure();
    return structuredClone(proof);
  },
  /**
   * Reconciles once under the same attempt UUID after exact cancelled-purchase proof; never resets or steals a claim.
   * @param {Object} request Fresh original owner/actor/merchant context and empty public payload.
   * @param {Object} original Revision-two UNCONFIRMED checkpoint.
   * @returns {Promise<Object>} Revision-four completion, or retained UNCONFIRMED failure.
   * @remarks Existing checkpoint CAS stores the complete prior attempt and fixed owner pins before effects.
   * Failure behavior: Changed owner/Cart/Payment/pins, competing CAS or unknown effects remain fenced.
   */
  reconcilePrepaymentBundle: async function (request, original) {
    const plan = this.qualifyPrepaymentCoupon(request, original);
    const prior = this.failedPrepaymentBundle(request, plan, original.evidence.compensationRecovery);
    plan.reservationType = "BUNDLE";
    if (original.status !== "COMPENSATION_REQUIRED" || original.revision !== 2 || original.cartCode !== prior.cartCode ||
        typeof original.orderCode !== "string" || !original.orderCode.trim() || await this.originalPaymentRecordCount(request) !== 0) throw this.failure();
    await this.prepaymentCartEvidence(request, prior.cartCode);
    const digital = SERVICE.DefaultDigitalCommerceCheckoutService;
    const ownerRequest = { ...request, idempotencyKey: request.commandCode, payload: { cartCode: prior.cartCode, orderCode: original.orderCode } };
    const proof = this.prepaymentReconciliationProof(await digital.inspectPrepaymentBundleReconciliation(ownerRequest, { uncertainKey: plan.uncertainKey }));
    if (await this.originalPaymentRecordCount(request) !== 0) throw this.failure();
    await this.prepaymentCartEvidence(request, prior.cartCode);
    const { failure: previousFailure, ...identity } = prior;
    const claim = { ...identity, status: "RUNNING", reconciliation: { fromRevision: 2, previous: structuredClone(prior), proof } };
    const claimed = await this.transition(request, original, "COMPENSATION_REQUIRED", { ...original.evidence, compensationRecovery: claim });
    let receipt, failure, stage = "PAYMENT_BEFORE_OWNER";
    try {
      if (await this.originalPaymentRecordCount(request) !== 0) throw this.failure();
      stage = "CART_BEFORE_OWNER"; await this.prepaymentCartEvidence(request, prior.cartCode);
      stage = "DIGITAL_OWNER";
      const outcome = await digital.recoverUncertainReservation(ownerRequest, { uncertainKey: plan.uncertainKey, reservationType: "BUNDLE" });
      stage = "PAYMENT_AFTER_OWNER"; if (await this.originalPaymentRecordCount(request) !== 0) throw this.failure();
      stage = "CART_AFTER_OWNER"; await this.prepaymentCartEvidence(request, prior.cartCode);
      stage = "RECEIPT_PROOF"; receipt = this.prepaymentCouponReceipt(request, plan, outcome);
      if (receipt.cartCode !== prior.cartCode) { receipt = undefined; throw this.failure(); }
    } catch (error) { failure = this.prepaymentDiagnostic(error, stage); receipt = undefined; }
    const saved = await this.transition(request, claimed, receipt ? "COMPENSATED" : "COMPENSATION_REQUIRED", {
      ...claimed.evidence, compensationRecovery: { ...claim, status: receipt ? "COMPLETED" : "UNCONFIRMED",
        ...(receipt ? { outcome: receipt } : { failure }) } });
    if (!receipt) throw this.failure();
    return this.prepaymentCouponResult(saved);
  },
  /** Fences one original prepayment coupon cleanup; Payment observations are not a distributed no-effects claim. */
  recoverPrepaymentCoupon: async function (request, original) {
    const plan = this.qualifyPrepaymentCoupon(request, original), prior = original.evidence.compensationRecovery;
    if (prior?.status === "UNCONFIRMED" && prior.kind === "PREPAYMENT_UNCERTAIN_BUNDLE" && prior.reconciliation === undefined)
      return this.reconcilePrepaymentBundle(request, original);
    if (prior !== undefined) {
      plan.reservationType = prior?.reservationType;
      if (!["COUPON", "BUNDLE"].includes(plan.reservationType)) throw this.failure();
      let reconciliation;
      if (prior.reconciliation !== undefined) {
        const previous = this.failedPrepaymentBundle(request, plan, prior.reconciliation.previous);
        reconciliation = { fromRevision: 2, previous, proof: this.prepaymentReconciliationProof(prior.reconciliation.proof) };
        if (!isDeepStrictEqual(prior.reconciliation, reconciliation) || previous.attemptId !== prior.attemptId ||
            previous.cartCode !== prior.cartCode) throw this.failure();
      }
      const expected = { contractVersion: 1, kind: plan.reservationType === "BUNDLE" ? "PREPAYMENT_UNCERTAIN_BUNDLE" : "PREPAYMENT_UNCERTAIN_COUPON", reservationType: plan.reservationType, status: "COMPLETED",
        attemptId: prior?.attemptId, tenant: request.tenant, enterpriseCode: request.enterpriseCode, ownerId: request.ownerId,
        commandCode: request.commandCode, uncertainKey: plan.uncertainKey, entryCode: plan.entryCode,
        cartCode: prior?.outcome?.cartCode,
        outcome: this.prepaymentCouponReceipt(request, plan, prior?.outcome), ...(reconciliation ? { reconciliation } : {}) };
      if (original.status !== "COMPENSATED" || original.revision !== (reconciliation ? 4 : 2) ||
          !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(prior?.attemptId || "") ||
          !isDeepStrictEqual(prior, expected) || await this.originalPaymentRecordCount(request) !== 0) throw this.failure();
      await this.prepaymentCartEvidence(request, prior.cartCode);
      const replayScope = await SERVICE.DefaultDigitalCommerceCheckoutService.uncertainReservationScope(
        { ...request, idempotencyKey: request.commandCode }, { uncertainKey: plan.uncertainKey });
      if (replayScope.reservationType !== plan.reservationType || replayScope.cartCode !== prior.cartCode ||
          replayScope.entryCode !== plan.entryCode || replayScope.enterpriseCode !== request.enterpriseCode) throw this.failure();
      if (plan.reservationType === "BUNDLE") {
        const receipt = await SERVICE.DefaultDigitalCommerceCheckoutService.recoverUncertainReservation(
          { ...request, idempotencyKey: request.commandCode, payload: { cartCode: prior.cartCode, orderCode: original.orderCode } },
          { uncertainKey: plan.uncertainKey, reservationType: plan.reservationType, inspectOnly: true });
        if (!isDeepStrictEqual(receipt, prior.outcome) || await this.originalPaymentRecordCount(request) !== 0) throw this.failure();
      }
      return this.prepaymentCouponResult(original);
    }
    const digital = SERVICE.DefaultDigitalCommerceCheckoutService;
    if (original.status !== "COMPENSATION_REQUIRED" || original.revision !== 0 ||
        typeof digital?.uncertainReservationScope !== "function" ||
        typeof digital.recoverUncertainReservation !== "function" || await this.originalPaymentRecordCount(request) !== 0) throw this.failure();
    let scope;
    try {
      scope = await digital.uncertainReservationScope({ ...request, idempotencyKey: request.commandCode }, { uncertainKey: plan.uncertainKey });
    } catch (_) { throw this.failure(); }
    const scopeFields = ["cartCode", "entryCode", "productCode", "sku", "enterpriseCode", "reservationType"];
    if (!scope || typeof scope !== "object" || Array.isArray(scope) || Object.keys(scope).length !== scopeFields.length ||
        scopeFields.some(key => !Object.hasOwn(scope, key) || typeof scope[key] !== "string" ||
          !/^[A-Za-z0-9][A-Za-z0-9_.:@|\-]{0,255}$/.test(scope[key])) ||
        scope.entryCode !== plan.entryCode || scope.enterpriseCode !== request.enterpriseCode ||
        (original.cartCode !== undefined && original.cartCode !== scope.cartCode)) throw this.failure();
    if (!["COUPON", "BUNDLE"].includes(scope.reservationType) || scope.reservationType === "BUNDLE" &&
        (typeof original.orderCode !== "string" || !original.orderCode.trim())) throw this.failure();
    plan.reservationType = scope.reservationType;
    await this.prepaymentCartEvidence(request, scope.cartCode);
    const claim = { contractVersion: 1, kind: plan.reservationType === "BUNDLE" ? "PREPAYMENT_UNCERTAIN_BUNDLE" : "PREPAYMENT_UNCERTAIN_COUPON", reservationType: plan.reservationType, status: "RUNNING",
      attemptId: require("node:crypto").randomUUID(), tenant: request.tenant, enterpriseCode: request.enterpriseCode,
      ownerId: request.ownerId, commandCode: request.commandCode, uncertainKey: plan.uncertainKey, entryCode: plan.entryCode, cartCode: scope.cartCode };
    const claimed = await this.transition(request, original, "COMPENSATION_REQUIRED", { ...original.evidence, compensationRecovery: claim });
    let outcome, receipt, failure, stage = "PAYMENT_BEFORE_OWNER";
    try {
      if (await this.originalPaymentRecordCount(request) !== 0) throw this.failure();
      stage = "CART_BEFORE_OWNER";
      await this.prepaymentCartEvidence(request, claim.cartCode);
      stage = "DIGITAL_OWNER";
      outcome = await digital.recoverUncertainReservation({ ...request, idempotencyKey: request.commandCode,
        payload: { cartCode: claim.cartCode, orderCode: original.orderCode } },
        { uncertainKey: plan.uncertainKey, reservationType: plan.reservationType });
    } catch (error) { failure = this.prepaymentDiagnostic(error, stage); }
    try {
      stage = "PAYMENT_AFTER_OWNER";
      if (await this.originalPaymentRecordCount(request) !== 0) throw this.failure();
      stage = "CART_AFTER_OWNER";
      await this.prepaymentCartEvidence(request, claim.cartCode);
      stage = "RECEIPT_PROOF";
      receipt = this.prepaymentCouponReceipt(request, plan, outcome);
      if (receipt.cartCode !== claim.cartCode) receipt = undefined;
    } catch (error) { failure ||= this.prepaymentDiagnostic(error, stage); }
    if (!receipt) failure ||= this.prepaymentDiagnostic(undefined, "RECEIPT_PROOF");
    const saved = await this.transition(request, claimed, receipt ? "COMPENSATED" : "COMPENSATION_REQUIRED",
      { ...claimed.evidence, compensationRecovery: { ...claim, status: receipt ? "COMPLETED" : "UNCONFIRMED",
        ...(receipt ? { outcome: receipt } : { failure }) } });
    if (!receipt) throw this.failure();
    return this.prepaymentCouponResult(saved);
  },
  /**
   * Runs cleanup only after a confirmed fenced claim; an uncertain attempt is never automatically stolen
   * or repeated.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @returns {Promise<Object>} Original command recovery result or retained recovery-required state.
   * @remarks Effects: Claims and completes existing cleanup phases under their fences; does not steal
   * uncertain attempts.
   * Failure behavior: Rejects unconfirmed, foreign or conflicting claims and propagates unresolved owner
   * failures.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  recover: async function (request) {
    if (![request.tenant, request.enterpriseCode, request.ownerId, request.commandCode].every(v => typeof v === "string" && v.trim()) ||
        request.commandCode.length > 256 || !request.payload || typeof request.payload !== "object" ||
        Array.isArray(request.payload) || Object.keys(request.payload).length) throw this.failure();
    const original = await this.checkpoint(request);
    if (original.evidence?.couponAcquisitionRecovery) return this.recoverAcquisitions(request, original);
    if (isDeepStrictEqual(original.evidence?.completed, this.prepaymentPhases(request)))
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
