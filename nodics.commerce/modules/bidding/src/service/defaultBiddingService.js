/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const crypto = require("node:crypto");
/** @module bidding/service/defaultBiddingService @description Owns participant-scoped pre-checkout bids, seller acceptance and accepted terms handed to Pricing; Product remains the offer authority and Checkout alone reserves payment. @layer service @owner bidding @override Configure eligible stores, validity and amount limits in later layers; preserve participant authorization, durable acceptance, exact amounts and idempotency. */
module.exports = {
  /** Reads the layered negotiation policy; no caller may select a policy implementation. */
  policy: function () {
    return CONFIG.get("bidding") || {};
  },
  /** Returns a stable negotiation failure without exposing another customer's record. */
  fail: function (message) {
    throw new CLASSES.NodicsError("ERR_BIDDING_INVALID", message);
  },
  /** Resolves a trusted participant through the configured identity owner; HTTP callers cannot choose a service. */
  participantContext: async function (request) {
    if (!this.policy().enabled)
      this.fail("Bidding is not enabled for this deployment");
    const runtime = CONFIG.get("runtimeRole"),
      role = typeof runtime === "string" ? runtime : runtime?.code;
    if ((this.policy().runtimeRoles || { COMMERCE: true })[role] !== true)
      throw new CLASSES.NodicsError(
        "ERR_BIDDING_RUNTIME_FORBIDDEN",
        "Bidding requires its configured operational Commerce runtime",
      );
    return this.identity().resolve(request);
  },
  /** Resolves the layered seller-authorization seam without accepting executable input. */
  identity: function () {
    const service =
      SERVICE[this.policy().identityService || "DefaultBiddingIdentityService"];
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
  /** Resolves generic Product eligibility through the server-owned offer contract. */
  offer: async function (request, productCode, storeCode) {
    const service =
      SERVICE[this.policy().offerService || "DefaultBiddingOfferService"];
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
  /** Persists a confirmed single-unit bid; funds remain untouched until normal Checkout. */
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
  /** Accepts, rejects or withdraws reviewed terms; acceptance is durable before issuing its private Pricing quote. */
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
      (store.orderCodePrefix || "BID_ORDER_") +
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
};
