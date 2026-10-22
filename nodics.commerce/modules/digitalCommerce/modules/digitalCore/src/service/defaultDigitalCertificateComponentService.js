/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/**
 * @module digitalCore/service/defaultDigitalCertificateComponentService
 * @description Maps fixed certificate component phases to the qualified ownership transport.
 * Inputs: Original admitted request and immutable bundle component command.
 * Outputs: Canonical certificate owner phase evidence; coordinating bundle validates completion.
 * Effects: Inspect reads; reserve/transfer/finalize/release execute canonical certificate owner phases.
 * Failure behavior: Transport/domain errors propagate; this adapter fabricates neither authority nor
 * receipts.
 * Exported members: inspect, reserve, transfer, finalize, release, invoke.
 * @owner digitalCore
 * @layer service
 * @override Replace effective provider members only while preserving fixed phase paths and operationKey
 * idempotency.
 * @see ../../llm/contracts/bundle-holdings-and-gifts.md
 */
module.exports = {
  /**
   * Reads canonical certificate eligibility.
   * @param {Object} r Admitted tenant and correlation context for the original bundle component.
   * @param {Object} input Original component/reference/quantity, ownerRef, operationKey, manifest
   * identity/count and recipientRef for transfer/finalize.
   * @returns {Promise<Object>} Canonical certificate owner's inspect evidence; bundle coordinator validates
   * the phase receipt.
   * @remarks Effects: Reads canonical certificate eligibility without changing rights.
   * Failure behavior: Qualified ownership transport or domain refusal propagates; there is no local success
   * fallback.
   * @override Keep fixed bundle-inspect dispatch and exact original operation key.
   */
  inspect: function (r, input) { return this.invoke(r, input, "inspect"); },
  /**
   * Acquires a canonical certificate hold.
   * @param {Object} r Admitted tenant and correlation context for the original bundle component.
   * @param {Object} input Original component/reference/quantity, ownerRef, operationKey, manifest
   * identity/count and recipientRef for transfer/finalize.
   * @returns {Promise<Object>} Canonical certificate owner's reserve evidence; bundle coordinator validates
   * the phase receipt.
   * @remarks Effects: Acquires the original certificate hold.
   * Failure behavior: Qualified ownership transport or domain refusal propagates; there is no local success
   * fallback.
   * @override Keep fixed bundle-reserve dispatch and exact original operation key.
   */
  reserve: function (r, input) { return this.invoke(r, input, "reserve"); },
  /**
   * Transfers ownership while retaining the bundle hold.
   * @param {Object} r Admitted tenant and correlation context for the original bundle component.
   * @param {Object} input Original component/reference/quantity, ownerRef, operationKey, manifest
   * identity/count and recipientRef for transfer/finalize.
   * @returns {Promise<Object>} Canonical certificate owner's transfer evidence; bundle coordinator validates
   * the phase receipt.
   * @remarks Effects: Transfers beneficial ownership while keeping the bundle hold.
   * Failure behavior: Qualified ownership transport or domain refusal propagates; there is no local success
   * fallback.
   * @override Keep fixed bundle-transfer dispatch and exact original operation key.
   */
  transfer: function (r, input) { return this.invoke(r, input, "transfer"); },
  /**
   * Unlocks a fully transferred bundle component.
   * @param {Object} r Admitted tenant and correlation context for the original bundle component.
   * @param {Object} input Original component/reference/quantity, ownerRef, operationKey, manifest
   * identity/count and recipientRef for transfer/finalize.
   * @returns {Promise<Object>} Canonical certificate owner's finalize evidence; bundle coordinator validates
   * the phase receipt.
   * @remarks Effects: Unlocks the original recipient holding after all bundle transfers.
   * Failure behavior: Qualified ownership transport or domain refusal propagates; there is no local success
   * fallback.
   * @override Keep fixed bundle-finalize dispatch and exact original operation key.
   */
  finalize: function (r, input) { return this.invoke(r, input, "finalize"); },
  /**
   * Releases only an original untransferred hold.
   * @param {Object} r Admitted tenant and correlation context for the original bundle component.
   * @param {Object} input Original component/reference/quantity, ownerRef, operationKey, manifest
   * identity/count and recipientRef for transfer/finalize.
   * @returns {Promise<Object>} Canonical certificate owner's release evidence; bundle coordinator validates
   * the phase receipt.
   * @remarks Effects: Releases only the original untransferred hold.
   * Failure behavior: Qualified ownership transport or domain refusal propagates; there is no local success
   * fallback.
   * @override Keep fixed bundle-release dispatch and exact original operation key.
   */
  release: function (r, input) { return this.invoke(r, input, "release"); },
  /**
   * Reuses the reviewed cross-runtime service boundary, not a remote runtime's local registry.
   * @param {Object} r Admitted tenant and correlation context for the original bundle component.
   * @param {Object} input Original component/reference/quantity, ownerRef, operationKey, manifest
   * identity/count and recipientRef for transfer/finalize.
   * @param {string} phase Internal inspect/reserve/transfer/finalize/release selector from the fixed
   * wrappers.
   * @returns {Promise<Object>} Canonical ownership transport result, without a local synthesized receipt.
   * @remarks Effects: Invokes bundle-<phase> with a copied command whose idempotencyKey equals operationKey.
   * Failure behavior: Missing/unqualified transport or domain rejection propagates; this helper does not
   * locally validate phase.
   * @override Only fixed wrapper phases may enter this port; never call another runtime's local registry.
   */
  invoke: function (r, input, phase) {
    return SERVICE.DefaultDigitalCommerceOwnershipService.remote(r, "bundle-" + phase,
      { ...input, idempotencyKey: input.operationKey });
  },
};
