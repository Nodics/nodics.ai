/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
const { isDeepStrictEqual } = require("node:util");

/**
 * @module bidding/service/defaultBiddingAuctionFundsEvidenceService
 * @description Authorizes Loyalty commands against retained auction intent, never HTTP owner claims.
 * @layer service
 * @owner bidding
 * @remarks Bidding funds evidence authorizes only persisted original round intents. Loyalty owns
 * protected holds and Checkout supplies terminal purchase fences; Commerce's single spending owner
 * supplies current actor ceilings.
 * Inputs and outputs are specified on each exported member below.
 * Effects and failures remain in the existing owner flow; missing evidence is never synthetic success.
 * Exported members: spend, authorize.
 * @override Customize through the existing loader-visible module members, preserving private
 * authority.
 */
module.exports = {
  /**
   * Consumes one Commerce-owned spend policy; Loyalty never assigns a second actor limit.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {Object} round Persisted original Bidding round and retained terms.
   * @param {string} operation Fixed owner operation selected by the adapter.
   * @param {Object} command Exact original owner command including immutable identity and idempotency
   * key.
   * @returns {Promise<Object>} Exact typed owner/actor/amount/currency spend admission.
   * @remarks Effects: Calls effective Commerce spending policy with detached retained round/command; no
   * wallet effect.
   * Failure behavior: Rejects absent owner or malformed/mismatched admission.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  spend: async function (request, round, operation, command) {
    const auctions = SERVICE.DefaultBiddingAuctionService;
    const owner = SERVICE[CONFIG.get("bidding").auction.spendService];
    if (typeof owner?.evaluateAuction !== "function") auctions.fail("Commerce spend admission is unavailable");
    const result = await owner.evaluateAuction(request, { round: structuredClone(round), operation, command: structuredClone(command) });
    if (result?.confirmed !== true || !isDeepStrictEqual(result.ownerRef, command.ownerRef) ||
        !isDeepStrictEqual(result.actorRef, command.actorRef) || result.amount !== command.amount ||
        result.currency !== command.currency || typeof result.actorAuthorized !== "boolean" || typeof result.withinLimit !== "boolean")
      auctions.fail("Commerce spend admission is unavailable");
    return result;
  },
  /**
   * Returns only exact command evidence after the existing signed participant or scheduler admission.
   * @param {Object} input Operation input/selectors validated by this owner; supplied identities do not
   * grant authority.
   * @returns {Promise<Object>} Exact original command proof and any required Checkout/spend evidence.
   * @remarks Effects: Re-admits participant/scheduler and reads retained round; never executes a fund
   * command.
   * Failure behavior: Rejects foreign actor, unsupported operation, changed terms, missing
   * hold/intention or terminal mismatch.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  authorize: async function (input) {
    const auctions = SERVICE.DefaultBiddingAuctionService, p = input.payload || {}, operation = p.operation;
    const supplied = p.command || {};
    const base = { ...input, payload: { storeCode: supplied.storeCode }, storeCode: supplied.storeCode };
    let request;
    if (input.authData?.principalType === "service") {
      request = auctions.scheduler(base);
      const store = CONFIG.get("bidding").stores[supplied.storeCode];
      if (store?.enterpriseCode !== request.enterpriseCode) auctions.fail("Auction scheduler partition mismatch");
    } else request = await auctions.participant(base);
    const round = await auctions.load(request, supplied.roundCode), pending = round.pending;
    const same = (a, b) => isDeepStrictEqual(a, b);
    if (operation === "qualify") {
      if (!request.buyerRef || !auctions.intake(round) || auctions.same(request.buyerRef, round.sellerRef) ||
          !same(request.buyerRef, supplied.ownerRef) || !same(request.actorRef, supplied.actorRef) ||
          supplied.currency !== round.currency || supplied.productCode !== round.productCode)
        auctions.fail("Auction buyer qualification is not authorized");
      auctions.amount(supplied.amount, round.floor);
      if (supplied.reservationCode && !Object.values(round.bids).some(bid =>
        bid.reservation?.code === supplied.reservationCode && auctions.same(bid.buyerRef, request.buyerRef)))
        auctions.fail("Original auction hold is not owned by this buyer");
      return { confirmed: true, tenant: input.tenant, operation, command: supplied,
        spendAdmission: await this.spend(request, round, operation, supplied) };
    }
    let bid = round.bids[supplied.sourceCode], key, checkoutRequired = false;
    if (["reserve", "adjust"].includes(operation) && ["PLACE", "UPDATE"].includes(pending?.action) &&
        pending.bidCode === supplied.sourceCode && round.policy.holdTiming === "RESERVE_ON_BID") {
      if (operation === "adjust" && supplied.idempotencyKey === pending.key + ":restore-original" &&
          pending.action === "UPDATE" && pending.fundedBid && !auctions.intake(round)) key = supplied.idempotencyKey;
      else if ((operation === "reserve") === (pending.action === "PLACE")) {
        key = pending.key + ":funds";
        bid = { ...bid, code: pending.bidCode, buyerRef: pending.buyerRef, actorRef: pending.actorRef,
          buyerId: pending.buyerId, amount: pending.amount, funding: pending.funding };
      }
    } else if (operation === "reserve" && pending?.chosenBidCode === bid?.code &&
        round.policy.holdTiming === "RESERVE_ON_SELECTION") key = pending.key + ":winner-funds";
    else if (operation === "inspect" && ["SELECT", "CLOSE"].includes(pending?.action) && bid?.status === "OPEN")
      key = pending.key + ":inspect:" + bid.code;
    else if (operation === "release" && pending && bid && bid.code !== round.selection?.bidCode &&
        ["WITHDRAWN", "UNSUCCESSFUL", "CANCELLED", "EXPIRED"].includes(bid.status))
      key = pending.key + ":release:" + bid.code;
    else if (["capture", "release"].includes(operation) && round.status === "SELECTED" &&
        bid?.code === round.selection?.bidCode && supplied.orderCode === round.selection.checkout?.orderCode) {
      key = supplied.idempotencyKey;
      checkoutRequired = true;
    }
    if (!bid || !key || !supplied.idempotencyKey || (!request.buyerRef && input.authData?.principalType !== "service" &&
        !auctions.isSeller(request, round)) || input.authData?.principalType !== "service" &&
        !auctions.same(request.buyerRef, bid.buyerRef) && !auctions.isSeller(request, round))
      auctions.fail("Auction funds command is not authorized");
    const expected = auctions.fundsPayload(round, bid, key);
    if (checkoutRequired) expected.orderCode = round.selection.checkout.orderCode;
    if (!same(JSON.parse(JSON.stringify(expected)), JSON.parse(JSON.stringify(supplied))))
      auctions.fail("Auction funds terms do not match persisted intent");
    return { confirmed: true, tenant: input.tenant, operation, command: expected, checkoutRequired,
      ...(["reserve", "adjust", "inspect"].includes(operation)
        ? { spendAdmission: await this.spend(request, round, operation, expected) } : {}) };
  },
};
