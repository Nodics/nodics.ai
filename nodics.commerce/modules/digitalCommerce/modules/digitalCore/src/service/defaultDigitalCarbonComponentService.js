/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const { isDeepStrictEqual } = require("node:util");
/**
 * @module digitalCore/service/defaultDigitalCarbonComponentService
 * @description Adapts immutable bundle components to canonical realized Carbon lot operations.
 * Inputs: Admitted tenant context and original lot/quantity/unit/owner/recipient/manifest command.
 * Outputs: Availability or exact normalized component receipts carrying canonical owner evidence.
 * Effects: Uses qualified Carbon transport; transfer retains a destination hold until whole-bundle
 * finalization.
 * Failure behavior: Unqualified transport, incomplete holdings or substituted receipt rejects; no guessed
 * carbon or success fallback.
 * Exported members: remote, inspect, command, receipt, reserve, transfer, finalize, release.
 * @owner digitalCore
 * @layer service
 * @override Select transport through owner config and preserve component identity and transfer-lock
 * semantics in overrides.
 * @see ../../llm/contracts/bundle-holdings-and-gifts.md
 */
module.exports = {
  retainsTransferLock: true,
  /**
   * Uses the qualified configured Waste runtime and original component identity.
   * @param {Object} r Admitted tenant and correlation context for the original bundle component.
   * @param {string} path Fixed Carbon owner endpoint selected by this adapter.
   * @param {Object} body Owner command or holdings selector; mutation commands retain operationKey.
   * @returns {Promise<*>} Owner response unwrapped through at most eight envelope levels; caller validates
   * phase evidence.
   * @remarks Effects: Invokes qualified wasteCarbon transport once; endpoint determines reads or canonical
   * Carbon effects.
   * Failure behavior: Rejects unqualified/incomplete transport or explicit owner failure envelopes.
   * @override Keep target selection in framework config, original key and no blind retry.
   */
  remote: async function (r, path, body) {
    const p = CONFIG.get("digitalCore")?.bundles?.carbon;
    if (p?.qualified !== true || !p.connectionName || !p.targetAuthority || !Number.isSafeInteger(p.timeoutMilliseconds) || p.timeoutMilliseconds <= 0 ||
        !Number.isSafeInteger(p.maximumHoldingPages) || p.maximumHoldingPages < 1) throw new Error("Carbon component transport is not qualified");
    let result = await SERVICE.DefaultModuleService.invokeModule({ local: false, moduleName: "wasteCarbon",
      connectionName: p.connectionName, targetAuthority: p.targetAuthority, apiName: path, methodName: "POST",
      tenant: r.tenant, request: { tenant: r.tenant }, requestBody: body,
      header: { "Idempotency-Key": body.operationKey, "X-Correlation-Id": r.correlationId || body.operationKey },
      timeoutMs: p.timeoutMilliseconds, maxAttempts: 1 });
    for (let n = 0; n < 8 && result; n++) {
      if (result.error || result.success === false || result.acknowledged === false || /^ERR_/.test(result.code || "") ||
          result.errors && (!Array.isArray(result.errors) || result.errors.length)) throw new Error("Carbon owner evidence failed");
      if (result.data !== undefined) result = result.data;
      else if (result.result !== undefined) result = result.result;
      else break;
    }
    return result;
  },
  /**
   * Reads realized available quantity from complete bounded owner holdings, never impact estimates or reward
   * balances.
   * @param {Object} r Admitted tenant and correlation context for the original bundle component.
   * @param {Object} input Original component/reference/quantity, ownerRef, operationKey, manifest
   * identity/count and recipientRef for transfer/finalize.
   * @returns {Promise<Object>} available flag, original ownerRef and discovered lot revision (possibly
   * undefined).
   * @remarks Effects: Reads the complete bounded Carbon holdings set and compares exact available quantity;
   * no reservation.
   * Failure behavior: Rejects wrong kind/reference, absent exact arithmetic, truncation/duplicates or count
   * drift.
   * @override Only REALIZED matching-unit holdings qualify; reward balances and impact estimates do not.
   */
  inspect: async function (r, input) {
    const c = input.component;
    if (c.kind !== "REALIZED_CARBON" || c.reference.module !== "wasteCarbon" || c.reference.schema !== "wasteCarbonLot")
      throw new Error("Canonical carbon lot is required");
    const exact = SERVICE.DefaultExactAmountService;
    if (!exact?.compare) throw new Error("Exact quantity owner is unavailable");
    let total, found, count = 0;
    const seen = new Set();
    for (let page = 1; ; page++) {
      if (page > CONFIG.get("digitalCore").bundles.carbon.maximumHoldingPages) throw new Error("Carbon holdings exceed the bounded read");
      const result = await this.remote(r, "/carbon/holdings", { ownerRef: input.ownerRef, page });
      if (!Array.isArray(result?.items) || !Number.isSafeInteger(result.total) || result.total < 0 || result.page !== page ||
          !Number.isSafeInteger(result.limit) || result.limit < 1 || result.items.length > result.limit ||
          total !== undefined && total !== result.total) throw new Error("Carbon holdings are incomplete or changed");
      total = result.total;
      for (const item of result.items) {
        if (seen.has(item.lotCode)) throw new Error("Duplicate carbon lot");
        seen.add(item.lotCode);
        if (item.lotCode === c.reference.code) found = item;
      }
      count += result.items.length;
      if (count > total || count < total && result.items.length < result.limit) throw new Error("Carbon holding totals changed");
      if (count === total) break;
    }
    return { available: !!found && found.state === "REALIZED" && found.unitOfMeasure === c.unitOfMeasure &&
      exact.compare(found.available, c.quantity) >= 0, ownerRef: input.ownerRef, revision: found?.revision };
  },
  /**
   * Binds the existing Carbon command to the immutable Digital manifest.
   * @param {Object} input Original component/reference/quantity, ownerRef, operationKey, manifest
   * identity/count and recipientRef for transfer/finalize.
   * @returns {Object} Carbon lot/owner/quantity/unit/key and manifestRef, with recipientRef when supplied.
   * @remarks Effects: Pure projection; no holds or transfers.
   * Failure behavior: Throws when complete componentCount is absent/invalid or required input shape is
   * malformed.
   * @override Retain original manifest revision and operation key; do not invent destination ownership.
   */
  command: function (input) {
    if (!Number.isSafeInteger(input.componentCount) || input.componentCount < 1) throw new Error("Complete component count is required");
    return { lotCode: input.component.reference.code, ownerRef: input.ownerRef, quantity: input.component.quantity,
      unitOfMeasure: input.component.unitOfMeasure, operationKey: input.operationKey,
      manifestRef: { module: "digitalCore", schema: "digitalBundleManifest", code: input.bundleCode, revision: input.manifestRevision },
      ...(input.recipientRef ? { recipientRef: input.recipientRef } : {}) };
  },
  /**
   * Requires original persisted owner evidence rather than a successful HTTP status alone.
   * @param {Object} input Original component/reference/quantity, ownerRef, operationKey, manifest
   * identity/count and recipientRef for transfer/finalize.
   * @param {Object} result Canonical persisted Carbon owner receipt.
   * @param {string} status Expected RESERVED, TRANSFERRED, COMPLETED or RELEASED phase.
   * @returns {Object} Normalized component receipt with original reference/quantity and complete owner
   * evidence.
   * @remarks Effects: Validates exact amount, scope, manifest, recipient and destination lock; no mutation.
   * Failure behavior: Throws for substituted receipt, quantity, revision or missing finalization/lock
   * evidence.
   * @override Accept COMPLETED readback for transfer without discarding the finalization proof.
   */
  receipt: function (input, result, status) {
    const command = this.command(input), exact = SERVICE.DefaultExactAmountService;
    if (result?.module !== "wasteCarbon" || result.schema !== "wasteCarbonLot" || result.lotCode !== command.lotCode ||
        result.operationKey !== command.operationKey ||
        (result.status !== status && !(status === "TRANSFERRED" && result.status === "COMPLETED")) || result.unitOfMeasure !== command.unitOfMeasure ||
        !isDeepStrictEqual(result.ownerRef, command.ownerRef) || !isDeepStrictEqual(result.manifestRef, command.manifestRef) ||
        exact.compare(result.quantity, command.quantity) !== 0 || !Number.isSafeInteger(result.revision) ||
        ["TRANSFERRED", "COMPLETED"].includes(status) && !isDeepStrictEqual(result.recipientRef, command.recipientRef) ||
        result.status === "TRANSFERRED" && result.destinationHold !== "HELD" ||
        result.status === "COMPLETED" && (result.destinationHold !== "RELEASED" || typeof result.finalizedAt !== "string" ||
          !Number.isFinite(Date.parse(result.finalizedAt)))) throw new Error("Carbon component receipt is unconfirmed");
    return { status, operationKey: command.operationKey, reference: input.component.reference,
      quantity: input.component.quantity, receiptCode: command.operationKey, evidence: result };
  },
  /**
   * Reuses the original Carbon reservation; owner reserve rechecks current issuance eligibility.
   * @param {Object} r Admitted tenant and correlation context for the original bundle component.
   * @param {Object} input Original component/reference/quantity, ownerRef, operationKey, manifest
   * identity/count and recipientRef for transfer/finalize.
   * @returns {Promise<Object>} RESERVED receipt with exact original component and owner evidence.
   * @remarks Effects: Acquires/replays the original Carbon quantity hold.
   * Failure behavior: Transport or receipt mismatch rejects; no successful phase is inferred from HTTP
   * acknowledgement.
   * @override Owner must recheck current issuance eligibility. Preserve command and receipt validation.
   */
  reserve: async function (r, input) {
    return this.receipt(input, await this.remote(r, "/carbon/reservations", this.command(input)), "RESERVED");
  },
  /**
   * Transfers exact quantity into a recipient hold; unknown outcomes reconcile the same operation.
   * @param {Object} r Admitted tenant and correlation context for the original bundle component.
   * @param {Object} input Original component/reference/quantity, ownerRef, operationKey, manifest
   * identity/count and recipientRef for transfer/finalize.
   * @returns {Promise<Object>} TRANSFERRED receipt with exact original component and owner evidence.
   * @remarks Effects: Transfers exact quantity to the recipient while retaining a destination hold.
   * Failure behavior: Transport or receipt mismatch rejects; no successful phase is inferred from HTTP
   * acknowledgement.
   * @override Unknown outcome must reconcile the same operation; never release or repeat with a new key.
   * Preserve command and receipt validation.
   */
  transfer: async function (r, input) {
    return this.receipt(input, await this.remote(r, "/carbon/transfers", this.command(input)), "TRANSFERRED");
  },
  /**
   * Unlocks the original recipient hold only when Digital reaches its all-transferred finalization phase.
   * @param {Object} r Admitted tenant and correlation context for the original bundle component.
   * @param {Object} input Original component/reference/quantity, ownerRef, operationKey, manifest
   * identity/count and recipientRef for transfer/finalize.
   * @returns {Promise<Object>} COMPLETED receipt with exact original component and owner evidence.
   * @remarks Effects: Releases the original destination lock after whole-bundle transfer.
   * Failure behavior: Transport or receipt mismatch rejects; no successful phase is inferred from HTTP
   * acknowledgement.
   * @override Call only after every component transfer is confirmed. Preserve command and receipt
   * validation.
   */
  finalize: async function (r, input) {
    return this.receipt(input, await this.remote(r, "/carbon/transfers/finalize", this.command(input)), "COMPLETED");
  },
  /**
   * Releases the exact original reserved quantity without reversing transfers.
   * @param {Object} r Admitted tenant and correlation context for the original bundle component.
   * @param {Object} input Original component/reference/quantity, ownerRef, operationKey, manifest
   * identity/count and recipientRef for transfer/finalize.
   * @returns {Promise<Object>} RELEASED receipt with exact original component and owner evidence.
   * @remarks Effects: Releases the original untransferred Carbon reservation.
   * Failure behavior: Transport or receipt mismatch rejects; no successful phase is inferred from HTTP
   * acknowledgement.
   * @override Never reverse a transferred or finalized holding. Preserve command and receipt validation.
   */
  release: async function (r, input) {
    return this.receipt(input, await this.remote(r, "/carbon/releases", this.command(input)), "RELEASED");
  },
};
