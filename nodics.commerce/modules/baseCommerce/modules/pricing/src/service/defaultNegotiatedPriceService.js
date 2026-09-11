/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const crypto = require("node:crypto");
/** @module pricing/service/defaultNegotiatedPriceService @description Issues immutable negotiated prices from trusted Commerce decisions and enforces buyer, product, quantity, currency, cart, expiry and order bindings during calculation and checkout. @layer service @owner pricing @override Later Pricing implementations may extend eligibility, but callers cannot supply an executable policy or substitute an amount. */
module.exports = {
  /** Normalizes generated read/write envelopes without manufacturing successful persistence. */
  records: function (response) {
    let value = response;
    for (let n = 0; n < 6 && value && !Array.isArray(value); n++) {
      if (value.result !== undefined) value = value.result;
      else if (value.data !== undefined) value = value.data;
      else break;
    }
    return !value ? [] : Array.isArray(value) ? value : [value];
  },
  /** Rejects invalid quote use with a stable Pricing error. */
  fail: function (message) {
    throw new CLASSES.NodicsError("ERR_PRICE_QUOTE_INVALID", message);
  },
  /** Creates trusted owner persistence context after the caller's Commerce authorization. */
  context: function (request) {
    if (!request.tenant || !request.enterpriseCode)
      this.fail("Trusted quote business context is required");
    return {
      tenant: request.tenant,
      authData: {
        tenant: request.tenant,
        entCode: request.enterpriseCode,
        enterpriseCode: request.enterpriseCode,
        principalType: "service",
        loginId: "pricingQuote",
        code: "pricingQuote",
        userGroups: ["serviceAccountUserGroup"],
        groups: ["serviceAccountUserGroup"],
      },
      options: { recursive: false, skipItemCache: true },
    };
  },
  /** Reads one quote strictly within its enterprise; no customer query can select another scope. */
  read: async function (request, code) {
    const result = await SERVICE.DefaultPriceQuoteService.get(
      Object.assign(this.context(request), {
        query: { code, enterpriseCode: request.enterpriseCode },
        searchOptions: { pageSize: 1, pageNumber: 1 },
      }),
    );
    return this.records(result)[0];
  },
  /** Issues one immutable quote from an already accepted server-side negotiation; this service has no public issuance route. */
  issue: async function (request, terms) {
    if (request.authData?.principalType !== "service")
      this.fail(
        "Only a trusted Commerce operation can issue a negotiated quote",
      );
    const exact = SERVICE.DefaultExactAmountService;
    for (const field of [
      "code",
      "ownerId",
      "productCode",
      "storeCode",
      "currency",
      "cartCode",
      "orderCode",
    ])
      if (typeof terms[field] !== "string" || !terms[field])
        this.fail("Quote bindings are incomplete");
    if (
      !terms.sourceRef?.code ||
      !terms.sourceRef.module ||
      !terms.sourceRef.schema
    )
      this.fail("Negotiation evidence is required");
    if (
      exact.compare(terms.unitAmount, "0") <= 0 ||
      exact.compare(terms.quantity, "0") <= 0 ||
      !Number.isFinite(Date.parse(terms.expiresAt))
    )
      this.fail("Quote amount, quantity or expiry is invalid");
    const model = {
      ...terms,
      enterpriseCode: request.enterpriseCode,
      unitAmount: exact.normalize(terms.unitAmount),
      quantity: exact.normalize(terms.quantity),
    };
    const hash = crypto
      .createHash("sha256")
      .update(JSON.stringify(model))
      .digest("hex");
    let existing = await this.read(request, model.code);
    if (existing) {
      if (existing.commandHash !== hash)
        this.fail("Quote reference belongs to different terms");
      return existing;
    }
    try {
      await SERVICE.DefaultPriceQuoteService.save(
        Object.assign(this.context(request), {
          model: {
            ...model,
            commandHash: hash,
            status: "ACTIVE",
            revision: 0,
            active: true,
          },
        }),
      );
    } catch (error) {
      existing = await this.read(request, model.code);
      if (!existing) throw error;
      if (existing.commandHash !== hash)
        this.fail("Quote reference belongs to different terms");
    }
    const persisted = existing || (await this.read(request, model.code));
    if (!persisted) this.fail("Negotiated quote could not be persisted");
    return persisted;
  },
  /** Resolves a private quote only for the exact authenticated cart and unit it was issued for. */
  resolve: async function (request) {
    const quote = await this.read(request, request.priceQuoteCode),
      exact = SERVICE.DefaultExactAmountService;
    if (
      !quote ||
      quote.status !== "ACTIVE" ||
      Date.parse(quote.expiresAt) <= Date.now()
    )
      this.fail("Negotiated price is unavailable or expired");
    for (const field of [
      "ownerId",
      "productCode",
      "storeCode",
      "currency",
      "cartCode",
    ])
      if (!request[field] || quote[field] !== request[field])
        this.fail(
          "Negotiated price belongs to a different customer, cart or product",
        );
    if (quote.variantCode && quote.variantCode !== request.variantCode)
      this.fail("Negotiated price belongs to a different product variant");
    if (exact.compare(quote.quantity, String(request.quantity)) !== 0)
      this.fail("Negotiated price requires the agreed quantity");
    return quote;
  },
  /** Returns normal Pricing evidence with the quote identity; public price rows remain unchanged. */
  decide: async function (request) {
    const quote = await this.resolve(request);
    const decision = SERVICE.DefaultPricingDecisionService.decide(
      { ...request, calculationVersion: "quote-v1" },
      { ...quote, tenant: request.tenant },
      SERVICE.DefaultExactAmountService,
    );
    return {
      ...decision,
      priceQuoteCode: quote.code,
      quoteOrderCode: quote.orderCode,
    };
  },
  /** Rejects a negotiated cart placed under any order identity other than its issued quote binding. */
  validateCheckout: async function (request, cart) {
    for (const entry of cart.entries || []) {
      if (!entry.priceQuoteCode) continue;
      const quote = await this.resolve({
        ...request,
        priceQuoteCode: entry.priceQuoteCode,
        cartCode: cart.code,
        storeCode: cart.storeCode,
        currency: cart.currency,
        productCode: entry.productCode,
        variantCode: entry.variantCode,
        quantity: entry.quantity,
      });
      if (quote.orderCode !== request.payload.orderCode)
        this.fail("Use the checkout reference supplied with this accepted bid");
    }
  },
};
