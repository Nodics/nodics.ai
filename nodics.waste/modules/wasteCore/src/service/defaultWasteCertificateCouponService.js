/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const crypto = require("node:crypto"), { isDeepStrictEqual: same } = require("node:util");
/** @module wasteCore/service/defaultWasteCertificateCouponService
 * @description Reserves and consumes canonical certificates for source-proven Commerce coupon acquisitions without moving rewards, carbon or custody.
 * @owner wasteCore @layer service @override Framework configuration selects the trusted Commerce evidence target; domain adapters supply fresh admission.
 */
module.exports = {
  /**
   * Uses the shared inspected asset/event persistence owner.
   * @returns {Object} Effective existing mutation owner; does not itself mutate records.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  operations: function () { return SERVICE.DefaultWasteAssetTransferOperationService; },
  /**
   * Requires nonserializable domain admission and rechecks it across asynchronous work.
   * @param {Object} r Admitted tenant-scoped request; private admission must remain attached.
   * @returns {void} Admission succeeds without return data; effects and evidence checks are described above.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  authorize: function (r) {
    SERVICE.DefaultWasteCertificateBundleComponentService.authorize(r);
  },
  /**
   * Normalizes an immutable command, not arbitrary client metadata.
   * @param {Object} input Operation-specific command or evidence input described above; not authorization.
   * @returns {*} Normalizes an immutable command, not arbitrary client metadata.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  command: function (input) {
    const id = value => typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9_.:@|\-]{0,255}$/.test(value);
    if (input?.contractVersion !== 1 || !["CUSTOMER", "ENTERPRISE"].includes(input.ownerRef?.type) || !id(input.ownerRef.code) ||
        !["ownerId", "orderCode", "entryCode", "productCode", "promotionCode", "operationKey", "idempotencyKey"].every(k => id(input[k])) ||
        input.operationKey !== input.idempotencyKey ||
        !Array.isArray(input.certificateCodes) || !input.certificateCodes.length || input.certificateCodes.some(c => !id(c)) ||
        new Set(input.certificateCodes).size !== input.certificateCodes.length || !input.requirements ||
        !["CERTIFICATES", "BOTH"].includes(input.requirements.type)) throw new Error("Exact certificate coupon command is required");
    const limit = CONFIG.get("waste")?.certificateCoupons?.maximumCertificates;
    if (!Number.isSafeInteger(limit) || limit < 1 || input.certificateCodes.length > limit) throw new Error("Certificate coupon limit is unavailable");
    return { contractVersion: 1, ownerRef: { type: input.ownerRef.type, code: input.ownerRef.code }, ownerId: input.ownerId,
      orderCode: input.orderCode, entryCode: input.entryCode, productCode: input.productCode, promotionCode: input.promotionCode,
      operationKey: input.operationKey, certificateCodes: [...input.certificateCodes].sort(),
      requirements: structuredClone(input.requirements), idempotencyKey: input.idempotencyKey };
  },
  /**
   * Converts typed participant identity to the canonical asset owner reference.
   * @param {Object|string} command Original validated command or fixed owner-selected command name.
   * @returns {Object} Validated canonical beneficiary descriptor; no identity mutation.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  owner: function (command) {
    return { module: "profile", schema: command.ownerRef.type === "CUSTOMER" ? "customer" : "enterprise", code: command.ownerRef.code };
  },
  /**
   * Reads source-owned acquisition evidence; request booleans never authorize asset mutation.
   * @param {Object} r Admitted tenant-scoped request; private admission must remain attached.
   * @param {Object|string} command Original validated command or fixed owner-selected command name.
   * @param {string} phase Explicit supported acquisition phase; enum membership alone is insufficient.
   * @returns {Promise<*>} Reads source-owned acquisition evidence; request booleans never authorize asset mutation.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  source: async function (r, command, phase) {
    this.authorize(r);
    const p = CONFIG.get("waste")?.certificateCoupons?.commerce;
    if (!p?.connectionName || !p.targetAuthority || !Number.isSafeInteger(p.timeoutMs) || p.timeoutMs < 1)
      throw new Error("Certificate coupon evidence target is unavailable");
    let value = await SERVICE.DefaultModuleService.invokeModule({ local: false, moduleName: "digitalCore",
      connectionName: p.connectionName, targetAuthority: p.targetAuthority, methodName: "POST", tenant: r.tenant,
      apiName: "/internal/coupons/acquisition/source", request: { tenant: r.tenant },
      requestBody: { ...command, phase, enterpriseCode: r.enterpriseCode },
      header: { "Idempotency-Key": command.operationKey, "X-Correlation-Id": r.correlationId || command.operationKey },
      timeoutMs: p.timeoutMs, maxAttempts: 1 });
    for (let n = 0; n < 6 && value; n++) {
      if (value.error || value.success === false || value.acknowledged === false || /^ERR_/.test(value.code || "") ||
          value.errors && (!Array.isArray(value.errors) || value.errors.length)) throw new Error("Certificate coupon evidence failed");
      if (value.data !== undefined) value = value.data;
      else if (value.result !== undefined) value = value.result;
      else break;
    }
    this.authorize(r);
    if (value?.contractVersion !== 1 || value.tenant !== r.tenant || value.enterpriseCode !== r.enterpriseCode ||
        value.phase !== phase || value.allowed !== true || !same(value.command, command))
      throw new Error("Original certificate coupon acquisition is unconfirmed");
  },
  /**
   * Resolves canonical verified facts; submitted brand/model fields cannot substitute for approval evidence.
   * @param {Object} r Admitted tenant-scoped request; private admission must remain attached.
   * @param {Object} asset Canonical Waste asset with custody, contributor and mutation fences.
   * @returns {Promise<*>} Resolves canonical verified facts; submitted brand/model fields cannot substitute for approval evidence.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  facts: async function (r, asset) {
    const ref = asset?.verificationRef;
    if (ref?.module !== "wasteVerification" || ref.schema !== "wasteVerification" || !ref.code) return { valid: false, milestoneCodes: [] };
    const rows = await SERVICE.DefaultWastePersistenceService.list("wasteVerification", r, { code: ref.code }, 2);
    this.authorize(r);
    const verification = rows[0];
    if (rows.length !== 1 || verification.active !== true || verification.submissionCode !== asset.sourceSubmissionCode ||
        !["VERIFIED", "APPROVED"].includes(verification.verificationStatus)) return { valid: false, milestoneCodes: [] };
    const facts = verification.verifiedFacts || {};
    return { valid: true, categoryCode: verification.verifiedCategoryCode || asset.sourceCategoryCode,
      ...(typeof facts.brandCode === "string" ? { brandCode: facts.brandCode } : {}),
      ...(typeof facts.modelCode === "string" ? { modelCode: facts.modelCode } : {}),
      milestoneCodes: [verification.verificationStatus, asset.custodyStatus].filter(v => typeof v === "string") };
  },
  /**
   * Projects only requested-owner certificate facts, not private source records or other participants' balances.
   * @param {Object} r Admitted tenant-scoped request; private admission must remain attached.
   * @param {Object|string} command Original validated command or fixed owner-selected command name.
   * @param {Object} asset Canonical Waste asset with custody, contributor and mutation fences.
   * @returns {Promise<Object>} Allowlisted owner evidence projection; no accounting writes.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  projection: async function (r, command, asset) {
    if (!asset || asset.active !== true || !same(asset.ownerRef, this.owner(command)) ||
        asset.digitalOwnerRef && !same(asset.digitalOwnerRef, asset.ownerRef)) throw new Error("Owned certificate is unavailable");
    const facts = await this.facts(r, asset), consumed = asset.assetStatus === ENUMS.WasteAssetStatus.REDEEMED.key;
    const holding = asset.metadata?.couponConsumption;
    return { code: asset.code, ownerRef: command.ownerRef, ...facts, consumed,
      available: facts.valid && [ENUMS.WasteAssetStatus.OWNED.key, ENUMS.WasteAssetStatus.SOLD.key, ENUMS.WasteAssetStatus.GIFTED.key].includes(asset.assetStatus) && !asset.lockRef && !asset.metadata?.pendingTransferCode,
      ...(asset.assetStatus === ENUMS.WasteAssetStatus.REDEMPTION_PENDING.key && holding ? { reservationCode: holding.operationKey } : {}),
      ...(consumed && holding ? { consumedBy: holding.operationKey, consumedOrderCode: holding.orderCode } : {}) };
  },
  /**
   * Pins every selected certificate and its original operation in a deterministic event identity.
   * @param {Object} r Admitted tenant-scoped request; private admission must remain attached.
   * @param {Object|string} command Original validated command or fixed owner-selected command name.
   * @param {string} code Exact record identity or stable owner error code, as described above.
   * @returns {*} Pins every selected certificate and its original operation in a deterministic event identity.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  identity: function (r, command, code) {
    return "COUPON_CERTIFICATE_" + crypto.createHash("sha256").update(JSON.stringify([r.tenant, r.enterpriseCode, command.operationKey, code])).digest("hex");
  },
  /**
   * Acquires the shared asset lock before event creation, retaining original intent for lost-ack recovery.
   * @param {Object} r Admitted tenant-scoped request; private admission must remain attached.
   * @param {Object|string} command Original validated command or fixed owner-selected command name.
   * @param {Object} asset Canonical Waste asset with custody, contributor and mutation fences.
   * @returns {Promise<*>} Acquires the shared asset lock before event creation, retaining original intent for lost-ack recovery.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  reserve: async function (r, command, asset) {
    const op = this.operations(), code = this.identity(r, command, asset.code);
    if (same(asset.metadata?.lastCouponOperation, { code, phase: ENUMS.WasteCertificateOperationStatus.RELEASED.key })) throw new Error("Certificate coupon decision is final");
    let event = await op.digitalRead(r, "wasteAssetOwnershipEvent", code);
    const saved = asset.metadata?.pendingTransferEvent;
    if (!event && asset.metadata?.pendingTransferCode === code && same(saved?.metadata?.couponConsumption?.command, command))
      event = await op.digitalCreate(r, saved);
    if (event) {
      if (!same(event.metadata?.couponConsumption?.command, command) || event.metadata.couponConsumption.phase !== ENUMS.WasteCertificateOperationStatus.RESERVED.key ||
          asset.metadata?.pendingTransferCode !== code || asset.assetStatus !== ENUMS.WasteAssetStatus.REDEMPTION_PENDING.key) throw new Error("Certificate coupon reservation changed");
      return;
    }
    if (!(await this.projection(r, command, asset)).available) throw new Error("Certificate cannot be reserved");
    event = { code, assetCode: asset.code, fromOwnerRef: asset.ownerRef, toOwnerRef: asset.ownerRef,
      transferType: "REDEEM", transferStatus: ENUMS.WasteCertificateOperationStatus.RESERVED.key, revision: 0, occurredAt: new Date(),
      idempotencyKey: command.operationKey, commerceOrderRef: { module: "order", schema: "commerceOrder", code: command.orderCode },
      metadata: { couponConsumption: { command, phase: ENUMS.WasteCertificateOperationStatus.RESERVED.key, previousStatus: asset.assetStatus } } };
    this.authorize(r);
    await op.digitalUpdate(r, "wasteAsset", asset, { assetStatus: ENUMS.WasteAssetStatus.REDEMPTION_PENDING.key, metadata: { ...asset.metadata,
      pendingTransferCode: code, pendingTransferEvent: event, couponConsumption: { operationKey: command.operationKey, orderCode: command.orderCode } } });
    this.authorize(r);
    await op.digitalCreate(r, event);
  },
  /**
   * Fences consumption and failure cleanup at the event revision; completed coupon consumption never reverses.
   * @param {Object} r Admitted tenant-scoped request; private admission must remain attached.
   * @param {Object|string} command Original validated command or fixed owner-selected command name.
   * @param {Object} asset Canonical Waste asset with custody, contributor and mutation fences.
   * @param {string} phase Explicit supported acquisition phase; enum membership alone is insufficient.
   * @returns {Promise<*>} Fences consumption and failure cleanup at the event revision; completed coupon consumption never reverses.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  finish: async function (r, command, asset, phase) {
    const op = this.operations(), code = this.identity(r, command, asset.code), target = phase === ENUMS.WasteCertificateOperation.CONSUME.value ? ENUMS.WasteCertificateOperationStatus.CONSUMED.key : ENUMS.WasteCertificateOperationStatus.RELEASED.key;
    let event = await op.digitalRead(r, "wasteAssetOwnershipEvent", code);
    if (!event && asset.metadata?.pendingTransferCode === code && same(asset.metadata.pendingTransferEvent?.metadata?.couponConsumption?.command, command))
      event = await op.digitalCreate(r, asset.metadata.pendingTransferEvent);
    if (!event && phase === ENUMS.WasteCertificateOperation.RELEASE.value && (await this.projection(r, command, asset)).available) {
      this.authorize(r);
      await op.digitalUpdate(r, "wasteAsset", asset, { metadata: { ...asset.metadata, lastCouponOperation: { code, phase: ENUMS.WasteCertificateOperationStatus.RELEASED.key } } });
      this.authorize(r);
      await op.digitalCreate(r, { code, assetCode: asset.code, fromOwnerRef: asset.ownerRef, toOwnerRef: asset.ownerRef,
        transferType: "REDEEM", transferStatus: ENUMS.WasteCertificateOperationStatus.CANCELLED.key, revision: 0, occurredAt: new Date(), idempotencyKey: command.operationKey,
        metadata: { couponConsumption: { command, phase: ENUMS.WasteCertificateOperationStatus.RELEASED.key, previousStatus: asset.assetStatus } } });
      return;
    }
    let data = event?.metadata?.couponConsumption;
    if (!event || event.active !== true || !same(data?.command, command)) throw new Error("Original certificate coupon reservation is unavailable");
    if (data.phase === target) return;
    const pending = phase === ENUMS.WasteCertificateOperation.CONSUME.value ? ENUMS.WasteCertificateOperationStatus.CONSUMING.key : ENUMS.WasteCertificateOperationStatus.RELEASING.key;
    if (![ENUMS.WasteCertificateOperationStatus.RESERVED.key, pending].includes(data.phase)) throw new Error("Certificate coupon decision is final");
    if (data.phase === ENUMS.WasteCertificateOperationStatus.RESERVED.key) {
      this.authorize(r);
      event = await op.digitalUpdate(r, "wasteAssetOwnershipEvent", event, { metadata: { ...event.metadata,
        couponConsumption: { ...data, phase: pending } } });
      data = event.metadata.couponConsumption;
    }
    if (!same(asset.ownerRef, this.owner(command))) throw new Error("Certificate coupon owner changed");
    if (asset.metadata?.pendingTransferCode === code) {
      if (asset.assetStatus !== ENUMS.WasteAssetStatus.REDEMPTION_PENDING.key) throw new Error("Certificate coupon lock changed");
      this.authorize(r);
      await op.digitalUpdate(r, "wasteAsset", asset, { assetStatus: phase === ENUMS.WasteCertificateOperation.CONSUME.value ? ENUMS.WasteAssetStatus.REDEEMED.key : data.previousStatus,
        metadata: { ...asset.metadata, pendingTransferCode: null, pendingTransferEvent: null,
          couponConsumption: phase === ENUMS.WasteCertificateOperation.CONSUME.value ? { operationKey: command.operationKey, orderCode: command.orderCode } : null,
          lastCouponOperation: { code, phase: target } } });
    } else if (asset.metadata?.pendingTransferCode || !same(asset.metadata?.lastCouponOperation, { code, phase: target }))
      throw new Error("Certificate coupon successor is unconfirmed");
    this.authorize(r);
    await op.digitalUpdate(r, "wasteAssetOwnershipEvent", event, { transferStatus: phase === ENUMS.WasteCertificateOperation.CONSUME.value ? ENUMS.WasteCertificateOperationStatus.COMPLETED.key : ENUMS.WasteCertificateOperationStatus.CANCELLED.key,
      metadata: { ...event.metadata, couponConsumption: { ...data, phase: target } } });
  },
  /**
   * Coordinates a bounded exact selection; partial mutation remains locked for original-operation recovery.
   * @param {Object} r Admitted tenant-scoped request; private admission must remain attached.
   * @param {Object} input Operation-specific command or evidence input described above; not authorization.
   * @param {string} phase Explicit supported acquisition phase; enum membership alone is insufficient.
   * @returns {Promise<*>} Coordinates a bounded exact selection; partial mutation remains locked for original-operation recovery.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  invoke: async function (r, input, phase) {
    this.authorize(r);
    if (![ENUMS.WasteCertificateOperation.INSPECT.value, ENUMS.WasteCertificateOperation.RESERVE.value, ENUMS.WasteCertificateOperation.CONSUME.value, ENUMS.WasteCertificateOperation.RELEASE.value].includes(phase)) throw new Error("Unsupported certificate coupon phase");
    const command = this.command(input), op = this.operations();
    if (phase !== ENUMS.WasteCertificateOperation.INSPECT.value) await this.source(r, command, phase);
    for (const code of command.certificateCodes) {
      const asset = await op.digitalRead(r, "wasteAsset", code);
      await this.projection(r, command, asset);
      this.authorize(r);
      if (phase === ENUMS.WasteCertificateOperation.RESERVE.value) await this.reserve(r, command, asset);
      else if (phase !== ENUMS.WasteCertificateOperation.INSPECT.value) await this.finish(r, command, asset, phase);
    }
    const certificates = [];
    for (const code of command.certificateCodes) certificates.push(await this.projection(r, command, await op.digitalRead(r, "wasteAsset", code)));
    this.authorize(r);
    return { contractVersion: 1, tenant: r.tenant, enterpriseCode: r.enterpriseCode, orderCode: command.orderCode,
      operationKey: command.operationKey, ownerRef: command.ownerRef, certificates };
  },
};
