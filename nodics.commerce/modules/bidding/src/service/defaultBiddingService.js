/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const crypto = require("node:crypto");
/**
 * @module bidding/service/defaultBiddingService
 * @description Owns participant-scoped pre-checkout bids, seller acceptance and accepted terms handed
 * to Pricing; Product remains the offer authority and Checkout alone reserves payment.
 * @layer service
 * @owner bidding
 * @override Configure eligible stores, validity and amount limits in later layers; preserve
 * participant authorization, durable acceptance, exact amounts and idempotency.
 * @remarks Bidding keeps negotiation and persisted auction ownership separate. Effective
 * identity/offer services come from framework configuration; requests cannot choose executable owners.
 * Private participant persistence and owner-held money remain outside caller control.
 * Inputs and outputs are specified on each exported member below.
 * Effects and failures remain in the existing owner flow; missing evidence is never synthetic success.
 * Exported members: policy, fail, participantContext, identity, sellerRef, sameRef, participantQuery,
 * context, records, command, hash, offer, project, list, participant, read, create, update, decide,
 * openAuction, auctionPublication, readAuction, listAuctions, commandAuction.
 * @override Customize through the existing loader-visible module members, preserving private
 * authority.
 */
module.exports = {
  /** Reads the layered negotiation policy; no caller may select a policy implementation. */
  policy: function () {
    return CONFIG.get("bidding") || {};
  },
  /** Returns a stable negotiation failure without exposing another customer's record. */
  fail: function (message) {
    throw new CLASSES.NodicsError("ERR_BIDDING_INVALID", message);
  },
  /**
   * Resolves a trusted participant through the configured identity owner; HTTP callers cannot choose a
   * service.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @returns {Promise<Object>} Fresh canonical participant context from the effective identity owner.
   * @remarks Effects: May read Profile identity/scopes; never rewrites a signed employee into a
   * customer.
   * Failure behavior: Propagates absent identity service or participant denial.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  participantContext: async function (request) {
    if (!this.policy().enabled)
      this.fail("Bidding is not enabled for this deployment");
    const runtime = CONFIG.get("runtimeRole"),
      role = typeof runtime === "string" ? runtime : runtime?.code;
    if (this.policy().runtimeRoles?.[role] !== true)
      throw new CLASSES.NodicsError(
        "ERR_BIDDING_RUNTIME_FORBIDDEN",
        "Bidding requires its configured operational Commerce runtime",
      );
    return this.identity().resolve(request);
  },
  /**
   * Resolves the layered seller-authorization seam without accepting executable input.
   * @returns {Object} Effective configured identity service.
   * @remarks Effects: Registry lookup only; no identity or permission mutation.
   * Failure behavior: Rejects missing or incompatible configured service.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  identity: function () {
    const service =
      SERVICE[this.policy().identityService];
    if (
      !service ||
      typeof service.resolve !== "function" ||
      typeof service.sellerRefs !== "function"
    )
      this.fail("Bidding identity policy is unavailable");
    return service;
  },
  /** Resolves a typed seller reference, retaining existing customer bids without a data rewrite. */
  sellerRef: function (bid) {
    return (
      bid.sellerRef || {
        module: "profile",
        schema: "customer",
        code: bid.sellerId,
      }
    );
  },
  /** Compares business references by their complete owning module, schema and code. */
  sameRef: function (left, right) {
    return (
      !!left &&
      !!right &&
      ["module", "schema", "code"].every((key) => left[key] === right[key])
    );
  },
  /** Builds exact participant predicates from trusted seller entitlements and checkout buyer identity. */
  participantQuery: function (request) {
    const query =
      request.authData.principalType === "customer"
        ? [{ buyerId: request.ownerId }]
        : [];
    for (const ref of request.sellerRefs || []) {
      query.push({
        "sellerRef.module": ref.module,
        "sellerRef.schema": ref.schema,
        "sellerRef.code": ref.code,
      });
      if (ref.module === "profile" && ref.schema === "customer")
        query.push({ sellerRef: { $exists: false }, sellerId: ref.code });
    }
    return query.length ? { $or: query } : { code: { $in: [] } };
  },
  /** Creates an internal schema context only after a customer or seller has been authorized. */
  context: function (request) {
    return SERVICE.DefaultNegotiatedPriceService.context(request);
  },
  /** Reads generated records with mandatory enterprise partitioning and a bounded result size. */
  records: async function (request, query, limit = 100) {
    const result = await SERVICE.DefaultCheckoutBidService.get({
      ...this.context(request),
      query: { ...query, enterpriseCode: request.enterpriseCode },
      searchOptions: { pageSize: limit, pageNumber: 1 },
    });
    return SERVICE.DefaultNegotiatedPriceService.records(result);
  },
  /** Requires a durable command identity and an explicit participant review confirmation. */
  command: function (request) {
    const key = request.idempotencyKey;
    if (
      request.payload?.confirmed !== true ||
      typeof key !== "string" ||
      !/^[A-Za-z0-9._:-]{8,180}$/.test(key)
    )
      this.fail("Review and confirm the terms with a valid command reference");
    return key;
  },
  /** Hashes immutable terms and request identities without embedding private values in public codes. */
  hash: function (value) {
    return crypto
      .createHash("sha256")
      .update(JSON.stringify(value))
      .digest("hex");
  },
  /**
   * Resolves generic Product eligibility through the server-owned offer contract.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {string} productCode Canonical published Product code.
   * @param {string} storeCode Canonical governed Store code.
   * @returns {Promise<Object>} Canonical eligible offer for the exact Product and Store.
   * @remarks Effects: Delegates read-only offer resolution.
   * Failure behavior: Rejects missing owner or unavailable/invalid offer.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  offer: async function (request, productCode, storeCode) {
    const service =
      SERVICE[this.policy().offerService];
    if (!service || typeof service.resolve !== "function")
      this.fail("Bidding offer policy is unavailable");
    return service.resolve(request, productCode, storeCode);
  },
  /** Returns only participant-safe negotiation fields and authoritative checkout completion state. */
  project: async function (request, bid) {
    const result = {
      code: bid.code,
      buyerId: bid.buyerId,
      buyerCustomerCode: bid.buyerCustomerCode,
      sellerId: bid.sellerId,
      sellerRef: this.sellerRef(bid),
      productCode: bid.productCode,
      displayName: bid.displayName,
      sourceRef: bid.sourceRef,
      variantCode: bid.variantCode,
      storeCode: bid.storeCode,
      currency: bid.currency,
      amount: bid.amount,
      quantity: bid.quantity,
      status: bid.status,
      revision: bid.revision,
      expiresAt: bid.expiresAt,
      createdAt: bid.createdAt,
      priceQuoteCode: bid.priceQuoteCode,
      cartCode: bid.cartCode,
      orderCode: bid.orderCode,
      policyVersion: bid.policyVersion,
      holdTiming: this.policy().holdTiming,
    };
    if (bid.orderCode) {
      const response = await SERVICE.DefaultCheckoutCheckpointService.get({
        ...this.context(request),
        query: {
          code: bid.orderCode,
          ownerId: bid.buyerId,
          enterpriseCode: request.enterpriseCode,
          status: "COMPLETED",
        },
        searchOptions: { pageSize: 1, pageNumber: 1 },
      });
      result.purchaseStatus = SERVICE.DefaultNegotiatedPriceService.records(
        response,
      ).length
        ? "COMPLETED"
        : "NOT_COMPLETED";
    }
    if (
      ["OPEN", "ACCEPTED"].includes(result.status) &&
      Date.parse(result.expiresAt) <= Date.now() &&
      result.purchaseStatus !== "COMPLETED"
    )
      result.status = "EXPIRED";
    return result;
  },
  /** Lists the authenticated participant's incoming and outgoing bids without exposing other negotiations. */
  list: async function (input) {
    const request = await this.participantContext(input);
    const bids = await this.records(request, {
      ...this.participantQuery(request),
      storeCode: { $in: Object.keys(this.policy().stores || {}) },
    });
    const output = [];
    for (const bid of bids) output.push(await this.project(request, bid));
    return {
      bids: output,
      holdTiming: this.policy().holdTiming,
      policyVersion: this.policy().policyVersion,
    };
  },
  /** Resolves a bid only for its buyer or seller, using the same failure for missing and inaccessible records. */
  participant: async function (request, code) {
    const bid = (
      await this.records(
        request,
        {
          code,
          ...this.participantQuery(request),
        },
        1,
      )
    )[0];
    if (!bid) this.fail("The bid was not found");
    return bid;
  },
  /** Reads one participant's negotiation and its checkout state for safe reload and retry. */
  read: async function (input) {
    const request = await this.participantContext(input);
    return this.project(request, await this.participant(request, request.code));
  },
  /**
   * Persists a confirmed single-unit bid; funds remain untouched until normal Checkout.
   * @param {Object} input Operation input/selectors validated by this owner; supplied identities do not
   * grant authority.
   * @returns {Promise<Object>} Owner-safe persisted negotiation projection.
   * @remarks Effects: Persists one confirmed single-unit bid and reuses exact replay identity; no funds
   * acquisition.
   * Failure behavior: Rejects unauthorized, mismatched, duplicate-conflicting or ineligible intake.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  create: async function (input) {
    const request = await this.participantContext(input),
      key = this.command(request),
      p = request.payload || {},
      policy = this.policy(),
      exact = SERVICE.DefaultExactAmountService;
    if (request.authData.principalType !== "customer" || !request.customerCode)
      this.fail("A Commerce customer is required to place a bid");
    if (policy.holdTiming !== "CHECKOUT_AFTER_ACCEPTANCE")
      this.fail(
        "The configured bid hold policy requires an installed provider",
      );
    if (typeof p.amount !== "string" || p.amount.length > 32)
      this.fail("Enter an exact positive bid amount");
    let amount;
    try {
      amount = exact.normalize(p.amount);
    } catch {
      this.fail("Enter an exact positive bid amount");
    }
    if (
      exact.parse(amount).scale > Number(policy.amountScale) ||
      exact.compare(amount, "0") <= 0 ||
      exact.compare(amount, policy.maximumAmount) > 0
    )
      this.fail("The bid amount is outside the configured limits");
    const code =
      "CHECKOUT_BID_" +
      this.hash([request.tenant, request.enterpriseCode, request.ownerId, key])
        .slice(0, 32)
        .toUpperCase();
    const terms = {
      productCode: p.productCode,
      storeCode: p.storeCode,
      variantCode: p.variantCode,
      amount,
      quantity: "1",
    };
    const commandHash = this.hash(terms);
    let existing = (await this.records(request, { code }, 1))[0];
    if (existing) {
      if (
        existing.buyerId !== request.ownerId ||
        existing.commandHash !== commandHash
      )
        this.fail("This bid reference belongs to different terms");
      return this.project(request, existing);
    }
    const { product, sellerRef, sourceRef, store } = await this.offer(
      request,
      p.productCode,
      p.storeCode,
    );
    if (product.localizedAttributes?.commerceBidding?.mode === "AUCTION")
      this.fail("Use the published auction round for this offer");
    if (request.sellerRefs.some((ref) => this.sameRef(ref, sellerRef)))
      this.fail("You cannot bid on your own product");
    if (!(product.variantCodes || []).includes(p.variantCode))
      this.fail("Choose a published offer variant");
    const duration = Number(policy.validitySeconds);
    if (!Number.isSafeInteger(duration) || duration < 60 || duration > 2592000)
      this.fail("The bidding validity policy is invalid");
    const model = {
      ...terms,
      code,
      enterpriseCode: request.enterpriseCode,
      buyerId: request.ownerId,
      buyerCustomerCode: request.customerCode,
      sellerId: sellerRef.code,
      sellerRef,
      contractVersion: 2,
      currency: store.currency,
      sourceRef,
      displayName: product.name || product.productCode,
      status: "OPEN",
      revision: 0,
      active: true,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + duration * 1000),
      commandHash,
      idempotencyKey: key,
      correlationId: request.correlationId || code,
      policyVersion: policy.policyVersion,
    };
    try {
      await SERVICE.DefaultCheckoutBidService.save({
        ...this.context(request),
        model,
      });
    } catch (error) {
      existing = (await this.records(request, { code }, 1))[0];
      if (!existing) throw error;
      if (existing.commandHash !== commandHash)
        this.fail("This bid reference belongs to different terms");
    }
    return this.project(request, await this.participant(request, code));
  },
  /** Applies a generated compare-and-set update; stale decisions cannot replace another participant's action. */
  update: async function (request, bid, patch) {
    await SERVICE.DefaultCheckoutBidService.update({
      ...this.context(request),
      query: {
        code: bid.code,
        enterpriseCode: request.enterpriseCode,
        revision: bid.revision,
      },
      model: { ...patch, code: bid.code, revision: bid.revision },
    });
    return this.participant(request, bid.code);
  },
  /**
   * Accepts, rejects or withdraws reviewed terms; acceptance is durable before issuing its private
   * Pricing quote.
   * @param {Object} input Operation input/selectors validated by this owner; supplied identities do not
   * grant authority.
   * @returns {Promise<Object>} Owner-safe accepted, rejected or withdrawn negotiation projection.
   * @remarks Effects: Persists the decision before issuing its original private Pricing quote.
   * Failure behavior: Rejects foreign actor, changed reviewed terms, terminal conflicts or uncertain
   * quote/write evidence.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  decide: async function (input) {
    const request = await this.participantContext(input),
      key = this.command(request),
      p = request.payload || {};
    let bid = await this.participant(request, request.code);
    const action = p.action;
    if (!["ACCEPT", "REJECT", "WITHDRAW"].includes(action))
      this.fail("Choose a supported bid action");
    if (
      action === "WITHDRAW"
        ? bid.buyerId !== request.ownerId
        : !request.sellerRefs.some((ref) =>
            this.sameRef(ref, this.sellerRef(bid)),
          )
    )
      this.fail("This bid action belongs to the other participant");
    const status = {
      ACCEPT: "ACCEPTED",
      REJECT: "REJECTED",
      WITHDRAW: "WITHDRAWN",
    }[action];
    if (bid.decisionKey === key && bid.status === status)
      return this.project(request, bid);
    const resuming =
      action === "ACCEPT" &&
      bid.status === "ACCEPTING" &&
      bid.decisionKey === key;
    if (!resuming) {
      if (
        bid.status !== "OPEN" ||
        Date.parse(bid.expiresAt) <= Date.now() ||
        bid.revision !== p.expectedRevision
      )
        this.fail("This bid changed or expired; reload before deciding");
      if (action === "ACCEPT") {
        const { sellerRef } = await this.offer(
          request,
          bid.productCode,
          bid.storeCode,
        );
        if (!this.sameRef(sellerRef, this.sellerRef(bid)))
          this.fail("The published seller changed");
      }
      bid = await this.update(request, bid, {
        status: action === "ACCEPT" ? "ACCEPTING" : status,
        decisionKey: key,
        ...(action === "ACCEPT" ? { acceptedAt: new Date() } : {}),
      });
    }
    if (action !== "ACCEPT") return this.project(request, bid);
    const store = this.policy().stores[bid.storeCode];
    const orderCode =
      (store.orderCodePrefix || this.policy().orderCodePrefix) +
      this.hash([request.tenant, request.enterpriseCode, bid.code])
        .slice(0, 24)
        .toUpperCase();
    const cartCode = orderCode + "_CART",
      priceQuoteCode = bid.code + "_QUOTE";
    await SERVICE.DefaultNegotiatedPriceService.issue(
      { ...request, authData: this.context(request).authData },
      {
        code: priceQuoteCode,
        ownerId: bid.buyerId,
        productCode: bid.productCode,
        ...(bid.contractVersion === 2 ? { variantCode: bid.variantCode } : {}),
        storeCode: bid.storeCode,
        currency: bid.currency,
        quantity: bid.quantity,
        unitAmount: bid.amount,
        cartCode,
        orderCode,
        expiresAt: new Date(bid.expiresAt).toISOString(),
        sourceRef: {
          module: bid.contractVersion === 2 ? "bidding" : "checkoutCore",
          schema: "checkoutBid",
          code: bid.code,
        },
        correlationId: bid.correlationId,
      },
    );
    bid = await this.update(request, bid, {
      status: "ACCEPTED",
      priceQuoteCode,
      cartCode,
      orderCode,
    });
    return this.project(request, bid);
  },
  /**
   * Opens a persisted published auction without changing ordinary negotiation semantics.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @returns {Promise<Object>} Result from the corresponding canonical persisted-auction owner method.
   * @remarks Effects: Delegates round creation/commands and their existing persisted funding fences; no
   * parallel workflow.
   * Failure behavior: Propagates participant, publication, concurrency or owner-recovery failure.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  openAuction: function (request) { return SERVICE.DefaultBiddingAuctionService.open(request); },
  /**
   * Delegates read-only fresh-publication admission to the canonical auction owner.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @returns {Promise<Object>} Result from the corresponding canonical persisted-auction owner method.
   * @remarks Effects: Read-only auction delegation; no negotiation or financial mutation.
   * Failure behavior: Propagates participant, publication, concurrency or owner-recovery failure.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  auctionPublication: function (request) { return SERVICE.DefaultBiddingAuctionService.publicationContext(request); },
  /**
   * Returns public aggregate and authorized participant detail for one round.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @returns {Promise<Object>} Result from the corresponding canonical persisted-auction owner method.
   * @remarks Effects: Read-only auction delegation; no negotiation or financial mutation.
   * Failure behavior: Propagates participant, publication, concurrency or owner-recovery failure.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  readAuction: function (request) { return SERVICE.DefaultBiddingAuctionService.read(request); },
  /**
   * Pages the current participant's auction history through the owning aggregate.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @returns {Promise<Object>} Result from the corresponding canonical persisted-auction owner method.
   * @remarks Effects: Read-only auction delegation; no negotiation or financial mutation.
   * Failure behavior: Propagates participant, publication, concurrency or owner-recovery failure.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  listAuctions: function (request) { return SERVICE.DefaultBiddingAuctionService.list(request); },
  /**
   * Serializes auction participant commands through the round revision fence.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @returns {Promise<Object>} Result from the corresponding canonical persisted-auction owner method.
   * @remarks Effects: Delegates round creation/commands and their existing persisted funding fences; no
   * parallel workflow.
   * Failure behavior: Propagates participant, publication, concurrency or owner-recovery failure.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  commandAuction: function (request) { return SERVICE.DefaultBiddingAuctionService.command(request); },
};
