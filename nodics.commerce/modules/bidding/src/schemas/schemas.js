/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module bidding/src/schemas/schemas.js @description Owns durable Commerce bids; the existing checkoutBid storage identity is preserved. @layer schema @owner bidding */
module.exports = { bidding: {} };
/** Persists a two-party pre-checkout negotiation without duplicating Product or Pricing. */
module.exports.bidding.checkoutBid = {
  super: "base",
  model: true,
  schemaPolicies: ["operational"],
  service: {
    enabled: true,
  },
  router: { groups: { schemaOperations: true },
    enabled: true,
  },
  cache: {
    enabled: false,
  },
  event: {
    enabled: false,
  },
  search: {
    enabled: false,
  },
  indexes: {
    individual: {
      commandIdentity: {
        name: "code",
        enabled: true,
        options: {
          unique: true,
        },
      },
    },
  },
  definition: {
    code: {
      type: "string",
      required: true,
      description:
        "Stable command identity; globally unique and scoped by trusted enterprise and buyer.",
    },
    enterpriseCode: {
      type: "string",
      required: true,
      description: "Enterprise that owns the published offer and negotiation.",
    },
    buyerId: {
      type: "string",
      required: true,
      description: "Authenticated customer placing the bid.",
    },
    sellerId: {
      type: "string",
      required: true,
      description:
        "Customer seller resolved from the published Product source reference.",
    },
    productCode: {
      type: "string",
      required: true,
      description:
        "Published Product being negotiated; never a copied product record.",
    },
    variantCode: {
      type: "string",
      required: true,
      description:
        "Published single-unit Product variant selected for checkout.",
    },
    storeCode: {
      type: "string",
      required: true,
      description: "Governed storefront in which the offer is valid.",
    },
    currency: {
      type: "string",
      required: true,
      description: "Currency of the exact offered amount.",
    },
    amount: {
      type: "string",
      required: true,
      description:
        "Exact single-unit bid amount, independent of the public asking price.",
    },
    quantity: {
      type: "string",
      required: true,
      description: "Quantity covered by this accepted negotiation.",
    },
    status: {
      type: "string",
      required: true,
      description: "OPEN, ACCEPTED, REJECTED, WITHDRAWN, EXPIRED or SETTLED.",
    },
    revision: {
      type: "int",
      required: true,
      description:
        "Optimistic command revision reviewed by the acting participant.",
    },
    expiresAt: {
      type: "date",
      required: true,
      description:
        "Last instant at which the bid or its negotiated price may be accepted.",
    },
    createdAt: {
      type: "date",
      required: true,
      description: "Creation time of the original bid command.",
    },
    acceptedAt: {
      type: "date",
      required: false,
      description: "Time the seller accepted the reviewed bid.",
    },
    priceQuoteCode: {
      type: "string",
      required: false,
      description: "Pricing-owned private quote created for the accepted bid.",
    },
    cartCode: {
      type: "string",
      required: false,
      description: "Single customer cart permitted to use the quote.",
    },
    orderCode: {
      type: "string",
      required: false,
      description: "Single checkout order permitted to use the quote.",
    },
    commandHash: {
      type: "string",
      required: true,
      description:
        "Fingerprint of immutable submitted terms for duplicate-command detection.",
    },
    idempotencyKey: {
      type: "string",
      required: true,
      description: "Original bid command reference.",
    },
    correlationId: {
      type: "string",
      required: true,
      description:
        "Trace reference across Product, Pricing, Checkout and settlement.",
    },
    decisionKey: {
      type: "string",
      required: false,
      description:
        "Last participant decision reference for safe response replay.",
    },
    sourceRef: {
      type: "object",
      required: true,
      description:
        "Product-owned reference to the domain asset; Commerce does not own that asset.",
    },
    policyVersion: {
      type: "string",
      required: true,
      description: "Layered bidding policy version recorded with the decision.",
    },
  },
};

/** Captures the displayed offer title at negotiation time without replacing Product localization. */
module.exports.bidding.checkoutBid.definition.displayName = {
  type: "string",
  required: false,
  description: "Offer title shown when the customer reviewed the bid.",
};

