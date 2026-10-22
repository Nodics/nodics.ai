/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";

/**
 * @module bidding/service/defaultBiddingAuctionPortsService
 * @description Explicit owner ports for auction funds, listing locks and Checkout; never manufactures
 * owner acknowledgements.
 * @layer service
 * @owner bidding
 * @remarks Bidding ports are thin effective-owner adapters, not independent fund or purchase engines.
 * Loyalty owns auction money; Digital owns holdings; Checkout owns selected purchase. Fixed configured
 * targets and original keys remain mandatory.
 * Inputs and outputs are specified on each exported member below.
 * Effects and failures remain in the existing owner flow; missing evidence is never synthetic success.
 * Exported members: policy, unwrap, funds, qualify, inspect, reserve, adjust, release, owner,
 * publication, releaseListing, prepareCheckout, bindCheckout, reconcileCheckout.
 * @override Customize through the existing loader-visible module members, preserving private
 * authority.
 */
module.exports = {
  /**
   * Reads the complete framework-owned adapter definitions.
   * @returns {Object} Effective auction adapter definitions.
   * @remarks Effects: Reads implementing Bidding properties only.
   * Failure behavior: Missing owner configuration fails at the dependent operation.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  policy: function () { return CONFIG.get("bidding").auction; },
  /**
   * Rejects owner error envelopes before extracting evidence.
   * @param {Object} value Owner input value; exact shape is constrained by this operation's retained
   * source contract.
   * @returns {*} Canonical owner payload after success-envelope validation.
   * @remarks Effects: Pure bounded envelope normalization.
   * Failure behavior: Rejects owner error/malformed envelopes before accepting evidence.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  unwrap: function (value) {
    for (let i = 0; i < 8 && value; i++) {
      if (value.success === false || value.error || /^ERR_/.test(value.code || "") ||
          (value.errors && (!Array.isArray(value.errors) || value.errors.length)))
        SERVICE.DefaultBiddingService.fail("Auction owner evidence is unavailable");
      if (value.data !== undefined) value = value.data;
      else if (value.result !== undefined) value = value.result;
      else return value;
    }
    SERVICE.DefaultBiddingService.fail("Auction owner evidence is unavailable");
  },
  /**
   * Delegates to the Loyalty API with stable operation identity and retained canonical owner context.
   * @param {string} operation Fixed owner operation selected by the adapter.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {Object} payload Bounded original owner command selectors.
   * @returns {Promise<Object>} Original protected Loyalty operation receipt.
   * @remarks Effects: Calls one fixed auction-funds route using original participant/hold context.
   * Failure behavior: Rejects absent route/target and propagates uncertain owner response.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  funds: async function (operation, request, payload) {
    const target = this.policy().loyaltyTarget, path = this.policy().fundsPaths[operation];
    if (!path) SERVICE.DefaultBiddingService.fail("Auction funds operation is unavailable");
    return this.unwrap(await SERVICE.DefaultModuleService.invokeModule({
      ...target, local: false, tenant: request.tenant,
      apiName: path.replace(":code", encodeURIComponent(payload.reservationCode || "")),
      methodName: "POST", idempotencyKey: payload.idempotencyKey,
      header: { Authorization: request.authorization, "X-Enterprise-Code": request.participantEnterpriseCode || request.enterpriseCode },
      request: { tenant: request.tenant, authData: request.authData, payload },
      requestBody: payload,
    }));
  },
  /**
   * Qualification includes owner/actor admission, spending limits, precision and canonical reward
   * selection.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {Object} payload Bounded original owner command selectors.
   * @returns {Promise<Object>} Canonical Loyalty qualify evidence for the exact original command.
   * @remarks Effects: Read-only current funds/owner eligibility check.
   * Failure behavior: Owner denial, stale original terms or uncertain acknowledgement reject.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  qualify: function (request, payload) { return this.funds("qualify", request, payload); },
  /**
   * Eligibility must be authoritative; unknown funds cannot be treated as an ineligible bidder.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {Object} payload Bounded original owner command selectors.
   * @returns {Promise<Object>} Canonical Loyalty inspect evidence for the exact original command.
   * @remarks Effects: Read-only current funds/owner eligibility check.
   * Failure behavior: Owner denial, stale original terms or uncertain acknowledgement reject.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  inspect: function (request, payload) { return this.funds("inspect", request, payload); },
  /**
   * Reserves the full exact offer through the protected Loyalty auction adapter.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {Object} payload Bounded original owner command selectors.
   * @returns {Promise<Object>} Canonical Loyalty reserve evidence for the exact original command.
   * @remarks Effects: Delegates protected original hold mutation with stable key; no generic
   * reserve/refund fallback.
   * Failure behavior: Owner denial, stale original terms or uncertain acknowledgement reject.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  reserve: function (request, payload) { return this.funds("reserve", request, payload); },
  /**
   * Adjusts a retained hold atomically; release-then-reserve is forbidden.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {Object} payload Bounded original owner command selectors.
   * @returns {Promise<Object>} Canonical Loyalty adjust evidence for the exact original command.
   * @remarks Effects: Delegates protected original hold mutation with stable key; no generic
   * reserve/refund fallback.
   * Failure behavior: Owner denial, stale original terms or uncertain acknowledgement reject.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  adjust: function (request, payload) { return this.funds("adjust", request, payload); },
  /**
   * Releases only the retained original hold through auction-owner admission.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {Object} payload Bounded original owner command selectors.
   * @returns {Promise<Object>} Canonical Loyalty release evidence for the exact original command.
   * @remarks Effects: Delegates protected original hold mutation with stable key; no generic
   * reserve/refund fallback.
   * Failure behavior: Owner denial, stale original terms or uncertain acknowledgement reject.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  release: function (request, payload) { return this.funds("release", request, payload); },
  /**
   * Resolves a concrete configured owner method without executing caller-provided names.
   * @param {Object} key Owner input key; exact shape is constrained by this operation's retained source
   * contract.
   * @param {string} operation Fixed owner operation selected by the adapter.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {Object} payload Bounded original owner command selectors.
   * @returns {Promise<Object>} Result of the fixed configured owner's operation.
   * @remarks Effects: Delegates only server-selected service/method; effects belong to that owner.
   * Failure behavior: Rejects missing configured service/method or propagates owner failure.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  owner: function (key, operation, request, payload) {
    const service = SERVICE[this.policy()[key]];
    if (typeof service?.[operation] !== "function")
      SERVICE.DefaultBiddingService.fail("Auction owner port unavailable: " + key + "." + operation);
    return service[operation](request, payload);
  },
  /**
   * Product/Digital proves current publication and listing holds before a round is admitted.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {Object} payload Bounded original owner command selectors.
   * @returns {Promise<Object>} Current Product/Digital publication and held-content proof.
   * @remarks Effects: Read-only owner validation before round admission.
   * Failure behavior: Rejects absent or contradictory publication/hold evidence.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  publication: function (request, payload) { return this.owner("listingService", "publication", request, payload); },
  /**
   * Releases listing holdings only after cancellation/unsold is durable and funds reconciled.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {Object} payload Bounded original owner command selectors.
   * @returns {Promise<Object>} Confirmed original listing release receipt.
   * @remarks Effects: Delegates holdings release only after retained terminal/funds fences.
   * Failure behavior: Rejects unresolved purchase or unconfirmed release evidence.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  releaseListing: function (request, payload) { return this.owner("listingService", "release", request, payload); },
  /**
   * Checkout owns post-intake purchase validity and immutable order/cart identities.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {Object} payload Bounded original owner command selectors.
   * @returns {Promise<Object>} Original selected Cart/Order and retained purchase deadline.
   * @remarks Effects: Delegates Checkout commitment preparation, never creates a second hold.
   * Failure behavior: Rejects changed selected terms or uncertain commitment creation.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  prepareCheckout: function (request, payload) { return this.owner("checkoutService", "prepare", request, payload); },
  /**
   * Checkout adopts the original funds reservation and selected Pricing quote exactly once.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {Object} payload Bounded original owner command selectors.
   * @returns {Promise<Object>} Original Checkout binding to selected quote and reservation.
   * @remarks Effects: Delegates immutable entry/quote binding on existing selected purchase.
   * Failure behavior: Rejects replacement hold/quote or conflicting original identity.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  bindCheckout: function (request, payload) { return this.owner("checkoutService", "bind", request, payload); },
  /**
   * Reads final failed-purchase reconciliation from Checkout; a timeout or caller status is never
   * sufficient.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {Object} payload Bounded original owner command selectors.
   * @returns {Promise<Object>} Positive failed-purchase reconciliation or explicit recovery-required
   * result.
   * @remarks Effects: Reads Checkout's durable terminal evidence; no retry/re-award inference.
   * Failure behavior: Rejects failed proof reads; timeout or caller status never proves reconciliation.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  reconcileCheckout: function (request, payload) { return this.owner("checkoutService", "reconcile", request, payload); },
};
