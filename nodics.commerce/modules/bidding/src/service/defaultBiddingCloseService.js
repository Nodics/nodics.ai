/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
const { isDeepStrictEqual } = require('node:util');

/**
 * @module bidding/service/defaultBiddingCloseService
 * @description Durable idempotent due-work entry points invoked by the existing authorized scheduler.
 * @layer service
 * @owner bidding
 * @remarks Bidding due work is inert unless explicitly selected. Every batch retains original signed
 * scheduler and bounded keyset progress; original immutable deadlines and exact Checkout
 * reconciliation control closing, never wall-clock timeout alone.
 * Inputs and outputs are specified on each exported member below.
 * Effects and failures remain in the existing owner flow; missing evidence is never synthetic success.
 * Exported members: sweep, reconcile, close, runDue.
 * @override Customize through the existing loader-visible module members, preserving private
 * authority.
 */
module.exports = {
  /**
   * Existing Cronjob startNode callable; inert until selected, bounded and always re-admitted by the
   * operational owner.
   * @param {Object} input Operation input/selectors validated by this owner; supplied identities do not
   * grant authority.
   * @returns {Promise<Object>} Per-round results, continuation and completion flag.
   * @remarks Effects: Bounded repeated due pages through the same operational owner; no implicit
   * timer/activation.
   * Failure behavior: Rejected rounds remain explicit failures; invalid authority/bounds reject.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  sweep: async function (input) {
    const p = structuredClone(CONFIG.get('bidding')?.auction?.scheduler), tenant = input.definition?.tenant;
    if (p?.enabled !== true || p.startNode !== 'DefaultBiddingCloseService.sweep' ||
        !Number.isSafeInteger(p.maximumPages) || p.maximumPages < 1 || !tenant ||
        p.target?.moduleName !== 'bidding' || !p.target.connectionName || p.target.targetAuthority?.runtimeRole !== 'COMMERCE' ||
        !Number.isSafeInteger(p.target.timeoutMs) || p.target.timeoutMs < 1 || p.target.maxAttempts !== 1 ||
        input.definition?.jobDetail?.startNode !== p.startNode) throw new Error('Auction scheduler callable is not admitted');
    const auth = structuredClone(await SERVICE.DefaultCronJobService.assertOperational(tenant));
    if (!isDeepStrictEqual(auth, input.authData)) throw new Error('Original scheduler principal changed');
    const token = NODICS.getInternalAuthToken?.(tenant);
    if (typeof token !== 'string' || !token) throw new Error('Scheduler runtime credential is unavailable');
    const results = [];
    let afterCode = null;
    for (let page = 0; page < p.maximumPages; page++) {
      if (!isDeepStrictEqual(p, CONFIG.get('bidding').auction.scheduler) ||
          !isDeepStrictEqual(auth, await SERVICE.DefaultCronJobService.assertOperational(tenant)) ||
          token !== NODICS.getInternalAuthToken(tenant)) throw new Error('Original scheduler authority changed');
      const batch = SERVICE.DefaultBiddingAuctionPortsService.unwrap(await SERVICE.DefaultModuleService.invokeModule({
        ...p.target, local: false, tenant, methodName: 'POST', apiName: '/internal/auctions/close-due',
        header: { Authorization: 'Bearer ' + token, tenant }, requestBody: { afterCode },
        followRedirects: false, rejectUnauthorized: true }));
      if (!Array.isArray(batch?.results) || !(batch.afterCode === null || typeof batch.afterCode === 'string' && batch.afterCode > (afterCode || '')))
        throw new Error('Auction scheduler result is unconfirmed');
      results.push(...batch.results); afterCode = batch.afterCode;
      if (!afterCode) break;
    }
    return { results, afterCode, complete: afterCode === null };
  },
  /**
   * Closes an unrecoverable selected attempt only on final Checkout reconciliation, without selecting a
   * replacement.
   * @param {Object} input Operation input/selectors validated by this owner; supplied identities do not
   * grant authority.
   * @returns {Promise<Object>} Original selected round code/status/revision after positive
   * reconciliation.
   * @remarks Effects: May close failed selected attempt only after exact Checkout proof; never selects
   * another winner.
   * Failure behavior: Rejects missing terminal funds/holdings evidence or competing intent.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  reconcile: async function (input) {
    const auctions = SERVICE.DefaultBiddingAuctionService, request = auctions.scheduler(input);
    let round = await auctions.load(request, request.code);
    if (round.status === "FAILED") {
      if (round.pending) round = await auctions.resume(request, round);
      return { code: round.code, status: round.status, revision: round.revision };
    }
    const bidCode = round.selection?.bidCode || round.pending?.chosenBidCode;
    if (!bidCode) auctions.fail("There is no selected attempt to reconcile");
    const bid = round.bids[bidCode], key = auctions.hash([round.code, bidCode, "FAILED_RECONCILED"]);
    const proof = await auctions.ports().reconcileCheckout(request, { round, bid, idempotencyKey: key });
    if (proof?.confirmed !== true || proof.outcome !== "FAILED_RECONCILED" || proof.bidCode !== bidCode ||
        proof.fundsReconciled !== true || proof.holdingsAvailable !== true || proof.noPendingPurchase !== true ||
        typeof proof.receiptCode !== "string" || !proof.receiptCode)
      auctions.fail("Selected purchase is not fully reconciled");
    const selection = { ...round.selection, bidCode, bidRevision: bid.revision, amount: bid.amount,
      buyerRef: bid.buyerRef, buyerId: bid.buyerId, sellerRef: round.sellerRef,
      reconciliation: proof };
    const bids = Object.fromEntries(Object.values(round.bids).map((item) => [item.code,
      ["OPEN", "SELECTED"].includes(item.status) ? { ...item, status: "UNSUCCESSFUL" } : item]));
    // Preserve the original pending fingerprint so retrying the failed command cannot restart funding.
    round = await auctions.save(request, round, { status: "FAILED", selection, bids, cleanupComplete: false,
      pending: round.pending || { action: "RECONCILE", key, hash: key } });
    round = await auctions.resume(request, round);
    return { code: round.code, status: round.status, revision: round.revision };
  },
  /**
   * Reconciles any retained command before applying the original immutable end/grace deadline.
   * @param {Object} input Operation input/selectors validated by this owner; supplied identities do not
   * grant authority.
   * @returns {Promise<Object>} Original round code/status/revision.
   * @remarks Effects: Resumes retained command then applies immutable end/grace transitions.
   * Failure behavior: Rejects unauthorized runtime or unresolved original owner effects.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  close: async function (input) {
    const auctions = SERVICE.DefaultBiddingAuctionService, request = auctions.scheduler(input);
    let round = await auctions.load(request, request.code);
    if (round.pending) round = await auctions.resume(request, round);
    round = await auctions.notify(request, round);
    if (!["OPEN", "GRACE"].includes(round.status) || round.endsAt === null || auctions.now() < Date.parse(round.endsAt))
      return { code: round.code, status: round.status, revision: round.revision };
    const phase = auctions.now() < Date.parse(round.graceEndsAt) ? "END" : "GRACE";
    const key = auctions.hash([round.code, phase, round.endsAt, round.graceEndsAt]);
    if (!round.commands[key]) {
      round = await auctions.save(request, round, { pending: { action: "CLOSE", key, hash: key } });
      round = await auctions.resume(request, round);
    }
    return { code: round.code, status: round.status, revision: round.revision };
  },
  /**
   * Processes a complete ordered page and returns a continuation; failures remain visible and retryable.
   * @param {Object} input Operation input/selectors validated by this owner; supplied identities do not
   * grant authority.
   * @returns {Promise<Object>} Ordered bounded results and afterCode continuation.
   * @remarks Effects: Reads due rounds and executes each through the same admitted close operation.
   * Failure behavior: Invalid/failed page reads reject; per-round failures remain visible.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  runDue: async function (input) {
    const auctions = SERVICE.DefaultBiddingAuctionService, request = auctions.scheduler(input), size = auctions.policy().duePageSize;
    if (input.afterCode !== null && input.afterCode !== undefined &&
        (typeof input.afterCode !== 'string' || !/^AUCTION_[a-f0-9]{64}$/.test(input.afterCode))) auctions.fail('Invalid auction continuation');
    const rows = await auctions.records(request, {
      ...(input.afterCode ? { code: { $gt: input.afterCode } } : {}),
      $or: [ { pending: { $ne: null } },
        ...(CONFIG.get('bidding').auction.notifications?.enabled === true ? [{ notificationPending: true }] : []),
        { status: 'OPEN', endsAt: { $ne: null, $lte: new Date(auctions.now()) } },
        { status: 'GRACE', graceEndsAt: { $ne: null, $lte: new Date(auctions.now()) } } ],
    }, { pageSize: size, pageNumber: 1, sort: { code: 1 } });
    const results = [];
    for (const round of rows) {
      try { results.push(await this.close({ ...request, code: round.code })); }
      catch (error) {
        await auctions.notify(request, await auctions.load(request, round.code));
        results.push({ code: round.code, status: "RECOVERY_REQUIRED", errorCode: error.code || "ERR_BIDDING_RECOVERY" });
      }
    }
    return { results, afterCode: rows.length === size ? rows[rows.length - 1].code : null };
  },
};
