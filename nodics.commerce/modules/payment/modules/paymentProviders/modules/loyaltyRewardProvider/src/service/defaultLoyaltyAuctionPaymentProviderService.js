/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
const { isDeepStrictEqual: same } = require("node:util");
/**
 * @module loyaltyRewardProvider/service/defaultLoyaltyAuctionPaymentProviderService
 * @description Adopts the original selected auction hold through real Loyalty APIs; no generic
 * reservation or refund fallback.
 * @layer service
 * @owner loyaltyRewardProvider
 * @remarks The Loyalty auction Payment adapter consumes protected original holds through configured
 * owner routes. Checkout owns terminal capture/release proof; no generic reserve/refund fallback or
 * caller-selected hold is introduced.
 * Inputs and outputs are specified on each exported member below.
 * Effects and failures remain in the existing owner flow; missing evidence is never synthetic success.
 * Exported members: receipt, execute.
 * @override Customize through the existing loader-visible module members, preserving private
 * authority.
 */
module.exports = {
  /**
   * Validates exact original receipt projection before reporting a Payment outcome.
   * @param {Object} response Canonical owner response envelope.
   * @param {Object} command Exact original owner command including immutable identity and idempotency
   * key.
   * @param {string} operation Fixed owner operation selected by the adapter.
   * @returns {Object} Verified exact original receipt projection.
   * @remarks Effects: Pure owner evidence validation before reporting Payment outcome.
   * Failure behavior: Rejects foreign/mismatched command, amount, hold or operation receipt.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  receipt: function (response, command, operation) {
    const owner = SERVICE.DefaultLoyaltyRewardPaymentProviderService;
    const result = owner.normalizeLoyaltyResponse(response), reservation = result?.reservation;
    const status = { inspect: "RESERVED", capture: "CAPTURED", release: "RELEASED" }[operation];
    if (result?.confirmed !== true || !reservation || reservation.status !== status || reservation.code !== command.reservationCode ||
        reservation.expiresAt !== null || reservation.holdUntilRelease !== true ||
        ["walletCode", "programCode", "rewardTypeCode"].some(key => reservation[key] !== command[key]) ||
        SERVICE.DefaultExactAmountService.compare(reservation.amount, command.amount) !== 0 ||
        operation === "inspect" && (result.eligible !== true || !same(result.ownerRef, command.ownerRef) ||
          SERVICE.DefaultExactAmountService.compare(result.amount, command.amount) !== 0) ||
        operation === "capture" && (typeof result.redemptionCode !== "string" || !result.redemptionCode))
      throw new Error("Original auction funds outcome is unconfirmed");
    return result;
  },
  /**
   * Preserves original signed participant credentials while consuming the configured Loyalty auction
   * owner.
   * @param {Object} input Operation input/selectors validated by this owner; supplied identities do not
   * grant authority.
   * @returns {Promise<Object>} AUTHORIZED, CAPTURED or VOIDED provider result with original reference.
   * @remarks Effects: Revalidates original signed participant and delegates only configured protected
   * auction operation.
   * Failure behavior: Rejects absent terminal proof, changed commitment or uncertain Loyalty
   * acknowledgement.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  execute: async function (input) {
    if (!["AUTHORIZE", "CAPTURE", "VOID"].includes(input.operation))
      throw new Error("Auction capture cannot use generic refund compensation");
    const checkout = SERVICE.DefaultCheckoutAuctionService;
    const { request, row, command: original } = await checkout.paymentTerms(input);
    const operation = { AUTHORIZE: "inspect", CAPTURE: "capture", VOID: "release" }[input.operation];
    const command = { ...original, orderCode: row.orderCode };
    if (["walletCode", "programCode", "rewardTypeCode"].some(key => input[key] !== command[key]) ||
        input.operation !== "AUTHORIZE" && input.providerReference !== command.reservationCode)
      throw new Error("Auction payment account or original reservation changed");
    if (input.operation === "AUTHORIZE" && row.terminal) throw new Error("Auction purchase already has a terminal funds decision");
    if (operation !== "inspect") await checkout.fence(request, operation, command);
    const config = SERVICE.DefaultLoyaltyRewardPaymentProviderService.providerConfig();
    const path = config.auctionPaths?.[operation];
    if (typeof path !== "string" || !path.startsWith("/auction-funds/")) throw new Error("Auction payment target is unavailable");
    const response = await SERVICE.DefaultModuleService.invokeModule({ ...config.loyaltyTarget, local: false,
      tenant: request.tenant, apiName: path, methodName: "POST", idempotencyKey: command.idempotencyKey,
      header: { Authorization: request.authorization, "X-Enterprise-Code": request.participantEnterpriseCode },
      request: { tenant: request.tenant, authData: request.authData, payload: command }, requestBody: command });
    const result = this.receipt(response, command, operation);
    return { reference: operation === "capture" ? result.redemptionCode : result.reservation.code,
      status: { inspect: "AUTHORIZED", capture: "CAPTURED", release: "VOIDED" }[operation],
      providerCode: config.providerCode, loyalty: result };
  }
};