module.exports.bidding.checkoutBid.definition.buyerCustomerCode = {
  type: "string",
  required: true,
  description:
    "Canonical Profile customer business reference; buyerId separately retains the Commerce authenticated checkout owner.",
};

module.exports.bidding.checkoutBid.definition.sellerRef = {
  type: "object",
  required: false,
  description:
    "Typed seller business reference resolved from Product. Optional only for existing customer bids.",
};
module.exports.bidding.checkoutBid.definition.contractVersion = {
  type: "int",
  required: false,
  description:
    "Version 2 uses generic typed seller identity; absent on preserved earlier bids.",
};
module.exports.bidding.checkoutBid.definition.sourceRef.required = false;
module.exports.bidding.checkoutBid.definition.sourceRef.description =
  "Optional product-owned provenance; bidding does not require a domain asset.";
module.exports.bidding.checkoutBid.definition.sellerId.description =
  "Seller business code retained for existing consumers; sellerRef is the full authorization identity.";
module.exports.bidding.checkoutBid.definition.status.description =
  "OPEN, ACCEPTING, ACCEPTED, REJECTED or WITHDRAWN; EXPIRED is a time-based projection.";

/** One bounded aggregate makes offer changes, funding intents and selection share the same CAS fence. */
module.exports.bidding.biddingAuctionRound = {
  super: "base", model: true, schemaPolicies: ["operational"],
  service: { enabled: true }, router: { enabled: false },
  cache: { enabled: false }, event: { enabled: false }, search: { enabled: false },
  indexes: { individual: {
    commandIdentity: { name: "code", enabled: true, options: { unique: true } },
    listingIdentity: { name: "listingKey", enabled: true, options: { unique: true } },
  } },
  definition: {
    code: { type: "string", required: true, description: "Immutable publication-round identity." },
    listingKey: { type: "string", required: true, description: "Unique live listing slot; archived only after confirmed reconciliation." },
    enterpriseCode: { type: "string", required: true, description: "Signed Commerce business partition, independent of buyer/seller owner." },
    publicationCode: { type: "string", required: true, description: "Product publication revision; never inherited by a fresh round." },
    productCode: { type: "string", required: true, description: "Product-owned listing." },
    storeCode: { type: "string", required: true, description: "Published store." },
    variantCode: { type: "string", required: true, description: "Published quantity-one variant." },
    currency: { type: "string", required: true, description: "Published price unit." },
    floor: { type: "string", required: true, description: "Retained published Product price, not an additional seller minimum." },
    sellerRef: { type: "object", required: true, description: "Canonical Product seller owner." },
    sourceRef: { type: "object", required: false, description: "Optional Product provenance." },
    startsAt: { type: "date", required: false, description: "Product intake start; null means immediate." },
    endsAt: { type: "date", required: false, description: "Product intake end; null means no scheduled close." },
    graceEndsAt: { type: "date", required: false, description: "Immutable end plus retained framework grace." },
    policy: { type: "object", required: true, description: "Effective funding timing, grace and bounded admission settings." },
    status: { type: "string", required: true, description: "OPEN, GRACE, SELECTED, CANCELLED, UNSOLD or FAILED after final Checkout reconciliation. Selected never means paid." },
    revision: { type: "int", required: true, description: "Generated compare-and-set revision for every conflicting command." },
    sequence: { type: "int", required: true, description: "Server-assigned successful amount placement ordering." },
    bids: { type: "object", required: true, description: "Complete bounded offer set with owner, actor, funds, revision and successful order." },
    commands: { type: "object", required: true, description: "Durable completed command fingerprints for replay conflict detection." },
    pending: { type: "object", required: false, description: "Durable fenced command intent; never contains access tokens." },
    selection: { type: "object", required: false, description: "Immutable winner, exact revision/amount, original hold and Checkout/Pricing handoff." },
    cleanupComplete: { type: "boolean", required: true, description: "All non-winning funds and applicable listing holds have owner-confirmed releases." },
    notificationEvents: { type: "object", required: false, description: "Immutable private participant event evidence and frozen Communication intent pointers; not a delivery outbox." },
    notificationPending: { type: "boolean", required: false, description: "Bounded scheduler must retry unresolved Communication handoffs." },
    createdAt: { type: "date", required: true, description: "Round creation time." },
  },
};
